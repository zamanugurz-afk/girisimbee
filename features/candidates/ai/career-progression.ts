import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import { toCareerPeriodInterval } from '@/features/candidates/lib/career-experience-dates';
import { isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';

export type CareerProgression = {
  from: string;
  to: string;
};

function roleLabel(exp: CareerExperience): string {
  if (isManualCareerOption(exp.role)) return (exp.roleOther ?? '').trim();
  return exp.role.trim();
}

function companyKey(exp: CareerExperience): string {
  return (exp.company ?? '').trim().toLocaleLowerCase('tr-TR');
}

/**
 * Same employer, different roles over time → career progression.
 * Does not invent titles. Skips rows without a company (cannot prove same employer).
 */
export function detectCareerProgression(experiences: CareerExperience[]): CareerProgression[] {
  const groups = new Map<string, CareerExperience[]>();
  for (const exp of experiences) {
    const key = companyKey(exp);
    if (key.length < 2) continue;
    const list = groups.get(key) ?? [];
    list.push(exp);
    groups.set(key, list);
  }

  const out: CareerProgression[] = [];
  for (const rows of groups.values()) {
    if (rows.length < 2) continue;
    const sorted = [...rows].sort((a, b) => {
      const aInterval = toCareerPeriodInterval(a);
      const bInterval = toCareerPeriodInterval(b);
      if (aInterval && bInterval) return aInterval.start - bInterval.start;
      return 0;
    });
    const roles: string[] = [];
    for (const row of sorted) {
      const role = roleLabel(row);
      if (!role) continue;
      if (roles[roles.length - 1] === role) continue;
      roles.push(role);
    }
    if (roles.length < 2) continue;
    out.push({ from: roles[0]!, to: roles[roles.length - 1]! });
  }
  return out;
}
