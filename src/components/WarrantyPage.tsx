import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Battery,
  Zap,
  Car,
  Wrench,
  Cpu,
  FileCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Phone,
  MessageSquare,
  Shield,
  Layers,
  ChevronRight,
  Activity,
  History,
  Bell,
  FileText,
  SearchCheck,
  Award
} from 'lucide-react';

interface WarrantyPageProps {
  onScheduleService: () => void;
  onOpenPortal: () => void;
  onOpenContact: (subject?: string) => void;
}

export function WarrantyPage({
  onScheduleService,
  onOpenPortal,
  onOpenContact,
}: WarrantyPageProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const coverageItems = [
    {
      id: 'battery',
      title: 'Battery System',
      duration: '8 years / 160,000 km',
      description: 'Complete battery pack, cells, and thermal management system.',
      icon: Battery,
      highlightColor: 'from-blue-600/20 to-cyan-500/10',
      badge: 'Extended Coverage',
    },
    {
      id: 'drivetrain',
      title: 'Electric Drivetrain',
      duration: '5 years / 100,000 km',
      description: 'Electric motor, inverter, and power electronics.',
      icon: Zap,
      highlightColor: 'from-blue-600/20 to-blue-900/10',
      badge: 'Full Powertrain',
    },
    {
      id: 'body',
      title: 'Vehicle Body',
      duration: '5 years',
      description: 'Structural components, paint, and corrosion protection.',
      icon: Car,
      highlightColor: 'from-blue-600/20 to-cyan-500/10',
      badge: 'Anti-Corrosion',
    },
    {
      id: 'components',
      title: 'General Components',
      duration: '3 years / 60,000 km',
      description: 'Suspension, steering, brakes, and interior components.',
      icon: Wrench,
      highlightColor: 'from-blue-600/20 to-slate-900/10',
      badge: 'Bumper-to-Bumper',
    },
  ];

  const claimsSteps = [
    {
      step: '01',
      title: 'Report Issue',
      description: 'Contact Kairos Addis by phone, WhatsApp, or customer portal.',
      icon: Phone,
    },
    {
      step: '02',
      title: 'Assessment',
      description: 'Technicians diagnose the issue at the service center.',
      icon: SearchCheck,
    },
    {
      step: '03',
      title: 'Claim Filed',
      description: 'Kairos Addis submits the claim to YouGuard.',
      icon: FileCheck,
    },
    {
      step: '04',
      title: 'Resolution',
      description: 'Repairs are completed using genuine parts.',
      icon: CheckCircle2,
    },
  ];

  const serviceFeatures = [
    {
      title: 'EV-Trained Technicians',
      description: 'Factory-certified high-voltage technicians trained specifically on BYD, Geely, and Toyota electric powertrains.',
      icon: Award,
    },
    {
      title: 'Advanced Diagnostics',
      description: 'Direct OEM diagnostic hardware and high-precision telemetry scanners for live battery pack health analysis.',
      icon: Cpu,
    },
    {
      title: 'Genuine Parts',
      description: '100% authentic manufacturer spare parts, battery modules, and control units stocked locally in Addis Ababa.',
      icon: ShieldCheck,
    },
    {
      title: 'Quick Turnaround',
      description: 'Dedicated EV inspection bays and streamlined workflows ensuring prompt servicing and minimal customer downtime.',
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 pt-20 pb-20 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-24 left-1/4 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[550px] h-[550px] bg-cyan-500/8 rounded-full blur-[160px] pointer-events-none" />

      {/* ========================================================
          1. HERO SECTION
          ======================================================== */}
      <section className="relative pt-12 pb-20 md:py-24 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Small Label */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>YOUGUARD PARTNERSHIP</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-[1.08]">
                5-YEAR <span className="text-blue-500">COMPREHENSIVE</span> WARRANTY
              </h1>

              {/* Hero Subtext */}
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
                Every vehicle from Kairos Addis comes with comprehensive warranty coverage through our partnership with YouGuard, giving customers peace of mind on Ethiopian roads.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onScheduleService}
                  id="hero-btn-schedule-service"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Service</span>
                </button>

                <button
                  onClick={() => scrollToSection('whats-covered')}
                  id="hero-btn-view-coverage"
                  className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-sm border border-slate-700 hover:border-slate-500 transition-all duration-200 tracking-wider uppercase cursor-pointer flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>View Coverage</span>
                </button>
              </div>

              {/* Quick Trust Pillars */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-800/80 text-xs">
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base text-cyan-300">8 Years</div>
                  <div className="text-slate-400 text-[11px]">Battery Pack Warranty</div>
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base text-cyan-300">100% OEM</div>
                  <div className="text-slate-400 text-[11px]">Genuine Replacement Parts</div>
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base text-cyan-300">Addis Ababa</div>
                  <div className="text-slate-400 text-[11px]">Certified Service Center</div>
                </div>
              </div>

            </div>

            {/* Right Column: Premium EV / Battery Chassis Visual */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Outer Glowing Holographic Stage */}
              <div className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#0c1527] to-[#070c16] border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                
                {/* Top Rim Glow */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                {/* Holographic Stage Ring */}
                <div className="absolute bottom-6 w-4/5 h-20 pointer-events-none flex items-center justify-center">
                  <div
                    className="w-full h-16 rounded-[100%] border border-cyan-500/40 bg-gradient-to-t from-blue-600/25 to-transparent animate-pulse"
                    style={{ transform: 'perspective(400px) rotateX(75deg)' }}
                  />
                  <div className="absolute w-3/4 h-8 bg-cyan-400/20 rounded-full blur-xl" />
                </div>

                {/* Battery Chassis Image */}
                <div className="relative z-10 w-full flex items-center justify-center">
                  <img
                    src="/images/ev_battery_chassis_1788207043314.jpg"
                    alt="Kairos Addis EV Battery & Chassis Engineering"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-72 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
                  />
                </div>

                {/* Floating Telemetry Badges */}
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-300 font-medium">YouGuard Verified</span>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] text-cyan-300 font-bold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Blade Battery Safe</span>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          2. WARRANTY COVERAGE (What's Covered)
          ======================================================== */}
      <section id="whats-covered" className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 mb-3 tracking-[0.25em] uppercase">
              <Shield className="w-3 h-3" />
              <span>OFFICIAL YOUGUARD POLICY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
              WHAT'S <span className="text-blue-500">COVERED</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Transparent, factory-backed coverage tiers designed to shield every essential system in your electric vehicle.
            </p>
          </div>

          {/* 4 Clean Coverage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverageItems.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 hover:border-blue-500/70 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-[0_15px_35px_-10px_rgba(37,99,235,0.3)] hover:-translate-y-1 overflow-hidden"
                >
                  {/* Top Rim Glowing Line */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/0 group-hover:via-cyan-400 to-transparent transition-all duration-500" />

                  <div>
                    {/* Badge & Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:bg-blue-600/30 transition-colors">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-tight mb-1 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Duration / KM Highlight */}
                    <div className="text-base sm:text-lg font-bold text-cyan-400 mb-3 tracking-wide">
                      {item.duration}
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Parts & Labor Included</span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          3. WARRANTY CLAIMS (How Warranty Claims Work)
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 mb-3 tracking-[0.25em] uppercase">
              <FileCheck className="w-3 h-3" />
              <span>STEP-BY-STEP PROCESS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
              HOW WARRANTY <span className="text-blue-500">CLAIMS WORK</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              A hassle-free, four-step protocol to keep you moving with zero unexpected paperwork friction.
            </p>
          </div>

          {/* 4-Step Interactive Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-600/30 via-cyan-400/40 to-blue-600/30 -translate-y-8 z-0" />

            {claimsSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative z-10 bg-gradient-to-b from-[#0c1424] to-[#080d17] border border-slate-800 hover:border-blue-500/60 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-600/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.35)] font-mono font-bold text-base">
                        {step.step}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-400/80 font-medium">
                    Stage {idx + 1} of 4
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onOpenContact('Warranty Claim Inquiry')}
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Need to file a warranty claim today? Speak with our claims desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================
          4. EV SERVICE CENTER (State-of-the-Art EV Service)
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* Left Headline */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase">
                <Wrench className="w-3 h-3" />
                <span>BOLE MEDHANIALEM WORKSHOP</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-tight">
                STATE-OF-THE-ART <span className="text-blue-500">EV SERVICE</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                The Addis Ababa service center is engineered exclusively for electric vehicles, featuring high-voltage isolation bays, robotic diagnostic scanners, and specialized factory-certified technicians.
              </p>
            </div>

            {/* Right Workshop Visual Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                <img
                  src="/images/ev_service_center_1788209856424.jpg"
                  alt="Kairos Addis State of the Art EV Service Center"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06090e] via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80">
                  <span className="text-white font-semibold">Bole Medhanialem EV Facility</span>
                  <span className="text-cyan-400 font-bold">Open Mon – Sat</span>
                </div>
              </div>
            </div>

          </div>

          {/* 4 Service Center Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceFeatures.map((feature) => {
              const FeatIcon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-gradient-to-b from-[#0c1424] to-[#080d17] border border-slate-800 hover:border-blue-500/60 rounded-2xl p-6 transition-all duration-300 shadow-xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-950/70 border border-blue-600/40 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    <FeatIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          5. DIGITAL SERVICE RECORDS (Customer Portal Preview)
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase">
                <Activity className="w-3.5 h-3.5" />
                <span>DIGITAL TELEMETRY & LOGBOOK</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-tight">
                COMPLETE SERVICE HISTORY <span className="text-blue-500">AT YOUR FINGERTIPS</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Access your complete service history through the customer portal. Never lose track of a filter swap, battery diagnostic, or warranty document.
              </p>

              {/* 5 Core Feature Bullets */}
              <div className="space-y-3 pt-2">
                {[
                  'Complete maintenance history',
                  'Parts and labor documentation',
                  'Automated service reminders',
                  'Digital + physical service logbook',
                  'Warranty claim tracking',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-500/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <button
                  onClick={onOpenPortal}
                  id="btn-access-customer-portal"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Access Customer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Mockup Dashboard Interface */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                
                {/* Dashboard Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-cyan-400 font-bold">
                      KA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase">Alebachew Abreham</div>
                      <div className="text-[11px] text-slate-400">BYD Tang L AWD (Plate: 2-B89201)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-bold text-emerald-400">
                      Warranty Active
                    </span>
                  </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-xs">
                  <div className="bg-[#080d17] p-3.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px] mb-1">Battery Health (SOH)</div>
                    <div className="text-lg font-extrabold text-emerald-400">99.4%</div>
                    <div className="text-[10px] text-slate-500">108.8 kWh Blade Pack</div>
                  </div>

                  <div className="bg-[#080d17] p-3.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px] mb-1">Next Service Due</div>
                    <div className="text-lg font-extrabold text-cyan-400">In 4,200 km</div>
                    <div className="text-[10px] text-slate-500">20,000 KM Interval</div>
                  </div>

                  <div className="bg-[#080d17] p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                    <div className="text-slate-400 text-[11px] mb-1">Claims Status</div>
                    <div className="text-lg font-extrabold text-white">0 Active</div>
                    <div className="text-[10px] text-slate-500">YouGuard Policy #YG-8821</div>
                  </div>
                </div>

                {/* Recent Service Records Log List */}
                <div className="space-y-2.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recent Service History
                  </div>

                  <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-cyan-400">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">10,000 KM Initial Calibration</div>
                        <div className="text-[10px] text-slate-400">Bole Service Bay #2 • Completed Jan 2026</div>
                      </div>
                    </div>
                    <span className="text-blue-400 font-semibold cursor-pointer hover:underline text-[11px]">
                      View Invoice
                    </span>
                  </div>

                  <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-cyan-400">
                        <Battery className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">High-Voltage Telemetry & Diagnostic</div>
                        <div className="text-[10px] text-slate-400">Firmware V3.2 Update • Completed Nov 2025</div>
                      </div>
                    </div>
                    <span className="text-blue-400 font-semibold cursor-pointer hover:underline text-[11px]">
                      View Report
                    </span>
                  </div>
                </div>

                {/* Bottom Quick CTA */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Real-time sync enabled with Kairos Telematics</span>
                  <button
                    onClick={onOpenPortal}
                    className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                  >
                    Open Full Logbook &rarr;
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. FINAL CTA (Need Service or Have Questions?)
          ======================================================== */}
      <section className="pt-20 md:pt-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0c1629] via-[#09101d] to-[#070b14] border border-slate-800 p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-2xl">
            
            {/* Top Rim Glow */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KAIROS SERVICE SUPPORT</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                NEED SERVICE OR <span className="text-blue-500">HAVE QUESTIONS?</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Our team is ready to help. Schedule a service appointment or contact us with your warranty questions.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => onOpenContact()}
                  id="final-cta-btn-contact-support"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] cursor-pointer flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact Our Support Team</span>
                </button>
              </div>

              {/* Direct Telephone Support */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hotline: +251 911 00 00 00</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>WhatsApp: +251 922 00 00 00</span>
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
