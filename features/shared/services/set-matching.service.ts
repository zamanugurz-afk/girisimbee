/**
 * Central Set Matching & Manual Input Engine for GirişimBee.
 * Provides Turkish-normalized search, ranking (exact, prefix, word-start, substring),
 * catalog registry lookups, duplicate elimination, and canonical formatting.
 */

import {
  JOB_POSITION_OPTIONS,
  JOB_SECTOR_OPTIONS,
  INVESTOR_SECTOR_OPTIONS,
  USE_OF_FUNDS_OPTIONS,
  BUSINESS_MODEL_OPTIONS,
  PARTNER_EXPERTISE_OPTIONS,
  ALL_PARTNERSHIP_TYPES,
  CANONICAL_PARTNER_EXPERTISE_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import {
  CAREER_LANGUAGE_OPTIONS,
  CERTIFICATE_OPTIONS,
  EDUCATION_FIELD_OPTIONS,
  getAllTaxonomyCertificates,
  getAllTaxonomyPositions,
  getAllTaxonomySkills,
  getPositionsForSector,
  isManualCareerOption,
  MANUAL_OPTION,
  MANUAL_OPTION_SHORT,
  suggestCertificates,
  suggestProfessionalSkills,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';

export type SetDomain =
  | 'positions'
  | 'sectors'
  | 'investor-sectors'
  | 'skills'
  | 'technical-skills'
  | 'professional-skills'
  | 'tools'
  | 'certificates'
  | 'languages'
  | 'education-fields'
  | 'partner-expertise'
  | 'partnership-types'
  | 'use-of-funds'
  | 'business-models';

export interface SetCatalogContext {
  sector?: string | null;
  role?: string | null;
  experienceLevel?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
}

export type MatchQuality = 'exact' | 'prefix' | 'word-start' | 'substring' | 'token';

export interface ScoredMatch<T = string> {
  item: T;
  value: string;
  score: number;
  matchQuality: MatchQuality;
}

export interface SearchTaxonomyOptions<T = string> {
  limit?: number;
  excludeValues?: string[];
  getValue?: (item: T) => string;
}

export const POPULAR_SYSTEM_TOOLS = [
  'Excel',
  'Word',
  'PowerPoint',
  'Outlook',
  'Google Workspace',
  'Microsoft Teams',
  'Slack',
  'Zoom',
  'Jira',
  'Figma',
  'Notion',
  'Postman',
  'Git / GitHub',
  'GitLab',
  'Docker',
  'Kubernetes',
  'Google Analytics',
  'SAP',
  'Salesforce',
  'Canva',
  'Trello',
  'VS Code',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'AWS',
  'Azure',
  'Google Cloud',
  'HubSpot',
  'Zoho',
  'Photoshop',
  'Illustrator',
  'AutoCAD',
  'SolidWorks',
  'Logo Tiger',
  'Netsis',
  'Mikro',
  'Paraşüt',
  'Zendesk',
  'Intercom',
] as const;

/**
 * Normalizes Turkish text for diacritic/case-insensitive search matching.
 * Converts:
 *  - ı, İ, I, i -> i
 *  - ş, Ş -> s
 *  - ğ, Ğ -> g
 *  - ü, Ü -> u
 *  - ö, Ö -> o
 *  - ç, Ç -> c
 *  - eliminates excessive punctuation and spaces
 */
export function normalizeTurkishSearch(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıİI]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits normalized text into searchable token roots.
 */
export function tokenizeTurkish(text: string): string[] {
  return normalizeTurkishSearch(text)
    .split(' ')
    .filter((token) => token.length > 0);
}

/**
 * Performs high-precision, scored autocomplete matching against a catalog.
 * Ranks:
 *  1. Exact Match (score 1000)
 *  2. Prefix Match (e.g. 'Bölge' -> 'Bölge Müdürü', 'Bölge Satış Müdürü') (score 800)
 *  3. Word-Boundary Match (e.g. 'Müdür' -> 'Bölge Satış Müdürü') (score 600)
 *  4. Substring Match (score 400)
 *  5. Multi-Token / Fuzzy Match (score 200)
 */
export function searchTaxonomyCatalog<T = string>(
  query: string,
  catalog: readonly T[] | T[],
  options: SearchTaxonomyOptions<T> = {},
): ScoredMatch<T>[] {
  const { limit = 20, excludeValues = [], getValue = (item: T) => String(item) } = options;

  const rawQuery = query.trim();
  const normalizedQuery = normalizeTurkishSearch(rawQuery);
  const queryTokens = tokenizeTurkish(rawQuery);

  const excludedSet = new Set(excludeValues.map((v) => normalizeTurkishSearch(v)));

  // If query is empty, return top catalog items sorted in Turkish alphabetical order up to limit
  if (!normalizedQuery) {
    const list: ScoredMatch<T>[] = [];
    const sortedCatalog = [...catalog].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return valA.localeCompare(valB, 'tr-TR');
    });
    for (const item of sortedCatalog) {
      const val = getValue(item);
      if (isManualCareerOption(val)) continue;
      if (excludedSet.has(normalizeTurkishSearch(val))) continue;
      list.push({
        item,
        value: val,
        score: 10,
        matchQuality: 'token',
      });
      if (list.length >= limit) break;
    }
    return list;
  }

  const matches: ScoredMatch<T>[] = [];

  for (const item of catalog) {
    const val = getValue(item);
    if (!val || isManualCareerOption(val)) continue;

    const normalizedVal = normalizeTurkishSearch(val);
    if (!normalizedVal) continue;

    if (excludedSet.has(normalizedVal)) continue;

    // 1. Exact Match
    if (normalizedVal === normalizedQuery) {
      matches.push({
        item,
        value: val,
        score: 1000,
        matchQuality: 'exact',
      });
      continue;
    }

    // 2. Starts with (Prefix match)
    if (normalizedVal.startsWith(normalizedQuery)) {
      const lengthPenalty = Math.min(val.length - rawQuery.length, 50);
      matches.push({
        item,
        value: val,
        score: 800 - lengthPenalty,
        matchQuality: 'prefix',
      });
      continue;
    }

    // 3. Word-Boundary Match (e.g., query matches the start of any word inside the item)
    const valTokens = tokenizeTurkish(val);
    const wordStartMatch = valTokens.some((t) => t.startsWith(normalizedQuery));
    if (wordStartMatch) {
      const index = valTokens.findIndex((t) => t.startsWith(normalizedQuery));
      const posPenalty = index * 10;
      matches.push({
        item,
        value: val,
        score: 600 - posPenalty,
        matchQuality: 'word-start',
      });
      continue;
    }

    // 4. Substring Match
    if (normalizedVal.includes(normalizedQuery)) {
      const subIndex = normalizedVal.indexOf(normalizedQuery);
      matches.push({
        item,
        value: val,
        score: 400 - Math.min(subIndex, 50),
        matchQuality: 'substring',
      });
      continue;
    }

    // 5. Multi-Token / All Tokens Present Match
    if (queryTokens.length > 1) {
      const allTokensPresent = queryTokens.every((qTok) =>
        valTokens.some((vTok) => vTok.includes(qTok)),
      );
      if (allTokensPresent) {
        matches.push({
          item,
          value: val,
          score: 250,
          matchQuality: 'token',
        });
      }
    }
  }

  // Sort descending by score, then alphabetically
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.value.localeCompare(b.value, 'tr-TR');
  });

  return matches.slice(0, limit);
}

/**
 * Central catalog resolver for GirişimBee domains.
 */
export function getCanonicalCatalog(domain: SetDomain, context?: SetCatalogContext): string[] {
  switch (domain) {
    case 'positions': {
      const contextual = context?.sector
        ? getPositionsForSector(context.sector).filter((p) => !isManualCareerOption(p))
        : [];
      const all = getAllTaxonomyPositions();
      const allPositions = (all.length > 0 ? all : Array.from(JOB_POSITION_OPTIONS)).filter(
        (p) => !isManualCareerOption(p),
      );
      const seen = new Set(contextual.map((p) => p.toLocaleLowerCase('tr-TR')));
      const rest = allPositions.filter((p) => !seen.has(p.toLocaleLowerCase('tr-TR')));
      return [...contextual, ...rest];
    }

    case 'sectors':
      return Array.from(JOB_SECTOR_OPTIONS).filter((s) => !isManualCareerOption(s));

    case 'investor-sectors':
      return Array.from(INVESTOR_SECTOR_OPTIONS).filter((s) => !isManualCareerOption(s));

    case 'skills':
    case 'professional-skills': {
      const contextual = suggestProfessionalSkills({
        sector: context?.sector ?? undefined,
        role: context?.role ?? undefined,
        experienceLevel: context?.experienceLevel ?? undefined,
      }).filter((s) => !isManualCareerOption(s));
      const allSkills = getAllTaxonomySkills('professional');
      const seen = new Set(contextual.map((s) => s.toLocaleLowerCase('tr-TR')));
      const rest = allSkills.filter((s) => !seen.has(s.toLocaleLowerCase('tr-TR')));
      return [...contextual, ...rest];
    }

    case 'technical-skills': {
      const contextual = suggestTechnicalSkills({
        sector: context?.sector ?? undefined,
        role: context?.role ?? undefined,
      }).filter((s) => !isManualCareerOption(s));
      const allSkills = getAllTaxonomySkills('technical');
      const seen = new Set(contextual.map((s) => s.toLocaleLowerCase('tr-TR')));
      const rest = allSkills.filter((s) => !seen.has(s.toLocaleLowerCase('tr-TR')));
      return [...contextual, ...rest];
    }

    case 'tools':
      return Array.from(POPULAR_SYSTEM_TOOLS);

    case 'certificates': {
      const contextual = suggestCertificates({
        sector: context?.sector ?? undefined,
        role: context?.role ?? undefined,
        experienceLevel: context?.experienceLevel ?? undefined,
        educationLevel: context?.educationLevel ?? undefined,
        educationField: context?.educationField ?? undefined,
      }).filter((c) => !isManualCareerOption(c));
      const allCerts = getAllTaxonomyCertificates();
      const seen = new Set(contextual.map((c) => c.toLocaleLowerCase('tr-TR')));
      const rest = allCerts.filter((c) => !seen.has(c.toLocaleLowerCase('tr-TR')));
      return [...contextual, ...rest];
    }

    case 'languages':
      return Array.from(CAREER_LANGUAGE_OPTIONS).filter((l) => !isManualCareerOption(l));

    case 'education-fields':
      return Array.from(EDUCATION_FIELD_OPTIONS).filter((e) => !isManualCareerOption(e));

    case 'partner-expertise':
      return Array.from(CANONICAL_PARTNER_EXPERTISE_OPTIONS).filter((p) => !isManualCareerOption(p));

    case 'partnership-types':
      return Array.from(ALL_PARTNERSHIP_TYPES).filter((p) => !isManualCareerOption(p));

    case 'use-of-funds':
      return Array.from(USE_OF_FUNDS_OPTIONS).filter((u) => !isManualCareerOption(u));

    case 'business-models':
      return Array.from(BUSINESS_MODEL_OPTIONS).filter((b) => !isManualCareerOption(b));

    default:
      return [];
  }
}

/**
 * Formats user-entered custom values with title case and clean spacing.
 */
export function formatCanonicalCustomValue(val: string): string {
  const trimmed = val.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  return suggestTitleCaseTr(trimmed);
}
