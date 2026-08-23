import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { CvProvenanceTracker } from './cv-provenance';
import { scoreCandidateName, scoreCandidateRole, scoreCandidateSector } from './cv-candidate-scorer';

describe('CV Extraction Engine 12.0 — Field Provenance Contract & Resolution Status Suite', () => {
  const sampleCv = `
Kaan Demir
kaan.demir@techcorp.com | 0532 555 44 33
İstanbul / Beşiktaş
Kıdemli Veri Mühendisi

ÖZET
8 yıllık büyük veri mimarisi ve ETL pipeline yönetimi tecrübesi.

İŞ DENEYİMİ
Getir - Veri Mühendisliği Müdürü (2020 - 2024)
Spark, Kafka ve Snowflake ile veri gölü mimarisi.

Trendyol - Veri Mühendisi (2017 - 2020)
Gerçek zamanlı akış işleme.

EĞİTİM
Boğaziçi Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2016

YETKİNLİKLER
Python, Scala, Apache Spark, Kafka, Snowflake, SQL
`;

  it('Provenance 1: Every canonical field produces a complete traceable provenance record', () => {
    const det = extractDeterministicCv(sampleCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const tracker = new CvProvenanceTracker('kaan_demir.pdf', 'doc-kaan-12');

    // Score and record Name
    const nameScore = scoreCandidateName(canonical.fullName || '', {
      zone: 'HEADER',
      isTopZone: true,
      lineIndex: 0,
      fullDocText: sampleCv,
    });
    tracker.recordField({
      fieldName: 'fullName',
      value: canonical.fullName,
      source: 'PAGE_1_LINE_1',
      section: 'HEADER',
      resolver: 'NameResolver',
      confidence: nameScore.confidence,
      evidence: canonical.fullName || '',
      positiveEvidence: nameScore.positiveEvidence,
      negativeEvidence: nameScore.negativeEvidence,
      ambiguity: false,
    });

    // Score and record Role
    const roleScore = scoreCandidateRole(canonical.primaryRole, {
      zone: 'HEADER',
      hasEmploymentAnchor: true,
      isCurrentJob: true,
    });
    tracker.recordField({
      fieldName: 'primaryRole',
      value: canonical.primaryRole,
      source: 'PAGE_1_LINE_4',
      section: 'HEADER',
      resolver: 'RoleResolver',
      confidence: roleScore.confidence,
      evidence: canonical.primaryRole,
      positiveEvidence: roleScore.positiveEvidence,
      negativeEvidence: roleScore.negativeEvidence,
      ambiguity: false,
    });

    // Score and record Sector
    const sectorScore = scoreCandidateSector(canonical.primarySector, {
      zone: 'EXPERIENCE',
      hasExperienceMatch: true,
      matchedCompanyName: 'Getir',
    });
    tracker.recordField({
      fieldName: 'primarySector',
      value: canonical.primarySector,
      source: 'PAGE_1_LINE_10',
      section: 'EXPERIENCE',
      resolver: 'SectorResolver',
      confidence: sectorScore.confidence,
      evidence: 'Getir - Veri Mühendisliği Müdürü',
      positiveEvidence: sectorScore.positiveEvidence,
      negativeEvidence: sectorScore.negativeEvidence,
      ambiguity: false,
    });

    const report = tracker.generateReport(canonical);

    expect(report.documentId).toBe('doc-kaan-12');
    expect(report.fileName).toBe('kaan_demir.pdf');
    expect(report.fields.fullName.value).toBe('Kaan Demir');
    expect(report.fields.fullName.confidence).toBeGreaterThanOrEqual(0.8);
    expect(report.fields.fullName.positiveEvidence.length).toBeGreaterThan(0);
    expect(report.fields.fullName.negativeEvidence.length).toBe(0);

    expect(report.fields.primaryRole.value).toMatch(/Veri Mühendis/i);
    expect(report.fields.primaryRole.confidence).toBeGreaterThanOrEqual(0.7);

    expect(report.fields.primarySector.value).toMatch(/Bilişim|Yapay zeka|Veri/i);
    expect(report.qualityScore).toBeGreaterThanOrEqual(0.9);
  });

  it('Provenance 2: Field resolution status semantics are correctly emitted (RESOLVED vs NOT_FOUND)', () => {
    const det = extractDeterministicCv(sampleCv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fieldResolutionStatus).toBeDefined();
    expect(canonical.fieldResolutionStatus?.fullName).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.primaryRole).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.primarySector).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.residenceCity).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.experiences).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.educationList).toBe('RESOLVED');
  });

  it('Provenance 3: Headless and empty document yields NOT_FOUND status without hallucinating', () => {
    const emptyCv = `ÖZET\nKariyerimde yeni fırsatlar arıyorum.`;
    const det = extractDeterministicCv(emptyCv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fieldResolutionStatus?.fullName).toBe('NOT_FOUND');
    expect(canonical.fieldResolutionStatus?.residenceCity).toBe('NOT_FOUND');
    expect(canonical.fieldResolutionStatus?.experiences).toBe('NOT_FOUND');
    expect(canonical.fieldResolutionStatus?.educationList).toBe('NOT_FOUND');
  });
});
