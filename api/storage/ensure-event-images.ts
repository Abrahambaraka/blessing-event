import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, requireRole, json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import { ensureEventImagesBucket } from '../_lib/eventImagesStorage';

/** POST /api/storage/ensure-event-images — crée le bucket si absent */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const auth = await verifyBearerToken(req);
  if (!requireRole(auth, ['super_admin'])) {
    return json(res, 403, { error: 'Accès admin requis.' });
  }

  try {
    const admin = assertSupabaseAdmin();
    const created = await ensureEventImagesBucket(admin);
    return json(res, 200, { ok: true, created });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Impossible de créer le bucket.';
    return json(res, 500, { error: message });
  }
}
