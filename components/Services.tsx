
import React from 'react';
import { SERVICES, ICON_MAP } from '../constants';

const Services: React.FC = () => {
  return (
    <section id="services-preview" className="py-12 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-20">
          <h3 className="reveal-fade-up text-gold tracking-[0.15em] md:tracking-[0.2em] font-semibold text-xs md:text-sm uppercase mb-3 md:mb-4" data-delay="0ms">Ingénierie de haut niveau</h3>
          <h2 className="reveal-fade-up text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy px-4" data-delay="150ms">Nos Services 360°</h2>
          <div className="reveal-fade-up w-16 md:w-24 h-1 bg-gold mx-auto mt-4 md:mt-6" data-delay="300ms"></div>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-10">
          {SERVICES.map((service, index) => {
            const Icon = ICON_MAP[service.icon];
            return (
              <div 
                key={service.id} 
                className={`reveal-fade-up bg-white shadow-xl hover:shadow-2xl transition-custom overflow-hidden group ${index === 0 || index === 4 ? 'lg:col-span-2' : ''}`}
                data-delay={`${(index % 3) * 150}ms`}
              >
                <div className="flex flex-col md:flex-row h-full">

                  <div className={`hover-zoom-container relative w-full ${index === 0 || index === 4 ? 'md:w-1/2 h-48 md:h-auto' : 'h-48 md:h-64'}`}>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover hover-zoom-img"
                    />
                    <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/10 transition-custom hover-zoom-overlay"></div>
                  </div>
                  <div className={`p-5 md:p-8 flex flex-col justify-center ${index === 0 || index === 4 ? 'md:w-1/2' : 'w-full'}`}>
                    <div className="mb-3 md:mb-4 text-gold flex items-center space-x-2 md:space-x-3">
                      <Icon size={20} className="md:w-6 md:h-6 flex-shrink-0" />
                      <span className="text-[10px] md:text-xs font-bold tracking-wide md:tracking-widest uppercase">{service.subtitle}</span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-navy mb-3 md:mb-4 font-serif">{service.title}</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                      {service.description}
                    </p>
                    <a href="#services" className="text-gold font-bold text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest flex items-center hover:translate-x-2 transition-custom">
                      Détails de l'offre <span className="ml-2">→</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-10 md:mt-16 text-center px-4">
          <a href="#services" className="inline-block border-b-2 border-gold text-navy font-bold tracking-wide md:tracking-widest uppercase text-xs md:text-sm pb-1 hover:text-gold transition-custom">
            Consulter toute notre expertise
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
