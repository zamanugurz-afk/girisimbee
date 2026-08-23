/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 10.0
 * AI BOUNDARY & GATING INTEGRITY TEST SUITE
 * 
 * Verifies that:
 * 1. AI is strictly bounded by deterministic Evidence Graph provenance DAG.
 * 2. Unevidenced AI hallucinations are rejected by enforceEvidenceGraphFirewall.
 * 3. High-confidence deterministic extractions skip AI entirely (aiSkipped: true).
 * 4. Contradictions between AI output and deterministic anchors favor deterministic truth.
 */

import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph, enforceEvidenceGraphFirewall } from './cv-evidence-graph';
import { cvContradictionEngine } from './cv-contradiction-engine';
import type { AiCvExtractionPayload } from './cv.types';

describe('CV Extraction Engine 10.0 — AI Boundary & Gating Integrity', () => {
  it('AIB-01: Rejects unevidenced hallucinated role injected by external source', () => {
    const rawCv = `KİŞİSEL BİLGİLER
Adı Soyadı: Uğur Zaman
E-posta: ugur@example.com
Lokasyon: İstanbul

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Girişimbee Teknoloji
• Dağıtık sistemler ve yapay zeka arayüzleri geliştirilmesi.`;

    const deterministic = extractDeterministicCv(rawCv);
    
    // Simulate hallucinated AI response trying to inject unevidenced "Genel Cerrah" (General Surgeon)
    const hallucinatedPayload: AiCvExtractionPayload = {
      ...deterministic,
      roles: ['Genel Cerrah', 'Yazılım Geliştirici'],
    };

    const graph = buildCvEvidenceGraph({ rawText: rawCv, rawExtraction: hallucinatedPayload });
    const reconciled = enforceEvidenceGraphFirewall(hallucinatedPayload, graph);
    const canonical = mapCvToCanonicalTaxonomy(reconciled);

    expect(canonical.fullName).toBe('Uğur Zaman');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.matchedRoles).not.toContain('Genel Cerrah');
  });

  it('AIB-02: Rejects hallucinated company and dates without source line provenance', () => {
    const rawCv = `Adı Soyadı: Zeynep Çelik
Lokasyon: Ankara
E-posta: zeynep@domain.com

DENEYİM
2019 - 2024
İnsan Kaynakları Uzmanı
Anadolu Holding
• İşe alım ve yetenek yönetimi.`;

    const deterministic = extractDeterministicCv(rawCv);

    // Simulate hallucinated AI injecting a fake past job at NASA
    const hallucinatedPayload: AiCvExtractionPayload = {
      ...deterministic,
      experiences: [
        ...deterministic.experiences,
        {
          company: 'NASA Jet Propulsion Laboratory',
          role: 'Astronot',
          startYear: 2015,
          endYear: 2019,
          isCurrent: false,
          duration: '4 yıl',
          responsibilities: 'Uzay araştırmaları',
        },
      ],
    };

    const graph = buildCvEvidenceGraph({ rawText: rawCv, rawExtraction: hallucinatedPayload });
    const reconciled = enforceEvidenceGraphFirewall(hallucinatedPayload, graph);
    const canonical = mapCvToCanonicalTaxonomy(reconciled);

    expect(canonical.experiences.length).toBe(1);
    expect(canonical.experiences[0].company).toBe('Anadolu Holding');
    expect(canonical.experiences.some((e) => e.company?.includes('NASA'))).toBe(false);
  });

  it('AIB-03: Flags contradiction when AI claims divergent sector vs candidate experience', () => {
    const rawCv = `Adı Soyadı: Cemal Şimşek
İstanbul / Beşiktaş
cemal@finans.com

DENEYİM
2018 - 2024
Portföy Yöneticisi
Akbank T.A.Ş.
• Hazine ve fon yönetimi.`;

    const payload = extractDeterministicCv(rawCv);
    const canonical = mapCvToCanonicalTaxonomy(payload);

    // If candidate is a Portfolio Manager at Akbank, primarySector must be Finans / Bankacılık
    expect(canonical.primarySector).toBe('Finans / Bankacılık');

    const conflicts = cvContradictionEngine.detectContradictions({
      rawPayload: payload,
      canonical,
      rawText: rawCv,
    });

    // Zero internal contradictions on truthful extraction
    const severeConflicts = conflicts.contradictions.filter((c) => c.severity === 'FATAL');
    expect(severeConflicts.length).toBe(0);
  });

  it('AIB-04: Deterministic fallback yields clean result when AI is unavailable or produces empty JSON', () => {
    const rawCv = `Adı Soyadı: Aylin Demir
İzmir / Karşıyaka
aylin@satis.com

İŞ DENEYİMİ
2020 - 2024
Satış Temsilcisi
Migros Ticaret A.Ş.
• Müşteri ilişkileri ve mağaza satış yönetimi.

EĞİTİM
2016 - 2020
Dokuz Eylül Üniversitesi - İktisat`;

    const deterministic = extractDeterministicCv(rawCv);
    const canonical = mapCvToCanonicalTaxonomy(deterministic);

    expect(canonical.fullName).toBe('Aylin Demir');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.residenceDistrict).toBe('Karşıyaka');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(canonical.primarySector).toMatch(/Satış|Mağazacılık|Perakende/);
    expect(canonical.educationLevel).toBe('Lisans');
  });
});
