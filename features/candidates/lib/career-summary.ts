import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import { estimateTotalExperienceYears } from '@/features/candidates/lib/career-experience-dates';
import {
  getExperienceLevelLabel,
  parseCareerLanguages,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';

export type CareerSummaryInput = {
  desiredRole?: string | null;
  experienceLevel?: string | null;
  primarySector?: string | null;
  workType?: string | null;
  preferredSectors?: string[] | string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  languages?: string | null;
  preferredCity?: string | null;
  workplacePreference?: string | null;
  availability?: string | null;
  experiences?: CareerExperience[];
};

function joinTr(parts: string[], lastSeparator = ' ve '): string {
  const clean = parts.map((part) => part.trim()).filter(Boolean);
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean[0]!;
  if (clean.length === 2) return `${clean[0]}${lastSeparator}${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')}${lastSeparator}${clean[clean.length - 1]}`;
}

function take(values: string[], limit: number): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, limit);
}

function sentence(text: string): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** Builds an editable Turkish career-summary draft from form fields. No company or contact data. */
export function buildCareerSummaryDraft(input: CareerSummaryInput): string {
  const role = (input.desiredRole ?? '').trim() || 'hedeflediğim pozisyon';
  const level = getExperienceLevelLabel(input.experienceLevel) || (input.experienceLevel ?? '').trim();
  const experiences = input.experiences ?? [];
  const totalYears = estimateTotalExperienceYears(experiences);
  const sectors = take(
    [
      ...(input.primarySector ? [input.primarySector] : []),
      ...parseSelectedList(input.preferredSectors),
      ...experiences.map((exp) => exp.sector),
    ],
    3,
  );
  const experienceRoles = take(
    experiences.map((exp) => exp.role).filter((value) => value && value !== role),
    3,
  );
  const professional = take(parseSelectedList(input.professionalSkills), 4);
  const technical = take(parseSelectedList(input.technicalSkills), 4);
  const languages = parseCareerLanguages(input.languages)
    .map((entry) => {
      const name = entry.languageOther?.trim() || entry.language;
      return name && entry.level ? `${name} (${entry.level})` : name;
    })
    .filter(Boolean)
    .slice(0, 3);
  const education = [input.educationLevel, input.educationField].filter(Boolean).join(' — ');
  const workPrefs = [input.preferredCity, input.workplacePreference, input.workType, input.availability]
    .map((value) => (value ?? '').trim())
    .filter(Boolean);

  const sentences: string[] = [];

  if (level && totalYears != null && totalYears > 0) {
    sentences.push(
      sentence(
        `${level} seviyesinde ${role} olarak ${totalYears} yıllık deneyimimi yeni bir rolde değerlendirmek istiyorum`,
      ),
    );
  } else if (level) {
    sentences.push(sentence(`${level} seviyesinde ${role} rollerine açığım`));
  } else {
    sentences.push(sentence(`${role} pozisyonunda katkı verebileceğim ekipler arıyorum`));
  }

  if (sectors.length > 0) {
    sentences.push(
      sentence(
        experienceRoles.length > 0
          ? `Deneyimim ${joinTr(sectors)} alanında yoğunlaşıyor; ${joinTr(experienceRoles)} rollerinde çalıştım`
          : `Odaklandığım alanlar ${joinTr(sectors)}`,
      ),
    );
  } else if (experienceRoles.length > 0) {
    sentences.push(sentence(`Daha önce ${joinTr(experienceRoles)} rollerinde çalıştım`));
  }

  if (professional.length > 0) {
    sentences.push(sentence(`Mesleki yetkinliklerim arasında ${joinTr(professional)} bulunuyor`));
  }
  if (technical.length > 0) {
    sentences.push(sentence(`Teknik olarak ${joinTr(technical)} kullanıyorum`));
  }
  if (education) {
    sentences.push(sentence(`Eğitim geçmişim ${education}`));
  }
  if (languages.length > 0) {
    sentences.push(sentence(`Yabancı dil: ${joinTr(languages)}`));
  }
  if (workPrefs.length > 0) {
    sentences.push(sentence(`Çalışma tercihim ${joinTr(workPrefs, ', ')}`));
  }

  sentences.push(
    'İletişim platform üzerinden yapılır; telefon, e-posta veya firma adı paylaşmıyorum.',
  );

  let draft = sentences.filter(Boolean).join(' ');
  if (draft.length < 100) {
    draft = `${draft} Kısa vadede sorumluluk alabileceğim, ölçülebilir katkı üretebileceğim bir ekibe dahil olmak istiyorum.`;
  }
  return draft;
}
