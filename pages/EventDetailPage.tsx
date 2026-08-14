import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import TicketSelector from '../components/ticketing/TicketSelector';
import { fetchEvent } from '../src/services/ticketingService';
import { calculateOrderFees, formatPrice, getTicketCurrency } from '../src/lib/fees';
import type { CartItem, Event, Participant } from '../src/types/ticketing';
import VoteModal from '../src/components/ticketing/VoteModal';

interface EventDetailPageProps {
  eventSlug: string;
  onNavigate: (path: string) => void;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ eventSlug, onNavigate }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartError, setCartError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [voteSuccess, setVoteSuccess] = useState('');

  useEffect(() => {
    fetchEvent(eventSlug).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [eventSlug]);

  const handleVoteSuccess = () => {
    setVoteSuccess('Votre vote a été comptabilisé avec succès ! Merci de votre soutien.');
    fetchEvent(eventSlug).then(setEvent);
    setTimeout(() => setVoteSuccess(''), 5000);
  };

  if (loading) {
    return (
      <div className="pt-32 text-center text-slate-400 min-h-screen">Chargement...</div>
    );
  }

  if (!event) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <p className="text-slate-500 mb-4">Événement introuvable.</p>
        <button onClick={() => onNavigate('events')} className="text-gold font-bold text-sm uppercase tracking-widest">
          ← Retour aux événements
        </button>
      </div>
    );
  }

  const feeItems = cart.map((item) => {
    const tt = event.ticketTypes.find((t) => t.id === item.ticketTypeId)!;
    return {
      ticketTypeId: item.ticketTypeId,
      name: tt.name,
      quantity: item.quantity,
      unitPrice: tt.price,
      currency: getTicketCurrency(tt, event),
    };
  });
  const orderCurrency = feeItems[0]?.currency ?? event.currency;
  const fees = calculateOrderFees(feeItems, event.feeMode, event.currency);
  const totalTickets = cart.reduce((s, c) => s + c.quantity, 0);
  const totalSold = event.ticketTypes.reduce((s, tt) => s + tt.sold, 0);

  const handleCartChange = (newCart: CartItem[]) => {
    setCartError('');
    const currencies = new Set(
      newCart.map((c) => {
        const tt = event.ticketTypes.find((t) => t.id === c.ticketTypeId)!;
        return getTicketCurrency(tt, event);
      })
    );
    if (currencies.size > 1) {
      setCartError('Veuillez réserver les billets en FC et en USD séparément.');
      return;
    }
    setCart(newCart);
  };

  const handleReserve = () => {
    if (totalTickets === 0) return;
    sessionStorage.setItem('be_checkout_cart', JSON.stringify({ eventId: event.id, cart }));
    onNavigate(`checkout/${event.slug}`);
  };

  return (
    <div className="pt-24 md:pt-28 pb-16 md:pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <button
          onClick={() => onNavigate('events')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-gold mb-6 transition-custom"
        >
          <ArrowLeft size={16} /> Retour aux événements
        </button>

        <div className="grid lg:grid-cols-5 gap-8 md:gap-12">
          <div className="lg:col-span-3">
            <div className="rounded-xl overflow-hidden mb-6 shadow-lg bg-navy">
              <img src={event.imageUrl} alt={event.title} className="w-full h-64 md:h-96 object-contain object-center" />
            </div>
            <h1 className="font-serif text-2xl md:text-4xl text-navy mb-4">{event.title}</h1>
            <p className="text-slate-600 leading-relaxed mb-6">{event.description}</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-100">
                <Calendar size={20} className="text-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Date</p>
                  <p className="text-sm font-medium text-navy">
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' — '}
                    {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-100">
                <MapPin size={20} className="text-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Lieu</p>
                  <p className="text-sm font-medium text-navy">{event.venue}, {event.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-100">
                <Users size={20} className="text-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Places</p>
                  <p className="text-sm font-medium text-navy">{totalSold} / {event.capacity}</p>
                </div>
              </div>
            </div>

            {voteSuccess && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 font-medium rounded-lg">
                {voteSuccess}
              </div>
            )}

            {event.participants && event.participants.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-2xl text-navy mb-6">Soutenez vos candidats favoris</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {event.participants.map((participant) => (
                    <div key={participant.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                      {participant.imageUrl ? (
                        <img src={participant.imageUrl} alt={participant.name} className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border-4 border-gold/20" />
                      ) : (
                        <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4 text-2xl font-bold text-slate-400">
                          {participant.name.charAt(0)}
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-navy mb-1">{participant.name}</h3>
                      {participant.description && <p className="text-sm text-slate-500 mb-3">{participant.description}</p>}
                      <div className="inline-block bg-slate-50 px-3 py-1 rounded-full text-sm font-medium text-slate-600 mb-4">
                        {participant.voteCount} vote{participant.voteCount !== 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={() => setSelectedParticipant(participant)}
                        className="w-full py-2 bg-navy text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-navy/90 transition-colors"
                      >
                        Voter ({formatPrice(event.votePrice || 1, event.currency || 'USD')})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 md:p-6 sticky top-28">
              <h2 className="font-serif text-xl text-navy mb-4">Choisissez vos billets</h2>
              {cartError && (
                <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{cartError}</p>
              )}
              <TicketSelector event={event} cart={cart} onChange={handleCartChange} />

              {totalTickets > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Sous-total ({totalTickets} billet{totalTickets > 1 ? 's' : ''})</span>
                    <span>{formatPrice(fees.subtotal, orderCurrency)}</span>
                  </div>
                  {fees.totalFees > 0 && event.feeMode === 'buyer' && (
                    <div className="flex justify-between text-slate-600">
                      <span>Frais de billetterie</span>
                      <span>{formatPrice(fees.totalFees, orderCurrency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-navy text-base pt-2">
                    <span>Total</span>
                    <span>{formatPrice(fees.total, orderCurrency)}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleReserve}
                disabled={totalTickets === 0}
                className="w-full mt-6 py-4 bg-gold text-white font-bold text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition-custom"
              >
                {fees.total === 0 ? 'Réserver gratuitement' : 'Continuer vers le paiement'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {selectedParticipant && (
        <VoteModal 
          event={event} 
          participant={selectedParticipant} 
          onClose={() => setSelectedParticipant(null)}
          onSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
