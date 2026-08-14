import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, X, Plus, Trash2 } from 'lucide-react';
import type { Event, Currency, FeeMode, EventStatus } from '../types/ticketing';
import type { CreateEventInput } from '../services/ticketingService';
import { canUploadEventImages, uploadEventImage } from '../../src/services/imageUploadService';

interface EventFormModalProps {
  event?: Event | null;
  onClose: () => void;
  onSave: (input: CreateEventInput | Event) => Promise<void>;
}

const emptyTicket = () => ({ id: '', name: '', description: '', price: 0, quantity: 100, currency: undefined as Currency | undefined });

const EventFormModal: React.FC<EventFormModalProps> = ({ event, onClose, onSave }) => {
  const isEdit = Boolean(event);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Lubumbashi');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capacity, setCapacity] = useState(200);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [feeMode, setFeeMode] = useState<FeeMode>('buyer');
  const [status, setStatus] = useState<EventStatus>('draft');
  const [votePrice, setVotePrice] = useState<number | ''>('');
  const [ticketTypes, setTicketTypes] = useState([emptyTicket()]);

  useEffect(() => {
    if (!event) {
      setImageUrl('');
      setImagePreview('');
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date.slice(0, 16));
    setVenue(event.venue);
    setCity(event.city);
    setImageUrl(event.imageUrl);
    setImagePreview(event.imageUrl);
    setImageFile(null);
    setCapacity(event.capacity);
    setCurrency(event.currency);
    setFeeMode(event.feeMode);
    setStatus(event.status);
    setVotePrice(event.votePrice ?? '');
    setTicketTypes(
      event.ticketTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        description: tt.description ?? '',
        price: tt.price,
        quantity: tt.quantity,
        currency: tt.currency,
      }))
    );
  }, [event]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateTicket = (index: number, field: string, value: string | number) => {
    setTicketTypes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalImageUrl = imageUrl || '/logo.png';

      if (imageFile) {
        if (!canUploadEventImages()) {
          throw new Error('Upload indisponible — configurez Supabase ou utilisez une image existante.');
        }
        setUploadingImage(true);
        finalImageUrl = await uploadEventImage(imageFile);
        setUploadingImage(false);
      }

      const payload = {
        title,
        description,
        date: new Date(date).toISOString(),
        venue,
        city,
        imageUrl: finalImageUrl,
        capacity,
        currency,
        feeMode,
        status,
        votePrice: votePrice === '' ? undefined : Number(votePrice),
        ticketTypes: ticketTypes
          .filter((tt) => tt.name.trim())
          .map((tt) => ({
            id: tt.id || undefined,
            name: tt.name.trim(),
            description: tt.description?.trim(),
            price: Number(tt.price),
            quantity: Number(tt.quantity),
            currency: tt.currency,
          })),
      };

      if (isEdit && event) {
        await onSave({
          ...event,
          ...payload,
          ticketTypes: payload.ticketTypes.map((tt, i) => ({
            ...tt,
            id: tt.id ?? event.ticketTypes[i]?.id ?? `tt-${i}`,
            sold: event.ticketTypes.find((t) => t.id === tt.id)?.sold ?? 0,
          })),
          updatedAt: new Date().toISOString(),
        } as Event);
      } else {
        await onSave(payload as CreateEventInput);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setUploadingImage(false);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-navy/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-serif text-xl text-navy">{isEdit ? 'Modifier l\'événement' : 'Nouvel événement'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-navy">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Titre *</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Date *</label>
              <input required type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="closed">Clôturé</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Lieu *</label>
              <input required value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Ville</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Capacité</label>
              <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Devise</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CDF">CDF</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-2">Affiche / image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-40 h-40 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu affiche" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400 px-3">
                      <ImagePlus size={28} className="mx-auto mb-2 opacity-60" />
                      <p className="text-xs">Aucune image</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || loading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-navy/90 disabled:opacity-50"
                  >
                    <ImagePlus size={16} />
                    {imageFile ? 'Changer l\'image' : 'Choisir une image'}
                  </button>
                  {(imagePreview || imageFile) && (
                    <button
                      type="button"
                      onClick={clearImage}
                      disabled={uploadingImage || loading}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                    >
                      Retirer l'image
                    </button>
                  )}
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WebP ou GIF — max. 4 Mo
                  </p>
                  {uploadingImage && <p className="text-xs text-gold font-medium">Envoi de l'image en cours…</p>}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Prix du vote (optionnel)</label>
              <input type="number" min={0} step={0.01} value={votePrice} onChange={(e) => setVotePrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-navy mb-1">Frais payés par</label>
              <select value={feeMode} onChange={(e) => setFeeMode(e.target.value as FeeMode)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold outline-none">
                <option value="buyer">Acheteur</option>
                <option value="organizer">Organisateur</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-navy uppercase tracking-widest">Types de billets</h3>
              <button type="button" onClick={() => setTicketTypes((p) => [...p, emptyTicket()])} className="flex items-center gap-1 text-xs text-gold font-bold uppercase">
                <Plus size={14} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {ticketTypes.map((tt, i) => (
                <div key={i} className="grid sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <input placeholder="Nom (VIP, Standard…)" value={tt.name} onChange={(e) => updateTicket(i, 'name', e.target.value)} className="sm:col-span-2 px-3 py-2 border border-slate-200 rounded text-sm" />
                  <input type="number" placeholder="Prix" value={tt.price} onChange={(e) => updateTicket(i, 'price', Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded text-sm" />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Qté" value={tt.quantity} onChange={(e) => updateTicket(i, 'quantity', Number(e.target.value))} className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm" />
                    {ticketTypes.length > 1 && (
                      <button type="button" onClick={() => setTicketTypes((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 text-sm font-bold uppercase tracking-widest rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={loading || uploadingImage} className="flex-1 py-3 bg-navy text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-gold disabled:opacity-50">
              {loading || uploadingImage ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
