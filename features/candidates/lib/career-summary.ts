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

const CONTACT_FLUFF = [
  /[İIıi]leti[sş]im platform üzerinden yapılır;\s*telefon,\s*e-posta veya firma adı paylaşmıyorum\.?/gi,
  /[İIıi]leti[sş]im platform üzerinden yapılır[^.]*\./gi,
  /telefon,\s*e-posta veya firma adı paylaşmıyorum\.?/gi,
  /Firma adı,\s*telefon veya sosyal medya hesabı yazmıyorum[^.]*\./gi,
  /[İIıi]leti[sş]im platform üzerinden\.?/gi,
];

/** Removes leftover contact-policy sentences without flattening the rest of the text. */
export function stripCareerContactFluff(text: string | null | undefined): string {
  const source = text ?? '';
  let next = source;
  let changed = false;
  for (const pattern of CONTACT_FLUFF) {
    pattern.lastIndex = 0;
    const replaced = next.replace(pattern, '');
    if (replaced !== next) {
      changed = true;
      next = replaced;
    }
  }
  if (!changed) return source;
  return next
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\./g, '.')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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

/** Removes leftover contact-policy sentences from stored career summaries. */
export function polishCareerSummary(text: string | null | undefined): string {
  return stripCareerContactFluff((text ?? '').replace(/\s+/g, ' ').trim())
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
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
  const place = (input.preferredCity ?? '').trim();
  const workplace = (input.workplacePreference ?? '').trim();
  const workType = (input.workType ?? '').trim();
  const availability = (input.availability ?? '').trim();

  const sentences: string[] = [];

  if (totalYears != null && totalYears > 0) {
    sentences.push(
      sentence(
        sectors.length > 0
          ? `${role} olarak ${joinTr(sectors)} alanında ${totalYears} yıllık deneyimle ekiplere katkı veriyorum`
          : `${role} olarak ${totalYears} yıllık deneyimle ölçülebilir katkı üretiyorum`,
      ),
    );
  } else if (level) {
    sentences.push(
      sentence(
        `${role} rolünde ${level.toLocaleLowerCase('tr-TR')} profiliyle sorumluluk almaya hazırım`,
      ),
    );
  } else {
    sentences.push(sentence(`${role} pozisyonunda analitik ve düzenli çalışmayla katkı vermek istiyorum`));
  }

  if (experienceRoles.length > 0) {
    sentences.push(sentence(`Daha önce ${joinTr(experienceRoles)} görevlerinde bulundum`));
  }

  if (professional.length > 0) {
    sentences.push(sentence(`Öne çıkan yetkinliklerim ${joinTr(professional)}`));
  }
  if (technical.length > 0) {
    sentences.push(sentence(`İşlerimde ${joinTr(technical)} araçlarını kullanıyorum`));
  }
  if (education) {
    sentences.push(sentence(`Eğitim: ${education}`));
  }
  if (languages.length > 0) {
    sentences.push(sentence(`Yabancı dilim ${joinTr(languages)}`));
  }

  const prefBits = [workplace, workType].filter(Boolean);
  if (place || prefBits.length > 0 || availability) {
    const model = prefBits.length > 0 ? `${joinTr(prefBits)} çalışmaya açığım` : 'esnek çalışma modellerine açığım';
    const where = place ? `${place} odaklı ` : '';
    const when = availability ? `; ${availability.toLocaleLowerCase('tr-TR')} başlayabilirim` : '';
    sentences.push(sentence(`${where}${model}${when}`));
  }

  let draft = polishCareerSummary(sentences.filter(Boolean).join(' '));
  if (draft.length < 100) {
    draft = polishCareerSummary(
      `${draft} Kısa vadede net hedefleri olan bir ekipte sorumluluk alıp sürdürülebilir sonuç üretmek istiyorum.`,
    );
  }
  return draft;
}
