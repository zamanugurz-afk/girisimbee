import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy, matchCanonicalPosition } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';
import { extractCandidateName, isForbiddenNameCandidate } from './cv-name-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { getAllTaxonomyPositions, getPositionsForSector } from '@/features/candidates/taxonomy/career-taxonomy';

describe('User Reported Acceptance: Name Database Verification & Experience Role Mapping', () => {
  // Requirement 1: Section header variations (Eğ İtim, E ğ i t i m, Eğitim) must NEVER become candidate name
  it('Requirement 1.1: strictly rejects "Eğ İtim", "E ğ i t i m", "Kiş İsel" from being candidate name', () => {
    expect(isForbiddenNameCandidate('Eğ İtim')).toBe(true);
    expect(isForbiddenNameCandidate('E ğ i t i m')).toBe(true);
    expect(isForbiddenNameCandidate('Eğitim')).toBe(true);
    expect(isForbiddenNameCandidate('Egitim')).toBe(true);
    expect(isForbiddenNameCandidate('Kiş İsel')).toBe(true);
    expect(isForbiddenNameCandidate('Den Eyim')).toBe(true);
    expect(isForbiddenNameCandidate('İş Deneyimi')).toBe(true);
  });

  it('Requirement 1.2: accurately extracts "Uğur Zaman" from CV starting with "Eğ İtim" or fractured sections', () => {
    const rawCv = `
Eğ İtim
Marmara Üniversitesi İşletme Yüksek Lisans 2012
Anadolu Üniversitesi İktisat Lisans 2004

İş Deneyimi
Telemarketing ve Ticari Destek Operasyonları Müdürü, IGS Türkiye
Eylül 2025 - Ağustos 2026
Çağrı Merkezi Satış Yönetimi | Yeni Müşteri Kazanımı ve Satış Geliştirme | Kurumsal Müşteri Yönetimi

Alternatif Satış Kanalları Müdürü, GEDİK YATIRIM
Eylül 2023 - Eylül 2025

Kişisel Bilgiler
UĞUR ZAMAN
ugur.zaman@example.com
0532 111 22 33
İstanbul / Maltepe
`;

    const cleanedText = normalizeCvText(rawCv);
    const extractedName = extractCandidateName(cleanedText, 'CV - UĞUR ZAMAN (4).pdf');
    expect(extractedName).toBe('Uğur Zaman');

    const det = extractDeterministicCv(rawCv, 'CV - UĞUR ZAMAN (4).pdf');
    expect(det.fullName).toBe('Uğur Zaman');
  });

  // Requirement 2: Position/Role in experiences MUST be mapped to closest catalog position, or empty string
  it('Requirement 2.1: maps "Telemarketing ve Ticari Destek Operasyonları Müdürü" to closest canonical position', () => {
    const matched = matchCanonicalPosition('Telemarketing ve Ticari Destek Operasyonları Müdürü');
    expect(matched.canonical).toBe('Çağrı Merkezi Operasyon Müdürü');
    const allPositions = getAllTaxonomyPositions();
    expect(allPositions).toContain(matched.canonical);
  });

  it('Requirement 2.2: sets experience role to empty string "" if no close match is found in taxonomy', () => {
    const matched = matchCanonicalPosition('XYZ 123 Bilinmeyen Alakasız Görev 999');
    expect(matched.canonical).toBe('');
  });

  it('Requirement 2.3: extracts companies and canonical roles for all experiences from Uğur Zaman CV', () => {
    const cvText = `
UĞUR ZAMAN
ugur.zaman@example.com
0532 111 22 33
İstanbul / Maltepe

İş Deneyimi
Telemarketing ve Ticari Destek Operasyonları Müdürü, IGS Türkiye
Eylül 2025 - Ağustos 2026
Çağrı Merkezi Satış Yönetimi | Yeni Müşteri Kazanımı ve Satış Geliştirme

Alternatif Satış Kanalları Müdürü, GEDİK YATIRIM
Eylül 2023 - Eylül 2025
Yatırım ürünleri ve alternatif satış kanalları koordinasyonu

Eğitim
Marmara Üniversitesi İşletme Yüksek Lisans 2012
`;

    const det = extractDeterministicCv(cvText, 'CV - UĞUR ZAMAN (4).pdf');
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'CV - UĞUR ZAMAN (4).pdf');
    const hydrated = buildHydratedCustomFieldsFromCvDraft(draft, {});

    expect(hydrated.nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(hydrated.nextCustomFields.primarySector).toBe('Çağrı merkezi');
    expect(hydrated.nextCustomFields.residenceCity).toBe('İstanbul');
    expect(hydrated.nextCustomFields.residenceDistrict).toBe('Maltepe');

    const exps = hydrated.nextCustomFields.experiences as any[];
    expect(exps).toBeDefined();
    expect(exps.length).toBe(2);

    // Exp 1: IGS Türkiye
    expect(exps[0].company).toBe('IGS Türkiye');
    expect(exps[0].role).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(exps[0].startYear).toBe(2025);
    expect(exps[0].endYear).toBe(2026);

    // Exp 2: GEDİK YATIRIM
    expect(exps[1].company).toBe('Gedik Yatırım');
    expect(exps[1].startYear).toBe(2023);
    expect(exps[1].endYear).toBe(2025);
  });
});
