
import React from 'react';
import { SERVICES, ICON_MAP } from '../constants';

const ServicesPage: React.FC = () => {
  return (
    <div className="pt-16 md:pt-20">
      <section className="bg-slate-50 py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10 md:mb-16">
            <h1 className="reveal-fade-up text-3xl md:text-5xl font-bold text-navy mb-4 md:mb-6" data-delay="0ms">Nos Domaines d'Expertise</h1>
            <p className="reveal-fade-up text-slate-600 text-base md:text-xl leading-relaxed" data-delay="150ms">
              Une offre globale pour une sérénité totale. Nous couvrons tous les aspects de votre événement avec une exigence de perfection.
            </p>
          </div>

          <div className="space-y-12 md:space-y-20">
            {SERVICES.map((service, idx) => {
              const Icon = ICON_MAP[service.icon];
              return (
                <div key={service.id} className={`reveal-fade-up flex flex-col ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 md:gap-12 items-center`}>
                  <div className="lg:w-1/2 w-full">
                    <div className="hover-zoom-container relative group rounded-lg md:rounded-2xl shadow-2xl">
                        <img src={service.image} alt={service.title} className="w-full h-[250px] md:h-[400px] object-cover hover-zoom-img" />
                        <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors hover-zoom-overlay"></div>
                    </div>
                  </div>
                  <div className="lg:w-1/2 w-full space-y-4 md:space-y-6">
                    <div className="reveal-fade-up flex items-center space-x-3 md:space-x-4 text-gold" data-delay="0ms">
                        <Icon size={24} className="md:w-8 md:h-8 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase">{service.subtitle}</span>
                    </div>
                    <h2 className="reveal-fade-up text-2xl md:text-4xl font-bold text-navy font-serif" data-delay="100ms">{service.title}</h2>
                    <div className="reveal-fade-up w-12 md:w-16 h-1 bg-gold" data-delay="200ms"></div>
                    <p className="reveal-fade-up text-slate-600 text-sm md:text-lg leading-relaxed" data-delay="300ms">
                        {service.description}
                    </p>
                    <ul className="reveal-fade-up grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4" data-delay="400ms">
                        <li className="flex items-center text-xs md:text-sm text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gold rounded-full mr-2 md:mr-3 flex-shrink-0"></span>
                            Expertise technique
                        </li>
                        <li className="flex items-center text-xs md:text-sm text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gold rounded-full mr-2 md:mr-3 flex-shrink-0"></span>
                            Gestion de projet
                        </li>
                        <li className="flex items-center text-xs md:text-sm text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gold rounded-full mr-2 md:mr-3 flex-shrink-0"></span>
                            Suivi opérationnel
                        </li>
                        <li className="flex items-center text-xs md:text-sm text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gold rounded-full mr-2 md:mr-3 flex-shrink-0"></span>
                            Innovation digitale
                        </li>
                    </ul>
                    <div className="reveal-fade-up pt-4 md:pt-6" data-delay="500ms">
                        <a href="#contact" className="inline-block w-full sm:w-auto text-center px-6 md:px-8 py-2.5 md:py-3 bg-navy text-white hover:bg-gold transition-colors font-bold text-xs md:text-sm tracking-wide md:tracking-widest uppercase">
                            Demander un Devis
                        </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-navy text-center">
        <div className="container mx-auto px-4 md:px-6">
            <h2 className="reveal-fade-up text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-4 md:mb-8 px-4" data-delay="0ms">Un besoin spécifique ?</h2>
            <p className="reveal-fade-up text-slate-400 max-w-2xl mx-auto mb-8 md:mb-12 text-sm md:text-base px-4" data-delay="150ms">Notre bureau d'études est à votre disposition pour concevoir des solutions sur-mesure adaptées à vos contraintes les plus strictes.</p>
            <div className="reveal-fade-up" data-delay="300ms">
              <a href="#contact" className="inline-block border-2 border-gold text-gold hover:bg-gold hover:text-white px-8 md:px-12 py-3 md:py-4 font-bold tracking-[0.15em] md:tracking-[0.2em] transition-all uppercase text-xs md:text-sm">
                  Consulter Nos Experts
              </a>
            </div>
        </div>
      </section>


    </div>
  );
};

export default ServicesPage;
