
import React from 'react';
import { Search, PenTool, PlayCircle, ClipboardCheck } from 'lucide-react';

const MethodologyPage: React.FC = () => {
  const process = [
    {
      title: "Phase d'Écoute & Audit",
      icon: Search,
      desc: "Nous commençons par une immersion totale dans votre vision. Analyse du cahier des charges, définition des objectifs stratégiques et évaluation du budget.",
      details: ["Briefing initial", "Cadrage budgétaire", "Étude de faisabilité"]
    },
    {
      title: "Conception & Design",
      icon: PenTool,
      desc: "Notre bureau de création élabore un concept unique. Nous vous présentons des moodboards, des plans 2D/3D et une proposition financière détaillée.",
      details: ["Moodboard créatif", "Simulation spatiale", "Devis poste par poste"]
    },
    {
      title: "Coordination & Mise en Scène",
      icon: PlayCircle,
      desc: "L'ingénierie prend vie. Nous orchestrons les prestataires, gérons la logistique et effectuons les répétitions protocolaires pour une fluidité absolue.",
      details: ["Rétroplanning précis", "Briefing équipes", "Répétitions VIP"]
    },
    {
      title: "Supervision & Reporting",
      icon: ClipboardCheck,
      desc: "Le jour J, nos directeurs de production assurent une surveillance 360°. Après l'événement, nous fournissons un bilan complet de satisfaction.",
      details: ["Contrôle qualité direct", "Gestion des imprévus", "Débriefing post-event"]
    }
  ];

  return (
    <div className="pt-16 md:pt-20">
      <section className="py-12 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20">
            <h1 className="reveal-fade-up text-3xl md:text-5xl font-bold text-navy mb-4 md:mb-6 px-4" data-delay="0ms">Notre Méthode</h1>
            <p className="reveal-fade-up text-slate-600 text-sm md:text-lg px-4" data-delay="150ms">
                La réussite d'un événement n'est jamais le fruit du hasard. C'est l'aboutissement d'un processus rigoureux que nous avons baptisé "L'Ingénierie du Moment".
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-[50%] top-0 bottom-0 w-px bg-slate-200 hidden lg:block"></div>

            <div className="space-y-12 md:space-y-24">
              {process.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={idx} 
                    className={`reveal-fade-up flex flex-col lg:flex-row items-center gap-6 md:gap-12 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
                    data-delay={`${idx * 150}ms`}
                  >
                    <div className="lg:w-1/2 flex justify-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-gold rounded-full flex items-center justify-center text-navy shadow-xl relative z-10">
                            <Icon size={32} className="md:w-10 md:h-10" />
                            <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-7 h-7 md:w-8 md:h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                                {idx + 1}
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 space-y-3 md:space-y-4 text-center lg:text-left px-4 lg:px-0">
                        <h3 className="text-lg md:text-2xl font-bold text-navy uppercase tracking-wide">{step.title}</h3>
                        <p className="text-slate-600 leading-relaxed max-w-md mx-auto lg:mx-0 text-sm md:text-base">
                            {step.desc}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                            {step.details.map((detail, i) => (
                                <span key={i} className="px-2.5 md:px-3 py-1 bg-slate-100 text-slate-500 text-[10px] md:text-xs font-bold uppercase rounded-full">
                                    {detail}
                                </span>
                            ))}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-12 md:py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                  <h2 className="reveal-fade-up text-2xl md:text-4xl font-bold text-navy mb-4 md:mb-8" data-delay="0ms">La "Bénédiction" Opérationnelle</h2>
                  <p className="reveal-fade-up text-slate-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base" data-delay="150ms">
                      Notre nom n'est pas qu'une étiquette, c'est une promesse. Nous considérons chaque événement comme une bénédiction qui nous est confiée, et notre méthodologie est le bouclier qui protège cette grâce des aléas logistiques.
                  </p>
                  <blockquote className="reveal-fade-up border-l-4 border-gold pl-6 py-2 italic text-navy font-medium text-lg" data-delay="300ms">
                      "Le protocole est la grammaire de l'élégance."
                  </blockquote>
              </div>
              <div className="reveal-fade-up bg-navy p-12 text-white rounded-2xl" data-delay="200ms">
                  <h3 className="text-2xl font-bold mb-6 text-gold">Nos Engagements</h3>
                  <ul className="space-y-4">
                      <li className="flex items-start">
                          <span className="text-gold mr-3">✓</span>
                          <span>Ponctualité absolue des équipes.</span>
                      </li>
                      <li className="flex items-start">
                          <span className="text-gold mr-3">✓</span>
                          <span>Transparence budgétaire totale.</span>
                      </li>
                      <li className="flex items-start">
                          <span className="text-gold mr-3">✓</span>
                          <span>Confidentialité de vos échanges.</span>
                      </li>
                      <li className="flex items-start">
                          <span className="text-gold mr-3">✓</span>
                          <span>Élégance vestimentaire irréprochable.</span>
                      </li>
                  </ul>
              </div>
          </div>
      </section>


    </div>
  );
};

export default MethodologyPage;
