import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvFieldProvenanceRecord } from './cv-evidence-graph';

describe('CV Extraction Engine 13.0 — Field Evidence Contract & Quality Score Suite', () => {
  it('enforces complete audit traceability and provenance contract on all fields', () => {
    const cvText = `Burcu Güler\nburcu@example.com | 0532 999 11 22\nAnkara / Çankaya\nİnsan Kaynakları Uzmanı\n\nÖZET\nKurumsal şirketlerde yetenek yönetimi ve bordro alanında 5 yıl deneyim.\n\nDENEYİM\nGlobal A.Ş. - İnsan Kaynakları Uzmanı (2019 - 2024)\n• İşe alım ve bordrolama\n\nEĞİTİM\nHacettepe Üniversitesi - Psikoloji (Lisans) - 2018\n\nBECERİLER\nBordro, SAP HR, İşe Alım, Mülakat`;

    const det = extractDeterministicCv(cvText);
    const canonical = mapCvToCanonicalTaxonomy(det);

    // 1. Check Field Resolution Status contract
    expect(canonical.fieldResolutionStatus).toBeDefined();
    expect(canonical.fieldResolutionStatus?.fullName).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.primaryRole).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.primarySector).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.residenceCity).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.experiences).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.educationList).toBe('RESOLVED');
    expect(canonical.fieldResolutionStatus?.skills).toBe('RESOLVED');

    // 2. Check Provenance Record creation
    const provRecord = buildCvFieldProvenanceRecord({
      field: 'primaryRole',
      rawCandidateValue: canonical.primaryRole,
      canonicalValue: canonical.primaryRole,
      sourceZone: 'EXPERIENCE',
      sourceTextSnippet: 'Global A.Ş. - İnsan Kaynakları Uzmanı (2019 - 2024)',
      resolverName: 'RoleResolver',
      scoringScore: 90,
      confidenceScore: 0.95,
    });

    expect(provRecord.status).toBe('RESOLVED');
    expect(provRecord.field).toBe('primaryRole');
    expect(provRecord.sourceZone).toBe('EXPERIENCE');
    expect(provRecord.resolverName).toBe('RoleResolver');
    expect(provRecord.confidenceScore).toBeGreaterThanOrEqual(0.9);
  });

  it('marks ungrounded missing fields as NOT_FOUND instead of inventing data', () => {
    const cvText = `Gizem Aksoy\n0533 123 45 67\n`;
    const det = extractDeterministicCv(cvText);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fieldResolutionStatus?.primaryRole).toBe('NOT_FOUND');
    expect(canonical.fieldResolutionStatus?.primarySector).toBe('NOT_FOUND');
    expect(canonical.fieldResolutionStatus?.residenceCity).toBe('NOT_FOUND');
    expect(canonical.residenceCity || '').toBe('');
  });
});
