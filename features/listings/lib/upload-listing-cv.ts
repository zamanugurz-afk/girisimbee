import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';

const BUCKET = 'listing-media';
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx']);

export async function uploadListingCv(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Yalnızca PDF veya DOCX dosyası yükleyebilirsiniz.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Dosya boyutu en fazla 10 MB olabilir.');
  }

  const driver = resolvePersistenceDriver();
  if (driver !== 'supabase') {
    return readFileAsDataUrl(file);
  }

  const supabase = createClient();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : 'pdf';
  const path = `${userId}/cv/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  });

  if (error) {
    throw new Error(error.message || 'Özgeçmiş yüklenemedi');
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
