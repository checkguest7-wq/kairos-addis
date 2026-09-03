import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredToken } from '../../lib/api';
import { PortalLogin } from './PortalLogin';
import { PortalRegister } from './PortalRegister';
import { PortalVerifyEmail } from './PortalVerifyEmail';
import { PortalForgotPassword } from './PortalForgotPassword';
import { PortalDashboard } from './PortalDashboard';
import { PortalTab } from './PortalSidebar';

interface PortalAppProps {
  onBackToWebsite: () => void;
}

export const PortalApp: React.FC<PortalAppProps> = ({ onBackToWebsite }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/portal/login';
  });

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle automatic redirect if logged in
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (currentPath === '/portal/login' || currentPath === '/portal/register' || currentPath === '/portal/forgot-password' || currentPath.startsWith('/portal/verify-email'))) {
        navigateTo('/portal/dashboard');
      } else if (!isAuthenticated && !getStoredToken() && currentPath.startsWith('/portal/dashboard')) {
        navigateTo('/portal/login');
      }
    }
  }, [isAuthenticated, isLoading, currentPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
          Verifying Customer Session...
        </p>
      </div>
    );
  }

  // If user is authenticated, render the dashboard
  if (isAuthenticated && user) {
    let initialTab: PortalTab = 'dashboard';
    if (typeof window !== 'undefined') {
      const pendingIntent = sessionStorage.getItem('kairos_pending_intent');
      if (pendingIntent) {
        try {
          const parsed = JSON.parse(pendingIntent);
          if (parsed.type === 'test-drive') {
            initialTab = 'test-drives';
          }
        } catch (e) {}
      }
    }

    if (currentPath === '/portal/vehicles' || currentPath === '/portal/vehicle') initialTab = 'vehicles';
    else if (currentPath === '/portal/orders') initialTab = 'orders';
    else if (currentPath === '/portal/documents') initialTab = 'documents';
    else if (currentPath === '/portal/warranty') initialTab = 'warranty';
    else if (currentPath === '/portal/service' || currentPath === '/portal/appointments' || currentPath === '/portal/book-service') initialTab = 'service';
    else if (currentPath === '/portal/test-drives') initialTab = 'test-drives';
    else if (currentPath === '/portal/messages') initialTab = 'messages';
    else if (currentPath === '/portal/testimonials' || currentPath === '/portal/testimonial') initialTab = 'testimonials';
    else if (currentPath === '/portal/notifications') initialTab = 'notifications';
    else if (currentPath === '/portal/profile') initialTab = 'profile';

    return (
      <PortalDashboard
        initialTab={initialTab}
        onBackToWebsite={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
          onBackToWebsite();
        }}
      />
    );
  }

  // If user is unauthenticated, render the auth pages
  if (currentPath.startsWith('/portal/verify-email')) {
    return (
      <PortalVerifyEmail
        onVerificationSuccess={() => navigateTo('/portal/login')}
        onNavigateToLogin={() => navigateTo('/portal/login')}
        onNavigateToRegister={() => navigateTo('/portal/register')}
        onBackToWebsite={onBackToWebsite}
      />
    );
  }

  if (currentPath === '/portal/register') {
    return (
      <PortalRegister
        onNavigateToLogin={() => navigateTo('/portal/login')}
        onNavigateToVerify={(email, code) => {
          const query = new URLSearchParams({ email });
          if (code) query.set('code', code);
          navigateTo(`/portal/verify-email?${query.toString()}`);
        }}
        onBackToWebsite={onBackToWebsite}
      />
    );
  }

  if (currentPath === '/portal/forgot-password') {
    return (
      <PortalForgotPassword
        onNavigateToLogin={() => navigateTo('/portal/login')}
        onNavigateToRegister={() => navigateTo('/portal/register')}
        onBackToWebsite={onBackToWebsite}
      />
    );
  }

  // Default to login page
  return (
    <PortalLogin
      onNavigateToRegister={() => navigateTo('/portal/register')}
      onNavigateToForgotPassword={() => navigateTo('/portal/forgot-password')}
      onNavigateToVerify={(email) => navigateTo(`/portal/verify-email?email=${encodeURIComponent(email)}`)}
      onLoginSuccess={() => navigateTo('/portal/dashboard')}
      onBackToWebsite={onBackToWebsite}
    />
  );
};
