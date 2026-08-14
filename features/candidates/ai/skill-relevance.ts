import { parseSelectedList } from '@/features/candidates/taxonomy/career-taxonomy';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

function fold(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR');
}

function tokens(value: string): string[] {
  return fold(value)
    .split(/[\s/·,.-]+/)
    .filter((token) => token.length > 2);
}

function scoreSkill(skill: string, haystack: string): number {
  const folded = fold(skill);
  if (!folded) return 0;
  if (haystack.includes(folded)) return 8;
  const skillTokens = tokens(skill);
  return skillTokens.reduce((sum, token) => (haystack.includes(token) ? sum + 2 : sum), 0);
}

/**
 * Pick 5–7 skills most related to the target role / experience text.
 * Deterministic — does not invent skills.
 */
export function pickHighlightedSkills(input: {
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  desiredRole?: string | null;
  primarySector?: string | null;
  experiences?: CareerExperience[];
  limit?: number;
}): string[] {
  const limit = input.limit ?? 7;
  const skills = [
    ...parseSelectedList(input.professionalSkills),
    ...parseSelectedList(input.technicalSkills),
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const skill of skills) {
    const key = fold(skill);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(skill);
  }

  if (unique.length <= limit) return unique;

  const haystack = fold(
    [
      input.desiredRole ?? '',
      input.primarySector ?? '',
      ...(input.experiences ?? []).flatMap((exp) => [
        exp.role,
        exp.roleOther ?? '',
        exp.responsibilities,
        exp.achievements,
      ]),
    ].join(' '),
  );

  return [...unique]
    .map((skill, index) => ({
      skill,
      score: scoreSkill(skill, haystack),
      index,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((row) => row.skill);
}
