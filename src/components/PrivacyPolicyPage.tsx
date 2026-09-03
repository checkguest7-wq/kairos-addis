import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Database,
  UserCheck,
  Bell,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Sparkles,
  Server,
  Globe2,
  CheckCircle2,
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void;
  onOpenContact: () => void;
}

export function PrivacyPolicyPage({ onNavigateHome, onOpenContact }: PrivacyPolicyPageProps) {
  const sections = [
    {
      id: 'collection',
      icon: Database,
      title: '1. Information We Collect',
      badge: 'Data Collection',
      content: [
        {
          heading: 'Personal & Contact Information',
          text: 'When you create a customer portal account, book a test drive, request vehicle pricing, or schedule maintenance service, we collect details including your full legal name, email address, telephone number, national ID or passport information (for vehicle registration and customs import paperwork), and residential or business address in Ethiopia.',
        },
        {
          heading: 'Vehicle & Telematics Data',
          text: 'For vehicles serviced under Kairos Addis warranty or inspected at our Bole Wollo Sefer service center, we collect technical diagnostic telemetry, including battery health metrics (State of Health - SOH, State of Charge - SOC), odometer readings, firmware versions, charging cycle logs, and maintenance history.',
        },
        {
          heading: 'Payment & Financial Transaction Records',
          text: 'We record purchase orders, pro-forma invoices, bank wire transfer confirmations, letter of credit (LC) documentation, and warranty policy tier identifiers. We do not store full credit card numbers or private banking credentials directly on our public web servers.',
        },
      ],
    },
    {
      id: 'usage',
      icon: Eye,
      title: '2. How We Use Your Information',
      badge: 'Data Utilization',
      content: [
        {
          heading: 'Fulfilling Vehicle Orders & Delivery',
          text: 'To process vehicle reservations, prepare customs clearance documentation with the Ethiopian Customs Commission, facilitate Road Transport Authority registration, and coordinate handover at our Addis Ababa showroom.',
        },
        {
          heading: 'Warranty Administration & Service Delivery',
          text: 'To validate YouGuard comprehensive warranty coverage, track scheduled EV periodic maintenance (fluids, high-voltage isolations, brake systems, tire rotation), and issue proactive service alerts.',
        },
        {
          heading: 'Customer Communication & Support',
          text: 'To communicate test drive confirmations, order status changes, software updates for vehicle head units, recall notifications, and answer support inquiries via the customer portal or verified messaging channels.',
        },
      ],
    },
    {
      id: 'storage',
      icon: Server,
      title: '3. Data Storage, Security & Retention',
      badge: 'Security & Encryption',
      content: [
        {
          heading: 'Enterprise-Grade Encryption',
          text: 'All web traffic and customer portal interactions are encrypted in transit using industry-standard TLS 1.3 encryption. Passwords and sensitive authentication tokens are hashed using bcrypt cryptographic hashing algorithms.',
        },
        {
          heading: 'Access Control & Separation',
          text: 'Access to customer data is strictly restricted to authorized Kairos Addis technical personnel and verified customer accounts through multi-layered authorization barriers.',
        },
        {
          heading: 'Data Retention Guidelines',
          text: 'We retain vehicle ownership and warranty records for the full active duration of the vehicle warranty (up to 8 years / 160,000 km) and as required by Ethiopian commercial and fiscal compliance regulations.',
        },
      ],
    },
    {
      id: 'sharing',
      icon: Globe2,
      title: '4. Third-Party Sharing & Disclosure',
      badge: 'Data Sharing',
      content: [
        {
          heading: 'Authorized Warranty Providers',
          text: 'We share necessary vehicle VIN and service history with YouGuard Warranty Services solely to validate claims and issue official warranty certificate cards.',
        },
        {
          heading: 'Government & Regulatory Authorities',
          text: 'We may disclose vehicle import records and ownership details to the Ethiopian Federal Transport Authority and Ethiopian Customs Commission when strictly mandated by legal processes.',
        },
        {
          heading: 'No Commercial Selling of Data',
          text: 'Kairos Addis does NOT sell, rent, monetize, or trade your personal information to third-party advertisers, data brokers, or marketing networks.',
        },
      ],
    },
    {
      id: 'rights',
      icon: UserCheck,
      title: '5. Your Rights as a Customer',
      badge: 'Customer Control',
      content: [
        {
          heading: 'Access & Portability',
          text: 'You have the right to access your customer profile, view all registered vehicles, download invoices, and inspect test-drive records at any time directly through the Kairos Addis Client Portal.',
        },
        {
          heading: 'Correction & Updates',
          text: 'You may update your phone number, email address, or contact details directly in your portal profile settings or by contacting our customer care department.',
        },
        {
          heading: 'Account Deletion & Data Purge',
          text: 'You may request the deletion of your online portal account by contacting privacy@kairosaddis.com, subject to legal record retention requirements for active vehicle titles and warranties.',
        },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Glow */}
      <div className="fixed top-20 left-1/4 w-[600px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <button
            onClick={onNavigateHome}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-medium">Privacy Policy</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="w-4 h-4" />
            CONFIDENTIALITY & TRUST
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            At Kairos Addis, we are committed to safeguarding your personal data, vehicle telemetry, and transaction confidentiality with the highest standards of digital security.
          </p>
          <div className="mt-4 text-xs text-slate-500 font-mono">
            Last Updated: September 2026 • Effective for all Kairos Addis EV Services & Portal Users
          </div>
        </div>

        {/* Quick Summary Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">256-Bit Protection</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customer credentials and portal sessions are protected by modern cryptographic hashing and encrypted data transit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Zero Data Resale</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never sell, monetize, or disclose your private customer records to third-party marketing networks or data brokers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Full Transparency</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access your registered vehicles, test drive history, warranty status, and service records in real time through our portal.
            </p>
          </div>
        </div>

        {/* Detailed Sections List */}
        <div className="space-y-8">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.id}
                id={sec.id}
                className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl transition-all hover:border-slate-700/80"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                      {sec.badge}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {sec.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-5">
                  {sec.content.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-800/80">
                      <h3 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        {item.heading}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact & DPO Section */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900/80 border border-cyan-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
              QUESTIONS OR DATA INQUIRIES?
            </span>
            <h2 className="text-xl font-bold text-white mt-1 mb-2">
              Kairos Addis Data Privacy & Compliance Office
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              For any questions regarding your personal information, data rights, or vehicle telematics records, reach out directly to our compliance team.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                privacy@kairosaddis.com
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                +251 953 991 901
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Bole Wollo Sefer, Addis Ababa
              </span>
            </div>
          </div>

          <button
            onClick={onOpenContact}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0 cursor-pointer"
          >
            CONTACT PRIVACY TEAM
          </button>
        </div>

      </div>
    </div>
  );
}
