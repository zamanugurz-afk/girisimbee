import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

describe('CV Extraction Engine 11.0 — Metamorphic & Invariant Robustness Suite', () => {
  // Base canonical software engineer profile
  const baseCv = `
Selim Çetin
selim.cetin@example.com | 0532 999 88 77
İstanbul / Kadıköy
Kıdemli Yazılım Mühendisi

ÖZET
10 yıllık deneyimli backend mühendisi.

İŞ DENEYİMİ
Trendyol Tech - Kıdemli Yazılım Mühendisi (2020 - 2026)
Mikroservis mimarisi ve yüksek ölçekli sistemler yönetimi.

Getir - Yazılım Geliştirici (2016 - 2020)
Ödeme sistemleri geliştirme.

EĞİTİM
Yıldız Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2016

YETKİNLİKLER
Node.js, TypeScript, Go, PostgreSQL, Redis, Kubernetes
`;

  // --------------------------------------------------------------------------
  // 1. POSITIVE METAMORPHIC TRANSFORMATIONS (Semantic Equivalence)
  // --------------------------------------------------------------------------
  it('Metamorphic 1: Header uppercase vs Titlecase mutation produces identical canonical output', () => {
    const uppercaseHeadingCv = baseCv
      .replace('İŞ DENEYİMİ', 'İ S   D E N E Y İ M İ')
      .replace('EĞİTİM', 'E Ğ İ T İ M')
      .replace('YETKİNLİKLER', 'Y E T K İ N L İ K L E R');

    const baseCanonical = mapCvToCanonicalTaxonomy(extractDeterministicCv(baseCv));
    const mutatedCanonical = mapCvToCanonicalTaxonomy(extractDeterministicCv(uppercaseHeadingCv));

    expect(mutatedCanonical.fullName).toBe(baseCanonical.fullName);
    expect(mutatedCanonical.primaryRole).toBe(baseCanonical.primaryRole);
    expect(mutatedCanonical.primarySector).toBe(baseCanonical.primarySector);
    expect(mutatedCanonical.residenceCity).toBe(baseCanonical.residenceCity);
    expect(mutatedCanonical.experiences.length).toBe(baseCanonical.experiences.length);
    expect(mutatedCanonical.educationList.length).toBe(baseCanonical.educationList.length);
  });

  it('Metamorphic 2: Delimiter mutation (Pipe vs Bullet vs Dash vs Unicode Box) preserves semantics', () => {
    const bulletCv = baseCv
      .replace(/\|/g, '•')
      .replace(/ - /g, ' – ');

    const baseCanonical = mapCvToCanonicalTaxonomy(extractDeterministicCv(baseCv));
    const bulletCanonical = mapCvToCanonicalTaxonomy(extractDeterministicCv(bulletCv));

    expect(bulletCanonical.fullName).toBe(baseCanonical.fullName);
    expect(bulletCanonical.primaryRole).toBe(baseCanonical.primaryRole);
    expect(bulletCanonical.residenceCity).toBe(baseCanonical.residenceCity);
    expect(bulletCanonical.experiences.length).toBe(baseCanonical.experiences.length);
  });

  it('Metamorphic 3: Emoji icon prefix mutation preserves identity and fields', () => {
    const emojiCv = `
👤 Selim Çetin
📧 selim.cetin@example.com 📱 0532 999 88 77 📍 İstanbul / Kadıköy
💼 Kıdemli Yazılım Mühendisi

📝 ÖZET
10 yıllık deneyimli backend mühendisi.

🏢 İŞ DENEYİMİ
• Trendyol Tech - Kıdemli Yazılım Mühendisi (2020 - 2026)
• Getir - Yazılım Geliştirici (2016 - 2020)

🎓 EĞİTİM
• Yıldız Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2016

⚡ YETKİNLİKLER
Node.js, TypeScript, Go, PostgreSQL
`;
    const res = extractDeterministicCv(emojiCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selim Çetin');
    expect(canonical.primaryRole).toMatch(/Yazılım Mühendisi|Yazılım Geliştirici/i);
    expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.residenceDistrict).toBe('Kadıköy');
  });

  // --------------------------------------------------------------------------
  // 2. NEGATIVE METAMORPHIC TRANSFORMATIONS (Firewall & Anti-Contamination)
  // --------------------------------------------------------------------------
  it('Negative Metamorphic 1: Adding "Kamu Yönetimi" degree NEVER changes primarySector to "Kamu"', () => {
    const contaminatedCv = baseCv + `
Anadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2014
`;
    const res = extractDeterministicCv(contaminatedCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.primarySector).toBe('Bilişim / Yazılım');
    expect(canonical.primarySector).not.toMatch(/Kamu|Belediye|Devlet/i);
  });

  it('Negative Metamorphic 2: Adding "React - Uzman" skill bullet NEVER promotes role to generic "Uzman"', () => {
    const contaminatedCv = baseCv.replace(
      'Node.js, TypeScript, Go, PostgreSQL, Redis, Kubernetes',
      'React - Uzman\nNode.js - Kıdemli Uzman\nKubernetes - Uzman',
    );
    const res = extractDeterministicCv(contaminatedCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.primaryRole).toMatch(/Yazılım Mühendisi|Yazılım Geliştirici/i);
    expect(canonical.primaryRole).not.toBe('Uzman');
  });

  it('Negative Metamorphic 3: Adding Reference person "Prof. Dr. Ahmet Yılmaz (Genel Müdür)" NEVER leaks into candidate name or role', () => {
    const contaminatedCv = baseCv + `
REFERANSLAR
Prof. Dr. Ahmet Yılmaz - Genel Müdür, Trendyol Tech
Telefon: 0533 111 22 33 | E-posta: ahmet.yilmaz@trendyol.com
`;
    const res = extractDeterministicCv(contaminatedCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Selim Çetin');
    expect(canonical.fullName).not.toBe('Ahmet Yılmaz');
    expect(canonical.primaryRole).not.toBe('Genel Müdür');
  });

  it('Negative Metamorphic 4: Adding corporate company address NEVER overwrites candidate residence city', () => {
    const ankaraCv = `
Deniz Soydan
deniz@example.com | Ankara / Çankaya
Proje Müdürü

İŞ DENEYİMİ
İstanbul Bilişim A.Ş. (İstanbul / Maslak) - Proje Müdürü (2020 - 2024)
`;
    const res = extractDeterministicCv(ankaraCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Deniz Soydan');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.residenceDistrict).toBe('Çankaya');
  });
});
