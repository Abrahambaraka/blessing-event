import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyBearerToken, requireRole, json } from '../_lib/auth';
import { assertSupabaseAdmin } from '../_lib/supabaseAdmin';
import {
  buildEventImagePath,
  ensureEventImagesBucket,
  EVENT_IMAGES_BUCKET,
  getEventImagePublicUrl,
} from '../_lib/eventImagesStorage';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/**
 * POST /api/admin/upload-image
 * Body JSON : { fileName, contentType, dataBase64 }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const auth = await verifyBearerToken(req);
  if (!requireRole(auth, ['super_admin'])) {
    return json(res, 403, { error: 'Accès admin requis.' });
  }

  const { fileName, contentType, dataBase64 } = req.body ?? {};

  if (!fileName || !contentType || !dataBase64) {
    return json(res, 400, { error: 'fileName, contentType et dataBase64 requis.' });
  }

  if (!ALLOWED.has(contentType)) {
    return json(res, 400, { error: 'Format non supporté (JPG, PNG, WebP, GIF).' });
  }

  try {
    const buffer = Buffer.from(String(dataBase64), 'base64');
    if (buffer.byteLength > MAX_BYTES) {
      return json(res, 400, { error: 'Image trop volumineuse (maximum 4 Mo).' });
    }

    const admin = assertSupabaseAdmin();
    await ensureEventImagesBucket(admin);

    const path = buildEventImagePath(String(fileName));
    const { error } = await admin.storage.from(EVENT_IMAGES_BUCKET).upload(path, buffer, {
      contentType: String(contentType),
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw new Error(error.message);

    const publicUrl = getEventImagePublicUrl(admin, path);
    return json(res, 200, { ok: true, publicUrl, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload échoué.';
    return json(res, 500, { error: message });
  }
}
