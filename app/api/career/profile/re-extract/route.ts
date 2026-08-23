import { withAuth } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { cvService } from '@/features/candidates/cv/cv.service';

/**
 * POST /api/career/profile/re-extract
 * Re-runs deterministic extraction on existing CV document or raw text
 * returning the fresh extraction payload without modifying existing user overrides.
 */
export const POST = withAuth(async (ctx, request) => {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      rawText?: string;
      fileName?: string;
    };

    if (!body.rawText) {
      return apiError('Yeniden analiz edilecek metin bulunamadı.', 400);
    }

    const buffer = Buffer.from(body.rawText, 'utf-8');
    const result = await cvService.processCvBuffer({
      buffer,
      fileName: body.fileName || 're_extract.txt',
      mimeType: 'text/plain',
    });

    return ok({
      success: true,
      result,
      reExtractedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/career/profile/re-extract POST error:', error?.message || error);
    return apiError(error instanceof Error ? error.message : 'Yeniden analiz hatası.', 400);
  }
});
