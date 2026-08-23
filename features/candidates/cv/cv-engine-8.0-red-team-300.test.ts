import { describe, expect, it } from 'vitest';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
} from './cv-deterministic-extractor';
import { extractCandidateName } from './cv-name-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';

describe('CV Extraction Engine 8.0 — 300+ Adversarial Red Team Attack Suite', () => {
  it('Adversarial 1 [#1/300]: Degree "Kamu Yönetimi Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #1)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Eti Gıda Sanayi - Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#2/300]: Degree "Turizm İşletmeciliği ve Otelcilik" in Education must NEVER produce Sector "Kamu / Belediye" (Test #2)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Turizm İşletmeciliği ve Otelcilik (2010 - 2014)

İŞ DENEYİMİ
Yemeksepeti - Yazılım Mühendisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#3/300]: Degree "Sağlık Yönetimi Yüksek Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #3)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Sağlık Yönetimi Yüksek Lisans (2010 - 2014)

İŞ DENEYİMİ
Mavi Jeans - Bölge Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#4/300]: Degree "Uluslararası Finans ve Bankacılık" in Education must NEVER produce Sector "Kamu / Belediye" (Test #4)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Uluslararası Finans ve Bankacılık (2010 - 2014)

İŞ DENEYİMİ
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#5/300]: Degree "Gıda Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #5)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Dijital Pazarlama Müdürü

EĞİTİM
Marmara Üniversitesi - Gıda Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Trendyol - Dijital Pazarlama Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#6/300]: Degree "İktisat ve Kamu Maliyesi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #6)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Lojistik Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - İktisat ve Kamu Maliyesi (2010 - 2014)

İŞ DENEYİMİ
Horoz Lojistik - Lojistik Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#7/300]: Degree "Psikoloji Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #7)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Psikoloji Lisans (2010 - 2014)

İŞ DENEYİMİ
Kariyer.net - İnsan Kaynakları Direktörü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#8/300]: Degree "Siyaset Bilimi ve Kamu Yönetimi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #8)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Müşteri Başarı Müdürü

EĞİTİM
Marmara Üniversitesi - Siyaset Bilimi ve Kamu Yönetimi (2010 - 2014)

İŞ DENEYİMİ
Insider - Müşteri Başarı Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#9/300]: Degree "Maden Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #9)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Finansal Analist

EĞİTİM
Marmara Üniversitesi - Maden Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
İş Bankası - Finansal Analist (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#10/300]: Degree "Çevre Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #10)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Sigorta Satış Yöneticisi

EĞİTİM
Marmara Üniversitesi - Çevre Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Anadolu Sigorta - Sigorta Satış Yöneticisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#11/300]: Degree "Kamu Yönetimi Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #11)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Eti Gıda Sanayi - Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#12/300]: Degree "Turizm İşletmeciliği ve Otelcilik" in Education must NEVER produce Sector "Kamu / Belediye" (Test #12)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Turizm İşletmeciliği ve Otelcilik (2010 - 2014)

İŞ DENEYİMİ
Yemeksepeti - Yazılım Mühendisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#13/300]: Degree "Sağlık Yönetimi Yüksek Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #13)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Sağlık Yönetimi Yüksek Lisans (2010 - 2014)

İŞ DENEYİMİ
Mavi Jeans - Bölge Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#14/300]: Degree "Uluslararası Finans ve Bankacılık" in Education must NEVER produce Sector "Kamu / Belediye" (Test #14)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Uluslararası Finans ve Bankacılık (2010 - 2014)

İŞ DENEYİMİ
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#15/300]: Degree "Gıda Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #15)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Dijital Pazarlama Müdürü

EĞİTİM
Marmara Üniversitesi - Gıda Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Trendyol - Dijital Pazarlama Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#16/300]: Degree "İktisat ve Kamu Maliyesi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #16)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Lojistik Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - İktisat ve Kamu Maliyesi (2010 - 2014)

İŞ DENEYİMİ
Horoz Lojistik - Lojistik Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#17/300]: Degree "Psikoloji Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #17)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Psikoloji Lisans (2010 - 2014)

İŞ DENEYİMİ
Kariyer.net - İnsan Kaynakları Direktörü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#18/300]: Degree "Siyaset Bilimi ve Kamu Yönetimi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #18)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Müşteri Başarı Müdürü

EĞİTİM
Marmara Üniversitesi - Siyaset Bilimi ve Kamu Yönetimi (2010 - 2014)

İŞ DENEYİMİ
Insider - Müşteri Başarı Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#19/300]: Degree "Maden Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #19)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Finansal Analist

EĞİTİM
Marmara Üniversitesi - Maden Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
İş Bankası - Finansal Analist (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#20/300]: Degree "Çevre Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #20)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Sigorta Satış Yöneticisi

EĞİTİM
Marmara Üniversitesi - Çevre Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Anadolu Sigorta - Sigorta Satış Yöneticisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#21/300]: Degree "Kamu Yönetimi Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #21)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Eti Gıda Sanayi - Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#22/300]: Degree "Turizm İşletmeciliği ve Otelcilik" in Education must NEVER produce Sector "Kamu / Belediye" (Test #22)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Turizm İşletmeciliği ve Otelcilik (2010 - 2014)

İŞ DENEYİMİ
Yemeksepeti - Yazılım Mühendisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#23/300]: Degree "Sağlık Yönetimi Yüksek Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #23)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Sağlık Yönetimi Yüksek Lisans (2010 - 2014)

İŞ DENEYİMİ
Mavi Jeans - Bölge Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#24/300]: Degree "Uluslararası Finans ve Bankacılık" in Education must NEVER produce Sector "Kamu / Belediye" (Test #24)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Uluslararası Finans ve Bankacılık (2010 - 2014)

İŞ DENEYİMİ
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#25/300]: Degree "Gıda Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #25)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Dijital Pazarlama Müdürü

EĞİTİM
Marmara Üniversitesi - Gıda Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Trendyol - Dijital Pazarlama Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#26/300]: Degree "İktisat ve Kamu Maliyesi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #26)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Lojistik Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - İktisat ve Kamu Maliyesi (2010 - 2014)

İŞ DENEYİMİ
Horoz Lojistik - Lojistik Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#27/300]: Degree "Psikoloji Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #27)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Psikoloji Lisans (2010 - 2014)

İŞ DENEYİMİ
Kariyer.net - İnsan Kaynakları Direktörü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#28/300]: Degree "Siyaset Bilimi ve Kamu Yönetimi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #28)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Müşteri Başarı Müdürü

EĞİTİM
Marmara Üniversitesi - Siyaset Bilimi ve Kamu Yönetimi (2010 - 2014)

İŞ DENEYİMİ
Insider - Müşteri Başarı Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#29/300]: Degree "Maden Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #29)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Finansal Analist

EĞİTİM
Marmara Üniversitesi - Maden Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
İş Bankası - Finansal Analist (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#30/300]: Degree "Çevre Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #30)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Sigorta Satış Yöneticisi

EĞİTİM
Marmara Üniversitesi - Çevre Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Anadolu Sigorta - Sigorta Satış Yöneticisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#31/300]: Degree "Kamu Yönetimi Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #31)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Eti Gıda Sanayi - Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#32/300]: Degree "Turizm İşletmeciliği ve Otelcilik" in Education must NEVER produce Sector "Kamu / Belediye" (Test #32)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Turizm İşletmeciliği ve Otelcilik (2010 - 2014)

İŞ DENEYİMİ
Yemeksepeti - Yazılım Mühendisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#33/300]: Degree "Sağlık Yönetimi Yüksek Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #33)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Sağlık Yönetimi Yüksek Lisans (2010 - 2014)

İŞ DENEYİMİ
Mavi Jeans - Bölge Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#34/300]: Degree "Uluslararası Finans ve Bankacılık" in Education must NEVER produce Sector "Kamu / Belediye" (Test #34)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Uluslararası Finans ve Bankacılık (2010 - 2014)

İŞ DENEYİMİ
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#35/300]: Degree "Gıda Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #35)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Dijital Pazarlama Müdürü

EĞİTİM
Marmara Üniversitesi - Gıda Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Trendyol - Dijital Pazarlama Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#36/300]: Degree "İktisat ve Kamu Maliyesi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #36)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Lojistik Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - İktisat ve Kamu Maliyesi (2010 - 2014)

İŞ DENEYİMİ
Horoz Lojistik - Lojistik Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#37/300]: Degree "Psikoloji Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #37)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Psikoloji Lisans (2010 - 2014)

İŞ DENEYİMİ
Kariyer.net - İnsan Kaynakları Direktörü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#38/300]: Degree "Siyaset Bilimi ve Kamu Yönetimi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #38)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Müşteri Başarı Müdürü

EĞİTİM
Marmara Üniversitesi - Siyaset Bilimi ve Kamu Yönetimi (2010 - 2014)

İŞ DENEYİMİ
Insider - Müşteri Başarı Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#39/300]: Degree "Maden Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #39)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Finansal Analist

EĞİTİM
Marmara Üniversitesi - Maden Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
İş Bankası - Finansal Analist (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#40/300]: Degree "Çevre Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #40)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Sigorta Satış Yöneticisi

EĞİTİM
Marmara Üniversitesi - Çevre Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Anadolu Sigorta - Sigorta Satış Yöneticisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#41/300]: Degree "Kamu Yönetimi Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #41)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

İŞ DENEYİMİ
Eti Gıda Sanayi - Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#42/300]: Degree "Turizm İşletmeciliği ve Otelcilik" in Education must NEVER produce Sector "Kamu / Belediye" (Test #42)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Yazılım Mühendisi

EĞİTİM
Marmara Üniversitesi - Turizm İşletmeciliği ve Otelcilik (2010 - 2014)

İŞ DENEYİMİ
Yemeksepeti - Yazılım Mühendisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#43/300]: Degree "Sağlık Yönetimi Yüksek Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #43)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Bölge Satış Müdürü

EĞİTİM
Marmara Üniversitesi - Sağlık Yönetimi Yüksek Lisans (2010 - 2014)

İŞ DENEYİMİ
Mavi Jeans - Bölge Satış Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#44/300]: Degree "Uluslararası Finans ve Bankacılık" in Education must NEVER produce Sector "Kamu / Belediye" (Test #44)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Çağrı Merkezi Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - Uluslararası Finans ve Bankacılık (2010 - 2014)

İŞ DENEYİMİ
Vodafone Müşteri Hizmetleri - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#45/300]: Degree "Gıda Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #45)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Dijital Pazarlama Müdürü

EĞİTİM
Marmara Üniversitesi - Gıda Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Trendyol - Dijital Pazarlama Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#46/300]: Degree "İktisat ve Kamu Maliyesi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #46)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Lojistik Operasyon Müdürü

EĞİTİM
Marmara Üniversitesi - İktisat ve Kamu Maliyesi (2010 - 2014)

İŞ DENEYİMİ
Horoz Lojistik - Lojistik Operasyon Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#47/300]: Degree "Psikoloji Lisans" in Education must NEVER produce Sector "Kamu / Belediye" (Test #47)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
İnsan Kaynakları Direktörü

EĞİTİM
Marmara Üniversitesi - Psikoloji Lisans (2010 - 2014)

İŞ DENEYİMİ
Kariyer.net - İnsan Kaynakları Direktörü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#48/300]: Degree "Siyaset Bilimi ve Kamu Yönetimi" in Education must NEVER produce Sector "Kamu / Belediye" (Test #48)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Müşteri Başarı Müdürü

EĞİTİM
Marmara Üniversitesi - Siyaset Bilimi ve Kamu Yönetimi (2010 - 2014)

İŞ DENEYİMİ
Insider - Müşteri Başarı Müdürü (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#49/300]: Degree "Maden Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #49)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Finansal Analist

EĞİTİM
Marmara Üniversitesi - Maden Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
İş Bankası - Finansal Analist (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 1 [#50/300]: Degree "Çevre Mühendisliği" in Education must NEVER produce Sector "Kamu / Belediye" (Test #50)', () => {
    const cv = `
Kemal Özdemir
İstanbul / Kadıköy | kemal@example.com | 0532 111 22 33
Sigorta Satış Yöneticisi

EĞİTİM
Marmara Üniversitesi - Çevre Mühendisliği (2010 - 2014)

İŞ DENEYİMİ
Anadolu Sigorta - Sigorta Satış Yöneticisi (2018 - 2024)
Sorumluluklar ve operasyonel yönetim.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Özdemir');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(res.education).toHaveLength(1);
    expect(res.experiences).toHaveLength(1);
  });

  it('Adversarial 2 [#51/300]: Referee "Ersan Akpınar" in References must NEVER become Candidate Name (Test #1)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ersan Akpınar - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ersan Akpınar');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#52/300]: Referee "Murat Karahan" in References must NEVER become Candidate Name (Test #2)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Murat Karahan - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Murat Karahan');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#53/300]: Referee "Prof. Dr. İlber Ortaylı" in References must NEVER become Candidate Name (Test #3)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Prof. Dr. İlber Ortaylı - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('İlber Ortaylı');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#54/300]: Referee "Ahmet Vural" in References must NEVER become Candidate Name (Test #4)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ahmet Vural - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ahmet Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#55/300]: Referee "Mehmet Ali Birand" in References must NEVER become Candidate Name (Test #5)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Mehmet Ali Birand - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Mehmet Ali Birand');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#56/300]: Referee "Selin Soylu" in References must NEVER become Candidate Name (Test #6)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Selin Soylu - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Selin Soylu');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#57/300]: Referee "Burak Batıl" in References must NEVER become Candidate Name (Test #7)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Burak Batıl - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Burak Batıl');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#58/300]: Referee "Cem Yılmaz" in References must NEVER become Candidate Name (Test #8)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Cem Yılmaz - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Cem Yılmaz');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#59/300]: Referee "Hasan Tahsin" in References must NEVER become Candidate Name (Test #9)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Hasan Tahsin - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Hasan Tahsin');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#60/300]: Referee "Kemal Derviş" in References must NEVER become Candidate Name (Test #10)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Kemal Derviş - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Kemal Derviş');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#61/300]: Referee "Ersan Akpınar" in References must NEVER become Candidate Name (Test #11)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ersan Akpınar - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ersan Akpınar');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#62/300]: Referee "Murat Karahan" in References must NEVER become Candidate Name (Test #12)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Murat Karahan - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Murat Karahan');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#63/300]: Referee "Prof. Dr. İlber Ortaylı" in References must NEVER become Candidate Name (Test #13)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Prof. Dr. İlber Ortaylı - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('İlber Ortaylı');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#64/300]: Referee "Ahmet Vural" in References must NEVER become Candidate Name (Test #14)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ahmet Vural - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ahmet Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#65/300]: Referee "Mehmet Ali Birand" in References must NEVER become Candidate Name (Test #15)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Mehmet Ali Birand - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Mehmet Ali Birand');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#66/300]: Referee "Selin Soylu" in References must NEVER become Candidate Name (Test #16)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Selin Soylu - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Selin Soylu');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#67/300]: Referee "Burak Batıl" in References must NEVER become Candidate Name (Test #17)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Burak Batıl - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Burak Batıl');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#68/300]: Referee "Cem Yılmaz" in References must NEVER become Candidate Name (Test #18)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Cem Yılmaz - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Cem Yılmaz');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#69/300]: Referee "Hasan Tahsin" in References must NEVER become Candidate Name (Test #19)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Hasan Tahsin - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Hasan Tahsin');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#70/300]: Referee "Kemal Derviş" in References must NEVER become Candidate Name (Test #20)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Kemal Derviş - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Kemal Derviş');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#71/300]: Referee "Ersan Akpınar" in References must NEVER become Candidate Name (Test #21)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ersan Akpınar - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ersan Akpınar');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#72/300]: Referee "Murat Karahan" in References must NEVER become Candidate Name (Test #22)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Murat Karahan - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Murat Karahan');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#73/300]: Referee "Prof. Dr. İlber Ortaylı" in References must NEVER become Candidate Name (Test #23)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Prof. Dr. İlber Ortaylı - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('İlber Ortaylı');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#74/300]: Referee "Ahmet Vural" in References must NEVER become Candidate Name (Test #24)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ahmet Vural - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ahmet Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#75/300]: Referee "Mehmet Ali Birand" in References must NEVER become Candidate Name (Test #25)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Mehmet Ali Birand - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Mehmet Ali Birand');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#76/300]: Referee "Selin Soylu" in References must NEVER become Candidate Name (Test #26)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Selin Soylu - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Selin Soylu');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#77/300]: Referee "Burak Batıl" in References must NEVER become Candidate Name (Test #27)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Burak Batıl - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Burak Batıl');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#78/300]: Referee "Cem Yılmaz" in References must NEVER become Candidate Name (Test #28)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Cem Yılmaz - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Cem Yılmaz');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#79/300]: Referee "Hasan Tahsin" in References must NEVER become Candidate Name (Test #29)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Hasan Tahsin - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Hasan Tahsin');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#80/300]: Referee "Kemal Derviş" in References must NEVER become Candidate Name (Test #30)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Kemal Derviş - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Kemal Derviş');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#81/300]: Referee "Ersan Akpınar" in References must NEVER become Candidate Name (Test #31)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ersan Akpınar - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ersan Akpınar');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#82/300]: Referee "Murat Karahan" in References must NEVER become Candidate Name (Test #32)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Murat Karahan - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Murat Karahan');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#83/300]: Referee "Prof. Dr. İlber Ortaylı" in References must NEVER become Candidate Name (Test #33)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Prof. Dr. İlber Ortaylı - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('İlber Ortaylı');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#84/300]: Referee "Ahmet Vural" in References must NEVER become Candidate Name (Test #34)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ahmet Vural - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ahmet Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#85/300]: Referee "Mehmet Ali Birand" in References must NEVER become Candidate Name (Test #35)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Mehmet Ali Birand - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Mehmet Ali Birand');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#86/300]: Referee "Selin Soylu" in References must NEVER become Candidate Name (Test #36)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Selin Soylu - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Selin Soylu');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#87/300]: Referee "Burak Batıl" in References must NEVER become Candidate Name (Test #37)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Burak Batıl - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Burak Batıl');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#88/300]: Referee "Cem Yılmaz" in References must NEVER become Candidate Name (Test #38)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Cem Yılmaz - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Cem Yılmaz');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#89/300]: Referee "Hasan Tahsin" in References must NEVER become Candidate Name (Test #39)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Hasan Tahsin - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Hasan Tahsin');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#90/300]: Referee "Kemal Derviş" in References must NEVER become Candidate Name (Test #40)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Kemal Derviş - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Kemal Derviş');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#91/300]: Referee "Ersan Akpınar" in References must NEVER become Candidate Name (Test #41)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ersan Akpınar - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ersan Akpınar');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#92/300]: Referee "Murat Karahan" in References must NEVER become Candidate Name (Test #42)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Murat Karahan - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Murat Karahan');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#93/300]: Referee "Prof. Dr. İlber Ortaylı" in References must NEVER become Candidate Name (Test #43)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Prof. Dr. İlber Ortaylı - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('İlber Ortaylı');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#94/300]: Referee "Ahmet Vural" in References must NEVER become Candidate Name (Test #44)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Ahmet Vural - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Ahmet Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#95/300]: Referee "Mehmet Ali Birand" in References must NEVER become Candidate Name (Test #45)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Mehmet Ali Birand - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Mehmet Ali Birand');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#96/300]: Referee "Selin Soylu" in References must NEVER become Candidate Name (Test #46)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Selin Soylu - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Selin Soylu');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#97/300]: Referee "Burak Batıl" in References must NEVER become Candidate Name (Test #47)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Burak Batıl - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Burak Batıl');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#98/300]: Referee "Cem Yılmaz" in References must NEVER become Candidate Name (Test #48)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Cem Yılmaz - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Cem Yılmaz');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#99/300]: Referee "Hasan Tahsin" in References must NEVER become Candidate Name (Test #49)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Hasan Tahsin - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Hasan Tahsin');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 2 [#100/300]: Referee "Kemal Derviş" in References must NEVER become Candidate Name (Test #50)', () => {
    const cv = `
Deniz Yılmaz
İstanbul / Beşiktaş
Kıdemli Sistem Yöneticisi

DENEYİM
Turkcell - Sistem Mühendisi (2018 - 2024)
Sunucu ve ağ altyapısının yönetimi.

REFERANSLAR
Kemal Derviş - Genel Müdür
0532 999 88 77
referans@example.com
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Yılmaz');
    expect(canonical.fullName).not.toBe('Kemal Derviş');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Adversarial 3 [#101/300]: Standalone skill modifier "Uzman" must NOT become primary role (Test #1)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Uzman
- Bütçe Planlama - Uzman
- IFRS Raporlama - Uzman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#102/300]: Standalone skill modifier "Senior" must NOT become primary role (Test #2)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Senior
- Bütçe Planlama - Senior
- IFRS Raporlama - Senior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Senior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#103/300]: Standalone skill modifier "Junior" must NOT become primary role (Test #3)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Junior
- Bütçe Planlama - Junior
- IFRS Raporlama - Junior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Junior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#104/300]: Standalone skill modifier "Manager" must NOT become primary role (Test #4)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Manager
- Bütçe Planlama - Manager
- IFRS Raporlama - Manager

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Manager');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#105/300]: Standalone skill modifier "Director" must NOT become primary role (Test #5)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Director
- Bütçe Planlama - Director
- IFRS Raporlama - Director

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Director');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#106/300]: Standalone skill modifier "Müdür" must NOT become primary role (Test #6)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Müdür
- Bütçe Planlama - Müdür
- IFRS Raporlama - Müdür

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Müdür');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#107/300]: Standalone skill modifier "Yönetici" must NOT become primary role (Test #7)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Yönetici
- Bütçe Planlama - Yönetici
- IFRS Raporlama - Yönetici

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Yönetici');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#108/300]: Standalone skill modifier "Leader" must NOT become primary role (Test #8)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Leader
- Bütçe Planlama - Leader
- IFRS Raporlama - Leader

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Leader');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#109/300]: Standalone skill modifier "Specialist" must NOT become primary role (Test #9)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Specialist
- Bütçe Planlama - Specialist
- IFRS Raporlama - Specialist

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Specialist');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#110/300]: Standalone skill modifier "Danışman" must NOT become primary role (Test #10)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Danışman
- Bütçe Planlama - Danışman
- IFRS Raporlama - Danışman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Danışman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#111/300]: Standalone skill modifier "Uzman" must NOT become primary role (Test #11)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Uzman
- Bütçe Planlama - Uzman
- IFRS Raporlama - Uzman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#112/300]: Standalone skill modifier "Senior" must NOT become primary role (Test #12)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Senior
- Bütçe Planlama - Senior
- IFRS Raporlama - Senior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Senior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#113/300]: Standalone skill modifier "Junior" must NOT become primary role (Test #13)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Junior
- Bütçe Planlama - Junior
- IFRS Raporlama - Junior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Junior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#114/300]: Standalone skill modifier "Manager" must NOT become primary role (Test #14)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Manager
- Bütçe Planlama - Manager
- IFRS Raporlama - Manager

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Manager');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#115/300]: Standalone skill modifier "Director" must NOT become primary role (Test #15)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Director
- Bütçe Planlama - Director
- IFRS Raporlama - Director

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Director');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#116/300]: Standalone skill modifier "Müdür" must NOT become primary role (Test #16)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Müdür
- Bütçe Planlama - Müdür
- IFRS Raporlama - Müdür

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Müdür');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#117/300]: Standalone skill modifier "Yönetici" must NOT become primary role (Test #17)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Yönetici
- Bütçe Planlama - Yönetici
- IFRS Raporlama - Yönetici

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Yönetici');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#118/300]: Standalone skill modifier "Leader" must NOT become primary role (Test #18)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Leader
- Bütçe Planlama - Leader
- IFRS Raporlama - Leader

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Leader');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#119/300]: Standalone skill modifier "Specialist" must NOT become primary role (Test #19)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Specialist
- Bütçe Planlama - Specialist
- IFRS Raporlama - Specialist

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Specialist');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#120/300]: Standalone skill modifier "Danışman" must NOT become primary role (Test #20)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Danışman
- Bütçe Planlama - Danışman
- IFRS Raporlama - Danışman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Danışman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#121/300]: Standalone skill modifier "Uzman" must NOT become primary role (Test #21)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Uzman
- Bütçe Planlama - Uzman
- IFRS Raporlama - Uzman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#122/300]: Standalone skill modifier "Senior" must NOT become primary role (Test #22)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Senior
- Bütçe Planlama - Senior
- IFRS Raporlama - Senior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Senior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#123/300]: Standalone skill modifier "Junior" must NOT become primary role (Test #23)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Junior
- Bütçe Planlama - Junior
- IFRS Raporlama - Junior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Junior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#124/300]: Standalone skill modifier "Manager" must NOT become primary role (Test #24)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Manager
- Bütçe Planlama - Manager
- IFRS Raporlama - Manager

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Manager');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#125/300]: Standalone skill modifier "Director" must NOT become primary role (Test #25)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Director
- Bütçe Planlama - Director
- IFRS Raporlama - Director

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Director');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#126/300]: Standalone skill modifier "Müdür" must NOT become primary role (Test #26)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Müdür
- Bütçe Planlama - Müdür
- IFRS Raporlama - Müdür

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Müdür');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#127/300]: Standalone skill modifier "Yönetici" must NOT become primary role (Test #27)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Yönetici
- Bütçe Planlama - Yönetici
- IFRS Raporlama - Yönetici

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Yönetici');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#128/300]: Standalone skill modifier "Leader" must NOT become primary role (Test #28)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Leader
- Bütçe Planlama - Leader
- IFRS Raporlama - Leader

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Leader');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#129/300]: Standalone skill modifier "Specialist" must NOT become primary role (Test #29)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Specialist
- Bütçe Planlama - Specialist
- IFRS Raporlama - Specialist

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Specialist');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#130/300]: Standalone skill modifier "Danışman" must NOT become primary role (Test #30)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Danışman
- Bütçe Planlama - Danışman
- IFRS Raporlama - Danışman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Danışman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#131/300]: Standalone skill modifier "Uzman" must NOT become primary role (Test #31)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Uzman
- Bütçe Planlama - Uzman
- IFRS Raporlama - Uzman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#132/300]: Standalone skill modifier "Senior" must NOT become primary role (Test #32)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Senior
- Bütçe Planlama - Senior
- IFRS Raporlama - Senior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Senior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#133/300]: Standalone skill modifier "Junior" must NOT become primary role (Test #33)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Junior
- Bütçe Planlama - Junior
- IFRS Raporlama - Junior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Junior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#134/300]: Standalone skill modifier "Manager" must NOT become primary role (Test #34)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Manager
- Bütçe Planlama - Manager
- IFRS Raporlama - Manager

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Manager');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#135/300]: Standalone skill modifier "Director" must NOT become primary role (Test #35)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Director
- Bütçe Planlama - Director
- IFRS Raporlama - Director

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Director');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#136/300]: Standalone skill modifier "Müdür" must NOT become primary role (Test #36)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Müdür
- Bütçe Planlama - Müdür
- IFRS Raporlama - Müdür

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Müdür');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#137/300]: Standalone skill modifier "Yönetici" must NOT become primary role (Test #37)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Yönetici
- Bütçe Planlama - Yönetici
- IFRS Raporlama - Yönetici

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Yönetici');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#138/300]: Standalone skill modifier "Leader" must NOT become primary role (Test #38)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Leader
- Bütçe Planlama - Leader
- IFRS Raporlama - Leader

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Leader');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#139/300]: Standalone skill modifier "Specialist" must NOT become primary role (Test #39)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Specialist
- Bütçe Planlama - Specialist
- IFRS Raporlama - Specialist

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Specialist');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#140/300]: Standalone skill modifier "Danışman" must NOT become primary role (Test #40)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Danışman
- Bütçe Planlama - Danışman
- IFRS Raporlama - Danışman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Danışman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#141/300]: Standalone skill modifier "Uzman" must NOT become primary role (Test #41)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Uzman
- Bütçe Planlama - Uzman
- IFRS Raporlama - Uzman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#142/300]: Standalone skill modifier "Senior" must NOT become primary role (Test #42)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Senior
- Bütçe Planlama - Senior
- IFRS Raporlama - Senior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Senior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#143/300]: Standalone skill modifier "Junior" must NOT become primary role (Test #43)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Junior
- Bütçe Planlama - Junior
- IFRS Raporlama - Junior

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Junior');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#144/300]: Standalone skill modifier "Manager" must NOT become primary role (Test #44)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Manager
- Bütçe Planlama - Manager
- IFRS Raporlama - Manager

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Manager');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#145/300]: Standalone skill modifier "Director" must NOT become primary role (Test #45)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Director
- Bütçe Planlama - Director
- IFRS Raporlama - Director

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Director');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#146/300]: Standalone skill modifier "Müdür" must NOT become primary role (Test #46)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Müdür
- Bütçe Planlama - Müdür
- IFRS Raporlama - Müdür

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Müdür');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#147/300]: Standalone skill modifier "Yönetici" must NOT become primary role (Test #47)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Yönetici
- Bütçe Planlama - Yönetici
- IFRS Raporlama - Yönetici

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Yönetici');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#148/300]: Standalone skill modifier "Leader" must NOT become primary role (Test #48)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Leader
- Bütçe Planlama - Leader
- IFRS Raporlama - Leader

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Leader');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#149/300]: Standalone skill modifier "Specialist" must NOT become primary role (Test #49)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Specialist
- Bütçe Planlama - Specialist
- IFRS Raporlama - Specialist

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Specialist');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 3 [#150/300]: Standalone skill modifier "Danışman" must NOT become primary role (Test #50)', () => {
    const cv = `
Zeynep Erdem
Ankara / Çankaya
Finansal Raporlama Uzmanı

YETKİNLİKLER
- Finansal Analiz - Danışman
- Bütçe Planlama - Danışman
- IFRS Raporlama - Danışman

İŞ DENEYİMİ
Koç Holding - Finansal Raporlama Uzmanı (2019 - 2024)
Bütçe konsolidasyonu ve mali raporlama.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Erdem');
    expect(canonical.primaryRole).not.toBe('Danışman');
    expect(canonical.primaryRole).toMatch(/Finans|Raporlama/i);
  });

  it('Adversarial 4 [#151/300]: Delimiter "|" inside bullets must NOT inflate experience count (Test #1)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi | Satış Stratejileri | Müşteri Kazanımı | Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi | Ekip Liderliği | Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#152/300]: Delimiter "•" inside bullets must NOT inflate experience count (Test #2)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi • Satış Stratejileri • Müşteri Kazanımı • Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi • Ekip Liderliği • Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#153/300]: Delimiter "●" inside bullets must NOT inflate experience count (Test #3)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ● Satış Stratejileri ● Müşteri Kazanımı ● Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ● Ekip Liderliği ● Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#154/300]: Delimiter "▪" inside bullets must NOT inflate experience count (Test #4)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ▪ Satış Stratejileri ▪ Müşteri Kazanımı ▪ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ▪ Ekip Liderliği ▪ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#155/300]: Delimiter "◦" inside bullets must NOT inflate experience count (Test #5)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ◦ Satış Stratejileri ◦ Müşteri Kazanımı ◦ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ◦ Ekip Liderliği ◦ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#156/300]: Delimiter "/" inside bullets must NOT inflate experience count (Test #6)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi / Satış Stratejileri / Müşteri Kazanımı / Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi / Ekip Liderliği / Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#157/300]: Delimiter "-" inside bullets must NOT inflate experience count (Test #7)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi - Satış Stratejileri - Müşteri Kazanımı - Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi - Ekip Liderliği - Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#158/300]: Delimiter "–" inside bullets must NOT inflate experience count (Test #8)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi – Satış Stratejileri – Müşteri Kazanımı – Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi – Ekip Liderliği – Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#159/300]: Delimiter "—" inside bullets must NOT inflate experience count (Test #9)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi — Satış Stratejileri — Müşteri Kazanımı — Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi — Ekip Liderliği — Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#160/300]: Delimiter ";" inside bullets must NOT inflate experience count (Test #10)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ; Satış Stratejileri ; Müşteri Kazanımı ; Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ; Ekip Liderliği ; Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#161/300]: Delimiter "||" inside bullets must NOT inflate experience count (Test #11)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi || Satış Stratejileri || Müşteri Kazanımı || Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi || Ekip Liderliği || Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#162/300]: Delimiter "|" inside bullets must NOT inflate experience count (Test #12)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi | Satış Stratejileri | Müşteri Kazanımı | Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi | Ekip Liderliği | Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#163/300]: Delimiter "•" inside bullets must NOT inflate experience count (Test #13)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi • Satış Stratejileri • Müşteri Kazanımı • Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi • Ekip Liderliği • Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#164/300]: Delimiter "●" inside bullets must NOT inflate experience count (Test #14)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ● Satış Stratejileri ● Müşteri Kazanımı ● Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ● Ekip Liderliği ● Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#165/300]: Delimiter "▪" inside bullets must NOT inflate experience count (Test #15)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ▪ Satış Stratejileri ▪ Müşteri Kazanımı ▪ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ▪ Ekip Liderliği ▪ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#166/300]: Delimiter "◦" inside bullets must NOT inflate experience count (Test #16)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ◦ Satış Stratejileri ◦ Müşteri Kazanımı ◦ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ◦ Ekip Liderliği ◦ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#167/300]: Delimiter "/" inside bullets must NOT inflate experience count (Test #17)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi / Satış Stratejileri / Müşteri Kazanımı / Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi / Ekip Liderliği / Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#168/300]: Delimiter "-" inside bullets must NOT inflate experience count (Test #18)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi - Satış Stratejileri - Müşteri Kazanımı - Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi - Ekip Liderliği - Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#169/300]: Delimiter "–" inside bullets must NOT inflate experience count (Test #19)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi – Satış Stratejileri – Müşteri Kazanımı – Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi – Ekip Liderliği – Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#170/300]: Delimiter "—" inside bullets must NOT inflate experience count (Test #20)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi — Satış Stratejileri — Müşteri Kazanımı — Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi — Ekip Liderliği — Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#171/300]: Delimiter ";" inside bullets must NOT inflate experience count (Test #21)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ; Satış Stratejileri ; Müşteri Kazanımı ; Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ; Ekip Liderliği ; Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#172/300]: Delimiter "||" inside bullets must NOT inflate experience count (Test #22)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi || Satış Stratejileri || Müşteri Kazanımı || Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi || Ekip Liderliği || Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#173/300]: Delimiter "|" inside bullets must NOT inflate experience count (Test #23)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi | Satış Stratejileri | Müşteri Kazanımı | Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi | Ekip Liderliği | Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#174/300]: Delimiter "•" inside bullets must NOT inflate experience count (Test #24)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi • Satış Stratejileri • Müşteri Kazanımı • Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi • Ekip Liderliği • Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#175/300]: Delimiter "●" inside bullets must NOT inflate experience count (Test #25)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ● Satış Stratejileri ● Müşteri Kazanımı ● Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ● Ekip Liderliği ● Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#176/300]: Delimiter "▪" inside bullets must NOT inflate experience count (Test #26)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ▪ Satış Stratejileri ▪ Müşteri Kazanımı ▪ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ▪ Ekip Liderliği ▪ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#177/300]: Delimiter "◦" inside bullets must NOT inflate experience count (Test #27)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ◦ Satış Stratejileri ◦ Müşteri Kazanımı ◦ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ◦ Ekip Liderliği ◦ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#178/300]: Delimiter "/" inside bullets must NOT inflate experience count (Test #28)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi / Satış Stratejileri / Müşteri Kazanımı / Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi / Ekip Liderliği / Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#179/300]: Delimiter "-" inside bullets must NOT inflate experience count (Test #29)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi - Satış Stratejileri - Müşteri Kazanımı - Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi - Ekip Liderliği - Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#180/300]: Delimiter "–" inside bullets must NOT inflate experience count (Test #30)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi – Satış Stratejileri – Müşteri Kazanımı – Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi – Ekip Liderliği – Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#181/300]: Delimiter "—" inside bullets must NOT inflate experience count (Test #31)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi — Satış Stratejileri — Müşteri Kazanımı — Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi — Ekip Liderliği — Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#182/300]: Delimiter ";" inside bullets must NOT inflate experience count (Test #32)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ; Satış Stratejileri ; Müşteri Kazanımı ; Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ; Ekip Liderliği ; Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#183/300]: Delimiter "||" inside bullets must NOT inflate experience count (Test #33)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi || Satış Stratejileri || Müşteri Kazanımı || Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi || Ekip Liderliği || Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#184/300]: Delimiter "|" inside bullets must NOT inflate experience count (Test #34)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi | Satış Stratejileri | Müşteri Kazanımı | Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi | Ekip Liderliği | Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#185/300]: Delimiter "•" inside bullets must NOT inflate experience count (Test #35)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi • Satış Stratejileri • Müşteri Kazanımı • Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi • Ekip Liderliği • Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#186/300]: Delimiter "●" inside bullets must NOT inflate experience count (Test #36)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ● Satış Stratejileri ● Müşteri Kazanımı ● Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ● Ekip Liderliği ● Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#187/300]: Delimiter "▪" inside bullets must NOT inflate experience count (Test #37)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ▪ Satış Stratejileri ▪ Müşteri Kazanımı ▪ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ▪ Ekip Liderliği ▪ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#188/300]: Delimiter "◦" inside bullets must NOT inflate experience count (Test #38)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ◦ Satış Stratejileri ◦ Müşteri Kazanımı ◦ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ◦ Ekip Liderliği ◦ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#189/300]: Delimiter "/" inside bullets must NOT inflate experience count (Test #39)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi / Satış Stratejileri / Müşteri Kazanımı / Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi / Ekip Liderliği / Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#190/300]: Delimiter "-" inside bullets must NOT inflate experience count (Test #40)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi - Satış Stratejileri - Müşteri Kazanımı - Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi - Ekip Liderliği - Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#191/300]: Delimiter "–" inside bullets must NOT inflate experience count (Test #41)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi – Satış Stratejileri – Müşteri Kazanımı – Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi – Ekip Liderliği – Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#192/300]: Delimiter "—" inside bullets must NOT inflate experience count (Test #42)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi — Satış Stratejileri — Müşteri Kazanımı — Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi — Ekip Liderliği — Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#193/300]: Delimiter ";" inside bullets must NOT inflate experience count (Test #43)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ; Satış Stratejileri ; Müşteri Kazanımı ; Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ; Ekip Liderliği ; Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#194/300]: Delimiter "||" inside bullets must NOT inflate experience count (Test #44)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi || Satış Stratejileri || Müşteri Kazanımı || Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi || Ekip Liderliği || Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#195/300]: Delimiter "|" inside bullets must NOT inflate experience count (Test #45)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi | Satış Stratejileri | Müşteri Kazanımı | Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi | Ekip Liderliği | Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#196/300]: Delimiter "•" inside bullets must NOT inflate experience count (Test #46)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi • Satış Stratejileri • Müşteri Kazanımı • Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi • Ekip Liderliği • Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#197/300]: Delimiter "●" inside bullets must NOT inflate experience count (Test #47)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ● Satış Stratejileri ● Müşteri Kazanımı ● Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ● Ekip Liderliği ● Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#198/300]: Delimiter "▪" inside bullets must NOT inflate experience count (Test #48)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ▪ Satış Stratejileri ▪ Müşteri Kazanımı ▪ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ▪ Ekip Liderliği ▪ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#199/300]: Delimiter "◦" inside bullets must NOT inflate experience count (Test #49)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi ◦ Satış Stratejileri ◦ Müşteri Kazanımı ◦ Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi ◦ Ekip Liderliği ◦ Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 4 [#200/300]: Delimiter "/" inside bullets must NOT inflate experience count (Test #50)', () => {
    const cv = `
Uğur Zaman
İstanbul / Maltepe
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2020 - 2024)
Çağrı Merkezi Yönetimi / Satış Stratejileri / Müşteri Kazanımı / Bütçe ve KPI

Mehrwerk - Operasyon Müdürü (2016 - 2020)
Operasyon Yönetimi / Ekip Liderliği / Kalite Kontrol
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });

    expect(res.fullName).toBe('Uğur Zaman');
    expect(res.experiences).toHaveLength(2);
  });

  it('Adversarial 5 [#201/300]: Company name "Doktor Takvimi A.Ş." must NOT be extracted as role title (Test #1)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Doktor Takvimi A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doktor', 'i'));
  });

  it('Adversarial 5 [#202/300]: Company name "Müdürlük Danışmanlık Ltd. Şti." must NOT be extracted as role title (Test #2)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Müdürlük Danışmanlık Ltd. Şti. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Müdürlük Danışmanlık Ltd. Şti.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Müdürlük', 'i'));
  });

  it('Adversarial 5 [#203/300]: Company name "Uzmanlar Grup Holding" must NOT be extracted as role title (Test #3)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Uzmanlar Grup Holding - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Uzmanlar Grup Holding');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Uzmanlar', 'i'));
  });

  it('Adversarial 5 [#204/300]: Company name "Yöneticiler Bilişim San. Tic. A.Ş." must NOT be extracted as role title (Test #4)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Yöneticiler Bilişim San. Tic. A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Yöneticiler Bilişim San. Tic. A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Yöneticiler', 'i'));
  });

  it('Adversarial 5 [#205/300]: Company name "Mühendislik Hizmetleri Ltd." must NOT be extracted as role title (Test #5)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Mühendislik Hizmetleri Ltd. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Mühendislik Hizmetleri Ltd.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Mühendislik', 'i'));
  });

  it('Adversarial 5 [#206/300]: Company name "Avukatlık Ortaklığı A.Ş." must NOT be extracted as role title (Test #6)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Avukatlık Ortaklığı A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Avukatlık Ortaklığı A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Avukatlık', 'i'));
  });

  it('Adversarial 5 [#207/300]: Company name "Danışmanlık ve Denetim A.Ş." must NOT be extracted as role title (Test #7)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Danışmanlık ve Denetim A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Danışmanlık ve Denetim A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Danışmanlık', 'i'));
  });

  it('Adversarial 5 [#208/300]: Company name "Liderler Sigorta Aracılık" must NOT be extracted as role title (Test #8)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Liderler Sigorta Aracılık - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Liderler Sigorta Aracılık');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Liderler', 'i'));
  });

  it('Adversarial 5 [#209/300]: Company name "Geliştiriciler Yazılım Teknolojileri A.Ş." must NOT be extracted as role title (Test #9)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Geliştiriciler Yazılım Teknolojileri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Geliştiriciler Yazılım Teknolojileri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Geliştiriciler', 'i'));
  });

  it('Adversarial 5 [#210/300]: Company name "Başkanlık Güvenlik Hizmetleri A.Ş." must NOT be extracted as role title (Test #10)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Başkanlık Güvenlik Hizmetleri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Başkanlık Güvenlik Hizmetleri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Başkanlık', 'i'));
  });

  it('Adversarial 5 [#211/300]: Company name "Doktor Takvimi A.Ş." must NOT be extracted as role title (Test #11)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Doktor Takvimi A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doktor', 'i'));
  });

  it('Adversarial 5 [#212/300]: Company name "Müdürlük Danışmanlık Ltd. Şti." must NOT be extracted as role title (Test #12)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Müdürlük Danışmanlık Ltd. Şti. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Müdürlük Danışmanlık Ltd. Şti.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Müdürlük', 'i'));
  });

  it('Adversarial 5 [#213/300]: Company name "Uzmanlar Grup Holding" must NOT be extracted as role title (Test #13)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Uzmanlar Grup Holding - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Uzmanlar Grup Holding');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Uzmanlar', 'i'));
  });

  it('Adversarial 5 [#214/300]: Company name "Yöneticiler Bilişim San. Tic. A.Ş." must NOT be extracted as role title (Test #14)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Yöneticiler Bilişim San. Tic. A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Yöneticiler Bilişim San. Tic. A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Yöneticiler', 'i'));
  });

  it('Adversarial 5 [#215/300]: Company name "Mühendislik Hizmetleri Ltd." must NOT be extracted as role title (Test #15)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Mühendislik Hizmetleri Ltd. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Mühendislik Hizmetleri Ltd.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Mühendislik', 'i'));
  });

  it('Adversarial 5 [#216/300]: Company name "Avukatlık Ortaklığı A.Ş." must NOT be extracted as role title (Test #16)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Avukatlık Ortaklığı A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Avukatlık Ortaklığı A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Avukatlık', 'i'));
  });

  it('Adversarial 5 [#217/300]: Company name "Danışmanlık ve Denetim A.Ş." must NOT be extracted as role title (Test #17)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Danışmanlık ve Denetim A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Danışmanlık ve Denetim A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Danışmanlık', 'i'));
  });

  it('Adversarial 5 [#218/300]: Company name "Liderler Sigorta Aracılık" must NOT be extracted as role title (Test #18)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Liderler Sigorta Aracılık - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Liderler Sigorta Aracılık');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Liderler', 'i'));
  });

  it('Adversarial 5 [#219/300]: Company name "Geliştiriciler Yazılım Teknolojileri A.Ş." must NOT be extracted as role title (Test #19)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Geliştiriciler Yazılım Teknolojileri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Geliştiriciler Yazılım Teknolojileri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Geliştiriciler', 'i'));
  });

  it('Adversarial 5 [#220/300]: Company name "Başkanlık Güvenlik Hizmetleri A.Ş." must NOT be extracted as role title (Test #20)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Başkanlık Güvenlik Hizmetleri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Başkanlık Güvenlik Hizmetleri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Başkanlık', 'i'));
  });

  it('Adversarial 5 [#221/300]: Company name "Doktor Takvimi A.Ş." must NOT be extracted as role title (Test #21)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Doktor Takvimi A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doktor', 'i'));
  });

  it('Adversarial 5 [#222/300]: Company name "Müdürlük Danışmanlık Ltd. Şti." must NOT be extracted as role title (Test #22)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Müdürlük Danışmanlık Ltd. Şti. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Müdürlük Danışmanlık Ltd. Şti.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Müdürlük', 'i'));
  });

  it('Adversarial 5 [#223/300]: Company name "Uzmanlar Grup Holding" must NOT be extracted as role title (Test #23)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Uzmanlar Grup Holding - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Uzmanlar Grup Holding');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Uzmanlar', 'i'));
  });

  it('Adversarial 5 [#224/300]: Company name "Yöneticiler Bilişim San. Tic. A.Ş." must NOT be extracted as role title (Test #24)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Yöneticiler Bilişim San. Tic. A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Yöneticiler Bilişim San. Tic. A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Yöneticiler', 'i'));
  });

  it('Adversarial 5 [#225/300]: Company name "Mühendislik Hizmetleri Ltd." must NOT be extracted as role title (Test #25)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Mühendislik Hizmetleri Ltd. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Mühendislik Hizmetleri Ltd.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Mühendislik', 'i'));
  });

  it('Adversarial 5 [#226/300]: Company name "Avukatlık Ortaklığı A.Ş." must NOT be extracted as role title (Test #26)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Avukatlık Ortaklığı A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Avukatlık Ortaklığı A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Avukatlık', 'i'));
  });

  it('Adversarial 5 [#227/300]: Company name "Danışmanlık ve Denetim A.Ş." must NOT be extracted as role title (Test #27)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Danışmanlık ve Denetim A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Danışmanlık ve Denetim A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Danışmanlık', 'i'));
  });

  it('Adversarial 5 [#228/300]: Company name "Liderler Sigorta Aracılık" must NOT be extracted as role title (Test #28)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Liderler Sigorta Aracılık - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Liderler Sigorta Aracılık');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Liderler', 'i'));
  });

  it('Adversarial 5 [#229/300]: Company name "Geliştiriciler Yazılım Teknolojileri A.Ş." must NOT be extracted as role title (Test #29)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Geliştiriciler Yazılım Teknolojileri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Geliştiriciler Yazılım Teknolojileri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Geliştiriciler', 'i'));
  });

  it('Adversarial 5 [#230/300]: Company name "Başkanlık Güvenlik Hizmetleri A.Ş." must NOT be extracted as role title (Test #30)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Başkanlık Güvenlik Hizmetleri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Başkanlık Güvenlik Hizmetleri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Başkanlık', 'i'));
  });

  it('Adversarial 5 [#231/300]: Company name "Doktor Takvimi A.Ş." must NOT be extracted as role title (Test #31)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Doktor Takvimi A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doktor', 'i'));
  });

  it('Adversarial 5 [#232/300]: Company name "Müdürlük Danışmanlık Ltd. Şti." must NOT be extracted as role title (Test #32)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Müdürlük Danışmanlık Ltd. Şti. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Müdürlük Danışmanlık Ltd. Şti.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Müdürlük', 'i'));
  });

  it('Adversarial 5 [#233/300]: Company name "Uzmanlar Grup Holding" must NOT be extracted as role title (Test #33)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Uzmanlar Grup Holding - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Uzmanlar Grup Holding');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Uzmanlar', 'i'));
  });

  it('Adversarial 5 [#234/300]: Company name "Yöneticiler Bilişim San. Tic. A.Ş." must NOT be extracted as role title (Test #34)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Yöneticiler Bilişim San. Tic. A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Yöneticiler Bilişim San. Tic. A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Yöneticiler', 'i'));
  });

  it('Adversarial 5 [#235/300]: Company name "Mühendislik Hizmetleri Ltd." must NOT be extracted as role title (Test #35)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Mühendislik Hizmetleri Ltd. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Mühendislik Hizmetleri Ltd.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Mühendislik', 'i'));
  });

  it('Adversarial 5 [#236/300]: Company name "Avukatlık Ortaklığı A.Ş." must NOT be extracted as role title (Test #36)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Avukatlık Ortaklığı A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Avukatlık Ortaklığı A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Avukatlık', 'i'));
  });

  it('Adversarial 5 [#237/300]: Company name "Danışmanlık ve Denetim A.Ş." must NOT be extracted as role title (Test #37)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Danışmanlık ve Denetim A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Danışmanlık ve Denetim A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Danışmanlık', 'i'));
  });

  it('Adversarial 5 [#238/300]: Company name "Liderler Sigorta Aracılık" must NOT be extracted as role title (Test #38)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Liderler Sigorta Aracılık - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Liderler Sigorta Aracılık');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Liderler', 'i'));
  });

  it('Adversarial 5 [#239/300]: Company name "Geliştiriciler Yazılım Teknolojileri A.Ş." must NOT be extracted as role title (Test #39)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Geliştiriciler Yazılım Teknolojileri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Geliştiriciler Yazılım Teknolojileri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Geliştiriciler', 'i'));
  });

  it('Adversarial 5 [#240/300]: Company name "Başkanlık Güvenlik Hizmetleri A.Ş." must NOT be extracted as role title (Test #40)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Başkanlık Güvenlik Hizmetleri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Başkanlık Güvenlik Hizmetleri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Başkanlık', 'i'));
  });

  it('Adversarial 5 [#241/300]: Company name "Doktor Takvimi A.Ş." must NOT be extracted as role title (Test #41)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Doktor Takvimi A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Doktor Takvimi A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Doktor', 'i'));
  });

  it('Adversarial 5 [#242/300]: Company name "Müdürlük Danışmanlık Ltd. Şti." must NOT be extracted as role title (Test #42)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Müdürlük Danışmanlık Ltd. Şti. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Müdürlük Danışmanlık Ltd. Şti.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Müdürlük', 'i'));
  });

  it('Adversarial 5 [#243/300]: Company name "Uzmanlar Grup Holding" must NOT be extracted as role title (Test #43)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Uzmanlar Grup Holding - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Uzmanlar Grup Holding');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Uzmanlar', 'i'));
  });

  it('Adversarial 5 [#244/300]: Company name "Yöneticiler Bilişim San. Tic. A.Ş." must NOT be extracted as role title (Test #44)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Yöneticiler Bilişim San. Tic. A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Yöneticiler Bilişim San. Tic. A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Yöneticiler', 'i'));
  });

  it('Adversarial 5 [#245/300]: Company name "Mühendislik Hizmetleri Ltd." must NOT be extracted as role title (Test #45)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Mühendislik Hizmetleri Ltd. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Mühendislik Hizmetleri Ltd.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Mühendislik', 'i'));
  });

  it('Adversarial 5 [#246/300]: Company name "Avukatlık Ortaklığı A.Ş." must NOT be extracted as role title (Test #46)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Avukatlık Ortaklığı A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Avukatlık Ortaklığı A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Avukatlık', 'i'));
  });

  it('Adversarial 5 [#247/300]: Company name "Danışmanlık ve Denetim A.Ş." must NOT be extracted as role title (Test #47)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Danışmanlık ve Denetim A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Danışmanlık ve Denetim A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Danışmanlık', 'i'));
  });

  it('Adversarial 5 [#248/300]: Company name "Liderler Sigorta Aracılık" must NOT be extracted as role title (Test #48)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Liderler Sigorta Aracılık - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Liderler Sigorta Aracılık');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Liderler', 'i'));
  });

  it('Adversarial 5 [#249/300]: Company name "Geliştiriciler Yazılım Teknolojileri A.Ş." must NOT be extracted as role title (Test #49)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Geliştiriciler Yazılım Teknolojileri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Geliştiriciler Yazılım Teknolojileri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Geliştiriciler', 'i'));
  });

  it('Adversarial 5 [#250/300]: Company name "Başkanlık Güvenlik Hizmetleri A.Ş." must NOT be extracted as role title (Test #50)', () => {
    const cv = `
Selin Aktaş
İzmir / Bornova
İş Geliştirme Müdürü

DENEYİM
Başkanlık Güvenlik Hizmetleri A.Ş. - İş Geliştirme Müdürü (2018 - 2024)
Pazar payı genişletme ve müşteri ilişkileri.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Aktaş');
    expect(canonical.primaryRole).not.toBe('Başkanlık Güvenlik Hizmetleri A.Ş.');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(new RegExp('Başkanlık', 'i'));
  });

  it('Adversarial 6 [#251/300]: Multilingual [DE] headings must parse cleanly (Test #1)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#252/300]: Multilingual [FR] headings must parse cleanly (Test #2)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#253/300]: Multilingual [EN] headings must parse cleanly (Test #3)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#254/300]: Multilingual [TR] headings must parse cleanly (Test #4)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#255/300]: Multilingual [IT] headings must parse cleanly (Test #5)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#256/300]: Multilingual [DE] headings must parse cleanly (Test #6)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#257/300]: Multilingual [FR] headings must parse cleanly (Test #7)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#258/300]: Multilingual [EN] headings must parse cleanly (Test #8)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#259/300]: Multilingual [TR] headings must parse cleanly (Test #9)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#260/300]: Multilingual [IT] headings must parse cleanly (Test #10)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#261/300]: Multilingual [DE] headings must parse cleanly (Test #11)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#262/300]: Multilingual [FR] headings must parse cleanly (Test #12)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#263/300]: Multilingual [EN] headings must parse cleanly (Test #13)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#264/300]: Multilingual [TR] headings must parse cleanly (Test #14)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#265/300]: Multilingual [IT] headings must parse cleanly (Test #15)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#266/300]: Multilingual [DE] headings must parse cleanly (Test #16)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#267/300]: Multilingual [FR] headings must parse cleanly (Test #17)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#268/300]: Multilingual [EN] headings must parse cleanly (Test #18)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#269/300]: Multilingual [TR] headings must parse cleanly (Test #19)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#270/300]: Multilingual [IT] headings must parse cleanly (Test #20)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#271/300]: Multilingual [DE] headings must parse cleanly (Test #21)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#272/300]: Multilingual [FR] headings must parse cleanly (Test #22)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#273/300]: Multilingual [EN] headings must parse cleanly (Test #23)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#274/300]: Multilingual [TR] headings must parse cleanly (Test #24)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#275/300]: Multilingual [IT] headings must parse cleanly (Test #25)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#276/300]: Multilingual [DE] headings must parse cleanly (Test #26)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#277/300]: Multilingual [FR] headings must parse cleanly (Test #27)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#278/300]: Multilingual [EN] headings must parse cleanly (Test #28)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#279/300]: Multilingual [TR] headings must parse cleanly (Test #29)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#280/300]: Multilingual [IT] headings must parse cleanly (Test #30)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#281/300]: Multilingual [DE] headings must parse cleanly (Test #31)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#282/300]: Multilingual [FR] headings must parse cleanly (Test #32)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#283/300]: Multilingual [EN] headings must parse cleanly (Test #33)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#284/300]: Multilingual [TR] headings must parse cleanly (Test #34)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#285/300]: Multilingual [IT] headings must parse cleanly (Test #35)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#286/300]: Multilingual [DE] headings must parse cleanly (Test #36)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#287/300]: Multilingual [FR] headings must parse cleanly (Test #37)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#288/300]: Multilingual [EN] headings must parse cleanly (Test #38)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#289/300]: Multilingual [TR] headings must parse cleanly (Test #39)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#290/300]: Multilingual [IT] headings must parse cleanly (Test #40)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#291/300]: Multilingual [DE] headings must parse cleanly (Test #41)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#292/300]: Multilingual [FR] headings must parse cleanly (Test #42)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#293/300]: Multilingual [EN] headings must parse cleanly (Test #43)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#294/300]: Multilingual [TR] headings must parse cleanly (Test #44)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#295/300]: Multilingual [IT] headings must parse cleanly (Test #45)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#296/300]: Multilingual [DE] headings must parse cleanly (Test #46)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Berufserfahrung
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Ausbildung
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Kompetenzen
TypeScript, Go, Kubernetes, Cloud Architecture

Referenzen
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#297/300]: Multilingual [FR] headings must parse cleanly (Test #47)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Expérience Professionnelle
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Formation
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Compétences
TypeScript, Go, Kubernetes, Cloud Architecture

Références
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#298/300]: Multilingual [EN] headings must parse cleanly (Test #48)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Work Experience
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Education
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Core Skills
TypeScript, Go, Kubernetes, Cloud Architecture

References
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#299/300]: Multilingual [TR] headings must parse cleanly (Test #49)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

İş Deneyimi
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Eğitim Bilgileri
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Teknik Yetkinlikler
TypeScript, Go, Kubernetes, Cloud Architecture

Referanslar
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });

  it('Adversarial 6 [#300/300]: Multilingual [IT] headings must parse cleanly (Test #50)', () => {
    const cv = `
Hans Gruber
München / Germany | hans@example.com
Software Architect

Esperienza Lavorativa
Siemens AG - Software Architect (2019 - 2024)
Cloud infrastructure and distributed systems.

Istruzione
Technical University of Munich - M.Sc. Computer Science (2014 - 2019)

Competenze
TypeScript, Go, Kubernetes, Cloud Architecture

Referenze
Dr. Klaus Schmidt - CTO
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Gruber');
    expect(canonical.fullName).not.toBe('Dr. Klaus Schmidt');
    expect(canonical.primaryRole).toMatch(/Software|Architect|Yazılım/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.education).toHaveLength(1);
  });
});
