import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { extractCandidateName } from './cv-name-extractor';

describe('CV Extraction Engine 11.0 — Zero False Positive Budget & Anti-Hallucination Suite', () => {
  // --------------------------------------------------------------------------
  // 1. HEADLESS CVs (No candidate name in document)
  // --------------------------------------------------------------------------
  it('False Positive 1: Headless CV starting with EĞİTİM yields fullName = null or ""', () => {
    const headlessCv = `
EĞİTİM
İstanbul Teknik Üniversitesi - Bilgisayar Mühendisliği (2018 - 2022)

İŞ DENEYİMİ
Trendyol - Yazılım Mühendisi (2022 - 2024)
`;
    const name = extractCandidateName(headlessCv);
    expect(name).toBeNull();

    const res = extractDeterministicCv(headlessCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.fullName || '').toBe('');
    expect(canonical.fullName || '').not.toMatch(/Eğitim|Trendyol|Mühendisi/i);
  });

  it('False Positive 2: Headless CV with KİŞİSEL BİLGİLER heading yields zero name hallucination', () => {
    const headlessCv = `
KİŞİSEL BİLGİLER
Telefon: 0532 000 00 00
E-posta: contact@example.com
Adres: Kadıköy / İstanbul

İŞ DENEYİMİ
Müdür Yardımcısı - Finansbank (2020 - 2024)
`;
    const name = extractCandidateName(headlessCv);
    expect(name).toBeNull();
  });

  // --------------------------------------------------------------------------
  // 2. LOCATION ISOLATION & ZERO DEFAULTING
  // --------------------------------------------------------------------------
  it('False Positive 3: CV without location NEVER defaults to "İstanbul"', () => {
    const noLocCv = `
Mert Kaya
mert@example.com
Yazılım Geliştirici

İŞ DENEYİMİ
Remote Tech - Yazılım Geliştirici (2021 - 2024)
`;
    const res = extractDeterministicCv(noLocCv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    expect(canonical.residenceCity || '').toBe('');
  });

  // --------------------------------------------------------------------------
  // 3. ZERO SECTOR HALLUCINATION FROM ACADEMIC DEGREE
  // --------------------------------------------------------------------------
  it('False Positive 4: Student with "Kamu Yönetimi" degree and 0 job history yields empty sector', () => {
    const studentCv = `
Aylin Şimşek
aylin@example.com
İzmir

EĞİTİM
Anadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2024
`;
    const res = extractDeterministicCv(studentCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Aylin Şimşek');
    expect(canonical.experiences.length).toBe(0);
    expect(canonical.primarySector).toBe('');
    expect(canonical.primarySector).not.toMatch(/Kamu|Belediye/i);
  });

  // --------------------------------------------------------------------------
  // 4. ENTITY RECONSTRUCTION ZERO FRAGMENTATION
  // --------------------------------------------------------------------------
  it('False Positive 5: Single experience with 5 bullet items NEVER fragments into 5 jobs', () => {
    const singleJobCv = `
Burak Yılmaz
İstanbul | Satış Müdürü

İŞ DENEYİMİ
ABC Holding - Satış Müdürü (2020 - 2024)
• Satış ekibi yönetimi
• Bütçe ve hedef takibi
• Yeni müşteri kazanımı
• Raporlama ve analiz
• Müşteri ilişkileri yönetimi
`;
    const res = extractDeterministicCv(singleJobCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.experiences.length).toBe(1);
    expect(canonical.experiences[0].company).toMatch(/ABC Holding/i);
    expect(canonical.experiences[0].role).toMatch(/Satış Müdürü/i);
  });
});
