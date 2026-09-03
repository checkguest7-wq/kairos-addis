import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Target,
  Eye,
  Compass,
  Award,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Globe2,
  Car,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Cpu,
  Building2,
  BadgeCheck,
  MapPin,
} from 'lucide-react';

interface AboutPageProps {
  onExploreVehicles: () => void;
  onContactUs: () => void;
}

export function AboutPage({ onExploreVehicles, onContactUs }: AboutPageProps) {
  const journeyMilestones = [
    {
      year: '2020',
      title: 'Founded',
      description: 'Kairos Addis established with a vision for sustainable mobility in Ethiopia.',
      icon: Building2,
      badge: 'Genesis',
    },
    {
      year: '2021',
      title: 'First Imports',
      description: 'First batch of BYD premium electric vehicles delivered to pioneering Ethiopian owners.',
      icon: Car,
      badge: 'Pioneering EV',
    },
    {
      year: '2022',
      title: 'YouGuard Partnership',
      description: 'Formalized exclusive partnership providing 5 to 8-year comprehensive warranty coverage.',
      icon: ShieldCheck,
      badge: 'Peace of Mind',
    },
    {
      year: '2023',
      title: 'Service Center',
      description: 'State-of-the-art specialized EV diagnostic and maintenance facility opened in Addis Ababa.',
      icon: Cpu,
      badge: 'Bole Facility',
    },
    {
      year: '2024',
      title: 'Expansion',
      description: 'Geely Galaxy and Toyota bZ series added to our luxury electric vehicle portfolio.',
      icon: Globe2,
      badge: 'Brand Growth',
    },
    {
      year: '2025',
      title: '500+ Customers',
      description: 'Reached more than 500 satisfied EV owners operating seamlessly across Ethiopia.',
      icon: Users,
      badge: 'Milestone',
    },
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'Highest standards in everything we do, from vehicle curation to post-delivery care.',
      icon: Award,
      badge: 'Quality Standard',
      accent: 'from-blue-600/20 to-cyan-500/10',
    },
    {
      title: 'Customer First',
      description: 'Customer satisfaction is our ultimate measure of success, ensuring smooth ownership every kilometer.',
      icon: Users,
      badge: 'Our Priority',
      accent: 'from-blue-600/20 to-blue-900/10',
    },
    {
      title: 'Integrity',
      description: 'Honest, transparent pricing, verified vehicle specifications, and straightforward warranty policies.',
      icon: ShieldCheck,
      badge: 'Trust & Truth',
      accent: 'from-blue-600/20 to-cyan-500/10',
    },
    {
      title: 'Innovation',
      description: 'Embracing cutting-edge battery technology, smart telematics, and clean energy solutions.',
      icon: Zap,
      badge: 'Future Focus',
      accent: 'from-blue-600/20 to-slate-900/10',
    },
  ];

  const brandPartners = [
    { name: 'BYD', role: 'EV Global Leader', note: 'Blade Battery Pioneers' },
    { name: 'Geely', role: 'Advanced Architecture', note: 'GEA Smart EV Platform' },
    { name: 'Toyota', role: 'Legendary Reliability', note: 'bZ Pure Electric Series' },
    { name: 'YouGuard', role: 'Certified Warranty Partner', note: '8-Yr / 160,000 KM Coverage' },
  ];

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 pt-20 pb-20 relative overflow-hidden">
      
      {/* Ambient background illumination */}
      <div className="absolute top-24 left-1/4 w-[650px] h-[350px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[160px] pointer-events-none" />

      {/* ========================================================
          1. HERO SECTION
          ======================================================== */}
      <section className="relative pt-12 pb-20 md:py-24 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Small Label */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ABOUT KAIROS ADDIS</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-[1.08]">
                DRIVING ETHIOPIA'S <span className="text-blue-500">ELECTRIC FUTURE</span>
              </h1>

              {/* Text */}
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
                We are Ethiopia's premier destination for premium electric vehicles, committed to delivering exceptional quality, service, and sustainability.
              </p>

              {/* Showroom Location Element */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#080d17] border border-slate-800 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>
                  <strong className="text-white font-semibold">Kairos Addis Auto Dealership</strong> • Addis Ababa, Ethiopia
                </span>
              </div>

              {/* Key Stats Counter Bar */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-800/80 text-xs">
                <div>
                  <div className="font-extrabold text-white text-base sm:text-xl text-cyan-300">500+</div>
                  <div className="text-slate-400 text-[11px]">EVs on Ethiopian Roads</div>
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-xl text-cyan-300">8 Years</div>
                  <div className="text-slate-400 text-[11px]">Battery Warranty</div>
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-xl text-cyan-300">100% EV</div>
                  <div className="text-slate-400 text-[11px]">Dedicated Workshop</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onExploreVehicles}
                  id="about-hero-btn-explore"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] cursor-pointer flex items-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Explore Vehicles</span>
                </button>

                <button
                  onClick={onContactUs}
                  id="about-hero-btn-contact"
                  className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-sm border border-slate-700 hover:border-slate-500 transition-all duration-200 tracking-wider uppercase cursor-pointer flex items-center gap-2"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group bg-gradient-to-b from-[#0c1424] to-[#070c16] p-2">
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src="/images/about_hero_showroom_1788210068828.jpg"
                    alt="Kairos Addis Premium Flagship EV Showroom"
                    referrerPolicy="no-referrer"
                    className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06090e] via-black/20 to-transparent" />
                  
                  {/* Floating Telemetry Tag */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="text-white font-bold uppercase">Bole Wollo Sefer Flagship</div>
                      <div className="text-[11px] text-slate-400">Addis Ababa, Ethiopia</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-500/20 border border-blue-500/40 text-[11px] font-bold text-cyan-300">
                      Premier Showroom
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          2 & 3. OUR MISSION & OUR VISION
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 2. Our Mission Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#0c1527] to-[#070c16] border border-slate-800 hover:border-blue-500/60 p-8 sm:p-10 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <Target className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded bg-blue-950/60 border border-blue-600/40">
                    OUR MISSION
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mb-4">
                  ACCELERATING THE TRANSITION TO <span className="text-blue-500">SUSTAINABLE MOBILITY</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Kairos Addis is on a mission to accelerate Ethiopia's transition to sustainable transportation through world-class electric vehicles, uncompromised after-sales service, and ironclad warranty support. We empower drivers with zero-emission technology tailored specifically to Ethiopian road conditions and daily lifestyle.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>World-class electric vehicle portfolio curated for local terrain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Complete after-sales maintenance and genuine spare parts infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Comprehensive 5 to 8-year YouGuard warranty backing</span>
                </div>
              </div>
            </div>

            {/* 3. Our Vision Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#0c1527] to-[#070c16] border border-slate-800 hover:border-blue-500/60 p-8 sm:p-10 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <Eye className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded bg-blue-950/60 border border-blue-600/40">
                    OUR VISION
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mb-4">
                  BECOMING AFRICA'S LEADING <span className="text-blue-500">EV ECOSYSTEM</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Our vision is to become Africa's leading electric vehicle company, pioneering clean energy mobility and contributing directly to cleaner, quieter, and more sustainable cities. We envision an Ethiopia where electric mobility is accessible, reliable, and the definitive standard for private and commercial transit.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Contributing to cleaner urban air quality across Addis Ababa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Fostering national technical expertise in high-voltage engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Setting the benchmark for automotive customer trust and transparency</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. OUR STORY (A Partnership Built on Excellence)
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>OUR STORY</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                A PARTNERSHIP BUILT ON <span className="text-blue-500">EXCELLENCE</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Kairos Addis was created to bridge the gap between global EV innovation and the Ethiopian driver. Recognizing that transition requires more than just importing cars, we established a comprehensive ecosystem built around trust, engineering, and reliable warranty backing.
              </p>

              <p className="text-slate-400 text-sm leading-relaxed">
                Our strategic relationships with global automotive titans—including <strong>BYD</strong>, <strong>Geely</strong>, and <strong>Toyota</strong>—combined with our partnership with <strong>YouGuard</strong>, ensure that every vehicle delivered in Ethiopia is backed by certified technician support, direct parts pipelines, and dedicated long-term care.
              </p>

              <div className="pt-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#080d17] p-3.5 rounded-xl border border-slate-800">
                    <div className="text-cyan-400 font-bold mb-1">Direct OEM Lines</div>
                    <div className="text-slate-400">Authentic parts & factory software integration.</div>
                  </div>
                  <div className="bg-[#080d17] p-3.5 rounded-xl border border-slate-800">
                    <div className="text-cyan-400 font-bold mb-1">Local Infrastructure</div>
                    <div className="text-slate-400">Showroom, service bay, and mobile support.</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Strategic Partners Grid */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brandPartners.map((partner) => (
                  <div
                    key={partner.name}
                    className="p-5 rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 hover:border-blue-500/60 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-black text-white font-mono tracking-wider">
                        {partner.name}
                      </div>
                      <BadgeCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-xs font-bold text-cyan-300 mb-1">
                      {partner.role}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {partner.note}
                    </div>
                  </div>
                ))}
              </div>

              {/* Callout box */}
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center gap-4">
                <ShieldCheck className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white uppercase">Guaranteed Ownership Security</div>
                  <div className="text-slate-300">Full manufacturer telemetry analysis and certified warranty claim processing right in Addis Ababa.</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          5. OUR JOURNEY (Modern Timeline)
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 mb-3 tracking-[0.25em] uppercase">
              <Clock className="w-3 h-3" />
              <span>CHRONOLOGICAL TIMELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
              OUR <span className="text-blue-500">JOURNEY</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From a pioneering vision to Ethiopia's premier electric mobility leader.
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {journeyMilestones.map((milestone, idx) => {
              const MilestoneIcon = milestone.icon;
              return (
                <div
                  key={milestone.year}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#080d17] border border-slate-800 hover:border-blue-500/70 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/0 group-hover:via-cyan-400 to-transparent transition-all duration-500" />
                  
                  <div>
                    {/* Year & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black text-white font-mono text-cyan-400">
                        {milestone.year}
                      </span>
                      <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {milestone.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-600/40 flex items-center justify-center text-cyan-400">
                        <MilestoneIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        {milestone.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-2">
                      {milestone.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Phase 0{idx + 1}</span>
                    <span className="text-cyan-400 font-semibold">Kairos Milestone</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          6. OUR VALUES (4 Premium Cards)
          ======================================================== */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 mb-3 tracking-[0.25em] uppercase">
              <Compass className="w-3 h-3" />
              <span>CORE PRINCIPLES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
              OUR <span className="text-blue-500">VALUES</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              The foundational standards that guide every customer interaction, vehicle inspection, and partnership.
            </p>
          </div>

          {/* 4 Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => {
              const ValIcon = val.icon;
              return (
                <div
                  key={val.title}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#0c1424] to-[#070c16] border border-slate-800 hover:border-blue-500/70 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/0 group-hover:via-cyan-400 to-transparent transition-all duration-500" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#080d17] border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:bg-blue-600/30 transition-colors">
                        <ValIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {val.badge}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                      {val.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {val.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Kairos Addis Standard</span>
                  </div>
                </div>
              );
            })}
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

            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>JOIN THE MOVEMENT</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                READY TO JOIN THE <span className="text-blue-500">ELECTRIC REVOLUTION?</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Visit Kairos Addis and experience the future of mobility.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onExploreVehicles}
                  id="about-final-btn-explore"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-sm transition-all duration-200 tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] cursor-pointer flex items-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Explore Vehicles</span>
                </button>

                <button
                  onClick={onContactUs}
                  id="about-final-btn-contact"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-sm border border-slate-700 hover:border-slate-500 transition-all duration-200 tracking-wider uppercase cursor-pointer flex items-center gap-2"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
