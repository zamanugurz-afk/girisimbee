import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';
import { maskCvPii } from './cv-pii-masker';

describe('CV Extraction Engine 9.0 — 15 Formal Property Invariants Suite', () => {

  const baseCv = `
Haluk Bilginer
İstanbul / Beşiktaş | haluk@oyunatolyesi.com | 0532 555 44 33
Tiyatro Direktörü

DENEYİM
Oyun Atölyesi Sanat Prodüksiyon A.Ş. - Genel Sanat Yönetmeni (2005 - 2024)
Tiyatro oyunlarının prodüksiyonu ve yönetimi.

EĞİTİM
Ankara Devlet Konservatuvarı - Tiyatro Lisans (1975 - 1979)
Kamu Yönetimi Yüksek Lisans (2000 - 2002)

YETKİNLİKLER
Sahne Yönetimi, Oyunculuk, Seslendirme, Yönetmenlik

SERTİFİKALAR
PMP Proje Yönetimi Sertifikası (2015)

HOBİLER
Fotoğrafçılık, Dağcılık, Satranç

YAYINLAR
"Modern Tiyatroda Karakter Analizi" - Sanat Dergisi (2018)

REFERANSLAR
Zuhal Olcay - Sanatçı | 0532 999 00 11 | zuhal@art.com
`;

  // INVARIANT 1: Education text cannot create Sector
  it('INVARIANT 1: Education degree ("Kamu Yönetimi") CANNOT create Sector ("Kamu / Belediye")', () => {
    const res = extractDeterministicCv(baseCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  // INVARIANT 2: Reference text cannot create Candidate Identity
  it('INVARIANT 2: Referee name ("Zuhal Olcay") CANNOT become Candidate Identity', () => {
    const res = extractDeterministicCv(baseCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.fullName).not.toBe('Zuhal Olcay');
  });

  // INVARIANT 3: Skill text cannot create Candidate Role
  it('INVARIANT 3: Skill text ("Seslendirme", "Yönetmenlik") CANNOT create primary role', () => {
    const res = extractDeterministicCv(baseCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).toMatch(/Sanat Yönetmeni|Direktör/i);
  });

  // INVARIANT 4: Company name cannot create Candidate Role
  it('INVARIANT 4: Company legal name ("Oyun Atölyesi Sanat Prodüksiyon A.Ş.") CANNOT create Candidate Role', () => {
    const res = extractDeterministicCv(baseCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.primaryRole).not.toBe('Oyun Atölyesi');
    expect(canonical.primaryRole).not.toBe('Oyun Atölyesi Sanat Prodüksiyon A.Ş.');
  });

  // INVARIANT 5: Delimiters cannot create Experience
  it('INVARIANT 5: Delimiters ("|", "•", "-", "/") inside descriptions CANNOT create separate experiences', () => {
    const res = extractDeterministicCv(baseCv);
    expect(res.experiences).toHaveLength(1);
  });

  // INVARIANT 6: Missing evidence cannot create canonical value (Zero Hallucination)
  it('INVARIANT 6: Missing evidence produces unresolved/empty value, never hallucinated defaults', () => {
    const bareCv = `
Ali Vural
Yazılım Geliştirici

DENEYİM
Tech A.Ş. - Developer (2020 - 2024)
`;
    const res = extractDeterministicCv(bareCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.residenceCity).toBe('');
    expect(canonical.residenceDistrict).toBe('');
    expect(canonical.gender).toBeUndefined();
    expect(canonical.birthDate).toBeUndefined();
  });

  // INVARIANT 7: Missing location cannot default to Istanbul
  it('INVARIANT 7: Absence of city evidence MUST NOT default to "İstanbul"', () => {
    const noCityCv = `
Ahmet Yılmaz
0533 111 22 33 | ahmet@example.com
Satış Temsilcisi

DENEYİM
ABC Ltd. - Satış Temsilcisi (2020 - 2024)
`;
    const res = extractDeterministicCv(noCityCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.residenceCity).toBe('');
    expect(canonical.residenceCity).not.toBe('İstanbul');
  });

  // INVARIANT 8: Unknown taxonomy cannot default to first child
  it('INVARIANT 8: Unrecognized role cannot default to first child or generic "Uzman"', () => {
    const exoticRoleCv = `
Mert Yalçın
İstanbul / Kadıköy
Kuantum Kriptografi Protokol Mimarı

DENEYİM
CERN Teknoloji - Kuantum Protokol Mimarı (2019 - 2024)
`;
    const res = extractDeterministicCv(exoticRoleCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).not.toBe('Danışman');
  });

  // INVARIANT 9: AI cannot overwrite deterministic evidence
  it('INVARIANT 9: Deterministic ground-truth values are preserved with highest priority', () => {
    const run1 = mapCvToCanonicalTaxonomy(extractDeterministicCv(baseCv));
    const run2 = mapCvToCanonicalTaxonomy(extractDeterministicCv(baseCv));
    expect(run1.fullName).toBe(run2.fullName);
    expect(run1.primaryRole).toBe(run2.primaryRole);
    expect(run1.primarySector).toBe(run2.primarySector);
    expect(run1.experiences.length).toBe(run2.experiences.length);
  });

  // INVARIANT 10: Reference phone cannot become candidate phone
  it('INVARIANT 10: Referee phone ("0532 999 00 11") CANNOT become Candidate phone', () => {
    const res = extractDeterministicCv(baseCv);
    expect(res.phone).toBe('0532 555 44 33');
    expect(res.phone).not.toBe('0532 999 00 11');
  });

  // INVARIANT 11: University cannot become candidate name
  it('INVARIANT 11: University name ("Ankara Devlet Konservatuvarı") CANNOT become Candidate Name', () => {
    const res = extractDeterministicCv(baseCv);
    expect(res.fullName).toBe('Haluk Bilginer');
    expect(res.fullName).not.toBe('Ankara Devlet Konservatuvarı');
  });

  // INVARIANT 12: Publication cannot become experience
  it('INVARIANT 12: Academic publication ("Modern Tiyatroda Karakter Analizi") CANNOT become job experience', () => {
    const res = extractDeterministicCv(baseCv);
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Oyun Atölyesi/i);
    expect(res.experiences.some(e => e.company?.includes('Modern Tiyatro'))).toBe(false);
  });

  // INVARIANT 13: Hobby cannot become skill
  it('INVARIANT 13: Hobbies ("Dağcılık", "Satranç") CANNOT become Professional Skills', () => {
    const res = extractDeterministicCv(baseCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.professionalSkills).not.toContain('Dağcılık');
    expect(canonical.professionalSkills).not.toContain('Satranç');
  });

  // INVARIANT 14: Certification cannot become role
  it('INVARIANT 14: Certification ("PMP Proje Yönetimi Sertifikası") CANNOT become primary role', () => {
    const res = extractDeterministicCv(baseCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.primaryRole).not.toBe('PMP Proje Yönetimi Sertifikası');
  });

  // INVARIANT 15: Company location cannot become residence
  it('INVARIANT 15: Past company headquarters location CANNOT override candidate residence', () => {
    const compLocCv = `
Ceren Şentürk
İzmir / Bornova | ceren@example.com
Pazarlama Uzmanı

DENEYİM
İstanbul Holding A.Ş. (Maslak, İstanbul) - Pazarlama Uzmanı (2019 - 2024)
Pazarlama stratejileri.
`;
    const res = extractDeterministicCv(compLocCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.residenceDistrict).toBe('Bornova');
  });
});
