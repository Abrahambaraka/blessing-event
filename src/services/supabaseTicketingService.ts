import type { CheckInRecord, Event, Order, Ticket } from '../types/ticketing';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

function assertSupabase() {
  if (!supabase) throw new Error('Supabase non configuré.');
  return supabase;
}

export async function fetchAllEvents(): Promise<Event[]> {
  const { data, error } = await assertSupabase()
    .from('be_events')
    .select('data')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.data as Event);
}

export async function fetchPublishedEvents(): Promise<Event[]> {
  const { data, error } = await assertSupabase()
    .from('be_events')
    .select('data')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.data as Event);
}

export async function fetchEvent(idOrSlug: string): Promise<Event | null> {
  const client = assertSupabase();

  const { data: bySlug, error: slugError } = await client
    .from('be_events')
    .select('data')
    .eq('slug', idOrSlug)
    .eq('status', 'published')
    .maybeSingle();
  if (slugError) throw new Error(slugError.message);
  if (bySlug) return bySlug.data as Event;

  const { data: byId, error: idError } = await client
    .from('be_events')
    .select('data')
    .eq('id', idOrSlug)
    .eq('status', 'published')
    .maybeSingle();
  if (idError) throw new Error(idError.message);
  return byId ? (byId.data as Event) : null;
}

export async function saveEvent(event: Event): Promise<void> {
  const client = assertSupabase();
  const { error } = await client.from('be_events').upsert({
    id: event.id,
    slug: event.slug,
    status: event.status,
    data: event,
    updated_at: event.updatedAt,
  });
  if (error) {
    const msg = error.message;
    if (/permission|policy|RLS|42501/i.test(msg)) {
      throw new Error('Accès refusé — votre compte doit être super_admin (table profiles). Reconnectez-vous après la promotion SQL.');
    }
    throw new Error(msg);
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await assertSupabase().from('be_events').delete().eq('id', eventId);
  if (error) throw new Error(error.message);
}

export async function saveOrder(order: Order): Promise<void> {
  const { error } = await assertSupabase().from('be_orders').upsert({
    id: order.id,
    event_id: order.eventId,
    buyer_email: order.buyerEmail,
    status: order.status,
    total_amount: order.total,
    currency: order.currency,
    data: order,
    paid_at: order.paidAt ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await assertSupabase().from('be_orders').select('data').eq('id', orderId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data.data as Order) : null;
}

export async function saveTickets(tickets: Ticket[]): Promise<void> {
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
  const { error } = await assertSupabase().from('be_tickets').upsert(rows);
  if (error) throw new Error(error.message);
}

export async function getAllTickets(): Promise<Ticket[]> {
  const { data, error } = await assertSupabase().from('be_tickets').select('data');
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.data as Ticket);
}

export async function getTicketsByEmail(email: string): Promise<Ticket[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];

  const { data, error } = await assertSupabase().rpc('be_tickets_by_email', {
    p_email: normalized,
  });

  if (error) {
    // Fallback si la migration 009 n'est pas encore exécutée
    if (/be_tickets_by_email|42883|PGRST202/i.test(error.message)) {
      return getTicketsByEmailFallback(normalized);
    }
    throw new Error(error.message);
  }

  return (data ?? []).map((row: Ticket) => row);
}

async function getTicketsByEmailFallback(email: string): Promise<Ticket[]> {
  const client = assertSupabase();
  const { data: holderRows, error: holderError } = await client
    .from('be_tickets')
    .select('data')
    .ilike('holder_email', email);
  if (holderError) throw new Error(holderError.message);

  const { data: orderRows, error: orderError } = await client
    .from('be_orders')
    .select('id')
    .ilike('buyer_email', email);
  if (orderError) throw new Error(orderError.message);

  const orderIds = (orderRows ?? []).map((o) => o.id);
  let buyerRows: { data: Ticket }[] = [];
  if (orderIds.length > 0) {
    const { data, error } = await client.from('be_tickets').select('data').in('order_id', orderIds);
    if (error) throw new Error(error.message);
    buyerRows = (data ?? []) as { data: Ticket }[];
  }

  const byId = new Map<string, Ticket>();
  for (const row of [...(holderRows ?? []), ...buyerRows]) {
    const ticket = row.data as Ticket;
    byId.set(ticket.id, ticket);
  }
  return [...byId.values()];
}

export async function getTicketByCode(code: string): Promise<Ticket | null> {
  const { data, error } = await assertSupabase()
    .from('be_tickets')
    .select('data')
    .eq('code', code.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data.data as Ticket) : null;
}

export async function getTicketsByOrder(orderId: string): Promise<Ticket[]> {
  const { data, error } = await assertSupabase().from('be_tickets').select('data').eq('order_id', orderId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.data as Ticket);
}

export async function saveCheckIn(record: CheckInRecord): Promise<void> {
  const { error } = await assertSupabase().from('be_checkins').insert({
    id: record.id,
    ticket_id: record.ticketId,
    event_id: record.eventId,
    data: record,
  });
  if (error) throw new Error(error.message);
}

export function isActive(): boolean {
  return isSupabaseEnabled;
}
