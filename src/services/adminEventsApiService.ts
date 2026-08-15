import type { Event } from '../types/ticketing';
import { parseJsonResponse } from '../lib/compressImage';
import { getAccessToken } from './authService';
import { isSupabaseEnabled } from '../lib/supabase';
import * as sb from './supabaseTicketingService';

async function adminApi<T>(method: string, body?: unknown): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('Session expirée — reconnectez-vous.');

  const response = await fetch('/api/admin/events', {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await parseJsonResponse<{ error?: string } & T>(response);
  if (!response.ok) {
    throw new Error(data.error ?? `Erreur API admin (${response.status})`);
  }
  return data as T;
}

export function useAdminEventsApi(): boolean {
  return isSupabaseEnabled;
}

export async function adminFetchAllEvents(): Promise<Event[]> {
  if (!isSupabaseEnabled) return [];
  try {
    const { events } = await adminApi<{ events: Event[] }>('GET');
    return events;
  } catch (err) {
    console.warn('[admin] API indisponible — fallback Supabase direct', err);
    return sb.fetchAllEvents();
  }
}

export async function adminPersistEvent(event: Event): Promise<void> {
  if (!isSupabaseEnabled) return;
  try {
    await adminApi('POST', event);
  } catch (err) {
    console.warn('[admin] API indisponible — fallback Supabase direct', err);
    await sb.saveEvent(event);
  }
}

export async function adminRemoveEvent(eventId: string): Promise<void> {
  if (!isSupabaseEnabled) return;
  try {
    await adminApi('DELETE', { eventId });
  } catch (err) {
    console.warn('[admin] API indisponible — fallback Supabase direct', err);
    await sb.deleteEvent(eventId);
  }
}
