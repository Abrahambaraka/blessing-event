import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, requireRole, json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import { createOrderOnServer } from '../_lib/ticketing';
import { fulfillOrderPayment } from '../_lib/payments';
import type { Attendee, CartItem } from '../../src/types/ticketing';

/** POST /api/orders/create */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const auth = await verifyBearerToken(req);
  if (!requireRole(auth, ['client', 'staff', 'super_admin'])) {
    return json(res, 401, { error: 'Authentification requise.' });
  }

  const { eventId, items, buyer, attendees } = req.body ?? {};

  if (!eventId || !Array.isArray(items) || items.length === 0) {
    return json(res, 400, { error: 'eventId et items requis.' });
  }

  const buyerEmail = (buyer?.email ?? auth.email).trim().toLowerCase();
  if (buyerEmail !== auth.email.toLowerCase()) {
    return json(res, 403, { error: 'L\'email acheteur doit correspondre au compte connecté.' });
  }

  try {
    const admin = assertSupabaseAdmin();
    const order = await createOrderOnServer(admin, {
      eventId,
      items: items as CartItem[],
      buyer: {
        name: buyer?.name ?? auth.email,
        email: buyerEmail,
      },
      attendees: (attendees ?? []) as Attendee[],
      buyerId: auth.userId,
    });

    if (order.status === 'paid') {
      await fulfillOrderPayment(admin, {
        orderId: order.id,
        transactionId: `free-${order.id}`,
        provider: 'free',
        amount: 0,
        currency: order.currency,
      });
    }

    return json(res, 201, { order });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur création commande.';
    return json(res, 400, { error: message });
  }
}
