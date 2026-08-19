import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

describe('CV Extraction 2.0 - End-to-End Profile Mapping & Preview Test', () => {
  it('preserves all items seamlessly through the full lifecycle', () => {
    const rawCvText = `
Uğur Zaman - Maltepe / İstanbul
ugur@example.com - 0555 111 22 33

ÖZET
19 yıllık profesyonel kariyerimde bankacılık ve sigortacılık sektörlerinde proje, satış ve operasyon yönetimi alanlarında uzmanlaştım.

İŞ DENEYİMİ
IGS Türkiye
Telemarketing ve Ticari Destek Operasyonları Müdürü
2025 - 2026
Çağrı Merkezi Satış Yönetimi, Yeni Müşteri Kazanımı.

GEDİK YATIRIM
Alternatif Satış Kanalları Müdürü
2023 - 2025
Satış Yönetimi, Alternatif Satış Kanalları Yönetimi.

Mehrwerk
Sigorta Çağrı Merkezi Operasyon Müdürü
2019 - 2023
Operasyon Yönetimi, Kalite Yönetimi.

Viennalife
Sigorta Dijital Kanal Çağrı Merkezi Satış Müdürü
2016 - 2019
Dijital Lead Yönetimi, Lead Generation.

FİBABANKA
Outsource Kanal Operasyon Müdürü
2016 - 2016
Outsource Operasyon Yönetimi.

MPLUS GROUP
Çağrı Merkezi Operasyon Müdürü
2011 - 2016
Bütçe Yönetimi, Müşteri Yönetimi.

EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası ve Borsa (Yüksek Lisans) - 2022
Anadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2015

YETKİNLİKLER & ARAÇLAR
Satış Yönetimi, Operasyon Yönetimi, Çağrı Merkezi Yönetimi, Yeni Müşteri Kazanımı, Saha Satış Yönetimi, Ekip ve Performans Yönetimi, Lead Generation, Bütçe Yönetimi, CRM, MS Excel

DİLLER
Türkçe, İngilizce
`;

    // 1. Deterministic Extraction
    const extraction = extractDeterministicCv(rawCvText);
    expect(extraction.experiences.length).toBe(6);
    expect(extraction.education.length).toBe(2);
    expect(extraction.tools.length).toBe(2);

    // 2. Canonical Taxonomy Mapping
    const canonical = mapCvToCanonicalTaxonomy(extraction);
    expect(canonical.experiences.length).toBe(6);
    expect(canonical.educationList.length).toBe(2);
    expect(canonical.educationLevel).toBe('Yüksek lisans');
    expect(canonical.primaryRole).not.toBe('Hastane Yöneticisi');

    // 3. Profile Draft Builder
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv.pdf', 'doc-99');
    expect(draft.formValues.experiences?.length).toBe(6);
    expect(draft.formValues.educationHistory?.length).toBe(2);
    expect(draft.formValues.experienceLevel).toBe('Yönetici');

    // 4. Form State Simulation
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
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      availability: 'Hemen',
      candidateTraits: draft.formValues.candidateTraits || '',
    };
    expect(formState.experiences?.length).toBe(6);

    // 5. Save to Custom Fields
    const saved = formValuesToCustomFields('seek', formState);
    expect((saved.experiences as any[]).length).toBe(6);

    // 6. Reload from DB / Listing
    const reloaded = valuesFromCareerSource({
      city: formState.city,
      location: formState.city,
      customFields: saved,
    });
    expect(reloaded.experiences?.length).toBe(6);
    expect(reloaded.educationHistory?.length).toBe(2);

    // 7. Preview Rendering Input
    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: { city: reloaded.city, location: reloaded.city, customFields: saved },
      displayName: 'Uğur Zaman',
    });
    expect(preview.experiences?.length).toBe(6);
    expect(preview.educationLevel).toBe('Yüksek lisans');
    expect(preview.longDescription).toContain('19 yıllık');
  });
});
