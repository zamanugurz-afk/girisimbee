import type { CareerAiAnalysis } from '@/features/candidates/ai/career-ai.types';
import { groundedList, groundedTextOrEmpty } from '@/features/candidates/ai/career-ai-grounding';

function asTrimmedList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

export function parseCareerAiAnalysis(json: unknown, evidence: string): CareerAiAnalysis | null {
  const record = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const professionalSummary = groundedTextOrEmpty(
    String(record.professionalSummary ?? '').trim(),
    evidence,
  );
  const shortSummary = groundedTextOrEmpty(String(record.shortSummary ?? '').trim(), evidence);
  if (!professionalSummary) return null;
  return {
    professionalSummary,
    shortSummary,
    strengths: groundedList(asTrimmedList(record.strengths, 5), evidence),
    highlightedAchievements: groundedList(
      asTrimmedList(record.highlightedAchievements, 4),
      evidence,
    ),
    profileGaps: asTrimmedList(record.profileGaps, 4),
    improvementSuggestions: asTrimmedList(record.improvementSuggestions, 4),
  };
}
