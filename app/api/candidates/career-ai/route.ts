import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { apiError, ok } from '@/lib/api/response';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { OpenAiUnavailableError } from '@/lib/openai/career-openai';
import {
  runCareerAiAnalyze,
  runCareerAiPolish,
  runCareerAiSuggest,
  runOccupationalRank,
} from '@/features/candidates/ai/career-ai.service';
import {
  CAREER_AI_ACTIONS,
  CAREER_AI_MANUAL_KINDS,
  CAREER_AI_POLISH_KINDS,
} from '@/features/candidates/ai/career-ai.types';
import { assertNoPii } from '@/features/candidates/ai/career-ai-context';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import { ValidationError } from '@/lib/domain/errors';

const safeExperienceSchema = z.object({
  role: z.string().max(120),
  sector: z.string().max(120),
  period: z.string().max(80),
  responsibilities: z.array(z.string().max(400)).max(4),
  achievements: z.array(z.string().max(400)).max(3),
  metric: z.string().max(120),
});

const safeContextSchema = z.object({
  primarySector: z.string().max(120),
  desiredRole: z.string().max(200),
  experienceLevel: z.string().max(80),
  totalExperienceYears: z.number().int().min(0).max(60).nullable(),
  professionalSkills: z.array(z.string().max(200)).max(8),
  educationLevel: z.string().max(80),
  educationField: z.string().max(200),
  certificates: z.array(z.string().max(200)).max(5),
  languages: z
    .array(z.object({ language: z.string().max(80), level: z.string().max(40) }))
    .max(4),
  experiences: z.array(safeExperienceSchema).max(6),
  careerProgressions: z
    .array(z.object({ from: z.string().max(120), to: z.string().max(120) }))
    .max(4),
});

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('suggest'),
    kind: z.enum(CAREER_AI_MANUAL_KINDS),
    text: z.string().trim().min(2).max(2000),
    catalog: z.array(z.string().max(200)).max(80),
    sector: z.string().max(120).optional(),
    role: z.string().max(200).optional(),
    experienceLevel: z.string().max(80).optional(),
  }),
  z.object({
    action: z.literal('polish'),
    kind: z.enum(CAREER_AI_POLISH_KINDS),
    text: z.string().trim().min(10).max(2000),
    metric: z.string().max(120).optional(),
    role: z.string().max(200).optional(),
    sector: z.string().max(120).optional(),
    experienceLevel: z.string().max(80).optional(),
    totalExperienceYears: z.number().int().min(0).max(60).nullable().optional(),
  }),
  z.object({
    action: z.literal('analyze'),
    context: safeContextSchema,
    fingerprint: z.string().max(64).optional(),
  }),
  z.object({
    action: z.literal('occupational'),
    fingerprint: z.string().max(64).optional(),
    sector: z.string().max(120).optional(),
    role: z.string().max(200).optional(),
    roleOther: z.string().max(200).optional(),
    experienceLevel: z.string().max(80).optional(),
    totalExperienceYears: z.number().int().min(0).max(60).nullable().optional(),
    audience: z.enum(['seeker', 'hire', 'generic']).optional(),
    experienceRoles: z.array(z.string().max(120)).max(8).optional(),
    evidence: z.string().max(280).optional(),
    professionalCatalog: z.array(z.string().max(200)).max(24),
    technicalCatalog: z.array(z.string().max(200)).max(16),
    toolsCatalog: z.array(z.string().max(200)).max(16),
  }),
]);

const LIMITS: Record<(typeof CAREER_AI_ACTIONS)[number], { limit: number; windowMs: number }> = {
  suggest: { limit: 20, windowMs: 10 * 60 * 1000 },
  polish: { limit: 15, windowMs: 10 * 60 * 1000 },
  analyze: { limit: 6, windowMs: 10 * 60 * 1000 },
  occupational: { limit: 8, windowMs: 10 * 60 * 1000 },
};

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
  const piiLeaks = assertNoPii(body);
  if (piiLeaks.length > 0) {
    return apiError('Kişisel veri AI isteğine eklenemez.', 400, { code: 'PII_BLOCKED' });
  }

  if (body.action === 'polish') {
    const prepared = prepareTextForCareerAi(body.text, body.kind === 'summary' ? 24 : 8);
    if (prepared.blocked) {
      return apiError('Kişisel iletişim bilgisi AI isteğine eklenemez.', 400, { code: 'PII_BLOCKED' });
    }
    body.text = prepared.text;
  } else if (body.action === 'suggest') {
    const prepared = prepareTextForCareerAi(body.text, 2);
    if (prepared.blocked) {
      return apiError('Kişisel iletişim bilgisi AI isteğine eklenemez.', 400, { code: 'PII_BLOCKED' });
    }
    body.text = prepared.text;
  } else if (body.action === 'analyze') {
    const preparedBits = collectStrings(body.context).map((text) => prepareTextForCareerAi(text, 0));
    if (preparedBits.some((bit) => bit.blocked)) {
      return apiError('Kişisel iletişim bilgisi AI isteğine eklenemez.', 400, { code: 'PII_BLOCKED' });
    }
  } else if (body.action === 'occupational') {
    const preparedBits = collectStrings(body).map((text) => prepareTextForCareerAi(text, 0));
    if (preparedBits.some((bit) => bit.blocked)) {
      return apiError('Kişisel iletişim bilgisi AI isteğine eklenemez.', 400, { code: 'PII_BLOCKED' });
    }
  }

  const limit = LIMITS[body.action];
  const rate = checkRateLimit(`career-ai:${body.action}:${ctx.userId}`, limit.limit, limit.windowMs);
  if (!rate.ok) {
    return apiError('Çok fazla AI isteği. Bir süre sonra tekrar deneyin.', 429, {
      code: 'RATE_LIMITED',
      retryAfterSec: rate.retryAfterSec,
    });
  }

  try {
    if (body.action === 'suggest') {
      const result = await runCareerAiSuggest(body);
      return ok(result);
    }
    if (body.action === 'polish') {
      const result = await runCareerAiPolish(body);
      return ok(result);
    }
    if (body.action === 'occupational') {
      const result = await runOccupationalRank({
        ...body,
        fingerprint: body.fingerprint ?? '',
      });
      return ok(result);
    }
    const result = await runCareerAiAnalyze({
      action: 'analyze',
      context: body.context,
      fingerprint: body.fingerprint ?? '',
    });
    return ok(result);
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
