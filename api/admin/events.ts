import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, requireRole, json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import { listAllEvents, upsertEvent, removeEvent } from '../_lib/adminEvents';
import type { Event } from '../../src/types/ticketing';

/** GET /api/admin/events — liste | POST upsert | DELETE { eventId } */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await verifyBearerToken(req);
  if (!requireRole(auth, ['super_admin'])) {
    return json(res, 403, { error: 'Accès admin requis.' });
  }

  try {
    const admin = assertSupabaseAdmin();

    if (req.method === 'GET') {
      const events = await listAllEvents(admin);
      return json(res, 200, { events });
    }

    if (req.method === 'POST') {
      const event = req.body as Event;
      if (!event?.id || !event?.slug) {
        return json(res, 400, { error: 'Événement invalide.' });
      }
      const saved = await upsertEvent(admin, event);
      return json(res, 200, { ok: true, event: saved });
    }

    if (req.method === 'DELETE') {
      const eventId = (req.body?.eventId ?? req.query.eventId) as string | undefined;
      if (!eventId) return json(res, 400, { error: 'eventId requis.' });
      await removeEvent(admin, eventId);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur admin événements.';
    return json(res, 500, { error: message });
  }
}
