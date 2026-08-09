import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Ticket } from '../../src/types/ticketing';
import { formatPrice } from '../../src/lib/fees';

interface TicketDisplayProps {
  ticket: Ticket;
  compact?: boolean;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ ticket, compact = false }) => {
  const qrPayload = JSON.stringify({
    code: ticket.code,
    event: ticket.eventId,
    v: 1,
  });

  const statusLabel: Record<string, string> = {
    issued: 'Valide',
    checked_in: 'Utilisé',
    cancelled: 'Annulé',
    refunded: 'Remboursé',
  };

  const statusColor: Record<string, string> = {
    issued: 'bg-green-100 text-green-800',
    checked_in: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-100">
        <QRCodeSVG value={qrPayload} size={64} level="H" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-sm truncate">{ticket.eventTitle}</p>
          <p className="text-xs text-slate-500">{ticket.ticketTypeName} — {ticket.holderName}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-1">{ticket.code}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${statusColor[ticket.status]}`}>
          {statusLabel[ticket.status]}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-navy overflow-hidden max-w-md mx-auto shadow-lg">
      <div className="bg-navy text-white p-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Blessing Event</p>
        <h3 className="font-serif text-lg">{ticket.eventTitle}</h3>
      </div>

      <div className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG value={qrPayload} size={160} level="H" includeMargin />
        </div>
        <p className="font-mono text-sm text-navy tracking-wider">{ticket.code}</p>

        <div className="grid grid-cols-2 gap-3 text-left text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Titulaire</p>
            <p className="font-medium text-navy">{ticket.holderName}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Tarif</p>
            <p className="font-medium text-navy">{ticket.ticketTypeName}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Date</p>
            <p className="font-medium text-navy">
              {new Date(ticket.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Lieu</p>
            <p className="font-medium text-navy text-xs">{ticket.venue}</p>
          </div>
        </div>

        {ticket.price > 0 && (
          <p className="text-sm text-slate-500">
            {formatPrice(ticket.price, ticket.currency)}
            {ticket.fees > 0 && ` (+ ${formatPrice(ticket.fees, ticket.currency)} frais)`}
          </p>
        )}

        <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded ${statusColor[ticket.status]}`}>
          {statusLabel[ticket.status]}
        </span>
      </div>
    </div>
  );
};

export default TicketDisplay;
