import type { SupabaseClient } from '@supabase/supabase-js';
import type { Attendee, CartItem, Event, Order, Ticket } from '../../src/types/ticketing';
import { calculateOrderFees, calculateTicketFee, getTicketCurrency } from '../../src/lib/fees';
import { generateId, generateTicketCode } from '../../src/lib/ticketCode';

const ORDER_EXPIRY_MINUTES = 15;

export async function loadEventById(admin: SupabaseClient, eventId: string): Promise<Event | null> {
  const { data, error } = await admin.from('be_events').select('data').eq('id', eventId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data.data as Event) : null;
}

function validateStock(event: Event, items: CartItem[]): void {
  for (const item of items) {
    const tt = event.ticketTypes.find((t) => t.id === item.ticketTypeId);
    if (!tt) throw new Error('Type de billet invalide.');
    const available = tt.quantity - tt.sold;
    if (item.quantity > available) {
      throw new Error(`Stock insuffisant pour « ${tt.name} » (${available} restants).`);
    }
    if (item.quantity <= 0) throw new Error('Quantité invalide.');
  }
}

function updateEventSoldCounts(event: Event, items: CartItem[]): Event {
  const updatedTypes = event.ticketTypes.map((tt) => {
    const item = items.find((i) => i.ticketTypeId === tt.id);
    if (!item) return tt;
    return { ...tt, sold: tt.sold + item.quantity };
  });
  return { ...event, ticketTypes: updatedTypes, updatedAt: new Date().toISOString() };
}

async function persistEvent(admin: SupabaseClient, event: Event): Promise<void> {
  const { error } = await admin.from('be_events').upsert({
    id: event.id,
    slug: event.slug,
    status: event.status,
    data: event,
    updated_at: event.updatedAt,
  });
  if (error) throw new Error(error.message);
}

async function persistOrder(admin: SupabaseClient, order: Order, buyerId?: string): Promise<void> {
  const { error } = await admin.from('be_orders').upsert({
    id: order.id,
    event_id: order.eventId,
    buyer_id: buyerId ?? null,
    buyer_email: order.buyerEmail,
    status: order.status,
    total_amount: order.total,
    currency: order.currency,
    data: order,
    paid_at: order.paidAt ?? null,
  });
  if (error) throw new Error(error.message);
}

async function persistTickets(admin: SupabaseClient, tickets: Ticket[]): Promise<void> {
  if (tickets.length === 0) return;
  const rows = tickets.map((t) => ({
    id: t.id,
    code: t.code,
    order_id: t.orderId,
    event_id: t.eventId,
    holder_email: t.holderEmail,
    status: t.status,
    data: t,
    checked_in_at: t.checkedInAt ?? null,
  }));
  const { error } = await admin.from('be_tickets').upsert(rows);
  if (error) throw new Error(error.message);
}

export interface CreateOrderInput {
  eventId: string;
  items: CartItem[];
  buyer: { name: string; email: string };
  attendees: Attendee[];
  buyerId?: string;
}

export async function createOrderOnServer(
  admin: SupabaseClient,
  input: CreateOrderInput
): Promise<Order> {
  const event = await loadEventById(admin, input.eventId);
  if (!event) throw new Error('Événement introuvable.');
  if (event.status !== 'published') throw new Error('Événement non disponible à la vente.');

  validateStock(event, input.items);

  const buyerEmail = input.buyer.email.trim().toLowerCase();

  const feeItems = input.items.map((item) => {
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
    buyerEmail,
    buyerName: input.buyer.name.trim(),
    items: orderItems,
    subtotal: fees.subtotal,
    totalFees: fees.totalFees,
    total: fees.total,
    currency: orderCurrency,
    status: fees.total > 0 ? 'pending' : 'paid',
    attendees: input.attendees,
    createdAt: new Date().toISOString(),
    expiresAt: fees.total > 0 ? expiresAt.toISOString() : undefined,
    paidAt: fees.total === 0 ? new Date().toISOString() : undefined,
  };

  await persistOrder(admin, order, input.buyerId);

  if (order.status === 'paid') {
    await finalizeOrderOnServer(admin, order, event);
  }

  return order;
}

export async function finalizeOrderOnServer(
  admin: SupabaseClient,
  order: Order,
  event?: Event
): Promise<Ticket[]> {
  const ev = event ?? (await loadEventById(admin, order.eventId));
  if (!ev) throw new Error('Événement introuvable.');

  const cartItems: CartItem[] = order.items.map((i) => ({
    ticketTypeId: i.ticketTypeId,
    quantity: i.quantity,
  }));

  const updatedEvent = updateEventSoldCounts(ev, cartItems);
  await persistEvent(admin, updatedEvent);

  const tickets: Ticket[] = [];
  let attendeeIdx = 0;

  for (const item of order.items) {
    const feePerTicket = calculateTicketFee(item.unitPrice, order.currency);
    for (let i = 0; i < item.quantity; i++) {
      const attendee = order.attendees[attendeeIdx] ?? order.attendees[0];
      attendeeIdx++;
      tickets.push({
        id: generateId(),
        code: generateTicketCode(),
        orderId: order.id,
        eventId: ev.id,
        eventTitle: ev.title,
        ticketTypeId: item.ticketTypeId,
        ticketTypeName: item.ticketTypeName,
        holderName: `${attendee.firstName} ${attendee.lastName}`,
        holderEmail: attendee.email.trim().toLowerCase(),
        status: 'issued',
        price: item.unitPrice,
        fees: feePerTicket,
        currency: order.currency,
        eventDate: ev.date,
        venue: `${ev.venue}, ${ev.city}`,
        issuedAt: new Date().toISOString(),
      });
    }
  }

  await persistTickets(admin, tickets);
  return tickets;
}

export async function loadOrderById(admin: SupabaseClient, orderId: string): Promise<Order | null> {
  const { data, error } = await admin.from('be_orders').select('data').eq('id', orderId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data.data as Order) : null;
}

export async function loadTicketsByOrder(admin: SupabaseClient, orderId: string): Promise<Ticket[]> {
  const { data, error } = await admin.from('be_tickets').select('data').eq('order_id', orderId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.data as Ticket);
}

export async function completeOrderOnServer(admin: SupabaseClient, orderId: string): Promise<{ order: Order; tickets: Ticket[] }> {
  const order = await loadOrderById(admin, orderId);
  if (!order) throw new Error('Commande introuvable.');

  if (order.status === 'paid') {
    const tickets = await loadTicketsByOrder(admin, orderId);
    return { order, tickets };
  }

  if (order.status === 'expired') throw new Error('Commande expirée.');
  if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
    order.status = 'expired';
    await persistOrder(admin, order);
    throw new Error('Commande expirée.');
  }

  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  await persistOrder(admin, order);

  const tickets = await finalizeOrderOnServer(admin, order);
  return { order, tickets };
}

export async function loadTicketsForEmail(admin: SupabaseClient, email: string): Promise<Ticket[]> {
  const normalized = email.trim().toLowerCase();

  const { data: holderRows, error: holderError } = await admin
    .from('be_tickets')
    .select('data')
    .ilike('holder_email', normalized);
  if (holderError) throw new Error(holderError.message);

  const { data: orderRows, error: orderError } = await admin
    .from('be_orders')
    .select('id')
    .ilike('buyer_email', normalized);
  if (orderError) throw new Error(orderError.message);

  const orderIds = (orderRows ?? []).map((o) => o.id);
  let buyerRows: { data: Ticket }[] = [];
  if (orderIds.length > 0) {
    const { data, error } = await admin.from('be_tickets').select('data').in('order_id', orderIds);
    if (error) throw new Error(error.message);
    buyerRows = (data ?? []) as { data: Ticket }[];
  }

  const byId = new Map<string, Ticket>();
  for (const row of [...(holderRows ?? []), ...buyerRows]) {
    const ticket = row.data as Ticket;
    byId.set(ticket.id, ticket);
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}
