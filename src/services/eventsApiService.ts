import type { Event } from '../types/ticketing';
import { parseJsonResponse } from '../lib/compressImage';
import { isSupabaseEnabled } from '../lib/supabase';
import * as sb from './supabaseTicketingService';

async function fetchPublicApi(slug?: string): Promise<Event[]> {
  const qs = slug ? `?slug=${encodeURIComponent(slug)}` : '';
  const response = await fetch(`/api/events/public${qs}`);
  const body = await parseJsonResponse<{ error?: string; events?: Event[] }>(response);
  if (!response.ok) {
    throw new Error(body.error ?? `Erreur API (${response.status})`);
  }
  return body.events ?? [];
}

export async function fetchPublishedEventsFromApi(): Promise<Event[]> {
  if (!isSupabaseEnabled) return [];
  try {
    return await fetchPublicApi();
  } catch (err) {
    console.warn('[events] API publique indisponible — fallback Supabase direct', err);
    return sb.fetchPublishedEvents();
  }
}

export async function fetchEventFromApi(idOrSlug: string): Promise<Event | null> {
  if (!isSupabaseEnabled) return null;
  try {
    const events = await fetchPublicApi(idOrSlug);
    return events[0] ?? null;
  } catch {
    return sb.fetchEvent(idOrSlug);
  }
}
