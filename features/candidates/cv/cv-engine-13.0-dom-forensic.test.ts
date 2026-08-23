import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';

describe('CV Extraction Engine 13.0 — DOM & React Hydration Integrity Forensic Suite', () => {
  it('hydrates standard canonical draft to React form customFields without losing user state', () => {
    const rawCv = `Emre Şahin\nemre.sahin@example.com | 0532 999 11 22\nKocaeli / Gebze\nKalite Güvence Müdürü\n\nDENEYİM\nBosch Sanayi A.Ş. - Kalite Güvence Müdürü (2018 - 2024)\n\nEĞİTİM\nKocaeli Üniversitesi - Makine Mühendisliği (Lisans) - 2017\n\nBECERİLER\nISO 9001, IATF 16949, FMEA, Kaizen, 5S`;

    const det = extractDeterministicCv(rawCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical);

    const existingCustomFields = {
      salaryExpectation: '75.000 TL',
      willingToRelocate: 'true',
    };

    const hydrated = buildHydratedCustomFieldsFromCvDraft(
      draft,
      existingCustomFields,
    );

    expect(hydrated.nextCustomFields.salaryExpectation).toBe('75.000 TL');
    expect(hydrated.nextCustomFields.willingToRelocate).toBe('true');
    expect(hydrated.nextCustomFields.primarySector).toBe(canonical.primarySector);
    expect(hydrated.appliedKeys.length).toBeGreaterThanOrEqual(4);
  });

  it('handles niche unmapped roles via "Diğer" enum fallback and desiredRoleOther field', () => {
    const rawCv = `Oğuzhan Kaya\noguz@example.com | 0532 555 44 33\nAnkara / Çankaya\nKuantum Kriptografi Uzmanı\n\nDENEYİM\nKuantum Lab A.Ş. - Kuantum Kriptografi Uzmanı (2020 - 2024)`;

    const det = extractDeterministicCv(rawCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical);

    const hydrated = buildHydratedCustomFieldsFromCvDraft(
      draft,
      {},
    );

    expect(hydrated.nextCustomFields.desiredRoleOther || hydrated.nextCustomFields.desiredRole).toBeDefined();
    expect(hydrated.appliedKeys.length).toBeGreaterThanOrEqual(2);
  });
});
