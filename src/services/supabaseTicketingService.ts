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
  const all = await fetchAllEvents();
  return all.filter((e) => e.status === 'published');
}

export async function fetchEvent(idOrSlug: string): Promise<Event | null> {
  const all = await fetchAllEvents();
  return all.find((e) => e.id === idOrSlug || e.slug === idOrSlug) ?? null;
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
  if (error) throw new Error(error.message);
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
  const { data, error } = await assertSupabase()
    .from('be_tickets')
    .select('data')
    .ilike('holder_email', normalized);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.data as Ticket);
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
