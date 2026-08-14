import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import { loadOrderById } from '../_lib/ticketing';
import { fulfillOrderPayment } from '../_lib/payments';

/** POST /api/payments/confirm — confirmation mock / retour client */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const { orderId, transactionId } = req.body ?? {};
  if (!orderId) {
    return json(res, 400, { error: 'orderId requis' });
  }

  const auth = await verifyBearerToken(req);

  try {
    const admin = assertSupabaseAdmin();

    if (auth) {
      const existing = await loadOrderById(admin, orderId);
      if (
        existing &&
        existing.buyerEmail.toLowerCase() !== auth.email.toLowerCase() &&
        auth.role !== 'super_admin'
      ) {
        return json(res, 403, { error: 'Accès refusé.' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return json(res, 401, { error: 'Authentification requise.' });
    }

    const txId = typeof transactionId === 'string' ? transactionId : `mock-${orderId}`;
    const result = await fulfillOrderPayment(admin, {
      orderId,
      transactionId: txId,
      provider: txId.startsWith('mock-') ? 'mock' : 'cinetpay',
    });

    return json(res, 200, { ok: true, alreadyProcessed: result.alreadyProcessed, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Confirmation paiement échouée.';
    return json(res, 400, { error: message });
  }
}
