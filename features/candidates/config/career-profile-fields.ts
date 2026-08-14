/**
 * Anonymous career-profile experience rows (İş Arıyorum).
 * Company may be stored for the owner; public mappers redact it.
 */
import {
  formatCareerPeriod,
  validateCareerPeriod,
  validateExperienceOverlaps,
} from '@/features/candidates/lib/career-experience-dates';
import { findCareerTextQualityIssue } from '@/features/candidates/lib/career-text-quality';
import {
  isManualCareerOption,
  MANUAL_OPTION,
} from '@/features/candidates/taxonomy/career-taxonomy';

export type CareerExperience = {
  id: string;
  sector: string;
  role: string;
  /** When role === MANUAL_OPTION */
  roleOther?: string;
  /** Owner-only; never shown on public candidate card. */
  company?: string;
  startMonth?: number | null;
  startYear?: number | null;
  endMonth?: number | null;
  endYear?: number | null;
  isCurrent?: boolean;
  /** Display / legacy string — derived from dates when possible. */
  duration: string;
  selectedResponsibilities?: string[];
  responsibilitiesOther?: string;
  responsibilities: string;
  selectedAchievements?: string[];
  achievementsOther?: string;
  /** Optional quantified note e.g. "%35 satış artışı" */
  achievementMetric?: string;
  achievements: string;
};

function toIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function joinSelections(selected: string[] | undefined, other: string | undefined): string {
  const parts = (selected ?? []).filter((s) => s && s !== MANUAL_OPTION);
  const otherTrim = (other ?? '').trim();
  if (otherTrim) parts.push(otherTrim);
  return parts.join('\n');
}

export function createEmptyCareerExperience(): CareerExperience {
  return {
    id: crypto.randomUUID(),
    sector: '',
    role: '',
    roleOther: '',
    company: '',
    startMonth: null,
    startYear: null,
    endMonth: null,
    endYear: null,
    isCurrent: false,
    duration: '',
    selectedResponsibilities: [],
    responsibilitiesOther: '',
    responsibilities: '',
    selectedAchievements: [],
    achievementsOther: '',
    achievementMetric: '',
    achievements: '',
  };
}

export function normalizeCareerExperience(row: CareerExperience): CareerExperience {
  const role =
    isManualCareerOption(row.role)
      ? (row.roleOther ?? '').trim() || MANUAL_OPTION
      : row.role.trim();
  const responsibilities =
    joinSelections(row.selectedResponsibilities, row.responsibilitiesOther) ||
    row.responsibilities.trim();
  const achievementsBase =
    joinSelections(row.selectedAchievements, row.achievementsOther) || row.achievements.trim();
  const metric = (row.achievementMetric ?? '').trim();
  const achievements = metric
    ? achievementsBase
      ? `${achievementsBase}\n${metric}`
      : metric
    : achievementsBase;

  const duration =
    formatCareerPeriod({
      startMonth: row.startMonth,
      startYear: row.startYear,
      endMonth: row.endMonth,
      endYear: row.endYear,
      isCurrent: row.isCurrent,
      duration: row.duration,
    }) || row.duration.trim();

  return {
    ...row,
    sector: row.sector.trim(),
    role,
    roleOther: row.roleOther ?? '',
    company: row.company ?? '',
    duration,
    responsibilities,
    achievements,
    responsibilitiesOther: row.responsibilitiesOther ?? '',
    achievementsOther: row.achievementsOther ?? '',
    achievementMetric: row.achievementMetric ?? '',
  };
}

export function parseCareerExperiences(value: unknown): CareerExperience[] {
  if (!Array.isArray(value)) return [];
  const parsed = value
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const id = typeof r.id === 'string' && r.id ? r.id : crypto.randomUUID();
      const selectedResponsibilities = Array.isArray(r.selectedResponsibilities)
        ? r.selectedResponsibilities.map(String)
        : undefined;
      const selectedAchievements = Array.isArray(r.selectedAchievements)
        ? r.selectedAchievements.map(String)
        : undefined;

      const parsedRow: CareerExperience = {
        id,
        sector: String(r.sector ?? '').trim(),
        role: String(r.role ?? '').trim(),
        roleOther: String(r.roleOther ?? ''),
        company: String(r.company ?? r.companyName ?? r.employer ?? ''),
        startMonth: toIntOrNull(r.startMonth),
        startYear: toIntOrNull(r.startYear),
        endMonth: toIntOrNull(r.endMonth),
        endYear: toIntOrNull(r.endYear),
        isCurrent: r.isCurrent === true,
        duration: String(r.duration ?? '').trim(),
        selectedResponsibilities,
        responsibilitiesOther: String(r.responsibilitiesOther ?? ''),
        responsibilities: String(r.responsibilities ?? '').trim(),
        selectedAchievements,
        achievementsOther: String(r.achievementsOther ?? ''),
        achievementMetric: String(r.achievementMetric ?? ''),
        achievements: String(r.achievements ?? '').trim(),
      };
      return normalizeCareerExperience(parsedRow);
    })
    .filter((row): row is CareerExperience => Boolean(row));

  return parsed.map((row, index) => (index === 0 ? row : { ...row, isCurrent: false }));
}

export function validateCareerExperiences(experiences: CareerExperience[]): string | null {
  if (experiences.length < 1) {
    return 'En az bir deneyim ekleyin.';
  }
  if (experiences.some((row, index) => index > 0 && row.isCurrent)) {
    return '“Halen çalışıyorum” yalnızca en son (1.) deneyimde seçilebilir.';
  }
  for (let i = 0; i < experiences.length; i += 1) {
    const raw = experiences[i]!;
    const exp = normalizeCareerExperience(raw);
    const prefix = `${i + 1}. deneyimde`;

    if (!exp.sector) {
      return `${prefix} sektör zorunludur.`;
    }

    const roleValue =
      isManualCareerOption(raw.role) ? (raw.roleOther ?? '').trim() : exp.role;
    if (!roleValue) {
      return `${prefix} pozisyon zorunludur.`;
    }
    if (isManualCareerOption(raw.role)) {
      const roleIssue = findCareerTextQualityIssue(raw.roleOther, {
        fieldLabel: 'Pozisyon',
        minLength: 2,
        maxLength: 120,
        required: true,
      });
      if (roleIssue) return `${prefix} ${roleIssue}`;
    }

    if (exp.company) {
      const companyIssue = findCareerTextQualityIssue(exp.company, {
        fieldLabel: 'Şirket',
        minLength: 2,
        maxLength: 120,
        required: false,
      });
      if (companyIssue) return `${prefix} ${companyIssue}`;
    }

    const hasStructuredDates = Boolean(raw.startMonth && raw.startYear);
    if (hasStructuredDates || !exp.duration) {
      const dateError = validateCareerPeriod({
        startMonth: raw.startMonth,
        startYear: raw.startYear,
        endMonth: raw.isCurrent ? null : raw.endMonth,
        endYear: raw.isCurrent ? null : raw.endYear,
        isCurrent: raw.isCurrent,
      });
      if (dateError) return `${prefix} ${dateError}`;
    } else if (!exp.duration.trim()) {
      return `${prefix} süre / tarih zorunludur.`;
    }

    const selectedResp = (raw.selectedResponsibilities ?? []).filter(Boolean);
    const wantsManualResp = selectedResp.includes(MANUAL_OPTION);
    if (selectedResp.length === 0 && !exp.responsibilities) {
      return `${prefix} temel sorumluluklar seçilmelidir.`;
    }
    if (wantsManualResp || (selectedResp.length === 0 && exp.responsibilities)) {
      const respSource = wantsManualResp
        ? raw.responsibilitiesOther
        : exp.responsibilities;
      const respIssue = findCareerTextQualityIssue(respSource, {
        fieldLabel: 'Temel sorumluluklar',
        minLength: 20,
        maxLength: 2000,
        required: true,
      });
      if (respIssue) return `${prefix} ${respIssue}`;
    } else if (exp.responsibilities.length < 10) {
      return `${prefix} temel sorumluluklar eksik.`;
    }

    const selectedAch = (raw.selectedAchievements ?? []).filter(Boolean);
    const wantsManualAch = selectedAch.includes(MANUAL_OPTION);
    if (wantsManualAch) {
      const achIssue = findCareerTextQualityIssue(raw.achievementsOther, {
        fieldLabel: 'Öne çıkan başarılar',
        minLength: 10,
        maxLength: 2000,
        required: true,
      });
      if (achIssue) return `${prefix} ${achIssue}`;
    } else if (exp.achievements) {
      const achIssue = findCareerTextQualityIssue(exp.achievements, {
        fieldLabel: 'Öne çıkan başarılar',
        minLength: 3,
        maxLength: 2000,
        required: false,
      });
      if (achIssue) return `${prefix} ${achIssue}`;
    }

    if (exp.achievementMetric) {
      const metricIssue = findCareerTextQualityIssue(exp.achievementMetric, {
        fieldLabel: 'Başarı ölçütü',
        minLength: 2,
        maxLength: 120,
        required: false,
      });
      if (metricIssue) return `${prefix} ${metricIssue}`;
    }
  }

  return validateExperienceOverlaps(experiences);
}
