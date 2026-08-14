import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, Ticket } from '../../src/types/ticketing';
import { completeOrderOnServer, loadOrderById, loadTicketsByOrder } from './ticketing';
import { sendOrderConfirmationEmail } from './email';

export type PaymentProvider = 'cinetpay' | 'mock' | 'free';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PaymentRow {
  id: string;
  order_id: string;
  transaction_id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number | null;
  currency: string | null;
  webhook_payload: unknown;
  email_sent_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export function parseOrderIdFromTransactionId(transactionId: string): string {
  if (transactionId.startsWith('mock-')) return transactionId.slice(5);
  if (transactionId.startsWith('free-')) return transactionId.slice(5);
  if (transactionId.includes('__')) return transactionId.split('__')[0]!;
  const parts = transactionId.split('-');
  const last = parts[parts.length - 1] ?? '';
  return /^\d+$/.test(last) ? parts.slice(0, -1).join('-') : transactionId;
}

export async function getPaymentByTransactionId(
  admin: SupabaseClient,
  transactionId: string
): Promise<PaymentRow | null> {
  const { data, error } = await admin
    .from('be_payments')
    .select('*')
    .eq('transaction_id', transactionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as PaymentRow | null;
}

export async function createPendingPayment(
  admin: SupabaseClient,
  input: {
    orderId: string;
    transactionId: string;
    provider: PaymentProvider;
    amount?: number;
    currency?: string;
  }
): Promise<PaymentRow> {
  const existing = await getPaymentByTransactionId(admin, input.transactionId);
  if (existing) return existing;

  const { data, error } = await admin
    .from('be_payments')
    .insert({
      order_id: input.orderId,
      transaction_id: input.transactionId,
      provider: input.provider,
      status: 'pending',
      amount: input.amount ?? null,
      currency: input.currency ?? null,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const retry = await getPaymentByTransactionId(admin, input.transactionId);
      if (retry) return retry;
    }
    throw new Error(error.message);
  }
  return data as PaymentRow;
}

async function markPaymentCompleted(
  admin: SupabaseClient,
  paymentId: string,
  webhookPayload?: unknown
): Promise<void> {
  const { error } = await admin
    .from('be_payments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...(webhookPayload !== undefined ? { webhook_payload: webhookPayload } : {}),
    })
    .eq('id', paymentId);
  if (error) throw new Error(error.message);
}

async function markEmailSent(admin: SupabaseClient, paymentId: string): Promise<void> {
  const { error } = await admin
    .from('be_payments')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', paymentId);
  if (error) throw new Error(error.message);
}

async function maybeSendConfirmationEmail(
  admin: SupabaseClient,
  payment: PaymentRow,
  order: Order,
  tickets: Ticket[]
): Promise<void> {
  if (payment.email_sent_at) return;

  const sent = await sendOrderConfirmationEmail(order, tickets);
  if (sent) await markEmailSent(admin, payment.id);
}

export interface FulfillPaymentInput {
  orderId: string;
  transactionId: string;
  provider: PaymentProvider;
  amount?: number;
  currency?: string;
  webhookPayload?: unknown;
}

export interface FulfillPaymentResult {
  order: Order;
  tickets: Ticket[];
  alreadyProcessed: boolean;
}

/** Finalise commande + email — idempotent par transaction_id */
export async function fulfillOrderPayment(
  admin: SupabaseClient,
  input: FulfillPaymentInput
): Promise<FulfillPaymentResult> {
  let payment = await getPaymentByTransactionId(admin, input.transactionId);

  if (!payment) {
    payment = await createPendingPayment(admin, {
      orderId: input.orderId,
      transactionId: input.transactionId,
      provider: input.provider,
      amount: input.amount,
      currency: input.currency,
    });
  }

  if (payment.status === 'completed') {
    const order = await loadOrderById(admin, payment.order_id);
    const tickets = await loadTicketsByOrder(admin, payment.order_id);
    if (!order) throw new Error('Commande introuvable.');
    return { order, tickets, alreadyProcessed: true };
  }

  const orderBefore = await loadOrderById(admin, input.orderId);
  const wasAlreadyPaid = orderBefore?.status === 'paid';

  const result = await completeOrderOnServer(admin, input.orderId);
  await markPaymentCompleted(admin, payment.id, input.webhookPayload);
  await maybeSendConfirmationEmail(admin, payment, result.order, result.tickets);

  return { ...result, alreadyProcessed: wasAlreadyPaid };
}
