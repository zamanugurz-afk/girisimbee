import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { apiError, ok } from '@/lib/api/response';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { OpenAiUnavailableError } from '@/lib/openai/career-openai';
import { runInvestmentAiAnalyze, runInvestmentAiPolish } from '@/features/investments/ai/investment-ai.service';
import { INVESTMENT_AI_POLISH_KINDS } from '@/features/investments/ai/investment-ai.types';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import { ValidationError } from '@/lib/domain/errors';

const tractionSchema = z.object({
  monthlyRevenue: z.string().max(40),
  mrr: z.string().max(40),
  arr: z.string().max(40),
  activeCustomers: z.string().max(40),
  totalCustomers: z.string().max(40),
  users: z.string().max(40),
  growthRate: z.string().max(40),
  gmv: z.string().max(40),
});

const safeContextSchema = z.object({
  startupName: z.string().max(80),
  productName: z.string().max(80),
  sector: z.string().max(120),
  stage: z.string().max(80),
  productStatus: z.string().max(80),
  revenueStatus: z.string().max(80),
  tractionStatus: z.string().max(80),
  businessModel: z.array(z.string().max(80)).max(6),
  targetCustomer: z.array(z.string().max(80)).max(6),
  problem: z.string().max(280),
  solution: z.string().max(280),
  differentiation: z.string().max(280),
  traction: tractionSchema,
  fundingAmount: z.string().max(80),
  equityOffered: z.string().max(20),
  valuation: z.string().max(60),
  useOfFunds: z.array(z.string().max(80)).max(8),
  useOfFundsDetail: z.string().max(280),
  geography: z.string().max(80),
  founderCount: z.string().max(20),
  teamSize: z.string().max(20),
  founderExpertise: z.array(z.string().max(80)).max(6),
});

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('analyze'),
    context: safeContextSchema,
    fingerprint: z.string().max(64).optional(),
  }),
  z.object({
    action: z.literal('polish'),
    kind: z.enum(INVESTMENT_AI_POLISH_KINDS),
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
  const rate = checkRateLimit(`investment-ai:${body.action}:${ctx.userId}`, limit.limit, limit.windowMs);
  if (!rate.ok) {
    return apiError('Çok fazla AI isteği. Bir süre sonra tekrar deneyin.', 429, {
      code: 'RATE_LIMITED',
      retryAfterSec: rate.retryAfterSec,
    });
  }

  try {
    if (body.action === 'polish') {
      return ok(await runInvestmentAiPolish(body));
    }
    return ok(
      await runInvestmentAiAnalyze({
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
