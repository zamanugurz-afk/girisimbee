import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

describe('CV Extraction Engine 12.0 — Deep Metamorphic & Mutation Invariance Suite', () => {
  const baseCv = `Zeynep Karataş\nzeynep@tech.com | 0532 111 22 33 | Ankara / Çankaya\nKıdemli Mobil Geliştirici\n\nÖZET\nFlutter ve iOS ile 6 yıllık mobil uygulama geliştirme tecrübesi.\n\nİŞ DENEYİMİ\nTrendyol - Mobil Yazılım Mühendisi (2020 - 2024)\n• Swift ve Kotlin ile native modül geliştirme\n• CI/CD pipeline kurulumu\n\nEĞİTİM\nODTÜ - Bilgisayar Mühendisliği (Lisans) - 2018\n\nBECERİLER\nFlutter, Swift, Kotlin, iOS, Android, Git`;

  const getCanonical = (cvText: string) => {
    const det = extractDeterministicCv(cvText);
    return mapCvToCanonicalTaxonomy(det);
  };

  const baseResult = getCanonical(baseCv);

  it('Metamorphic 1: Baseline extraction is verified', () => {
    expect(baseResult.fullName).toBe('Zeynep Karataş');
    expect(baseResult.primaryRole).toMatch(/Mobil|Yazılım/i);
    expect(baseResult.primarySector).toBe('Bilişim / Yazılım');
    expect(baseResult.residenceCity).toBe('Ankara');
    expect(baseResult.residenceDistrict).toBe('Çankaya');
    expect(baseResult.experiences.length).toBeGreaterThanOrEqual(1);
    expect(baseResult.educationList.length).toBeGreaterThanOrEqual(1);
  });

  it('Metamorphic 2: Uppercase Mutation preserves canonical entities', () => {
    const uppercaseCv = `ZEYNEP KARATAŞ\nZEYNEP@TECH.COM | 0532 111 22 33 | ANKARA / ÇANKAYA\nKIDEMLİ MOBİL GELİŞTİRİCİ\n\nÖZET\nFLUTTER VE IOS İLE 6 YILLIK MOBİL UYGULAMA GELİŞTİRME TECRÜBESİ.\n\nİŞ DENEYİMİ\nTRENDYOL - MOBİL YAZILIM MÜHENDİSİ (2020 - 2024)\n• SWIFT VE KOTLIN İLE NATIVE MODÜL GELİŞTİRME\n\nEĞİTİM\nODTÜ - BİLGİSAYAR MÜHENDİSLİĞİ (LİSANS) - 2018`;
    const res = getCanonical(uppercaseCv);

    expect(res.fullName).toBe('Zeynep Karataş');
    expect(res.residenceCity).toBe('Ankara');
    expect(res.primarySector).toBe('Bilişim / Yazılım');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('Metamorphic 3: Bullet Mutation (• vs - vs * vs ▶ vs ■) preserves experience parsing', () => {
    const bulletTypes = ['*', '-', '·', '▶', '■', '–', '—'];
    for (const b of bulletTypes) {
      const mutatedCv = baseCv.replace(/•/g, b);
      const res = getCanonical(mutatedCv);
      expect(res.fullName).toBe('Zeynep Karataş');
      expect(res.experiences.length).toBe(baseResult.experiences.length);
    }
  });

  it('Metamorphic 4: Delimiter Mutation (| vs / vs — vs ,) in header preserves contact info', () => {
    const pipeHeader = `Zeynep Karataş\nzeynep@tech.com | 0532 111 22 33 | Ankara / Çankaya\nKıdemli Mobil Geliştirici`;
    const commaHeader = `Zeynep Karataş\nzeynep@tech.com, 0532 111 22 33, Ankara, Çankaya\nKıdemli Mobil Geliştirici`;
    const slashHeader = `Zeynep Karataş\nzeynep@tech.com / 0532 111 22 33 / Ankara / Çankaya\nKıdemli Mobil Geliştirici`;

    const res1 = getCanonical(baseCv.replace(pipeHeader, commaHeader));
    const res2 = getCanonical(baseCv.replace(pipeHeader, slashHeader));

    expect(res1.fullName).toBe('Zeynep Karataş');
    expect(res1.residenceCity).toBe('Ankara');
    expect(res2.fullName).toBe('Zeynep Karataş');
    expect(res2.residenceCity).toBe('Ankara');
  });

  it('Metamorphic 5: Section Order Permutation (Education first vs Experience first) preserves entities', () => {
    const eduFirstCv = `Zeynep Karataş\nzeynep@tech.com | 0532 111 22 33 | Ankara / Çankaya\nKıdemli Mobil Geliştirici\n\nEĞİTİM\nODTÜ - Bilgisayar Mühendisliği (Lisans) - 2018\n\nİŞ DENEYİMİ\nTrendyol - Mobil Yazılım Mühendisi (2020 - 2024)\n\nBECERİLER\nFlutter, Swift, Kotlin`;
    const res = getCanonical(eduFirstCv);

    expect(res.fullName).toBe('Zeynep Karataş');
    expect(res.residenceCity).toBe('Ankara');
    expect(res.primarySector).toBe('Bilişim / Yazılım');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
    expect(res.educationList.length).toBeGreaterThanOrEqual(1);
  });
});
