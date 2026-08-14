
import React from 'react';
import Contact from '../components/Contact';
import { HelpCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { SITE_CONTACT } from '../src/constants/contact';

const ContactPage: React.FC = () => {
  const faqs = [
    { q: "Quels sont vos délais pour organiser un mariage ?", a: "Pour un mariage de prestige, nous recommandons de nous contacter au moins 3 semaines ou 1 mois à l'avance, bien que nous puissions gérer des demandes urgentes sous conditions." },
    { q: "Travaillez-vous en dehors de Lubumbashi ?", a: "Oui, nous intervenons dans toute la République Démocratique du Congo, particulièrement à Kinshasa, Kolwezi, Goma, Bukavu, Kisangani, Kasumbalesa, Likasi, Kananga et Mbuji-Mayi..." },
    { q: "Proposez-vous la location de matériel seule ?", a: "Nous privilégions les prestations complètes avec mise en place, afin de garantir l'excellence du rendu final." }
  ];

  return (
    <div className="pt-16 md:pt-20">
      <section className="bg-navy py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">Écrivons Votre Histoire</h1>
              <p className="text-gold text-base md:text-lg max-w-2xl mx-auto font-serif italic px-4">Prenez rendez-vous avec l'excellence pour vos futurs projets.</p>
          </div>
      </section>

      <div className="bg-white">
        <Contact />
      </div>

      <section className="py-12 md:py-24 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
              <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
                  <div className="lg:col-span-1 space-y-6 md:space-y-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-navy">Informations Utiles</h2>
                      <div className="space-y-4 md:space-y-6">
                          <div className="flex items-center space-x-3 md:space-x-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gold flex-shrink-0"><Clock size={18} className="md:w-5 md:h-5" /></div>
                              <div>
                                  <p className="font-bold text-navy text-sm md:text-base">Heures d'Ouverture</p>
                                  <p className="text-slate-500 text-xs md:text-sm">Lun - Ven : 08h00 - 18h00</p>
                              </div>
                          </div>
                          <div className="flex items-center space-x-3 md:space-x-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gold flex-shrink-0"><MapPin size={18} className="md:w-5 md:h-5" /></div>
                              <div>
                                  <p className="font-bold text-navy text-sm md:text-base">Bureau Local</p>
                                  <p className="text-slate-500 text-xs md:text-sm">{SITE_CONTACT.addressShort}</p>
                              </div>
                          </div>
                          <div className="flex items-center space-x-3 md:space-x-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gold flex-shrink-0"><Phone size={18} className="md:w-5 md:h-5" /></div>
                              <div>
                                  <p className="font-bold text-navy text-sm md:text-base">Téléphone</p>
                                  <a href={SITE_CONTACT.phoneTel} className="text-slate-500 text-xs md:text-sm hover:text-gold transition-colors">
                                    {SITE_CONTACT.phone}
                                  </a>
                              </div>
                          </div>
                          <div className="flex items-center space-x-3 md:space-x-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gold flex-shrink-0"><Mail size={18} className="md:w-5 md:h-5" /></div>
                              <div>
                                  <p className="font-bold text-navy text-sm md:text-base">Email</p>
                                  <a href={`mailto:${SITE_CONTACT.email}`} className="text-slate-500 text-xs md:text-sm hover:text-gold transition-colors break-all">
                                    {SITE_CONTACT.email}
                                  </a>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-2">
                      <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6 md:mb-12 flex items-center">
                          <HelpCircle className="mr-3 md:mr-4 text-gold flex-shrink-0" size={24} /> Questions Fréquentes
                      </h2>
                      <div className="space-y-4 md:space-y-6">
                          {faqs.map((faq, i) => (
                              <div key={i} className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
                                  <h4 className="text-base md:text-lg font-bold text-navy mb-2 md:mb-3">{faq.q}</h4>
                                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">{faq.a}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[250px] md:h-[400px] bg-slate-200 relative">
          <div className="absolute inset-0 flex items-center justify-center bg-navy/5">
              <div className="text-center px-4">
                  <MapPin size={36} className="md:w-12 md:h-12 text-gold mx-auto mb-3 md:mb-4 animate-bounce" />
                  <p className="text-navy font-bold uppercase tracking-widest text-sm md:text-base">Lubumbashi, Haut-Katanga, RDC</p>
                  <p className="text-slate-500 text-xs md:text-sm mt-2">Visitez-nous sur rendez-vous</p>
              </div>
          </div>
          {/* Real Map would be integrated here */}
          <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-20 grayscale" alt="Map background" />
      </section>
    </div>
  );
};

export default ContactPage;
