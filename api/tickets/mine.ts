import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, requireRole, json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import { loadTicketsForEmail } from '../_lib/ticketing';

/** GET /api/tickets/mine — billets du client connecté */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const auth = await verifyBearerToken(req);
  if (!requireRole(auth, ['client', 'staff', 'super_admin'])) {
    return json(res, 401, { error: 'Authentification requise.' });
  }

  try {
    const admin = assertSupabaseAdmin();
    const tickets = await loadTicketsForEmail(admin, auth.email);
    return json(res, 200, { tickets });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur chargement billets.';
    return json(res, 500, { error: message });
  }
}
