
import React from 'react';

const Methodology: React.FC = () => {
  const steps = [
    { name: "L'Écoute", desc: "Analyse profonde de vos attentes et de votre budget." },
    { name: "La Conception", desc: "Présentation d'un concept visuel et d'un devis détaillé." },
    { name: "La Réalisation", desc: "Mise en place technique et répétitions protocolaires." },
    { name: "Le Suivi", desc: "Présence de nos superviseurs jusqu'au départ du dernier invité." }
  ];

  return (
    <section id="methodology-preview" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="md:w-1/3">
             <h3 className="reveal-fade-up text-gold tracking-[0.2em] font-semibold text-sm uppercase mb-4" data-delay="0ms">Notre Processus</h3>
             <h2 className="reveal-fade-up text-4xl font-bold text-navy mb-6" data-delay="150ms">Votre Projet, Notre Méthodologie</h2>
             <p className="reveal-fade-up text-slate-600 mb-8" data-delay="300ms">Un événement mémorable est une "bénédiction" que nous mettons en scène avec une précision mathématique.</p>
             <div className="reveal-fade-up" data-delay="450ms">
               <a href="#methodology" className="inline-flex items-center text-gold font-bold text-xs uppercase tracking-widest hover:gap-4 gap-2 transition-all group">
                  Étudier notre méthode complète <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
               </a>
             </div>
          </div>
          <div className="md:w-2/3 grid gap-8">
            {steps.map((step, idx) => (

              <div 
                key={idx} 
                className="reveal-fade-up flex gap-6 items-start group"
                data-delay={`${idx * 150}ms`}
              >

                <div className="text-4xl font-serif font-bold text-slate-100 group-hover:text-gold transition-custom">0{idx + 1}</div>
                <div className="pt-2">
                  <h4 className="text-xl font-bold text-navy mb-2 tracking-wide uppercase">{step.name}</h4>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
