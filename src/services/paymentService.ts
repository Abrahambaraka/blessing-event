import type { Order } from '../types/ticketing';
import { getAccessToken } from './authService';

export interface PaymentInitResult {
  success: boolean;
  mode: 'cinetpay' | 'mock';
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

/** Initie un paiement via l'API Vercel (CinetPay ou mode démo) */
export async function initiatePayment(order: Order): Promise<PaymentInitResult> {
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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? 'Impossible d\'initier le paiement.');
  }
  return data as PaymentInitResult;
}

/** Finalise après retour paiement ou mode mock */
export async function confirmMockPayment(orderId: string): Promise<void> {
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
    const data = await response.json();
    throw new Error(data.error ?? 'Confirmation paiement échouée.');
  }
}
