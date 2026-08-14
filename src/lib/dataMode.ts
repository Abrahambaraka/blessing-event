import { isSupabaseEnabled } from './supabase';

const TICKETING_KEYS = [
  'be_ticketing_events',
  'be_ticketing_orders',
  'be_ticketing_tickets',
  'be_ticketing_checkins',
  'be_ticketing_seeded',
] as const;

/** Supprime les anciennes données billetterie localStorage (mode démo) */
export function clearLegacyTicketingStorage(): void {
  for (const key of TICKETING_KEYS) {
    localStorage.removeItem(key);
  }
}

/** À appeler au démarrage si Supabase est actif */
export function initProductionDataMode(): void {
  if (!isSupabaseEnabled) return;
  clearLegacyTicketingStorage();
}

export function isDatabaseMode(): boolean {
  return isSupabaseEnabled;
}
