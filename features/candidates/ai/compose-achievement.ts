import { normalizeCareerTextWhitespace } from '@/features/candidates/lib/career-text-quality';

/**
 * Joins a user-written achievement with a user-written metric.
 * Never invents a number — if metric is empty, returns the achievement only.
 */
export function composeAchievementWithMetric(
  achievement: string | null | undefined,
  metric: string | null | undefined,
): string {
  const text = normalizeCareerTextWhitespace(achievement ?? '');
  const measure = normalizeCareerTextWhitespace(metric ?? '');
  if (!text) return measure;
  if (!measure) return text;
  if (text.toLocaleLowerCase('tr-TR').includes(measure.toLocaleLowerCase('tr-TR'))) {
    return text;
  }
  const stripped = text.replace(/[.!?…]+$/u, '');
  return `${stripped} (${measure}).`;
}
