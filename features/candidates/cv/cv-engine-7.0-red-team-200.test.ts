import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { extractCandidateName } from './cv-name-extractor';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
  extractDeterministicLanguagesAndCerts,
} from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { cvService } from './cv.service';

describe('CV Extraction Engine 7.0 — Red Team Adversarial Corpus (200+ Scenarios)', () => {
  it('Adversarial Name #1: "EĞİTİM" at document start is never candidate name', () => {
    const cv = `
EĞİTİM
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('EĞİTİM');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #2: "EĞİTİM BİLGİLERİ" at document start is never candidate name', () => {
    const cv = `
EĞİTİM BİLGİLERİ
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('EĞİTİM BİLGİLERİ');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #3: "ÖĞRENİM" at document start is never candidate name', () => {
    const cv = `
ÖĞRENİM
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('ÖĞRENİM');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #4: "DENEYİM" at document start is never candidate name', () => {
    const cv = `
DENEYİM
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('DENEYİM');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #5: "İŞ DENEYİMİ" at document start is never candidate name', () => {
    const cv = `
İŞ DENEYİMİ
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('İŞ DENEYİMİ');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #6: "PROFESYONEL DENEYİM" at document start is never candidate name', () => {
    const cv = `
PROFESYONEL DENEYİM
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('PROFESYONEL DENEYİM');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #7: "BECERİLER" at document start is never candidate name', () => {
    const cv = `
BECERİLER
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('BECERİLER');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #8: "YETKİNLİKLER" at document start is never candidate name', () => {
    const cv = `
YETKİNLİKLER
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('YETKİNLİKLER');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #9: "UZMANLIKLAR" at document start is never candidate name', () => {
    const cv = `
UZMANLIKLAR
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('UZMANLIKLAR');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #10: "REFERANSLAR" at document start is never candidate name', () => {
    const cv = `
REFERANSLAR
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('REFERANSLAR');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #11: "PROJELER" at document start is never candidate name', () => {
    const cv = `
PROJELER
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('PROJELER');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #12: "YAYINLAR" at document start is never candidate name', () => {
    const cv = `
YAYINLAR
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('YAYINLAR');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #13: "SERTİFİKALAR" at document start is never candidate name', () => {
    const cv = `
SERTİFİKALAR
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('SERTİFİKALAR');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #14: "DİLLER" at document start is never candidate name', () => {
    const cv = `
DİLLER
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('DİLLER');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #15: "YABANCI DİL" at document start is never candidate name', () => {
    const cv = `
YABANCI DİL
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('YABANCI DİL');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #16: "HOBİLER" at document start is never candidate name', () => {
    const cv = `
HOBİLER
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('HOBİLER');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #17: "ÖZGEÇMİŞ" at document start is never candidate name', () => {
    const cv = `
ÖZGEÇMİŞ
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('ÖZGEÇMİŞ');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #18: "CV" at document start is never candidate name', () => {
    const cv = `
CV
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('CV');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #19: "RESUME" at document start is never candidate name', () => {
    const cv = `
RESUME
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('RESUME');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #20: "CURRICULUM VITAE" at document start is never candidate name', () => {
    const cv = `
CURRICULUM VITAE
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('CURRICULUM VITAE');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #21: "PROFILE" at document start is never candidate name', () => {
    const cv = `
PROFILE
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('PROFILE');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #22: "SUMMARY" at document start is never candidate name', () => {
    const cv = `
SUMMARY
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('SUMMARY');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #23: "HAKKIMDA" at document start is never candidate name', () => {
    const cv = `
HAKKIMDA
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('HAKKIMDA');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #24: "KİŞİSEL BİLGİLER" at document start is never candidate name', () => {
    const cv = `
KİŞİSEL BİLGİLER
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('KİŞİSEL BİLGİLER');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #25: "İLETİŞİM" at document start is never candidate name', () => {
    const cv = `
İLETİŞİM
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('İLETİŞİM');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #26: "TRABZON" at document start is never candidate name', () => {
    const cv = `
TRABZON
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('TRABZON');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #27: "İSTANBUL" at document start is never candidate name', () => {
    const cv = `
İSTANBUL
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('İSTANBUL');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #28: "ANKARA" at document start is never candidate name', () => {
    const cv = `
ANKARA
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('ANKARA');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #29: "İNGİLİZCE" at document start is never candidate name', () => {
    const cv = `
İNGİLİZCE
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('İNGİLİZCE');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Name #30: "ALMANCA" at document start is never candidate name', () => {
    const cv = `
ALMANCA
Ayşe Yılmaz
Yazılım Geliştirici
ayse@example.com
DENEYİM
Trendyol - Frontend Developer (2021 - 2024)
`;
    const name = extractCandidateName(cv);
    expect(name).not.toBe('ALMANCA');
    expect(name).toBe('Ayşe Yılmaz');
  });

  it('Adversarial Sector #31: "Kamu Yönetimi" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)

DENEYİM
Mplus Çağrı Merkezi - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #32: "Uluslararası İlişkiler" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Uluslararası İlişkiler Lisans (2012 - 2016)

DENEYİM
Insider Software - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #33: "Siyaset Bilimi" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Siyaset Bilimi Lisans (2012 - 2016)

DENEYİM
Garanti Bankası - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #34: "Sağlık Yönetimi" degree never forces false sector "Sağlık / Medikal"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Sağlık Yönetimi Lisans (2012 - 2016)

DENEYİM
LC Waikiki - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('Adversarial Sector #35: "Turizm İşletmeciliği" degree never forces false sector "Turizm / Otelcilik"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Turizm İşletmeciliği Lisans (2012 - 2016)

DENEYİM
Ford Otosan - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('Adversarial Sector #36: "Gıda Mühendisliği" degree never forces false sector "Gıda / Tarım"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği Lisans (2012 - 2016)

DENEYİM
Anadolu Sigorta - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Gıda / Tarım');
  });

  it('Adversarial Sector #37: "Maden Mühendisliği" degree never forces false sector "Madencilik"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Maden Mühendisliği Lisans (2012 - 2016)

DENEYİM
Hepsiburada - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Madencilik');
  });

  it('Adversarial Sector #38: "Orman Endüstri Mühendisliği" degree never forces false sector "Ormancılık"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Orman Endüstri Mühendisliği Lisans (2012 - 2016)

DENEYİM
Turkcell - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Ormancılık');
  });

  it('Adversarial Sector #39: "Tekstil Mühendisliği" degree never forces false sector "Tekstil"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Tekstil Mühendisliği Lisans (2012 - 2016)

DENEYİM
DHL Lojistik - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Tekstil');
  });

  it('Adversarial Sector #40: "Kimya" degree never forces false sector "Kimya"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Kimya Lisans (2012 - 2016)

DENEYİM
Bahçeşehir Koleji - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kimya');
  });

  it('Adversarial Sector #41: "Kamu Yönetimi" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)

DENEYİM
Mplus Çağrı Merkezi - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #42: "Uluslararası İlişkiler" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Uluslararası İlişkiler Lisans (2012 - 2016)

DENEYİM
Insider Software - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #43: "Siyaset Bilimi" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Siyaset Bilimi Lisans (2012 - 2016)

DENEYİM
Garanti Bankası - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #44: "Sağlık Yönetimi" degree never forces false sector "Sağlık / Medikal"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Sağlık Yönetimi Lisans (2012 - 2016)

DENEYİM
LC Waikiki - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('Adversarial Sector #45: "Turizm İşletmeciliği" degree never forces false sector "Turizm / Otelcilik"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Turizm İşletmeciliği Lisans (2012 - 2016)

DENEYİM
Ford Otosan - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('Adversarial Sector #46: "Gıda Mühendisliği" degree never forces false sector "Gıda / Tarım"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği Lisans (2012 - 2016)

DENEYİM
Anadolu Sigorta - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Gıda / Tarım');
  });

  it('Adversarial Sector #47: "Maden Mühendisliği" degree never forces false sector "Madencilik"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Maden Mühendisliği Lisans (2012 - 2016)

DENEYİM
Hepsiburada - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Madencilik');
  });

  it('Adversarial Sector #48: "Orman Endüstri Mühendisliği" degree never forces false sector "Ormancılık"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Orman Endüstri Mühendisliği Lisans (2012 - 2016)

DENEYİM
Turkcell - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Ormancılık');
  });

  it('Adversarial Sector #49: "Tekstil Mühendisliği" degree never forces false sector "Tekstil"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Tekstil Mühendisliği Lisans (2012 - 2016)

DENEYİM
DHL Lojistik - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Tekstil');
  });

  it('Adversarial Sector #50: "Kimya" degree never forces false sector "Kimya"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Kimya Lisans (2012 - 2016)

DENEYİM
Bahçeşehir Koleji - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kimya');
  });

  it('Adversarial Sector #51: "Kamu Yönetimi" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Kamu Yönetimi Lisans (2012 - 2016)

DENEYİM
Mplus Çağrı Merkezi - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #52: "Uluslararası İlişkiler" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Uluslararası İlişkiler Lisans (2012 - 2016)

DENEYİM
Insider Software - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #53: "Siyaset Bilimi" degree never forces false sector "Kamu / Belediye"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Siyaset Bilimi Lisans (2012 - 2016)

DENEYİM
Garanti Bankası - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kamu / Belediye');
  });

  it('Adversarial Sector #54: "Sağlık Yönetimi" degree never forces false sector "Sağlık / Medikal"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Sağlık Yönetimi Lisans (2012 - 2016)

DENEYİM
LC Waikiki - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Sağlık / Medikal');
  });

  it('Adversarial Sector #55: "Turizm İşletmeciliği" degree never forces false sector "Turizm / Otelcilik"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Turizm İşletmeciliği Lisans (2012 - 2016)

DENEYİM
Ford Otosan - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Turizm / Otelcilik');
  });

  it('Adversarial Sector #56: "Gıda Mühendisliği" degree never forces false sector "Gıda / Tarım"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Gıda Mühendisliği Lisans (2012 - 2016)

DENEYİM
Anadolu Sigorta - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Gıda / Tarım');
  });

  it('Adversarial Sector #57: "Maden Mühendisliği" degree never forces false sector "Madencilik"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Maden Mühendisliği Lisans (2012 - 2016)

DENEYİM
Hepsiburada - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Madencilik');
  });

  it('Adversarial Sector #58: "Orman Endüstri Mühendisliği" degree never forces false sector "Ormancılık"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Orman Endüstri Mühendisliği Lisans (2012 - 2016)

DENEYİM
Turkcell - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Ormancılık');
  });

  it('Adversarial Sector #59: "Tekstil Mühendisliği" degree never forces false sector "Tekstil"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Tekstil Mühendisliği Lisans (2012 - 2016)

DENEYİM
DHL Lojistik - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Tekstil');
  });

  it('Adversarial Sector #60: "Kimya" degree never forces false sector "Kimya"', () => {
    const cv = `
Cemil Demir
İstanbul / Şişli
Operasyon Yöneticisi

EĞİTİM
İstanbul Üniversitesi - Kimya Lisans (2012 - 2016)

DENEYİM
Bahçeşehir Koleji - Operasyon Yöneticisi (2018 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primarySector).not.toBe('Kimya');
  });

  it('Adversarial Role #61: Standalone keyword "Uzman" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Uzman
React Native - Uzman

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Uzman');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #62: Standalone keyword "Müdür" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Müdür
React Native - Müdür

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Müdür');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #63: Standalone keyword "Direktör" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Direktör
React Native - Direktör

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Direktör');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #64: Standalone keyword "Yönetici" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Yönetici
React Native - Yönetici

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Yönetici');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #65: Standalone keyword "Leader" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Leader
React Native - Leader

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Leader');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #66: Standalone keyword "Manager" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Manager
React Native - Manager

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Manager');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #67: Standalone keyword "Senior" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Senior
React Native - Senior

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Senior');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #68: Standalone keyword "Junior" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Junior
React Native - Junior

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Junior');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #69: Standalone keyword "Specialist" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Specialist
React Native - Specialist

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Specialist');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #70: Standalone keyword "Consultant" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Consultant
React Native - Consultant

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Consultant');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #71: Standalone keyword "Danışman" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Danışman
React Native - Danışman

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Danışman');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #72: Standalone keyword "Analist" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Analist
React Native - Analist

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Analist');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #73: Standalone keyword "Officer" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Officer
React Native - Officer

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Officer');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #74: Standalone keyword "Uzman" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Uzman
React Native - Uzman

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Uzman');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #75: Standalone keyword "Müdür" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Müdür
React Native - Müdür

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Müdür');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #76: Standalone keyword "Direktör" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Direktör
React Native - Direktör

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Direktör');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #77: Standalone keyword "Yönetici" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Yönetici
React Native - Yönetici

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Yönetici');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #78: Standalone keyword "Leader" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Leader
React Native - Leader

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Leader');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #79: Standalone keyword "Manager" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Manager
React Native - Manager

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Manager');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #80: Standalone keyword "Senior" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Senior
React Native - Senior

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Senior');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #81: Standalone keyword "Junior" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Junior
React Native - Junior

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Junior');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #82: Standalone keyword "Specialist" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Specialist
React Native - Specialist

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Specialist');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #83: Standalone keyword "Consultant" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Consultant
React Native - Consultant

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Consultant');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #84: Standalone keyword "Danışman" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Danışman
React Native - Danışman

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Danışman');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #85: Standalone keyword "Analist" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Analist
React Native - Analist

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Analist');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #86: Standalone keyword "Officer" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Officer
React Native - Officer

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Officer');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #87: Standalone keyword "Uzman" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Uzman
React Native - Uzman

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Uzman');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #88: Standalone keyword "Müdür" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Müdür
React Native - Müdür

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Müdür');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #89: Standalone keyword "Direktör" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Direktör
React Native - Direktör

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Direktör');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Adversarial Role #90: Standalone keyword "Yönetici" in skills/about does not replace authentic job title', () => {
    const cv = `
Gizem Aktaş
İstanbul / Beşiktaş
Kıdemli Mobil Uygulama Geliştiricisi

BECERİLER
Flutter - Yönetici
React Native - Yönetici

DENEYİM
Getir - Senior iOS Developer (2020 - 2024)
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.primaryRole).not.toBe('Yönetici');
    expect(res.primaryRole).toMatch(/iOS Developer|Mobil Uygulama|Geliştirici/i);
  });

  it('Experience Anti-Fragmentation #91: Pipe separators and responsibility bullets do not inflate job count (Scenario 1)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #92: Pipe separators and responsibility bullets do not inflate job count (Scenario 2)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #93: Pipe separators and responsibility bullets do not inflate job count (Scenario 3)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #94: Pipe separators and responsibility bullets do not inflate job count (Scenario 4)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #95: Pipe separators and responsibility bullets do not inflate job count (Scenario 5)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #96: Pipe separators and responsibility bullets do not inflate job count (Scenario 6)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #97: Pipe separators and responsibility bullets do not inflate job count (Scenario 7)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #98: Pipe separators and responsibility bullets do not inflate job count (Scenario 8)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #99: Pipe separators and responsibility bullets do not inflate job count (Scenario 9)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #100: Pipe separators and responsibility bullets do not inflate job count (Scenario 10)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #101: Pipe separators and responsibility bullets do not inflate job count (Scenario 11)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #102: Pipe separators and responsibility bullets do not inflate job count (Scenario 12)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #103: Pipe separators and responsibility bullets do not inflate job count (Scenario 13)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #104: Pipe separators and responsibility bullets do not inflate job count (Scenario 14)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #105: Pipe separators and responsibility bullets do not inflate job count (Scenario 15)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #106: Pipe separators and responsibility bullets do not inflate job count (Scenario 16)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #107: Pipe separators and responsibility bullets do not inflate job count (Scenario 17)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #108: Pipe separators and responsibility bullets do not inflate job count (Scenario 18)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #109: Pipe separators and responsibility bullets do not inflate job count (Scenario 19)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #110: Pipe separators and responsibility bullets do not inflate job count (Scenario 20)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #111: Pipe separators and responsibility bullets do not inflate job count (Scenario 21)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #112: Pipe separators and responsibility bullets do not inflate job count (Scenario 22)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #113: Pipe separators and responsibility bullets do not inflate job count (Scenario 23)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #114: Pipe separators and responsibility bullets do not inflate job count (Scenario 24)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #115: Pipe separators and responsibility bullets do not inflate job count (Scenario 25)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #116: Pipe separators and responsibility bullets do not inflate job count (Scenario 26)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #117: Pipe separators and responsibility bullets do not inflate job count (Scenario 27)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #118: Pipe separators and responsibility bullets do not inflate job count (Scenario 28)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #119: Pipe separators and responsibility bullets do not inflate job count (Scenario 29)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Experience Anti-Fragmentation #120: Pipe separators and responsibility bullets do not inflate job count (Scenario 30)', () => {
    const cv = `
Burak Yıldız
İstanbul / Maltepe
Satış Direktörü

İŞ DENEYİMİ
IGS Türkiye | Satış Müdürü | 2021 - 2024
Satış Ekibi Yönetimi | Yeni Müşteri Portföyü | KPI Takibi | Bütçe Yönetimi | Bayi Ağı

Mplus Group | Operasyon Müdürü | 2017 - 2021
Inbound Operasyon | Çağrı Merkezi | SLA Yönetimi | Kalite Güvence | Vardiya Planlama
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences).toHaveLength(2);
  });

  it('Reference Isolation #121: Referee contact details never contaminate candidate PII (Scenario 1)', () => {
    const cv = `
Kişisel Bilgiler
aday1@example.com
5301112231
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #122: Referee contact details never contaminate candidate PII (Scenario 2)', () => {
    const cv = `
Kişisel Bilgiler
aday2@example.com
5301112232
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #123: Referee contact details never contaminate candidate PII (Scenario 3)', () => {
    const cv = `
Kişisel Bilgiler
aday3@example.com
5301112233
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #124: Referee contact details never contaminate candidate PII (Scenario 4)', () => {
    const cv = `
Kişisel Bilgiler
aday4@example.com
5301112234
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #125: Referee contact details never contaminate candidate PII (Scenario 5)', () => {
    const cv = `
Kişisel Bilgiler
aday5@example.com
5301112235
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #126: Referee contact details never contaminate candidate PII (Scenario 6)', () => {
    const cv = `
Kişisel Bilgiler
aday6@example.com
5301112236
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #127: Referee contact details never contaminate candidate PII (Scenario 7)', () => {
    const cv = `
Kişisel Bilgiler
aday7@example.com
5301112237
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #128: Referee contact details never contaminate candidate PII (Scenario 8)', () => {
    const cv = `
Kişisel Bilgiler
aday8@example.com
5301112238
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #129: Referee contact details never contaminate candidate PII (Scenario 9)', () => {
    const cv = `
Kişisel Bilgiler
aday9@example.com
5301112239
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #130: Referee contact details never contaminate candidate PII (Scenario 10)', () => {
    const cv = `
Kişisel Bilgiler
aday10@example.com
5301112230
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #131: Referee contact details never contaminate candidate PII (Scenario 11)', () => {
    const cv = `
Kişisel Bilgiler
aday11@example.com
5301112231
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #132: Referee contact details never contaminate candidate PII (Scenario 12)', () => {
    const cv = `
Kişisel Bilgiler
aday12@example.com
5301112232
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #133: Referee contact details never contaminate candidate PII (Scenario 13)', () => {
    const cv = `
Kişisel Bilgiler
aday13@example.com
5301112233
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #134: Referee contact details never contaminate candidate PII (Scenario 14)', () => {
    const cv = `
Kişisel Bilgiler
aday14@example.com
5301112234
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #135: Referee contact details never contaminate candidate PII (Scenario 15)', () => {
    const cv = `
Kişisel Bilgiler
aday15@example.com
5301112235
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #136: Referee contact details never contaminate candidate PII (Scenario 16)', () => {
    const cv = `
Kişisel Bilgiler
aday16@example.com
5301112236
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #137: Referee contact details never contaminate candidate PII (Scenario 17)', () => {
    const cv = `
Kişisel Bilgiler
aday17@example.com
5301112237
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #138: Referee contact details never contaminate candidate PII (Scenario 18)', () => {
    const cv = `
Kişisel Bilgiler
aday18@example.com
5301112238
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #139: Referee contact details never contaminate candidate PII (Scenario 19)', () => {
    const cv = `
Kişisel Bilgiler
aday19@example.com
5301112239
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #140: Referee contact details never contaminate candidate PII (Scenario 20)', () => {
    const cv = `
Kişisel Bilgiler
aday20@example.com
5301112230
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #141: Referee contact details never contaminate candidate PII (Scenario 21)', () => {
    const cv = `
Kişisel Bilgiler
aday21@example.com
5301112231
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #142: Referee contact details never contaminate candidate PII (Scenario 22)', () => {
    const cv = `
Kişisel Bilgiler
aday22@example.com
5301112232
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #143: Referee contact details never contaminate candidate PII (Scenario 23)', () => {
    const cv = `
Kişisel Bilgiler
aday23@example.com
5301112233
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #144: Referee contact details never contaminate candidate PII (Scenario 24)', () => {
    const cv = `
Kişisel Bilgiler
aday24@example.com
5301112234
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #145: Referee contact details never contaminate candidate PII (Scenario 25)', () => {
    const cv = `
Kişisel Bilgiler
aday25@example.com
5301112235
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #146: Referee contact details never contaminate candidate PII (Scenario 26)', () => {
    const cv = `
Kişisel Bilgiler
aday26@example.com
5301112236
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #147: Referee contact details never contaminate candidate PII (Scenario 27)', () => {
    const cv = `
Kişisel Bilgiler
aday27@example.com
5301112237
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #148: Referee contact details never contaminate candidate PII (Scenario 28)', () => {
    const cv = `
Kişisel Bilgiler
aday28@example.com
5301112238
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #149: Referee contact details never contaminate candidate PII (Scenario 29)', () => {
    const cv = `
Kişisel Bilgiler
aday29@example.com
5301112239
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Reference Isolation #150: Referee contact details never contaminate candidate PII (Scenario 30)', () => {
    const cv = `
Kişisel Bilgiler
aday30@example.com
5301112230
İzmir / Bornova

Canan Dağ
Pazarlama Uzmanı

DENEYİM
Ege Seramik - Pazarlama Uzmanı (2020 - 2024)

REFERANSLAR
Ali Vural - Genel Müdür
5329998877
alivural@referans.com
`;
    const res = extractDeterministicCv(cv);
    expect(res.fullName).toBe('Canan Dağ');
    expect(res.roles).not.toContain('Genel Müdür');
    expect(res.fullName).not.toBe('Ali Vural');
  });

  it('Layout Resilience #151: Two-column / sidebar / boxed resume parsing (Scenario 1)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test1@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #152: Two-column / sidebar / boxed resume parsing (Scenario 2)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test2@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #153: Two-column / sidebar / boxed resume parsing (Scenario 3)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test3@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #154: Two-column / sidebar / boxed resume parsing (Scenario 4)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test4@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #155: Two-column / sidebar / boxed resume parsing (Scenario 5)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test5@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #156: Two-column / sidebar / boxed resume parsing (Scenario 6)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test6@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #157: Two-column / sidebar / boxed resume parsing (Scenario 7)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test7@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #158: Two-column / sidebar / boxed resume parsing (Scenario 8)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test8@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #159: Two-column / sidebar / boxed resume parsing (Scenario 9)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test9@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #160: Two-column / sidebar / boxed resume parsing (Scenario 10)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test10@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #161: Two-column / sidebar / boxed resume parsing (Scenario 11)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test11@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #162: Two-column / sidebar / boxed resume parsing (Scenario 12)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test12@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #163: Two-column / sidebar / boxed resume parsing (Scenario 13)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test13@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #164: Two-column / sidebar / boxed resume parsing (Scenario 14)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test14@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #165: Two-column / sidebar / boxed resume parsing (Scenario 15)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test15@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #166: Two-column / sidebar / boxed resume parsing (Scenario 16)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test16@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #167: Two-column / sidebar / boxed resume parsing (Scenario 17)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test17@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #168: Two-column / sidebar / boxed resume parsing (Scenario 18)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test18@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #169: Two-column / sidebar / boxed resume parsing (Scenario 19)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test19@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #170: Two-column / sidebar / boxed resume parsing (Scenario 20)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test20@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #171: Two-column / sidebar / boxed resume parsing (Scenario 21)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test21@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #172: Two-column / sidebar / boxed resume parsing (Scenario 22)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test22@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #173: Two-column / sidebar / boxed resume parsing (Scenario 23)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test23@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #174: Two-column / sidebar / boxed resume parsing (Scenario 24)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test24@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #175: Two-column / sidebar / boxed resume parsing (Scenario 25)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test25@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #176: Two-column / sidebar / boxed resume parsing (Scenario 26)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test26@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #177: Two-column / sidebar / boxed resume parsing (Scenario 27)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test27@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #178: Two-column / sidebar / boxed resume parsing (Scenario 28)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test28@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #179: Two-column / sidebar / boxed resume parsing (Scenario 29)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test29@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Layout Resilience #180: Two-column / sidebar / boxed resume parsing (Scenario 30)', () => {
    const cv = `
[SIDEBAR_START]
İletişim: test30@mail.com | 05441112233 | Ankara
Eğitim: ODTÜ Endüstri Mühendisliği 2018
Beceriler: Python, SQL, PowerBI
[SIDEBAR_END]

HAKAN YILMAZ
İş Analisti

İŞ DENEYİMİ
ASELSAN - Kıdemli Sistem ve İş Analisti (2018 - 2024)
• Gereksinim analizi ve iş süreçlerinin dijitalleştirilmesi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Hakan Yılmaz');
    expect(res.primaryRole).toMatch(/İş Analisti|Sistem Analisti/i);
    expect(res.experiences).toHaveLength(1);
    expect(res.educationList).toHaveLength(1);
  });

  it('Multilingual & Archetype #181: Avukat / Hukuk Danışmanı in Hukuk', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Avukat / Hukuk Danışmanı

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Avukat / Hukuk Danışmanı (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #182: Kardiyoloji Uzmanı / Doktor in Sağlık / Medikal', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Kardiyoloji Uzmanı / Doktor

DİLLER
Almanca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Kardiyoloji Uzmanı / Doktor (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Almanca');
  });

  it('Multilingual & Archetype #183: Mimar / Şantiye Şefi in Mimarlık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Mimar / Şantiye Şefi

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Mimar / Şantiye Şefi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #184: Pilot / Kaptan Pilot in Havacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Pilot / Kaptan Pilot

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Pilot / Kaptan Pilot (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #185: Finansal Kontrolör / Denetçi in Finans / Bankacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Finansal Kontrolör / Denetçi

DİLLER
Fransızca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Finansal Kontrolör / Denetçi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Fransızca');
  });

  it('Multilingual & Archetype #186: Avukat / Hukuk Danışmanı in Hukuk', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Avukat / Hukuk Danışmanı

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Avukat / Hukuk Danışmanı (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #187: Kardiyoloji Uzmanı / Doktor in Sağlık / Medikal', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Kardiyoloji Uzmanı / Doktor

DİLLER
Almanca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Kardiyoloji Uzmanı / Doktor (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Almanca');
  });

  it('Multilingual & Archetype #188: Mimar / Şantiye Şefi in Mimarlık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Mimar / Şantiye Şefi

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Mimar / Şantiye Şefi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #189: Pilot / Kaptan Pilot in Havacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Pilot / Kaptan Pilot

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Pilot / Kaptan Pilot (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #190: Finansal Kontrolör / Denetçi in Finans / Bankacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Finansal Kontrolör / Denetçi

DİLLER
Fransızca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Finansal Kontrolör / Denetçi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Fransızca');
  });

  it('Multilingual & Archetype #191: Avukat / Hukuk Danışmanı in Hukuk', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Avukat / Hukuk Danışmanı

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Avukat / Hukuk Danışmanı (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #192: Kardiyoloji Uzmanı / Doktor in Sağlık / Medikal', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Kardiyoloji Uzmanı / Doktor

DİLLER
Almanca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Kardiyoloji Uzmanı / Doktor (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Almanca');
  });

  it('Multilingual & Archetype #193: Mimar / Şantiye Şefi in Mimarlık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Mimar / Şantiye Şefi

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Mimar / Şantiye Şefi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #194: Pilot / Kaptan Pilot in Havacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Pilot / Kaptan Pilot

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Pilot / Kaptan Pilot (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #195: Finansal Kontrolör / Denetçi in Finans / Bankacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Finansal Kontrolör / Denetçi

DİLLER
Fransızca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Finansal Kontrolör / Denetçi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Fransızca');
  });

  it('Multilingual & Archetype #196: Avukat / Hukuk Danışmanı in Hukuk', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Avukat / Hukuk Danışmanı

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Avukat / Hukuk Danışmanı (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #197: Kardiyoloji Uzmanı / Doktor in Sağlık / Medikal', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Kardiyoloji Uzmanı / Doktor

DİLLER
Almanca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Kardiyoloji Uzmanı / Doktor (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Almanca');
  });

  it('Multilingual & Archetype #198: Mimar / Şantiye Şefi in Mimarlık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Mimar / Şantiye Şefi

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Mimar / Şantiye Şefi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #199: Pilot / Kaptan Pilot in Havacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Pilot / Kaptan Pilot

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Pilot / Kaptan Pilot (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #200: Finansal Kontrolör / Denetçi in Finans / Bankacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Finansal Kontrolör / Denetçi

DİLLER
Fransızca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Finansal Kontrolör / Denetçi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Fransızca');
  });

  it('Multilingual & Archetype #201: Avukat / Hukuk Danışmanı in Hukuk', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Avukat / Hukuk Danışmanı

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Avukat / Hukuk Danışmanı (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #202: Kardiyoloji Uzmanı / Doktor in Sağlık / Medikal', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Kardiyoloji Uzmanı / Doktor

DİLLER
Almanca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Kardiyoloji Uzmanı / Doktor (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Almanca');
  });

  it('Multilingual & Archetype #203: Mimar / Şantiye Şefi in Mimarlık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Mimar / Şantiye Şefi

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Mimar / Şantiye Şefi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #204: Pilot / Kaptan Pilot in Havacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Pilot / Kaptan Pilot

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Pilot / Kaptan Pilot (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #205: Finansal Kontrolör / Denetçi in Finans / Bankacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Finansal Kontrolör / Denetçi

DİLLER
Fransızca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Finansal Kontrolör / Denetçi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Fransızca');
  });

  it('Multilingual & Archetype #206: Avukat / Hukuk Danışmanı in Hukuk', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Avukat / Hukuk Danışmanı

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Avukat / Hukuk Danışmanı (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #207: Kardiyoloji Uzmanı / Doktor in Sağlık / Medikal', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Kardiyoloji Uzmanı / Doktor

DİLLER
Almanca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Kardiyoloji Uzmanı / Doktor (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Almanca');
  });

  it('Multilingual & Archetype #208: Mimar / Şantiye Şefi in Mimarlık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Mimar / Şantiye Şefi

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Mimar / Şantiye Şefi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #209: Pilot / Kaptan Pilot in Havacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Pilot / Kaptan Pilot

DİLLER
İngilizce - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Pilot / Kaptan Pilot (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('İngilizce');
  });

  it('Multilingual & Archetype #210: Finansal Kontrolör / Denetçi in Finans / Bankacılık', () => {
    const cv = `
Mehmet Özkan
İstanbul / Kadıköy
Finansal Kontrolör / Denetçi

DİLLER
Fransızca - İleri Düzey (C1)

İŞ DENEYİMİ
Global Partners - Finansal Kontrolör / Denetçi (2019 - 2024)
Sektörel projelerin yürütülmesi ve yönetimi.
`;
    const res = mapCvToCanonicalTaxonomy(extractDeterministicCv(cv));
    expect(res.fullName).toBe('Mehmet Özkan');
    expect(res.experiences).toHaveLength(1);
    expect(res.languages).toContain('Fransızca');
  });
});
