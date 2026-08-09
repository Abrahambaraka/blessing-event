import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import type { Event } from '../../src/types/ticketing';
import {
  DEFAULT_SEARCH_FILTERS,
  type EventSearchFilters,
  type EventPriceFilter,
  type EventSort,
  buildSearchSuggestions,
  getEventCities,
  getSearchSummary,
  searchEvents,
} from '../../src/lib/eventSearch';

interface EventSearchBarProps {
  events: Event[];
  filters: EventSearchFilters;
  onChange: (filters: EventSearchFilters) => void;
  resultCount: number;
}

const EventSearchBar: React.FC<EventSearchBarProps> = ({
  events,
  filters,
  onChange,
  resultCount,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => getEventCities(events), [events]);
  const suggestions = useMemo(
    () => buildSearchSuggestions(events, filters.query),
    [events, filters.query]
  );

  const hasActiveFilters =
    filters.city !== '' ||
    filters.priceFilter !== 'all' ||
    !filters.upcomingOnly ||
    filters.sort !== 'relevance';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const update = (patch: Partial<EventSearchFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const applySuggestion = (value: string) => {
    update({ query: value });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const resetFilters = () => {
    onChange(DEFAULT_SEARCH_FILTERS);
    setShowFilters(false);
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 md:mb-12" ref={wrapperRef}>
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 transition-custom">
          <Search size={20} className="text-gold flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={filters.query}
            onChange={(e) => {
              update({ query: e.target.value, sort: e.target.value ? 'relevance' : filters.sort });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Rechercher un gala, une conférence, une ville, un lieu…"
            className="flex-1 bg-transparent outline-none text-sm md:text-base text-navy placeholder:text-slate-400"
            aria-label="Rechercher un événement"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => update({ query: '' })}
              className="p-1 text-slate-400 hover:text-navy transition-colors"
              aria-label="Effacer la recherche"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-custom ${
              hasActiveFilters || showFilters
                ? 'bg-navy text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && filters.query.trim() && (
          <ul className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="w-full text-left px-4 py-3 text-sm text-navy hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <Sparkles size={14} className="text-gold flex-shrink-0" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 p-4 md:p-5 bg-white border border-slate-200 rounded-xl shadow-sm grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
              Ville
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={filters.city}
                onChange={(e) => update({ city: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-navy focus:border-gold focus:outline-none appearance-none bg-white"
              >
                <option value="">Toutes les villes</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
              Tarif
            </label>
            <select
              value={filters.priceFilter}
              onChange={(e) => update({ priceFilter: e.target.value as EventPriceFilter })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-navy focus:border-gold focus:outline-none bg-white"
            >
              <option value="all">Tous</option>
              <option value="free">Gratuits</option>
              <option value="paid">Payants</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
              Période
            </label>
            <select
              value={filters.upcomingOnly ? 'upcoming' : 'all'}
              onChange={(e) => update({ upcomingOnly: e.target.value === 'upcoming' })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-navy focus:border-gold focus:outline-none bg-white"
            >
              <option value="upcoming">À venir</option>
              <option value="all">Tous les événements</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
              Trier par
            </label>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as EventSort })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-navy focus:border-gold focus:outline-none bg-white"
            >
              <option value="relevance">Pertinence</option>
              <option value="date-asc">Date (proche)</option>
              <option value="date-desc">Date (lointaine)</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold uppercase tracking-widest text-gold hover:text-navy transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">
        {getSearchSummary(events.length, resultCount, filters)}
        {filters.query.trim() && resultCount > 0 && (
          <span className="text-gold"> — recherche intelligente active</span>
        )}
      </p>
    </div>
  );
};

export default EventSearchBar;
