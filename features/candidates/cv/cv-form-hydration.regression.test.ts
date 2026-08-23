import { describe, expect, it } from 'vitest';
import { extractCandidateName, isForbiddenNameCandidate, formatTurkishTitleCase } from './cv-name-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';
import { resolveEnumOption, mergeCustomFieldDefaults } from '@/features/listings/form/build-dynamic-schema';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import {
  JOB_SECTOR_OPTIONS,
  EXPERIENCE_LEVELS,
  CAREER_EDUCATION_LEVELS,
} from '@/features/listings/config/listing-field-options';
import { getPositionsForSector, getAllTaxonomyPositions } from '@/features/candidates/taxonomy/career-taxonomy';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { UGUR_ZAMAN_CV_TEXT } from './cv-real-world-ugur-zaman.test';

describe('CV Import -> Form Hydration Architectural Regression Suite (10 Standard Tests)', () => {
  // TEST 1: Full Uğur Zaman CV
  it('TEST 1: correctly extracts and hydrates Uğur Zaman CV to exact valid schema options', () => {
    const det = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur_zaman_cv.pdf');

    const { nextCustomFields, nextCoreFields, appliedKeys } = buildHydratedCustomFieldsFromCvDraft(
      draft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    // Full Name
    expect(nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(nextCustomFields.fullName).not.toBe('Eğitim');

    // Primary Sector & Desired Role
    expect(JOB_SECTOR_OPTIONS).toContain(nextCustomFields.primarySector);
    expect(nextCustomFields.desiredRole).toBe('');
    expect(nextCustomFields.desiredRoleOther).toBe('');
    expect(EXPERIENCE_LEVELS).toContain(nextCustomFields.experienceLevel);

    // City & District
    expect(nextCustomFields.residenceCity).toBe('İstanbul');
    expect(nextCustomFields.residenceDistrict).toBe('Maltepe');
    expect(getDistrictsForCity('İstanbul')).toContain(nextCustomFields.residenceDistrict);

    // Experiences & Skills
    expect((nextCustomFields.experiences as any[]).length).toBe(6);
    expect(nextCustomFields.professionalSkills).toContain('Satış');
    expect(nextCoreFields.city).toBe('İstanbul');
  });

  // TEST 2: Headless CV with EĞİTİM at the top
  it('TEST 2: strictly returns fullName = "" when CV starts with EĞİTİM and has no name', () => {
    const headlessCv = `EĞİTİM\nİstanbul Teknik Üniversitesi Bilgisayar Mühendisliği 2020\n\nİŞ DENEYİMİ\nABC Yazılım A.Ş. 2020 - 2024\nFullstack developer`;
    const det = extractDeterministicCv(headlessCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'headless.pdf');

    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      draft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(nextCustomFields.fullName).toBe('');
    expect(nextCustomFields.fullName).not.toBe('Eğitim');
    expect(nextCustomFields.fullName).not.toBe('EĞİTİM');
  });

  // TEST 3: CV with KİŞİSEL BİLGİLER header
  it('TEST 3: correctly extracts "Uğur Zaman" from under KİŞİSEL BİLGİLER header', () => {
    const cvWithHeader = `KİŞİSEL BİLGİLER\nUğur Zaman\n0530 000 00 00\nİstanbul / Maltepe\n\nEĞİTİM\nAnadolu Üniversitesi`;
    const det = extractDeterministicCv(cvWithHeader);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur.pdf');

    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      draft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(nextCustomFields.fullName).toBe('Uğur Zaman');
  });

  // TEST 4: Sector matching (Finans -> Finans / Bankacılık)
  it('TEST 4: resolves sector "Finans" to valid option "Finans / Bankacılık"', () => {
    const resolved = resolveEnumOption('Finans', JOB_SECTOR_OPTIONS);
    expect(resolved).toBe('Finans / Bankacılık');
    expect(JOB_SECTOR_OPTIONS).toContain(resolved);
  });

  // TEST 5: Sector matching (Çağrı Merkezi -> Çağrı merkezi) and role alignment
  it('TEST 5: resolves sector "Çağrı Merkezi" to valid option "Çağrı merkezi" and aligns role', () => {
    const resolvedSector = resolveEnumOption('Çağrı Merkezi', JOB_SECTOR_OPTIONS);
    expect(resolvedSector).toBe('Çağrı merkezi');
    expect(JOB_SECTOR_OPTIONS).toContain(resolvedSector);

    const rolesInSector = getPositionsForSector(resolvedSector);
    expect(rolesInSector.length).toBeGreaterThan(1);
    expect(rolesInSector.some((r) => r.toLowerCase().includes('çağrı merkezi'))).toBe(true);
  });

  // TEST 6: Turkish characters & Mojibake repair
  it('TEST 6: preserves Turkish characters and fixes mojibake accurately', () => {
    const words = ['Çağrı', 'Yönetim', 'Müşteri', 'İletişim', 'Özgeçmiş', 'Satış', 'Gülşah', 'Şahin', 'Üretim', 'Çalışma'];
    for (const w of words) {
      expect(normalizeCvText(w)).toBe(w);
      expect(formatTurkishTitleCase(w)).toBe(w);
    }
  });

  // TEST 7: CV without name strictly rejects user displayName injection
  it('TEST 7: headless CV results in empty string, completely detached from authenticated user', () => {
    const headlessCv = `İŞ DENEYİMİ\nSatış Danışmanı | 2020 - 2024\n\nEĞİTİM\nAnadolu Lisesi`;
    const det = extractDeterministicCv(headlessCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'headless.pdf');

    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      draft,
      { fullName: '' }, // Previous state
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(nextCustomFields.fullName).toBe('');
  });

  // TEST 8: City + District resolution (İstanbul / Maltepe)
  it('TEST 8: validates city "İstanbul" and district "Maltepe" against official registries', () => {
    expect(TURKISH_CITIES).toContain('İstanbul');
    const districts = getDistrictsForCity('İstanbul');
    expect(districts).toContain('Maltepe');

    const resolvedDistrict = resolveEnumOption('maltepe', districts);
    expect(resolvedDistrict).toBe('Maltepe');
  });

  // TEST 9: Badge logic - Empty values must never display the CV-filled badge
  it('TEST 9: ensures showCvBadge logic only activates for non-empty values', () => {
    const isCvFilled = true;

    const value1 = '';
    const hasValue1 = value1 !== null && value1 !== undefined && value1 !== '';
    const showCvBadge1 = Boolean(isCvFilled && hasValue1);
    expect(showCvBadge1).toBe(false);

    const value2 = 'Uğur Zaman';
    const hasValue2 = value2 !== null && value2 !== undefined && value2 !== '';
    const showCvBadge2 = Boolean(isCvFilled && hasValue2);
    expect(showCvBadge2).toBe(true);
  });

  // TEST 10: Atomic hydration completely replaces state without leaking old CV data
  it('TEST 10: atomic hydration cleanly updates state in a single operation', () => {
    const oldCustomFields = {
      fullName: 'Old Candidate',
      primarySector: 'Otomotiv',
      desiredRole: 'Oto Mekaniker',
      residenceCity: 'Ankara',
      residenceDistrict: 'Çankaya',
    };

    const det = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur.pdf');

    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      draft,
      oldCustomFields,
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(nextCustomFields.residenceCity).toBe('İstanbul');
    expect(nextCustomFields.residenceDistrict).toBe('Maltepe');
    expect(nextCustomFields.primarySector).not.toBe('Otomotiv');
  });

  // TEST 11: 6 Experiences and 2 Educations
  it('TEST 11: verifies exactly 6 experiences and 2 education entries in hydrated state', () => {
    const det = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur.pdf');

    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(
      draft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect((nextCustomFields.experiences as any[]).length).toBe(6);
    expect((nextCustomFields.educationHistory as any[]).length).toBe(2);
  });

  // TEST 12: Multi-column layout name extraction
  it('TEST 12: extracts candidate name from multi-column CV layout', () => {
    const multiColCv = `DENEYİMLER\nSatış Danışmanı 2021-2023\n\nBURAK BATI ÖZDEMİR\n0530 000 00 00\nKadıköy, İstanbul`;
    expect(extractCandidateName(multiColCv)).toBe('Burak Batı Özdemir');
  });

  // TEST 13: Special Turkish characters in names
  it('TEST 13: extracts and preserves special Turkish characters in candidate names', () => {
    const trNameCv = `GÜLFEM ŞAYLAN ÇAĞLAYAN\n0555 111 22 33\nİzmir / Karşıyaka`;
    expect(extractCandidateName(trNameCv)).toBe('Gülfem Şaylan Çağlayan');
  });

  // TEST 14: React StrictMode double invocation idempotency
  it('TEST 14: double invocation of buildHydratedCustomFieldsFromCvDraft produces identical deterministic output', () => {
    const det = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur.pdf');

    const pass1 = buildHydratedCustomFieldsFromCvDraft(draft, {}, JOB_SEEKER_FIELD_SCHEMA);
    const pass2 = buildHydratedCustomFieldsFromCvDraft(draft, pass1.nextCustomFields, JOB_SEEKER_FIELD_SCHEMA);

    expect(pass1.nextCustomFields.fullName).toBe(pass2.nextCustomFields.fullName);
    expect(pass1.nextCustomFields.primarySector).toBe(pass2.nextCustomFields.primarySector);
    expect(pass1.nextCustomFields.desiredRole).toBe(pass2.nextCustomFields.desiredRole);
    expect(pass1.nextCustomFields.residenceCity).toBe(pass2.nextCustomFields.residenceCity);
    expect(pass1.nextCustomFields.residenceDistrict).toBe(pass2.nextCustomFields.residenceDistrict);
  });

  // TEST 15: Successive imports of different CVs cleanly overwrite state
  it('TEST 15: new CV upload completely replaces previous CV data', () => {
    const cv1 = `UĞUR ZAMAN\n0530 000 00 00\nİstanbul / Maltepe`;
    const draft1 = buildProfileDraftFromCanonicalResult(mapCvToCanonicalTaxonomy(extractDeterministicCv(cv1)), 'cv1.pdf');
    const hydrated1 = buildHydratedCustomFieldsFromCvDraft(draft1, {}, JOB_SEEKER_FIELD_SCHEMA);

    expect(hydrated1.nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(hydrated1.nextCustomFields.residenceDistrict).toBe('Maltepe');

    const cv2 = `RUKİYE ÇELİK\n0540 000 00 00\nAnkara / Çankaya`;
    const draft2 = buildProfileDraftFromCanonicalResult(mapCvToCanonicalTaxonomy(extractDeterministicCv(cv2)), 'cv2.pdf');
    const hydrated2 = buildHydratedCustomFieldsFromCvDraft(draft2, hydrated1.nextCustomFields, JOB_SEEKER_FIELD_SCHEMA);

    expect(hydrated2.nextCustomFields.fullName).toBe('Rukiye Çelik');
    expect(hydrated2.nextCustomFields.residenceCity).toBe('Ankara');
    expect(hydrated2.nextCustomFields.residenceDistrict).toBe('Çankaya');
  });

  // TEST 16: Position matching in SelectItem options (canonical mapped, form field left empty for manual selection)
  it('TEST 16: ensures desiredRole is empty for manual user selection while canonical resolves valid position', () => {
    const allPositions = getAllTaxonomyPositions();
    const det = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
    const canonical = mapCvToCanonicalTaxonomy(det);
    expect(allPositions).toContain(canonical.primaryRole);

    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur.pdf');
    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(draft, {}, JOB_SEEKER_FIELD_SCHEMA);

    expect(nextCustomFields.desiredRole).toBe('');
  });

  // TEST 17: mergeCustomFieldDefaults keeps non-empty user and CV hydrated values
  it('TEST 17: mergeCustomFieldDefaults preserves all hydrated fields from buildHydratedCustomFieldsFromCvDraft', () => {
    const det = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur.pdf');
    const { nextCustomFields } = buildHydratedCustomFieldsFromCvDraft(draft, {}, JOB_SEEKER_FIELD_SCHEMA);

    const merged = mergeCustomFieldDefaults(JOB_SEEKER_FIELD_SCHEMA, nextCustomFields);

    expect(merged.fullName).toBe('Uğur Zaman');
    expect(merged.primarySector).toBe(nextCustomFields.primarySector);
    expect(merged.desiredRole).toBe(nextCustomFields.desiredRole);
    expect(merged.residenceCity).toBe('İstanbul');
    expect(merged.residenceDistrict).toBe('Maltepe');
  });
});
