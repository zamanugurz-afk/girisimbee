import { polishCareerSummary } from '@/features/candidates/lib/career-summary';
import {
  getExperienceLevelLabel,
  isManualCareerOption,
  parseCareerLanguages,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';

export type HiringSummaryInput = {
  companyName?: string | null;
  desiredRole?: string | null;
  experienceLevel?: string | null;
  primarySector?: string | null;
  workType?: string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  tools?: string | null;
  toolsOther?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  languages?: string | null;
  preferredCity?: string | null;
  preferredDistrict?: string | null;
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

function selectedList(value: string | null | undefined, extra?: string | null, limit = 4): string[] {
  const list = parseSelectedList(value).filter((item) => !isManualCareerOption(item));
  const other = (extra ?? '').trim();
  if (other) list.push(other);
  return take(list, limit);
}

function sentence(text: string): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function humanizeSlash(value: string): string {
  return value.replace(/\s*\/\s*/g, ' ve ').replace(/\s+/g, ' ').trim();
}

function displayRole(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const left = trimmed.split(/\s*\/\s*/)[0]?.trim();
  return left || trimmed;
}

function lcFirst(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toLocaleLowerCase('tr-TR') + trimmed.slice(1);
}

function capitalizeTr(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1);
}

/** Editable Turkish job-posting draft. Reads as a short ad, not a field dump. */
export function buildHiringSummaryDraft(input: HiringSummaryInput): string {
  const role = displayRole((input.desiredRole ?? '').trim()) || 'bu pozisyon';
  const levelRaw = getExperienceLevelLabel(input.experienceLevel) || (input.experienceLevel ?? '').trim();
  const level = levelRaw ? levelRaw.toLocaleLowerCase('tr-TR') : '';
  const sector = humanizeSlash((input.primarySector ?? '').trim()).toLocaleLowerCase('tr-TR');
  const professional = selectedList(input.professionalSkills, null, 4).map(lcFirst);
  const technical = selectedList(input.technicalSkills, null, 3);
  const tools = selectedList(input.tools, input.toolsOther, 4);
  const duties = selectedList(input.requiredResponsibilities, null, 3).map(lcFirst);
  const languages = parseCareerLanguages(input.languages)
    .map((entry) => {
      const name = entry.languageOther?.trim() || entry.language;
      return name && entry.level ? `${name} (${entry.level.toLocaleLowerCase('tr-TR')})` : name;
    })
    .filter(Boolean)
    .slice(0, 2);
  const educationLevel = (input.educationLevel ?? '').trim();
  const educationField = (input.educationField ?? '').trim();
  const city = (input.preferredCity ?? '').trim();
  const district = (input.preferredDistrict ?? '').trim();
  const place = [city, district && district !== 'Diğer' ? district : '']
    .filter(Boolean)
    .join(', ');
  const workplace = lcFirst((input.workplacePreference ?? '').trim());
  const workType = lcFirst((input.workType ?? '').trim());
  const availability = (input.availability ?? '').trim();
  const salary = (input.salaryRange ?? '').trim();

  const sentences: string[] = [];
  const company = (input.companyName ?? '').trim();
  const where = sector ? `${sector} sektöründe ` : '';
  const levelBit = level ? `${level} ` : '';
  const prefix = company ? `${company} bünyesinde, ` : 'Şirketimiz bünyesinde, ';
  sentences.push(sentence(capitalizeTr(`${prefix}${where}${levelBit}${role} pozisyonunda görevlendirilmek üzere çalışma arkadaşı arıyoruz`)));

  if (duties.length > 0) {
    sentences.push(sentence(`Pozisyon kapsamında ${joinTr(duties)} gibi temel sorumluluklar yürütülecektir`));
  }
  if (professional.length > 0) {
    sentences.push(sentence(`Aranan nitelikler arasında ${joinTr(professional)} konularında yetkinlik ve tecrübe öne çıkmaktadır`));
  }

  const stack = take([...tools, ...technical], 5);
  if (stack.length > 0) {
    sentences.push(sentence(`İş süreçlerinde ${joinTr(stack)} araç ve teknolojileri aktif olarak kullanılmaktadır`));
  }

  if (educationLevel && educationField) {
    sentences.push(sentence(`Adayların ${educationLevel} mezuniyeti (${educationField}) ve ilgili alanlarda bilgi sahibi olması tercih edilir`));
  } else if (educationLevel) {
    sentences.push(sentence(`Adayların ${educationLevel} mezuniyeti tercih edilir`));
  } else if (educationField) {
    sentences.push(sentence(`${educationField} alanında eğitim veya deneyim tercih edilir`));
  }
  if (languages.length > 0) {
    sentences.push(sentence(`İletişim ve iş takibinde ${joinTr(languages.map((item) => String(item)))} bilgisi beklenmektedir`));
  }

  const offer = [workplace, workType].filter(Boolean);
  if (place || offer.length > 0 || availability || (salary && salary !== 'Belirtmek istemiyorum')) {
    const model = offer.length > 0 ? `${joinTr(offer)} çalışma modeli` : 'çalışma modeli';
    const cityBit = place ? `${place} lokasyonunda ` : '';
    sentences.push(sentence(`${cityBit}${model} sunulmaktadır`));
    if (availability) {
      sentences.push(sentence(`Adayın ${availability.toLocaleLowerCase('tr-TR')} göreve başlaması hedeflenmektedir`));
    }
    if (salary && salary !== 'Belirtmek istemiyorum') {
      sentences.push(sentence(`Pozisyon için öngörülen ücret aralığı ${salary} seviyesindedir`));
    }
  }

  let draft = polishCareerSummary(sentences.filter(Boolean).join(' '));
  if (draft.length < 100) {
    draft = polishCareerSummary(
      `${draft} Dinamik bir çalışma ortamında sorumluluk alacak ve kurumsal hedeflerimize değer katacak takım arkadaşımızı aramızda görmekten memnuniyet duyarız.`,
    );
  }
  return draft;
}
