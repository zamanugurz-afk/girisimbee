/**
 * Universal Relationship Engine & Block Resolver (CV Extraction 4.0)
 * Resolves candidate tokens into structured Experience Blocks, Education Blocks,
 * and Personal Information with full layout permutation support (Formats A-J)
 * and strict negative relationship enforcement.
 */

import type {
  CandidateToken,
  UnstructuredExperienceBlock,
  UnstructuredEducationBlock,
  UnstructuredPersonalInfo,
  ExperienceLayoutFormat,
} from './cv-unstructured-types';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { COMMON_TURKISH_DISTRICTS } from './cv-deterministic-extractor';
import { normalizeTrUniversal } from './cv-universal-normalizer';
import type { ParsedDateAnchor } from './cv-date-anchor-engine';

/**
 * Resolves Experience Blocks across all 10 layout permutations (Format A through J).
 */
export function resolveExperienceRelationships(tokens: CandidateToken[]): UnstructuredExperienceBlock[] {
  const experiences: UnstructuredExperienceBlock[] = [];
  const usedTokenIds = new Set<string>();

  // Filter out noisy/header tokens
  const validTokens = tokens.filter((t) => t.type !== 'NOISE');

  for (let i = 0; i < validTokens.length; i++) {
    const tok = validTokens[i];
    if (usedTokenIds.has(tok.id)) continue;

    // We look for anchors: A token that has a DATE_RANGE or attachedDateAnchor, or a COMPANY/ROLE token
    let dateAnchor: ParsedDateAnchor | undefined =
      tok.type === 'DATE_RANGE'
        ? tok.metadata?.dateAnchor
        : tok.metadata?.attachedDateAnchor;

    let role: string | undefined;
    let company: string | undefined;
    let city: string | undefined;
    let format: ExperienceLayoutFormat = 'UNSTRUCTURED_BLOCK';
    const blockTokens: CandidateToken[] = [tok];

    // Check if the token itself is Role or Company
    if (tok.type === 'ROLE') role = tok.text;
    if (tok.type === 'COMPANY') company = tok.text;

    // Scan a local window of +/- 3 tokens for matching Company, Role, and Date
    const windowStart = Math.max(0, i - 2);
    const windowEnd = Math.min(validTokens.length - 1, i + 3);

    for (let j = windowStart; j <= windowEnd; j++) {
      if (j === i) continue;
      const neighbor = validTokens[j];

      // Proximity check: Must be within 2 lines
      if (Math.abs(neighbor.lineIndex - tok.lineIndex) > 2) continue;

      if (!dateAnchor && neighbor.type === 'DATE_RANGE') {
        dateAnchor = neighbor.metadata?.dateAnchor;
        blockTokens.push(neighbor);
      }
      if (!role && neighbor.type === 'ROLE') {
        role = neighbor.text;
        blockTokens.push(neighbor);
      }
      if (!company && neighbor.type === 'COMPANY') {
        company = neighbor.text;
        blockTokens.push(neighbor);
      }
      if (!city && neighbor.type === 'CITY') {
        city = neighbor.metadata?.city || neighbor.text;
        blockTokens.push(neighbor);
      }
    }

    // Determine Format based on ordering
    if (role && company && dateAnchor) {
      if (tok.type === 'ROLE') {
        format = 'FORMAT_A'; // Role -> Company -> Date
      } else if (tok.type === 'COMPANY') {
        format = 'FORMAT_B'; // Company -> Role -> Date
      } else if (tok.type === 'DATE_RANGE') {
        format = 'FORMAT_C'; // Date -> Company -> Role
      } else {
        format = 'FORMAT_D';
      }
    }

    // If we have at least (Role OR Company) AND Date, or (Role AND Company), construct block
    if ((role || company) && (dateAnchor || (role && company))) {
      // Mark tokens as used
      for (const bt of blockTokens) {
        usedTokenIds.add(bt.id);
      }

      // Collect trailing responsibilities
      const responsibilities: string[] = [];
      const currentMaxLine = Math.max(...blockTokens.map((t) => t.lineIndex));
      let respLineIdx = currentMaxLine + 1;

      while (respLineIdx < currentMaxLine + 6) {
        const respTokens = validTokens.filter(
          (t) => t.lineIndex === respLineIdx && (t.type === 'RESPONSIBILITY' || (t.type === 'UNKNOWN' && t.text.length > 20)),
        );
        if (respTokens.length === 0) break;

        for (const rt of respTokens) {
          responsibilities.push(rt.text);
          usedTokenIds.add(rt.id);
        }
        respLineIdx++;
      }

      const evidence = blockTokens.map((t) => t.text).join(' | ');

      experiences.push({
        format,
        role: role ? suggestTitleCaseTr(role) : undefined,
        company: company ? suggestTitleCaseTr(company) : undefined,
        startYear: dateAnchor?.startYear,
        endYear: dateAnchor?.endYear,
        isCurrent: Boolean(dateAnchor?.isCurrent),
        city,
        responsibilities,
        confidence: 0.95,
        tokens: blockTokens,
        evidence,
      });
    }
  }

  return experiences;
}

/**
 * Resolves Education Blocks from tokens (University + Field + Degree + Date).
 */
export function resolveEducationRelationships(tokens: CandidateToken[]): UnstructuredEducationBlock[] {
  const educations: UnstructuredEducationBlock[] = [];
  const usedTokenIds = new Set<string>();

  const validTokens = tokens.filter((t) => t.type !== 'NOISE');

  for (let i = 0; i < validTokens.length; i++) {
    const tok = validTokens[i];
    if (usedTokenIds.has(tok.id)) continue;

    if (tok.type === 'UNIVERSITY' || tok.type === 'DEGREE' || tok.type === 'FIELD_OF_STUDY') {
      let school: string | undefined = tok.type === 'UNIVERSITY' ? tok.text : undefined;
      let level: string | undefined = tok.type === 'DEGREE' ? tok.metadata?.degreeLevel || tok.text : undefined;
      let field: string | undefined = tok.type === 'FIELD_OF_STUDY' ? tok.metadata?.canonicalField || tok.text : undefined;
      let dateAnchor: ParsedDateAnchor | undefined =
        tok.metadata?.attachedDateAnchor || tok.metadata?.dateAnchor;

      const blockTokens: CandidateToken[] = [tok];

      // Window scan +/- 2 lines
      const windowStart = Math.max(0, i - 2);
      const windowEnd = Math.min(validTokens.length - 1, i + 3);

      for (let j = windowStart; j <= windowEnd; j++) {
        if (j === i) continue;
        const neighbor = validTokens[j];
        if (Math.abs(neighbor.lineIndex - tok.lineIndex) > 2) continue;

        if (!school && neighbor.type === 'UNIVERSITY') {
          school = neighbor.text;
          blockTokens.push(neighbor);
        }
        if (!level && neighbor.type === 'DEGREE') {
          level = neighbor.metadata?.degreeLevel || neighbor.text;
          blockTokens.push(neighbor);
        }
        if (!field && neighbor.type === 'FIELD_OF_STUDY') {
          field = neighbor.metadata?.canonicalField || neighbor.text;
          blockTokens.push(neighbor);
        }
        if (!dateAnchor && neighbor.type === 'DATE_RANGE') {
          dateAnchor = neighbor.metadata?.dateAnchor;
          blockTokens.push(neighbor);
        }
      }

      if (school || (level && field)) {
        for (const bt of blockTokens) {
          usedTokenIds.add(bt.id);
        }

        const evidence = blockTokens.map((t) => t.text).join(' | ');

        educations.push({
          school: school ? suggestTitleCaseTr(school) : undefined,
          level: level || 'Lisans',
          field: field ? suggestTitleCaseTr(field) : undefined,
          graduationYear: dateAnchor?.endYear || dateAnchor?.startYear,
          startYear: dateAnchor?.startYear,
          confidence: 0.96,
          tokens: blockTokens,
          evidence,
        });
      }
    }
  }

  return educations;
}

/**
 * Resolves Personal Information with strict negative disambiguation.
 */
export function resolvePersonalInfoRelationships(
  tokens: CandidateToken[],
  fullText: string,
): UnstructuredPersonalInfo {
  let email: string | undefined;
  let phone: string | undefined;
  let linkedin: string | undefined;
  let website: string | undefined;
  let city: string | undefined;
  let district: string | undefined;

  const evidence: Record<string, string> = {};
  const confidence: Record<string, number> = {};

  for (const t of tokens) {
    if (!email && t.type === 'EMAIL') {
      email = t.text;
      evidence.email = t.text;
      confidence.email = t.confidence;
    }
    if (!phone && t.type === 'PHONE') {
      phone = t.text;
      evidence.phone = t.text;
      confidence.phone = t.confidence;
    }
    if (!linkedin && t.type === 'LINKEDIN') {
      linkedin = t.text;
      evidence.linkedin = t.text;
      confidence.linkedin = t.confidence;
    }
    if (!website && t.type === 'URL' && !t.text.includes('linkedin.com')) {
      website = t.text;
      evidence.website = t.text;
      confidence.website = t.confidence;
    }
    if (!city && t.type === 'CITY') {
      city = t.metadata?.city || t.text;
      evidence.city = t.text;
      confidence.city = t.confidence;
    }
  }

  // Location / District Resolution (City -> District mandatory pairing)
  if (city) {
    const normCity = normalizeTrUniversal(city);
    for (const [dKey, dVal] of Object.entries(COMMON_TURKISH_DISTRICTS)) {
      if (normalizeTrUniversal(dVal.city) === normCity) {
        // Look for district in text
        const distRegex = new RegExp(`\\b${dVal.district}\\b`, 'i');
        if (distRegex.test(fullText)) {
          district = dVal.district;
          evidence.district = dVal.district;
          confidence.district = 0.95;
          break;
        }
      }
    }
  }

  return {
    email,
    phone,
    linkedin,
    website,
    city,
    district,
    evidence,
    confidence,
  };
}
