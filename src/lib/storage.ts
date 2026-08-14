import type { CheckInRecord, Event, Order, Ticket } from '../types/ticketing';

const KEYS = {
  events: 'be_ticketing_events',
  orders: 'be_ticketing_orders',
  tickets: 'be_ticketing_tickets',
  checkins: 'be_ticketing_checkins',
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

export function getEvents(): Event[] {
  return read<Event[]>(KEYS.events, []);
}

export function saveEvents(events: Event[]): void {
  write(KEYS.events, events);
}

export function getEventById(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id || e.slug === id);
}

export function getPublishedEvents(): Event[] {
  return getEvents().filter((e) => e.status === 'published');
}

export function getOrders(): Order[] {
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
