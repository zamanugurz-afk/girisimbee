import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';

const BUCKET = 'profile-media';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function uploadProfileMedia(
  userId: string,
  file: File,
  kind: 'avatar' | 'cover',
): Promise<string> {
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
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message || 'Görsel yüklenemedi');
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
