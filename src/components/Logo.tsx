import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface LogoProps {
  className?: string;
  logoUrl?: string | null;
  siteName?: string;
  imgClassName?: string;
  showFallbackOnFail?: boolean;
}

// Module-level cache so all Logo instances share fetched settings instantly
let cachedLogoUrl: string | null = null;
let cachedSiteName: string | null = null;
let isFetchingSettings = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function Logo({
  className = '',
  logoUrl: propLogoUrl,
  siteName: propSiteName,
  imgClassName = '',
}: LogoProps) {
  const [globalLogoUrl, setGlobalLogoUrl] = useState<string | null>(cachedLogoUrl);
  const [globalSiteName, setGlobalSiteName] = useState<string | null>(cachedSiteName);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const updateFromCache = () => {
      setGlobalLogoUrl(cachedLogoUrl);
      setGlobalSiteName(cachedSiteName);
    };

    listeners.add(updateFromCache);

    // If logoUrl is not provided as prop and cache is empty, fetch public settings
    if (propLogoUrl === undefined && cachedLogoUrl === null && !isFetchingSettings) {
      isFetchingSettings = true;
      api
        .getPublicSettings()
        .then((res) => {
          if (res?.settings) {
            cachedLogoUrl = res.settings.logoUrl || '';
            cachedSiteName = res.settings.siteName || 'Kairos Addis';
            notifyListeners();
          }
        })
        .catch(() => {
          // Fallback to default
        })
        .finally(() => {
          isFetchingSettings = false;
        });
    }

    // Listen for custom settings update events (e.g. from AdminSettingsView)
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        cachedLogoUrl = customEvent.detail.logoUrl || '';
        cachedSiteName = customEvent.detail.siteName || 'Kairos Addis';
        setImgError(false);
        notifyListeners();
      }
    };

    window.addEventListener('site-settings-updated', handleSettingsUpdated);
    return () => {
      listeners.delete(updateFromCache);
      window.removeEventListener('site-settings-updated', handleSettingsUpdated);
    };
  }, [propLogoUrl]);

  // Determine effective logo URL and site name
  const effectiveLogoUrl =
    propLogoUrl !== undefined ? propLogoUrl : globalLogoUrl;
  const effectiveSiteName =
    propSiteName || globalSiteName || 'Kairos Addis';

  const hasValidLogo = !!effectiveLogoUrl && effectiveLogoUrl.trim().length > 0 && !imgError;

  // When a custom logo is present: completely remove the default arrows and Kairos text,
  // and render ONLY the added brand logo image as shown in Picture 1
  if (hasValidLogo) {
    return (
      <div
        className={`flex items-center select-none ${className}`}
        id="custom-brand-logo"
      >
        <img
          src={effectiveLogoUrl!}
          alt={effectiveSiteName}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`h-8 sm:h-9 w-auto max-h-12 max-w-[220px] object-contain transition-transform hover:scale-[1.02] ${imgClassName}`}
        />
      </div>
    );
  }

  // When there is NO custom logo: use the original logo (Picture 2: double chevron arrows + KAIROS ADDIS text)
  return (
    <div
      className={`flex items-center gap-2.5 select-none ${className}`}
      id="kairos-logo"
    >
      <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
        >
          {/* Stylized double chevron geometric arrows matching Kairos logo in image */}
          <path
            d="M6 7L14 16L6 25"
            stroke="#2563eb"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 7L22 16L14 25"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col tracking-wider font-extrabold leading-none">
        <span className="text-white text-sm font-bold tracking-[0.18em]">
          KAIROS
        </span>
        <span className="text-blue-500 text-[11px] font-semibold tracking-[0.28em] -mt-0.5">
          ADDIS
        </span>
      </div>
    </div>
  );
}
