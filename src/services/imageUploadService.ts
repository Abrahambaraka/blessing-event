import { isSupabaseEnabled } from '../lib/supabase';
import { compressImageForUpload, parseJsonResponse } from '../lib/compressImage';
import { getAccessToken } from './authService';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function canUploadEventImages(): boolean {
  return isSupabaseEnabled;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}

async function ensureBucket(token: string): Promise<void> {
  const response = await fetch('/api/storage/ensure-event-images', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await parseJsonResponse<{ error?: string }>(response);
  if (!response.ok) {
    throw new Error(data.error ?? 'Impossible de préparer le stockage images.');
  }
}

export async function uploadEventImage(file: File): Promise<string> {
  if (!isSupabaseEnabled) {
    throw new Error('Upload indisponible — Supabase non configuré.');
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Format non supporté. Utilisez JPG, PNG, WebP ou GIF.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Image trop volumineuse (maximum 5 Mo).');
  }

  const token = await getAccessToken();
  if (!token) throw new Error('Session expirée — reconnectez-vous.');

  await ensureBucket(token);

  const compressed = await compressImageForUpload(file);
  const dataBase64 = await fileToBase64(compressed);

  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: compressed.name,
      contentType: compressed.type,
      dataBase64,
    }),
  });

  const data = await parseJsonResponse<{ error?: string; publicUrl?: string }>(response);
  if (!response.ok) {
    throw new Error(data.error ?? `Upload échoué (${response.status}).`);
  }

  if (!data.publicUrl) {
    throw new Error('URL publique manquante après upload.');
  }

  return data.publicUrl;
}
