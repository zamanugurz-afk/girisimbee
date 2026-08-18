import { describe, expect, it } from 'vitest';
import {
  extractDeterministicCv,
  extractDeterministicLocations,
  extractDeterministicEducation,
  extractDeterministicExperiences,
  extractDeterministicSkillsAndTools,
  extractDeterministicLanguagesAndCerts,
  parseDateRangeText,
} from '@/features/candidates/cv/cv-deterministic-extractor';

describe('CV Extraction 2.0 - Deterministic First Tests', () => {
  it('extracts Turkish cities, districts and Yakası combinations deterministically', () => {
    const loc1 = extractDeterministicLocations('İkamet: Maltepe, İstanbul');
    expect(loc1.city).toBe('İstanbul');
    expect(loc1.district).toBe('Maltepe');

    const loc2 = extractDeterministicLocations('Ankara / Çankaya bölgesinde ikamet etmekteyim');
    expect(loc2.city).toBe('Ankara');
    expect(loc2.district).toBe('Çankaya');

    const loc3 = extractDeterministicLocations('İstanbul Anadolu Yakası');
    expect(loc3.city).toBe('İstanbul');

    const loc4 = extractDeterministicLocations('İzmir Bornova');
    expect(loc4.city).toBe('İzmir');
    expect(loc4.district).toBe('Bornova');
  });

  it('parses various date range formats deterministically', () => {
    const d1 = parseDateRangeText('2023 - 2025');
    expect(d1?.startYear).toBe(2023);
    expect(d1?.endYear).toBe(2025);
    expect(d1?.isCurrent).toBe(false);

    const d2 = parseDateRangeText('01.2023 - 12.2025');
    expect(d2?.startYear).toBe(2023);
    expect(d2?.endYear).toBe(2025);

    const d3 = parseDateRangeText('Eylül 2025 - Ağustos 2026 (1 yıl)');
    expect(d3?.startYear).toBe(2025);
    expect(d3?.endYear).toBe(2026);
    expect(d3?.duration).toBe('1 yıl');

    const d4 = parseDateRangeText('2023 - Günümüz');
    expect(d4?.startYear).toBe(2023);
    expect(d4?.isCurrent).toBe(true);

    const d5 = parseDateRangeText('2020 - Devam ediyor');
    expect(d5?.startYear).toBe(2020);
    expect(d5?.isCurrent).toBe(true);
  });

  it('extracts multiple education degrees deterministically without collapsing', () => {
    const cvEduText = `
EĞİTİM BİLGİLERİ
Marmara Üniversitesi
Sermaye Piyasası ve Borsa (Yüksek Lisans)
2020 - 2022

Anadolu Üniversitesi
Kamu Yönetimi (Lisans)
2011 - 2015
`;
    const eduList = extractDeterministicEducation(cvEduText);
    expect(eduList.length).toBe(2);
    expect(eduList[0].school).toContain('Marmara');
    expect(eduList[0].level).toBe('Yüksek Lisans');
    expect(eduList[1].school).toContain('Anadolu');
    expect(eduList[1].level).toBe('Lisans');
  });

  it('extracts multiple experiences deterministically without reduction', () => {
    const cvExpText = `
İŞ DENEYİMİ
IGS Türkiye
Telemarketing ve Ticari Destek Operasyonları Müdürü
2025 - 2026

GEDİK YATIRIM
Alternatif Satış Kanalları Müdürü
2023 - 2025

Mehrwerk
Sigorta Çağrı Merkezi Operasyon Müdürü
2019 - 2023
`;
    const expList = extractDeterministicExperiences(cvExpText);
    expect(expList.length).toBe(3);
    expect(expList[0].company).toContain('IGS');
    expect(expList[1].company).toContain('GEDİK');
    expect(expList[2].company).toContain('Mehrwerk');
  });

  it('extracts skills, tools, and sectors deterministically with aliases', () => {
    const text = 'Satış Yönetimi, Operasyon Yönetimi, MS Excel, Power BI, Salesforce, Bankacılık ve Sigorta sektörlerinde uzman.';
    const result = extractDeterministicSkillsAndTools(text);

    expect(result.professionalSkills).toContain('Satış Yönetimi');
    expect(result.professionalSkills).toContain('Operasyon Yönetimi');
    expect(result.tools).toContain('MS Excel');
    expect(result.tools).toContain('Power BI');
    expect(result.tools).toContain('Salesforce');
    expect(result.sectors).toContain('Finans / Bankacılık');
    expect(result.sectors).toContain('Sigortacılık');
  });

  it('extracts languages and certificates deterministically', () => {
    const text = 'Diller: Türkçe, İngilizce, Almanca. Sertifikalar: SEGEM, PMP, AWS Certified.';
    const result = extractDeterministicLanguagesAndCerts(text);

    expect(result.languages).toContain('Türkçe');
    expect(result.languages).toContain('İngilizce');
    expect(result.languages).toContain('Almanca');
    expect(result.certificates).toContain('SEGEM');
    expect(result.certificates).toContain('PMP');
    expect(result.certificates).toContain('AWS Certified');
  });

  it('extracts entire CV payload completely without AI', () => {
    const fullCvText = `
Uğur Zaman
Maltepe / İstanbul
0555 123 45 67 - ugur@example.com

ÖZET
19 yıllık profesyonel kariyerimde bankacılık ve sigortacılık sektörlerinde proje, satış ve operasyon yönetimi alanlarında uzmanlaştım.

İŞ DENEYİMİ
IGS Türkiye
Telemarketing ve Ticari Destek Operasyonları Müdürü
2025 - 2026
Çağrı Merkezi Satış Yönetimi, Yeni Müşteri Kazanımı.

GEDİK YATIRIM
Alternatif Satış Kanalları Müdürü
2023 - 2025
Satış Yönetimi, Alternatif Satış Kanalları Yönetimi.

EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası ve Borsa (Yüksek Lisans) - 2022
Anadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2015

YETKİNLİKLER & ARAÇLAR
Satış Yönetimi, Operasyon Yönetimi, Ekip Yönetimi, CRM, MS Excel

DİLLER
Türkçe, İngilizce
`;

    const payload = extractDeterministicCv(fullCvText);
    expect(payload.experiences.length).toBe(2);
    expect(payload.education.length).toBe(2);
    expect(payload.skills.length).toBeGreaterThanOrEqual(4);
    expect(payload.tools).toContain('MS Excel');
    expect(payload.tools).toContain('CRM');
    expect(payload.locations).toContain('İstanbul');
    expect(payload.summary).toContain('19 yıllık');
  });
});
