import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Calendar,
  Car,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Navigation,
  ExternalLink,
  Users,
  Eye,
  Check,
  Share2,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { VEHICLES } from '../data/vehicles';
import { api } from '../lib/api';
import { SiteSettings } from '../types';

interface ContactPageProps {
  onExploreVehicles: () => void;
  onBookTestDrive: (carId?: string) => void;
}

export function ContactPage({ onExploreVehicles, onBookTestDrive }: ContactPageProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Schedule a Test Drive');
  const [vehicleInterest, setVehicleInterest] = useState('BYD Tang L (7-Seater AWD)');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    api.getPublicSettings()
      .then((res) => {
        if (res.settings) {
          setSettings(res.settings);
        }
      })
      .catch((err) => {
        console.error('Failed to load settings on contact page', err);
      });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const phoneDisplay = settings?.phones?.[0] || settings?.phone || '+251 953 991 901';
  const emailDisplay = settings?.emails?.[0] || settings?.email || 'info@kairosaddis.com';
  const showroomAddr = settings?.showroomAddress || 'Bole Wollo Sefer, infront of Ibex Hotel, Addis Ababa, Ethiopia';
  const hoursDisplay = settings?.operatingHours || 'Mon–Fri: 9:00 AM – 6:00 PM | Sat: 10:00 AM – 4:00 PM';
  const mapUrl = settings?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3222.439245930706!2d38.772174799999995!3d8.988942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xaa03e0056bec243f%3A0x958bd724361f2e6!2sKairos%20Addis%20Auto%20Dealership!5e1!3m2!1sen!2set!4v1788265138476!5m2!1sen!2set';

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

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneDisplay);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-5 h-5" />;
    if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
    if (p.includes('youtube')) return <Youtube className="w-5 h-5" />;
    if (p.includes('whatsapp')) return <MessageSquare className="w-5 h-5" />;
    if (p.includes('telegram')) return <Send className="w-5 h-5" />;
    if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-5 h-5" />;
    if (p.includes('tiktok')) {
      return <span className="font-extrabold text-sm tracking-tighter">TK</span>;
    }
    return <Share2 className="w-5 h-5" />;
  };

  return (
    <div className="bg-[#050811] min-h-screen text-slate-100 selection:bg-blue-600 selection:text-white pb-20">
      
      {/* ========================================================
          1. HERO BANNER
          ======================================================== */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[#050811] -z-10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-cyan-400 mb-6 tracking-[0.25em] uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>KAIROS ADDIS SHOWROOM & VIP SERVICE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight uppercase max-w-4xl mx-auto leading-none mb-6"
          >
            CONNECT WITH <span className="text-blue-500">KAIROS ADDIS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Schedule a private VIP test drive, speak with certified EV specialists, or visit our flagship showroom in Bole Wollo Sefer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full YouGuard Warranty Backing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <Car className="w-4 h-4 text-cyan-400" />
              <span>Complimentary VIP Test Drives</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Immediate Showroom Delivery</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================
          2. CONTACT INFO CARDS (4 Columns)
          ======================================================== */}
      <section className="py-16 md:py-24 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Location */}
            <a
              href="https://maps.app.goo.gl/Hfvsn5noCGrtHra86"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 hover:border-blue-500/70 p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-blue-600/25 group-hover:text-white transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase mb-1">
                  FLAGSHIP SHOWROOM
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Bole Wollo Sefer
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {showroomAddr}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-400 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400">
                  <Compass className="w-3.5 h-3.5 text-blue-500" />
                  <span>Showroom Floor</span>
                </span>
                <span className="font-semibold group-hover:underline flex items-center gap-1">
                  <span>View Map</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>

            {/* 2. Phone */}
            <div className="group rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 hover:border-blue-500/70 p-6 transition-all duration-300 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-blue-600/25 group-hover:text-white transition-colors">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase mb-1">
                  PHONE & WHATSAPP
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">
                  {phoneDisplay}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Call or WhatsApp our EV specialist team for vehicle consultations.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <a
                  href={`tel:${phoneDisplay.replace(/\s+/g, '')}`}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Call Now &rarr;
                </a>
                <button
                  onClick={handleCopyPhone}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedPhone ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* 3. Email */}
            <div className="group rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 hover:border-blue-500/70 p-6 transition-all duration-300 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-blue-600/25 group-hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase mb-1">
                  EMAIL INQUIRIES
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono break-all">
                  {emailDisplay}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Official inquiries, corporate fleet purchases, and partnership proposals.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px]">
                <a
                  href={`mailto:${emailDisplay}`}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Send Email &rarr;
                </a>
              </div>
            </div>

            {/* 4. Showroom Hours */}
            <div className="group rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 hover:border-blue-500/70 p-6 transition-all duration-300 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-blue-600/25 group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase mb-1">
                  SHOWROOM HOURS
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  {hoursDisplay}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-1">
                  Sunday by prior VIP appointment.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Walk-ins & Appointments Welcome</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          3. SOCIAL MEDIA & OFFICIAL DIGITAL CHANNELS
          ======================================================== */}
      <section className="py-12 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#080e1a] border border-slate-800 p-6 rounded-3xl">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                <Share2 className="w-3.5 h-3.5" />
                <span>OFFICIAL DIGITAL CHANNELS</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Follow Kairos Addis Across Social Platforms
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stay updated with EV arrivals, test-drive reviews, charging insights, and community events.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeSocials.map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/70 hover:bg-slate-800/80 text-slate-200 hover:text-cyan-300 font-semibold text-xs transition-all shadow-md"
                >
                  <div className="text-cyan-400">{renderSocialIcon(soc.platform)}</div>
                  <span>{soc.platform}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. QUICK CONTACT (Two Large Buttons)
          ======================================================== */}
      <section className="py-12 border-b border-slate-800/80 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Instant Direct Lines • Addis Ababa
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp Us */}
            <a
              href="https://wa.me/251953991901"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border border-emerald-500/50 hover:border-emerald-400 text-white font-bold text-base transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Instant Chat</div>
                <div className="text-base font-extrabold">WhatsApp Us ({phoneDisplay})</div>
              </div>
            </a>

            {/* Call Us */}
            <a
              href={`tel:${phoneDisplay.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-blue-900/60 to-blue-950/80 border border-blue-500/50 hover:border-cyan-400 text-white font-bold text-base transition-all duration-300 shadow-[0_0_25px_rgba(37,99,235,0.25)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs text-cyan-300 uppercase tracking-wider font-semibold">Direct Telephone</div>
                <div className="text-base font-extrabold">Call Us ({phoneDisplay})</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. CONTACT FORM & AT OUR SHOWROOM
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Form (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>BOOKINGS & INQUIRIES</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
                    SEND A <span className="text-blue-500">MESSAGE</span>
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                    Our team responds within 2 hours during normal showroom hours.
                  </p>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl bg-[#080f1d] border border-emerald-500/40 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase">Inquiry Received!</h3>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
                      Thank you, <span className="text-white font-semibold">{fullName}</span>. A Kairos Addis EV specialist will contact you shortly at <span className="text-cyan-400">{phone || email}</span>.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      Send Another Request
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    
                    {/* Full Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Abebe Bikila"
                          className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+251 9..."
                          className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Email & Inquiry Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="abebe@example.com"
                          className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Inquiry Type
                        </label>
                        <select
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="Schedule a Test Drive">Schedule a Test Drive</option>
                          <option value="Vehicle Purchase Inquiry">Vehicle Purchase Inquiry</option>
                          <option value="YouGuard Warranty Question">YouGuard Warranty Question</option>
                          <option value="Fleet / Corporate Order">Fleet / Corporate Order</option>
                          <option value="General Question">General Question</option>
                        </select>
                      </div>
                    </div>

                    {/* Vehicle Interest & Preferred Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Vehicle Interest *
                        </label>
                        <select
                          value={vehicleInterest}
                          onChange={(e) => setVehicleInterest(e.target.value)}
                          className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {VEHICLES.map((v) => (
                            <option key={v.id} value={`${v.name} (${v.brand})`}>
                              {v.name} ({v.brand} - {v.seats} Seats)
                            </option>
                          ))}
                          <option value="Multiple Vehicles / Not Sure">Multiple Vehicles / Not Sure</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                        Message / Custom Requirements
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Let us know your preferred drive timing, financing questions, or specific features..."
                        className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                      />
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        id="btn-submit-contact-form"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? 'Sending Request...' : 'Send Message'}</span>
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </div>

            {/* Right Column: At Our Showroom (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase mb-4">
                  <Sparkles className="w-3 h-3" />
                  <span>EXPERIENCE KAIROS ADDIS</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight mb-4">
                  AT OUR <span className="text-blue-500">SHOWROOM</span>
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                  Experience true electric luxury in a relaxed, state-of-the-art environment right in Bole.
                </p>

                {/* 3 Simple Features */}
                <div className="space-y-4">
                  
                  {/* Feature 1 */}
                  <div className="p-4 rounded-xl bg-[#080d17] border border-slate-800 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-600/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                        View All Vehicle Models
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Inspect BYD Tang L, Geely Galaxy E5, Toyota bZ3X, and more in pristine showroom condition.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-4 rounded-xl bg-[#080d17] border border-slate-800 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-600/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                        Book Test Drives
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Experience instant electric torque, regenerative braking, and whisper-quiet cabin acoustics.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-4 rounded-xl bg-[#080d17] border border-slate-800 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-600/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                        Speak With EV Experts
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Consult with certified advisors on charging setups, YouGuard warranties, and battery health.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Showroom Building Exterior Visual preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 group shadow-xl">
                <img
                  src={settings?.aboutShowroomImage || "/images/showroom_building_exterior_1788210082036.jpg"}
                  alt="Kairos Addis Showroom Exterior in Bole"
                  referrerPolicy="no-referrer"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                  <span className="font-semibold text-white">Bole Wollo Sefer Showroom</span>
                  <span className="text-cyan-400 font-mono">Addis Ababa</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. SHOWROOM LOCATION (Interactive Google Maps)
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 mb-3 tracking-[0.25em] uppercase">
              <Navigation className="w-3 h-3" />
              <span>MAPS & NAVIGATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
              VISIT OUR <span className="text-blue-500">SHOWROOM</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Located conveniently in the heart of Bole Wollo Sefer, directly in front of Ibex Hotel.
            </p>
          </div>

          <div className="bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
            
            {/* Top location banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#080d17] p-4 rounded-2xl border border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white uppercase">Kairos Addis EV Flagship</div>
                  <div className="text-xs text-slate-400">{showroomAddr}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href="https://maps.app.goo.gl/Hfvsn5noCGrtHra86"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-sm transition-colors tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Interactive Embedded Google Maps iframe */}
            <div className="relative w-full h-80 sm:h-96 md:h-[450px] rounded-2xl overflow-hidden border border-slate-800 bg-[#06090e]">
              <iframe
                title="Kairos Addis Auto Dealership Map"
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              
              {/* Overlay Marker Badge */}
              <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs text-slate-200 shadow-xl pointer-events-none">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  <span>Kairos Addis Showroom</span>
                </div>
                <div className="text-[11px] text-slate-400">Ample parking & high-speed EV chargers on site</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. FINAL CTA
          ======================================================== */}
      <section className="pt-20 md:pt-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0c1629] via-[#09101d] to-[#070b14] border border-slate-800 p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-2xl">
            
            {/* Top Rim Glow */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>READY TO EXPERIENCE EV EXCELLENCE?</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase leading-tight">
                BOOK YOUR <span className="text-blue-500">PRIVATE TEST DRIVE</span> TODAY
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
                Step into the cockpit of Ethiopia’s most advanced electric vehicles. Our consultants are ready to answer any questions.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onBookTestDrive()}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule VIP Test Drive</span>
                </button>

                <button
                  onClick={onExploreVehicles}
                  className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold px-8 py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Car className="w-4 h-4 text-cyan-400" />
                  <span>View Full Inventory</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
