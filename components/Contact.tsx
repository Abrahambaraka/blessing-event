
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Créer le corps de l'email
    const name = formData.get('name');
    const email = formData.get('email');
    const eventType = formData.get('eventType');
    const message = formData.get('message');
    
    const emailBody = `
Nouvelle demande de devis - Blessing Event

Nom: ${name}
Email: ${email}
Type d'événement: ${eventType}

Message:
${message}

---
Envoyé depuis le site Blessing Event
    `.trim();

    try {
      // Utiliser mailto comme solution temporaire
      const mailtoLink = `mailto:blessingevent001@gmail.com?subject=Demande de devis - ${eventType}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      
      setSubmitStatus('success');
      form.reset();
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="py-12 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
          {/* Info Side */}
          <div className="bg-navy p-6 md:p-12 lg:w-2/5 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gold/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 font-serif">Contactez L'Excellence</h2>
              <p className="text-slate-400 mb-8 md:mb-12 text-sm md:text-base">Prêt à marquer les esprits ? Donnez à votre événement la dimension qu'il mérite.</p>
              
              <div className="space-y-5 md:space-y-8">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="bg-white/10 p-2 md:p-3 rounded-lg text-gold flex-shrink-0"><MapPin size={20} className="md:w-6 md:h-6" /></div>
                  <div>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-gold font-bold mb-1">Bureau</p>
                    <p className="text-xs md:text-sm">Q/CRAA; Av. kaposo N°01; Lubumbashi, Haut-Katanga; RDC</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="bg-white/10 p-2 md:p-3 rounded-lg text-gold flex-shrink-0"><Phone size={20} className="md:w-6 md:h-6" /></div>
                  <div>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-gold font-bold mb-1">Lignes Directes</p>
                    <p className="text-xs md:text-sm">+243 83 86 48 799</p>
                    <p className="text-xs md:text-sm">+243 80 10 52 054</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="bg-white/10 p-2 md:p-3 rounded-lg text-gold flex-shrink-0"><Mail size={20} className="md:w-6 md:h-6" /></div>
                  <div>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-gold font-bold mb-1">Email</p>
                    <p className="text-xs md:text-sm break-all">blessingevent001@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 relative z-10">
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-gold font-bold mb-3 md:mb-4">Réseaux Sociaux</p>
              <div className="flex space-x-3 md:space-x-4">
                <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold transition-custom"><Instagram size={18} className="md:w-5 md:h-5" /></a>
                <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold transition-custom"><Facebook size={18} className="md:w-5 md:h-5" /></a>
                <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold transition-custom"><Linkedin size={18} className="md:w-5 md:h-5" /></a>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-6 md:p-12 lg:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="name" className="block text-[10px] md:text-xs uppercase tracking-widest text-navy font-bold mb-2">Nom Complet</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-gold outline-none transition-custom" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[10px] md:text-xs uppercase tracking-widest text-navy font-bold mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-gold outline-none transition-custom" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div>
                <label htmlFor="eventType" className="block text-[10px] md:text-xs uppercase tracking-widest text-navy font-bold mb-2">Type d'Événement</label>
                <select 
                  id="eventType"
                  name="eventType"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-gold outline-none transition-custom"
                >
                  <option>Mariage de Prestige</option>
                  <option>Sommet Institutionnel</option>
                  <option>Soirée de Gala</option>
                  <option>Lancement de Produit</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-[10px] md:text-xs uppercase tracking-widest text-navy font-bold mb-2">Votre Message</label>
                <textarea 
                  id="message"
                  name="message"
                  required
                  rows={4} 
                  className="w-full bg-slate-50 border border-slate-200 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-gold outline-none transition-custom" 
                  placeholder="Parlez-nous de votre vision..."
                ></textarea>
              </div>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm">
                  ✓ Votre demande a été envoyée avec succès ! Nous vous répondrons dans les plus brefs délais.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                  ✗ Une erreur s'est produite. Veuillez réessayer ou nous contacter directement par téléphone.
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 md:py-4 bg-navy text-white font-bold tracking-[0.15em] md:tracking-[0.2em] uppercase text-xs md:text-sm hover:bg-gold transition-custom shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma Demande'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
