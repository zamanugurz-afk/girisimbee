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

function norm(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR');
}

function roleTokens(role: string): string[] {
  return norm(role)
    .split(/[\s/·,.-]+/)
    .filter((token) => token.length > 3);
}

const RELATED_ROLE_GROUPS = [
  ['resepsiyon', 'ön büro', 'host', 'hostes', 'karşılama'],
  ['satış', 'temsilci', 'danışman', 'portföy'],
  ['geliştirici', 'yazılım', 'frontend', 'backend', 'full-stack', 'devops'],
  ['hemşire', 'hasta', 'klinik', 'doktor'],
  ['öğretmen', 'eğitmen', 'akademisyen'],
];

function rolesRelated(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (norm(a) === norm(b)) return true;
  const aHay = norm(a);
  const bHay = norm(b);
  if (RELATED_ROLE_GROUPS.some((group) => group.some((token) => aHay.includes(token)) && group.some((token) => bHay.includes(token)))) {
    return true;
  }
  const aTokens = roleTokens(a);
  const bTokens = roleTokens(b);
  return aTokens.some((token) => bTokens.includes(token));
}

function roleVoice(role: string): string {
  const hay = norm(role);
  if (/resepsiyon|ön büro|host|hostes/.test(hay)) {
    return 'misafir karşılama ve ön büro süreçlerine katkı veriyorum';
  }
  if (/satış|danışman|temsilci/.test(hay)) {
    return 'müşteri kazanımı ve hedef yönetimine katkı veriyorum';
  }
  if (/geliştirici|yazılım|devops|veri|analist/.test(hay)) {
    return 'ürün ve teknik teslimata katkı veriyorum';
  }
  if (/hemşire|doktor|hasta|klinik/.test(hay)) {
    return 'hasta bakım ve klinik süreçlere katkı veriyorum';
  }
  if (/öğretmen|eğitmen/.test(hay)) {
    return 'öğrenme süreçlerine katkı veriyorum';
  }
  if (/muhasebe|kredi|banka|finans/.test(hay)) {
    return 'mali süreçlerin düzenli işlemesine katkı veriyorum';
  }
  return 'ekiplere düzenli ve ölçülebilir katkı veriyorum';
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

  const roleExperiences = experiences.filter((exp) => rolesRelated(exp.role, role));
  const otherExperiences = experiences.filter((exp) => !rolesRelated(exp.role, role));
  const roleYears = roleExperiences.length > 0
    ? estimateTotalExperienceYears(roleExperiences)
    : null;

  const roleSectors = take(
    [
      ...roleExperiences.map((exp) => exp.sector),
      ...(roleExperiences.length === 0 && input.primarySector ? [input.primarySector] : []),
    ],
    2,
  );
  const otherSectors = take(
    otherExperiences.map((exp) => exp.sector).filter((sector) => !roleSectors.includes(sector)),
    2,
  );
  const openSectors = take(
    parseSelectedList(input.preferredSectors).filter(
      (sector) => !roleSectors.includes(sector) && !otherSectors.includes(sector),
    ),
    2,
  );

  const relatedPastRoles = take(
    roleExperiences
      .map((exp) => exp.role)
      .filter((value) => value && norm(value) !== norm(role)),
    2,
  );
  const otherPastRoles = take(
    otherExperiences.map((exp) => exp.role).filter(Boolean),
    2,
  );

  const professional = take(parseSelectedList(input.professionalSkills), 3);
  const technical = take(parseSelectedList(input.technicalSkills), 3);
  const languages = parseCareerLanguages(input.languages)
    .map((entry) => {
      const name = entry.languageOther?.trim() || entry.language;
      return name && entry.level ? `${name} (${entry.level})` : name;
    })
    .filter(Boolean)
    .slice(0, 2);
  const educationLevel = (input.educationLevel ?? '').trim();
  const educationField = (input.educationField ?? '').trim();
  const place = (input.preferredCity ?? '').trim();
  const workplace = (input.workplacePreference ?? '').trim();
  const workType = (input.workType ?? '').trim();
  const availability = (input.availability ?? '').trim();

  const sentences: string[] = [];
  const years = roleYears && roleYears > 0 ? roleYears : totalYears;

  if (years != null && years > 0 && roleSectors.length > 0) {
    sentences.push(
      sentence(`${role} olarak ${joinTr(roleSectors)} alanında ${years} yıllık deneyimle ${roleVoice(role)}`),
    );
  } else if (years != null && years > 0) {
    sentences.push(sentence(`${role} olarak ${years} yıllık deneyimle ${roleVoice(role)}`));
  } else if (level) {
    sentences.push(
      sentence(
        `${role} rolünde ${level.toLocaleLowerCase('tr-TR')} profiliyle ${roleSectors[0] ? `${roleSectors[0]} alanında ` : ''}sorumluluk almaya hazırım`,
      ),
    );
  } else {
    sentences.push(sentence(`${role} pozisyonunda düzenli ve müşteri odaklı çalışmayla katkı vermek istiyorum`));
  }

  if (relatedPastRoles.length > 0) {
    sentences.push(sentence(`Aynı hatta daha önce ${joinTr(relatedPastRoles)} görevlerinde bulundum`));
  }
  if (otherPastRoles.length > 0) {
    const where = otherSectors.length > 0 ? ` ${joinTr(otherSectors)} tarafında` : '';
    sentences.push(sentence(`Bunun dışında${where} ${joinTr(otherPastRoles)} deneyimim de var`));
  }

  if (professional.length > 0) {
    sentences.push(sentence(`Öne çıkan yetkinliklerim ${joinTr(professional)}`));
  }
  if (technical.length > 0) {
    sentences.push(sentence(`İşlerimde ${joinTr(technical)} kullanıyorum`));
  }
  if (educationLevel || educationField) {
    const edu = [educationLevel, educationField].filter(Boolean).join(' — ');
    sentences.push(sentence(`Eğitim geçmişim ${edu}`));
  }
  if (languages.length > 0) {
    sentences.push(sentence(`Yabancı dilim ${joinTr(languages)}`));
  }
  if (openSectors.length > 0) {
    sentences.push(sentence(`Ayrıca ${joinTr(openSectors)} alanlarına da açığım`));
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
