
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about-preview" className="py-12 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="reveal-fade-up relative order-2 md:order-1">
            <div className="absolute -top-6 -left-6 md:-top-10 md:-left-10 w-40 h-40 md:w-64 md:h-64 bg-slate-100 -z-10 rounded-full"></div>
            <div className="hover-zoom-container rounded-lg shadow-2xl border-4 md:border-8 border-white relative z-10 w-full h-auto">
              <img
                src="/calot-protocole.png"
                alt="Calot Protocole Blessing Event"
                className="w-full h-auto hover-zoom-img"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-navy p-4 md:p-8 text-white z-20 shadow-xl">
              <p className="text-xl md:text-3xl font-bold font-serif mb-1">5 Ans</p>
              <p className="text-gold text-[10px] md:text-xs tracking-widest uppercase">D'Expertise Terrain</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 order-1 md:order-2">
            <div className="reveal-fade-up" data-delay="0ms">
              <h3 className="text-gold tracking-[0.15em] md:tracking-[0.2em] font-semibold text-xs md:text-sm uppercase">Avant-Propos</h3>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy leading-tight mt-2">
                Redéfinir l'Événementiel par la Distinction
              </h2>
              <div className="w-16 md:w-20 h-1 bg-gold mt-4 mb-2"></div>
            </div>
            
            <p className="reveal-fade-up text-slate-600 leading-relaxed text-sm md:text-lg italic" data-delay="150ms">
              "Bienvenue dans l'univers de Blessing Event. Notre mission est simple : transformer vos rassemblements en moments de grâce."
            </p>
            
            <p className="reveal-fade-up text-slate-600 leading-relaxed text-sm md:text-base" data-delay="300ms">
              Depuis notre lancement il y a maintenant cinq ans, Blessing Event s'est donné pour mission de porter l'art de recevoir à un niveau de prestige inédit en République Démocratique du Congo.
            </p>

            <div className="reveal-fade-up pt-2 md:pt-4" data-delay="450ms">
              <a href="#about" className="inline-block w-full sm:w-auto text-center px-8 md:px-10 py-3 md:py-4 bg-navy text-white hover:bg-gold transition-custom font-bold text-xs tracking-wide md:tracking-widest uppercase shadow-lg">
                Découvrir Notre Histoire
              </a>
            </div>

            <div className="reveal-fade-up pt-4 md:pt-6 border-t border-slate-100 flex items-center space-x-4" data-delay="600ms">

               <div className="flex-1">
                 <p className="font-bold text-navy text-sm md:text-base">Lubumbashi, RDC</p>
                 <p className="text-slate-500 text-xs md:text-sm italic">Province du Haut-Katanga</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
