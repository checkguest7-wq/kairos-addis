import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  ShieldCheck,
  UserCheck,
  Car,
  CreditCard,
  Wrench,
  AlertTriangle,
  Scale,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface TermsOfServicePageProps {
  onNavigateHome: () => void;
  onOpenContact: () => void;
}

export function TermsOfServicePage({ onNavigateHome, onOpenContact }: TermsOfServicePageProps) {
  const sections = [
    {
      id: 'acceptance',
      icon: Scale,
      title: '1. Acceptance of Terms',
      badge: 'Agreement Basis',
      content: [
        {
          heading: 'Binding Legal Agreement',
          text: 'By accessing or using the Kairos Addis website, scheduling test drives, creating a customer portal account, or ordering electric vehicles and related charging accessories from Kairos Addis Automotive PLC, you agree to be bound by these Terms of Service.',
        },
        {
          heading: 'Modifications & Updates',
          text: 'Kairos Addis reserves the right to amend these Terms at any time. Any changes will be published on this page with an updated revision date. Continued engagement with our services following notice of changes constitutes acceptance of the modified Terms.',
        },
      ],
    },
    {
      id: 'accounts',
      icon: UserCheck,
      title: '2. Client Portal & Account Security',
      badge: 'User Accounts',
      content: [
        {
          heading: 'Account Responsibility',
          text: 'You are responsible for maintaining the confidentiality of your customer portal credentials, password, and session tokens. You agree to notify Kairos Addis immediately upon becoming aware of any unauthorized access to your account.',
        },
        {
          heading: 'Accurate Information',
          text: 'You agree to provide true, accurate, and current information during registration and vehicle order placement. Providing fraudulent identity or counterfeit paperwork is grounds for immediate account suspension and order termination.',
        },
      ],
    },
    {
      id: 'test-drives',
      icon: Car,
      title: '3. Test Drive Eligibility & Conditions',
      badge: 'Test Drive Rules',
      content: [
        {
          heading: 'Driver License Requirements',
          text: 'To participate in a test drive of any Kairos Addis vehicle (such as the BYD Tang L, Geely Galaxy E5, or Toyota bZ3X), participants must hold a valid, non-expired Ethiopian Driver\'s License (Grade 3/Automobile or equivalent international permit) and present original physical identification prior to departure.',
        },
        {
          heading: 'Accompaniment & Safety Protocols',
          text: 'All test drives are accompanied by an authorized Kairos Addis Product Specialist. Drivers must strictly adhere to traffic laws of the Federal Democratic Republic of Ethiopia and follow the designated test route around Bole / Kazanchis.',
        },
        {
          heading: 'Zero Impairment Policy',
          text: 'Kairos Addis strictly prohibits driving under the influence of alcohol, medications affecting alertness, or illicit substances. Staff reserve the absolute right to cancel any scheduled drive if safety is compromised.',
        },
      ],
    },
    {
      id: 'orders',
      icon: CreditCard,
      title: '4. Vehicle Orders, Pricing & Delivery',
      badge: 'Orders & Payments',
      content: [
        {
          heading: 'Vehicle Reservations & Quotes',
          text: 'All pro-forma quotes issued by Kairos Addis are valid for the specific timeframe indicated on the invoice. Official orders become binding upon payment of the agreed reservation deposit or issuance of an approved Letter of Credit (LC) / Bank Guarantee.',
        },
        {
          heading: 'Taxes, Customs & Registration',
          text: 'Unless explicitly stated otherwise in a formal corporate sales agreement, prices reflect vehicle cost and standard customs clearing provisions in accordance with current Ethiopian EV import duty policies (zero customs duty and reduced excise taxes for pure electric vehicles).',
        },
        {
          heading: 'Handover & Inspection',
          text: 'Vehicle delivery takes place at our Bole Wollo Sefer showroom or authorized delivery center upon completion of pre-delivery inspection (PDI), roadworthiness certification, and settlement of outstanding balances.',
        },
      ],
    },
    {
      id: 'warranty',
      icon: Wrench,
      title: '5. Warranty Coverage & Maintenance Terms',
      badge: 'Warranty Guidelines',
      content: [
        {
          heading: 'YouGuard Comprehensive Warranty',
          text: 'Eligible new electric vehicles sold by Kairos Addis include comprehensive warranty backing: 8 Years / 160,000 km for high-voltage battery systems and 5 Years / 100,000 km for electric drivetrains and core vehicle systems.',
        },
        {
          heading: 'Maintenance Compliance',
          text: 'To maintain full warranty validity, scheduled periodic EV inspections and software updates must be performed exclusively at authorized Kairos Addis service facilities or certified YouGuard partner workshops.',
        },
        {
          heading: 'Warranty Exclusions',
          text: 'Warranty coverage does not apply to damage caused by unauthorized third-party high-voltage modifications, improper off-road racing, submerged water ingress exceeding manufacturer ratings, or using non-compatible ungrounded home charging cables.',
        },
      ],
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: '6. Limitation of Liability',
      badge: 'Legal Boundaries',
      content: [
        {
          heading: 'Disclaimer of Indirect Damages',
          text: 'To the maximum extent permitted by applicable Ethiopian commercial law, Kairos Addis shall not be liable for any indirect, incidental, special, or consequential damages resulting from website downtime, delivery delays caused by global shipping disruptions, or third-party telematics interruptions.',
        },
        {
          heading: 'Governing Law & Jurisdiction',
          text: 'These Terms of Service shall be governed by and construed in accordance with the laws of the Federal Democratic Republic of Ethiopia. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Addis Ababa.',
        },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Glow */}
      <div className="fixed top-20 right-1/4 w-[600px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

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
          <span className="text-cyan-400 font-medium">Terms of Service</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <Scale className="w-4 h-4" />
            TERMS & CONDITIONS
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Please read these terms and conditions carefully before using our digital services, scheduling test drives, or purchasing electric vehicles from Kairos Addis.
          </p>
          <div className="mt-4 text-xs text-slate-500 font-mono">
            Effective Date: September 2026 • Kairos Addis Automotive PLC
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Car className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Verified Test Drives</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Valid driver license verification and safety standards apply to all showroom test drive sessions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">YouGuard Warranty</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Up to 8-year / 160,000 km battery coverage with certified periodic EV diagnostics in Addis Ababa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Ethiopian Law</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fully compliant with Federal Democratic Republic of Ethiopia automotive and commerce regulations.
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
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
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
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
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

        {/* Legal Contact Card */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-cyan-950/40 border border-blue-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest font-mono">
              LEGAL & CORPORATE AFFAIRS
            </span>
            <h2 className="text-xl font-bold text-white mt-1 mb-2">
              Have Questions About Our Terms?
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              For legal inquiries, commercial fleet contracts, or warranty dispute resolution, contact the Kairos Addis legal department.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                legal@kairosaddis.com
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                +251 953 991 901
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Bole Wollo Sefer, Addis Ababa
              </span>
            </div>
          </div>

          <button
            onClick={onOpenContact}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] shrink-0 cursor-pointer"
          >
            CONTACT LEGAL TEAM
          </button>
        </div>

      </div>
    </div>
  );
}
