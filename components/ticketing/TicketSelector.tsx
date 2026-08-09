import React from 'react';
import { Minus, Plus } from 'lucide-react';
import type { CartItem, Event } from '../../src/types/ticketing';
import { formatPrice, getAvailableQuantity, isTicketTypeOnSale, calculateTicketFee, getTicketCurrency } from '../../src/lib/fees';

interface TicketSelectorProps {
  event: Event;
  cart: CartItem[];
  onChange: (cart: CartItem[]) => void;
}

const TicketSelector: React.FC<TicketSelectorProps> = ({ event, cart, onChange }) => {
  const getQty = (ticketTypeId: string) =>
    cart.find((c) => c.ticketTypeId === ticketTypeId)?.quantity ?? 0;

  const updateQty = (ticketTypeId: string, delta: number) => {
    const tt = event.ticketTypes.find((t) => t.id === ticketTypeId)!;
    const current = getQty(ticketTypeId);
    const next = Math.max(0, Math.min(current + delta, getAvailableQuantity(tt)));
    const newCart = cart.filter((c) => c.ticketTypeId !== ticketTypeId);
    if (next > 0) newCart.push({ ticketTypeId, quantity: next });
    onChange(newCart);
  };

  return (
    <div className="space-y-4">
      {event.ticketTypes.map((tt) => {
        const available = getAvailableQuantity(tt);
        const onSale = isTicketTypeOnSale(tt);
        const qty = getQty(tt.id);
        const fee = calculateTicketFee(tt.price, getTicketCurrency(tt, event));
        const currency = getTicketCurrency(tt, event);

        return (
          <div
            key={tt.id}
            className={`p-4 md:p-5 rounded-lg border ${onSale ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-navy">{tt.name}</h4>
                {tt.description && <p className="text-sm text-slate-500 mt-1">{tt.description}</p>}
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  <span className="font-bold text-navy">
                    {tt.price === 0 ? 'Gratuit' : formatPrice(tt.price, currency)}
                  </span>
                  {tt.price > 0 && event.feeMode === 'buyer' && (
                    <span className="text-slate-400">
                      + {formatPrice(fee, currency)} frais / billet
                    </span>
                  )}
                  <span className="text-slate-400">
                    {available > 0 ? `${available} restants` : 'Épuisé'}
                  </span>
                </div>
              </div>

              {onSale && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQty(tt.id, -1)}
                    disabled={qty === 0}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-navy hover:border-gold disabled:opacity-30 transition-custom"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-navy">{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(tt.id, 1)}
                    disabled={qty >= available}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-navy hover:border-gold disabled:opacity-30 transition-custom"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketSelector;
