import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { extractCandidateName } from './cv-name-extractor';

describe('CV Extraction Engine 12.0 — Zero False Positive Budget & Adversarial Infiltration Gate', () => {
  // 1. Adversarial Sector Injection (Education degree must NEVER define professional sector)
  it('Adversarial 1: Degree "Kamu Yönetimi" with tech job NEVER yields "Kamu / Belediye" sector', () => {
    const cv = `Barış Tunç\nbaris@tech.com | İstanbul / Kadıköy\nFrontend Geliştirici\n\nİŞ DENEYİMİ\nTrendyol - Frontend Developer (2020 - 2024)\n\nEĞİTİM\nAnadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2018`;
    const det = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    expect(canonical.primarySector).not.toMatch(/Kamu|Belediye/i);
  });

  it('Adversarial 2: Degree "Turizm İşletmeciliği" with finance job NEVER yields "Turizm" sector', () => {
    const cv = `Cansu Yıldırım\ncansu@finans.com | Ankara / Çankaya\nFinansal Analist\n\nİŞ DENEYİMİ\nGaranti BBVA - Kredi Analisti (2019 - 2024)\n\nEĞİTİM\nAkdeniz Üniversitesi - Turizm İşletmeciliği (2018)`;
    const det = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.primarySector).toBe('Finans / Bankacılık');
    expect(canonical.primarySector).not.toMatch(/Turizm|Otelcilik/i);
  });

  // 2. Adversarial Role Promotion (Skill bullet "Uzman" must NEVER promote to role "Uzman")
  it('Adversarial 3: Skill bullet "React - Uzman" NEVER yields desiredRole = "Uzman"', () => {
    const cv = `Deniz Er\ndeniz@example.com | İzmir / Konak\nFull Stack Geliştirici\n\nİŞ DENEYİMİ\nInsider - Yazılım Geliştirici (2021 - 2024)\n\nBECERİLER\nReact - Uzman\nNode.js - İleri Düzey\nKubernetes - Uzman`;
    const det = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.primaryRole).toMatch(/Full Stack|Yazılım Geliştirici/i);
    expect(canonical.primaryRole).not.toBe('Uzman');
  });

  // 3. Adversarial References Isolation (Reference person must NEVER leak into candidate name/role)
  it('Adversarial 4: Reference "Ahmet Yılmaz - Genel Müdür" NEVER leaks into candidate name or role', () => {
    const cv = `Gizem Aktaş\ngizem@example.com | İstanbul / Maltepe\nSatış Temsilcisi\n\nİŞ DENEYİMİ\nLC Waikiki - Satış Danışmanı (2020 - 2024)\n\nREFERANSLAR\nAhmet Yılmaz - Genel Müdür, ABC Holding\nTelefon: 0532 999 88 77`;
    const det = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Gizem Aktaş');
    expect(canonical.fullName).not.toBe('Ahmet Yılmaz');
    expect(canonical.primaryRole).toMatch(/Satış Danışmanı|Satış Temsilcisi/i);
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  // 4. Adversarial Company Name False Positive (Company "Doktor Takvimi A.Ş." must NEVER yield role "Doktor")
  it('Adversarial 5: Company "Doktor Takvimi A.Ş." with Software role NEVER yields role = "Doktor"', () => {
    const cv = `Haluk Bilginer\nhaluk@tech.com | İstanbul / Şişli\nBackend Developer\n\nİŞ DENEYİMİ\nDoktor Takvimi A.Ş. - Yazılım Mühendisi (2019 - 2024)\nSağlık randevu sistemleri geliştirme.`;
    const det = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Haluk Bilginer');
    expect(canonical.primaryRole).toMatch(/Yazılım Mühendisi|Yazılım Geliştirici/i);
    expect(canonical.primaryRole).not.toBe('Doktor');
  });

  // 5. Adversarial Location Isolation (City line "İstanbul" must NEVER become candidate fullName)
  it('Adversarial 6: Line "İstanbul / Maltepe" in header NEVER becomes candidate fullName', () => {
    const cv = `İstanbul / Maltepe\niletisim@example.com | 0532 000 11 22\nMüşteri Temsilcisi\n\nİŞ DENEYİMİ\nVodafone - Müşteri Temsilcisi (2020 - 2024)`;
    const name = extractCandidateName(cv);
    expect(name).toBeNull();

    const det = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    expect(canonical.fullName || '').not.toBe('İstanbul');
    expect(canonical.fullName || '').not.toBe('Maltepe');
  });

  // 6. Zero Defaulting across completely unanchored CV
  it('Adversarial 7: Location-less and Role-less CV NEVER defaults to "İstanbul" or "Uzman"', () => {
    const minimalCv = `İpek Soylu\nipek@example.com\n\nÖZET\nKariyerime yeni bir başlangıç yapmak istiyorum.`;
    const det = extractDeterministicCv(minimalCv);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('İpek Soylu');
    expect(canonical.residenceCity || '').toBe('');
    expect(canonical.primaryRole || '').not.toBe('Uzman');
    expect(canonical.primaryRole || '').not.toBe('Müdür');
    expect(canonical.primarySector || '').not.toBe('Kamu / Belediye');
  });
});
