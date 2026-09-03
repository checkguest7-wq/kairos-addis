import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ChevronLeft, UserPlus, Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Logo } from '../Logo';

interface PortalLoginProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: () => void;
  onBackToWebsite: () => void;
  onNavigateToVerify?: (email: string) => void;
}

export const PortalLogin: React.FC<PortalLoginProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onLoginSuccess,
  onBackToWebsite,
  onNavigateToVerify,
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Dynamic branding fetched from admin settings
  const [brandSettings, setBrandSettings] = useState<{
    siteName?: string;
    logoUrl?: string;
    tagline?: string;
  }>({
    siteName: 'Kairos Addis',
    logoUrl: '',
    tagline: 'Electric Vehicles Client Portal',
  });

  useEffect(() => {
    let isMounted = true;
    api.getPublicSettings()
      .then((res) => {
        if (isMounted && res?.settings) {
          setBrandSettings({
            siteName: res.settings.siteName || 'Kairos Addis',
            logoUrl: res.settings.logoUrl || '',
            tagline: res.settings.tagline || 'Client Portal',
          });
        }
      })
      .catch(() => {
        // Keep fallback
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleResendCode = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await api.resendVerification(unverifiedEmail);
      setResendStatus(res.message || 'A new verification code has been sent to your email.');
    } catch (err: any) {
      setResendStatus(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    setError(null);
    setIsNotFound(false);
    setUnverifiedEmail(null);
    setResendStatus(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(trimmedEmail, password);
      if (loggedUser) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.warn('[PORTAL LOGIN NOTICE]', err);
      if (
        err.notFound ||
        err.code === 'ACCOUNT_NOT_FOUND' ||
        err.status === 404 ||
        err.message?.toLowerCase().includes('no account')
      ) {
        setIsNotFound(true);
        setError('No account found. Please create an account.');
      } else if (
        err.requireVerification ||
        err.code === 'EMAIL_NOT_VERIFIED' ||
        err.status === 403 ||
        err.message?.toLowerCase().includes('verify')
      ) {
        setUnverifiedEmail(err.email || trimmedEmail);
        setError('Please verify your email before logging in.');
      } else if (
        err.code === 'PASSWORD_INCORRECT' ||
        err.status === 401 ||
        err.message === 'Password incorrect.' ||
        err.message?.toLowerCase().includes('password') ||
        err.message?.toLowerCase().includes('credential') ||
        err.message?.toLowerCase().includes('invalid')
      ) {
        setError('Password incorrect.');
      } else {
        setError(err.message || 'Password incorrect.');
      }
    } finally {
      setIsSubmitting(false);
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
          id="btn-back-to-site"
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

      {/* Main Login Card */}
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
                Welcome Back
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                Sign in to manage your vehicle warranty, services & appointments.
              </p>
            </div>

            {/* Error Message & Contextual Action */}
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

                {/* Direct Action for Non-Existing Account */}
                {isNotFound && (
                  <button
                    id="btn-login-notfound-create"
                    type="button"
                    onClick={onNavigateToRegister}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40 transition-colors text-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create an account</span>
                  </button>
                )}

                {/* Direct Action for Unverified Account */}
                {unverifiedEmail && (
                  <div className="space-y-2 pt-1">
                    {onNavigateToVerify && (
                      <button
                        id="btn-login-verify-now"
                        type="button"
                        onClick={() => onNavigateToVerify(unverifiedEmail)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40 transition-colors text-xs cursor-pointer"
                      >
                        <span>Enter Verification Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      id="btn-login-resend-code"
                      type="button"
                      disabled={isResending}
                      onClick={handleResendCode}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs disabled:opacity-50 cursor-pointer"
                    >
                      {isResending ? 'Sending code...' : 'Resend verification code'}
                    </button>
                    {resendStatus && (
                      <p className="text-[11px] text-cyan-300 text-center font-medium mt-1">
                        {resendStatus}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Form */}
            <form
              action="javascript:void(0);"
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e);
              }}
              noValidate
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                      if (isNotFound) setIsNotFound(false);
                      if (unverifiedEmail) setUnverifiedEmail(null);
                      if (resendStatus) setResendStatus(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    id="btn-forgot-password-link"
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                      if (isNotFound) setIsNotFound(false);
                      if (unverifiedEmail) setUnverifiedEmail(null);
                      if (resendStatus) setResendStatus(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login-submit"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }}
                disabled={isSubmitting}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>VERIFYING...</span>
                  </div>
                ) : (
                  <>
                    <span>LOG IN</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-8 pt-6 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  id="btn-register-link"
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline-offset-4 hover:underline ml-1 cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
        <p>© 2026 {brandSettings.siteName || 'Kairos Addis'} Electric Vehicles. Protected by 256-bit encryption & YouGuard Security.</p>
      </footer>
    </div>
  );
};
