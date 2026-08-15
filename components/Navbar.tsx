
import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { buildLoginRedirect } from '../src/lib/rbac';

interface NavbarProps {
  currentPage: string;
  onNavigate?: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '#home', id: 'home', protected: false },
    { name: 'Événements', href: '#events', id: 'events', protected: true },
    { name: 'À Propos', href: '#about', id: 'about', protected: false },
    { name: 'Services', href: '#services', id: 'services', protected: true },
    { name: 'Contact', href: '#contact', id: 'contact', protected: false },
  ];

  const isDarkBg = isScrolled || currentPage !== 'home';

  const handleProtectedClick = (e: React.MouseEvent, href: string, protectedLink: boolean) => {
    if (protectedLink && !user) {
      e.preventDefault();
      const path = href.replace('#', '');
      const dest = buildLoginRedirect(path).replace('#', '');
      if (onNavigate) onNavigate(dest);
      else window.location.hash = dest;
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout().then(() => {
      if (onNavigate) onNavigate('home');
      else window.location.hash = '#home';
      setIsMobileMenuOpen(false);
    });
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isDarkBg ? 'bg-navy py-3 md:py-4 shadow-lg' : 'bg-transparent py-4 md:py-6'}`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <a href="#home" className="flex items-center">
          <img
            src="/logo.png"
            alt="Blessing Event"
            className="h-10 md:h-12 w-auto max-w-[160px] md:max-w-[180px] object-contain"
          />
        </a>

        <div className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleProtectedClick(e, link.href, link.protected)}
                className={`text-[11px] font-bold tracking-[0.2em] transition-custom uppercase ${
                  currentPage === link.id ? 'text-gold' : 'text-white hover:text-gold/80'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-white/20">
            {user ? (
              <>
                {user.role === 'super_admin' ? (
                  <a href="#admin" className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-gold hover:text-white transition-custom">
                    <Shield size={14} /> Admin
                  </a>
                ) : (
                  <a href="#dashboard" className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white hover:text-gold transition-custom">
                    <LayoutDashboard size={14} /> Mon espace
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white/70 hover:text-white transition-custom"
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <a href="#login" className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white hover:text-gold transition-custom">
                  <LogIn size={14} /> Connexion
                </a>
                <a href="#register" className="px-3 py-1.5 bg-gold text-white text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-navy transition-custom">
                  S'inscrire
                </a>
              </>
            )}
          </div>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className={`md:hidden absolute top-full left-0 w-full bg-navy border-t border-slate-700 transition-all duration-300 max-h-[calc(100dvh-4.5rem)] overflow-y-auto ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col p-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`text-sm font-medium transition-custom uppercase ${
                currentPage === link.id ? 'text-gold' : 'text-white'
              }`}
              onClick={(e) => handleProtectedClick(e, link.href, link.protected)}
            >
              {link.name}
            </a>
          ))}
          <div className="border-t border-white/10 pt-4 space-y-3">
            {user ? (
              <>
                <a href="#events" className="block text-sm text-white uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                  Billetterie
                </a>
                <a href="#my-tickets" className="block text-sm text-white uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                  Mes billets
                </a>
                <a href={user.role === 'super_admin' ? '#admin' : '#dashboard'} className="block text-sm text-gold uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                  {user.role === 'super_admin' ? 'Administration' : 'Mon espace'}
                </a>
                <button type="button" onClick={handleLogout} className="text-sm text-white/70 uppercase">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <a href="#login" className="block text-sm text-white uppercase" onClick={() => setIsMobileMenuOpen(false)}>Connexion</a>
                <a href="#register" className="block text-sm text-gold uppercase" onClick={() => setIsMobileMenuOpen(false)}>S'inscrire</a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
