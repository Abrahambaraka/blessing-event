import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json } from '../_lib/auth';

/** POST /api/payments/confirm — webhook interne / mock */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const { orderId } = req.body ?? {};
  if (!orderId) {
    return json(res, 400, { error: 'orderId requis' });
  }

  return json(res, 200, { ok: true, orderId, status: 'confirmed' });
}
