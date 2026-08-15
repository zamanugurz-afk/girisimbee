import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { apiError, ok } from '@/lib/api/response';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { OpenAiUnavailableError } from '@/lib/openai/career-openai';
import { runInvestorAiAnalyze, runInvestorAiPolish } from '@/features/investors/ai/investor-ai.service';
import { INVESTOR_AI_POLISH_KINDS } from '@/features/investors/ai/investor-ai.types';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import { ValidationError } from '@/lib/domain/errors';

const safeContextSchema = z.object({
  displayName: z.string().max(80),
  investorType: z.string().max(80),
  preferredSectors: z.array(z.string().max(80)).max(8),
  preferredStages: z.array(z.string().max(80)).max(8),
  allStages: z.boolean(),
  ticket: z.string().max(80),
  ticketMin: z.string().max(20),
  ticketMax: z.string().max(20),
  preferredProductStatuses: z.array(z.string().max(80)).max(6),
  preferredBusinessModels: z.array(z.string().max(80)).max(6),
  preferredTargetCustomers: z.array(z.string().max(80)).max(6),
  revenueExpectation: z.string().max(80),
  tractionExpectation: z.string().max(80),
  preferredGeographies: z.array(z.string().max(80)).max(8),
  equityPreference: z.string().max(80),
  valuationApproach: z.string().max(80),
  preferredUseOfFunds: z.array(z.string().max(80)).max(8),
  investmentThesis: z.string().max(280),
  mustHaveSignals: z.array(z.string().max(80)).max(6),
  dealBreakers: z.array(z.string().max(80)).max(6),
});

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('analyze'),
    context: safeContextSchema,
    fingerprint: z.string().max(64).optional(),
  }),
  z.object({
    action: z.literal('polish'),
    kind: z.enum(INVESTOR_AI_POLISH_KINDS),
    text: z.string().trim().min(10).max(2000),
  }),
]);

const LIMITS = {
  analyze: { limit: 6, windowMs: 10 * 60 * 1000 },
  polish: { limit: 15, windowMs: 10 * 60 * 1000 },
} as const;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, out));
    return out;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectStrings(item, out));
  }
  return out;
}

export const POST = withAuth(async (ctx, request) => {
  const parsed = bodySchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return apiError('İstek geçersiz.', 400, { code: 'VALIDATION_ERROR' });
  }

  const body = parsed.data;
  if (body.action === 'polish') {
    const prepared = prepareTextForCareerAi(body.text, body.kind === 'summary' ? 24 : 8);
    if (prepared.blocked) {
      return apiError('Kişisel iletişim bilgisi AI isteğine eklenemez.', 400, { code: 'PII_BLOCKED' });
    }
    body.text = prepared.text;
  } else {
    const preparedBits = collectStrings(body.context).map((text) => prepareTextForCareerAi(text, 0));
    if (preparedBits.some((bit) => bit.blocked)) {
      return apiError('Kişisel iletişim bilgisi AI isteğine eklenemez.', 400, { code: 'PII_BLOCKED' });
    }
  }

  const limit = LIMITS[body.action];
  const rate = checkRateLimit(`investor-ai:${body.action}:${ctx.userId}`, limit.limit, limit.windowMs);
  if (!rate.ok) {
    return apiError('Çok fazla AI isteği. Bir süre sonra tekrar deneyin.', 429, {
      code: 'RATE_LIMITED',
      retryAfterSec: rate.retryAfterSec,
    });
  }

  try {
    if (body.action === 'polish') {
      return ok(await runInvestorAiPolish(body));
    }
    return ok(
      await runInvestorAiAnalyze({
        action: 'analyze',
        context: body.context,
        fingerprint: body.fingerprint ?? '',
      }),
    );
  } catch (error) {
    if (error instanceof OpenAiUnavailableError) {
      return apiError(error.message, 503, { code: 'AI_UNAVAILABLE' });
    }
    if (error instanceof ValidationError) {
      const pii = error.fieldErrors?.text?.includes('PII_BLOCKED');
      return apiError(error.message, pii ? 400 : 422, {
        code: pii ? 'PII_BLOCKED' : 'VALIDATION_ERROR',
      });
    }
    throw error;
  }
});
