import type { Event } from '../types/ticketing';
import { isSupabaseEnabled } from '../lib/supabase';
import * as sb from './supabaseTicketingService';

/** Admin via Supabase client (JWT + RLS) — pas d'API Vercel */
export function useAdminEventsApi(): boolean {
  return false;
}

export async function adminFetchAllEvents(): Promise<Event[]> {
  if (!isSupabaseEnabled) return [];
  return sb.fetchAllEvents();
}

export async function adminPersistEvent(event: Event): Promise<void> {
  if (!isSupabaseEnabled) return;
  await sb.saveEvent(event);
}

export async function adminRemoveEvent(eventId: string): Promise<void> {
  if (!isSupabaseEnabled) return;
  await sb.deleteEvent(eventId);
}
