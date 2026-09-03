import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// =========================================================================
// SUPABASE & SMTP CONFIGURATION
// =========================================================================

export function normalizeSupabaseUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  if (
    !url ||
    url.includes('your-project') ||
    url.includes('YOUR_SUPABASE') ||
    url.includes('your_supabase')
  ) {
    return '';
  }

  // Handle PostgreSQL connection strings (e.g., postgresql://postgres.mmokstgfmihnihxsnzhu:pass@...)
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    const userMatch = url.match(/postgres(?:ql)?:\/\/(?:postgres\.)?([a-z0-9_-]+):/i);
    const hostMatch = url.match(/@(?:db\.)?([a-z0-9_-]+)\.supabase\.co/i);
    const projectRef = (userMatch && userMatch[1]) || (hostMatch && hostMatch[1]);
    if (projectRef && projectRef.toLowerCase() !== 'postgres') {
      return `https://${projectRef}.supabase.co`;
    }
  }

  // Handle plain project reference ID (e.g. 20 alphanumeric characters)
  if (/^[a-z0-9]{20}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    return '';
  }
  return '';
}

export function getRawSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();
}

export function getSupabaseUrl(): string {
  return normalizeSupabaseUrl(getRawSupabaseUrl());
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();
}

export function getSupabaseServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();
}

export function getAppUrl(): string {
  return process.env.APP_URL || 'https://kairosaddis.com';
}

export function getSmtpConfig() {
  const user = (
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    ''
  ).trim();
  const pass = (
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASSWORD ||
    ''
  ).trim();
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  return { user, pass, host, port };
}

// Lazy-initialized clients
let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;
let mailTransporter: nodemailer.Transporter | null = null;
let hasLoggedSupabaseWarning = false;

export interface EmailDeliveryAuditItem {
  id: string;
  timestamp: string;
  recipient: string;
  emailType: 'verification' | 'password-reset';
  status: 'delivered' | 'failed' | 'simulated';
  attempts: number;
  messageId?: string;
  error?: string;
  errorCode?: string;
  durationMs: number;
}

// In-memory audit log for email delivery diagnostics
const emailDeliveryLogs: EmailDeliveryAuditItem[] = [];

export function getEmailAuditLogs(): EmailDeliveryAuditItem[] {
  return [...emailDeliveryLogs];
}

function addEmailAuditLog(item: EmailDeliveryAuditItem) {
  emailDeliveryLogs.unshift(item);
  if (emailDeliveryLogs.length > 50) {
    emailDeliveryLogs.pop();
  }
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceKey = getSupabaseServiceRoleKey();
  return !!(url && (anonKey || serviceKey));
}

export function isSupabaseAdminConfigured(): boolean {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  return !!(url && serviceKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceKey = getSupabaseServiceRoleKey();
  const key = anonKey || serviceKey;

  if (url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`[SUPABASE] Initialized Supabase client for ${url}`);
    } catch (err) {
      console.error('[SUPABASE] Failed to initialize Supabase client:', err);
    }
  } else if (!hasLoggedSupabaseWarning) {
    hasLoggedSupabaseWarning = true;
    const rawUrl = getRawSupabaseUrl();
    if (rawUrl && !url) {
      console.warn('[SUPABASE WARNING] SUPABASE_URL could not be parsed as a valid HTTP/HTTPS endpoint. Using local database store.');
    }
  }
  return supabaseClient;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();

  if (url && serviceKey) {
    try {
      supabaseAdminClient = createClient(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`[SUPABASE] Initialized Supabase Admin client for ${url}`);
    } catch (err) {
      console.error('[SUPABASE ERROR] Failed to initialize Supabase Admin client:', err);
    }
  }
  // ONLY return admin client if service role key was actually configured
  return supabaseAdminClient;
}

export function getMailTransporter(): nodemailer.Transporter | null {
  const smtpUser = (
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    ''
  ).trim();
  const smtpPass = (
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASSWORD ||
    ''
  ).trim();
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

  if (!mailTransporter && smtpUser && smtpPass) {
    try {
      const isSecure = smtpPort === 465;
      mailTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        // Robust timeouts to prevent socket hangs
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 15000,     // 15 seconds
        tls: {
          rejectUnauthorized: false,
        },
      });
      console.log(`[EMAIL] Initialized SMTP transporter with host=${smtpHost}, port=${smtpPort}, user=${smtpUser}`);
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to initialize Nodemailer transporter:', err);
    }
  }
  return mailTransporter;
}

// Generate cryptographically random 6-digit numeric OTP code using Node crypto
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
  attempts: number;
  deliveryMode: 'smtp' | 'simulated';
  userMessage: string;
  devCode?: string;
}

/**
 * Classifies SMTP errors into actionable user-friendly descriptions and determines
 * if the error is temporary/retryable.
 */
function classifySmtpError(err: any): { userMessage: string; isRetryable: boolean; code: string } {
  const code = (err.code || err.responseCode || 'UNKNOWN_SMTP_ERROR').toString();
  const message = (err.message || '').toLowerCase();

  // Authentication errors (non-retryable)
  if (code === 'EAUTH' || code === '535' || message.includes('invalid login') || message.includes('bad credentials') || message.includes('username and password not accepted')) {
    return {
      code: 'AUTH_FAILED',
      userMessage: 'Email delivery failed due to SMTP authentication credentials. Please check your Gmail App Password configuration.',
      isRetryable: false,
    };
  }

  // Recipient / address rejection (non-retryable)
  if (code === '550' || code === '553' || code === 'EENVELOPE' || message.includes('recipient rejected') || message.includes('mailbox unavailable')) {
    return {
      code: 'INVALID_RECIPIENT',
      userMessage: 'The recipient email address could not be found or rejected the incoming message.',
      isRetryable: false,
    };
  }

  // Connection refused / DNS issues (retryable)
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    const host = getSmtpConfig().host;
    return {
      code: 'NETWORK_ERROR',
      userMessage: `Unable to connect to the email server (${host}). Network connection dropped or DNS lookup failed.`,
      isRetryable: true,
    };
  }

  // Timeouts (retryable)
  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT' || message.includes('timeout') || message.includes('greeting never received')) {
    return {
      code: 'TIMEOUT',
      userMessage: 'Email delivery timed out while establishing connection to the mail server. Please try again.',
      isRetryable: true,
    };
  }

  // Rate limit / temporary server rejection (retryable)
  if (code === '421' || code === '451' || code === '452' || message.includes('rate limit') || message.includes('too many') || message.includes('try again later')) {
    return {
      code: 'RATE_LIMIT',
      userMessage: 'Email provider temporarily rate-limited the connection. Please wait a moment before requesting another code.',
      isRetryable: true,
    };
  }

  // Generic fallback
  return {
    code,
    userMessage: err.message || 'An unexpected error occurred during email transmission.',
    isRetryable: true,
  };
}

/**
 * Helper to pause execution for exponential backoff with jitter
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core robust email sender with automated retries, exponential backoff, detailed logging,
 * and error bubbling.
 */
async function sendMailWithRetry(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  emailType: 'verification' | 'password-reset';
  otpCode: string;
}): Promise<SendEmailResult> {
  const { to, subject, text, html, emailType, otpCode } = options;
  const startTime = Date.now();
  const transporter = getMailTransporter();
  const smtpConfig = getSmtpConfig();

  // If SMTP credentials are NOT configured in environment, fail clearly in production or support local simulation
  if (!transporter || !smtpConfig.user || !smtpConfig.pass) {
    if (process.env.NODE_ENV === 'production') {
      const errorMsg = 'SMTP email service is not configured. Please define GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.';
      console.error(`[SMTP ERROR] Missing GMAIL_USER or GMAIL_APP_PASSWORD in production environment for ${to}.`);
      addEmailAuditLog({
        id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        recipient: to,
        emailType,
        status: 'failed',
        attempts: 0,
        error: errorMsg,
        errorCode: 'SMTP_CREDENTIALS_MISSING',
        durationMs: Date.now() - startTime,
      });

      return {
        success: false,
        error: errorMsg,
        errorCode: 'SMTP_CREDENTIALS_MISSING',
        attempts: 0,
        deliveryMode: 'smtp',
        userMessage: errorMsg,
      };
    }

    // In local development, safely log the code to terminal for testing
    console.log(`[LOCAL DEV ${emailType.toUpperCase()}] Recipient: ${to} | Verification Code: ${otpCode}`);
    
    addEmailAuditLog({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      recipient: to,
      emailType,
      status: 'simulated',
      attempts: 1,
      durationMs: Date.now() - startTime,
    });

    return {
      success: true,
      attempts: 1,
      deliveryMode: 'simulated',
      devCode: otpCode,
      userMessage: `A 6-digit verification code (${otpCode}) has been prepared for ${to}.`,
    };
  }

  const MAX_ATTEMPTS = 3;
  let lastError: any = null;
  let lastClassification: { userMessage: string; isRetryable: boolean; code: string } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const attemptStart = Date.now();
    try {
      console.log(`[SMTP LOG] Attempt ${attempt}/${MAX_ATTEMPTS}: Sending ${emailType} email to ${to}...`);

      const info = await transporter.sendMail({
        from: `"Kairos Addis Auto Dealership" <${smtpConfig.user}>`,
        to,
        replyTo: 'contact@kairosaddis.com',
        subject,
        text,
        html,
        headers: {
          'X-Mailer': 'Kairos Addis Automotive Notification Service',
          'X-Entity-Ref-ID': `kairos-${Date.now()}-${otpCode || 'auth'}`,
        },
      });

      const durationMs = Date.now() - startTime;
      console.log(`[SMTP SUCCESS] Email delivered successfully to ${to} on attempt ${attempt} in ${durationMs}ms (messageId: ${info.messageId})`);

      if (info.accepted && info.accepted.length > 0) {
        console.log(`[SMTP RECIPIENT ACCEPTED] Recipients accepted by SMTP: ${info.accepted.join(', ')}`);
      }
      if (info.rejected && info.rejected.length > 0) {
        console.warn(`[SMTP RECIPIENT REJECTED] Recipients rejected by SMTP: ${info.rejected.join(', ')}`);
      }

      addEmailAuditLog({
        id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        recipient: to,
        emailType,
        status: 'delivered',
        attempts: attempt,
        messageId: info.messageId,
        durationMs,
      });

      return {
        success: true,
        messageId: info.messageId,
        attempts: attempt,
        deliveryMode: 'smtp',
        userMessage: `Verification code successfully sent to ${to}.`,
      };
    } catch (err: any) {
      const attemptDuration = Date.now() - attemptStart;
      lastError = err;
      lastClassification = classifySmtpError(err);

      console.error(`[SMTP RETRY ${attempt}/${MAX_ATTEMPTS} FAILED] to=${to} error="${err.message}" code=${lastClassification.code} (${attemptDuration}ms)`);

      // If error is not retryable (e.g. invalid auth credentials), stop immediately
      if (!lastClassification.isRetryable) {
        console.warn(`[SMTP NOTICE] Error is permanent (${lastClassification.code}). Aborting subsequent retries.`);
        break;
      }

      // If attempts remain, wait with exponential backoff + jitter
      if (attempt < MAX_ATTEMPTS) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000 + Math.floor(Math.random() * 500);
        console.log(`[SMTP RETRY] Waiting ${backoffMs}ms before attempt ${attempt + 1}...`);
        await sleep(backoffMs);
      }
    }
  }

  // All retries failed
  const totalDuration = Date.now() - startTime;
  const errorMsg = lastClassification?.userMessage || lastError?.message || 'Failed to deliver email through SMTP server.';
  const errorCode = lastClassification?.code || 'SMTP_TRANSMISSION_FAILED';

  console.error(`[SMTP FINAL FAILURE] All attempts failed for ${to} (${totalDuration}ms). Error: ${errorMsg}`);

  addEmailAuditLog({
    id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    recipient: to,
    emailType,
    status: 'failed',
    attempts: MAX_ATTEMPTS,
    error: errorMsg,
    errorCode,
    durationMs: totalDuration,
  });

  return {
    success: false,
    error: errorMsg,
    errorCode,
    attempts: MAX_ATTEMPTS,
    deliveryMode: 'smtp',
    userMessage: errorMsg,
  };
}

// =========================================================================
// EMAIL DELIVERY SERVICE (Gmail SMTP & Supabase)
// =========================================================================

export async function sendVerificationEmail(params: {
  email: string;
  fullName: string;
  otpCode: string;
  verificationLink?: string;
}): Promise<SendEmailResult> {
  const { email, fullName, otpCode, verificationLink } = params;

  const confirmUrl =
    verificationLink ||
    `${getAppUrl()}/portal/verify-email?email=${encodeURIComponent(email)}&token=${otpCode}`;

  const htmlContent = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kairos Addis Account Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text for inbox preview -->
  <div style="display:none; font-size:1px; color:#f1f5f9; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    Your Kairos Addis verification code is ${otpCode}. Valid for 24 hours.
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: #070b12; padding: 28px 24px; border-bottom: 3px solid #1565F0;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
                KAIROS ADDIS
              </h1>
              <p style="color: #1565F0; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin: 4px 0 0 0;">
                Electric Vehicles • Addis Ababa, Ethiopia
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 14px 0;">
                Verify Your Email Address
              </h2>
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${fullName || 'Valued Customer'}</strong>,
              </p>
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for creating an account with Kairos Addis Automotive. Please use the 6-digit verification code below to confirm your email address and activate your customer portal access:
              </p>

              <!-- OTP Code Display Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 2px dashed #1565F0; border-radius: 10px; padding: 20px;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #1565F0; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                      Your Verification Code
                    </span>
                    <span style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 4px 0;">
                      ${otpCode}
                    </span>
                    <span style="display: block; font-size: 12px; color: #64748b; margin-top: 6px;">
                      This code is valid for 24 hours. Do not share it with anyone.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${confirmUrl}" target="_blank" style="display: inline-block; background-color: #1565F0; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 6px;">
                      Verify Email &amp; Open Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                If you did not register for an account at kairosaddis.com, please ignore this email or contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
              <strong>Kairos Addis Automotive PLC</strong><br />
              Bole Sub-City, Wollo Sefer, Infront of Ibex Hotel, Addis Ababa, Ethiopia<br />
              Hotline: +251 953 991 901 &bull; Email: contact@kairosaddis.com<br />
              &copy; 2026 Kairos Addis. All rights reserved. Powered by YouGuard Warranty.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendMailWithRetry({
    to: email,
    subject: `Kairos Addis: Your 6-digit verification code is ${otpCode}`,
    text: `Kairos Addis Automotive - Account Verification\n\nHello ${fullName || 'Valued Customer'},\n\nThank you for registering with Kairos Addis.\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in 24 hours. Do not share this code with anyone.\n\nAlternatively, you can verify your account by clicking the link below:\n${confirmUrl}\n\nIf you did not request this verification, you can safely ignore this email.\n\n---\nKairos Addis Automotive PLC\nBole Sub-City, Wollo Sefer, Infront of Ibex Hotel, Addis Ababa, Ethiopia\nPhone: +251 953 991 901 | Email: contact@kairosaddis.com`,
    html: htmlContent,
    emailType: 'verification',
    otpCode,
  });
}

export async function sendPasswordResetEmail(params: {
  email: string;
  fullName: string;
  resetToken: string;
  resetOtp?: string;
}): Promise<SendEmailResult> {
  const { email, fullName, resetToken, resetOtp } = params;
  const code = resetOtp || resetToken;
  const resetUrl = `${getAppUrl()}/portal/forgot-password?email=${encodeURIComponent(email)}&token=${code}`;

  const htmlContent = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kairos Addis Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display:none; font-size:1px; color:#f1f5f9; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    Your Kairos Addis password reset code is ${code}. Valid for 60 minutes.
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: #070b12; padding: 28px 24px; border-bottom: 3px solid #1565F0;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
                KAIROS ADDIS
              </h1>
              <p style="color: #1565F0; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin: 4px 0 0 0;">
                Electric Vehicles • Account Security
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 14px 0;">
                Reset Your Password
              </h2>
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${fullName || 'Valued Customer'}</strong>,
              </p>
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset the password for your Kairos Addis account. Use the 6-digit code below to set a new password:
              </p>

              <!-- OTP Code Display Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 2px dashed #1565F0; border-radius: 10px; padding: 20px;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #1565F0; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                      Your Password Reset Code
                    </span>
                    <span style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 4px 0;">
                      ${code}
                    </span>
                    <span style="display: block; font-size: 12px; color: #64748b; margin-top: 6px;">
                      This code will expire in 60 minutes.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #1565F0; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 6px;">
                      Reset Password Online
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                If you did not request a password reset, your account is safe and you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
              <strong>Kairos Addis Automotive PLC</strong><br />
              Bole Sub-City, Wollo Sefer, Infront of Ibex Hotel, Addis Ababa, Ethiopia<br />
              Hotline: +251 953 991 901 &bull; Email: contact@kairosaddis.com<br />
              &copy; 2026 Kairos Addis. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendMailWithRetry({
    to: email,
    subject: `Kairos Addis: Your password reset code is ${code}`,
    text: `Kairos Addis Automotive - Password Reset\n\nHello ${fullName || 'Valued Customer'},\n\nWe received a request to reset your Kairos Addis account password.\n\nYour 6-digit password reset code is: ${code}\n\nThis code will expire in 60 minutes. Do not share this code with anyone.\n\nAlternatively, reset your password online:\n${resetUrl}\n\nIf you did not request this, you can safely disregard this email.\n\n---\nKairos Addis Automotive PLC\nBole Sub-City, Wollo Sefer, Infront of Ibex Hotel, Addis Ababa, Ethiopia\nPhone: +251 953 991 901 | Email: contact@kairosaddis.com`,
    html: htmlContent,
    emailType: 'password-reset',
    otpCode: code,
  });
}

// =========================================================================
// SUPABASE EXECUTIVE CONCIERGE MESSAGING SYNC
// =========================================================================

export async function saveMessageToSupabase(msg: {
  id: string;
  userId: string;
  sender: string;
  senderName?: string;
  content: string;
  timestamp: string;
  read: boolean;
  channel?: string;
}): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) return false;

  try {
    let validUserId: string | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msg.userId);
    if (isUuid) {
      // Check if user exists in profiles
      const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', msg.userId).maybeSingle();
      if (profile) {
        validUserId = msg.userId;
      }
    }

    const senderRole =
      msg.sender === 'customer' || msg.sender === 'user'
        ? 'user'
        : msg.sender === 'ai'
        ? 'ai'
        : 'advisor';

    const { error } = await supabaseAdmin.from('portal_messages').upsert({
      id: msg.id,
      user_id: validUserId,
      sender: senderRole,
      message: msg.content,
      read: !!msg.read,
      created_at: msg.timestamp || new Date().toISOString(),
    });

    if (error) {
      console.warn('[SUPABASE] saveMessageToSupabase notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE] saveMessageToSupabase caught:', err?.message || err);
    return false;
  }
}

export async function deleteContactMessagesFromSupabase(userId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) return false;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      const { error } = await supabaseAdmin
        .from('portal_messages')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.warn('[SUPABASE] deleteContactMessagesFromSupabase error:', error.message);
        return false;
      }
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE] deleteContactMessagesFromSupabase caught:', err?.message || err);
    return false;
  }
}

export async function getSupabaseMessages(): Promise<any[]> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('portal_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id || 'unassigned',
      sender: item.sender === 'user' ? 'customer' : item.sender === 'ai' ? 'ai' : 'admin',
      senderName:
        item.sender === 'ai'
          ? 'Kairos Addis AI'
          : item.sender === 'user'
          ? 'Client'
          : 'Kairos Addis Executive Concierge',
      content: item.message,
      timestamp: item.created_at,
      read: !!item.read,
      channel: item.sender === 'ai' ? 'ai' : 'concierge',
    }));
  } catch {
    return [];
  }
}

// =========================================================================
// SUPABASE STORAGE FOR CUSTOMER ONBOARDING DOCUMENTS
// =========================================================================

export interface DocumentUploadResult {
  storagePath: string;
  signedUrl: string;
}

export async function createDocumentSignedUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin || !filePath) return null;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('kairos-documents')
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data) {
      console.warn('[SUPABASE STORAGE] createSignedUrl notice:', error?.message);
      return null;
    }
    return data.signedUrl;
  } catch (err: any) {
    console.warn('[SUPABASE STORAGE] createSignedUrl exception:', err?.message || err);
    return null;
  }
}

export async function deleteDocumentFromSupabase(filePath: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin || !filePath) return false;

  try {
    const { error } = await supabaseAdmin.storage
      .from('kairos-documents')
      .remove([filePath]);

    if (error) {
      console.warn('[SUPABASE STORAGE] delete error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function uploadDocumentToSupabase(
  userId: string,
  docType: string,
  fileName: string,
  dataUrl: string
): Promise<DocumentUploadResult | null> {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) return null;

  try {
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
    if (!match) return null;

    const contentType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const ext = fileName.split('.').pop() || 'bin';
    const filePath = `${userId}/${docType}_${Date.now()}.${ext}`;

    // Ensure private bucket exists
    await supabaseAdmin.storage
      .createBucket('kairos-documents', { public: false })
      .catch(() => {});

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('kairos-documents')
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadErr) {
      console.error('[SUPABASE STORAGE] Upload error:', uploadErr.message);
      return null;
    }

    // Generate signed URL (expires in 1 hour) for secure view
    const signedUrl = await createDocumentSignedUrl(filePath, 3600);

    return {
      storagePath: filePath,
      signedUrl: signedUrl || '',
    };
  } catch (err: any) {
    console.error('[SUPABASE STORAGE EXCEPTION]', err?.message || err);
    return null;
  }
}



