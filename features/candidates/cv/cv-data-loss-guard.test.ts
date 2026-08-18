import { describe, expect, it } from 'vitest';
import {
  assertExperienceCountNotReduced,
  assertEducationCountNotReduced,
  assertSkillsCountNotReduced,
  assertToolsCountNotReduced,
  verifyCvPipelineIntegrity,
  CvDataLossError,
} from '@/features/candidates/cv/cv-data-loss-guard';
import type { AiCvExtractionPayload, CanonicalTaxonomyMappingResult } from '@/features/candidates/cv/cv.types';

describe('CV Extraction 2.0 - Data Loss Guard Tests', () => {
  it('throws CvDataLossError when experience count drops', () => {
    expect(() => assertExperienceCountNotReduced(6, 5, 'profile-builder')).toThrowError(CvDataLossError);
  });

  it('throws CvDataLossError when education count drops', () => {
    expect(() => assertEducationCountNotReduced(2, 1, 'profile-builder')).toThrowError(CvDataLossError);
  });

  it('throws CvDataLossError when skill count drops', () => {
    expect(() => assertSkillsCountNotReduced(10, 8, 'form-state')).toThrowError(CvDataLossError);
  });

  it('throws CvDataLossError when tools count drops', () => {
    expect(() => assertToolsCountNotReduced(3, 2, 'save')).toThrowError(CvDataLossError);
  });

  it('validates pipeline integrity successfully when all counts are preserved', () => {
    const raw: AiCvExtractionPayload = {
      experiences: [{ role: 'A' }, { role: 'B' }, { role: 'C' }],
      roles: ['A', 'B', 'C'],
      sectors: ['Sigortacılık'],
      skills: ['Satış', 'Operasyon'],
      tools: ['Excel'],
      education: [{ level: 'Lisans' }, { level: 'Yüksek Lisans' }],
      languages: ['Türkçe'],
      certificates: [],
      locations: ['İstanbul'],
      summary: 'Özet',
      ambiguousItems: [],
    };

    const canonical: CanonicalTaxonomyMappingResult = {
      primaryRole: 'A',
      matchedRoles: ['A', 'B', 'C'],
      primarySector: 'Sigortacılık',
      matchedSectors: ['Sigortacılık'],
      professionalSkills: ['Satış'],
      technicalSkills: ['Operasyon'],
      tools: ['Excel'],
      educationLevel: 'Yüksek Lisans',
      educationField: 'İşletme',
      educationList: [{ level: 'Lisans' }, { level: 'Yüksek Lisans' }],
      languages: 'Türkçe',
      certificates: '',
      residenceCity: 'İstanbul',
      experiences: [
        { id: '1', role: 'A', sector: 'Sigortacılık', duration: '1 yıl', responsibilities: '', achievements: '' },
        { id: '2', role: 'B', sector: 'Sigortacılık', duration: '1 yıl', responsibilities: '', achievements: '' },
        { id: '3', role: 'C', sector: 'Sigortacılık', duration: '1 yıl', responsibilities: '', achievements: '' },
      ],
      summary: 'Özet',
      ambiguousItems: [],
      canonicalConfidence: 1.0,
    };

    const integrity = verifyCvPipelineIntegrity({ rawExtraction: raw, canonical });
    expect(integrity.valid).toBe(true);
    expect(integrity.lossDetected).toBe(false);
  });
});
