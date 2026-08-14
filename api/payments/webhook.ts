import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import { fulfillOrderPayment, parseOrderIdFromTransactionId } from '../_lib/payments';

/**
 * POST /api/payments/webhook — callback CinetPay
 * Body attendu : { cpm_trans_id, cpm_trans_status, ... } ou { transaction_id, status }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  const transactionId: string | undefined =
    body.cpm_trans_id ?? body.transaction_id ?? body.transactionId;

  if (!transactionId) {
    return json(res, 400, { error: 'transaction_id manquant.' });
  }

  const status = String(body.cpm_trans_status ?? body.status ?? '').toUpperCase();
  const isSuccess = status === '00' || status === 'ACCEPTED' || status === 'SUCCESS' || status === 'PAID';

  if (!isSuccess) {
    return json(res, 200, { ok: true, ignored: true, status });
  }

  const orderId = parseOrderIdFromTransactionId(transactionId);
  const provider = transactionId.startsWith('mock-') ? 'mock' : 'cinetpay';

  try {
    const admin = assertSupabaseAdmin();
    const result = await fulfillOrderPayment(admin, {
      orderId,
      transactionId,
      provider,
      webhookPayload: body,
    });

    return json(res, 200, {
      ok: true,
      orderId: result.order.id,
      ticketCount: result.tickets.length,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur webhook.';
    return json(res, 200, { ok: false, error: message });
  }
}
