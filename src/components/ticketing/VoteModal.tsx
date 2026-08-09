import React, { useState } from 'react';
import { X, Smartphone, Plus, Minus } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, app } from '../../firebase';
import type { Event, Participant } from '../../types/ticketing';
import { formatPrice } from '../../lib/fees';

interface VoteModalProps {
  event: Event;
  participant: Participant;
  onClose: () => void;
  onSuccess: () => void;
}

const VoteModal: React.FC<VoteModalProps> = ({ event, participant, onClose, onSuccess }) => {
  const [voteCount, setVoteCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const votePrice = event.votePrice || 1; // Default 1
  const total = votePrice * voteCount;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const functions = getFunctions(app);
      const initiatePayment = httpsCallable(functions, 'initiateCinetPayPayment');
      
      const result = await initiatePayment({
        eventId: event.id,
        amount: total,
        currency: event.currency || 'USD',
        type: 'vote',
        participantId: participant.id,
        voteCount: voteCount,
        returnUrl: window.location.href
      });
      
      const data = result.data as any;
      const transactionId = data.transactionId;
      const paymentUrl = data.paymentUrl;
      
      if (!db) throw new Error("Firestore n'est pas activé ou initialisé");

      // Save references in sessionStorage in case of redirect
      sessionStorage.setItem('pending_cinetpay_vote_txn', transactionId);
      sessionStorage.setItem('pending_vote_participant', participant.id);

      setError('Redirection vers la page de paiement sécurisée...');
      
      // Redirect to CinetPay
      window.location.href = paymentUrl;

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'initiation du paiement');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-navy bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl text-navy mb-2">Voter pour</h2>
            <div className="flex flex-col items-center">
              {participant.imageUrl ? (
                <img src={participant.imageUrl} alt={participant.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gold/20" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-400">{participant.name[0]}</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-navy">{participant.name}</h3>
              <p className="text-sm text-slate-500">{participant.description}</p>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-4 text-center">Nombre de votes</label>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-gold hover:text-gold transition-colors"
              >
                <Minus size={20} />
              </button>
              <div className="w-20 text-center">
                <span className="text-3xl font-bold text-navy">{voteCount}</span>
              </div>
              <button 
                onClick={() => setVoteCount(voteCount + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-gold hover:text-gold transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="text-center mt-4 text-slate-500">
              Total : <span className="font-bold text-navy">{formatPrice(total, event.currency || 'USD')}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-2">
              <Smartphone size={14} />
              Paiement sécurisé via CinetPay
            </p>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 bg-gold text-white font-bold text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirection...' : `Payer ${formatPrice(total, event.currency || 'USD')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteModal;
