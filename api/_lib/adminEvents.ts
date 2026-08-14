import type { SupabaseClient } from '@supabase/supabase-js';
import type { Event } from '../../src/types/ticketing';

export async function listAllEvents(admin: SupabaseClient): Promise<Event[]> {
  const { data, error } = await admin
    .from('be_events')
    .select('data')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.data as Event);
}

export async function upsertEvent(admin: SupabaseClient, event: Event): Promise<Event> {
  const { error } = await admin.from('be_events').upsert({
    id: event.id,
    slug: event.slug,
    status: event.status,
    data: event,
    updated_at: event.updatedAt,
  });
  if (error) throw new Error(error.message);
  return event;
}

export async function removeEvent(admin: SupabaseClient, eventId: string): Promise<void> {
  const { error } = await admin.from('be_events').delete().eq('id', eventId);
  if (error) throw new Error(error.message);
}
