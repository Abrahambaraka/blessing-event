import type { Currency, FeeBreakdown, TicketType } from '../types/ticketing';

export function getTicketCurrency(ticket: { currency?: Currency }, event: { currency: Currency }): Currency {
  return ticket.currency ?? event.currency;
}

/** Frais Weezevent-like : 0,99 € + 2,5 % HT par billet payant (adapté CDF) */
export const FEE_FIXED = 0.99;
export const FEE_PERCENT = 0.025;
export const FEE_FIXED_CDF = 500;

export function calculateTicketFee(unitPrice: number, currency: Currency = 'EUR'): number {
  if (unitPrice <= 0) return 0;
  if (currency === 'CDF') {
    return Math.round(unitPrice * FEE_PERCENT + FEE_FIXED_CDF);
  }
  return Math.round((FEE_FIXED + unitPrice * FEE_PERCENT) * 100) / 100;
}

export function calculateOrderFees(
  items: { ticketTypeId: string; name: string; quantity: number; unitPrice: number; currency?: Currency }[],
  feeMode: 'buyer' | 'organizer' = 'buyer',
  defaultCurrency: Currency = 'EUR'
): FeeBreakdown {
  const perTicket = items.map((item) => {
    const currency = item.currency ?? defaultCurrency;
    const feesPerTicket = calculateTicketFee(item.unitPrice, currency);
    const lineFees = Math.round(feesPerTicket * item.quantity * 100) / 100;
    return { ...item, currency, feesPerTicket, lineFees };
  });

  const subtotal = Math.round(
    perTicket.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100
  ) / 100;
  const totalFees = Math.round(
    perTicket.reduce((sum, i) => sum + i.lineFees, 0) * 100
  ) / 100;

  const total = feeMode === 'buyer' ? subtotal + totalFees : subtotal;

  return { subtotal, totalFees, total, perTicket };
}

export function formatPrice(amount: number, currency: Currency): string {
  const locales: Record<Currency, string> = {
    EUR: 'fr-FR',
    USD: 'en-US',
    CDF: 'fr-CD',
  };
  return new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'CDF' ? 0 : 2,
  }).format(amount);
}

export function getAvailableQuantity(ticketType: TicketType): number {
  return Math.max(0, ticketType.quantity - ticketType.sold);
}

export function isTicketTypeOnSale(ticketType: TicketType): boolean {
  const now = Date.now();
  if (ticketType.saleStart && new Date(ticketType.saleStart).getTime() > now) return false;
  if (ticketType.saleEnd && new Date(ticketType.saleEnd).getTime() < now) return false;
  return getAvailableQuantity(ticketType) > 0;
}
