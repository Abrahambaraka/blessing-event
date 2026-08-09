import type { Event } from '../types/ticketing';

export type EventSort = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'relevance';
export type EventPriceFilter = 'all' | 'free' | 'paid';

export interface EventSearchFilters {
  query: string;
  city: string;
  priceFilter: EventPriceFilter;
  upcomingOnly: boolean;
  sort: EventSort;
}

export const DEFAULT_SEARCH_FILTERS: EventSearchFilters = {
  query: '',
  city: '',
  priceFilter: 'all',
  upcomingOnly: true,
  sort: 'relevance',
};

export interface ScoredEvent {
  event: Event;
  score: number;
  matchedFields: string[];
}

/** Normalise pour recherche insensible aux accents et à la casse */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function tokenize(query: string): string[] {
  return normalizeSearchText(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function getSearchableFields(event: Event): { field: string; weight: number; value: string }[] {
  const ticketText = event.ticketTypes
    .map((t) => `${t.name} ${t.description ?? ''}`)
    .join(' ');

  return [
    { field: 'titre', weight: 10, value: event.title },
    { field: 'lieu', weight: 7, value: event.venue },
    { field: 'ville', weight: 7, value: event.city },
    { field: 'description', weight: 4, value: event.description },
    { field: 'billets', weight: 5, value: ticketText },
    { field: 'slug', weight: 3, value: event.slug.replace(/-/g, ' ') },
  ];
}

function scoreTokenAgainstText(token: string, text: string): number {
  const normalized = normalizeSearchText(text);
  if (!normalized) return 0;
  if (normalized === token) return 1;
  if (normalized.startsWith(token)) return 0.85;
  if (normalized.includes(token)) return 0.65;
  // Correspondance floue : au moins 70 % des caractères du token présents dans l'ordre
  let ti = 0;
  for (let i = 0; i < normalized.length && ti < token.length; i++) {
    if (normalized[i] === token[ti]) ti++;
  }
  if (ti / token.length >= 0.85) return 0.4;
  return 0;
}

function scoreEvent(event: Event, query: string): ScoredEvent {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return { event, score: 1, matchedFields: [] };
  }

  const fields = getSearchableFields(event);
  let totalScore = 0;
  const matchedFields = new Set<string>();

  for (const token of tokens) {
    let bestForToken = 0;
    for (const { field, weight, value } of fields) {
      const s = scoreTokenAgainstText(token, value) * weight;
      if (s > bestForToken) {
        bestForToken = s;
        if (s > 0) matchedFields.add(field);
      }
    }
    totalScore += bestForToken;
  }

  return {
    event,
    score: totalScore / tokens.length,
    matchedFields: Array.from(matchedFields),
  };
}

export function getEventMinPrice(event: Event): number {
  return Math.min(...event.ticketTypes.map((t) => t.price));
}

export function isEventFree(event: Event): boolean {
  return event.ticketTypes.every((t) => t.price === 0);
}

export function getEventCities(events: Event[]): string[] {
  return Array.from(new Set(events.map((e) => e.city))).sort((a, b) =>
    a.localeCompare(b, 'fr')
  );
}

export function buildSearchSuggestions(events: Event[], query: string, limit = 5): string[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const lastToken = tokens[tokens.length - 1];
  const suggestions = new Set<string>();

  for (const event of events) {
    const candidates = [
      event.title,
      event.city,
      event.venue,
      ...event.ticketTypes.map((t) => t.name),
    ];
    for (const c of candidates) {
      const n = normalizeSearchText(c);
      if (n.startsWith(lastToken) && n !== lastToken) {
        suggestions.add(c);
      }
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

export function searchEvents(events: Event[], filters: EventSearchFilters): ScoredEvent[] {
  const now = Date.now();

  let results = events.map((event) => {
    const scored = scoreEvent(event, filters.query);
    return scored;
  });

  if (filters.query.trim()) {
    results = results.filter((r) => r.score >= 2.5);
  }

  if (filters.city) {
    results = results.filter(
      (r) => normalizeSearchText(r.event.city) === normalizeSearchText(filters.city)
    );
  }

  if (filters.upcomingOnly) {
    results = results.filter((r) => new Date(r.event.date).getTime() >= now - 86400000);
  }

  if (filters.priceFilter === 'free') {
    results = results.filter((r) => isEventFree(r.event));
  } else if (filters.priceFilter === 'paid') {
    results = results.filter((r) => !isEventFree(r.event));
  }

  const sortFn: Record<EventSort, (a: ScoredEvent, b: ScoredEvent) => number> = {
    relevance: (a, b) => {
      if (filters.query.trim()) return b.score - a.score;
      return new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
    },
    'date-asc': (a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime(),
    'date-desc': (a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime(),
    'price-asc': (a, b) => getEventMinPrice(a.event) - getEventMinPrice(b.event),
    'price-desc': (a, b) => getEventMinPrice(b.event) - getEventMinPrice(a.event),
  };

  return results.sort(sortFn[filters.sort]);
}

export function getSearchSummary(
  total: number,
  filtered: number,
  filters: EventSearchFilters
): string {
  const hasFilters =
    filters.query.trim() ||
    filters.city ||
    filters.priceFilter !== 'all' ||
    !filters.upcomingOnly;

  if (!hasFilters) return `${total} événement${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}`;
  if (filtered === 0) return 'Aucun résultat pour votre recherche';
  return `${filtered} résultat${filtered > 1 ? 's' : ''} sur ${total}`;
}
