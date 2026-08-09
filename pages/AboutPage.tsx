
import React from 'react';
import { Target, Eye, Award, MapPin } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="pt-16 md:pt-20">
      {/* Header */}
      <section className="bg-navy py-12 md:py-24 relative overflow-hidden hover-zoom-container">
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover hover-zoom-img" alt="Business meeting" />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="reveal-fade-up text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6" data-delay="0ms">Notre Histoire</h1>
          <p className="reveal-fade-up text-gold font-serif italic text-base md:text-xl max-w-2xl mx-auto px-4" data-delay="150ms">5 ans d'excellence au service de vos moments les plus précieux.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center mb-12 md:mb-24">
            <div className="space-y-4 md:space-y-6">
              <h2 className="reveal-fade-up text-xl md:text-3xl font-bold text-navy uppercase tracking-wide md:tracking-widest border-b-2 border-gold pb-3 md:pb-4 inline-block" data-delay="0ms">Qui Sommes-Nous ?</h2>
              <p className="reveal-fade-up text-slate-600 leading-relaxed text-sm md:text-lg" data-delay="150ms">
                Basée à Lubumbashi, dans la province du Haut-Katanga, <strong>Blessing Event</strong> est une agence événementielle 360° spécialisée dans l'ingénierie de haut niveau, le protocole et l'art de recevoir.
              </p>
              <p className="reveal-fade-up text-slate-600 leading-relaxed text-sm md:text-base" data-delay="300ms">
                Depuis notre création, nous nous efforçons de redéfinir les standards de l'événementiel en République Démocratique du Congo. Notre approche combine la rigueur institutionnelle et le raffinement artistique pour offrir des expériences uniques, qu'il s'agisse de mariages somptueux ou de sommets diplomatiques.
              </p>
            </div>
            <div className="reveal-fade-up relative" data-delay="450ms">
                <div className="hover-zoom-container rounded-lg shadow-2xl w-full h-auto">
                    <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000" className="w-full h-auto hover-zoom-img" alt="Event setup" />
                </div>
                <div className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 bg-gold p-4 md:p-6 text-white hidden sm:block z-10">
                    <p className="text-2xl md:text-4xl font-bold font-serif">#1</p>
                    <p className="text-[10px] md:text-xs uppercase tracking-tighter">Référence Protocole</p>
                </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            <div className="reveal-fade-up bg-slate-50 p-6 md:p-12 rounded-xl border-l-4 border-navy shadow-sm" data-delay="0ms">
                <div className="text-gold mb-4 md:mb-6"><Target size={32} className="md:w-10 md:h-10" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-navy mb-3 md:mb-4 uppercase tracking-wide">Notre Mission</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    Accompagner nos clients dans la réalisation de leurs projets les plus ambitieux en garantissant une exécution sans faille, un respect strict des codes protocolaires et une satisfaction totale des invités.
                </p>
            </div>
            <div className="reveal-fade-up bg-slate-50 p-6 md:p-12 rounded-xl border-l-4 border-gold shadow-sm" data-delay="150ms">
                <div className="text-navy mb-4 md:mb-6"><Eye size={32} className="md:w-10 md:h-10" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-navy mb-3 md:mb-4 uppercase tracking-wide">Notre Vision</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    Devenir le leader incontesté de l'événementiel de prestige en Afrique Centrale, reconnu pour notre innovation, notre intégrité et notre capacité à sublimer chaque détail.
                </p>
            </div>
          </div>

        </div>
      </section>

      {/* Expertise */}
      <section className="py-12 md:py-24 bg-navy text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
              <h2 className="reveal-fade-up text-2xl md:text-3xl font-bold mb-8 md:mb-16 uppercase tracking-wide md:tracking-widest" data-delay="0ms">Pourquoi Nous Choisir ?</h2>
              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                  <div className="reveal-fade-up space-y-3 md:space-y-4" data-delay="0ms">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gold/20 flex items-center justify-center rounded-full mx-auto text-gold"><Award size={28} className="md:w-8 md:h-8" /></div>
                      <h4 className="text-lg md:text-xl font-bold">Rigueur Protocolaire</h4>
                      <p className="text-slate-400 text-xs md:text-sm px-2 md:px-0">Une maîtrise parfaite de l'étiquette pour vos événements officiels et privés.</p>
                  </div>
                  <div className="reveal-fade-up space-y-3 md:space-y-4" data-delay="150ms">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gold/20 flex items-center justify-center rounded-full mx-auto text-gold"><MapPin size={28} className="md:w-8 md:h-8" /></div>
                      <h4 className="text-lg md:text-xl font-bold">Ancrage Local</h4>
                      <p className="text-slate-400 text-xs md:text-sm px-2 md:px-0">Une connaissance approfondie du terrain et des partenaires à Lubumbashi.</p>
                  </div>
                  <div className="reveal-fade-up space-y-3 md:space-y-4" data-delay="300ms">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gold/20 flex items-center justify-center rounded-full mx-auto text-gold"><Target size={28} className="md:w-8 md:h-8" /></div>
                      <h4 className="text-lg md:text-xl font-bold">Sur-Mesure</h4>
                      <p className="text-slate-400 text-xs md:text-sm px-2 md:px-0">Chaque projet est une œuvre d'art unique, adaptée à vos besoins spécifiques.</p>
                  </div>
              </div>
          </div>
      </section>

    </div>
  );
};

export default AboutPage;

