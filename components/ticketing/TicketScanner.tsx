import React, { useState } from 'react';
import { ScanLine, CheckCircle, XCircle, Keyboard } from 'lucide-react';
import { checkInTicket } from '../../src/services/ticketingService';

interface TicketScannerProps {
  eventId?: string;
}

const TicketScanner: React.FC<TicketScannerProps> = ({ eventId }) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [staffName, setStaffName] = useState(() => localStorage.getItem('be_staff_name') ?? '');

  const handleScan = async (scanCode?: string) => {
    const value = (scanCode ?? code).trim();
    if (!value) return;

    setLoading(true);
    setResult(null);

    let ticketCode = value;
    try {
      const parsed = JSON.parse(value);
      if (parsed.code) ticketCode = parsed.code;
    } catch {
      /* raw code */
    }

    const res = await checkInTicket(ticketCode, staffName || 'Staff');
    if (eventId && res.ticket && res.ticket.eventId !== eventId) {
      setResult({ success: false, message: 'Ce billet ne correspond pas à cet événement' });
    } else {
      setResult(res);
    }

    setLoading(false);
    if (res.success) setCode('');
  };

  const saveStaffName = (name: string) => {
    setStaffName(name);
    localStorage.setItem('be_staff_name', name);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy/10 mb-4">
          <ScanLine size={32} className="text-navy" />
        </div>
        <h2 className="font-serif text-2xl text-navy">Contrôle d'accès</h2>
        <p className="text-sm text-slate-500 mt-2">Scannez le QR code ou saisissez le code billet</p>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Agent</label>
        <input
          type="text"
          value={staffName}
          onChange={(e) => saveStaffName(e.target.value)}
          placeholder="Votre nom"
          className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-lg focus:border-gold focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Keyboard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder="BE-XXXXXXXX-XXXXXXXX"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg font-mono text-sm focus:border-gold focus:outline-none uppercase"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={() => handleScan()}
          disabled={loading || !code.trim()}
          className="px-6 py-3 bg-navy text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-navy/90 disabled:opacity-50 transition-custom"
        >
          {loading ? '...' : 'Valider'}
        </button>
      </div>

      {result && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          {result.success ? (
            <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
          ) : (
            <XCircle size={24} className="text-red-600 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketScanner;
