import { useState, useEffect } from 'react';
import { User, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenTestDrive: (carId?: string) => void;
  onOpenPortal: () => void;
  currentPage: 'home' | 'vehicles' | 'warranty' | 'about' | 'contact' | 'privacy' | 'terms';
  onNavigate: (page: 'home' | 'vehicles' | 'warranty' | 'about' | 'contact' | 'privacy' | 'terms', sectionId?: string) => void;
  activeSection: string;
}

export function Navbar({
  onOpenTestDrive,
  onOpenPortal,
  currentPage,
  onNavigate,
  activeSection,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', page: 'home' as const, id: 'home' },
    { name: 'Vehicles', page: 'vehicles' as const, id: 'vehicles' },
    { name: 'Warranty', page: 'warranty' as const, id: 'warranty' },
    { name: 'About', page: 'about' as const, id: 'about' },
    { name: 'Contact', page: 'contact' as const, id: 'contact' },
  ];

  const handleLinkClick = (page: 'home' | 'vehicles' | 'warranty' | 'about' | 'contact', id: string) => {
    setMobileMenuOpen(false);
    onNavigate(page, id);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#06090e]/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-lg shadow-black/50'
          : 'bg-gradient-to-b from-[#06090e]/95 to-transparent py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleLinkClick('home', 'home')}
          className="flex items-center gap-2 group cursor-pointer text-left bg-transparent border-0"
          id="nav-logo-link"
        >
          <Logo />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide">
          {navLinks.map((link) => {
            const isActive =
              currentPage === 'vehicles'
                ? link.page === 'vehicles'
                : currentPage === 'warranty'
                ? link.page === 'warranty'
                : currentPage === 'about'
                ? link.page === 'about'
                : currentPage === 'contact'
                ? link.page === 'contact'
                : activeSection === link.id && link.page === 'home';

            return (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.page, link.id)}
                id={`nav-link-${link.id}`}
                className={`relative py-1 transition-colors duration-200 cursor-pointer bg-transparent border-0 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onOpenTestDrive()}
            id="nav-btn-book-test-drive"
            className="bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold px-4.5 py-2.5 rounded-sm transition-all duration-200 tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] cursor-pointer"
          >
            BOOK A TEST DRIVE
          </button>
          <button
            onClick={onOpenPortal}
            id="nav-btn-portal"
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-[12px] font-bold px-3.5 py-2.5 rounded-sm border border-slate-700/80 transition-all duration-200 tracking-wider cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-300" />
            <span>PORTAL</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => onOpenTestDrive()}
            className="bg-blue-600 text-white text-[11px] font-bold px-3 py-2 rounded-sm cursor-pointer"
          >
            TEST DRIVE
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="nav-mobile-menu-toggle"
            aria-label="Toggle Navigation Menu"
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-sm cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0a0f18] border-b border-slate-800 px-6 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-sm">
            {navLinks.map((link) => {
              const isActive =
                currentPage === 'vehicles'
                  ? link.page === 'vehicles'
                  : currentPage === 'warranty'
                  ? link.page === 'warranty'
                  : currentPage === 'about'
                  ? link.page === 'about'
                  : currentPage === 'contact'
                  ? link.page === 'contact'
                  : activeSection === link.id && link.page === 'home';

              return (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.page, link.id)}
                  className={`py-1.5 text-left transition-colors cursor-pointer bg-transparent border-0 ${
                    isActive ? 'text-blue-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTestDrive();
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-sm tracking-wider cursor-pointer"
            >
              BOOK A TEST DRIVE
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortal();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-slate-200 text-xs font-bold py-2.5 rounded-sm border border-slate-700 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>PORTAL</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
