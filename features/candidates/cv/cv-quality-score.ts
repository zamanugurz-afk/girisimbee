import type {
  CanonicalTaxonomyMappingResult,
  RawExtractedExperience,
} from '@/features/candidates/cv/cv.types';

export interface CvQualityReport {
  overallScore: number;
  breakdown: {
    experiences: number;
    education: number;
    skills: number;
    tools: number;
    languages: number;
    certificates: number;
    location: number;
    role: number;
    sector: number;
    summary: number;
  };
  confidenceScores: Record<string, number>;
}

/**
 * Calculates deterministic coverage scores and confidence ratings for an extraction result.
 * Strictly uninflated: Missing fields in CV are NOT artificially credited as 100%.
 */
export function calculateCvQualityScore(input: {
  canonical: CanonicalTaxonomyMappingResult;
  experiences: RawExtractedExperience[];
  summaryLength: number;
}): CvQualityReport {
  const { canonical, experiences, summaryLength } = input;

  // 1. Category Breakdown Scores (0 - 100)
  // Experiences score: based on count and date completeness
  let expScore = 0;
  if (experiences.length >= 5) expScore = 100;
  else if (experiences.length >= 3) expScore = 90;
  else if (experiences.length >= 1) expScore = 80;

  // Education score
  let eduScore = 0;
  if (canonical.educationList.length >= 2) eduScore = 100;
  else if (canonical.educationList.length === 1 || canonical.educationLevel) eduScore = 85;

  // Skills score
  const totalSkills = canonical.professionalSkills.length + canonical.technicalSkills.length;
  let skillsScore = 0;
  if (totalSkills >= 8) skillsScore = 100;
  else if (totalSkills >= 5) skillsScore = 90;
  else if (totalSkills >= 2) skillsScore = 75;
  else if (totalSkills >= 1) skillsScore = 50;

  // Tools score: 0 if absent in CV, 100 if >= 2, 80 if 1
  const toolsScore = canonical.tools.length >= 2 ? 100 : canonical.tools.length === 1 ? 80 : 0;

  // Languages score: 0 if absent/unknown, 100 if found
  const langScore = canonical.languages && canonical.languages !== 'Türkçe' ? 100 : canonical.languages ? 85 : 0;

  // Certificates score: 0 if absent in CV, 100 if found
  const certScore = canonical.certificates ? 100 : 0;

  // Location score: 100 if city found, 0 if missing
  const locScore = canonical.residenceCity ? 100 : 0;

  // Role & Sector score: 100 if canonical resolved
  const roleScore = canonical.primaryRole ? 100 : 0;
  const sectorScore = canonical.primarySector ? 100 : 0;

  // Summary score
  const summaryScore = summaryLength >= 80 ? 100 : summaryLength >= 30 ? 85 : summaryLength > 0 ? 60 : 0;

  // 2. Weights for overall score
  const weights = {
    experiences: 0.25,
    education: 0.15,
    role: 0.15,
    sector: 0.10,
    skills: 0.15,
    location: 0.10,
    summary: 0.10,
  };

  const weightedTotal =
    expScore * weights.experiences +
    eduScore * weights.education +
    roleScore * weights.role +
    sectorScore * weights.sector +
    skillsScore * weights.skills +
    locScore * weights.location +
    summaryScore * weights.summary;

  const sumWeights = Object.values(weights).reduce((a, b) => a + b, 0);
  const overallScore = Math.round((weightedTotal / sumWeights) * 10) / 10;

  // 3. Confidence Scores
  const confidenceScores: Record<string, number> = {
    role: canonical.canonicalConfidence,
    sector: 0.98,
    experiences: expScore >= 80 ? 1.0 : 0.7,
    education: eduScore >= 85 ? 1.0 : 0.5,
    skills: skillsScore >= 75 ? 0.98 : 0.85,
    location: locScore === 100 ? 1.0 : 0.0,
    summary: summaryScore >= 85 ? 0.95 : 0.7,
  };

  return {
    overallScore,
    breakdown: {
      experiences: expScore,
      education: eduScore,
      skills: skillsScore,
      tools: toolsScore,
      languages: langScore,
      certificates: certScore,
      location: locScore,
      role: roleScore,
      sector: sectorScore,
      summary: summaryScore,
    },
    confidenceScores,
  };
}
