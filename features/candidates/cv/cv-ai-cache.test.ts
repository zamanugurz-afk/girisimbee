import { describe, expect, it, beforeEach } from 'vitest';
import { cvAnalysisCache } from '@/features/candidates/cv/cv-cache';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';

describe('CV Extraction 2.0 - SHA-256 Cache System Tests', () => {
  beforeEach(() => {
    cvAnalysisCache.clear();
  });

  it('computes consistent deterministic SHA-256 hash for identical CV text', () => {
    const text1 = '  Ahmet Yılmaz\nİstanbul - 2024  ';
    const text2 = 'Ahmet Yılmaz\nİstanbul - 2024';

    const hash1 = cvAnalysisCache.computeHash(text1);
    const hash2 = cvAnalysisCache.computeHash(text2);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex length
  });

  it('stores and retrieves cached extraction result on duplicate upload (0 AI calls, instant)', () => {
    const cvText = 'Örnek CV Metni';
    const mockDraft: CvProfileDraftResult = {
      formValues: { role: 'Satış Müdürü', city: 'İstanbul' },
      cvFilledFieldKeys: ['role', 'city'],
      unconfirmedPreferenceKeys: [],
      ambiguousItems: [],
      summary: 'Kariyer Özeti',
      extractedCount: 5,
      categoriesFound: {
        experiences: 1,
        roles: 1,
        sectors: 1,
        skills: 2,
        tools: 0,
        education: 1,
        languages: 1,
        certificates: 0,
        locations: 1,
        summary: true,
      },
      metrics: {
        aiCallCount: 1,
        aiCalled: true,
        aiSkipped: false,
        inputTokens: 300,
        outputTokens: 150,
        estimatedCostUsd: 0.0001,
        deterministicFieldsCount: 5,
        aiExtractedFieldsCount: 1,
        taxonomyMappedCount: 2,
        ambiguousCount: 0,
        piiMaskedCount: 1,
        cacheHit: false,
        extractionVersion: '2.0',
        taxonomyVersion: '2.0',
        parserVersion: '2.0',
        coverageScore: 95,
        confidenceScores: {},
      },
    };

    cvAnalysisCache.set(cvText, mockDraft);

    expect(cvAnalysisCache.has(cvText)).toBe(true);

    const retrieved = cvAnalysisCache.get(cvText);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.formValues.role).toBe('Satış Müdürü');
    expect(retrieved?.metrics.cacheHit).toBe(true);
    expect(retrieved?.metrics.aiCallCount).toBe(0);
    expect(retrieved?.metrics.aiSkipped).toBe(true);
  });
});
