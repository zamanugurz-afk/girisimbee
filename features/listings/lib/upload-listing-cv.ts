import { createClient } from '@/lib/supabase/client';
import { resolvePersistenceDriver } from '@/lib/persistence/types';

const BUCKET = 'marketplace-documents';
const MAX_BYTES = 10 * 1024 * 1024;

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

function resolveContentType(file: File, ext: string): string {
  if (file.type && file.type !== 'application/octet-stream') {
    return file.type;
  }
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

function isAllowedFile(file: File, ext: string): boolean {
  if (!ALLOWED_EXTENSIONS.has(ext)) return false;
  const expected = MIME_BY_EXT[ext];
  if (!expected) return false;
  // Reject spoofed Content-Type when the browser sends one.
  if (file.type && file.type !== 'application/octet-stream' && file.type !== expected) {
    return false;
  }
  return true;
}

export async function uploadListingCv(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!isAllowedFile(file, ext)) {
    throw new Error('Desteklenen formatlar: PDF, DOC, DOCX.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Dosya boyutu en fazla 10 MB olabilir.');
  }

  const driver = resolvePersistenceDriver();
  if (driver !== 'supabase') {
    return readFileAsDataUrl(file);
  }

  const supabase = createClient();
  const safeExt = ext;
  const path = `${userId}/cv/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const contentType = resolveContentType(file, safeExt);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[uploadListingCv]', {
      bucket: BUCKET,
      path,
      contentType,
      fileName: file.name,
      fileSize: file.size,
    });
  }

  const { data: uploadData, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(uploadData);
    if (error) console.log(error);
  }

  if (error) {
    throw new Error('Dosya yüklenemedi.');
  }

  const { data: signedUrlData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (process.env.NODE_ENV !== 'production') {
    console.log(signedUrlData);
    if (signError) console.log(signError);
  }

  if (signError || !signedUrlData?.signedUrl) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(supabase.storage.from(BUCKET).getPublicUrl(path));
    }
    return `${BUCKET}/${path}`;
  }

  return signedUrlData.signedUrl;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}
