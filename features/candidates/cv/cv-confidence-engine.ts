import type { ExtractedFieldProvenance, CvSectionType } from './cv-document-model';

export interface ConfidenceReport {
  overallConfidence: number;
  fieldScores: Record<string, number>;
  provenanceMap: Record<string, ExtractedFieldProvenance>;
}

/**
 * Calculates multi-factor confidence for extracted candidate fields based on
 * evidence quality, section alignment, dictionary validation, and date consistency.
 */
export class CvConfidenceEngine {
  /**
   * Evaluates field confidence and constructs provenance metadata.
   */
  static evaluateField<T>(
    fieldName: string,
    value: T,
    sourceSection: CvSectionType | string,
    evidenceSnippet: string,
    method: 'spatial_deterministic' | 'dictionary_lookup' | 'pattern_regex' | 'grounded_ai',
    options?: {
      page?: number;
      isDictionaryMatch?: boolean;
      hasDateProximity?: boolean;
      hasRoleKeywords?: boolean;
    },
  ): ExtractedFieldProvenance<T> {
    let score = 0.5;

    // Method base weight
    if (method === 'spatial_deterministic') score = 0.88;
    else if (method === 'dictionary_lookup') score = 0.94;
    else if (method === 'pattern_regex') score = 0.82;
    else if (method === 'grounded_ai') score = 0.78;

    // Boost if extracted from its natural matching section
    if (
      (fieldName === 'experiences' && sourceSection === 'experience') ||
      (fieldName === 'education' && sourceSection === 'education') ||
      (fieldName === 'skills' && sourceSection === 'skills') ||
      (fieldName === 'languages' && sourceSection === 'languages') ||
      (fieldName === 'certificates' && sourceSection === 'certifications') ||
      (fieldName === 'summary' && (sourceSection === 'summary' || sourceSection === 'header'))
    ) {
      score += 0.08;
    }

    if (options?.isDictionaryMatch) score += 0.05;
    if (options?.hasDateProximity) score += 0.05;
    if (options?.hasRoleKeywords) score += 0.04;

    const finalScore = Math.min(0.99, Math.max(0.1, Number(score.toFixed(2))));

    return {
      value,
      confidence: finalScore,
      sourceSection,
      evidenceSnippet: evidenceSnippet.slice(0, 150),
      method,
      page: options?.page || 1,
    };
  }

  /**
   * Computes comprehensive confidence report across all profile fields.
   */
  static generateConfidenceReport(provenanceMap: Record<string, ExtractedFieldProvenance>): ConfidenceReport {
    const fieldScores: Record<string, number> = {};
    let totalScore = 0;
    let count = 0;

    for (const [key, prov] of Object.entries(provenanceMap)) {
      fieldScores[key] = prov.confidence;
      totalScore += prov.confidence;
      count++;
    }

    const overall = count > 0 ? Number((totalScore / count).toFixed(2)) : 0;

    return {
      overallConfidence: overall,
      fieldScores,
      provenanceMap,
    };
  }
}
