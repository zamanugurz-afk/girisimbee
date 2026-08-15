'use client';

import { assertSafeListingImageName } from '@/features/listings/lib/listing-content-policy';

const MAX_EDGE = 512;
const JPEG_QUALITY = 0.72;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Görsel okunamadı'));
    };
    img.src = url;
  });
}

async function compressForModeration(file: File): Promise<string> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height, 1));
  const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
  const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Görsel kontrolü hazırlanamadı.');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

/** Filename + OpenAI moderation. AI down → allow; flagged → throw. */
export async function assertUploadImageSafe(file: File): Promise<void> {
  const unsafeName = assertSafeListingImageName(file.name);
  if (unsafeName) throw new Error(unsafeName.message);

  let image: string;
  try {
    image = await compressForModeration(file);
  } catch {
    return;
  }

  const res = await fetch('/api/listings/image-safety', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image }),
  });
  if (res.status === 429) {
    throw new Error('Çok fazla görsel kontrolü. Bir süre sonra tekrar deneyin.');
  }
  if (res.status !== 422) return;
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  throw new Error(json.error || 'Bu görsel uygun değil. Lütfen başka bir görsel yükleyin.');
}
