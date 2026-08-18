import { describe, expect, it } from 'vitest';
import zlib from 'zlib';
import { extractCvText } from '@/features/candidates/cv/cv-text-extractor';
import { maskCvPii } from '@/features/candidates/cv/cv-pii-masker';
import { extractDeterministicCvSignals } from '@/features/candidates/cv/cv-deterministic-extractor';
import { fallbackDeterministicAiExtraction } from '@/features/candidates/cv/cv-ai-extractor';
import {
  mapCvToCanonicalTaxonomy,
  matchCanonicalPosition,
  matchCanonicalSector,
} from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import type { AiCvExtractionPayload } from '@/features/candidates/cv/cv.types';

export const UGUR_ZAMAN_CV_TEXT = `
UĞUR ZAMAN
Telemarketing ve Çağrı Merkezi Operasyonları Direktörü | Sigorta Satış Yönetimi | Saha Satış Yönetimi | Dijital Satış Yönetimi | Inbound Operasyon Yönetimi

Kişisel Bilgiler
zamanugurz@gmail.com
5309367745
Maltepe, İSTANBUL, Türkiye

Kişisel Özet
19 yıllık profesyonel kariyerimde, Türkiye’nin önde gelen banka ve sigorta şirketlerinde proje, satış ve operasyon yönetimi alanlarında uzmanlaştım. Inbound, outbound, saha ve dijital satış ekipleri; yeni müşteri kazanımı, satış stratejileri, performans ve müşteri yönetimi konularında deneyim sahibiyim.

İş Deneyimi
Telemarketing ve Ticari Destek Operasyonları Müdürü, IGS Türkiye
Eylül 2025 - Ağustos 2026
Çağrı Merkezi Satış Yönetimi | Yeni Müşteri Kazanımı ve Satış Geliştirme | Kurumsal Müşteri Yönetimi | Satış Ekibi ve Performans Yönetimi

Alternatif Satış Kanalları Müdürü, GEDİK YATIRIM
Eylül 2023 - Eylül 2025
Satış Yönetimi | Yeni Müşteri Kazanımı ve İş Geliştirme | Alternatif Satış Kanalları Yönetimi | Satış Stratejileri ve Kanal Geliştirme

Sigorta Çağrı Merkezi Operasyon Müdürü, MEHRWERK
Eylül 2019 - Ağustos 2023
Satış Yönetimi | Operasyon Yönetimi | Kalite Yönetimi | Performans Yönetimi | Ekip Yönetimi

Sigorta Dijital Kanal Çağrı Merkezi Satış Müdürü, VİENNALİFE
Ekim 2016 - Eylül 2019
Dijital Lead Yönetimi | Lead Generation | Yeni Müşteri Kazanımı | Satış Yönetimi | Performans Yönetimi

Outsource Kanal Operasyon Müdürü, FİBABANKA
Mart 2016 - Ekim 2016
Outsource Operasyon Yönetimi | Müşteri İlişkileri Yönetimi

Çağrı Merkezi Operasyon Müdürü, MPLUS GROUP
Ocak 2011 - Mart 2016
Outsource Operasyon Yönetimi | Müşteri Yönetimi | Bütçe Yönetimi

Eğitim
Sermaye Piyasası ve Borsa
Yüksek Lisans
MARMARA ÜNİVERSİTESİ
2020 - 2022

Kamu Yönetimi Lisans
ANADOLU ÜVERSİTESİ
2011 - 2015

Beceriler
Satış Yönetimi - Uzman
Operasyon Yönetimi - Uzman
Çağrı Merkezi Yönetimi - Uzman
Yeni Müşteri Kazanımı - Uzman
Saha Satış Yönetimi - Uzman
Ekip ve Performans Yönetimi - Uzman

Referanslar
Ersan Akpınar , Gedik Yatırım
5323758901
`;

describe('Real World CV Acceptance Test - Uğur Zaman', () => {
  it('extracts all 6 experiences, skills, education and summary without data loss', () => {
    // 1. Text & PII Masking
    const pii = maskCvPii(UGUR_ZAMAN_CV_TEXT);
    expect(pii.maskedText).not.toContain('zamanugurz@gmail.com');
    expect(pii.maskedText).not.toContain('5309367745');
    expect(pii.maskedText).toContain('[EMAIL]');
    expect(pii.maskedText).toContain('[PHONE]');

    // 2. Deterministic Signals
    const signals = extractDeterministicCvSignals(pii.maskedText);
    expect(signals.detectedCities).toContain('İstanbul');
    expect(signals.educationDegrees.some((d) => /yüksek\s*lisans/i.test(d))).toBe(true);
    expect(signals.educationDegrees).toContain('Lisans');

    // 3. Fallback Deterministic Extractor directly from raw CV text
    const fallbackPayload = fallbackDeterministicAiExtraction(pii.maskedText, signals);
    expect(fallbackPayload.experiences.length).toBeGreaterThanOrEqual(6);
    expect(fallbackPayload.skills.length).toBeGreaterThanOrEqual(6);
    expect(fallbackPayload.education.length).toBeGreaterThanOrEqual(2);
    expect(fallbackPayload.summary).toContain('19 yıl');

    // 4. Structured Payload Simulation
    const aiPayload: AiCvExtractionPayload = {
      experiences: [
        {
          role: 'Telemarketing ve Ticari Destek Operasyonları Müdürü',
          company: 'IGS Türkiye',
          sector: 'Telekomünikasyon / Çağrı Merkezi',
          startYear: 2025,
          endYear: 2026,
          durationYears: 1,
          isCurrent: false,
          responsibilities: 'Çağrı Merkezi Satış Yönetimi, Yeni Müşteri Kazanımı, Kurumsal Müşteri Yönetimi',
          achievements: 'Satış Ekibi ve Performans Yönetimi',
        },
        {
          role: 'Alternatif Satış Kanalları Müdürü',
          company: 'Gedik Yatırım',
          sector: 'Finans / Sermaye Piyasası',
          startYear: 2023,
          endYear: 2025,
          durationYears: 2,
          isCurrent: false,
          responsibilities: 'Alternatif Satış Kanalları Yönetimi, Satış Stratejileri',
          achievements: 'Kanal Geliştirme ve Yeni Müşteri Kazanımı',
        },
        {
          role: 'Sigorta Çağrı Merkezi Operasyon Müdürü',
          company: 'Mehrwerk',
          sector: 'Sigortacılık',
          startYear: 2019,
          endYear: 2023,
          durationYears: 4,
          isCurrent: false,
          responsibilities: 'Satış ve Operasyon Yönetimi, Kalite Yönetimi',
          achievements: 'Performans Yönetimi, Ekip Yönetimi',
        },
        {
          role: 'Sigorta Dijital Kanal Çağrı Merkezi Satış Müdürü',
          company: 'Viennalife',
          sector: 'Sigortacılık',
          startYear: 2016,
          endYear: 2019,
          durationYears: 3,
          isCurrent: false,
          responsibilities: 'Dijital Lead Yönetimi, Lead Generation',
          achievements: 'Yeni Müşteri Kazanımı, Satış Yönetimi',
        },
        {
          role: 'Outsource Kanal Operasyon Müdürü',
          company: 'Fibabanka',
          sector: 'Finans / Bankacılık',
          startYear: 2016,
          endYear: 2016,
          durationYears: 1,
          isCurrent: false,
          responsibilities: 'Outsource Operasyon Yönetimi',
          achievements: 'Müşteri İlişkileri Yönetimi',
        },
        {
          role: 'Çağrı Merkezi Operasyon Müdürü',
          company: 'Mplus Group',
          sector: 'Çağrı Merkezi / BPO',
          startYear: 2011,
          endYear: 2016,
          durationYears: 5,
          isCurrent: false,
          responsibilities: 'Outsource Operasyon Yönetimi, Müşteri Yönetimi',
          achievements: 'Bütçe Yönetimi',
        },
      ],
      roles: [
        'Telemarketing ve Çağrı Merkezi Operasyonları Direktörü',
        'Alternatif Satış Kanalları Müdürü',
        'Sigorta Çağrı Merkezi Operasyon Müdürü',
      ],
      sectors: ['Finans / Bankacılık', 'Sigortacılık', 'Telekomünikasyon'],
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
      tools: ['CRM', 'Çağrı Merkezi Santral Sistemleri', 'MS Excel'],
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
        '19 yıllık profesyonel kariyerinde banka ve sigorta şirketlerinde proje, satış ve çağrı merkezi operasyon yönetimi alanlarında uzmanlaşmış kıdemli yönetici.',
      ambiguousItems: [],
    };

    // 5. Canonical Taxonomy Mapping
    const canonical = mapCvToCanonicalTaxonomy(fallbackPayload);

    expect(canonical.experiences.length).toBeGreaterThanOrEqual(6);
    expect(canonical.professionalSkills.length).toBeGreaterThanOrEqual(6);
    expect(canonical.educationLevel).toBe('Yüksek lisans');
    expect(canonical.educationField).toContain('Sermaye Piyasası');
    expect(canonical.educationField).toContain('Kamu Yönetimi');
    expect(canonical.residenceCity).toBe('İstanbul');

    // 6. Profile Draft Builder
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'CV - UĞUR ZAMAN (4).pdf');

    expect(draft.formValues.role).toBeTruthy();
    expect(draft.formValues.role).not.toBe('Pozisyon belirtilmedi');
    expect(draft.formValues.sector).toBeTruthy();
    expect(draft.formValues.experiences?.length).toBeGreaterThanOrEqual(6);
    expect(draft.formValues.educationLevel).toBe('Yüksek lisans');
    expect(draft.formValues.educationField).toContain('Sermaye Piyasası');
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.candidateTraits).toContain('19 yıl');

    // 7. Verify Preference Isolation
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.availability).toBe('');
  });
});
