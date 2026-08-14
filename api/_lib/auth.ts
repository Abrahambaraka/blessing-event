import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '../../src/types/auth';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
}

function getSupabaseConfig() {
  return {
    url: process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '',
  };
}

export async function verifyBearerToken(req: VercelRequest): Promise<AuthContext | null> {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;

  const client = createClient(url, anonKey);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;

  let role: UserRole = 'client';
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const rawRole = profile?.role ?? user.user_metadata?.role ?? user.app_metadata?.role;
  if (rawRole === 'super_admin' || rawRole === 'staff' || rawRole === 'client') {
    role = rawRole;
  }

  return {
    userId: user.id,
    email: user.email ?? '',
    role,
  };
}

export function requireRole(auth: AuthContext | null, roles: UserRole[]): auth is AuthContext {
  return auth !== null && roles.includes(auth.role);
}

export function json(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).json(body);
}
