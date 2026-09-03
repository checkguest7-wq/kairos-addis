import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Image as ImageIcon,
  MapPin,
  Share2,
  Plus,
  Trash2,
  Lock,
  ShieldCheck,
  Globe,
  Eye,
  EyeOff,
  KeyRound,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ImageLibraryModal } from './ImageLibraryModal';

export const AdminSettingsView: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Showroom Contacts State Helpers
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState('Instagram');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Image Library Picker State
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'logo' | 'favicon' | 'showroom'>('logo');

  // Account & Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetSettings();
      const s = res.settings;
      // Ensure array fallbacks
      if (!s.phones || !s.phones.length) s.phones = [s.phone || '+251 953 991 901', '+251 911 234 567'];
      if (!s.emails || !s.emails.length) s.emails = [s.email || 'contact@kairosaddis.com', 'sales@kairosaddis.com'];
      if (!s.socialLinks || !s.socialLinks.length) {
        s.socialLinks = [
          { platform: 'Instagram', url: 'https://instagram.com/kairosaddis' },
          { platform: 'Facebook', url: 'https://facebook.com/kairosaddis' },
          { platform: 'TikTok', url: 'https://tiktok.com/@kairosaddis' },
          { platform: 'YouTube', url: 'https://youtube.com/@kairosaddis' },
          { platform: 'WhatsApp', url: 'https://wa.me/251953991901' },
          { platform: 'Telegram', url: 'https://t.me/kairosaddis' },
          { platform: 'LinkedIn', url: 'https://linkedin.com/company/kairosaddis' },
        ];
      }
      setSettings(s);
      if (user?.email) {
        setNewAdminEmail(user.email);
      }
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to load showroom settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);
    try {
      const res = await api.adminUpdateSettings(settings);
      setSettings(res.settings);
      window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: res.settings }));
      setSettingsSuccess('Showroom branding, contact details, and social links saved successfully.');
      setTimeout(() => setSettingsSuccess(null), 4000);
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to update showroom settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess(null);
    setSecurityError(null);

    if (!currentPassword) {
      setSecurityError('Current administrator password is required to authorize credentials change.');
      return;
    }

    if (newAdminPassword) {
      if (newAdminPassword.length < 8) {
        setSecurityError('New password must contain at least 8 characters.');
        return;
      }
      if (!confirmAdminPassword) {
        setSecurityError('Please confirm your new password.');
        return;
      }
      if (newAdminPassword !== confirmAdminPassword) {
        setSecurityError('New password and confirmation password do not match.');
        return;
      }
    }

    setIsSavingSecurity(true);
    try {
      const res = await api.adminUpdateAccountSecurity({
        currentPassword,
        newEmail: newAdminEmail.trim() || undefined,
        newPassword: newAdminPassword || undefined,
        confirmPassword: confirmAdminPassword || undefined,
      });
      setSecuritySuccess(res.message || 'Administrator account credentials updated successfully.');
      setCurrentPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update administrator credentials.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // Helper functions for dynamic lists
  const handleAddPhone = () => {
    if (!newPhone.trim() || !settings) return;
    const updated = [...(settings.phones || []), newPhone.trim()];
    setSettings({ ...settings, phones: updated, phone: updated[0] });
    setNewPhone('');
  };

  const handleRemovePhone = (index: number) => {
    if (!settings || !settings.phones) return;
    const updated = settings.phones.filter((_, i) => i !== index);
    setSettings({ ...settings, phones: updated, phone: updated[0] || '' });
  };

  const handleAddEmail = () => {
    if (!newEmail.trim() || !settings) return;
    const updated = [...(settings.emails || []), newEmail.trim()];
    setSettings({ ...settings, emails: updated, email: updated[0] });
    setNewEmail('');
  };

  const handleRemoveEmail = (index: number) => {
    if (!settings || !settings.emails) return;
    const updated = settings.emails.filter((_, i) => i !== index);
    setSettings({ ...settings, emails: updated, email: updated[0] || '' });
  };

  const handleAddSocial = () => {
    if (!newSocialUrl.trim() || !settings) return;
    const updated = [
      ...(settings.socialLinks || []),
      { platform: newSocialPlatform, url: newSocialUrl.trim(), label: `${newSocialPlatform} Channel` },
    ];
    setSettings({ ...settings, socialLinks: updated });
    setNewSocialUrl('');
  };

  const handleRemoveSocial = (index: number) => {
    if (!settings || !settings.socialLinks) return;
    const updated = settings.socialLinks.filter((_, i) => i !== index);
    setSettings({ ...settings, socialLinks: updated });
  };

  const handleOpenImagePicker = (target: 'logo' | 'favicon' | 'showroom') => {
    setImagePickerTarget(target);
    setIsImagePickerOpen(true);
  };

  const handleSelectAsset = (url: string) => {
    if (!settings) return;
    if (imagePickerTarget === 'logo') {
      setSettings({ ...settings, logoUrl: url });
    } else if (imagePickerTarget === 'favicon') {
      setSettings({ ...settings, faviconUrl: url });
    } else if (imagePickerTarget === 'showroom') {
      setSettings({ ...settings, aboutShowroomImage: url });
    }
  };

  if (isLoading || !settings) {
    return <div className="py-16 text-center text-slate-400 text-xs">Loading system settings...</div>;
  }

  // Password matching helper
  const isPasswordMismatch = newAdminPassword && confirmAdminPassword && newAdminPassword !== confirmAdminPassword;
  const isPasswordMatch = newAdminPassword && confirmAdminPassword && newAdminPassword === confirmAdminPassword;

  return (
    <div id="admin-settings-view" className="space-y-8 animate-fadeIn max-w-5xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-400" />
          Showroom & System Settings
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Configure branding assets, showroom contact channels, social media links, interactive map embed, and administrative security credentials.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SHOWROOM INFORMATION & BRANDING                                */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Alerts for General Settings */}
        {settingsSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{settingsSuccess}</span>
          </div>
        )}

        {settingsError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        {/* 1. Branding Section (Logo & Favicon) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Branding & Visual Identity
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Web & Mobile Assets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo URL & Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold block">Brand Logo Image</label>
                <button
                  type="button"
                  onClick={() => handleOpenImagePicker('logo')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Choose from Library</span>
                </button>
              </div>
              <input
                type="text"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="https://... or /logo.png or select from library"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex-1">
                  <p className="font-semibold text-slate-200">Logo Live Preview</p>
                  <p className="text-[10px]">Displayed across header navigation, customer portal, and invoices</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenImagePicker('logo')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] transition-colors cursor-pointer shrink-0"
                >
                  Browse Library
                </button>
              </div>
            </div>

            {/* Favicon URL & Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold block">Favicon URL / Icon Asset</label>
                <button
                  type="button"
                  onClick={() => handleOpenImagePicker('favicon')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Choose from Library</span>
                </button>
              </div>
              <input
                type="text"
                value={settings.faviconUrl || ''}
                onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                placeholder="/favicon.ico or /icon.png or select from library"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {settings.faviconUrl ? (
                    <img
                      src={settings.faviconUrl}
                      alt="Favicon Preview"
                      className="w-6 h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Globe className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex-1">
                  <p className="font-semibold text-slate-200">Favicon Live Preview</p>
                  <p className="text-[10px]">Browser tab mark and bookmark shortcut icon</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenImagePicker('favicon')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] transition-colors cursor-pointer shrink-0"
                >
                  Browse Library
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Showroom & Service Center Physical Addresses & Map Embed */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Physical Locations & Interactive Map
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Addis Ababa, Ethiopia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Showroom Address</label>
              <input
                type="text"
                value={settings.showroomAddress}
                onChange={(e) => setSettings({ ...settings, showroomAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">EV Service Center Location</label>
              <input
                type="text"
                value={settings.serviceCenterAddress || ''}
                onChange={(e) => setSettings({ ...settings, serviceCenterAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Operating Hours</label>
              <input
                type="text"
                value={settings.operatingHours || ''}
                onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Map Embed URL */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-slate-300 font-semibold block">Google Maps Embed URL (iframe source)</label>
              <input
                type="text"
                value={settings.mapEmbedUrl || ''}
                onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              {settings.mapEmbedUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-48 relative">
                  <iframe
                    src={settings.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title="Showroom Location Map"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Multi-entry Contact Hotlines & Emails */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4" /> Multi-Line Contacts & Emails
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Sales & Concierge Hotlines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Numbers List */}
            <div className="space-y-3">
              <label className="text-slate-300 font-semibold block">Showroom Phone Numbers</label>
              <div className="space-y-2">
                {settings.phones?.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => {
                        const updated = [...(settings.phones || [])];
                        updated[idx] = e.target.value;
                        setSettings({ ...settings, phones: updated, phone: updated[0] });
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(idx)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove phone number"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="e.g. +251 953 991 901"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddPhone}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Phone
                </button>
              </div>
            </div>

            {/* Email Addresses List */}
            <div className="space-y-3">
              <label className="text-slate-300 font-semibold block">Showroom Email Addresses</label>
              <div className="space-y-2">
                {settings.emails?.map((em, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="email"
                      value={em}
                      onChange={(e) => {
                        const updated = [...(settings.emails || [])];
                        updated[idx] = e.target.value;
                        setSettings({ ...settings, emails: updated, email: updated[0] });
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(idx)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove email"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  placeholder="e.g. sales@kairosaddis.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Social Media Links */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Social Media & Official Channels
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Instagram, Facebook, TikTok, YouTube, WhatsApp</span>
          </div>

          <div className="space-y-3">
            {settings.socialLinks?.map((soc, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <select
                  value={soc.platform}
                  onChange={(e) => {
                    const updated = [...(settings.socialLinks || [])];
                    updated[idx] = { ...updated[idx], platform: e.target.value, label: `${e.target.value} Channel` };
                    setSettings({ ...settings, socialLinks: updated });
                  }}
                  className="w-full sm:w-40 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-semibold text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                </select>

                <input
                  type="text"
                  value={soc.url}
                  onChange={(e) => {
                    const updated = [...(settings.socialLinks || [])];
                    updated[idx] = { ...updated[idx], url: e.target.value };
                    setSettings({ ...settings, socialLinks: updated });
                  }}
                  placeholder="https://..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveSocial(idx)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors self-end sm:self-center cursor-pointer"
                  title="Remove social link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-slate-800">
              <select
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value)}
                className="w-full sm:w-40 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="X (Twitter)">X (Twitter)</option>
              </select>

              <input
                type="text"
                placeholder="e.g. https://instagram.com/kairosaddis"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />

              <button
                type="button"
                onClick={handleAddSocial}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Channel
              </button>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end pt-2">
          <button
            id="admin-save-settings-btn"
            type="submit"
            disabled={isSavingSettings}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSavingSettings ? 'Saving Settings...' : 'Save Showroom Settings & Branding'}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SECTION 2: ADMIN ACCOUNT & SECURITY (CREDENTIALS)                         */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Administrator Account & Security
              </h2>
              <p className="text-[11px] text-slate-400">
                Update administrative login credentials. Changing password requires current master password authorization.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
            ROLE: MASTER ADMIN
          </span>
        </div>

        {/* Security Alerts */}
        {securitySuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{securitySuccess}</span>
          </div>
        )}

        {securityError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{securityError}</span>
          </div>
        )}

        <form onSubmit={handleSaveSecurity} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Password (Required) */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                Current Administrator Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to authorize changes"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin Email */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-300 font-semibold block">Administrator Email Address</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@kairosaddis.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                New Password (Leave blank to keep unchanged)
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block flex items-center justify-between">
                <span>Confirm New Password</span>
                {isPasswordMatch && (
                  <span className="text-emerald-400 text-[11px] font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </span>
                )}
                {isPasswordMismatch && (
                  <span className="text-rose-400 text-[11px] font-normal flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Passwords do not match
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className={`w-full bg-slate-950 border rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none font-mono text-xs ${
                    isPasswordMismatch
                      ? 'border-rose-500 focus:border-rose-400'
                      : isPasswordMatch
                      ? 'border-emerald-500 focus:border-emerald-400'
                      : 'border-slate-700 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              id="admin-save-security-btn"
              type="submit"
              disabled={isSavingSecurity}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSavingSecurity ? 'Verifying & Updating...' : 'Update Administrative Credentials'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Library Modal for Logo / Favicon */}
      <ImageLibraryModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={handleSelectAsset}
        title={
          imagePickerTarget === 'logo'
            ? 'Select Brand Logo Asset'
            : imagePickerTarget === 'favicon'
            ? 'Select Favicon Asset'
            : 'Select Showroom Asset'
        }
        targetType={imagePickerTarget}
        initialSelectedUrl={
          imagePickerTarget === 'logo'
            ? settings.logoUrl || ''
            : imagePickerTarget === 'favicon'
            ? settings.faviconUrl || ''
            : settings.aboutShowroomImage || ''
        }
      />
    </div>
  );
};
