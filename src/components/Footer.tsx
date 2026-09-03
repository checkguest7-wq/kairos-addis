import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Send,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { Logo } from './Logo';
import { api } from '../lib/api';
import { SiteSettings } from '../types';

interface FooterProps {
  onSelectCarByName: (name: string) => void;
  onOpenTestDrive: () => void;
  onNavigate?: (page: 'home' | 'vehicles' | 'warranty' | 'about' | 'contact' | 'privacy' | 'terms', sectionId?: string) => void;
}

export function Footer({ onSelectCarByName, onOpenTestDrive, onNavigate }: FooterProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    api.getPublicSettings()
      .then((res) => {
        if (res.settings) {
          setSettings(res.settings);
        }
      })
      .catch(() => {
        // Use default fallback
      });
  }, []);

  const quickLinks = [
    { name: 'Home', page: 'home' as const, sectionId: 'home' },
    { name: 'Vehicles', page: 'vehicles' as const, sectionId: 'vehicles' },
    { name: 'Warranty & Service', page: 'warranty' as const, sectionId: 'warranty' },
    { name: 'About Us', page: 'about' as const, sectionId: 'about' },
    { name: 'Contact & Showroom', page: 'contact' as const, sectionId: 'contact' },
  ];

  const handleLinkClick = (page: 'home' | 'vehicles' | 'warranty' | 'about' | 'contact' | 'privacy' | 'terms', sectionId?: string) => {
    if (onNavigate) {
      onNavigate(page, sectionId);
    }
  };

  const vehicleLinks = [
    'BYD Tang L',
    'Geely Galaxy E5',
    'BYD Song Plus',
    'Toyota bZ3X',
    'Geely Starwish',
  ];

  const phoneDisplay = settings?.phones?.[0] || settings?.phone || '+251 953 991 901';
  const emailDisplay = settings?.emails?.[0] || settings?.email || 'info@kairosaddis.com';
  const addressDisplay = settings?.showroomAddress || 'Bole Wollo Sefer, infront of Ibex Hotel, Addis Ababa, Ethiopia';
  const hoursDisplay = settings?.operatingHours || 'Mon–Fri: 9:00 AM – 6:00 PM | Sat: 10:00 AM – 4:00 PM';

  const defaultSocials = [
    { platform: 'Instagram', url: 'https://instagram.com/kairosaddis' },
    { platform: 'Facebook', url: 'https://facebook.com/kairosaddis' },
    { platform: 'TikTok', url: 'https://tiktok.com/@kairosaddis' },
    { platform: 'YouTube', url: 'https://youtube.com/@kairosaddis' },
    { platform: 'WhatsApp', url: 'https://wa.me/251953991901' },
    { platform: 'Telegram', url: 'https://t.me/kairosaddis' },
  ];

  const activeSocials = settings?.socialLinks && settings.socialLinks.length > 0
    ? settings.socialLinks
    : defaultSocials;

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (p.includes('whatsapp')) return <MessageSquare className="w-4 h-4" />;
    if (p.includes('telegram')) return <Send className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4" />;
    if (p.includes('tiktok')) {
      return (
        <span className="font-bold text-[11px] leading-none tracking-tighter">TK</span>
      );
    }
    return <Share2 className="w-4 h-4" />;
  };

  return (
    <footer id="contact" className="bg-[#04060a] border-t border-slate-900/90 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          
          {/* Column 1: Brand Info & Social Media */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <a href="#home" className="mb-4 inline-block">
                <Logo />
              </a>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
                Premium electric vehicles designed for Ethiopian roads and a sustainable future. Authorized importer & VIP EV service center.
              </p>
            </div>

            {/* Social Media Links */}
            <div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Official Channels
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activeSocials.map((soc, idx) => (
                  <a
                    key={idx}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={soc.platform}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all hover:scale-105"
                  >
                    {renderSocialIcon(soc.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white text-xs font-bold tracking-[0.18em] uppercase mb-4">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.page, link.sectionId)}
                    className="hover:text-cyan-400 transition-colors duration-200 text-left cursor-pointer bg-transparent border-0 p-0"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Vehicles */}
          <div className="lg:col-span-3">
            <h4 className="text-white text-xs font-bold tracking-[0.18em] uppercase mb-4">
              OUR VEHICLES
            </h4>
            <ul className="space-y-2.5">
              {vehicleLinks.map((carName) => (
                <li key={carName}>
                  <button
                    onClick={() => {
                      onSelectCarByName(carName);
                      const el = document.getElementById('vehicles');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-cyan-400 transition-colors duration-200 text-left cursor-pointer"
                  >
                    {carName}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us & Working Hours */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            <div>
              <h4 className="text-white text-xs font-bold tracking-[0.18em] uppercase mb-4">
                CONTACT US
              </h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <a href={`tel:${phoneDisplay.replace(/\s+/g, '')}`} className="text-slate-300 hover:text-white font-medium">
                    {phoneDisplay}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <a href={`mailto:${emailDisplay}`} className="text-slate-300 hover:text-white transition-colors">
                    {emailDisplay}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-snug">
                    {addressDisplay}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-[11px] font-bold tracking-[0.18em] uppercase mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                SHOWROOM HOURS
              </h4>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>{hoursDisplay}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Divider & Copyright */}
        <div className="pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-[11px] text-slate-500">
          <div className="text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} Kairos Addis. All rights reserved.</span>
          </div>

          <div className="flex items-center justify-center">
            <a
              href="https://ynazdigitisers.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#060a14] border border-slate-700/70 hover:border-blue-500/70 text-xs transition-all duration-200 group shadow-sm hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#4182ec] shadow-[0_0_6px_rgba(65,130,236,0.9)] shrink-0" />
              <span className="text-slate-400 font-normal">
                Made by <span className="text-slate-200 group-hover:text-white font-bold transition-colors">YNAZ Digitisers</span>
              </span>
            </a>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-6">
            <button id="footer-link-privacy" onClick={() => handleLinkClick('privacy')} className="hover:text-cyan-400 transition-colors cursor-pointer">Privacy Policy</button>
            <button id="footer-link-terms" onClick={() => handleLinkClick('terms')} className="hover:text-cyan-400 transition-colors cursor-pointer">Terms of Service</button>
            <button id="footer-link-warranty" onClick={() => handleLinkClick('warranty', 'whats-covered')} className="hover:text-cyan-400 transition-colors cursor-pointer">Warranty Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
