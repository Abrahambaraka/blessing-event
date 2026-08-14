import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, json } from '../_lib/auth';

/** GET /api/auth/me — valide le JWT et retourne l'utilisateur courant */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return json(res, 503, {
      error: 'Supabase non configuré',
      hint: 'Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sur Vercel.',
    });
  }

  const auth = await verifyBearerToken(req);
  if (!auth) {
    return json(res, 401, { error: 'Non authentifié' });
  }

  return json(res, 200, {
    userId: auth.userId,
    email: auth.email,
    role: auth.role,
  });
}
