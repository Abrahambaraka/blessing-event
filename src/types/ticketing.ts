export type EventStatus = 'draft' | 'published' | 'closed';
export type OrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded';
export type TicketStatus = 'issued' | 'checked_in' | 'cancelled' | 'refunded';
export type FeeMode = 'buyer' | 'organizer';
export type Currency = 'EUR' | 'USD' | 'CDF';

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: Currency;
  quantity: number;
  sold: number;
  saleStart?: string;
  saleEnd?: string;
}

export interface Participant {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  voteCount: number;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  venue: string;
  city: string;
  imageUrl: string;
  status: EventStatus;
  capacity: number;
  feeMode: FeeMode;
  currency: Currency;
  ticketTypes: TicketType[];
  participants?: Participant[];
  votePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
}

export interface OrderItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  fees: number;
}

export interface Order {
  id: string;
  eventId: string;
  eventTitle: string;
  buyerEmail: string;
  buyerName: string;
  items: OrderItem[];
  subtotal: number;
  totalFees: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  attendees: Attendee[];
  createdAt: string;
  paidAt?: string;
  expiresAt?: string;
}

export interface Ticket {
  id: string;
  code: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  holderName: string;
  holderEmail: string;
  status: TicketStatus;
  price: number;
  fees: number;
  currency: Currency;
  eventDate: string;
  venue: string;
  issuedAt: string;
  checkedInAt?: string;
}

export interface CheckInRecord {
  id: string;
  ticketId: string;
  eventId: string;
  scannedAt: string;
  scannedBy: string;
}

export interface CartItem {
  ticketTypeId: string;
  quantity: number;
}

export interface FeeBreakdown {
  subtotal: number;
  totalFees: number;
  total: number;
  perTicket: { ticketTypeId: string; name: string; quantity: number; unitPrice: number; feesPerTicket: number; lineFees: number }[];
}
