const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const JPEG_QUALITY = 0.82;
const TARGET_MAX_BYTES = 900_000;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de lire l\'image.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Compression impossible.'))),
      type,
      quality
    );
  });
}

/** Réduit l'image pour respecter la limite d'upload API Vercel */
export async function compressImageForUpload(file: File): Promise<File> {
  if (file.type === 'image/gif') {
    if (file.size <= TARGET_MAX_BYTES) return file;
    throw new Error('GIF trop volumineux — utilisez JPG ou PNG (max ~900 Ko après compression).');
  }

  const img = await loadImageFromFile(file);
  let { width, height } = img;
  const ratio = Math.min(1, MAX_WIDTH / width, MAX_HEIGHT / height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Compression impossible.');

  ctx.drawImage(img, 0, 0, width, height);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  let quality = JPEG_QUALITY;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > TARGET_MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  if (blob.size > TARGET_MAX_BYTES && outputType === 'image/png') {
    blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY);
  }

  if (blob.size > TARGET_MAX_BYTES) {
    throw new Error('Image trop grande même après compression — choisissez une photo plus petite.');
  }

  const ext = outputType === 'image/png' ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'affiche';
  return new File([blob], `${baseName}.${ext}`, { type: outputType });
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    const snippet = text.slice(0, 120).replace(/\s+/g, ' ').trim();
    throw new Error(
      snippet.startsWith('{')
        ? 'Réponse serveur invalide.'
        : snippet || `Erreur serveur (${response.status}).`
    );
  }
}
