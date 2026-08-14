import 'server-only';

import { getInvestmentAiCache, setInvestmentAiCache } from '@/features/investments/ai/investment-ai-cache';
import {
  compactInvestmentAiContext,
  investmentAiFingerprint,
  investmentAiPolishFingerprint,
} from '@/features/investments/ai/investment-ai-context';
import { parseInvestmentAiAnalysis } from '@/features/investments/ai/investment-ai-parse';
import {
  analyzePrompt,
  INVESTMENT_AI_SYSTEM_ANALYZE,
  INVESTMENT_AI_SYSTEM_POLISH,
  polishPrompt,
} from '@/features/investments/ai/investment-ai-prompts';
import type {
  InvestmentAiAnalyzeRequest,
  InvestmentAiAnalyzeResult,
  InvestmentAiPolishRequest,
  InvestmentAiPolishResult,
} from '@/features/investments/ai/investment-ai.types';
import { sentenceCaseInvestment } from '@/features/investments/lib/investment-text';
import { groundedTextOrEmpty } from '@/features/candidates/ai/career-ai-grounding';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import { openaiJsonCompletion } from '@/lib/openai/career-openai';
import { ValidationError } from '@/lib/domain/errors';

function needsSemanticInvestmentPolish(text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?…]+/u).map((part) => part.trim()).filter(Boolean);
  return words.length > 18 || sentences.length > 2;
}

export async function runInvestmentAiAnalyze(
  input: InvestmentAiAnalyzeRequest,
): Promise<InvestmentAiAnalyzeResult> {
  const context = compactInvestmentAiContext(input.context);
  const fingerprint = input.fingerprint || investmentAiFingerprint(context);
  const cached = getInvestmentAiCache<InvestmentAiAnalyzeResult>(fingerprint);
  if (cached) return { ...cached, source: 'cache', fingerprint };

  const { json } = await openaiJsonCompletion({
    system: INVESTMENT_AI_SYSTEM_ANALYZE,
    user: analyzePrompt(context),
    maxTokens: 480,
  });
  const parsed = parseInvestmentAiAnalysis(json, JSON.stringify(context));
  if (!parsed) {
    throw new ValidationError(
      'AI özeti şu anda oluşturulamadı. Yatırımcı özetinizi manuel olarak yazabilirsiniz.',
      { professionalInvestmentSummary: ['empty_or_ungrounded'] },
    );
  }
  const result: InvestmentAiAnalyzeResult = {
    action: 'analyze',
    source: 'ai',
    fingerprint,
    ...parsed,
  };
  setInvestmentAiCache(fingerprint, result);
  return result;
}

export async function runInvestmentAiPolish(
  input: InvestmentAiPolishRequest,
): Promise<InvestmentAiPolishResult> {
  const prepared = prepareTextForCareerAi(input.text, 12);
  if (prepared.blocked) {
    throw new ValidationError('Kişisel iletişim bilgisi AI isteğine eklenemez.', {
      text: ['PII_BLOCKED'],
    });
  }
  const fingerprint = investmentAiPolishFingerprint(input.kind, prepared.text);
  const cached = getInvestmentAiCache<InvestmentAiPolishResult>(fingerprint);
  if (cached) return { ...cached, source: 'cache', fingerprint };

  if (input.kind !== 'summary' && !needsSemanticInvestmentPolish(prepared.text)) {
    const result: InvestmentAiPolishResult = {
      action: 'polish',
      source: 'deterministic',
      polished: sentenceCaseInvestment(prepared.text),
      fingerprint,
    };
    setInvestmentAiCache(fingerprint, result);
    return result;
  }

  const { json } = await openaiJsonCompletion({
    system: INVESTMENT_AI_SYSTEM_POLISH,
    user: polishPrompt({ kind: input.kind, text: prepared.text }),
    maxTokens: input.kind === 'summary' ? 280 : 160,
  });
  const record = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const polished = String(record.polished ?? '').trim();
  const grounded = groundedTextOrEmpty(polished, JSON.stringify({ text: prepared.text }));
  if (!grounded) {
    throw new ValidationError(
      'AI metni güvenilir şekilde iyileştirilemedi. Metni manuel düzenleyebilirsiniz.',
      { polished: ['ungrounded'] },
    );
  }
  const result: InvestmentAiPolishResult = {
    action: 'polish',
    source: 'ai',
    polished: grounded,
    fingerprint,
  };
  setInvestmentAiCache(fingerprint, result);
  return result;
}
