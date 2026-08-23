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

describe('CV Extraction Engine — Evidence Graph & Firewall 100+ Real-World Corpus', () => {
  it('Category 1 [#1/100]: Multi-Column & Sidebar CV for Ahmet Aras', () => {
    const cv = `
[SIDEBAR_START]
Ahmet Aras
0532 111 22 00
ahmetaras@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Aras');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#2/100]: Multi-Column & Sidebar CV for Burcu Çelik', () => {
    const cv = `
[SIDEBAR_START]
Burcu Çelik
0532 111 22 01
burcuelik@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Burcu Çelik');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#3/100]: Multi-Column & Sidebar CV for Canan Doğan', () => {
    const cv = `
[SIDEBAR_START]
Canan Doğan
0532 111 22 02
canandoan@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Canan Doğan');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#4/100]: Multi-Column & Sidebar CV for Deniz Efe', () => {
    const cv = `
[SIDEBAR_START]
Deniz Efe
0532 111 22 03
denizefe@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Efe');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#5/100]: Multi-Column & Sidebar CV for Emre Fidan', () => {
    const cv = `
[SIDEBAR_START]
Emre Fidan
0532 111 22 04
emrefidan@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Emre Fidan');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#6/100]: Multi-Column & Sidebar CV for Fulya Güner', () => {
    const cv = `
[SIDEBAR_START]
Fulya Güner
0532 111 22 05
fulyagner@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fulya Güner');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#7/100]: Multi-Column & Sidebar CV for Gökhan Hakan', () => {
    const cv = `
[SIDEBAR_START]
Gökhan Hakan
0532 111 22 06
gkhanhakan@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gökhan Hakan');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#8/100]: Multi-Column & Sidebar CV for Hande Işık', () => {
    const cv = `
[SIDEBAR_START]
Hande Işık
0532 111 22 07
handeik@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hande Işık');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#9/100]: Multi-Column & Sidebar CV for İpek Jale', () => {
    const cv = `
[SIDEBAR_START]
İpek Jale
0532 111 22 08
ipekjale@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('İpek Jale');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#10/100]: Multi-Column & Sidebar CV for Kaan Kılıç', () => {
    const cv = `
[SIDEBAR_START]
Kaan Kılıç
0532 111 22 09
kaankl@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kaan Kılıç');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#11/100]: Multi-Column & Sidebar CV for Lale Mutlu', () => {
    const cv = `
[SIDEBAR_START]
Lale Mutlu
0532 111 22 10
lalemutlu@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Lale Mutlu');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#12/100]: Multi-Column & Sidebar CV for Murat Nalbant', () => {
    const cv = `
[SIDEBAR_START]
Murat Nalbant
0532 111 22 11
muratnalbant@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Nalbant');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#13/100]: Multi-Column & Sidebar CV for Nihal Oğuz', () => {
    const cv = `
[SIDEBAR_START]
Nihal Oğuz
0532 111 22 12
nihalouz@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Nihal Oğuz');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#14/100]: Multi-Column & Sidebar CV for Onur Öztürk', () => {
    const cv = `
[SIDEBAR_START]
Onur Öztürk
0532 111 22 13
onurztrk@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Onur Öztürk');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#15/100]: Multi-Column & Sidebar CV for Pelin Polat', () => {
    const cv = `
[SIDEBAR_START]
Pelin Polat
0532 111 22 14
pelinpolat@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pelin Polat');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#16/100]: Multi-Column & Sidebar CV for Rıza Sarı', () => {
    const cv = `
[SIDEBAR_START]
Rıza Sarı
0532 111 22 15
rzasar@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Rıza Sarı');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#17/100]: Multi-Column & Sidebar CV for Seda Tan', () => {
    const cv = `
[SIDEBAR_START]
Seda Tan
0532 111 22 16
sedatan@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Seda Tan');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#18/100]: Multi-Column & Sidebar CV for Tolga Uçar', () => {
    const cv = `
[SIDEBAR_START]
Tolga Uçar
0532 111 22 17
tolgauar@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tolga Uçar');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#19/100]: Multi-Column & Sidebar CV for Umut Vural', () => {
    const cv = `
[SIDEBAR_START]
Umut Vural
0532 111 22 18
umutvural@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Umut Vural');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 1 [#20/100]: Multi-Column & Sidebar CV for Volkan Yıldız', () => {
    const cv = `
[SIDEBAR_START]
Volkan Yıldız
0532 111 22 19
volkanyldz@example.com
İstanbul / Kadıköy
Beceriler: TypeScript, Node.js, SQL, Git, Docker
Diller: İngilizce (İleri)
Eğitim: İTÜ - Bilgisayar Mühendisliği Lisans (2014 - 2018)
[SIDEBAR_END]

[MAIN_CONTENT_START]
Kıdemli Yazılım Mühendisi

İŞ DENEYİMİ
Trendyol - Backend Developer (2020 - 2024)
Mikroservis mimarisi ve yüksek ölçekli sistemlerin geliştirilmesi.

Getir - Software Engineer (2018 - 2020)
Ödeme sistemleri ve API optimizasyonu.
[MAIN_CONTENT_END]
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Volkan Yıldız');
    expect(canonical.primaryRole).toMatch(/Yazılım|Developer|Backend/i);
    expect(res.experiences).toHaveLength(2);
    expect(res.education).toHaveLength(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#21/100]: Complex Delimited & Pipe-Separated CV #1', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#22/100]: Complex Delimited & Pipe-Separated CV #2', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#23/100]: Complex Delimited & Pipe-Separated CV #3', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#24/100]: Complex Delimited & Pipe-Separated CV #4', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#25/100]: Complex Delimited & Pipe-Separated CV #5', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#26/100]: Complex Delimited & Pipe-Separated CV #6', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#27/100]: Complex Delimited & Pipe-Separated CV #7', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#28/100]: Complex Delimited & Pipe-Separated CV #8', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#29/100]: Complex Delimited & Pipe-Separated CV #9', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#30/100]: Complex Delimited & Pipe-Separated CV #10', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#31/100]: Complex Delimited & Pipe-Separated CV #11', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#32/100]: Complex Delimited & Pipe-Separated CV #12', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#33/100]: Complex Delimited & Pipe-Separated CV #13', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#34/100]: Complex Delimited & Pipe-Separated CV #14', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#35/100]: Complex Delimited & Pipe-Separated CV #15', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#36/100]: Complex Delimited & Pipe-Separated CV #16', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#37/100]: Complex Delimited & Pipe-Separated CV #17', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#38/100]: Complex Delimited & Pipe-Separated CV #18', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#39/100]: Complex Delimited & Pipe-Separated CV #19', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 2 [#40/100]: Complex Delimited & Pipe-Separated CV #20', () => {
    const cv = `
Selin Demirtaş
Ankara / Çankaya
Finansal Raporlama ve Bütçe Müdürü

DENEYİM
Koç Holding | Finans Müdürü | 2020 - 2024
Bütçe Planlama | Finansal Analiz | Nakit Akışı Yönetimi | Konsolidasyon | IFRS

Sabancı Holding | Kıdemli Mali Analist | 2016 - 2020
Maliyet Muhasebesi | Yönetim Raporlaması | KPI Takibi | ERP Geçişi
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selin Demirtaş');
    expect(canonical.primaryRole).toMatch(/Finans|Mali|Bütçe/i);
    expect(res.experiences).toHaveLength(2);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 3 [#41/100]: Industry Archetype: Çağrı Merkezi Operasyon Müdürü in Mplus Group', () => {
    const cv = `
Kemal Aksoy
İstanbul / Beşiktaş
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Mplus Group - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Aksoy');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#42/100]: Industry Archetype: Bölge Satış Müdürü in Coca-Cola İçecek', () => {
    const cv = `
Banu Tekin
İstanbul / Beşiktaş
Bölge Satış Müdürü

DENEYİM
Coca-Cola İçecek - Bölge Satış Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Banu Tekin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#43/100]: Industry Archetype: Kardiyoloji Uzmanı in Acıbadem Sağlık Grubu', () => {
    const cv = `
Dr. Metin Çelik
İstanbul / Beşiktaş
Kardiyoloji Uzmanı

DENEYİM
Acıbadem Sağlık Grubu - Kardiyoloji Uzmanı (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Metin Çelik');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#44/100]: Industry Archetype: Avukat / Hukuk Müşaviri in Paksoy Hukuk Bürosu', () => {
    const cv = `
Av. Zeynep Kaya
İstanbul / Beşiktaş
Avukat / Hukuk Müşaviri

DENEYİM
Paksoy Hukuk Bürosu - Avukat / Hukuk Müşaviri (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Kaya');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#45/100]: Industry Archetype: Şantiye Şefi / Mimar in Rönesans Holding', () => {
    const cv = `
Murat Erdem
İstanbul / Beşiktaş
Şantiye Şefi / Mimar

DENEYİM
Rönesans Holding - Şantiye Şefi / Mimar (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Erdem');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#46/100]: Industry Archetype: İnsan Kaynakları Direktörü in Eczacıbaşı Holding', () => {
    const cv = `
Gamze Şen
İstanbul / Beşiktaş
İnsan Kaynakları Direktörü

DENEYİM
Eczacıbaşı Holding - İnsan Kaynakları Direktörü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Şen');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#47/100]: Industry Archetype: Dijital Pazarlama Müdürü in Hepsiburada', () => {
    const cv = `
Ozan Barış
İstanbul / Beşiktaş
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada - Dijital Pazarlama Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ozan Barış');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#48/100]: Industry Archetype: Lojistik ve Tedarik Zinciri Müdürü in DHL Global', () => {
    const cv = `
Turgut Yücel
İstanbul / Beşiktaş
Lojistik ve Tedarik Zinciri Müdürü

DENEYİM
DHL Global - Lojistik ve Tedarik Zinciri Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Turgut Yücel');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#49/100]: Industry Archetype: Üretim Mühendisi in Ford Otosan', () => {
    const cv = `
Sinan Kılıç
İstanbul / Beşiktaş
Üretim Mühendisi

DENEYİM
Ford Otosan - Üretim Mühendisi (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sinan Kılıç');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#50/100]: Industry Archetype: Otel Genel Müdürü in Hilton Hotels', () => {
    const cv = `
Ceyda Uslu
İstanbul / Beşiktaş
Otel Genel Müdürü

DENEYİM
Hilton Hotels - Otel Genel Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceyda Uslu');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#51/100]: Industry Archetype: Çağrı Merkezi Operasyon Müdürü in Mplus Group', () => {
    const cv = `
Kemal Aksoy
İstanbul / Beşiktaş
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Mplus Group - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Aksoy');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#52/100]: Industry Archetype: Bölge Satış Müdürü in Coca-Cola İçecek', () => {
    const cv = `
Banu Tekin
İstanbul / Beşiktaş
Bölge Satış Müdürü

DENEYİM
Coca-Cola İçecek - Bölge Satış Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Banu Tekin');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#53/100]: Industry Archetype: Kardiyoloji Uzmanı in Acıbadem Sağlık Grubu', () => {
    const cv = `
Dr. Metin Çelik
İstanbul / Beşiktaş
Kardiyoloji Uzmanı

DENEYİM
Acıbadem Sağlık Grubu - Kardiyoloji Uzmanı (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Metin Çelik');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#54/100]: Industry Archetype: Avukat / Hukuk Müşaviri in Paksoy Hukuk Bürosu', () => {
    const cv = `
Av. Zeynep Kaya
İstanbul / Beşiktaş
Avukat / Hukuk Müşaviri

DENEYİM
Paksoy Hukuk Bürosu - Avukat / Hukuk Müşaviri (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Zeynep Kaya');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#55/100]: Industry Archetype: Şantiye Şefi / Mimar in Rönesans Holding', () => {
    const cv = `
Murat Erdem
İstanbul / Beşiktaş
Şantiye Şefi / Mimar

DENEYİM
Rönesans Holding - Şantiye Şefi / Mimar (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Murat Erdem');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#56/100]: Industry Archetype: İnsan Kaynakları Direktörü in Eczacıbaşı Holding', () => {
    const cv = `
Gamze Şen
İstanbul / Beşiktaş
İnsan Kaynakları Direktörü

DENEYİM
Eczacıbaşı Holding - İnsan Kaynakları Direktörü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Gamze Şen');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#57/100]: Industry Archetype: Dijital Pazarlama Müdürü in Hepsiburada', () => {
    const cv = `
Ozan Barış
İstanbul / Beşiktaş
Dijital Pazarlama Müdürü

DENEYİM
Hepsiburada - Dijital Pazarlama Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ozan Barış');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#58/100]: Industry Archetype: Lojistik ve Tedarik Zinciri Müdürü in DHL Global', () => {
    const cv = `
Turgut Yücel
İstanbul / Beşiktaş
Lojistik ve Tedarik Zinciri Müdürü

DENEYİM
DHL Global - Lojistik ve Tedarik Zinciri Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Turgut Yücel');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#59/100]: Industry Archetype: Üretim Mühendisi in Ford Otosan', () => {
    const cv = `
Sinan Kılıç
İstanbul / Beşiktaş
Üretim Mühendisi

DENEYİM
Ford Otosan - Üretim Mühendisi (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Sinan Kılıç');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 3 [#60/100]: Industry Archetype: Otel Genel Müdürü in Hilton Hotels', () => {
    const cv = `
Ceyda Uslu
İstanbul / Beşiktaş
Otel Genel Müdürü

DENEYİM
Hilton Hotels - Otel Genel Müdürü (2018 - 2024)
Stratejik yönetim ve operasyonel mükemmellik.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ceyda Uslu');
    expect(canonical.primaryRole).toBeDefined();
    expect(res.experiences).toHaveLength(1);
    expect(graph.getActiveNodesByType('PRIMARY_ROLE').length).toBeGreaterThanOrEqual(1);
  });

  it('Category 4 [#61/100]: Firewall Isolation: Kamu Yönetimi Degree vs Call Center Sector (Variant 1)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#62/100]: Firewall Isolation: Uluslararası İlişkiler vs Software Sector (Variant 2)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Uluslararası İlişkiler Lisans (2010 - 2014)

DENEYİM
Trendyol - Backend Developer (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#63/100]: Firewall Isolation: Turizm İşletmeciliği vs Automotive Sector (Variant 3)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Turizm İşletmeciliği Lisans (2010 - 2014)

DENEYİM
Tofaş - Üretim Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#64/100]: Firewall Isolation: Sağlık Yönetimi vs Retail Sector (Variant 4)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Sağlık Yönetimi Lisans (2010 - 2014)

DENEYİM
LC Waikiki - Mağaza Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#65/100]: Firewall Isolation: Gıda Mühendisliği vs Insurance Sector (Variant 5)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Gıda Mühendisliği Lisans (2010 - 2014)

DENEYİM
Allianz Sigorta - Hasar Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#66/100]: Firewall Isolation: Kamu Yönetimi Degree vs Call Center Sector (Variant 6)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#67/100]: Firewall Isolation: Uluslararası İlişkiler vs Software Sector (Variant 7)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Uluslararası İlişkiler Lisans (2010 - 2014)

DENEYİM
Trendyol - Backend Developer (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#68/100]: Firewall Isolation: Turizm İşletmeciliği vs Automotive Sector (Variant 8)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Turizm İşletmeciliği Lisans (2010 - 2014)

DENEYİM
Tofaş - Üretim Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#69/100]: Firewall Isolation: Sağlık Yönetimi vs Retail Sector (Variant 9)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Sağlık Yönetimi Lisans (2010 - 2014)

DENEYİM
LC Waikiki - Mağaza Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#70/100]: Firewall Isolation: Gıda Mühendisliği vs Insurance Sector (Variant 10)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Gıda Mühendisliği Lisans (2010 - 2014)

DENEYİM
Allianz Sigorta - Hasar Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#71/100]: Firewall Isolation: Kamu Yönetimi Degree vs Call Center Sector (Variant 11)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#72/100]: Firewall Isolation: Uluslararası İlişkiler vs Software Sector (Variant 12)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Uluslararası İlişkiler Lisans (2010 - 2014)

DENEYİM
Trendyol - Backend Developer (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#73/100]: Firewall Isolation: Turizm İşletmeciliği vs Automotive Sector (Variant 13)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Turizm İşletmeciliği Lisans (2010 - 2014)

DENEYİM
Tofaş - Üretim Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#74/100]: Firewall Isolation: Sağlık Yönetimi vs Retail Sector (Variant 14)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Sağlık Yönetimi Lisans (2010 - 2014)

DENEYİM
LC Waikiki - Mağaza Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#75/100]: Firewall Isolation: Gıda Mühendisliği vs Insurance Sector (Variant 15)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Gıda Mühendisliği Lisans (2010 - 2014)

DENEYİM
Allianz Sigorta - Hasar Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#76/100]: Firewall Isolation: Kamu Yönetimi Degree vs Call Center Sector (Variant 16)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Kamu Yönetimi Lisans (2010 - 2014)

DENEYİM
IGS Türkiye - Çağrı Merkezi Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#77/100]: Firewall Isolation: Uluslararası İlişkiler vs Software Sector (Variant 17)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Uluslararası İlişkiler Lisans (2010 - 2014)

DENEYİM
Trendyol - Backend Developer (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#78/100]: Firewall Isolation: Turizm İşletmeciliği vs Automotive Sector (Variant 18)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Turizm İşletmeciliği Lisans (2010 - 2014)

DENEYİM
Tofaş - Üretim Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#79/100]: Firewall Isolation: Sağlık Yönetimi vs Retail Sector (Variant 19)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Sağlık Yönetimi Lisans (2010 - 2014)

DENEYİM
LC Waikiki - Mağaza Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 4 [#80/100]: Firewall Isolation: Gıda Mühendisliği vs Insurance Sector (Variant 20)', () => {
    const cv = `
Bülent Güneş
İstanbul / Maltepe
Operasyon Yöneticisi

EĞİTİM
Anadolu Üniversitesi - Gıda Mühendisliği Lisans (2010 - 2014)

DENEYİM
Allianz Sigorta - Hasar Müdürü (2016 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5321112233
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Bülent Güneş');
    expect(canonical.fullName).not.toBe('Ali Vural');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Category 5 [#81/100]: Multilingual & Special Format CV #1', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 01

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#82/100]: Multilingual & Special Format CV #2', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 02

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#83/100]: Multilingual & Special Format CV #3', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 03

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#84/100]: Multilingual & Special Format CV #4', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 04

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#85/100]: Multilingual & Special Format CV #5', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 05

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#86/100]: Multilingual & Special Format CV #6', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 06

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#87/100]: Multilingual & Special Format CV #7', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 07

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#88/100]: Multilingual & Special Format CV #8', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 08

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#89/100]: Multilingual & Special Format CV #9', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 09

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#90/100]: Multilingual & Special Format CV #10', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 10

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#91/100]: Multilingual & Special Format CV #11', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 11

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#92/100]: Multilingual & Special Format CV #12', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 12

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#93/100]: Multilingual & Special Format CV #13', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 13

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#94/100]: Multilingual & Special Format CV #14', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 14

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#95/100]: Multilingual & Special Format CV #15', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 15

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#96/100]: Multilingual & Special Format CV #16', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 16

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#97/100]: Multilingual & Special Format CV #17', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 17

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#98/100]: Multilingual & Special Format CV #18', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 18

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#99/100]: Multilingual & Special Format CV #19', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 19

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });

  it('Category 5 [#100/100]: Multilingual & Special Format CV #20', () => {
    const cv = `
CURRICULUM VITAE
Elena Petrova
İzmir / Çeşme | elena@example.com | +90 533 111 22 20

PROFESSIONAL SUMMARY
Senior Hotel & Guest Relations Manager with 10+ years experience.

LANGUAGES
English - Fluent (C2)
German - Advanced (C1)
Turkish - Fluent (C1)

PROFESSIONAL EXPERIENCE
Swissotel Grand Efes - Guest Relations Director (2018 - 2024)
Team leadership and VIP guest relations management.
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Elena Petrova');
    expect(canonical.primaryRole).toMatch(/Guest Relations|Müşteri İlişkileri|Hotel/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.languages.length).toBeGreaterThanOrEqual(1);
    expect(graph.getFirewallViolations()).toHaveLength(0);
  });
});
