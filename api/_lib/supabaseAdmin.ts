import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseUrl(): string {
  return process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
}

export function getSupabaseAnonKey(): string {
  return process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
}

/** Client admin — bypass RLS, réservé aux routes serverless */
export function createSupabaseAdmin(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseUserClient(accessToken: string): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function assertSupabaseAdmin(): SupabaseClient {
  const client = createSupabaseAdmin();
  if (!client) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant sur le serveur.');
  }
  return client;
}
