export type ImageModerationVerdict = {
  allowed: boolean;
  reason?: string;
  unavailable?: boolean;
};

type ModerationPayload = {
  results?: Array<{
    flagged?: boolean;
    categories?: Record<string, boolean | undefined>;
  }>;
};

export function verdictFromModerationPayload(payload: unknown): ImageModerationVerdict {
  const result = (payload as ModerationPayload)?.results?.[0];
  const categories = result?.categories ?? {};
  if (categories['sexual/minors']) {
    return {
      allowed: false,
      reason: 'Bu görsel yüklenemez. Lütfen ürününüzü gösteren başka bir görsel seçin.',
    };
  }
  if (categories.sexual) {
    return {
      allowed: false,
      reason: 'Çıplaklık veya cinsel içerikli görseller yüklenemez. Ürün veya iş görseli kullanın.',
    };
  }
  return { allowed: true };
}
