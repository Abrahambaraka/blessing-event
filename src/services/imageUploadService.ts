import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { compressImageForUpload } from '../lib/compressImage';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const BUCKET = 'event-images';

export function canUploadEventImages(): boolean {
  return isSupabaseEnabled;
}

function buildStoragePath(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `events/${Date.now()}-${id}.${ext}`;
}

function bucketHint(errorMessage: string): string {
  if (/bucket.*not found|Bucket not found|404/i.test(errorMessage)) {
    return 'Bucket event-images manquant — exécutez la section 007 de supabase/migrations/RUN_IN_SQL_EDITOR.sql dans Supabase.';
  }
  return errorMessage;
}

/** Upload direct Supabase Storage (JWT admin + RLS), sans API Vercel */
export async function uploadEventImage(file: File): Promise<string> {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Upload indisponible — Supabase non configuré.');
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Format non supporté. Utilisez JPG, PNG, WebP ou GIF.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Image trop volumineuse (maximum 5 Mo).');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Session expirée — reconnectez-vous.');
  }

  const compressed = await compressImageForUpload(file);
  const path = buildStoragePath(compressed.name);

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: compressed.type,
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(bucketHint(error.message));
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('URL publique manquante après upload.');
  }

  return data.publicUrl;
}
