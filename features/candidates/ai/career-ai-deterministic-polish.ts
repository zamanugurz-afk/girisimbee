import { composeAchievementWithMetric } from '@/features/candidates/ai/compose-achievement';
import { normalizeCareerTextWhitespace } from '@/features/candidates/lib/career-text-quality';
import type { CareerAiPolishKind } from '@/features/candidates/ai/career-ai.types';

function suggestSentenceCaseTr(value: string): string {
  const trimmed = normalizeCareerTextWhitespace(value);
  if (!trimmed) return '';
  const capped = trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1);
  return /[.!?…]$/u.test(capped) ? capped : `${capped}.`;
}

export function polishCareerManualDeterministic(
  kind: Exclude<CareerAiPolishKind, 'summary'>,
  text: string,
  metric?: string,
): string {
  const normalized = suggestSentenceCaseTr(text);
  if (kind === 'achievement') {
    return composeAchievementWithMetric(normalized, metric);
  }
  return normalized;
}

/**
 * Short responsibility/achievement lines that only need trim/case/punctuation/metric
 * must not go to OpenAI. Career-summary polish stays semantic (AI + cache).
 */
export function needsSemanticCareerPolish(
  text: string,
  kind: CareerAiPolishKind,
): boolean {
  if (kind === 'summary') return true;
  const normalized = normalizeCareerTextWhitespace(text);
  const words = normalized.split(/\s+/).filter(Boolean);
  const sentences = normalized.split(/[.!?…]+/u).map((part) => part.trim()).filter(Boolean);
  if (words.length <= 18 && sentences.length <= 2) return false;
  return true;
}
