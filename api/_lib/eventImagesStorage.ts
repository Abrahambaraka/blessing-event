import type { SupabaseClient } from '@supabase/supabase-js';

export const EVENT_IMAGES_BUCKET = 'event-images';

export async function ensureEventImagesBucket(admin: SupabaseClient): Promise<boolean> {
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) throw new Error(listError.message);

  const exists = (buckets ?? []).some(
    (b) => b.id === EVENT_IMAGES_BUCKET || b.name === EVENT_IMAGES_BUCKET
  );
  if (exists) return false;

  const { error } = await admin.storage.createBucket(EVENT_IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });

  if (error && !/already exists/i.test(error.message)) {
    throw new Error(error.message);
  }

  return true;
}

export function buildEventImagePath(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `events/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
}

export function getEventImagePublicUrl(admin: SupabaseClient, path: string): string {
  const { data } = admin.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
