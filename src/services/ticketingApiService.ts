import type { Attendee, CartItem, Event, Order, Ticket } from '../types/ticketing';
import { getAccessToken } from './authService';
import { isSupabaseEnabled } from '../lib/supabase';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('Session expirée — reconnectez-vous.');

  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Erreur API (${response.status})`);
  }
  return data as T;
}

export function shouldUseTicketingApi(): boolean {
  return false;
}

export async function apiCreateOrder(
  event: Event,
  items: CartItem[],
  buyer: { name: string; email: string },
  attendees: Attendee[]
): Promise<Order> {
  const { order } = await apiFetch<{ order: Order }>('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      eventId: event.id,
      items,
      buyer,
      attendees,
    }),
  });
  return order;
}

export async function apiCompleteOrder(orderId: string): Promise<{ order: Order; tickets: Ticket[] }> {
  return apiFetch('/api/orders/complete', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

export async function apiFetchMyTickets(): Promise<Ticket[]> {
  const { tickets } = await apiFetch<{ tickets: Ticket[] }>('/api/tickets/mine');
  return tickets;
}
