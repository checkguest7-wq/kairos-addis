import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ChevronLeft, RefreshCw, KeyRound, UserPlus, Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Logo } from '../Logo';

interface PortalVerifyEmailProps {
  initialEmail?: string;
  initialToken?: string;
  onVerificationSuccess: () => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister?: () => void;
  onBackToWebsite: () => void;
}

export const PortalVerifyEmail: React.FC<PortalVerifyEmailProps> = ({
  initialEmail = '',
  initialToken = '',
  onVerificationSuccess,
  onNavigateToLogin,
  onNavigateToRegister,
  onBackToWebsite,
}) => {
  const { verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Dynamic branding
  const [brandSettings, setBrandSettings] = useState<{
    siteName?: string;
    logoUrl?: string;
  }>({
    siteName: 'Kairos Addis',
    logoUrl: '',
  });

  useEffect(() => {
    let isMounted = true;
    api.getPublicSettings()
      .then((res) => {
        if (isMounted && res?.settings) {
          setBrandSettings({
            siteName: res.settings.siteName || 'Kairos Addis',
            logoUrl: res.settings.logoUrl || '',
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Read URL search params on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('email');
      const urlToken = params.get('token') || params.get('code');
      if (urlEmail && !email) setEmail(urlEmail);
      if (urlToken) {
        const cleaned = urlToken.trim().slice(0, 6);
        const digits = cleaned.split('');
        const newCode = ['', '', '', '', '', ''];
        digits.forEach((d, i) => {
          if (i < 6) newCode[i] = d;
        });
        setCode(newCode);

        // If both email and token are provided via URL, auto-verify
        if (urlEmail && cleaned.length === 6) {
          handleAutoVerify(urlEmail, cleaned);
        }
      }
    }
  }, []);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleAutoVerify = async (emailToVerify: string, tokenToVerify: string) => {
    setIsSubmitting(true);
    setError(null);
    setIsNotFound(false);
    try {
      await verifyEmail(emailToVerify.trim(), tokenToVerify.trim());
      setIsVerified(true);
      setSuccessMessage('Email verified successfully! Welcome to Kairos Addis.');
    } catch (err: any) {
      if (err.notFound || (err.message && err.message.toLowerCase().includes('account not found'))) {
        setIsNotFound(true);
        setError('Account not found. No account is registered with this email address.');
      } else {
        setError(err.message || 'Invalid or expired verification link. Please enter your code manually.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (i < 6) newCode[i] = d;
      });
      setCode(newCode);
      const nextFocus = Math.min(digits.length, 5);
      const el = document.getElementById(`verify-otp-${nextFocus}`);
      el?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < 5) {
      const nextInput = document.getElementById(`verify-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`verify-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsNotFound(false);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const fullCode = code.join('').trim();
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit verification code sent to your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(email.trim(), fullCode);
      setIsVerified(true);
      setSuccessMessage('Email verified successfully! Welcome to Kairos Addis.');
    } catch (err: any) {
      if (err.notFound || (err.message && err.message.toLowerCase().includes('account not found'))) {
        setIsNotFound(true);
        setError('Account not found. No account is registered with this email address.');
      } else {
        setError(err.message || 'Verification failed. Please check your 6-digit code or request a new one.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    if (!email.trim()) {
      setError('Please enter your email address to resend the verification code.');
      return;
    }

    setIsResending(true);
    setError(null);
    setIsNotFound(false);
    setSuccessMessage(null);

    try {
      const res = await resendVerification(email.trim());
      setSuccessMessage(res.message || 'A new verification code has been sent to your email.');
      setResendCooldown(60); // 60s rate limit
    } catch (err: any) {
      if (err.notFound || (err.message && err.message.toLowerCase().includes('account not found'))) {
        setIsNotFound(true);
        setError('Account not found. No account is registered with this email address.');
      } else if (err.message && err.message.includes('already verified')) {
        setSuccessMessage('Your email address is already verified. You can log in directly.');
        setIsVerified(true);
      } else {
        setError(err.message || 'Failed to resend verification email.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-blue-700/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          id="btn-back-to-site-verify"
          onClick={onBackToWebsite}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {brandSettings.siteName || 'Kairos Addis'}
        </button>

        <div className="flex items-center gap-3">
          <Logo logoUrl={brandSettings.logoUrl} siteName={brandSettings.siteName} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo logoUrl={brandSettings.logoUrl} siteName={brandSettings.siteName} className="justify-center" imgClassName="h-10 w-auto max-h-12 object-contain" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Verify Your Account
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Please enter the 6-digit verification code sent to your email to activate your account.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`mb-6 p-4 rounded-xl text-xs space-y-3 ${
                  isNotFound
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isNotFound ? 'text-cyan-400' : 'text-red-400'}`} />
                  <span>{error}</span>
                </div>

                {isNotFound && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    {onNavigateToRegister && (
                      <button
                        id="btn-verify-notfound-create"
                        type="button"
                        onClick={onNavigateToRegister}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40 transition-colors text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </button>
                    )}
                    <button
                      id="btn-verify-notfound-login"
                      type="button"
                      onClick={onNavigateToLogin}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Success Message */}
            {successMessage && !isVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {isVerified ? (
              /* Verified Success State */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Account Verified!</h3>
                  <p className="text-sm text-slate-300">
                    Your email address has been confirmed. You can now sign in to your customer portal.
                  </p>
                </div>
                <button
                  id="btn-access-portal-after-verify"
                  type="button"
                  onClick={onVerificationSuccess}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
                >
                  <span>SIGN IN NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Verification Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-verify-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* 6-Digit Code / Token */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 text-center uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`verify-otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-xl font-bold bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 rounded-xl text-white outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Verification Button */}
                <button
                  id="btn-verify-submit"
                  type="submit"
                  disabled={isSubmitting || code.join('').length !== 6}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CONFIRM & VERIFY</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {/* Resend Verification Action with Rate Limiting */}
                <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col items-center gap-3">
                  <div className="text-xs text-slate-400 text-center">
                    Didn't receive the email or code expired?
                  </div>
                  <button
                    id="btn-resend-verification"
                    type="button"
                    disabled={isResending || resendCooldown > 0}
                    onClick={handleResend}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-cyan-400 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : isResending
                        ? 'Sending Email...'
                        : 'Resend Verification Email'}
                    </span>
                  </button>
                </div>

                {/* Return to Login */}
                <div className="text-center mt-4">
                  <button
                    id="btn-back-to-login-from-verify"
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Return to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
        <p>© 2026 {brandSettings.siteName || 'Kairos Addis'} Electric Vehicles. Supabase Auth & Gmail SMTP Verification.</p>
      </footer>
    </div>
  );
};
