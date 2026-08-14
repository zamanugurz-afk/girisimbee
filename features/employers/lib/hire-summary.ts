import { polishCareerSummary } from '@/features/candidates/lib/career-summary';
import { getExperienceLevelLabel, parseCareerLanguages, parseSelectedList } from '@/features/candidates/taxonomy/career-taxonomy';

export type HiringSummaryInput = {
  desiredRole?: string | null;
  experienceLevel?: string | null;
  primarySector?: string | null;
  workType?: string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  languages?: string | null;
  preferredCity?: string | null;
  workplacePreference?: string | null;
  availability?: string | null;
  salaryRange?: string | null;
  requiredResponsibilities?: string | null;
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

/** Editable Turkish job-posting draft from hire form fields. No contact or company name. */
export function buildHiringSummaryDraft(input: HiringSummaryInput): string {
  const role = (input.desiredRole ?? '').trim() || 'bu pozisyon';
  const level = getExperienceLevelLabel(input.experienceLevel) || (input.experienceLevel ?? '').trim();
  const sector = (input.primarySector ?? '').trim();
  const professional = take(parseSelectedList(input.professionalSkills), 4);
  const technical = take(parseSelectedList(input.technicalSkills), 3);
  const duties = take(parseSelectedList(input.requiredResponsibilities), 3);
  const languages = parseCareerLanguages(input.languages)
    .map((entry) => {
      const name = entry.languageOther?.trim() || entry.language;
      return name && entry.level ? `${name} (${entry.level})` : name;
    })
    .filter(Boolean)
    .slice(0, 2);
  const education = [input.educationLevel, input.educationField].filter(Boolean).join(' — ');
  const place = (input.preferredCity ?? '').trim();
  const workplace = (input.workplacePreference ?? '').trim();
  const workType = (input.workType ?? '').trim();
  const availability = (input.availability ?? '').trim();
  const salary = (input.salaryRange ?? '').trim();

  const sentences: string[] = [];
  const where = sector ? `${sector} alanında ` : '';
  const levelBit = level ? `${level.toLocaleLowerCase('tr-TR')} ` : '';
  sentences.push(sentence(`${where}${levelBit}${role} arıyoruz`));

  if (duties.length > 0) {
    sentences.push(sentence(`Rolde ${joinTr(duties)} sorumlulukları bekleniyor`));
  }
  if (professional.length > 0) {
    sentences.push(sentence(`Aranan yetkinlikler ${joinTr(professional)}`));
  }
  if (technical.length > 0) {
    sentences.push(sentence(`Çalışmada ${joinTr(technical)} kullanılır`));
  }
  if (education) {
    sentences.push(sentence(`Eğitim beklentisi ${education}`));
  }
  if (languages.length > 0) {
    sentences.push(sentence(`Dil beklentisi ${joinTr(languages)}`));
  }

  const offer = [workplace, workType].filter(Boolean);
  if (place || offer.length > 0 || availability || salary) {
    const model = offer.length > 0 ? `${joinTr(offer)} çalışma` : 'esnek çalışma';
    const city = place ? `${place} konumunda ` : '';
    const when = availability ? `; ${availability.toLocaleLowerCase('tr-TR')} başlama` : '';
    const pay = salary ? ` Ücret aralığı ${salary}` : '';
    sentences.push(sentence(`${city}${model} sunuluyor${when}${pay}`));
  }

  let draft = polishCareerSummary(sentences.filter(Boolean).join(' '));
  if (draft.length < 100) {
    draft = polishCareerSummary(
      `${draft} Net hedefleri olan bir ekipte sorumluluk alacak, ölçülebilir katkı üretecek bir aday arıyoruz.`,
    );
  }
  return draft;
}
