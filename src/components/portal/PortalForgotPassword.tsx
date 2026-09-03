import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ChevronLeft, KeyRound, RotateCw, UserPlus, Car } from 'lucide-react';
import { api } from '../../lib/api';
import { Logo } from '../Logo';

interface PortalForgotPasswordProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister?: () => void;
  onBackToWebsite: () => void;
}

export const PortalForgotPassword: React.FC<PortalForgotPasswordProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
  onBackToWebsite,
}) => {
  // Steps: 'email' -> 'code' -> 'new-password' -> 'success'
  const [step, setStep] = useState<'email' | 'code' | 'new-password' | 'success'>('email');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Rate limiting / cooldown timer
  const [cooldown, setCooldown] = useState(0);

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

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Step 1: Send Reset Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsNotFound(false);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessMessage(res.message || 'Verification code sent to your email.');
      setCooldown(60);
      setStep('code');
    } catch (err: any) {
      if (err.notFound) {
        setIsNotFound(true);
        setError('No account was found with this email address. Would you like to create an account?');
      } else if (err.retryAfter) {
        setCooldown(err.retryAfter);
        setError(err.message || 'Please wait before requesting another code.');
      } else {
        setError(err.message || 'An error occurred while sending the reset code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: Verify 6-digit Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const fullCode = code.join('').trim();
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.verifyResetCode({
        email: email.trim(),
        code: fullCode,
      });
      setStep('new-password');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code in Step 2
  const handleResendCode = async () => {
    if (cooldown > 0 || isResending) return;
    setError(null);
    setIsResending(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessMessage(res.message || 'A new 6-digit code has been sent to your email.');
      setCooldown(60);
    } catch (err: any) {
      if (err.retryAfter) {
        setCooldown(err.retryAfter);
      }
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword({
        email: email.trim(),
        code: code.join('').trim(),
        newPassword,
        confirmPassword,
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred resetting your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP digit box input
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste of multiple digits
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (i < 6) newCode[i] = d;
      });
      setCode(newCode);
      const nextFocus = Math.min(digits.length, 5);
      const el = document.getElementById(`otp-input-${nextFocus}`);
      el?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
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
          id="btn-back-to-site-forgot"
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

      {/* Main Recovery Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Dynamic Profile Branding Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo logoUrl={brandSettings.logoUrl} siteName={brandSettings.siteName} className="justify-center" imgClassName="h-10 w-auto max-h-12 object-contain" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {step === 'email' && 'Reset Password'}
                {step === 'code' && 'Enter 6-Digit Code'}
                {step === 'new-password' && 'Create New Password'}
                {step === 'success' && 'Password Updated'}
              </h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                {step === 'email' && 'Enter your registered email address to receive a 6-digit verification code.'}
                {step === 'code' && (
                  <span>We sent a 6-digit code to <strong className="text-white">{email}</strong>.</span>
                )}
                {step === 'new-password' && 'Choose a strong new password for your customer account.'}
                {step === 'success' && 'Your account password has been reset successfully.'}
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

                {isNotFound && onNavigateToRegister && (
                  <button
                    id="btn-forgot-notfound-create"
                    type="button"
                    onClick={onNavigateToRegister}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40 transition-colors text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create an Account Now</span>
                  </button>
                )}
              </motion.div>
            )}

            {/* Success Message Banner */}
            {successMessage && step === 'code' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* STEP 1: Enter Email */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-forgot-submit"
                  type="submit"
                  disabled={isSubmitting || cooldown > 0}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : cooldown > 0 ? (
                    <span>RESEND AVAILABLE IN {cooldown}S</span>
                  ) : (
                    <>
                      <span>SEND VERIFICATION CODE</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="text-center mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    id="btn-back-to-login"
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Log in
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter 6-Digit OTP Code */}
            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 text-center uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>

                  <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
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

                <button
                  id="btn-verify-otp-submit"
                  type="submit"
                  disabled={isSubmitting || code.join('').length !== 6}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>VERIFY CODE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError(null);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    disabled={cooldown > 0 || isResending}
                    onClick={handleResendCode}
                    className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {step === 'new-password' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Verified email: <strong>{email}</strong></span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-update-password-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>RESET PASSWORD</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: Success Screen */}
            {step === 'success' && (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Password Updated</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your customer account password has been updated securely. You can now log in to the client portal.
                  </p>
                </div>
                <button
                  id="btn-return-login-success"
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
                >
                  <span>LOG IN NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
        <p>© 2026 {brandSettings.siteName || 'Kairos Addis'} Electric Vehicles.</p>
      </footer>
    </div>
  );
};
