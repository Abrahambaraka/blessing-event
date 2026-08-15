import type { Order } from '../types/ticketing';
import { getAccessToken } from './authService';
import { shouldUseTicketingApi } from './ticketingApiService';
import { completePayment } from './ticketingService';

export interface PaymentInitResult {
  success: boolean;
  mode: 'cinetpay' | 'mock';
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

/** Initie un paiement — API Vercel ou mode démo local */
export async function initiatePayment(order: Order): Promise<PaymentInitResult> {
  if (!shouldUseTicketingApi()) {
    return { success: true, mode: 'mock', message: 'Paiement démo (sans API serveur).' };
  }

  const token = await getAccessToken();

  const response = await fetch('/api/payments/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
      description: `Billets — ${order.eventTitle}`,
      buyerEmail: order.buyerEmail,
      buyerName: order.buyerName,
    }),
  });

  const text = await response.text();
  let data: PaymentInitResult & { error?: string };
  try {
    data = JSON.parse(text) as PaymentInitResult & { error?: string };
  } catch {
    return { success: true, mode: 'mock', message: 'Paiement démo (API indisponible).' };
  }

  if (!response.ok) {
    throw new Error(data.error ?? 'Impossible d\'initier le paiement.');
  }
  return data;
}

/** Finalise après retour paiement ou mode mock */
export async function confirmMockPayment(orderId: string): Promise<void> {
  if (!shouldUseTicketingApi()) {
    await completePayment(orderId);
    return;
  }

  const token = await getAccessToken();
  const response = await fetch('/api/payments/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      throw new Error(data.error ?? 'Confirmation paiement échouée.');
    } catch {
      await completePayment(orderId);
    }
  }
}
