import { supabase, isSupabaseEnabled } from '../lib/supabase';

const BUCKET = 'event-images';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function canUploadEventImages(): boolean {
  return isSupabaseEnabled && supabase !== null;
}

export async function uploadEventImage(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Upload indisponible — Supabase non configuré.');
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Format non supporté. Utilisez JPG, PNG, WebP ou GIF.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Image trop volumineuse (maximum 5 Mo).');
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `events/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    if (/bucket not found/i.test(error.message)) {
      throw new Error('Bucket event-images manquant — exécutez la migration 007 sur Supabase.');
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
