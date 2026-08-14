import 'server-only';

import { findCareerTextQualityIssue } from '@/features/candidates/lib/career-text-quality';
import { matchTaxonomyOptions } from '@/features/candidates/ai/match-taxonomy';
import {
  compactCareerAiContext,
  careerAiPolishFingerprint,
  fingerprintCanonical,
} from '@/features/candidates/ai/career-ai-context';
import { getCareerAiCache, setCareerAiCache } from '@/features/candidates/ai/career-ai-cache';
import {
  analyzePrompt,
  CAREER_AI_SYSTEM_ANALYZE,
  CAREER_AI_SYSTEM_POLISH,
  polishPrompt,
} from '@/features/candidates/ai/career-ai-prompts';
import { groundedTextOrEmpty } from '@/features/candidates/ai/career-ai-grounding';
import { parseCareerAiAnalysis } from '@/features/candidates/ai/career-ai-parse';
import { prepareTextForCareerAi, redactCareerAiValue } from '@/features/candidates/ai/career-ai-pii';
import {
  needsSemanticCareerPolish,
  polishCareerManualDeterministic,
} from '@/features/candidates/ai/career-ai-deterministic-polish';
import type {
  CareerAiAnalyzeRequest,
  CareerAiAnalyzeResult,
  CareerAiPolishRequest,
  CareerAiPolishResult,
  CareerAiSuggestRequest,
  CareerAiSuggestResult,
} from '@/features/candidates/ai/career-ai.types';
import { openaiJsonCompletion } from '@/lib/openai/career-openai';
import { ValidationError } from '@/lib/domain/errors';

function requireQuality(text: string, label: string, minLength: number) {
  const issue = findCareerTextQualityIssue(text, {
    fieldLabel: label,
    minLength,
    maxLength: 2000,
    required: true,
  });
  if (issue) {
    throw new ValidationError(issue, { text: [issue] });
  }
}

/** Taxonomy-only. Never calls OpenAI. */
export async function runCareerAiSuggest(
  input: CareerAiSuggestRequest,
): Promise<CareerAiSuggestResult> {
  requireQuality(input.text, 'Manuel giriş', input.kind === 'role' ? 2 : 8);
  const catalog = input.catalog.filter(Boolean).slice(0, 80);
  const fingerprint = fingerprintCanonical({
    action: 'suggest',
    kind: input.kind,
    text: input.text.trim(),
    catalog,
  });
  const cached = getCareerAiCache<CareerAiSuggestResult>(fingerprint);
  if (cached) return cached;

  const result: CareerAiSuggestResult = {
    action: 'suggest',
    source: 'taxonomy',
    suggestions: matchTaxonomyOptions(input.text, catalog, 5),
    fingerprint,
  };
  setCareerAiCache(fingerprint, result);
  return result;
}

export async function runCareerAiPolish(
  input: CareerAiPolishRequest,
): Promise<CareerAiPolishResult> {
  const prepared = prepareTextForCareerAi(input.text, input.kind === 'summary' ? 24 : 8);
  if (prepared.blocked) {
    throw new ValidationError('Kişisel iletişim bilgisi AI isteğine eklenemez.', {
      text: ['PII_BLOCKED'],
    });
  }
  requireQuality(prepared.text, input.kind === 'summary' ? 'Kariyer özeti' : 'Manuel giriş', 10);
  const fingerprint = careerAiPolishFingerprint({
    kind: input.kind,
    text: prepared.text,
    metric: input.metric,
    role: input.role,
    sector: input.sector,
    experienceLevel: input.experienceLevel,
    totalExperienceYears: input.totalExperienceYears,
  });
  const cached = getCareerAiCache<CareerAiPolishResult>(fingerprint);
  if (cached) return { ...cached, source: 'cache', fingerprint };

  if (input.kind !== 'summary' && !needsSemanticCareerPolish(prepared.text, input.kind)) {
    const result: CareerAiPolishResult = {
      action: 'polish',
      source: 'deterministic',
      polished: polishCareerManualDeterministic(input.kind, prepared.text, input.metric),
      fingerprint,
    };
    setCareerAiCache(fingerprint, result);
    return result;
  }

  const { json } = await openaiJsonCompletion({
    system: CAREER_AI_SYSTEM_POLISH,
    user: polishPrompt({
      kind: input.kind,
      text: prepared.text,
      metric: input.metric,
      role: input.role,
      sector: input.sector,
      experienceLevel: input.experienceLevel,
      totalExperienceYears: input.totalExperienceYears,
    }),
    maxTokens: input.kind === 'summary' ? 280 : 160,
  });
  const record = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const polished = String(record.polished ?? '').trim();
  const evidence = JSON.stringify({
    text: prepared.text,
    metric: input.metric ?? '',
    role: input.role ?? '',
    sector: input.sector ?? '',
    experienceLevel: input.experienceLevel ?? '',
    totalExperienceYears: input.totalExperienceYears ?? null,
  });
  const grounded = groundedTextOrEmpty(polished, evidence);
  if (!grounded) {
    throw new ValidationError('AI metni güvenilir şekilde iyileştirilemedi. Metni manuel düzenleyebilirsiniz.', {
      polished: ['ungrounded'],
    });
  }
  const result: CareerAiPolishResult = {
    action: 'polish',
    source: 'ai',
    polished: grounded,
    fingerprint,
  };
  setCareerAiCache(fingerprint, result);
  return result;
}

export async function runCareerAiAnalyze(
  input: CareerAiAnalyzeRequest,
): Promise<CareerAiAnalyzeResult> {
  const context = compactCareerAiContext(redactCareerAiValue(input.context));
  const fingerprint = fingerprintCanonical(context);
  const cached = getCareerAiCache<CareerAiAnalyzeResult>(fingerprint);
  if (cached) return { ...cached, source: 'cache', fingerprint };

  const { json } = await openaiJsonCompletion({
    system: CAREER_AI_SYSTEM_ANALYZE,
    user: analyzePrompt(context),
    maxTokens: 480,
  });
  const parsed = parseCareerAiAnalysis(json, JSON.stringify(context));
  if (!parsed) {
    throw new ValidationError('AI özeti şu anda oluşturulamadı. Kariyer özetinizi manuel olarak yazabilirsiniz.', {
      professionalSummary: ['empty_or_ungrounded'],
    });
  }
  const result: CareerAiAnalyzeResult = {
    action: 'analyze',
    source: 'ai',
    fingerprint,
    ...parsed,
  };
  setCareerAiCache(fingerprint, result);
  return result;
}
