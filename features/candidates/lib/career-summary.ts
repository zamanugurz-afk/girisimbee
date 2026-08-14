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
  const capped = trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1);
  return /[.!?…]$/.test(capped) ? capped : `${capped}.`;
}

function lcFirst(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toLocaleLowerCase('tr-TR') + trimmed.slice(1);
}

function joinAsClause(parts: string[]): string {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!;
  return joinTr([parts[0]!, ...parts.slice(1).map(lcFirst)]);
}

/** Spoken locative for city / region labels: Adıyaman'da, İstanbul Anadolu Yakası'nda. */
function placeLocative(place: string): string {
  const trimmed = place.trim();
  if (!trimmed) return '';
  if (/(?:'|’)n?[dt][aeAE]$/.test(trimmed)) return trimmed;
  if (/yakas[ıi]$/i.test(trimmed)) return `${trimmed}'nda`;

  const chars = [...trimmed];
  const last = chars[chars.length - 1]!.toLocaleLowerCase('tr-TR');
  let lastVowel = '';
  for (let i = chars.length - 1; i >= 0; i -= 1) {
    const ch = chars[i]!.toLocaleLowerCase('tr-TR');
    if ('aeıioöuü'.includes(ch)) {
      lastVowel = ch;
      break;
    }
  }
  const front = 'eiöü'.includes(lastVowel);
  const voiceless = 'pçtksşfh'.includes(last);
  return `${trimmed}'${voiceless ? 't' : 'd'}${front ? 'e' : 'a'}`;
}

/** İngilizce → İngilizcem, Almanca → Almancam */
function languageSubject(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const last = trimmed.slice(-1).toLocaleLowerCase('tr-TR');
  if ('aeıioöuü'.includes(last)) return `${trimmed}m`;
  return `${trimmed}im`;
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

export function isRelatedCareerRole(a: string, b: string): boolean {
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

  const roleExperiences = experiences.filter((exp) => isRelatedCareerRole(exp.role, role));
  const otherExperiences = experiences.filter((exp) => !isRelatedCareerRole(exp.role, role));
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
  const educationLevel = (input.educationLevel ?? '').trim();
  const educationField = (input.educationField ?? '').trim();
  const place = (input.preferredCity ?? '').trim();
  const workplace = (input.workplacePreference ?? '').trim();
  const workType = (input.workType ?? '').trim();
  const availability = (input.availability ?? '').trim();

  const sentences: string[] = [];
  const years = roleYears && roleYears > 0 ? roleYears : totalYears;
  const levelLc = level ? level.toLocaleLowerCase('tr-TR') : '';
  const sectorLead = roleSectors[0] ?? '';
  const sectorClause = sectorLead ? ` ${sectorLead} sektöründe` : '';

  if (years != null && years > 0) {
    sentences.push(sentence(`${role} olarak${sectorClause} ${years} yıldır çalışıyorum`));
  } else if (levelLc) {
    sentences.push(sentence(`${levelLc} ${role} olarak${sectorClause} işe başlamak istiyorum`));
  } else {
    sentences.push(sentence(`${role} olarak${sectorClause} çalışmak istiyorum`));
  }

  if (relatedPastRoles.length > 0) {
    sentences.push(sentence(`Daha önce ${joinTr(relatedPastRoles)} olarak da çalıştım`));
  }
  if (otherPastRoles.length > 0) {
    sentences.push(sentence(`Ayrıca ${joinTr(otherPastRoles)} olarak da çalıştım`));
  }

  if (professional.length > 0) {
    sentences.push(sentence(`${joinAsClause(professional)} işlerinde yetkinim`));
  }
  if (technical.length > 0) {
    sentences.push(sentence(`${joinAsClause(technical)} kullanıyorum`));
  }
  const educationLevelLc = educationLevel.toLocaleLowerCase('tr-TR');
  if (educationLevel && educationField) {
    sentences.push(sentence(`${educationField} alanında ${educationLevelLc} mezunuyum`));
  } else if (educationLevel) {
    sentences.push(sentence(`${educationLevelLc} mezunuyum`));
  } else if (educationField) {
    sentences.push(sentence(`${educationField} eğitimi aldım`));
  }
  const languageEntries = parseCareerLanguages(input.languages)
    .map((entry) => {
      const name = (entry.languageOther?.trim() || entry.language).trim();
      if (!name) return null;
      return { name, level: entry.level ? entry.level.toLocaleLowerCase('tr-TR') : '' };
    })
    .filter((entry): entry is { name: string; level: string } => Boolean(entry))
    .slice(0, 2);
  if (languageEntries.length === 1) {
    const only = languageEntries[0]!;
    sentences.push(
      sentence(
        only.level
          ? `${languageSubject(only.name)} ${only.level} seviyede`
          : `${only.name} biliyorum`,
      ),
    );
  } else if (languageEntries.length > 1) {
    const bits = languageEntries.map((entry, index) => {
      const subject = languageSubject(entry.name);
      const phrase = entry.level ? `${subject} ${entry.level} seviyede` : `${entry.name} biliyorum`;
      return index === 0 ? phrase : lcFirst(phrase);
    });
    sentences.push(sentence(joinTr(bits)));
  }
  if (openSectors.length > 0) {
    sentences.push(sentence(`${joinAsClause(openSectors)} sektörlerinde de çalışabilirim`));
  }

  const prefBits = [workplace, workType].filter(Boolean);
  if (place && prefBits.length > 0) {
    sentences.push(
      sentence(`${placeLocative(place)} ${joinTr(prefBits.map(lcFirst))} çalışabilirim`),
    );
  } else if (place) {
    sentences.push(sentence(`${placeLocative(place)} çalışabilirim`));
  } else if (prefBits.length > 0) {
    sentences.push(sentence(`${joinAsClause(prefBits)} çalışabilirim`));
  }
  if (availability) {
    const availLc = availability.toLocaleLowerCase('tr-TR');
    sentences.push(
      sentence(/başla/.test(availLc) ? availLc : `${availLc} işe başlayabilirim`),
    );
  }

  let draft = polishCareerSummary(sentences.filter(Boolean).join(' '));
  if (draft.length < 100) {
    draft = polishCareerSummary(
      `${draft} Kısa vadede net hedefleri olan bir ekipte sorumluluk alıp sürdürülebilir sonuç üretmek istiyorum.`,
    );
  }
  return draft;
}
