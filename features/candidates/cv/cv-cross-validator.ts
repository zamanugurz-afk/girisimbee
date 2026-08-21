import type { AiCvExtractionPayload, RawExtractedExperience, RawExtractedEducation } from './cv.types';
import { normalizeTrUniversal } from './cv-universal-normalizer';
import { UNIVERSAL_ROLE_ALIASES } from './cv-universal-dictionary';

/**
 * Cross-Field Validator & Consistency Engine:
 * Resolves cross-field contradictions, duplicate records, and invalid date sequences.
 */
export function validateAndReconcileCvPayload(payload: AiCvExtractionPayload): AiCvExtractionPayload {
  const experiences = reconcileExperiences(payload.experiences || []);
  const education = reconcileEducation(payload.education || []);
  const locations = reconcileLocations(payload.locations || [], payload.fullName);
  const skills = Array.from(new Set((payload.skills || []).map((s) => s.trim()).filter(Boolean)));
  const tools = Array.from(new Set((payload.tools || []).map((t) => t.trim()).filter(Boolean)));

  return {
    ...payload,
    experiences,
    education,
    locations,
    skills,
    tools,
  };
}

/**
 * Reconciles experience list by eliminating duplicates, validating date bounds,
 * and checking for company/role confusion.
 */
function reconcileExperiences(rawList: RawExtractedExperience[]): RawExtractedExperience[] {
  const results: RawExtractedExperience[] = [];
  const seenKeys = new Set<string>();

  for (const exp of rawList) {
    const normRole = normalizeTrUniversal(exp.role || '');
    const normComp = normalizeTrUniversal(exp.company || '');

    // Skip empty or invalid items
    if (!normRole && !normComp) continue;

    // Check if company was mistaken for a pure skill or university
    if (
      /^(react|vue|angular|node|python|java|c#|sql|figma|photoshop|excel|word|powerpoint)$/i.test(
        normComp,
      ) &&
      !normRole
    ) {
      continue; // Skill, not an experience
    }

    // Fix date order if startYear > endYear
    let startYear = exp.startYear ?? null;
    let endYear = exp.endYear ?? null;

    if (startYear && endYear && startYear > endYear && endYear > 1980) {
      const temp = startYear;
      startYear = endYear;
      endYear = temp;
    }

    // Build deduplication key
    const dedupeKey = `${normComp}_${normRole}_${startYear}_${endYear}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    results.push({
      ...exp,
      startYear,
      endYear,
    });
  }

  return results;
}

/**
 * Reconciles education list by eliminating duplicates and validating degree fields.
 */
function reconcileEducation(rawList: RawExtractedEducation[]): RawExtractedEducation[] {
  const results: RawExtractedEducation[] = [];
  const seenKeys = new Set<string>();

  for (const edu of rawList) {
    const normSchool = normalizeTrUniversal(edu.school || '');
    const normField = normalizeTrUniversal(edu.field || '');

    if (!normSchool && !normField) continue;

    const dedupeKey = `${normSchool}_${normField}_${edu.graduationYear || ''}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    results.push(edu);
  }

  return results;
}

/**
 * Reconciles candidate location against person name homonyms.
 */
function reconcileLocations(rawLocations: string[], fullName?: string): string[] {
  if (!fullName) return rawLocations;

  const normName = normalizeTrUniversal(fullName);
  const nameParts = normName.split(/\s+/);

  return rawLocations.filter((loc) => {
    const normLoc = normalizeTrUniversal(loc);
    // If location is single token and matches a person's first name, verify it is a valid province, not a fake district
    if (nameParts.includes(normLoc)) {
      // Allow only if it is a major province name
      const isMajorProvince = /^(istanbul|ankara|izmir|bursa|antalya|adana|gaziantep|kocaeli|konya)$/i.test(
        normLoc,
      );
      return isMajorProvince;
    }
    return true;
  });
}
