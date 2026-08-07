const BUCKET = 'marketplace-documents';
const MAX_CV_REF_LENGTH = 512;

/** Normalize CV value to a compact storage ref before API persistence. */
export function normalizeCvStorageRef(cvUrl: string | null | undefined): string | null {
  if (!cvUrl) return null;

  const trimmed = cvUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith(`${BUCKET}/`)) {
    return trimmed.length <= MAX_CV_REF_LENGTH ? trimmed : null;
  }

  const signMatch = trimmed.match(/\/object\/sign\/(marketplace-documents\/[^?]+)/);
  if (signMatch?.[1]) {
    return signMatch[1];
  }

  const publicMatch = trimmed.match(/\/object\/public\/(marketplace-documents\/[^?]+)/);
  if (publicMatch?.[1]) {
    return publicMatch[1];
  }

  if (trimmed.startsWith('data:')) {
    return null;
  }

  return trimmed.length <= MAX_CV_REF_LENGTH ? trimmed : null;
}

export function isValidCvStorageRef(cvUrl: string | null | undefined): boolean {
  return normalizeCvStorageRef(cvUrl) !== null;
}
