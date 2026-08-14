import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, json } from '../_lib/auth';

/**
 * POST /api/payments/initiate
 * Initie CinetPay si configuré, sinon renvoie mode mock.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const { orderId, amount, currency, description, buyerEmail, buyerName } = req.body ?? {};

  if (!orderId || amount == null || !currency || !buyerEmail) {
    return json(res, 400, { error: 'Paramètres manquants (orderId, amount, currency, buyerEmail).' });
  }

  const auth = await verifyBearerToken(req);
  if (!auth) {
    return json(res, 401, { error: 'Authentification requise pour payer.' });
  }

  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  const notifyUrl = process.env.CINETPAY_NOTIFY_URL;
  const returnUrl =
    process.env.CINETPAY_RETURN_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/#my-tickets` : undefined);

  if (!apiKey || !siteId) {
    return json(res, 200, {
      success: true,
      mode: 'mock',
      transactionId: `mock-${orderId}`,
      message: 'CinetPay non configuré — paiement simulé côté client.',
    });
  }

  try {
    const transactionId = `${orderId}__${Date.now()}`;
    const payload = {
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
      amount: Math.round(Number(amount)),
      currency: currency === 'CDF' ? 'CDF' : 'USD',
      description: description ?? 'Billets Blessing Event',
      notify_url: notifyUrl,
      return_url: returnUrl,
      customer_name: buyerName ?? auth.email,
      customer_email: buyerEmail,
      channels: 'ALL',
    };

    const cpRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const cpData = await cpRes.json();

    if (cpData.code !== '201' && cpData.code !== 201) {
      return json(res, 502, { error: cpData.message ?? 'Erreur CinetPay' });
    }

    return json(res, 200, {
      success: true,
      mode: 'cinetpay',
      paymentUrl: cpData.data?.payment_url,
      transactionId,
    });
  } catch {
    return json(res, 500, { error: 'Erreur lors de la communication avec CinetPay.' });
  }
}
