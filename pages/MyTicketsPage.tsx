import React, { useState } from 'react';
import { Search, Ticket } from 'lucide-react';
import TicketDisplay from '../components/ticketing/TicketDisplay';
import { fetchTicketsByEmail } from '../src/services/ticketingService';
import type { Ticket as TicketType } from '../src/types/ticketing';

const MyTicketsPage: React.FC = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('be_buyer_email') ?? '');
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    localStorage.setItem('be_buyer_email', email.trim());
    const results = await fetchTicketsByEmail(email.trim());
    setTickets(results);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="pt-24 md:pt-32 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy/10 mb-4">
            <Ticket size={28} className="text-navy" />
          </div>
          <h1 className="font-serif text-3xl text-navy mb-2">Mes billets</h1>
          <p className="text-slate-500 text-sm">Retrouvez vos e-billets avec l'email utilisé lors de l'achat</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:border-gold focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-navy text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-navy/90 disabled:opacity-50"
          >
            {loading ? '...' : 'Chercher'}
          </button>
        </form>

        {searched && tickets.length === 0 && (
          <p className="text-center text-slate-500">Aucun billet trouvé pour cet email.</p>
        )}

        <div className="space-y-4">
          {tickets.map((t) => (
            <TicketDisplay key={t.id} ticket={t} compact />
          ))}
        </div>

        {tickets.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="font-serif text-xl text-navy text-center">Détail des billets</h2>
            {tickets.map((t) => (
              <TicketDisplay key={`full-${t.id}`} ticket={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
