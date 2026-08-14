import type { Attendee, CartItem, Event, EventStatus, Order, Ticket, TicketType, Currency, FeeMode } from '../types/ticketing';
import { calculateOrderFees, calculateTicketFee, getTicketCurrency } from '../lib/fees';
import { generateId, generateTicketCode } from '../lib/ticketCode';
import { uniqueSlug } from '../lib/slugify';
import { isSupabaseEnabled } from '../lib/supabase';
import * as storage from '../lib/storage';
import * as sb from './supabaseTicketingService';
import {
  apiCompleteOrder,
  apiCreateOrder,
  apiFetchMyTickets,
  shouldUseTicketingApi,
} from './ticketingApiService';

const ORDER_EXPIRY_MINUTES = 15;

async function withApiFallback<T>(apiFn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
  try {
    return await apiFn();
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[ticketing] API indisponible — fallback Supabase direct', err);
      return fallbackFn();
    }
    throw err;
  }
}

export interface CreateEventInput {
  title: string;
  description: string;
  date: string;
  venue: string;
  city: string;
  imageUrl: string;
  capacity: number;
  currency: Currency;
  feeMode: FeeMode;
  status: EventStatus;
  votePrice?: number;
  ticketTypes: Omit<TicketType, 'sold'>[];
}

async function getEventsList(): Promise<Event[]> {
  return isSupabaseEnabled ? sb.fetchAllEvents() : storage.getEvents();
}

async function getEventById(idOrSlug: string): Promise<Event | undefined | null> {
  if (isSupabaseEnabled) {
    const ev = await sb.fetchEvent(idOrSlug);
    return ev ?? undefined;
  }
  return storage.getEventById(idOrSlug);
}

async function persistEvent(event: Event): Promise<void> {
  if (isSupabaseEnabled) await sb.saveEvent(event);
  else {
    const events = storage.getEvents();
    storage.saveEvents(events.map((e) => (e.id === event.id ? event : e)));
  }
}

async function persistOrder(order: Order): Promise<void> {
  if (isSupabaseEnabled) await sb.saveOrder(order);
  else storage.saveOrder(order);
}

async function persistTickets(tickets: Ticket[]): Promise<void> {
  if (isSupabaseEnabled) await sb.saveTickets(tickets);
  else storage.saveTickets(tickets);
}

function updateEventSoldCounts(event: Event, items: CartItem[]): Event {
  const updatedTypes = event.ticketTypes.map((tt) => {
    const item = items.find((i) => i.ticketTypeId === tt.id);
    if (!item) return tt;
    return { ...tt, sold: tt.sold + item.quantity };
  });
  return { ...event, ticketTypes: updatedTypes, updatedAt: new Date().toISOString() };
}

export async function fetchPublishedEvents(): Promise<Event[]> {
  if (isSupabaseEnabled) return sb.fetchPublishedEvents();
  return storage.getPublishedEvents();
}

export async function fetchEvent(idOrSlug: string): Promise<Event | null> {
  const ev = await getEventById(idOrSlug);
  return ev ?? null;
}

export async function fetchAllEvents(): Promise<Event[]> {
  return getEventsList();
}

export function subscribeToEvents(callback: (events: Event[]) => void): () => void {
  fetchAllEvents().then(callback);
  return () => {};
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const existing = await getEventsList();
  const slugs = existing.map((e) => e.slug);
  const now = new Date().toISOString();

  const event: Event = {
    id: generateId(),
    slug: uniqueSlug(input.title, slugs),
    title: input.title.trim(),
    description: input.description.trim(),
    date: input.date,
    venue: input.venue.trim(),
    city: input.city.trim(),
    imageUrl: input.imageUrl.trim() || '/logo.png',
    status: input.status,
    capacity: input.capacity,
    feeMode: input.feeMode,
    currency: input.currency,
    votePrice: input.votePrice,
    ticketTypes: input.ticketTypes.map((tt) => ({
      ...tt,
      id: tt.id || generateId(),
      sold: 0,
    })),
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseEnabled) await sb.saveEvent(event);
  else {
    const events = storage.getEvents();
    events.push(event);
    storage.saveEvents(events);
  }

  return event;
}

export async function deleteEvent(eventId: string): Promise<void> {
  if (isSupabaseEnabled) {
    await sb.deleteEvent(eventId);
    return;
  }
  storage.saveEvents(storage.getEvents().filter((e) => e.id !== eventId));
}

export async function createOrder(
  event: Event,
  items: CartItem[],
  buyer: { name: string; email: string },
  attendees: Attendee[]
): Promise<Order> {
  if (shouldUseTicketingApi()) {
    return withApiFallback(
      () => apiCreateOrder(event, items, buyer, attendees),
      () => createOrderLocal(event, items, buyer, attendees)
    );
  }
  return createOrderLocal(event, items, buyer, attendees);
}

async function createOrderLocal(
  event: Event,
  items: CartItem[],
  buyer: { name: string; email: string },
  attendees: Attendee[]
): Promise<Order> {
  const feeItems = items.map((item) => {
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
  const orderItems = fees.perTicket.map((p) => ({
    ticketTypeId: p.ticketTypeId,
    ticketTypeName: p.name,
    quantity: p.quantity,
    unitPrice: p.unitPrice,
    fees: p.lineFees,
  }));

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + ORDER_EXPIRY_MINUTES);

  const order: Order = {
    id: generateId(),
    eventId: event.id,
    eventTitle: event.title,
    buyerEmail: buyer.email,
    buyerName: buyer.name,
    items: orderItems,
    subtotal: fees.subtotal,
    totalFees: fees.totalFees,
    total: fees.total,
    currency: orderCurrency,
    status: fees.total > 0 ? 'pending' : 'paid',
    attendees,
    createdAt: new Date().toISOString(),
    expiresAt: fees.total > 0 ? expiresAt.toISOString() : undefined,
    paidAt: fees.total === 0 ? new Date().toISOString() : undefined,
  };

  await persistOrder(order);

  if (order.status === 'paid') {
    await finalizeOrder(order, event, attendees);
  }

  return order;
}

export async function completePayment(orderId: string): Promise<{ order: Order; tickets: Ticket[] }> {
  if (shouldUseTicketingApi()) {
    return withApiFallback(
      () => apiCompleteOrder(orderId),
      () => completePaymentLocal(orderId)
    );
  }
  return completePaymentLocal(orderId);
}

async function completePaymentLocal(orderId: string): Promise<{ order: Order; tickets: Ticket[] }> {
  const order = isSupabaseEnabled
    ? await sb.getOrderById(orderId)
    : storage.getOrderById(orderId);

  if (!order) throw new Error('Commande introuvable');
  if (order.status === 'paid') {
    const tickets = isSupabaseEnabled
      ? await sb.getTicketsByOrder(orderId)
      : storage.getTicketsByOrder(orderId);
    return { order, tickets };
  }
  if (order.status === 'expired') throw new Error('Commande expirée');
  if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
    order.status = 'expired';
    await persistOrder(order);
    throw new Error('Commande expirée');
  }

  const event = await getEventById(order.eventId);
  if (!event) throw new Error('Événement introuvable');

  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  await persistOrder(order);

  const tickets = await finalizeOrder(order, event, order.attendees);
  return { order, tickets };
}

async function finalizeOrder(order: Order, event: Event, attendees: Attendee[]): Promise<Ticket[]> {
  const cartItems: CartItem[] = order.items.map((i) => ({
    ticketTypeId: i.ticketTypeId,
    quantity: i.quantity,
  }));

  const updatedEvent = updateEventSoldCounts(event, cartItems);
  await persistEvent(updatedEvent);

  const tickets: Ticket[] = [];
  let attendeeIdx = 0;

  for (const item of order.items) {
    const feePerTicket = calculateTicketFee(item.unitPrice, order.currency);
    for (let i = 0; i < item.quantity; i++) {
      const attendee = attendees[attendeeIdx] ?? attendees[0];
      attendeeIdx++;
      tickets.push({
        id: generateId(),
        code: generateTicketCode(),
        orderId: order.id,
        eventId: event.id,
        eventTitle: event.title,
        ticketTypeId: item.ticketTypeId,
        ticketTypeName: item.ticketTypeName,
        holderName: `${attendee.firstName} ${attendee.lastName}`,
        holderEmail: attendee.email,
        status: 'issued',
        price: item.unitPrice,
        fees: feePerTicket,
        currency: order.currency,
        eventDate: event.date,
        venue: `${event.venue}, ${event.city}`,
        issuedAt: new Date().toISOString(),
      });
    }
  }

  await persistTickets(tickets);
  return tickets;
}

export async function fetchTicketsByEmail(email: string): Promise<Ticket[]> {
  if (isSupabaseEnabled) return sb.getTicketsByEmail(email);
  return storage.getTicketsByEmail(email);
}

/** Billets du compte connecté (JWT) — préféré en mode Supabase */
export async function fetchMyTickets(fallbackEmail?: string): Promise<Ticket[]> {
  if (shouldUseTicketingApi()) {
    try {
      return await apiFetchMyTickets();
    } catch (err) {
      if (import.meta.env.DEV && fallbackEmail) {
        return sb.getTicketsByEmail(fallbackEmail);
      }
      throw err;
    }
  }
  if (fallbackEmail) return fetchTicketsByEmail(fallbackEmail);
  return [];
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  if (isSupabaseEnabled) return sb.getOrderById(orderId);
  return storage.getOrderById(orderId) ?? null;
}

export async function checkInTicket(
  code: string,
  scannedBy: string
): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
  const ticket = isSupabaseEnabled
    ? await sb.getTicketByCode(code)
    : storage.getTicketByCode(code);

  if (!ticket) return { success: false, message: 'Billet introuvable' };
  if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
    return { success: false, message: 'Billet annulé ou remboursé' };
  }
  if (ticket.status === 'checked_in') {
    return { success: false, message: `Déjà scanné le ${new Date(ticket.checkedInAt!).toLocaleString('fr-FR')}`, ticket };
  }

  ticket.status = 'checked_in';
  ticket.checkedInAt = new Date().toISOString();
  await persistTickets([ticket]);

  const checkIn = {
    id: generateId(),
    ticketId: ticket.id,
    eventId: ticket.eventId,
    scannedAt: ticket.checkedInAt,
    scannedBy,
  };

  if (isSupabaseEnabled) await sb.saveCheckIn(checkIn);
  else storage.saveCheckIn(checkIn);

  return { success: true, message: `Entrée validée — ${ticket.holderName}`, ticket };
}

export async function saveEvent(event: Event): Promise<void> {
  event.updatedAt = new Date().toISOString();
  if (isSupabaseEnabled) await sb.saveEvent(event);
  else {
    const events = storage.getEvents();
    const idx = events.findIndex((e) => e.id === event.id);
    if (idx >= 0) events[idx] = event;
    else events.push(event);
    storage.saveEvents(events);
  }
}

export async function updateEventStatus(eventId: string, status: Event['status']): Promise<void> {
  const event = await getEventById(eventId);
  if (!event) return;
  event.status = status;
  event.updatedAt = new Date().toISOString();
  await saveEvent(event);
}

export async function castVotes(eventId: string, participantId: string, voteCount: number): Promise<Event | null> {
  const event = await getEventById(eventId);
  if (!event?.participants) return null;

  const updated: Event = {
    ...event,
    participants: event.participants.map((p) =>
      p.id === participantId ? { ...p, voteCount: p.voteCount + voteCount } : p
    ),
    updatedAt: new Date().toISOString(),
  };

  await saveEvent(updated);
  return updated;
}

export async function getEventStats(eventId: string) {
  const event = await getEventById(eventId);
  if (!event) return null;

  const tickets = isSupabaseEnabled
    ? (await sb.getAllTickets()).filter((t) => t.eventId === eventId)
    : storage.getTickets().filter((t) => t.eventId === eventId);

  const checkedIn = tickets.filter((t) => t.status === 'checked_in').length;
  const sold = event.ticketTypes.reduce((s, tt) => s + tt.sold, 0);
  return { sold, checkedIn, capacity: event.capacity, revenue: tickets.reduce((s, t) => s + t.price, 0) };
}

export function dataMode(): 'supabase' | 'local' {
  return isSupabaseEnabled ? 'supabase' : 'local';
}
