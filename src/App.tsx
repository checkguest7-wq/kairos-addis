/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedCarsSection } from './components/FeaturedCarsSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { WarrantySection } from './components/WarrantySection';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { OurPartnersSection } from './components/OurPartnersSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer } from './components/Footer';
import { VehiclesPage } from './components/VehiclesPage';
import { WarrantyPage } from './components/WarrantyPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { PortalApp } from './components/portal/PortalApp';
import { AdminApp } from './components/admin/AdminApp';

import { TestDriveModal } from './components/TestDriveModal';
import { VehicleDetailsModal } from './components/VehicleDetailsModal';
import { WarrantyModal } from './components/WarrantyModal';
import { ContactModal } from './components/ContactModal';
import { ScheduleServiceModal } from './components/ScheduleServiceModal';

import { VEHICLES } from './data/vehicles';
import { REVIEWS } from './data/reviews';
import { WHY_FEATURES, WARRANTY_ITEMS } from './data/features';
import { Vehicle } from './types';

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

function MainAppContent() {
  // Navigation Page State
  const [currentPage, setCurrentPage] = useState<'home' | 'vehicles' | 'warranty' | 'about' | 'contact' | 'privacy' | 'terms' | 'portal' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) return 'admin';
      if (path.startsWith('/portal')) return 'portal';
      if (path === '/privacy-policy') return 'privacy';
      if (path === '/terms-of-service') return 'terms';
      if (path === '/vehicles') return 'vehicles';
      if (path === '/warranty') return 'warranty';
      if (path === '/about') return 'about';
      if (path === '/contact') return 'contact';
    }
    return 'home';
  });

  // Modal states
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [selectedVehicleForDrive, setSelectedVehicleForDrive] = useState<string | undefined>();
  const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null);
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactVehicleName, setContactVehicleName] = useState<string | undefined>();
  const [scheduleServiceOpen, setScheduleServiceOpen] = useState(false);

  // Active section tracker for navbar highlight on home page
  const [activeSection, setActiveSection] = useState('home');

  // Listen to browser back/forward history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setCurrentPage('admin');
      } else if (path.startsWith('/portal')) {
        setCurrentPage('portal');
      } else {
        if (path === '/privacy-policy') setCurrentPage('privacy');
        else if (path === '/terms-of-service') setCurrentPage('terms');
        else if (path === '/vehicles') setCurrentPage('vehicles');
        else if (path === '/warranty') setCurrentPage('warranty');
        else if (path === '/about') setCurrentPage('about');
        else if (path === '/contact') setCurrentPage('contact');
        else setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (currentPage !== 'home') return;
      const sections = ['home', 'vehicles', 'why-choose-us', 'warranty', 'reviews', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const { isAuthenticated } = useAuth();

  const handleOpenTestDrive = (carId?: string) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'kairos_pending_intent',
          JSON.stringify({ type: 'test-drive', carId: carId || 'byd-tang-l' })
        );
      }
      handleOpenPortal();
      return;
    }
    setSelectedVehicleForDrive(carId);
    setTestDriveOpen(true);
  };

  const handleOpenContact = (carName?: string) => {
    setContactVehicleName(carName);
    setContactModalOpen(true);
  };

  const handleOpenScheduleService = () => {
    if (!isAuthenticated) {
      handleOpenPortal();
      return;
    }
    setScheduleServiceOpen(true);
  };

  const handleOpenPortal = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/portal/login');
    }
    setCurrentPage('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
    setCurrentPage('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: 'home' | 'vehicles' | 'warranty' | 'about' | 'contact' | 'privacy' | 'terms', sectionId?: string) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      let urlPath = '/';
      if (page === 'privacy') urlPath = '/privacy-policy';
      else if (page === 'terms') urlPath = '/terms-of-service';
      else if (page !== 'home') urlPath = `/${page}`;
      window.history.pushState({}, '', urlPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'home' && sectionId && sectionId !== 'home') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleSelectCarByName = (name: string) => {
    const matched = VEHICLES.find((v) => v.name.toLowerCase() === name.toLowerCase());
    if (matched) {
      setDetailsVehicle(matched);
    }
  };

  // If in Admin view, display the Executive Admin Dashboard App
  if (currentPage === 'admin') {
    return (
      <AdminApp
        onOpenHome={() => handleNavigate('home')}
      />
    );
  }

  // If in Portal view, display the Customer Portal App
  if (currentPage === 'portal') {
    return (
      <PortalApp
        onBackToWebsite={() => {
          handleNavigate('home');
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#06090e] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* 
        Full-Page Dark Atmospheric Showroom Background Layer
      */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-screen transition-opacity duration-1000"
        style={{
          backgroundImage: `url('/images/showroom_bg_texture_1788208293379.jpg')`,
        }}
      />

      {/* Atmospheric dark gradient overlays */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#06090e]/85 via-[#06090e]/92 to-[#06090e] backdrop-blur-[2px]" />

      {/* Ambient Neon Glow Pillars */}
      <div className="fixed top-0 left-1/4 w-96 h-[800px] bg-blue-600/10 blur-[180px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-10 w-96 h-[600px] bg-cyan-500/8 blur-[160px] pointer-events-none z-0" />

      {/* Main App Content */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        
        {/* 1. Header / Navbar */}
        <Navbar
          onOpenTestDrive={() => handleOpenTestDrive()}
          onOpenPortal={handleOpenPortal}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          activeSection={activeSection}
        />

        <main className="flex-grow">
          {currentPage === 'vehicles' ? (
            /* Dedicated Vehicles Catalog Page */
            <VehiclesPage
              vehicles={VEHICLES}
              onSelectVehicle={(vehicle) => setDetailsVehicle(vehicle)}
              onOpenTestDrive={(carId) => handleOpenTestDrive(carId)}
              onContactKairos={(carName) => handleOpenContact(carName)}
            />
          ) : currentPage === 'warranty' ? (
            /* Dedicated Warranty & Service Page */
            <WarrantyPage
              onScheduleService={handleOpenScheduleService}
              onOpenPortal={handleOpenPortal}
              onOpenContact={(subject) => handleOpenContact(subject)}
            />
          ) : currentPage === 'about' ? (
            /* Dedicated About Us Page */
            <AboutPage
              onExploreVehicles={() => handleNavigate('vehicles')}
              onContactUs={() => handleNavigate('contact')}
            />
          ) : currentPage === 'contact' ? (
            /* Dedicated Contact Us & Showroom Page */
            <ContactPage
              onExploreVehicles={() => handleNavigate('vehicles')}
              onBookTestDrive={(carId) => handleOpenTestDrive(carId)}
            />
          ) : currentPage === 'privacy' ? (
            /* Dedicated Privacy Policy Page */
            <PrivacyPolicyPage
              onNavigateHome={() => handleNavigate('home')}
              onOpenContact={() => handleNavigate('contact')}
            />
          ) : currentPage === 'terms' ? (
            /* Dedicated Terms of Service Page */
            <TermsOfServicePage
              onNavigateHome={() => handleNavigate('home')}
              onOpenContact={() => handleNavigate('contact')}
            />
          ) : (
            /* Homepage View with All Sections */
            <>
              {/* 2. Hero Section */}
              <HeroSection
                onExploreVehicles={() => handleNavigate('vehicles')}
                onBookTestDrive={() => handleOpenTestDrive('byd-tang-l')}
              />

              {/* 3. Featured Cars / Explore Our Vehicles */}
              <FeaturedCarsSection
                vehicles={VEHICLES}
                onSelectVehicle={(vehicle) => setDetailsVehicle(vehicle)}
                onOpenTestDrive={(carId) => handleOpenTestDrive(carId)}
              />

              {/* 4. Why Kairos Addis */}
              <WhyChooseUsSection
                features={WHY_FEATURES}
                onOpenWarrantyModal={() => handleNavigate('warranty')}
              />

              {/* 5. Warranty & Service */}
              <WarrantySection
                items={WARRANTY_ITEMS}
                onLearnMore={() => handleNavigate('warranty')}
              />

              {/* 6. Customer Reviews / Trusted by Our Customers */}
              <CustomerReviewsSection reviews={REVIEWS} />

              {/* 7. Our Partners / Trusted Brands We Work With */}
              <OurPartnersSection />

              {/* 8. Final CTA / Ready to Go Electric? */}
              <FinalCtaSection
                onExploreVehicles={() => handleNavigate('vehicles')}
                onBookTestDrive={() => handleOpenTestDrive()}
              />
            </>
          )}
        </main>

        {/* Footer */}
        <Footer
          onSelectCarByName={handleSelectCarByName}
          onOpenTestDrive={() => handleOpenTestDrive()}
          onNavigate={handleNavigate}
        />

      </div>

      {/* Interactive Modals */}
      <TestDriveModal
        isOpen={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        vehicles={VEHICLES}
        initialVehicleId={selectedVehicleForDrive}
      />

      <VehicleDetailsModal
        vehicle={detailsVehicle}
        onClose={() => setDetailsVehicle(null)}
        onBookTestDrive={(carId) => {
          setDetailsVehicle(null);
          handleOpenTestDrive(carId);
        }}
        onContactKairos={(carName) => {
          setDetailsVehicle(null);
          handleOpenContact(carName);
        }}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        carName={contactVehicleName}
      />

      <WarrantyModal
        isOpen={warrantyModalOpen}
        onClose={() => setWarrantyModalOpen(false)}
        onBookService={() => {
          setWarrantyModalOpen(false);
          handleOpenScheduleService();
        }}
      />

      <ScheduleServiceModal
        isOpen={scheduleServiceOpen}
        onClose={() => setScheduleServiceOpen(false)}
      />

    </div>
  );
}
