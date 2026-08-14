import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import type { Event } from '../../src/types/ticketing';

/**
 * GET /api/events/public — catalogue publié (sans auth, service role)
 * Query : ?slug=mon-evenement (optionnel, un seul événement)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const admin = assertSupabaseAdmin();
    const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined;

    let query = admin.from('be_events').select('data').eq('status', 'published').order('updated_at', { ascending: false });

    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const events = (data ?? []).map((r) => r.data as Event);

    if (slug && events.length === 0) {
      const { data: byId, error: idError } = await admin
        .from('be_events')
        .select('data')
        .eq('status', 'published')
        .eq('id', slug)
        .maybeSingle();
      if (idError) throw new Error(idError.message);
      if (byId) {
        return json(res, 200, { events: [byId.data as Event] });
      }
    }

    return json(res, 200, { events });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur chargement événements.';
    return json(res, 500, { error: message });
  }
}
