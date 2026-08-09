import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, SearchX } from 'lucide-react';
import EventCard from '../components/ticketing/EventCard';
import EventSearchBar from '../components/ticketing/EventSearchBar';
import { fetchPublishedEvents } from '../src/services/ticketingService';
import { DEFAULT_SEARCH_FILTERS, searchEvents } from '../src/lib/eventSearch';
import type { Event } from '../src/types/ticketing';

interface EventsPageProps {
  onNavigate: (path: string) => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_SEARCH_FILTERS);

  useEffect(() => {
    fetchPublishedEvents().then((data) => {
      setEvents(data);
      setLoading(false);
      requestAnimationFrame(() => {
        document.querySelectorAll('.event-card-item').forEach((el) => {
          el.classList.add('is-visible');
        });
      });
    });
  }, []);

  const filteredResults = useMemo(
    () => searchEvents(events, filters),
    [events, filters]
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.event-card-item').forEach((el) => {
        el.classList.add('is-visible');
      });
    });
  }, [filteredResults]);

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10 reveal-fade-up">
          <div className="inline-flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            <Ticket size={14} />
            Billetterie en ligne
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-navy mb-4">
            Réservez vos places
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
            Concerts, galas, conférences et événements privés. E-billets QR, contrôle d'accès le jour J.
          </p>
        </div>

        {!loading && events.length > 0 && (
          <EventSearchBar
            events={events}
            filters={filters}
            onChange={setFilters}
            resultCount={filteredResults.length}
          />
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400">Chargement des événements...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">Aucun événement disponible pour le moment.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <SearchX size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-navy font-semibold mb-2">Aucun événement trouvé</p>
            <p className="text-slate-500 text-sm mb-6">
              Essayez un autre mot-clé : gala, conférence, Lubumbashi, VIP, gratuit…
            </p>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_SEARCH_FILTERS)}
              className="px-6 py-2.5 bg-navy text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-navy/90 transition-custom"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredResults.map(({ event }) => (
              <div key={event.id} className="event-card-item">
                <EventCard event={event} onSelect={(slug) => onNavigate(`events/${slug}`)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
