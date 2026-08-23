import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { CvProvenanceTracker } from './cv-provenance';
import { scoreCandidateName, scoreCandidateRole, scoreCandidateSector } from './cv-candidate-scorer';

describe('CV Extraction Engine 11.0 — Complete Field Provenance & Data Contract Suite', () => {
  it('Provenance 1: Generates full traceable audit record with evidence & confidence for each field', () => {
    const rawCv = `
Canan Erdem
canan@example.com | 0532 111 22 33
İstanbul / Beşiktaş
Kıdemli İnsan Kaynakları Uzmanı

ÖZET
8 yıllık kurumsal İK ve yetenek yönetimi tecrübesi.

İŞ DENEYİMİ
Defacto - İnsan Kaynakları Müdürü (2020 - 2024)
Tüm işe alım ve performans süreçlerinin yönetimi.

EĞİTİM
Boğaziçi Üniversitesi - Psikoloji (Lisans) - 2016
`;
    const det = extractDeterministicCv(rawCv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    const tracker = new CvProvenanceTracker('canan_erdem.pdf', 'doc-canan-11');

    // Score and record Full Name
    const nameScoring = scoreCandidateName(canonical.fullName, {
      zone: 'HEADER',
      isTopZone: true,
      lineIndex: 0,
      fullDocText: rawCv,
    });

    tracker.recordField({
      fieldName: 'fullName',
      value: canonical.fullName,
      source: 'PDF_PAGE_1_LINE_1',
      section: 'HEADER',
      resolver: 'NameResolver',
      confidence: nameScoring.confidence,
      evidence: canonical.fullName,
      positiveEvidence: nameScoring.positiveEvidence,
      negativeEvidence: nameScoring.negativeEvidence,
      ambiguity: false,
    });

    // Score and record Role
    const roleScoring = scoreCandidateRole(canonical.primaryRole, {
      zone: 'HEADER',
      hasEmploymentAnchor: true,
      isCurrentJob: true,
    });

    tracker.recordField({
      fieldName: 'primaryRole',
      value: canonical.primaryRole,
      source: 'PDF_PAGE_1_LINE_4',
      section: 'HEADER',
      resolver: 'RoleResolver',
      confidence: roleScoring.confidence,
      evidence: canonical.primaryRole,
      positiveEvidence: roleScoring.positiveEvidence,
      negativeEvidence: roleScoring.negativeEvidence,
      ambiguity: false,
    });

    // Score and record Sector
    const sectorScoring = scoreCandidateSector(canonical.primarySector, {
      zone: 'EXPERIENCE',
      hasExperienceMatch: true,
      matchedCompanyName: 'Defacto',
    });

    tracker.recordField({
      fieldName: 'primarySector',
      value: canonical.primarySector,
      source: 'PDF_PAGE_1_LINE_10',
      section: 'EXPERIENCE',
      resolver: 'SectorResolver',
      confidence: sectorScoring.confidence,
      evidence: 'Defacto - İnsan Kaynakları Müdürü',
      positiveEvidence: sectorScoring.positiveEvidence,
      negativeEvidence: sectorScoring.negativeEvidence,
      ambiguity: false,
    });

    const report = tracker.generateReport(canonical);

    expect(report.fields.fullName.value).toBe('Canan Erdem');
    expect(report.fields.fullName.confidence).toBeGreaterThanOrEqual(0.8);
    expect(report.fields.fullName.positiveEvidence.length).toBeGreaterThan(0);
    expect(report.fields.fullName.negativeEvidence.length).toBe(0);

    expect(report.fields.primaryRole.value).toMatch(/İnsan Kaynakları/i);
    expect(report.fields.primaryRole.confidence).toBeGreaterThanOrEqual(0.7);

    expect(report.fields.primarySector.value).toBeTruthy();
    expect(report.fields.primarySector.confidence).toBeGreaterThanOrEqual(0.7);
    expect(report.qualityScore).toBeGreaterThanOrEqual(0.8);
  });
});
