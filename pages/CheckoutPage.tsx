import React, { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, CheckCircle, Mail } from 'lucide-react';
import TicketDisplay from '../components/ticketing/TicketDisplay';
import { fetchEvent, createOrder, completePayment } from '../src/services/ticketingService';
import { formatPrice } from '../src/lib/fees';
import type { Attendee, CartItem, Event, Order, Ticket } from '../src/types/ticketing';

interface CheckoutPageProps {
  eventSlug: string;
  onNavigate: (path: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ eventSlug, onNavigate }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalTickets = cart.reduce((s, c) => s + c.quantity, 0);

  useEffect(() => {
    const saved = sessionStorage.getItem('be_checkout_cart');
    if (!saved) {
      onNavigate(`events/${eventSlug}`);
      return;
    }
    const { eventId, cart: savedCart } = JSON.parse(saved);
    setCart(savedCart);

    fetchEvent(eventSlug).then((ev) => {
      if (!ev || ev.id !== eventId) {
        onNavigate('events');
        return;
      }
      setEvent(ev);

      const list: Attendee[] = [];
      savedCart.forEach((item: CartItem) => {
        for (let i = 0; i < item.quantity; i++) {
          list.push({ firstName: '', lastName: '', email: '' });
        }
      });
      setAttendees(list);
    });
  }, [eventSlug, onNavigate]);

  const updateAttendee = (index: number, field: keyof Attendee, value: string) => {
    setAttendees((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validateForm = (): boolean => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError('Veuillez renseigner votre nom et email.');
      return false;
    }
    for (const a of attendees) {
      if (!a.firstName.trim() || !a.lastName.trim() || !a.email.trim()) {
        setError('Veuillez remplir les informations de tous les participants.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSubmitForm = async () => {
    if (!event || !validateForm()) return;
    setLoading(true);

    const attendeesWithBuyer = attendees.map((a, i) =>
      i === 0 && !a.email ? { ...a, email: buyerEmail } : a
    );

    try {
      const newOrder = await createOrder(
        event,
        cart,
        { name: buyerName, email: buyerEmail },
        attendeesWithBuyer
      );
      setOrder(newOrder);

      if (newOrder.status === 'paid') {
        const { tickets: issued } = await completePayment(newOrder.id);
        setTickets(issued);
        setStep('success');
        sessionStorage.removeItem('be_checkout_cart');
      } else {
        setStep('payment');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la commande');
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!order) return;
    setLoading(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 1200));
      const { order: paidOrder, tickets: issued } = await completePayment(order.id);
      setOrder(paidOrder);
      setTickets(issued);
      setStep('success');
      sessionStorage.removeItem('be_checkout_cart');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Paiement échoué');
    }
    setLoading(false);
  };

  if (!event) {
    return <div className="pt-32 text-center text-slate-400 min-h-screen">Chargement...</div>;
  }

  if (step === 'success') {
    return (
      <div className="pt-24 md:pt-32 pb-16 min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="font-serif text-3xl text-navy mb-2">Réservation confirmée !</h1>
          <p className="text-slate-500 mb-8 flex items-center justify-center gap-2">
            <Mail size={16} /> Un e-mail de confirmation a été envoyé à {buyerEmail}
          </p>

          <div className="space-y-6 mb-10">
            {tickets.map((t) => (
              <TicketDisplay key={t.id} ticket={t} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('my-tickets')}
              className="px-8 py-3 bg-navy text-white text-sm font-bold uppercase tracking-widest rounded-lg"
            >
              Mes billets
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="px-8 py-3 border border-navy text-navy text-sm font-bold uppercase tracking-widest rounded-lg"
            >
              Autres événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <button
          onClick={() => onNavigate(`events/${eventSlug}`)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-gold mb-6"
        >
          <ArrowLeft size={16} /> Modifier la sélection
        </button>

        <h1 className="font-serif text-2xl md:text-3xl text-navy mb-2">
          {step === 'payment' ? 'Paiement' : 'Informations'}
        </h1>
        <p className="text-slate-500 text-sm mb-8">{event.title} — {totalTickets} billet{totalTickets > 1 ? 's' : ''}</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        {step === 'form' && (
          <div className="space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-100">
              <h2 className="font-semibold text-navy mb-4">Acheteur</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:border-gold focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-100">
              <h2 className="font-semibold text-navy mb-4">Participants ({attendees.length})</h2>
              <div className="space-y-4">
                {attendees.map((a, i) => (
                  <div key={i} className="grid sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={a.firstName}
                      onChange={(e) => updateAttendee(i, 'firstName', e.target.value)}
                      className="px-4 py-3 border border-slate-200 rounded-lg focus:border-gold focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Nom"
                      value={a.lastName}
                      onChange={(e) => updateAttendee(i, 'lastName', e.target.value)}
                      className="px-4 py-3 border border-slate-200 rounded-lg focus:border-gold focus:outline-none text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={a.email}
                      onChange={(e) => updateAttendee(i, 'email', e.target.value)}
                      className="px-4 py-3 border border-slate-200 rounded-lg focus:border-gold focus:outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={loading}
              className="w-full py-4 bg-gold text-white font-bold text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-gold/90 disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Confirmer et continuer'}
            </button>
          </div>
        )}

        {step === 'payment' && order && (
          <div className="space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-600">Total à payer</span>
                <span className="text-2xl font-bold text-navy">{formatPrice(order.total, order.currency)}</span>
              </div>

              <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                <CreditCard size={14} />
                Mode démo — intégration paiement via API à brancher.
              </p>

              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-navy text-white font-bold text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-navy/90 disabled:opacity-50"
              >
                {loading ? 'Paiement en cours...' : `Payer ${formatPrice(order.total, order.currency)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
