import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';

const BUCKET = 'verification-media';
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export async function uploadVerificationMedia(
  userId: string,
  verificationId: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Yalnızca JPEG, PNG, WebP veya PDF yükleyebilirsiniz.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Dosya boyutu en fazla 10 MB olabilir.');
  }

  const driver = resolvePersistenceDriver();
  if (driver !== 'supabase') {
    return readFileAsDataUrl(file);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const path = `${userId}/${verificationId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message || 'Belge yüklenemedi');
  }

  return path;
}

export async function getVerificationDocumentUrl(path: string): Promise<string> {
  if (path.startsWith('data:')) return path;

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Belge görüntülenemedi');
  }

  return data.signedUrl;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}
