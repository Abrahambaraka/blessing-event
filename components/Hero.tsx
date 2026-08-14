
import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="accueil" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-navy">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40"
          aria-hidden="true"
        >
          <source src="/videos/BE001.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-navy/80"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white">
        <h1 className="reveal-fade-up text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 tracking-tight" data-delay="0ms">
          BLESSING EVENT
        </h1>
        <p className="reveal-fade-up text-gold text-sm sm:text-base md:text-lg lg:text-2xl font-serif italic mb-8 md:mb-12 max-w-2xl mx-auto tracking-wide md:tracking-widest px-4" data-delay="150ms">
          L'Excellence du Protocole, l'Art de Recevoir
        </p>
        
        <div className="reveal-fade-up flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-4" data-delay="300ms">

          <a
            href="#contact"
            className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-gold text-white font-semibold tracking-wide md:tracking-widest uppercase text-xs md:text-sm hover:bg-white hover:text-navy transition-custom text-center"
          >
            Contactez L'Excellence
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 border border-white/50 text-white font-semibold tracking-wide md:tracking-widest uppercase text-xs md:text-sm hover:bg-white/10 transition-custom text-center"
          >
            Nos Services
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-white/50 w-6 h-6 md:w-8 md:h-8" />
      </div>
    </section>
  );
};

export default Hero;
