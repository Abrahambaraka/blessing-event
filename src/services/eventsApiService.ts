import type { Event } from '../types/ticketing';
import { isSupabaseEnabled } from '../lib/supabase';
import * as sb from './supabaseTicketingService';

/** Catalogue public via Supabase (RLS événements publiés) */
export async function fetchPublishedEventsFromApi(): Promise<Event[]> {
  if (!isSupabaseEnabled) return [];
  return sb.fetchPublishedEvents();
}

export async function fetchEventFromApi(idOrSlug: string): Promise<Event | null> {
  if (!isSupabaseEnabled) return null;
  return sb.fetchEvent(idOrSlug);
}
