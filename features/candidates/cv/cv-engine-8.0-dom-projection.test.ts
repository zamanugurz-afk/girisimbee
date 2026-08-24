import { describe, expect, it } from 'vitest';
import { buildHydratedCustomFieldsFromCvDraft } from '@/features/candidates/cv/cv-form-hydrator';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';

describe('CV Extraction Engine 8.0 — DOM Projection & Form Hydration Integrity', () => {
  it('hydrates canonical draft formValues into exact customFields without data pollution', () => {
    const mockDraft: CvProfileDraftResult = {
      formValues: {
        fullName: 'Uğur Zaman',
        primarySector: 'Çağrı merkezi',
        desiredRole: 'Çağrı Merkezi Operasyon Müdürü',
        experienceLevel: 'Yönetici',
        residenceCity: 'İstanbul',
        residenceDistrict: 'Maltepe',
        experiences: [
          {
            id: 'exp-1',
            company: 'IGS Türkiye',
            role: 'Çağrı Merkezi Operasyon Müdürü',
            startYear: 2025,
            endYear: 2026,
            isCurrent: false,
            sector: 'Çağrı merkezi',
            duration: '1 yıl',
            responsibilities: 'Çağrı Merkezi Satış Yönetimi',
            selectedResponsibilities: ['Çağrı Merkezi Satış Yönetimi'],
            responsibilitiesOther: '',
            achievements: '',
            selectedAchievements: [],
          },
          {
            id: 'exp-2',
            company: 'Gedik Yatırım',
            role: 'Satış Müdürü',
            startYear: 2023,
            endYear: 2025,
            isCurrent: false,
            sector: 'Satış',
            duration: '2 yıl',
            responsibilities: '',
            selectedResponsibilities: [],
            responsibilitiesOther: '',
            achievements: '',
            selectedAchievements: [],
          },
        ],
        educationHistory: [
          {
            school: 'Marmara Üniversitesi',
            level: 'Yüksek lisans',
            field: '',
            graduationYear: 2020,
          },
          {
            school: 'Anadolu Üniversitesi',
            level: 'Lisans',
            field: 'Kamu Yönetimi',
            graduationYear: 2011,
          },
        ],
        professionalSkillsList: [
          'Satış Yönetimi',
          'Operasyon Yönetimi',
          'Çağrı Merkezi Yönetimi',
          'Yeni Müşteri Kazanımı',
          'Saha Satış Yönetimi',
          'Ekip Ve Performans Yönetimi',
        ],
        cvFileName: 'CV - UĞUR ZAMAN (4).pdf',
      },
      qualityScore: {
        overallScore: 98,
        fieldQualityScores: {},
        confidenceScores: {},
        dataLossAudit: { zeroLossVerified: true, missingFieldsCount: 0, fieldStatusReport: [] },
        warnings: [],
      },
      metrics: {
        aiCallCount: 0,
        aiCalled: false,
        aiSkipped: true,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        deterministicFieldsCount: 8,
        aiExtractedFieldsCount: 0,
        taxonomyMappedCount: 2,
        ambiguousCount: 0,
        piiMaskedCount: 4,
        cacheHit: false,
        extractionVersion: '8.0.0',
        taxonomyVersion: '8.0.0',
        parserVersion: '8.0.0',
        coverageScore: 98,
        confidenceScores: {},
        processingTimeMs: 45,
      },
    };

    const existingFields = {
      fullName: '',
      primarySector: '',
      desiredRole: '',
    };

    const result = buildHydratedCustomFieldsFromCvDraft(mockDraft, existingFields);

    expect(result.nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(result.nextCustomFields.fullName).not.toBe('Eğitim');

    expect(result.nextCustomFields.primarySector).toBe('Çağrı merkezi');
    expect(result.nextCustomFields.primarySector).not.toBe('Kamu / Belediye');

    expect(result.nextCustomFields.desiredRole).toBe('');

    expect(result.nextCustomFields.experienceLevel).toBe('Yönetici');
    expect(result.nextCustomFields.residenceCity).toBe('İstanbul');
    expect(result.nextCustomFields.residenceDistrict).toBe('Maltepe');

    expect((result.nextCustomFields.experiences as any[]).length).toBe(2);
    expect((result.nextCustomFields.educationHistory as any[]).length).toBe(2);
    expect((result.nextCustomFields.professionalSkillsList as any[]).length).toBe(6);
  });
});
