import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, requireRole, json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import { completeOrderOnServer, loadOrderById } from '../_lib/ticketing';

/** POST /api/orders/complete — finalise paiement et émet les billets */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const auth = await verifyBearerToken(req);
  if (!requireRole(auth, ['client', 'staff', 'super_admin'])) {
    return json(res, 401, { error: 'Authentification requise.' });
  }

  const { orderId } = req.body ?? {};
  if (!orderId || typeof orderId !== 'string') {
    return json(res, 400, { error: 'orderId requis.' });
  }

  try {
    const admin = assertSupabaseAdmin();
    const existing = await loadOrderById(admin, orderId);

    if (!existing) {
      return json(res, 404, { error: 'Commande introuvable.' });
    }

    if (existing.buyerEmail.toLowerCase() !== auth.email.toLowerCase() && auth.role !== 'super_admin') {
      return json(res, 403, { error: 'Accès refusé à cette commande.' });
    }

    const result = await completeOrderOnServer(admin, orderId);
    return json(res, 200, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur finalisation commande.';
    return json(res, 400, { error: message });
  }
}
