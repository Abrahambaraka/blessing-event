import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  fetchAllEvents,
  getEventStats,
  updateEventStatus,
  createEvent,
  saveEvent,
  deleteEvent,
  dataMode,
} from '../src/services/ticketingService';
import type { CreateEventInput } from '../src/services/ticketingService';
import { formatPrice } from '../src/lib/fees';
import { useAuth } from '../src/contexts/AuthContext';
import EventFormModal from '../components/admin/EventFormModal';
import type { Event } from '../src/types/ticketing';

type EventStats = { sold: number; checkedIn: number; capacity: number; revenue: number };

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, EventStats | null>>({});
  const [modalEvent, setModalEvent] = useState<Event | null | undefined>(undefined);

  const loadEvents = useCallback(async () => {
    const list = await fetchAllEvents();
    setEvents(list);
    const statsEntries = await Promise.all(
      list.map(async (ev) => [ev.id, await getEventStats(ev.id)] as const)
    );
    setStatsMap(Object.fromEntries(statsEntries));
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const toggleStatus = async (event: Event) => {
    const next = event.status === 'published' ? 'draft' : 'published';
    await updateEventStatus(event.id, next);
    await loadEvents();
  };

  const handleSave = async (input: CreateEventInput | Event) => {
    if ('id' in input && 'createdAt' in input) {
      await saveEvent(input);
    } else {
      await createEvent(input);
    }
    await loadEvents();
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Supprimer « ${event.title} » ?`)) return;
    try {
      await deleteEvent(event.id);
      await loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  return (
    <div className="pt-24 md:pt-28 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.2em] font-bold mb-1">Back-Office Admin</p>
            <h1 className="font-serif text-2xl md:text-3xl text-navy">Gestion des événements</h1>
            <p className="text-sm text-slate-500">
              {user?.name} · Données : {dataMode() === 'supabase' ? 'Supabase' : 'Local (démo)'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setModalEvent(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-white text-xs font-bold uppercase tracking-widest rounded-lg"
            >
              <Plus size={14} /> Nouvel événement
            </button>
            <a href="#checkin" className="px-4 py-2 border border-navy text-navy text-xs font-bold uppercase tracking-widest rounded-lg">
              Contrôle d'accès →
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          {events.map((event) => {
            const stats = statsMap[event.id];
            return (
              <div key={event.id} className="bg-white p-5 md:p-6 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-semibold text-navy">{event.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {event.status === 'published' ? 'Publié' : event.status}
                    </span>
                    <span className="text-[10px] text-slate-400">#{event.slug}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(event.date).toLocaleDateString('fr-FR')} — {event.venue}, {event.city}
                  </p>
                  {stats && (
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        <BarChart3 size={14} className="text-gold" />
                        {stats.sold} vendus / {stats.capacity}
                      </span>
                      <span className="text-slate-600">{stats.checkedIn} entrées scannées</span>
                      <span className="font-semibold text-navy">
                        {formatPrice(stats.revenue, event.currency)} de recettes
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setModalEvent(event)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:border-gold">
                    <Pencil size={14} /> Modifier
                  </button>
                  <button type="button" onClick={() => toggleStatus(event)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:border-gold">
                    {event.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                    {event.status === 'published' ? 'Dépublier' : 'Publier'}
                  </button>
                  <button type="button" onClick={() => handleDelete(event)} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalEvent !== undefined && (
        <EventFormModal
          event={modalEvent}
          onClose={() => setModalEvent(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminPage;
