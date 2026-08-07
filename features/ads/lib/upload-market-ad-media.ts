import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';

const BUCKET = 'listing-media';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/**
 * MARKET reklam görseli — listing-media bucket, kullanıcı klasörü altında.
 * RLS: ilk path segment = auth.uid()
 */
export async function uploadMarketAdMedia(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Yalnızca JPEG, PNG, WebP veya GIF yükleyebilirsiniz.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Dosya boyutu en fazla 5 MB olabilir.');
  }

  const driver = resolvePersistenceDriver();
  if (driver !== 'supabase') {
    return readFileAsDataUrl(file);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/market-ads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message || 'Reklam görseli yüklenemedi');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}
