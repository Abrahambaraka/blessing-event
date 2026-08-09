import type { CheckInRecord, Event, Order, Ticket } from '../types/ticketing';
import { DEMO_EVENTS } from '../data/demoEvents';

const KEYS = {
  events: 'be_ticketing_events',
  orders: 'be_ticketing_orders',
  tickets: 'be_ticketing_tickets',
  checkins: 'be_ticketing_checkins',
  seeded: 'be_ticketing_seeded',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

const REMOVED_EVENT_IDS = new Set(['evt-gala-2026', 'evt-summit-2026']);

/** Fusionne les événements démo à chaque chargement */
function mergeDemoEvents(stored: Event[]): Event[] {
  const filtered = stored.filter((e) => !REMOVED_EVENT_IDS.has(e.id));
  const map = new Map(filtered.map((e) => [e.id, e]));

  for (const demo of DEMO_EVENTS) {
    const existing = map.get(demo.id);
    if (!existing) {
      map.set(demo.id, demo);
      continue;
    }
    map.set(demo.id, {
      ...demo,
      ticketTypes: demo.ticketTypes.map((tt) => {
        const old = existing.ticketTypes.find((t) => t.id === tt.id);
        return old ? { ...tt, sold: old.sold } : tt;
      }),
    });
  }

  const demoIds = new Set(DEMO_EVENTS.map((e) => e.id));
  const custom = filtered.filter((e) => !demoIds.has(e.id));
  const merged = [
    ...DEMO_EVENTS.map((d) => map.get(d.id)).filter((e): e is Event => !!e),
    ...custom,
  ];

  return merged;
}

export function seedDemoDataIfNeeded(): void {
  if (!localStorage.getItem(KEYS.seeded)) {
    write(KEYS.events, DEMO_EVENTS);
    write(KEYS.orders, [] as Order[]);
    write(KEYS.tickets, [] as Ticket[]);
    write(KEYS.checkins, [] as CheckInRecord[]);
    localStorage.setItem(KEYS.seeded, 'true');
    return;
  }

  const stored = read<Event[]>(KEYS.events, []);
  const merged = mergeDemoEvents(stored);
  if (JSON.stringify(merged) !== JSON.stringify(stored)) {
    write(KEYS.events, merged);
  }
}

export function getEvents(): Event[] {
  seedDemoDataIfNeeded();
  const stored = read<Event[] | null>(KEYS.events, null);
  if (!stored || stored.length === 0) return DEMO_EVENTS;
  return mergeDemoEvents(stored);
}

export function saveEvents(events: Event[]): void {
  write(KEYS.events, events);
}

export function getEventById(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id || e.slug === id);
}

export function getPublishedEvents(): Event[] {
  const published = getEvents().filter((e) => e.status === 'published');
  if (published.length === 0) {
    return DEMO_EVENTS.filter((e) => e.status === 'published');
  }
  return published;
}

export function getOrders(): Order[] {
  seedDemoDataIfNeeded();
  return read<Order[]>(KEYS.orders, []);
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) orders[idx] = order;
  else orders.push(order);
  write(KEYS.orders, orders);
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function getTickets(): Ticket[] {
  seedDemoDataIfNeeded();
  return read<Ticket[]>(KEYS.tickets, []);
}

export function saveTickets(tickets: Ticket[]): void {
  const existing = getTickets();
  const map = new Map(existing.map((t) => [t.id, t]));
  tickets.forEach((t) => map.set(t.id, t));
  write(KEYS.tickets, Array.from(map.values()));
}

export function getTicketsByEmail(email: string): Ticket[] {
  const normalized = email.trim().toLowerCase();
  return getTickets().filter(
    (t) => t.holderEmail.toLowerCase() === normalized && t.status !== 'cancelled'
  );
}

export function getTicketsByOrder(orderId: string): Ticket[] {
  return getTickets().filter((t) => t.orderId === orderId);
}

export function getTicketByCode(code: string): Ticket | undefined {
  const normalized = code.trim().toUpperCase();
  return getTickets().find((t) => t.code.toUpperCase() === normalized);
}

export function getCheckIns(): CheckInRecord[] {
  seedDemoDataIfNeeded();
  return read<CheckInRecord[]>(KEYS.checkins, []);
}

export function saveCheckIn(record: CheckInRecord): void {
  const checkins = getCheckIns();
  checkins.push(record);
  write(KEYS.checkins, checkins);
}

export function getEventCheckInCount(eventId: string): number {
  return getCheckIns().filter((c) => c.eventId === eventId).length;
}

/** Réinitialise les données démo (utile si l'événement n'apparaît pas) */
export function resetDemoData(): void {
  write(KEYS.events, DEMO_EVENTS);
  localStorage.setItem(KEYS.seeded, 'true');
}
