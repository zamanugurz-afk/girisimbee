/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 10.0
 * CLIENT / DOM HYDRATION & FORM INTEGRITY TEST SUITE
 * 
 * Verifies that:
 * 1. Extraction output -> Canonical Draft -> buildHydratedCustomFieldsFromCvDraft
 *    flows smoothly without schema mismatch or UI state loss.
 * 2. Pre-existing user values are preserved where appropriate.
 * 3. Array fields (experiences, educationHistory, languages, skills) match React state contracts.
 * 4. Zero null pointer exceptions or unhandled type mismatches occur in client hydration.
 */

import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';

describe('CV Extraction Engine 10.0 — Client / DOM Hydration Integrity', () => {
  it('DOM-01: Correctly hydrates full-featured tech profile into form state fields', () => {
    const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Çağdaş Bilge
Telefon: +90 532 888 77 66
E-posta: cagdas.bilge@domain.com
Adres: Kadıköy / İstanbul

İŞ DENEYİMİ
2020 - 2024
Kıdemli Frontend Geliştirici
Trendyol
• Next.js ve TypeScript ile mikro-frontend mimarisi.

EĞİTİM
2015 - 2019
ODTÜ - Bilgisayar Mühendisliği (Lisans)

YETKİNLİKLER
React, TypeScript, Next.js, GraphQL, Tailwind CSS

DİLLER
İngilizce (C1 - İleri)`;

    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cagdas.txt', 'doc-123');
    const hydrated = buildHydratedCustomFieldsFromCvDraft(draft);

    expect(hydrated.appliedKeys).toContain('fullName');
    expect(hydrated.appliedKeys).toContain('residenceCity');
    expect(hydrated.appliedKeys).toContain('primarySector');
    expect(hydrated.appliedKeys).toContain('experiences');
    expect(hydrated.appliedKeys).toContain('educationHistory');

    expect(hydrated.nextCustomFields.fullName).toBe('Çağdaş Bilge');
    expect(hydrated.nextCustomFields.residenceCity).toBe('İstanbul');
    expect(hydrated.nextCustomFields.residenceDistrict).toBe('Kadıköy');
    expect(draft.formValues.desiredRole).toBe('Frontend Geliştirici');
    expect(hydrated.nextCustomFields.desiredRole).toBe('');
    expect(hydrated.nextCustomFields.primarySector).toBe('Bilişim / Yazılım');

    const exps = hydrated.nextCustomFields.experiences as any[];
    expect(exps.length).toBe(1);
    expect(exps[0].company).toBe('Trendyol');
    expect(exps[0].role).toBe('Frontend Geliştirici');

    const edus = hydrated.nextCustomFields.educationHistory as any[];
    expect(edus.length).toBe(1);
    expect(edus[0].level).toBe('Lisans');
  });

  it('DOM-02: Safely merges with pre-existing user form fields without destructive overwrite of non-CV data', () => {
    const cv = `Adı Soyadı: Pınar Aydın
E-posta: pinar@finance.com
Lokasyon: İzmir

DENEYİM
2021 - 2024
Bütçe ve Raporlama Uzmanı
Finansbank A.Ş.
• Mali tablo hazırlama ve bütçe denetimi.`;

    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    const draft = buildProfileDraftFromCanonicalResult(canonical);

    // Existing form fields set by user beforehand
    const existingCustomFields = {
      userPreferredLanguage: 'tr',
      notesForRecruiter: 'Sadece uzaktan çalışma pozisyonları ile ilgileniyorum.',
      customPortfolioUrl: 'https://pinar-portfolio.dev',
    };

    const hydrated = buildHydratedCustomFieldsFromCvDraft(draft, existingCustomFields);

    // Pristine user fields are preserved
    expect(hydrated.nextCustomFields.userPreferredLanguage).toBe('tr');
    expect(hydrated.nextCustomFields.notesForRecruiter).toBe('Sadece uzaktan çalışma pozisyonları ile ilgileniyorum.');
    expect(hydrated.nextCustomFields.customPortfolioUrl).toBe('https://pinar-portfolio.dev');

    // New CV fields are properly merged
    expect(hydrated.nextCustomFields.fullName).toBe('Pınar Aydın');
    expect(hydrated.nextCustomFields.residenceCity).toBe('İzmir');
  });

  it('DOM-03: Rejects invalid or forbidden candidate name strings during hydration', () => {
    const cv = `EĞİTİM BİLGİLERİ
2020 - 2024
İşletme Fakültesi
İstanbul Üniversitesi`;

    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    const draft = buildProfileDraftFromCanonicalResult(canonical);
    const hydrated = buildHydratedCustomFieldsFromCvDraft(draft);

    // "Eğitim Bilgileri" must NEVER become fullName in hydrated form state
    expect(hydrated.nextCustomFields.fullName).not.toBe('Eğitim Bilgileri');
    expect(hydrated.nextCustomFields.fullName).not.toBe('Eğitim');
    expect(hydrated.nextCustomFields.fullName).toBe('');
  });
});
