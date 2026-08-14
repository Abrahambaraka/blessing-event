import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, requireRole, json } from '../_lib/auth';

/**
 * GET /api/events — route protégée (exemple Phase 2)
 * Client+ : accès catalogue | Super Admin : accès complet
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const auth = await verifyBearerToken(req);

  if (!requireRole(auth, ['client', 'staff', 'super_admin'])) {
    return json(res, 401, {
      error: 'Authentification requise',
      redirect: '#login?return=events',
    });
  }

  return json(res, 200, {
    ok: true,
    role: auth.role,
    message: 'API billetterie protégée — prête pour migration Firestore/Supabase DB.',
    permissions: {
      canBuyTickets: true,
      canManageEvents: auth.role === 'super_admin',
      canCheckIn: auth.role === 'super_admin' || auth.role === 'staff',
    },
  });
}
