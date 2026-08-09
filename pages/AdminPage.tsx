import React, { useEffect, useState } from 'react';
import { BarChart3, Eye, EyeOff, Lock } from 'lucide-react';
import { fetchAllEvents, getEventStats, updateEventStatus } from '../src/services/ticketingService';
import { formatPrice } from '../src/lib/fees';
import type { Event } from '../src/types/ticketing';

const ADMIN_PIN = '2026';

const AdminPage: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authenticated) {
      fetchAllEvents().then(setEvents);
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Code incorrect');
    }
  };

  const toggleStatus = async (event: Event) => {
    const next = event.status === 'published' ? 'draft' : 'published';
    await updateEventStatus(event.id, next);
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, status: next } : e)));
  };

  if (!authenticated) {
    return (
      <div className="pt-24 md:pt-32 pb-16 min-h-screen bg-slate-50 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <Lock size={32} className="text-navy mx-auto mb-3" />
            <h1 className="font-serif text-2xl text-navy">Administration</h1>
            <p className="text-sm text-slate-500 mt-1">Accès réservé Blessing Event</p>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Code d'accès"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg mb-4 focus:border-gold focus:outline-none text-center font-mono"
          />
          {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}
          <button type="submit" className="w-full py-3 bg-navy text-white text-sm font-bold uppercase tracking-widest rounded-lg">
            Connexion
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-4">Démo : code {ADMIN_PIN}</p>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-navy">Tableau de bord</h1>
            <p className="text-sm text-slate-500">Gestion des événements et billetterie</p>
          </div>
          <a
            href="#checkin"
            className="px-4 py-2 bg-gold text-white text-xs font-bold uppercase tracking-widest rounded-lg"
          >
            Contrôle d'accès →
          </a>
        </div>

        <div className="grid gap-4">
          {events.map((event) => {
            const stats = getEventStats(event.id);
            return (
              <div key={event.id} className="bg-white p-5 md:p-6 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-navy">{event.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {event.status === 'published' ? 'Publié' : event.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(event.date).toLocaleDateString('fr-FR')} — {event.venue}
                  </p>
                  {stats && (
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        <BarChart3 size={14} className="text-gold" />
                        {stats.sold} vendus / {stats.capacity}
                      </span>
                      <span className="text-slate-600">{stats.checkedIn} entrées scannées</span>
                      <span className="font-semibold text-navy">
                        {formatPrice(stats.revenue, event.currency)} de recettes
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(event)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:border-gold transition-custom"
                >
                  {event.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                  {event.status === 'published' ? 'Dépublier' : 'Publier'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
