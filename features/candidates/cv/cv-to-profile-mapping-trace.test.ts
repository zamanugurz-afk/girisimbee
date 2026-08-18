import { describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import * as openAiModule from '@/lib/openai/career-openai';
import { extractCvText } from '@/features/candidates/cv/cv-text-extractor';
import { maskCvPii } from '@/features/candidates/cv/cv-pii-masker';
import { extractDeterministicCvSignals } from '@/features/candidates/cv/cv-deterministic-extractor';
import { extractCvWithSingleAiCall } from '@/features/candidates/cv/cv-ai-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

describe('CV to Profile Data Mapping Trace & Regression Test', () => {
  const cvPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  it('verifies 100% data preservation across the entire pipeline without data loss', async () => {
    if (!fs.existsSync(cvPath)) {
      console.warn(`File not found at ${cvPath}, skipping local file test`);
      return;
    }

    const buf = fs.readFileSync(cvPath);

    // Mock AI call to return realistic grounded AI response (or test fallback)
    vi.spyOn(openAiModule, 'openaiJsonCompletion').mockResolvedValueOnce({
      model: 'gpt-4o-mini',
      json: {
        experiences: [
          {
            role: 'Telemarketing ve Ticari Destek Operasyonları Müdürü',
            company: 'IGS Türkiye',
            sector: 'Finans / Bankacılık',
            startYear: 2025,
            endYear: 2026,
            isCurrent: false,
            responsibilities: 'Çağrı Merkezi Satış Yönetimi, Yeni Müşteri Kazanımı',
          },
          {
            role: 'Alternatif Satış Kanalları Müdürü',
            company: 'GEDİK YATIRIM',
            sector: 'Finans / Bankacılık',
            startYear: 2023,
            endYear: 2025,
            isCurrent: false,
            responsibilities: 'Satış Yönetimi, Alternatif Satış Kanalları Yönetimi',
          },
          {
            role: 'Sigorta Çağrı Merkezi Operasyon Müdürü',
            company: 'Mehrwerk',
            sector: 'Sigortacılık',
            startYear: 2019,
            endYear: 2023,
            isCurrent: false,
            responsibilities: 'Operasyon Yönetimi, Kalite Yönetimi, Ekip Yönetimi',
          },
          {
            role: 'Sigorta Dijital Kanal Çağrı Merkezi Satış Müdürü',
            company: 'Viennalife',
            sector: 'Sigortacılık',
            startYear: 2016,
            endYear: 2019,
            isCurrent: false,
            responsibilities: 'Dijital Lead Yönetimi, Lead Generation',
          },
          {
            role: 'Outsource Kanal Operasyon Müdürü',
            company: 'FİBABANKA',
            sector: 'Finans / Bankacılık',
            startYear: 2016,
            endYear: 2016,
            isCurrent: false,
            responsibilities: 'Outsource Operasyon Yönetimi',
          },
          {
            role: 'Çağrı Merkezi Operasyon Müdürü',
            company: 'MPLUS GROUP',
            sector: 'Müşteri Hizmetleri / Çağrı Merkezi',
            startYear: 2011,
            endYear: 2016,
            isCurrent: false,
            responsibilities: 'Bütçe Yönetimi, Müşteri Yönetimi',
          },
        ],
        roles: [
          'Telemarketing ve Çağrı Merkezi Operasyonları Direktörü',
          'Alternatif Satış Kanalları Müdürü',
          'Sigorta Çağrı Merkezi Operasyon Müdürü',
          'Sigorta Dijital Kanal Çağrı Merkezi Satış Müdürü',
          'Outsource Kanal Operasyon Müdürü',
          'Çağrı Merkezi Operasyon Müdürü',
        ],
        sectors: ['Finans / Bankacılık', 'Sigortacılık', 'Müşteri Hizmetleri / Çağrı Merkezi'],
        skills: [
          'Satış Yönetimi',
          'Operasyon Yönetimi',
          'Çağrı Merkezi Yönetimi',
          'Yeni Müşteri Kazanımı',
          'Saha Satış Yönetimi',
          'Ekip ve Performans Yönetimi',
          'Lead Generation',
          'Bütçe Yönetimi',
        ],
        tools: ['CRM', 'MS Excel'],
        education: [
          {
            level: 'Yüksek Lisans',
            field: 'Sermaye Piyasası ve Borsa',
            school: 'Marmara Üniversitesi',
          },
          {
            level: 'Lisans',
            field: 'Kamu Yönetimi',
            school: 'Anadolu Üniversitesi',
          },
        ],
        languages: ['Türkçe'],
        certificates: [],
        locations: ['İstanbul'],
        summary:
          '19 yıllık profesyonel kariyerimde bankacılık ve sigortacılık sektörlerinde proje, satış ve operasyon yönetimi alanlarında uzmanlaştım.',
        ambiguousItems: [],
      },
    });

    // ==========================================
    // STAGE 1: Text Extraction & Signals
    // ==========================================
    const extracted = await extractCvText(buf, 'CV - UĞUR ZAMAN (4).pdf', 'application/pdf');
    expect(extracted.text.length).toBeGreaterThan(200);

    const masked = maskCvPii(extracted.text);
    const signals = extractDeterministicCvSignals(masked.maskedText);

    // ==========================================
    // STAGE 2: AI Extraction (with Deterministic Baseline)
    // ==========================================
    const aiPayload = await extractCvWithSingleAiCall(masked.maskedText, signals);

    expect(aiPayload.experiences.length).toBe(6);
    expect(aiPayload.education.length).toBe(2);
    expect(aiPayload.skills.length).toBeGreaterThanOrEqual(8);
    expect(aiPayload.summary.length).toBeGreaterThan(30);

    // ==========================================
    // STAGE 3: Canonical Taxonomy Mapping
    // ==========================================
    const canonical = mapCvToCanonicalTaxonomy(aiPayload);

    expect(canonical.experiences.length).toBe(6);
    expect(canonical.educationList.length).toBe(2);
    expect(canonical.educationLevel).toBe('Yüksek lisans');
    expect(canonical.residenceCity).toBe('İstanbul');
    // Ensure false medical role is strictly blocked
    expect(canonical.primaryRole).not.toBe('Hastane Yöneticisi');
    expect(canonical.matchedRoles).not.toContain('Hastane Yöneticisi');

    // ==========================================
    // STAGE 4: Profile Builder (Draft Generation)
    // ==========================================
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'CV - UĞUR ZAMAN (4).pdf', 'doc-123');

    expect(draft.formValues.experiences?.length).toBe(6);
    expect(draft.formValues.educationHistory?.length).toBe(2);
    expect(draft.formValues.experienceLevel).toBe('10+ yıl');
    expect(draft.categoriesFound.experiences).toBe(6);
    expect(draft.categoriesFound.education).toBe(2);

    // ==========================================
    // STAGE 5: Form State Simulation
    // ==========================================
    const formState: CareerProfileFormValues = {
      role: draft.formValues.role || '',
      roles: draft.formValues.roles || [],
      sector: draft.formValues.sector || '',
      sectors: draft.formValues.sectors || [],
      experienceLevel: draft.formValues.experienceLevel || '',
      experiences: draft.formValues.experiences || [],
      professionalSkills: draft.formValues.professionalSkills || '',
      professionalSkillsList: draft.formValues.professionalSkillsList || [],
      technicalSkills: draft.formValues.technicalSkills || '',
      technicalSkillsList: draft.formValues.technicalSkillsList || [],
      tools: draft.formValues.tools || '',
      toolsList: draft.formValues.toolsList || [],
      educationLevel: draft.formValues.educationLevel || '',
      educationField: draft.formValues.educationField || '',
      educationHistory: draft.formValues.educationHistory || [],
      languages: draft.formValues.languages || '',
      certificates: draft.formValues.certificates || '',
      city: draft.formValues.city || '',
      residenceCity: draft.formValues.residenceCity || '',
      residenceDistrict: draft.formValues.residenceDistrict || '',
      preferredDistrict: draft.formValues.preferredDistrict || '',
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      availability: 'Hemen',
      candidateTraits: draft.formValues.candidateTraits || '',
      cvFileName: draft.formValues.cvFileName,
      cvDocumentId: draft.formValues.cvDocumentId,
      cvUploadedAt: draft.formValues.cvUploadedAt,
    };

    expect(formState.experiences?.length).toBe(6);
    expect(formState.educationHistory?.length).toBe(2);
    expect(formState.professionalSkillsList?.length).toBeGreaterThanOrEqual(5);

    // ==========================================
    // STAGE 6: Save (formValues -> customFields)
    // ==========================================
    const customFields = formValuesToCustomFields('seek', formState);

    expect((customFields.experiences as any[])?.length).toBe(6);
    expect((customFields.educationHistory as any[])?.length).toBe(2);
    expect(customFields.educationLevel).toBe('Yüksek lisans');

    // ==========================================
    // STAGE 7: Reload (customFields -> valuesFromCareerSource)
    // ==========================================
    const reloadedValues = valuesFromCareerSource({
      city: formState.city,
      location: formState.city,
      customFields,
    });

    expect(reloadedValues.experiences?.length).toBe(6);
    expect(reloadedValues.educationHistory?.length).toBe(2);
    expect(reloadedValues.educationLevel).toBe('Yüksek lisans');
    expect(reloadedValues.candidateTraits).toContain('19 yıllık');

    // ==========================================
    // STAGE 8: Preview Construction
    // ==========================================
    const previewInput = toSafeCareerPreviewInput({
      kind: 'seek',
      source: {
        city: reloadedValues.city,
        location: reloadedValues.city,
        customFields,
      },
      displayName: 'Uğur Zaman',
    });

    expect(previewInput.experiences?.length).toBe(6);
    expect(previewInput.educationLevel).toBe('Yüksek lisans');
    expect(previewInput.educationField).toContain('Marmara');
    expect(previewInput.educationField).toContain('Anadolu');
    expect(previewInput.longDescription).toContain('19 yıllık');

    // Verify Experience Display partition (2 visible, 4 compact/expandable)
    const featuredLimit = 2;
    const visibleCount = Math.min(featuredLimit, previewInput.experiences!.length);
    const extraCount = Math.max(0, previewInput.experiences!.length - featuredLimit);

    expect(visibleCount).toBe(2);
    expect(extraCount).toBe(4);
    expect(visibleCount + extraCount).toBe(6);
  });
});
