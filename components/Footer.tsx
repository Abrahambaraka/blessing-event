
import React from 'react';
import { SITE_CONTACT } from '../src/constants/contact';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white py-10 md:py-16 border-t border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="col-span-2">
            <img
              src="/logo.png?v=4"
              alt="Blessing Event"
              className="h-14 md:h-16 w-auto max-w-[200px] object-contain bg-transparent mb-4 md:mb-6"
            />
            <p className="text-slate-500 max-w-sm leading-relaxed text-xs md:text-sm">
              L'excellence du protocole et l'art de recevoir. Nous transformons vos visions en réalités mémorables à Lubumbashi et au-delà.
            </p>
          </div>
          
          <div>
            <h4 className="text-navy font-bold uppercase tracking-wide md:tracking-widest text-xs md:text-sm mb-4 md:mb-6">Navigation</h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-slate-500">
              <li><a href="#home" className="hover:text-gold transition-colors">Accueil</a></li>
              <li><a href="#about" className="hover:text-gold transition-colors">À Propos</a></li>
              <li><a href="#services" className="hover:text-gold transition-colors">Nos Services</a></li>
              <li><a href="#contact" className="hover:text-gold transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-navy font-bold uppercase tracking-wide md:tracking-widest text-xs md:text-sm mb-4 md:mb-6">Suivez-Nous</h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-slate-500">
              <li><a href="#" className="hover:text-gold transition-colors">Instagram</a></li>
              <li><a href={SITE_CONTACT.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 md:pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="text-slate-400 text-[10px] md:text-xs text-center">
            &copy; {new Date().getFullYear()} Blessing Event. Lubumbashi, RDC. Immatriculé au RCCM.
          </div>

          <div className="flex space-x-4 md:space-x-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-navy">
             <a href="#" className="hover:text-gold transition-custom">Mentions Légales</a>
             <a href="#" className="hover:text-gold transition-custom">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
