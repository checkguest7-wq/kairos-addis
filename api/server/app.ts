import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  initDatabase,
  initDatabaseAsync,
  getDatabase,
  saveDatabase,
  seedNewUserData,
  UserAccount,
} from './db';
import {
  getSupabaseClient,
  getSupabaseAdminClient,
  generateOtpCode,
  sendVerificationEmail,
  sendPasswordResetEmail,
  saveMessageToSupabase,
  uploadDocumentToSupabase,
  createDocumentSignedUrl,
  deleteDocumentFromSupabase,
} from './supabase';
import {
  syncUserToSupabase,
  syncOrderToSupabase,
  syncAppointmentToSupabase,
  syncTestDriveToSupabase,
  syncNotificationToSupabase,
  syncUserDocumentsToSupabase,
  syncTestimonialToSupabase,
  isSupabaseDatabaseEnabled,
} from './supabaseDb';
import {
  Appointment,
  TestDriveRequest,
  NotificationItem,
  CustomerDocuments,
  VehicleOrder,
  PortalMessage,
  PortalTestimonial,
} from '../src/types';
import { registerAdminRoutes } from './adminRoutes';
import { askKairosGeminiAI, UserContext } from './gemini';

const JWT_SECRET = process.env.JWT_SECRET || 'kairos_addis_secure_ev_portal_secret_key_2026';
const TOKEN_EXPIRY = '7d';

// Extend Express Request type to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
}

let dbInitPromise: Promise<void> | null = null;
export function ensureDatabaseInitialized(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = initDatabaseAsync().catch((err) => {
      console.warn('[DB ASYNC INIT CATCH]', err);
    });
  }
  return dbInitPromise;
}

export function createApp() {
  const app = express();

  // Initialize synchronous database baseline and trigger async Supabase sync
  initDatabase();
  ensureDatabaseInitialized();

  // Ensure persistent state is synced before handling API requests
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureDatabaseInitialized();
    } catch {
      // Non-blocking fallback
    }
    next();
  });

  // Increase payload limit to 50MB to support base64 document and media uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  // Handle parsing / payload errors gracefully
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413)) {
      return res.status(413).json({
        error: 'The uploaded file or payload is too large. Please select a file smaller than 50MB.',
      });
    }
    next(err);
  });

  // ====================================================
  // AUTHENTICATION MIDDLEWARE
  // ====================================================
  const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.kairos_token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; fullName: string };
      const db = getDatabase();
      const user = db.users.find((u) => u.id === decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'User account not found.' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
  };

  // Helper to resolve authenticated customer context for AI
  const buildUserContext = (userId: string, db: any): UserContext | undefined => {
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return undefined;

    const userVehicle = db.vehicles.find((v: any) => v.userId === userId) || null;
    const userWarranty = db.warranties.find((w: any) => w.userId === userId) || null;
    const userOrders = db.orders.filter((o: any) => o.userId === userId);
    const userAppointments = db.appointments.filter((a: any) => a.userId === userId);
    const userTestDrives = db.testDrives.filter((t) => t.userId === userId);
    const userServiceRecords = (db.serviceRecords || []).filter((s: any) => s.userId === userId);
    const userNotifications = (db.notifications || []).filter((n: any) => n.userId === userId);
    const docRecord = (db.userDocuments || []).find((d: any) => d.userId === userId);
    const userDocs = docRecord?.documents || null;

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      vehicle: userVehicle,
      warranty: userWarranty,
      orders: userOrders,
      appointments: userAppointments,
      testDrives: userTestDrives,
      serviceRecords: userServiceRecords,
      notifications: userNotifications,
      documents: userDocs,
    };
  };

  // ====================================================
  // AUTHENTICATION API ROUTES
  // ====================================================

  // Health check
  app.get('/api/health', (req, res) => {
    const supabase = getSupabaseClient();
    res.json({
      status: 'ok',
      supabaseConfigured: !!supabase,
      serverTime: new Date().toISOString(),
    });
  });

  // Public Showroom Settings & Branding
  app.get('/api/settings', (req: Request, res: Response) => {
    const db = getDatabase();
    return res.json({ settings: db.settings });
  });

  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone, password, confirmPassword } = req.body;

      if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (existingUser) {
        if (!existingUser.isEmailVerified) {
          // Rate-limit check: 60-second cooldown
          const now = Date.now();
          const COOLDOWN_MS = 60 * 1000;
          if (existingUser.lastResendAt && now - existingUser.lastResendAt < COOLDOWN_MS) {
            const remainingSeconds = Math.ceil((COOLDOWN_MS - (now - existingUser.lastResendAt)) / 1000);
            return res.status(429).json({
              error: `An unverified account with this email already exists. Please wait ${remainingSeconds} seconds before requesting another verification code.`,
              requireVerification: true,
              email: normalizedEmail,
              retryAfter: remainingSeconds,
            });
          }

          // Regenerate 6-digit OTP and send ONLY the custom Kairos Addis Gmail SMTP email
          const newOtp = generateOtpCode();
          existingUser.verificationOtp = newOtp;
          existingUser.verificationOtpExpires = now + 24 * 60 * 60 * 1000; // 24 hours
          existingUser.lastResendAt = now;
          saveDatabase();
          syncUserToSupabase(existingUser).catch(() => {});

          console.log(`[AUTH REGISTER] Unverified user ${normalizedEmail} re-registered. Generated new 6-digit OTP.`);

          const emailResult = await sendVerificationEmail({
            email: normalizedEmail,
            fullName: existingUser.fullName,
            otpCode: newOtp,
          });

          if (!emailResult.success) {
            console.warn(`[REGISTER RESEND WARNING] Email sending failed for ${normalizedEmail}: ${emailResult.error}`);
            return res.status(200).json({
              message: `An unverified account exists. However, email delivery encountered an issue: ${emailResult.userMessage}. You can enter your verification code or request a new code.`,
              requireVerification: true,
              email: normalizedEmail,
              emailDeliveryWarning: emailResult.error,
              devCode: (process.env.NODE_ENV !== 'production' || emailResult.deliveryMode === 'simulated') ? newOtp : undefined,
            });
          }

          return res.status(200).json({
            message: 'An unverified account with this email already exists. A new 6-digit verification code has been sent to your email.',
            requireVerification: true,
            email: normalizedEmail,
            devCode: (process.env.NODE_ENV !== 'production' || emailResult.deliveryMode === 'simulated') ? newOtp : undefined,
          });
        }
        return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
      }

      // PREVENT DUPLICATE SUPABASE CONFIRMATION EMAILS:
      // When Supabase Admin client (with SUPABASE_SERVICE_ROLE_KEY) is available,
      // create the user via admin.createUser with email_confirm: false.
      // This creates the auth user directly without sending any Supabase email!
      let supabaseUserId: string | null = null;
      const supabaseAdmin = getSupabaseAdminClient();

      if (supabaseAdmin) {
        try {
          const { data: suData, error: suError } = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: false,
            user_metadata: {
              fullName: fullName.trim(),
              phone: phone.trim(),
            },
          });

          if (suError) {
            if (suError.message?.toLowerCase().includes('already') || (suError as any).status === 422) {
              try {
                const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
                const matched = (usersList?.users as any[])?.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
                if (matched) {
                  supabaseUserId = matched.id;
                }
              } catch (e) {
                // ignore
              }
            } else {
              console.warn('[SUPABASE WARNING] Admin user creation notice:', suError.message);
            }
          } else if (suData?.user) {
            supabaseUserId = suData.user.id;
            console.log(`[SUPABASE] User created in Supabase Auth via Admin API (email_confirm: false, zero Supabase confirmation emails sent): ${supabaseUserId}`);
          }
        } catch (admErr: any) {
          console.warn('[SUPABASE WARNING] Admin user creation error:', admErr?.message || admErr);
        }
      } else {
        // Fallback when only anon key is available:
        // NOTE: In the Supabase Project Dashboard (Authentication -> Providers -> Email),
        // "Confirm email" must be turned OFF so Supabase does not dispatch its default confirmation email.
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { data: suData, error: suError } = await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                data: {
                  fullName: fullName.trim(),
                  phone: phone.trim(),
                },
              },
            });
            if (suError) {
              console.warn('[SUPABASE WARNING] signUp notice:', suError.message);
            } else if (suData?.user) {
              supabaseUserId = suData.user.id;
            }
          } catch (sErr: any) {
            console.warn('[SUPABASE WARNING] signUp error:', sErr?.message || sErr);
          }
        }
      }

      // Hash password securely with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUserId = supabaseUserId || `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const verificationOtp = generateOtpCode();
      const now = Date.now();
      const verificationOtpExpires = now + 24 * 60 * 60 * 1000; // 24 hours

      const newUser: UserAccount = {
        id: newUserId,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        isEmailVerified: false,
        verificationOtp,
        verificationOtpExpires,
        lastResendAt: now,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      saveDatabase();
      syncUserToSupabase(newUser).catch((err) => console.warn('[SUPABASE USER SYNC]', err));

      console.log(`[AUTH REGISTER] Created new user ${newUser.email} (${newUser.id}). isEmailVerified: false. Generated 6-digit OTP.`);

      // Seed initial customer records (vehicle, warranty, service appointments)
      seedNewUserData(newUserId, newUser.fullName);

      // Dispatch branded Kairos Addis verification email via Gmail SMTP
      const emailResult = await sendVerificationEmail({
        email: normalizedEmail,
        fullName: newUser.fullName,
        otpCode: verificationOtp,
      });

      const userResponse = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role || 'customer',
        isEmailVerified: false,
        createdAt: newUser.createdAt,
      };

      if (!emailResult.success) {
        console.warn(`[REGISTER EMAIL WARNING] Failed delivering initial verification email to ${normalizedEmail}: ${emailResult.error}`);
        return res.status(201).json({
          message: `Account created successfully! However, email delivery encountered an issue (${emailResult.userMessage}). You can request a code resend or enter your code.`,
          requireVerification: true,
          email: newUser.email,
          emailDeliveryWarning: emailResult.error,
          devCode: (process.env.NODE_ENV !== 'production' || emailResult.deliveryMode === 'simulated') ? verificationOtp : undefined,
          user: userResponse,
        });
      }

      return res.status(201).json({
        message: 'Account created successfully! Please verify your email with the 6-digit code sent to your inbox.',
        requireVerification: true,
        email: newUser.email,
        devCode: (process.env.NODE_ENV !== 'production' || emailResult.deliveryMode === 'simulated') ? verificationOtp : undefined,
        user: userResponse,
      });
    } catch (err: any) {
      console.error('[AUTH REGISTER ERROR]', err);
      return res.status(500).json({ error: 'An unexpected error occurred during registration.' });
    }
  });

  // Verify Email (OTP or confirmation token)
  app.post('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        return res.status(400).json({ error: 'Email address and verification code are required.' });
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const cleanToken = token.trim();

      const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(404).json({
          error: 'Account not found',
          notFound: true,
          message: 'No account found with this email address. Please create a new account or check your spelling.',
        });
      }

      if (user.isEmailVerified) {
        return res.json({
          message: 'Your email address is already verified. You can log in directly.',
          isAlreadyVerified: true,
        });
      }

      // Check internal database OTP verification (Kairos Addis 6-digit code)
      const isOtpMatch = user.verificationOtp && user.verificationOtp === cleanToken;
      const isOtpExpired = user.verificationOtpExpires && user.verificationOtpExpires <= Date.now();

      if (isOtpMatch && isOtpExpired) {
        return res.status(400).json({
          error: 'Verification code has expired. Please request a new verification code.',
          isExpired: true,
        });
      }

      let isVerifiedSuccessfully = isOtpMatch && !isOtpExpired;

      // Optional fallback if user signed up via Supabase OTP
      if (!isVerifiedSuccessfully) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { data: suData, error: suError } = await supabase.auth.verifyOtp({
              email: normalizedEmail,
              token: cleanToken,
              type: 'signup',
            });
            if (!suError && suData?.user) {
              isVerifiedSuccessfully = true;
            }
          } catch (sErr) {
            // ignore
          }
        }
      }

      if (!isVerifiedSuccessfully) {
        return res.status(400).json({
          error: 'Invalid verification code. Please check your 6-digit code or request a new code.',
        });
      }

      // Mark user as verified and delete OTP data (preventing reuse)
      user.isEmailVerified = true;
      delete user.verificationOtp;
      delete user.verificationOtpExpires;
      saveDatabase();
      syncUserToSupabase(user).catch(() => {});

      console.log(`[EMAIL VERIFICATION] User ${user.email} (${user.id}) successfully verified with 6-digit OTP.`);

      // If Supabase Admin Client is available, confirm email in Supabase Auth
      const supabaseAdmin = getSupabaseAdminClient();
      if (supabaseAdmin && user.id) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            email_confirm: true,
          });
          console.log(`[SUPABASE] Synchronized email_confirm: true for user ${user.email} (${user.id})`);
        } catch (admErr: any) {
          console.warn('[SUPABASE WARNING] Admin confirm sync notice:', admErr?.message || admErr);
        }
      }

      // Generate JWT Token for immediate authenticated access
      const jwtToken = jwt.sign(
        { id: user.id, email: user.email, fullName: user.fullName },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      res.cookie('kairos_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Email verified successfully! Welcome to Kairos Addis.',
        token: jwtToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role || 'customer',
          isEmailVerified: true,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      console.error('[AUTH VERIFY ERROR]', err);
      return res.status(500).json({ error: 'An unexpected error occurred during email verification.' });
    }
  });

  // Resend Verification Email (Rate-Limited with robust SMTP delivery)
  app.post('/api/auth/resend-verification', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();

      const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(404).json({
          error: 'Account not found',
          notFound: true,
          message: 'No account found with this email address. Please create a new account or sign in.',
        });
      }

      // If already verified, do not send another email
      if (user.isEmailVerified) {
        return res.status(400).json({
          error: 'This email address is already verified. You can log in directly.',
          isAlreadyVerified: true,
        });
      }

      // Rate limit protection: 60-second cooldown
      const now = Date.now();
      const COOLDOWN_MS = 60 * 1000;
      if (user.lastResendAt && now - user.lastResendAt < COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((COOLDOWN_MS - (now - user.lastResendAt)) / 1000);
        return res.status(429).json({
          error: `Please wait ${remainingSeconds} seconds before requesting another verification email.`,
          retryAfter: remainingSeconds,
        });
      }

      // Generate new 6-digit OTP code (Supabase resend is intentionally NOT called to prevent duplicate emails)
      const newOtp = generateOtpCode();
      user.verificationOtp = newOtp;
      user.verificationOtpExpires = now + 24 * 60 * 60 * 1000; // 24 hours
      user.lastResendAt = now;
      saveDatabase();
      syncUserToSupabase(user).catch(() => {});

      console.log(`[EMAIL VERIFICATION] Resending verification OTP for ${normalizedEmail}. Generated new 6-digit OTP.`);

      // Dispatch ONLY branded Kairos Addis email via Gmail SMTP with retries & error handling
      const emailResult = await sendVerificationEmail({
        email: normalizedEmail,
        fullName: user.fullName,
        otpCode: newOtp,
      });

      if (!emailResult.success) {
        console.error(`[RESEND VERIFICATION FAILED] ${emailResult.error}`);
        return res.status(502).json({
          error: `Failed to deliver verification email: ${emailResult.userMessage || emailResult.error}`,
          errorCode: emailResult.errorCode,
          emailDeliveryFailed: true,
        });
      }

      return res.json({
        message: 'A new 6-digit verification code has been sent to your email address.',
        email: normalizedEmail,
        devCode: (process.env.NODE_ENV !== 'production' || emailResult.deliveryMode === 'simulated') ? newOtp : undefined,
        deliveryMode: emailResult.deliveryMode,
      });
    } catch (err: any) {
      console.error('[RESEND VERIFICATION ERROR]', err);
      return res.status(500).json({ error: 'An unexpected error occurred while sending verification email.' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Please enter your email address.' });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Please enter your password.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalizedEmail = email.trim().toLowerCase();

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const db = getDatabase();
      let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

      // If user is not in local db, check if Supabase Admin has this user
      const supabaseAdmin = getSupabaseAdminClient();
      let supabaseUser: any = null;
      if (supabaseAdmin) {
        try {
          const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
          supabaseUser = (usersList?.users as any[])?.find(
            (u: any) => u.email?.toLowerCase() === normalizedEmail
          );
        } catch (e) {
          // ignore
        }
      }

      // If user does not exist in db and not in Supabase Auth
      if (!user && !supabaseUser) {
        return res.status(404).json({
          error: 'No account found. Please create an account.',
          notFound: true,
          code: 'ACCOUNT_NOT_FOUND',
        });
      }

      // Check email verification status first:
      // A customer whose email is not verified must NOT be treated as an incorrect password.
      if (user && user.isEmailVerified === false) {
        return res.status(403).json({
          error: 'Please verify your email before logging in.',
          code: 'EMAIL_NOT_VERIFIED',
          requireVerification: true,
          email: user.email,
        });
      }

      if (supabaseUser && !supabaseUser.email_confirmed_at && (!user || user.isEmailVerified === false)) {
        return res.status(403).json({
          error: 'Please verify your email before logging in.',
          code: 'EMAIL_NOT_VERIFIED',
          requireVerification: true,
          email: normalizedEmail,
        });
      }

      // Attempt Supabase Auth sign-in if client is configured
      const supabase = getSupabaseClient();
      let isSupabaseAuthenticated = false;

      if (supabase) {
        try {
          const { data: suData, error: suError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (suError) {
            const suMsg = suError.message || '';
            if (suMsg.toLowerCase().includes('email not confirmed')) {
              return res.status(403).json({
                error: 'Please verify your email before logging in.',
                code: 'EMAIL_NOT_VERIFIED',
                requireVerification: true,
                email: user ? user.email : normalizedEmail,
              });
            }
          } else if (suData?.user) {
            isSupabaseAuthenticated = true;
          }
        } catch (sErr: any) {
          console.warn('[SUPABASE AUTH LOGIN NOTICE]', sErr?.message || sErr);
        }
      }

      // Verify password with bcrypt if not already authenticated via Supabase
      let isMatch = isSupabaseAuthenticated;
      if (!isMatch && user && user.passwordHash) {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      }

      // Environment-controlled admin password recovery fallback
      const configuredAdminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD;
      if (!isMatch && user && user.role === 'admin' && configuredAdminPassword) {
        if (password === configuredAdminPassword) {
          isMatch = true;
          user.isEmailVerified = true;
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(password, salt);
          saveDatabase();
        }
      }

      if (!isMatch) {
        return res.status(401).json({
          error: 'Password incorrect.',
          code: 'PASSWORD_INCORRECT',
        });
      }

      // If authenticated via Supabase but not yet in local db, sync local record
      if (!user && supabaseUser) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        user = {
          id: supabaseUser.id,
          fullName: supabaseUser.user_metadata?.fullName || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          phone: supabaseUser.user_metadata?.phone || '',
          role: 'customer',
          passwordHash,
          isEmailVerified: true,
          createdAt: supabaseUser.created_at || new Date().toISOString(),
        };
        db.users.push(user);
        seedNewUserData(user.id, user.fullName);
        saveDatabase();
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user!.id, email: user!.email, fullName: user!.fullName },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      // Set HTTP-Only Cookie
      res.cookie('kairos_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Login successful.',
        token,
        user: {
          id: user!.id,
          fullName: user!.fullName,
          email: user!.email,
          phone: user!.phone,
          role: user!.role || 'customer',
          isEmailVerified: true,
          createdAt: user!.createdAt,
        },
      });
    } catch (err: any) {
      console.error('[AUTH LOGIN ERROR]', err);
      return res.status(500).json({ error: 'An unexpected error occurred during login.' });
    }
  });

  // Current User (Me)
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = db.users.find((u) => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({
        error: 'Account not found',
        notFound: true,
      });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        error: 'Please verify your email address before continuing.',
        code: 'EMAIL_NOT_VERIFIED',
        requireVerification: true,
        email: user.email,
      });
    }

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
        isEmailVerified: true,
        createdAt: user.createdAt,
      },
    });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('kairos_token');
    return res.json({ message: 'Logged out successfully.' });
  });

  // Forgot Password - Step 1: Send 6-digit OTP code to email with robust error handling
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        return res.status(404).json({
          error: 'Account not found',
          notFound: true,
          message: 'No account was found with this email address. Would you like to create a new account?',
        });
      }

      // Check rate limit: 60-second cooldown for password reset requests
      const now = Date.now();
      const COOLDOWN_MS = 60 * 1000;
      if (user.lastResetRequestedAt && now - user.lastResetRequestedAt < COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((COOLDOWN_MS - (now - user.lastResetRequestedAt)) / 1000);
        return res.status(429).json({
          error: `Please wait ${remainingSeconds} seconds before requesting another code.`,
          retryAfter: remainingSeconds,
        });
      }

      // Generate 6-digit OTP reset code
      const resetOtp = generateOtpCode();
      user.resetToken = resetOtp;
      user.resetTokenExpiry = now + 3600000; // 1 hour
      user.lastResetRequestedAt = now;
      saveDatabase();
      syncUserToSupabase(user).catch(() => {});

      console.log(`[AUTH RESET PASSWORD] Generated 6-digit reset code for ${normalizedEmail}. Sending branded OTP email.`);

      // Send branded password reset email with 6-digit code via Gmail SMTP
      const emailResult = await sendPasswordResetEmail({
        email: normalizedEmail,
        fullName: user.fullName,
        resetToken: resetOtp,
        resetOtp,
      });

      if (!emailResult.success) {
        console.error(`[FORGOT PASSWORD EMAIL FAILED] ${emailResult.error}`);
        return res.status(502).json({
          error: `Failed to deliver reset email: ${emailResult.userMessage || emailResult.error}`,
          errorCode: emailResult.errorCode,
          emailDeliveryFailed: true,
        });
      }

      return res.json({
        message: 'A 6-digit verification code has been sent to your email address.',
        email: normalizedEmail,
        devCode: (process.env.NODE_ENV !== 'production' || emailResult.deliveryMode === 'simulated') ? resetOtp : undefined,
        deliveryMode: emailResult.deliveryMode,
      });
    } catch (err: any) {
      console.error('[FORGOT PASSWORD ERROR]', err);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  });

  // Verify Reset Code - Step 2: Validate 6-digit OTP code
  app.post('/api/auth/verify-reset-code', async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const cleanCode = code.trim();

      const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(404).json({
          error: 'Account not found',
          notFound: true,
          message: 'No account found with this email address. Please create a new account or check your spelling.',
        });
      }

      const isValid =
        user.resetToken &&
        user.resetToken === cleanCode &&
        user.resetTokenExpiry &&
        user.resetTokenExpiry > Date.now();

      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid or expired verification code. Please check your email or request a new code.',
        });
      }

      return res.json({
        success: true,
        message: 'Verification code confirmed. You can now set your new password.',
      });
    } catch (err: any) {
      console.error('[VERIFY RESET CODE ERROR]', err);
      return res.status(500).json({ error: 'An error occurred validating verification code.' });
    }
  });

  // Reset Password - Step 3: Set new password with verified OTP
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { email, code, resetToken, newPassword, confirmPassword } = req.body;
      const verificationCode = (code || resetToken || '').trim();

      if (!email || !verificationCode) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      if (confirmPassword && newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        return res.status(404).json({
          error: 'Account not found',
          notFound: true,
          message: 'No account found with this email address. Please create a new account or check your spelling.',
        });
      }

      const isMatch =
        user.resetToken &&
        user.resetToken === verificationCode &&
        user.resetTokenExpiry &&
        user.resetTokenExpiry > Date.now();

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.isEmailVerified = true;
      delete user.verificationOtp;
      delete user.verificationOtpExpires;
      delete user.resetToken;
      delete user.resetTokenExpiry;

      // Add security notification
      db.notifications.unshift({
        id: `notif_pwd_${Date.now()}`,
        userId: user.id,
        title: 'Password Reset Successful',
        message: 'Your Kairos Addis customer portal password was reset successfully.',
        type: 'update',
        date: 'Just now',
        read: false,
        priority: 'high',
      });

      saveDatabase();
      syncUserToSupabase(user).catch(() => {});
      syncNotificationToSupabase(db.notifications[0]).catch(() => {});

      // Update Supabase password if admin is configured
      const supabaseAdmin = getSupabaseAdminClient();
      if (supabaseAdmin && user.id) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: newPassword,
          });
        } catch (admErr) {
          console.warn('[SUPABASE UPDATE USER PASSWORD]', admErr);
        }
      }

      return res.json({ message: 'Your password has been reset successfully. You can now log in.' });
    } catch (err: any) {
      console.error('[RESET PASSWORD ERROR]', err);
      return res.status(500).json({ error: 'An error occurred resetting password.' });
    }
  });

  // ====================================================
  // ====================================================
  // CLIENT PORTAL DATA ROUTES (PROTECTED)
  // ====================================================

  // Helper to get or create customer documents
  const getUserDocuments = (userId: string) => {
    const db = getDatabase();
    let docRecord = db.userDocuments.find((d) => d.userId === userId);
    if (!docRecord) {
      docRecord = {
        userId,
        documents: {
          faydaIdFront: null,
          faydaIdBack: null,
          drivingLicenceFront: null,
          drivingLicenceBack: null,
        },
      };
      db.userDocuments.push(docRecord);
      saveDatabase();
    }
    return docRecord.documents;
  };

  // Helper to check if all 4 required documents are uploaded
  const hasAllRequiredDocuments = (userId: string): boolean => {
    const docs = getUserDocuments(userId);
    return !!(
      docs.faydaIdFront &&
      docs.faydaIdBack &&
      docs.drivingLicenceFront &&
      docs.drivingLicenceBack
    );
  };

  // Dashboard Aggregation
  app.get('/api/portal/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();

    const user = db.users.find((u) => u.id === userId);
    const vehicle = db.vehicles.find((v) => v.userId === userId) || null;
    const warranty = db.warranties.find((w) => w.userId === userId) || null;
    const serviceHistory = db.serviceRecords.filter((s) => s.userId === userId);
    const appointments = db.appointments.filter((a) => a.userId === userId);
    const upcomingAppointment =
      appointments.find((a) => a.status === 'Confirmed' || a.status === 'Pending') || null;
    const testDrives = db.testDrives.filter((t) => t.userId === userId);
    const orders = db.orders.filter((o) => o.userId === userId);
    const documents = getUserDocuments(userId);
    const messages = db.messages.filter((m) => m.userId === userId);
    const testimonials = db.testimonials.filter((t) => t.userId === userId);

    // Auto-check test drives to create notification if today
    const todayStr = new Date().toISOString().split('T')[0];
    testDrives.forEach((td) => {
      if (td.status === 'Confirmed' && td.preferredDate) {
        const tdDate = new Date(td.preferredDate).toISOString().split('T')[0];
        if (tdDate === todayStr) {
          const notifExists = db.notifications.some(
            (n) => n.userId === userId && n.title === 'Test Drive Today' && n.message.includes(td.vehicleName)
          );
          if (!notifExists) {
            db.notifications.unshift({
              id: `notif_td_today_${Date.now()}`,
              userId,
              title: 'Test Drive Today',
              message: `Your ${td.vehicleName} test drive is today at ${td.preferredTime}. Our Bole showroom concierge awaits you!`,
              type: 'appointment',
              date: 'Today',
              read: false,
              priority: 'high',
            });
            saveDatabase();
          }
        }
      }
    });

    const notifications = db.notifications.filter((n) => n.userId === userId);

    return res.json({
      user: {
        id: user!.id,
        fullName: user!.fullName,
        email: user!.email,
        phone: user!.phone,
        createdAt: user!.createdAt,
      },
      vehicle,
      warranty,
      serviceHistory,
      upcomingAppointment,
      appointments,
      testDrives,
      notifications,
      orders,
      documents,
      messages,
      testimonials,
    });
  });

  // Vehicle Details
  app.get('/api/portal/vehicle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const vehicle = db.vehicles.find((v) => v.userId === userId);
    return res.json({ vehicle: vehicle || null });
  });

  // Warranty Details
  app.get('/api/portal/warranty', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const warranty = db.warranties.find((w) => w.userId === userId);
    return res.json({ warranty: warranty || null });
  });

  // Service History
  app.get('/api/portal/service-history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const serviceHistory = db.serviceRecords.filter((s) => s.userId === userId);
    return res.json({ serviceHistory });
  });

  // Unified Book Service / Appointments (List, Create, Update, Delete)
  app.get('/api/portal/appointments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const appointments = db.appointments.filter((a) => a.userId === userId);
    return res.json({ appointments });
  });

  app.post('/api/portal/appointments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { vin, vehicle, serviceType, date, time, message, description } = req.body;

    const chosenDate = date;
    const chosenDescription = description || message || 'Scheduled vehicle maintenance & multi-point EV check';
    const chosenType = serviceType || 'Routine EV Maintenance & Diagnostic';

    if (!chosenDate) {
      return res.status(400).json({ error: 'Preferred date is required.' });
    }

    const db = getDatabase();
    const userVehicle = db.vehicles.find((v) => v.userId === userId);
    const vehicleVin = vin || userVehicle?.vin || 'Unregistered VIN';
    const vehicleTitle = vehicle || userVehicle?.model || `Vehicle (VIN: ${vehicleVin.slice(0, 8)}...)`;

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      userId,
      vehicleId: userVehicle?.id || 'req_veh',
      serviceType: chosenType,
      vehicle: vehicleTitle,
      date: chosenDate,
      time: time || '10:00 AM',
      status: 'Pending',
      message: `VIN: ${vehicleVin} • ${chosenDescription}`,
      facility: 'Kairos Addis Bole Medhanialem EV Center',
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(newAppointment);

    // Also add to service records as active request
    const newServiceRecord: any = {
      id: `srv_req_${Date.now()}`,
      userId,
      vehicleId: userVehicle?.id || 'req_veh',
      date: chosenDate,
      serviceType: chosenType,
      vehicle: `${vehicleTitle} (VIN: ${vehicleVin})`,
      status: 'Scheduled',
      mileage: userVehicle?.mileageKm || 0,
      facility: 'Kairos Addis Bole Medhanialem EV Center',
      technician: 'Assigned Master EV Tech (Pending)',
      costETB: 0,
      notes: `Service Request: ${chosenDescription}. Customer VIN: ${vehicleVin}`,
      itemsServiced: ['Multi-Point High-Voltage Safety Diagnostic', 'Battery Thermal Management Check', 'Electronic Brake & Regeneration Scan'],
    };
    db.serviceRecords.unshift(newServiceRecord);

    // Add confirmation notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId,
      title: 'Service Request Submitted',
      message: `Your service request for ${vehicleTitle} on ${chosenDate} has been received and scheduled with our Bole EV Center.`,
      type: 'service',
      date: 'Just now',
      read: false,
      priority: 'high',
    };
    db.notifications.unshift(newNotif);

    saveDatabase();
    syncAppointmentToSupabase(newAppointment).catch((err) => console.warn('[SUPABASE APPT SYNC]', err));
    syncNotificationToSupabase(newNotif).catch(() => {});
    return res.status(201).json({
      appointment: newAppointment,
      serviceRecord: newServiceRecord,
      message: 'Service request booked successfully. Our certified team has received your appointment.',
    });
  });

  app.put('/api/portal/appointments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { date, time, status, message } = req.body;

    const db = getDatabase();
    const aptIndex = db.appointments.findIndex((a) => a.id === id && a.userId === userId);

    if (aptIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (date) db.appointments[aptIndex].date = date;
    if (time) db.appointments[aptIndex].time = time;
    if (status) db.appointments[aptIndex].status = status;
    if (message !== undefined) db.appointments[aptIndex].message = message;

    saveDatabase();
    syncAppointmentToSupabase(db.appointments[aptIndex]).catch(() => {});
    return res.json({ appointment: db.appointments[aptIndex], message: 'Appointment updated successfully.' });
  });

  app.delete('/api/portal/appointments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDatabase();
    const aptIndex = db.appointments.findIndex((a) => a.id === id && a.userId === userId);

    if (aptIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    db.appointments[aptIndex].status = 'Cancelled';
    saveDatabase();
    syncAppointmentToSupabase(db.appointments[aptIndex]).catch(() => {});
    return res.json({ message: 'Appointment cancelled successfully.' });
  });

  // ====================================================
  // DOCUMENTS MANAGEMENT ROUTES (SECURE)
  // ====================================================
  app.get('/api/portal/documents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const documents = getUserDocuments(userId);
    if (documents) {
      for (const key of Object.keys(documents) as (keyof CustomerDocuments)[]) {
        const item = documents[key];
        if (item && item.storagePath) {
          try {
            const freshUrl = await createDocumentSignedUrl(item.storagePath, 3600);
            if (freshUrl) {
              item.fileUrl = freshUrl;
              item.dataUrl = freshUrl;
            }
          } catch {}
        }
      }
    }
    const isComplete = hasAllRequiredDocuments(userId);
    return res.json({ documents, isComplete });
  });

  app.get('/api/portal/documents/view/:docType', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { docType } = req.params;
    const db = getDatabase();
    const docRecord = db.userDocuments.find((d) => d.userId === userId);
    const docItem = docRecord?.documents[docType as keyof CustomerDocuments];

    if (!docItem) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (docItem.storagePath) {
      const signedUrl = await createDocumentSignedUrl(docItem.storagePath, 3600);
      if (signedUrl) {
        return res.redirect(signedUrl);
      }
    }

    if (docItem.dataUrl && docItem.dataUrl.startsWith('data:')) {
      const match = docItem.dataUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        res.setHeader('Content-Type', match[1]);
        return res.send(Buffer.from(match[2], 'base64'));
      }
    }

    return res.status(404).json({ error: 'Document file could not be retrieved.' });
  });

  app.post('/api/portal/documents/upload', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { docType, fileName, fileSize, dataUrl } = req.body;

    const validTypes = ['faydaIdFront', 'faydaIdBack', 'drivingLicenceFront', 'drivingLicenceBack'];
    if (!validTypes.includes(docType)) {
      return res.status(400).json({ error: 'Invalid document type specified.' });
    }

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required.' });
    }

    // Require Supabase Storage in production
    const supabaseAdmin = getSupabaseAdminClient();
    if (process.env.NODE_ENV === 'production' && !supabaseAdmin) {
      return res.status(503).json({
        error: 'Document storage service is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production document storage.',
      });
    }

    let storagePath: string | undefined;
    let fileUrl: string | undefined;

    if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      const uploadResult = await uploadDocumentToSupabase(userId, docType, fileName, dataUrl);
      if (uploadResult) {
        storagePath = uploadResult.storagePath;
        fileUrl = uploadResult.signedUrl;
      } else if (process.env.NODE_ENV === 'production') {
        return res.status(502).json({
          error: 'Failed to upload document to secure Supabase Storage. Please try again.',
        });
      }
    }

    const db = getDatabase();
    let docRecord = db.userDocuments.find((d) => d.userId === userId);
    if (!docRecord) {
      docRecord = {
        userId,
        documents: {
          faydaIdFront: null,
          faydaIdBack: null,
          drivingLicenceFront: null,
          drivingLicenceBack: null,
        },
      };
      db.userDocuments.push(docRecord);
    }

    const docLabels: Record<string, string> = {
      faydaIdFront: 'Fayda ID (Front)',
      faydaIdBack: 'Fayda ID (Back)',
      drivingLicenceFront: 'Driving Licence (Front)',
      drivingLicenceBack: 'Driving Licence (Back)',
    };

    docRecord.documents[docType as keyof CustomerDocuments] = {
      id: `doc_${docType}_${Date.now()}`,
      docType: docType as any,
      fileName: fileName || `${docType}.pdf`,
      fileSize: fileSize || '1.8 MB',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      storagePath,
      fileUrl,
      dataUrl: fileUrl || (process.env.NODE_ENV !== 'production' ? dataUrl : undefined),
      status: 'Uploaded',
    };

    // Add document upload notification
    const newDocNotif: NotificationItem = {
      id: `notif_doc_${Date.now()}`,
      userId,
      title: 'Document Uploaded',
      message: `Your ${docLabels[docType] || 'document'} has been securely uploaded and stored.`,
      type: 'system',
      date: 'Just now',
      read: false,
      priority: 'low',
    };
    db.notifications.unshift(newDocNotif);

    saveDatabase();
    syncUserDocumentsToSupabase(docRecord).catch((err) => console.warn('[SUPABASE DOC SYNC]', err));
    syncNotificationToSupabase(newDocNotif).catch(() => {});

    const isComplete = hasAllRequiredDocuments(userId);
    return res.json({
      success: true,
      message: `${docLabels[docType] || 'Document'} uploaded successfully.`,
      documents: docRecord.documents,
      isComplete,
    });
  });

  app.delete('/api/portal/documents/:docType', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { docType } = req.params;

    const db = getDatabase();
    const docRecord = db.userDocuments.find((d) => d.userId === userId);
    const existingDoc = docRecord?.documents[docType as keyof CustomerDocuments];
    if (existingDoc?.storagePath) {
      deleteDocumentFromSupabase(existingDoc.storagePath).catch(() => {});
    }

    if (docRecord && docRecord.documents[docType as keyof CustomerDocuments]) {
      docRecord.documents[docType as keyof CustomerDocuments] = null;
      saveDatabase();
      syncUserDocumentsToSupabase(docRecord).catch((err) => console.warn('[SUPABASE DOC DELETE SYNC]', err));
    }

    const isComplete = hasAllRequiredDocuments(userId);
    return res.json({
      success: true,
      message: 'Document removed successfully.',
      documents: docRecord?.documents || {},
      isComplete,
    });
  });

  // ====================================================
  // VEHICLE ORDERS MANAGEMENT ROUTES
  // ====================================================
  app.get('/api/portal/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const orders = db.orders.filter((o) => o.userId === userId);
    return res.json({ orders });
  });

  app.post('/api/portal/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    // Strict document verification check
    if (!hasAllRequiredDocuments(userId)) {
      return res.status(400).json({
        error: 'Required documents missing. Please upload your Fayda ID and driving licence documents in your Profile before ordering a vehicle.',
        missingDocs: true,
      });
    }

    const {
      vehicleId,
      vehicleName,
      vehicleBrand,
      vehicleImage,
      priceETB,
      priceFormattedETB,
      priceFormatted,
      selectedColor,
      notes,
    } = req.body;

    if (!vehicleId || !vehicleName) {
      return res.status(400).json({ error: 'Vehicle details are required to submit an order.' });
    }

    const db = getDatabase();
    const user = db.users.find((u) => u.id === userId);
    const orderNumber = `KA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const etbVal = priceETB ? Number(priceETB) : null;
    const formattedETB = priceFormattedETB || (etbVal && etbVal > 0 ? `ETB ${etbVal.toLocaleString()}` : (priceFormatted || 'ETB Price Pending Configuration'));

    const newOrder: VehicleOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      userId,
      vehicleId,
      vehicleName,
      vehicleBrand: vehicleBrand || 'BYD',
      vehicleImage: vehicleImage || '/images/hero_byd_tang_1788207021341.jpg',
      priceETB: etbVal,
      priceFormattedETB: formattedETB,
      priceFormatted: formattedETB,
      selectedColor: selectedColor || 'Standard Edition',
      notes: notes || '',
      orderDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Order Received',
      stepProgress: 1,
      deliveryLocation: 'Kairos Addis Flagship Showroom, Bole Wollo Sefer',
      history: [
        {
          status: 'Order Received',
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          note: `Order registered under verified customer account for ${user?.fullName}.`,
        },
      ],
    };

    db.orders.unshift(newOrder);

    // Add Order notification
    db.notifications.unshift({
      id: `notif_ord_${Date.now()}`,
      userId,
      title: 'Vehicle Order Submitted',
      message: `Your order #${orderNumber} for ${vehicleName} has been received. Our sales desk will verify your documents and contact you.`,
      type: 'update',
      date: 'Just now',
      read: false,
      priority: 'high',
    });

    saveDatabase();
    syncOrderToSupabase(newOrder).catch((err) => console.warn('[SUPABASE ORDER SYNC]', err));
    syncNotificationToSupabase(db.notifications[0]).catch(() => {});

    return res.status(201).json({
      order: newOrder,
      message: 'Vehicle order submitted successfully! Our concierge team will review your order.',
    });
  });

  // ====================================================
  // MESSAGES & CONCIERGE CHAT ROUTES
  // ====================================================
  app.get('/api/portal/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const messages = db.messages.filter((m) => m.userId === userId);
    return res.json({ messages });
  });

  app.post('/api/portal/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const db = getDatabase();
    const user = db.users.find((u) => u.id === userId);

    const customerMsg: PortalMessage = {
      id: `msg_${Date.now()}_c`,
      userId,
      sender: 'customer',
      senderName: user?.fullName || 'Customer',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    db.messages.push(customerMsg);

    const userContext = buildUserContext(userId, db);

    // Get direct accurate Kairos Addis answer
    let replyText = await askKairosGeminiAI({
      prompt: content.trim(),
      history: db.messages
        .filter((m) => m.userId === userId && m.channel !== 'ai')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'customer' ? 'user' : 'model',
          text: m.content,
        })),
      catalog: db.catalogVehicles,
      settings: db.settings,
      userContext,
    });

    const supportMsg: PortalMessage = {
      id: `msg_${Date.now() + 1}_s`,
      userId,
      sender: 'support',
      senderName: 'Kairos Addis Concierge Support',
      content: replyText,
      timestamp: new Date(Date.now() + 1000).toISOString(),
      read: false,
    };

    db.messages.push(supportMsg);
    saveDatabase();

    // Sync to Supabase in background
    saveMessageToSupabase(customerMsg).catch(() => {});
    saveMessageToSupabase(supportMsg).catch(() => {});

    const userMessages = db.messages.filter((m) => m.userId === userId && m.channel !== 'ai');
    return res.status(201).json({
      messages: userMessages,
      sentMessage: customerMsg,
      replyMessage: supportMsg,
    });
  });

  app.put('/api/portal/messages/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    db.messages.forEach((m) => {
      if (m.userId === userId) {
        m.read = true;
      }
    });
    saveDatabase();
    return res.json({ success: true });
  });

  // ====================================================
  // GEMINI AI CUSTOMER MESSAGING ROUTES
  // ====================================================
  app.get('/api/portal/ai/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const messages = db.messages.filter(
      (m) => m.userId === userId && (m.channel === 'ai' || m.sender === 'ai')
    );
    return res.json({ messages });
  });

  app.post('/api/portal/ai/chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { prompt, history } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Please provide a valid question or prompt.' });
      }

      if (prompt.trim().length > 2000) {
        return res.status(400).json({ error: 'Message exceeds maximum limit of 2000 characters.' });
      }

      const db = getDatabase();
      const user = db.users.find((u) => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      const userContext = buildUserContext(userId, db);

      const userMsg: PortalMessage = {
        id: `msg_ai_usr_${Date.now()}`,
        userId,
        sender: 'customer',
        senderName: user.fullName || 'You',
        content: prompt.trim(),
        timestamp: new Date().toISOString(),
        read: true,
        channel: 'ai',
      };

      db.messages.push(userMsg);

      const reply = await askKairosGeminiAI({
        prompt: prompt.trim(),
        history: Array.isArray(history) ? history : [],
        catalog: db.catalogVehicles,
        settings: db.settings,
        userContext,
      });

      const aiMsg: PortalMessage = {
        id: `msg_ai_res_${Date.now() + 1}`,
        userId,
        sender: 'ai',
        senderName: 'Kairos Addis AI',
        content: reply,
        timestamp: new Date().toISOString(),
        read: true,
        channel: 'ai',
      };

      db.messages.push(aiMsg);
      saveDatabase();

      // Sync to Supabase in background
      saveMessageToSupabase(userMsg).catch(() => {});
      saveMessageToSupabase(aiMsg).catch(() => {});

      const userAiMessages = db.messages.filter(
        (m) => m.userId === userId && (m.channel === 'ai' || m.sender === 'ai')
      );

      return res.status(201).json({
        reply,
        userMessage: userMsg,
        aiMessage: aiMsg,
        messages: userAiMessages,
      });
    } catch (err: any) {
      console.error('[AI CHAT SERVER ERROR]', err);
      return res.status(500).json({ error: 'AI Assistant is temporarily unavailable. Please try again.' });
    }
  });

  app.post('/api/portal/ai/clear', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    db.messages = db.messages.filter(
      (m) => !(m.userId === userId && (m.channel === 'ai' || m.sender === 'ai'))
    );
    saveDatabase();
    return res.json({ success: true, message: 'AI chat history cleared.' });
  });

  // Public AI Chat endpoint (works for website visitors, plus optionally enriched if user is logged in)
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { prompt, history } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Please provide a valid question or prompt.' });
      }

      if (prompt.trim().length > 2000) {
        return res.status(400).json({ error: 'Message exceeds maximum limit of 2000 characters.' });
      }

      const db = getDatabase();

      // Check for optional authorization token
      let userContext: UserContext | undefined;
      const authHeader = req.headers.authorization;
      let token = (req as any).cookies?.kairos_token;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
          userContext = buildUserContext(decoded.id, db);
        } catch {
          // Non-blocking: proceed as anonymous website visitor
        }
      }

      const reply = await askKairosGeminiAI({
        prompt: prompt.trim(),
        history: Array.isArray(history) ? history : [],
        catalog: db.catalogVehicles,
        settings: db.settings,
        userContext,
      });

      return res.json({ reply });
    } catch (err: any) {
      console.error('[PUBLIC AI CHAT SERVER ERROR]', err);
      return res.status(500).json({ error: 'AI Assistant is temporarily unavailable. Please try again.' });
    }
  });

  // ====================================================
  // TESTIMONIALS ROUTES
  // ====================================================
  app.get('/api/portal/testimonials', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const testimonials = db.testimonials.filter((t) => t.userId === userId);
    return res.json({ testimonials });
  });

  app.post('/api/portal/testimonials', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { rating, title, message } = req.body;

    if (!rating || !message) {
      return res.status(400).json({ error: 'Rating and testimonial message are required.' });
    }

    const db = getDatabase();
    const user = db.users.find((u) => u.id === userId);
    const vehicle = db.vehicles.find((v) => v.userId === userId);

    const newTestimonial: PortalTestimonial = {
      id: `test_${Date.now()}`,
      userId,
      customerName: user?.fullName || 'Valued Customer',
      vehicleOwned: vehicle?.model || 'Kairos Electric Vehicle',
      rating: Number(rating) || 5,
      title: title || 'Exceptional Kairos Addis Experience',
      message: message.trim(),
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };

    db.testimonials.unshift(newTestimonial);

    // Notification
    db.notifications.unshift({
      id: `notif_test_${Date.now()}`,
      userId,
      title: 'Testimonial Submitted',
      message: 'Thank you for sharing your feedback! Your review has been submitted and is currently pending verification.',
      type: 'update',
      date: 'Just now',
      read: false,
      priority: 'low',
    });

    saveDatabase();
    syncTestimonialToSupabase(newTestimonial).catch((err) => console.warn('[SUPABASE TESTIMONIAL SYNC]', err));
    syncNotificationToSupabase(db.notifications[0]).catch(() => {});

    return res.status(201).json({
      testimonial: newTestimonial,
      message: 'Thank you! Your testimonial has been submitted and is pending verification.',
    });
  });

  // Test Drives
  app.get('/api/portal/test-drives', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const testDrives = db.testDrives.filter((t) => t.userId === userId);
    return res.json({ testDrives });
  });

  app.post('/api/portal/test-drives', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { vehicleName, preferredDate, preferredTime, notes } = req.body;

    if (!vehicleName || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'Vehicle name, date, and time are required.' });
    }

    const db = getDatabase();
    const newTestDrive: TestDriveRequest = {
      id: `td_${Date.now()}`,
      userId,
      vehicleName,
      preferredDate,
      preferredTime,
      status: 'Confirmed',
      location: 'Bole Wollo Sefer Showroom, Infront of Ibex Hotel',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    db.testDrives.unshift(newTestDrive);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId,
      title: 'Test Drive Scheduled',
      message: `Your test drive for ${vehicleName} on ${preferredDate} at ${preferredTime} is confirmed.`,
      type: 'appointment',
      date: 'Just now',
      read: false,
      priority: 'high',
    };
    db.notifications.unshift(newNotif);

    saveDatabase();
    syncTestDriveToSupabase(newTestDrive).catch((err) => console.warn('[SUPABASE TESTDRIVE SYNC]', err));
    syncNotificationToSupabase(newNotif).catch(() => {});
    return res.status(201).json({ testDrive: newTestDrive, message: 'Test drive booked successfully.' });
  });

  app.delete('/api/portal/test-drives/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDatabase();
    const tdIndex = db.testDrives.findIndex((t) => t.id === id && t.userId === userId);

    if (tdIndex === -1) {
      return res.status(404).json({ error: 'Test drive request not found.' });
    }

    db.testDrives[tdIndex].status = 'Cancelled';
    saveDatabase();
    syncTestDriveToSupabase(db.testDrives[tdIndex]).catch((err) => console.warn('[SUPABASE TESTDRIVE CANCEL SYNC]', err));
    return res.json({ message: 'Test drive request cancelled.' });
  });

  // Notifications
  app.get('/api/portal/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    const notifications = db.notifications.filter((n) => n.userId === userId);
    return res.json({ notifications });
  });

  app.put('/api/portal/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDatabase();
    const notif = db.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      saveDatabase();
      syncNotificationToSupabase(notif).catch(() => {});
    }
    return res.json({ success: true });
  });

  app.put('/api/portal/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const db = getDatabase();
    db.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
        syncNotificationToSupabase(n).catch(() => {});
      }
    });
    saveDatabase();
    return res.json({ success: true });
  });

  // Profile Update
  app.put('/api/portal/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { fullName, phone } = req.body;

    const db = getDatabase();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (phone) user.phone = phone.trim();

    saveDatabase();
    syncUserToSupabase(user).catch(() => {});

    return res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  });

  // Change Password
  app.put('/api/portal/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      if (confirmPassword && newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match.' });
      }

      const db = getDatabase();
      const user = db.users.find((u) => u.id === userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      saveDatabase();
      syncUserToSupabase(user).catch(() => {});

      return res.json({ message: 'Password changed successfully.' });
    } catch (err: any) {
      console.error('[CHANGE PASSWORD ERROR]', err);
      return res.status(500).json({ error: 'An error occurred changing password.' });
    }
  });

  // ====================================================
  // REGISTER ADMIN DASHBOARD & MANAGEMENT API ROUTES
  // ====================================================
  registerAdminRoutes(app, requireAuth);

  return app;
}

const app = createApp();
export default app;
