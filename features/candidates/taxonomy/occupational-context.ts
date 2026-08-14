/**
 * Shared occupational context engine for İş Arıyorum, İşe Alıyorum,
 * and future listing types / candidate↔job matching.
 *
 * Builds a multi-signal context, then scores existing taxonomy catalogs.
 * Does not invent options. Does not implement matching.
 */
import { fingerprintCanonical } from '@/features/candidates/ai/career-ai-context';
import { estimateTotalExperienceYears } from '@/features/candidates/lib/career-experience-dates';
import { isRelatedCareerRole } from '@/features/candidates/lib/career-summary';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  resolvePositionBundle,
  resolveRoleFamily,
  titlesForFamily,
  type RoleFamily,
} from '@/features/candidates/taxonomy/career-position-catalog';
import {
  FAMILY_SENIORITY,
  PROMOTION_FAMILIES,
} from '@/features/candidates/taxonomy/career-preference-suggestions';
import {
  getExperienceLevelLabel,
  isManualCareerOption,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';

export type OccupationalAudience = 'seeker' | 'hire' | 'generic';

export type OccupationalCatalogKind = 'professional' | 'technical' | 'tools';

export type OccupationalExperienceSignal = {
  sector?: string | null;
  role?: string | null;
  roleOther?: string | null;
  responsibilities?: string | null;
  selectedResponsibilities?: string[] | null;
  achievements?: string | null;
  selectedAchievements?: string[] | null;
  startYear?: number | null;
  endYear?: number | null;
  isCurrent?: boolean | null;
  duration?: string | null;
};

export type OccupationalProfileInput = {
  audience?: OccupationalAudience;
  sector?: string | null;
  role?: string | null;
  roleOther?: string | null;
  experienceLevel?: string | null;
  totalExperienceYears?: number | null;
  experiences?: OccupationalExperienceSignal[] | CareerExperience[];
  professionalSkills?: string | string[] | null;
  technicalSkills?: string | string[] | null;
  tools?: string | string[] | null;
  educationField?: string | null;
  certificates?: string | string[] | null;
  requiredResponsibilities?: string | null;
};

export type OccupationalRelation =
  | 'same_family'
  | 'peer'
  | 'promotion'
  | 'adjacent'
  | 'alias';

export type OccupationalRelatedOccupation = {
  title: string;
  family: RoleFamily | null;
  relation: OccupationalRelation;
};

export type OccupationalContext = {
  audience: OccupationalAudience;
  sector: string;
  role: string;
  family: RoleFamily | null;
  level: string;
  levelSeniority: 0 | 1 | 2 | 3;
  familySeniority: 0 | 1 | 2 | 3;
  totalExperienceYears: number | null;
  experienceRoles: string[];
  experienceFamilies: RoleFamily[];
  evidenceText: string;
  existingProfessional: string[];
  existingTechnical: string[];
  existingTools: string[];
  adjacentFamilies: RoleFamily[];
  /** 0 = own bundle only, 1 = light process/lead skills, 2 = full adjacent family. */
  adjacentStrength: 0 | 1 | 2;
};

export const OCCUPATIONAL_AI_CONFIDENCE_THRESHOLD = 0.45;

const MIN_SCORE: Record<OccupationalCatalogKind, number> = {
  professional: 3,
  technical: 5,
  tools: 6,
};

const CATALOG_LIMIT: Record<OccupationalCatalogKind, number> = {
  professional: 16,
  technical: 10,
  tools: 14,
};

/** Tight occupation-family proximity — not the broader preference clusters. */
const OCCUPATION_PROXIMITY: RoleFamily[][] = [
  ['salesIndoor', 'salesField', 'salesManager', 'regionalManager'],
  ['callCenter', 'customerSuccess'],
  ['credit', 'insuranceOps', 'portfolioManager'],
  ['accounting'],
  ['software', 'techLead', 'devops', 'qa', 'data'],
  ['product', 'design'],
  ['factory', 'shiftSupervisor', 'productionLead'],
  ['logistics', 'warehouseLead', 'driver'],
  ['hr', 'hrManager'],
  ['marketing', 'brandManager', 'media', 'mediaLead'],
  ['retail', 'cashier', 'storeManager'],
  ['reception', 'host', 'housekeeping', 'hotelOps'],
  ['restaurant', 'kitchen', 'restaurantManager', 'kitchenChef'],
  ['construction', 'siteChief'],
  ['autoService', 'serviceManager'],
  ['teacher', 'schoolPrincipal'],
];

const FAMILY_SKILL_THEMES: Partial<Record<RoleFamily, readonly string[]>> = {
  factory: ['uretim'],
  shiftSupervisor: ['uretim'],
  productionLead: ['uretim'],
  salesIndoor: ['satis'],
  salesField: ['satis'],
  salesManager: ['satis'],
  regionalManager: ['satis'],
  callCenter: ['cagri'],
  customerSuccess: ['satis'],
  credit: ['finans'],
  accounting: ['muhasebe', 'finans'],
  insuranceOps: ['finans'],
  portfolioManager: ['finans'],
  branchManager: ['finans'],
  software: ['yazilim'],
  techLead: ['yazilim'],
  devops: ['yazilim'],
  qa: ['yazilim'],
  data: ['veri', 'yazilim'],
  product: ['yazilim'],
  design: ['tasarim'],
  hr: ['ik'],
  hrManager: ['ik'],
  marketing: ['pazarlama'],
  brandManager: ['pazarlama'],
  media: ['pazarlama'],
  mediaLead: ['pazarlama'],
  logistics: ['lojistik'],
  warehouseLead: ['lojistik'],
  driver: ['lojistik'],
  teacher: ['egitim'],
  schoolPrincipal: ['egitim'],
  construction: ['insaat'],
  siteChief: ['insaat'],
  legal: ['hukuk'],
  farm: ['tarim'],
  farmLead: ['tarim'],
  energy: ['enerji'],
  autoService: ['otomotiv'],
  serviceManager: ['otomotiv'],
  retail: ['perakende'],
  cashier: ['perakende'],
  storeManager: ['perakende'],
  reception: ['turizm'],
  host: ['turizm'],
  housekeeping: ['turizm'],
  hotelOps: ['turizm'],
};

const OFFICE_FAMILIES = new Set<RoleFamily>([
  'admin',
  'officeManager',
  'software',
  'techLead',
  'data',
  'product',
  'design',
  'devops',
  'qa',
  'hr',
  'hrManager',
  'credit',
  'accounting',
  'insuranceOps',
  'portfolioManager',
  'branchManager',
  'consulting',
  'marketing',
  'brandManager',
  'legal',
  'teacher',
  'schoolPrincipal',
  'public',
  'callCenter',
  'customerSuccess',
  'salesIndoor',
  'salesManager',
  'regionalManager',
  'salesField',
]);

const CRM_FAMILIES = new Set<RoleFamily>([
  'salesIndoor',
  'salesField',
  'salesManager',
  'regionalManager',
  'callCenter',
  'customerSuccess',
  'insuranceOps',
  'retail',
  'storeManager',
]);

const SQL_FAMILIES = new Set<RoleFamily>([
  'software',
  'techLead',
  'data',
  'devops',
  'qa',
  'credit',
  'accounting',
  'product',
]);

const LEADERSHIP_LABELS = new Set([
  'Liderlik',
  'Gönüllü ekip liderliği',
  'Proje sorumluluğu',
]);

const BANNED_FOR_FRONTLINE_OPS = [
  'SQL',
  'Python',
  'JavaScript',
  'TypeScript',
  'Salesforce',
  'HubSpot',
  'CRM',
  'Kredi analizi',
  'Finansal analiz',
  'Finansal raporlama',
  'Portföy yönetimi',
  'Photoshop',
  'Adobe Photoshop',
  'Google Ads',
  'Meta Ads',
];

function fold(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR');
}

const ROLE_ALIASES: Array<[RegExp, string]> = [
  [/frontend/, 'Frontend geliştirici'],
  [/backend/, 'Backend geliştirici'],
  [/full[\s-]?stack/, 'Full-stack geliştirici'],
  [/kredi analist/, 'Kredi analisti'],
  [/ik uzman|insan kaynakları uzman/, 'İnsan kaynakları uzmanı'],
];

export function resolveOccupationalRole(
  role?: string | null,
  roleOther?: string | null,
): string {
  const trimmed = (role ?? '').trim();
  const raw = !trimmed || isManualCareerOption(trimmed) ? (roleOther ?? '').trim() : trimmed;
  if (!raw) return '';
  const hay = fold(raw);
  for (const [pattern, canonical] of ROLE_ALIASES) {
    if (pattern.test(hay)) return canonical;
  }
  return raw;
}

function asList(value: string | string[] | null | undefined): string[] {
  return parseSelectedList(value);
}

function levelSeniority(experienceLevel?: string | null): 0 | 1 | 2 | 3 {
  const raw = `${experienceLevel ?? ''} ${getExperienceLevelLabel(experienceLevel)}`;
  const hay = fold(raw);
  if (/direktör|üst düzey|yönetici/.test(hay)) return 3;
  if (/senior|kıdemli/.test(hay)) return 2;
  if (/mid|orta|uzman/.test(hay)) return 1;
  return 0;
}

function peerFamilies(family: RoleFamily | null): RoleFamily[] {
  if (!family) return [];
  const group = OCCUPATION_PROXIMITY.find((row) => row.includes(family)) ?? [];
  return group.filter((item) => item !== family);
}

function promotionFamilies(family: RoleFamily | null): RoleFamily[] {
  if (!family) return [];
  const up = [...(PROMOTION_FAMILIES[family] ?? [])];
  const down = (Object.entries(PROMOTION_FAMILIES) as Array<[RoleFamily, readonly RoleFamily[]]>)
    .filter(([, targets]) => targets.includes(family))
    .map(([source]) => source);
  return Array.from(new Set([...up, ...down]));
}

function adjacentStrengthFor(input: {
  levelSeniority: 0 | 1 | 2 | 3;
  totalExperienceYears: number | null;
  evidenceText: string;
  experienceFamilies: RoleFamily[];
  family: RoleFamily | null;
  adjacentFamilies: RoleFamily[];
}): 0 | 1 | 2 {
  const years = input.totalExperienceYears ?? 0;
  const yearBand: 0 | 1 | 2 = years >= 12 ? 2 : years >= 5 ? 1 : 0;
  const levelBand: 0 | 1 | 2 = input.levelSeniority >= 2 ? 2 : input.levelSeniority >= 1 ? 1 : 0;
  const evidence = fold(input.evidenceText);
  const evidenceBand: 0 | 1 | 2 = /hat soruml|vardiya|üretim hatt|koordinasyon|planlama|ekip yönet/.test(evidence)
    ? 1
    : 0;
  const relatedPast = input.experienceFamilies.some(
    (family) => family === input.family || input.adjacentFamilies.includes(family),
  );
  const pastBand: 0 | 1 = relatedPast ? 1 : 0;
  return Math.min(2, Math.max(yearBand, levelBand, evidenceBand, pastBand)) as 0 | 1 | 2;
}

export function buildOccupationalContext(input: OccupationalProfileInput): OccupationalContext {
  const audience = input.audience ?? 'generic';
  const role = resolveOccupationalRole(input.role, input.roleOther);
  const sector = (input.sector ?? '').trim();
  const family = resolveRoleFamily(role);
  const familyLevel = family ? FAMILY_SENIORITY[family] : 0;
  const level = (input.experienceLevel ?? '').trim();
  const experiences = input.experiences ?? [];
  const experienceRoles = experiences
    .map((item) => resolveOccupationalRole(item.role, item.roleOther))
    .filter(Boolean);
  const experienceFamilies = experienceRoles
    .map((item) => resolveRoleFamily(item))
    .filter((item): item is RoleFamily => Boolean(item));
  const evidenceParts = [
    sector,
    role,
    level,
    input.educationField ?? '',
    input.requiredResponsibilities ?? '',
    ...asList(input.certificates),
    ...experiences.flatMap((item) => [
      item.sector ?? '',
      resolveOccupationalRole(item.role, item.roleOther),
      item.responsibilities ?? '',
      ...(item.selectedResponsibilities ?? []),
      item.achievements ?? '',
      ...(item.selectedAchievements ?? []),
    ]),
  ];
  const totalExperienceYears =
    input.totalExperienceYears
    ?? estimateTotalExperienceYears(experiences as CareerExperience[]);
  const adjacent = Array.from(new Set([...peerFamilies(family), ...promotionFamilies(family)]));
  const adjacentStrength = adjacentStrengthFor({
    levelSeniority: levelSeniority(level),
    totalExperienceYears,
    evidenceText: evidenceParts.join(' '),
    experienceFamilies,
    family,
    adjacentFamilies: adjacent,
  });

  return {
    audience,
    sector,
    role,
    family,
    level,
    levelSeniority: levelSeniority(level),
    familySeniority: familyLevel,
    totalExperienceYears,
    experienceRoles,
    experienceFamilies,
    evidenceText: fold(evidenceParts.join(' ')),
    existingProfessional: asList(input.professionalSkills),
    existingTechnical: asList(input.technicalSkills),
    existingTools: asList(input.tools),
    adjacentFamilies: adjacent,
    adjacentStrength,
  };
}

export function occupationalSkillThemes(context: OccupationalContext): string[] {
  if (context.family && FAMILY_SKILL_THEMES[context.family]) {
    return [...(FAMILY_SKILL_THEMES[context.family] ?? [])];
  }
  return fallbackThemes(context.sector, context.role);
}

function fallbackThemes(sector: string, role: string): string[] {
  const hay = fold(`${sector} ${role}`);
  const keys: string[] = [];
  if (/satış|key account|ticaret|saha satış/.test(hay)) keys.push('satis');
  if (/çağrı|müşteri temsil|destek uzman/.test(hay)) keys.push('cagri');
  if (/sağlık|hemşire|doktor|klinik|hasta|medikal|eczane/.test(hay)) keys.push('saglik');
  if (/finans|banka|kredi|mali/.test(hay)) keys.push('finans');
  if (/muhasebe/.test(hay)) keys.push('muhasebe');
  if (/sigorta|poliçe|hasar|broker/.test(hay)) keys.push('finans');
  if (/yazılım|bilişim|geliştirici|devops|frontend|backend|full-stack|qa/.test(hay)) keys.push('yazilim');
  if (/veri|yapay zeka|\bml\b|data/.test(hay)) keys.push('veri', 'yazilim');
  if (/lojistik|depo|sevkiyat|forklift|kurye/.test(hay)) keys.push('lojistik');
  if (/eğitim|öğretmen|akademisyen|eğitmen/.test(hay)) keys.push('egitim');
  if (/insan kaynak|işe alım|\bik\b|hr/.test(hay)) keys.push('ik');
  if (/pazarlama|reklam|sosyal medya|marka|seo/.test(hay)) keys.push('pazarlama');
  if (/üretim|sanayi|fabrika|makine operatör/.test(hay)) keys.push('uretim');
  return Array.from(new Set(keys));
}

export function occupationalConfidence(context: OccupationalContext): number {
  let score = 0.12;
  if (context.role) score += 0.18;
  if (context.family) score += 0.32;
  if (context.sector) score += 0.12;
  if (context.level) score += 0.08;
  if ((context.totalExperienceYears ?? 0) > 0 || context.experienceRoles.length > 0) score += 0.1;
  if (context.adjacentStrength > 0) score += 0.04;
  return Math.min(0.98, Number(score.toFixed(2)));
}

export function shouldUseOccupationalAi(confidence: number, context: OccupationalContext): boolean {
  if (confidence >= OCCUPATIONAL_AI_CONFIDENCE_THRESHOLD) return false;
  if (context.family) return false;
  return Boolean(context.role || context.sector);
}

export function occupationalFingerprint(context: OccupationalContext): string {
  return fingerprintCanonical({
    engine: 'occupational-v1',
    audience: context.audience,
    sector: context.sector,
    role: context.role,
    family: context.family,
    level: context.level,
    years: context.totalExperienceYears,
    experienceRoles: [...context.experienceRoles].sort(),
    evidence: context.evidenceText.slice(0, 280),
  });
}

function optionAllowed(value: string, context: OccupationalContext, kind: OccupationalCatalogKind): boolean {
  if (context.existingProfessional.includes(value) || context.existingTechnical.includes(value) || context.existingTools.includes(value)) {
    return true;
  }
  if (context.family && (context.familySeniority === 0 || context.family === 'factory') && BANNED_FOR_FRONTLINE_OPS.includes(value)) {
    if (kind === 'professional' && (context.family === 'factory' || context.familySeniority === 0)) {
      return false;
    }
    if (kind !== 'professional') return false;
  }
  if (value === 'CRM' || value === 'Salesforce' || value === 'HubSpot') {
    return context.family ? CRM_FAMILIES.has(context.family) : /satış|çağrı|sigorta/.test(fold(`${context.sector} ${context.role}`));
  }
  if (value === 'SQL' || value === 'PostgreSQL' || value === 'Python') {
    return context.family ? SQL_FAMILIES.has(context.family) : /yazılım|veri|analist|muhasebe|kredi/.test(fold(`${context.sector} ${context.role}`));
  }
  return true;
}

function scoreOption(
  value: string,
  context: OccupationalContext,
  kind: OccupationalCatalogKind,
  source: 'bundle' | 'adjacent' | 'theme' | 'office' | 'existing',
): number {
  let score = 0;
  if (source === 'bundle') score += 10;
  if (source === 'adjacent') score += context.adjacentStrength >= 2 ? 6 : context.adjacentStrength === 1 ? 4 : 2;
  if (source === 'theme') score += kind === 'tools' ? 8 : 4;
  if (source === 'office') score += context.family && OFFICE_FAMILIES.has(context.family) ? 4 : 1;
  if (source === 'existing') score += 8;
  if (context.existingProfessional.includes(value) || context.existingTechnical.includes(value) || context.existingTools.includes(value)) {
    score += 3;
  }
  if (context.evidenceText.includes(fold(value))) score += 2;
  if (LEADERSHIP_LABELS.has(value)) {
    if (context.family && context.familySeniority === 0) return 1;
    if (context.familySeniority >= 2 || context.levelSeniority >= 2) score += 5;
  }
  if (kind === 'tools' && (value === 'SAP' || value === 'SAP PP' || value === 'MS Project' || value === 'AutoCAD' || value === 'SolidWorks' || value === 'Power BI')) {
    score += context.adjacentStrength >= 2 || context.levelSeniority >= 2 ? 2 : -4;
  }
  if (kind === 'tools' && value === 'Excel') score += 3;
  return score;
}

export function rankOccupationalOptions(
  items: Array<{ value: string; source: 'bundle' | 'adjacent' | 'theme' | 'office' | 'existing' }>,
  context: OccupationalContext,
  kind: OccupationalCatalogKind,
): string[] {
  const scores = new Map<string, number>();
  for (const item of items) {
    const value = item.value.trim();
    if (!value || isManualCareerOption(value)) continue;
    if (!optionAllowed(value, context, kind)) continue;
    const next = scoreOption(value, context, kind, item.source);
    scores.set(value, Math.max(scores.get(value) ?? 0, next));
  }
  const min = MIN_SCORE[kind];
  const ranked = [...scores.entries()]
    .filter(([, score]) => score >= min)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))
    .map(([value]) => value);
  return ranked.slice(0, CATALOG_LIMIT[kind]);
}

export function relatedOccupationsFor(context: OccupationalContext): OccupationalRelatedOccupation[] {
  if (!context.role && !context.family) return [];
  const out: OccupationalRelatedOccupation[] = [];
  const seen = new Set<string>();

  function add(title: string, family: RoleFamily | null, relation: OccupationalRelation) {
    const key = fold(title);
    if (!key || key === fold(context.role) || seen.has(key)) return;
    seen.add(key);
    out.push({ title, family, relation });
  }

  if (context.family) {
    for (const title of titlesForFamily(context.family)) {
      add(title, context.family, 'same_family');
    }
    for (const family of peerFamilies(context.family)) {
      for (const title of titlesForFamily(family).slice(0, 4)) {
        add(title, family, 'peer');
      }
    }
    for (const family of promotionFamilies(context.family)) {
      for (const title of titlesForFamily(family).slice(0, 3)) {
        add(title, family, 'promotion');
      }
    }
  }

  for (const role of context.experienceRoles) {
    if (isRelatedCareerRole(role, context.role)) {
      add(role, resolveRoleFamily(role), 'adjacent');
    }
  }

  return out.slice(0, 12);
}

export function familiesAreOccupationallyRelated(a: string, b: string): boolean {
  const familyA = resolveRoleFamily(a);
  const familyB = resolveRoleFamily(b);
  if (familyA && familyB) {
    if (familyA === familyB) return true;
    const group = OCCUPATION_PROXIMITY.find((row) => row.includes(familyA));
    if (group?.includes(familyB)) return true;
    if ((PROMOTION_FAMILIES[familyA] ?? []).includes(familyB)) return true;
    if ((PROMOTION_FAMILIES[familyB] ?? []).includes(familyA)) return true;
    return false;
  }
  return isRelatedCareerRole(a, b);
}

export function adjacentFamilyBundles(context: OccupationalContext) {
  if (context.adjacentStrength <= 0) return [];
  const years = context.totalExperienceYears ?? 0;
  const cap =
    context.levelSeniority >= 3 || years >= 12
      ? 3
      : 2;
  return context.adjacentFamilies
    .filter((family) => FAMILY_SENIORITY[family] <= cap)
    .map((family) => {
      const title = titlesForFamily(family)[0];
      return title ? resolvePositionBundle(title) : undefined;
    })
    .filter(Boolean);
}

export function familyCoreTools(family: RoleFamily | null): string[] {
  if (!family) return [];
  const core: Partial<Record<RoleFamily, readonly string[]>> = {
    software: ['Git', 'GitHub', 'Jira', 'VS Code', 'Excel'],
    techLead: ['Git', 'Jira', 'Confluence', 'Excel'],
    devops: ['Git', 'Docker', 'Jira', 'Excel'],
    qa: ['Jira', 'Git', 'Excel'],
    data: ['SQL', 'Excel', 'Power BI', 'Python'],
    product: ['Jira', 'Figma', 'Excel'],
    design: ['Figma', 'Photoshop', 'Excel'],
    callCenter: ['Genesys', 'Zendesk', 'CRM', 'Excel'],
    customerSuccess: ['CRM', 'Excel'],
    salesIndoor: ['CRM', 'Excel'],
    salesField: ['CRM', 'Excel'],
    salesManager: ['CRM', 'Excel', 'Power BI'],
    regionalManager: ['CRM', 'Excel', 'Power BI'],
    factory: ['Excel'],
    shiftSupervisor: ['Excel', 'MES / üretim kaydı'],
    productionLead: ['Excel', 'MES / ERP'],
    hr: ['Excel', 'Outlook'],
    hrManager: ['Excel', 'Outlook'],
    credit: ['Excel', 'Power BI'],
    accounting: ['Excel', 'Logo Tiger'],
    insuranceOps: ['CRM', 'Excel'],
  };
  return [...(core[family] ?? [])];
}

export function officeToolSeeds(context: OccupationalContext): string[] {
  if (context.family && !OFFICE_FAMILIES.has(context.family) && context.familySeniority === 0) {
    return ['Excel'];
  }
  return ['Excel', 'Word', 'Outlook', 'Microsoft Teams'];
}
