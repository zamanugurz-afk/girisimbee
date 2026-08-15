import 'server-only';

import { getInvestorAiCache, setInvestorAiCache } from '@/features/investors/ai/investor-ai-cache';
import {
  compactInvestorAiContext,
  investorAiFingerprint,
  investorAiPolishFingerprint,
} from '@/features/investors/ai/investor-ai-context';
import { parseInvestorAiAnalysis } from '@/features/investors/ai/investor-ai-parse';
import {
  analyzeInvestorPrompt,
  INVESTOR_AI_SYSTEM_ANALYZE,
  INVESTOR_AI_SYSTEM_POLISH,
  polishInvestorPrompt,
} from '@/features/investors/ai/investor-ai-prompts';
import type {
  InvestorAiAnalyzeRequest,
  InvestorAiAnalyzeResult,
  InvestorAiPolishRequest,
  InvestorAiPolishResult,
} from '@/features/investors/ai/investor-ai.types';
import { groundedInvestorTextOrEmpty } from '@/features/investors/ai/investor-ai-grounding';
import { sentenceCaseInvestment } from '@/features/investments/lib/investment-text';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import { openaiJsonCompletion } from '@/lib/openai/career-openai';
import { ValidationError } from '@/lib/domain/errors';

function needsSemanticInvestorPolish(text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?…]+/u).map((part) => part.trim()).filter(Boolean);
  return words.length > 18 || sentences.length > 2;
}

export async function runInvestorAiAnalyze(
  input: InvestorAiAnalyzeRequest,
): Promise<InvestorAiAnalyzeResult> {
  const context = compactInvestorAiContext(input.context);
  const fingerprint = input.fingerprint || investorAiFingerprint(context);
  const cached = getInvestorAiCache<InvestorAiAnalyzeResult>(fingerprint);
  if (cached) return { ...cached, source: 'cache', fingerprint };

  const { json } = await openaiJsonCompletion({
    system: INVESTOR_AI_SYSTEM_ANALYZE,
    user: analyzeInvestorPrompt(context),
    maxTokens: 420,
  });
  const parsed = parseInvestorAiAnalysis(json, JSON.stringify(context));
  if (!parsed) {
    throw new ValidationError(
      'AI özeti şu anda oluşturulamadı. Yatırımcı özetinizi manuel olarak yazabilirsiniz.',
      { professionalInvestorSummary: ['empty_or_ungrounded'] },
    );
  }
  const result: InvestorAiAnalyzeResult = {
    action: 'analyze',
    source: 'ai',
    fingerprint,
    ...parsed,
  };
  setInvestorAiCache(fingerprint, result);
  return result;
}

export async function runInvestorAiPolish(
  input: InvestorAiPolishRequest,
): Promise<InvestorAiPolishResult> {
  const prepared = prepareTextForCareerAi(input.text, 12);
  if (prepared.blocked) {
    throw new ValidationError('Kişisel iletişim bilgisi AI isteğine eklenemez.', {
      text: ['PII_BLOCKED'],
    });
  }
  const fingerprint = investorAiPolishFingerprint(input.kind, prepared.text);
  const cached = getInvestorAiCache<InvestorAiPolishResult>(fingerprint);
  if (cached) return { ...cached, source: 'cache', fingerprint };

  if (!needsSemanticInvestorPolish(prepared.text)) {
    const result: InvestorAiPolishResult = {
      action: 'polish',
      source: 'deterministic',
      polished: sentenceCaseInvestment(prepared.text),
      fingerprint,
    };
    setInvestorAiCache(fingerprint, result);
    return result;
  }

  const { json } = await openaiJsonCompletion({
    system: INVESTOR_AI_SYSTEM_POLISH,
    user: polishInvestorPrompt({ kind: input.kind, text: prepared.text }),
    maxTokens: input.kind === 'summary' ? 280 : 160,
  });
  const record = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const polished = String(record.polished ?? '').trim();
  const grounded = groundedInvestorTextOrEmpty(polished, JSON.stringify({ text: prepared.text }));
  if (!grounded) {
    throw new ValidationError(
      'AI metni güvenilir şekilde iyileştirilemedi. Metni manuel düzenleyebilirsiniz.',
      { polished: ['ungrounded'] },
    );
  }
  const result: InvestorAiPolishResult = {
    action: 'polish',
    source: 'ai',
    polished: grounded,
    fingerprint,
  };
  setInvestorAiCache(fingerprint, result);
  return result;
}
