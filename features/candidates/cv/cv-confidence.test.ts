import { describe, expect, it } from 'vitest';
import { calculateCvQualityScore } from '@/features/candidates/cv/cv-quality-score';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import type { AiCvExtractionPayload } from '@/features/candidates/cv/cv.types';

describe('CV Extraction 2.0 - Confidence Scoring Tests', () => {
  it('assigns high confidence scores to exact matches and computes accurate quality breakdown', () => {
    const payload: AiCvExtractionPayload = {
      experiences: [
        {
          role: 'Satış Müdürü',
          company: 'Banka A.Ş.',
          startYear: 2020,
          endYear: 2024,
          isCurrent: false,
          responsibilities: 'B2B satış ve ekip yönetimi',
        },
      ],
      roles: ['Satış Müdürü'],
      sectors: ['Finans / Bankacılık'],
      skills: ['Satış Yönetimi', 'Ekip Yönetimi', 'Bütçe Yönetimi', 'Müzakere', 'Müşteri Yönetimi'],
      tools: ['MS Excel'],
      education: [{ level: 'Lisans', school: 'Marmara Üniversitesi', field: 'İşletme' }],
      languages: ['Türkçe', 'İngilizce'],
      certificates: ['SEGEM'],
      locations: ['İstanbul'],
      summary: 'Deneyimli satış yöneticisi.',
      ambiguousItems: [],
    };

    const canonical = mapCvToCanonicalTaxonomy(payload);
    expect(canonical.canonicalConfidence).toBe(1.0); // Exact match without ambiguity

    const report = calculateCvQualityScore({
      canonical,
      experiences: payload.experiences,
      summaryLength: payload.summary.length,
    });

    expect(report.overallScore).toBeGreaterThanOrEqual(85);
    expect(report.confidenceScores.role).toBe(1.0);
    expect(report.confidenceScores.education).toBe(1.0);
    expect(report.confidenceScores.skills).toBeGreaterThanOrEqual(0.95);
  });
});
