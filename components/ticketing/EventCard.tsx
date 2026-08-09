import React from 'react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import type { Event } from '../../src/types/ticketing';
import { formatPrice } from '../../src/lib/fees';

interface EventCardProps {
  event: Event;
  onSelect: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
  const maxPrice = Math.max(...event.ticketTypes.map((t) => t.price));
  const isFree = maxPrice === 0;

  return (
    <article
      className="group bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-gold/30 transition-custom cursor-pointer"
      onClick={() => onSelect(event.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event.slug)}
    >
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-navy/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
            {event.city}
          </span>
        </div>
        {isFree && (
          <div className="absolute top-4 right-4">
            <span className="bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              Gratuit
            </span>
          </div>
        )}
      </div>

      <div className="p-5 md:p-6">
        <h3 className="font-serif text-lg md:text-xl text-navy mb-3 line-clamp-2 group-hover:text-gold transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gold flex-shrink-0" />
            <span>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gold flex-shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-navy">
            <Ticket size={16} className="text-gold" />
            <span className="text-sm font-semibold">
              {isFree
                ? 'Entrée libre'
                : minPrice === maxPrice
                  ? formatPrice(minPrice, event.currency)
                  : `À partir de ${formatPrice(minPrice, event.currency)}`}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold group-hover:translate-x-1 transition-transform">
            Réserver →
          </span>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
