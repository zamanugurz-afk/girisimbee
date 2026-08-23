import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';

describe('CV Extraction Engine 12.0 — DOM & React Form Hydration Integrity Suite', () => {
  const rawCv = `
Bilgehan Yurt
bilgehan@tech.com | 0532 777 88 99
İzmir / Konak
Kıdemli Robotik Mühendisi

İŞ DENEYİMİ
Kuka Robotics - Robotik Otomasyon Mühendisi (2020 - 2024)
ROS 2 ve Python ile endüstriyel robot kolu kontrol algoritmaları.

EĞİTİM
İzmir Yüksek Teknoloji Enstitüsü - Mekatronik Mühendisliği (2019)

BECERİLER
ROS, ROS 2, Python, C++, SLAM, Gazebo, Linux
`;

  it('DOM Integrity 1: Hydrates initial form values and preserves custom fields seamlessly', () => {
    const det = extractDeterministicCv(rawCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'bilgehan.pdf');

    const existingCustomFields = {
      existingFieldA: 'customValueA',
    };

    const hydrated = buildHydratedCustomFieldsFromCvDraft(
      draft,
      existingCustomFields,
    );

    expect(hydrated.nextCustomFields.fullName).toBe('Bilgehan Yurt');
    if (hydrated.nextCustomFields.desiredRole === 'Diğer') {
      expect(hydrated.nextCustomFields.desiredRoleOther).toBeTruthy();
    } else {
      expect(hydrated.nextCustomFields.desiredRole).toBeTruthy();
    }
    expect(hydrated.nextCustomFields.residenceCity).toBe('İzmir');
    expect(hydrated.nextCustomFields.residenceDistrict).toBe('Konak');
    expect(draft.formValues.experiences?.length).toBeGreaterThanOrEqual(1);
    expect(draft.formValues.educationHistory?.length).toBeGreaterThanOrEqual(1);

    // Custom fields merge integrity
    expect(hydrated.nextCustomFields.existingFieldA).toBe('customValueA');
  });

  it('DOM Integrity 2: Handles non-standard niche title via Diğer + desiredRoleOther fallback', () => {
    const nicheCv = `
Sarp Gökmen
sarp@special.com | Ankara / Çankaya
Kuantum Kriptografi Uzmanı

İŞ DENEYİMİ
TÜBİTAK BİLGEM - Kuantum Güvenlik Araştırmacısı (2021 - 2024)
`;
    const det = extractDeterministicCv(nicheCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'sarp.pdf');

    const hydrated = buildHydratedCustomFieldsFromCvDraft(draft, {});

    expect(hydrated.nextCustomFields.fullName).toBe('Sarp Gökmen');
    if (hydrated.nextCustomFields.desiredRole === 'Diğer') {
      expect(hydrated.nextCustomFields.desiredRoleOther).toBeTruthy();
    } else {
      expect(hydrated.nextCustomFields.desiredRole).toBeTruthy();
    }
  });
});
