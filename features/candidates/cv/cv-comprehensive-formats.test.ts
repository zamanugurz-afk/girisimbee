import { describe, expect, it } from 'vitest';
import { extractCandidateName, isForbiddenNameCandidate, formatTurkishTitleCase } from './cv-name-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import {
  JOB_SECTOR_OPTIONS,
  EXPERIENCE_LEVELS,
} from '@/features/listings/config/listing-field-options';
import { UGUR_ZAMAN_CV_TEXT } from './cv-real-world-ugur-zaman.test';

describe('CV Import 10-Format Acceptance & Atomic Form Hydration Matrix', () => {
  // Format 1: Name on top line, followed by contact info
  it('Format 1: extracts name on top line followed by phone/email', () => {
    const text = `UĞUR ZAMAN\n0530 000 00 00\nzamanugurz@gmail.com\nİstanbul, Türkiye`;
    expect(extractCandidateName(text)).toBe('Uğur Zaman');
  });

  // Format 2: Under KİŞİSEL BİLGİLER header
  it('Format 2: extracts name under KİŞİSEL BİLGİLER heading', () => {
    const text = `KİŞİSEL BİLGİLER\nUğur Zaman\n0530 000 00 00\nMaltepe, İstanbul`;
    expect(extractCandidateName(text)).toBe('Uğur Zaman');
  });

  // Format 3: Name followed by job title & location
  it('Format 3: extracts name when followed by job title and location', () => {
    const text = `BURAK BATI ÖZDEMİR\nSatış Yöneticisi\nİstanbul / Kadıköy`;
    expect(extractCandidateName(text)).toBe('Burak Batı Özdemir');
  });

  // Format 4: Explicit Ad Soyad label
  it('Format 4: extracts name from explicit "Ad Soyad:" label', () => {
    const text = `ÖZGEÇMİŞ\nAd Soyad: Uğur Zaman\nTelefon: 0530 000 00 00`;
    expect(extractCandidateName(text)).toBe('Uğur Zaman');
  });

  // Format 5: Explicit İsim Soyisim label
  it('Format 5: extracts name from explicit "İsim Soyisim:" label', () => {
    const text = `İsim Soyisim: Rukiye Çelik\nE-posta: rukiye@example.com\nAnkara / Çankaya`;
    expect(extractCandidateName(text)).toBe('Rukiye Çelik');
  });

  // Format 6: Sidebar extracted before name (EĞİTİM / DENEYİM at top)
  it('Format 6: skips sidebar headings (EĞİTİM) and extracts name below', () => {
    const text = `EĞİTİM\nAnadolu Üniversitesi İşletme\n\nDENEYİM\nÇağrı Merkezi Müdürü\n\nUĞUR ZAMAN\n0530 000 00 00`;
    expect(extractCandidateName(text)).toBe('Uğur Zaman');
  });

  // Format 7: Multi-word Turkish names with special characters (Ç, Ğ, İ, Ö, Ş, Ü)
  it('Format 7: preserves Turkish characters in multi-part names', () => {
    const text = `GÜLFEM ŞAYLAN ÇAĞLAYAN\n0500 000 00 00\nİzmir / Bornova`;
    expect(extractCandidateName(text)).toBe('Gülfem Şaylan Çağlayan');
  });

  // Format 8: Title prefix before name (Av., Dr., Müh., Uzm.)
  it('Format 8: handles professional title prefixes (Dr., Müh., Av.)', () => {
    const text = `Dr. Uğur Zaman\nÇağrı Merkezi Direktörü\nİstanbul`;
    expect(extractCandidateName(text)).toBe('Uğur Zaman');
  });

  // Format 9: Full Uğur Zaman CV -> End-to-End Atomic Form Hydration
  it('Format 9: completely and accurately hydrates all fields for Uğur Zaman CV', () => {
    const det = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur_zaman_cv.pdf');

    const { nextCustomFields, nextCoreFields, appliedKeys } = buildHydratedCustomFieldsFromCvDraft(
      draft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    // 1. Full Name
    expect(nextCustomFields.fullName).toBe('Uğur Zaman');

    // 2. Primary Sector (Exact canonical match in JOB_SECTOR_OPTIONS)
    expect(JOB_SECTOR_OPTIONS).toContain(nextCustomFields.primarySector);

    // 3. Desired Role (Exact canonical match in taxonomy)
    expect(nextCustomFields.desiredRole).toBeTruthy();
    expect(nextCustomFields.desiredRole).not.toBe('Diğer');

    // 4. Experience Level
    expect(EXPERIENCE_LEVELS).toContain(nextCustomFields.experienceLevel);

    // 5. City & District
    expect(nextCustomFields.residenceCity).toBe('İstanbul');
    expect(nextCustomFields.residenceDistrict).toBe('Maltepe');
    expect(nextCoreFields.city).toBe('İstanbul');

    // 6. Experiences & Education History
    expect(Array.isArray(nextCustomFields.experiences)).toBe(true);
    expect((nextCustomFields.experiences as any[]).length).toBe(6);
    expect(Array.isArray(nextCustomFields.educationHistory)).toBe(true);
    expect((nextCustomFields.educationHistory as any[]).length).toBe(2);

    // 7. Skills & Summary
    expect(nextCustomFields.professionalSkills).toContain('Satış');
    expect(nextCoreFields.longDescription).toContain('19 yıl');

    // 8. Applied Keys Metadata
    expect(appliedKeys).toContain('fullName');
    expect(appliedKeys).toContain('primarySector');
    expect(appliedKeys).toContain('desiredRole');
    expect(appliedKeys).toContain('residenceCity');
    expect(appliedKeys).toContain('residenceDistrict');
  });

  // Format 10: Headless / Name-less CV
  it('Format 10: strictly returns empty string "" for fullName on headless CV', () => {
    const headlessCv = `EĞİTİM\nİstanbul Üniversitesi Hukuk Fakültesi 2020\n\nİŞ DENEYİMİ\nABC Avukatlık Ortaklığı`;
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
});
