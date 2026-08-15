import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { apiError, ok } from '@/lib/api/response';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { moderateImageDataUrl } from '@/lib/openai/image-moderation';

const bodySchema = z.object({
  image: z.string().min(32).max(900_000),
});

export const POST = withAuth(async (ctx, request) => {
  const parsed = bodySchema.safeParse(await parseJsonBody(request));
  if (!parsed.success || !parsed.data.image.startsWith('data:image/')) {
    return apiError('Görsel kontrolü için geçerli bir dosya gerekli.', 400, {
      code: 'VALIDATION_ERROR',
    });
  }

  const rate = checkRateLimit(`image-safety:${ctx.userId}`, 20, 10 * 60 * 1000);
  if (!rate.ok) {
    return apiError('Çok fazla görsel kontrolü. Bir süre sonra tekrar deneyin.', 429, {
      code: 'RATE_LIMITED',
      retryAfterSec: rate.retryAfterSec,
    });
  }

  const verdict = await moderateImageDataUrl(parsed.data.image);
  if (!verdict.allowed) {
    return apiError(
      verdict.reason ?? 'Bu görsel uygun değil. Lütfen başka bir görsel yükleyin.',
      422,
      { code: 'UNSAFE_IMAGE' },
    );
  }
  return ok({ allowed: true });
});
