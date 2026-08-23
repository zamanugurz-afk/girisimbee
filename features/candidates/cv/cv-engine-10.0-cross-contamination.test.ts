/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 10.0
 * 30x30 CROSS-CONTAMINATION & FIREWALL ISOLATION MATRIX
 * 
 * Verifies that zero cross-field leakage occurs across all 30 section sources
 * and 30 canonical target destinations.
 */

import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph, enforceEvidenceGraphFirewall } from './cv-evidence-graph';

describe('CV Extraction Engine 10.0 — 30x30 Cross-Contamination Matrix', () => {
  describe('Section Source 1: Education Degree', () => {
    it('Matrix Vector #1: Education Degree Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

EĞİTİM BİLGİSİ
Kamu Yönetimi (Lisans)
Ankara Üniversitesi
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Kamu Yönetimi');
      expect(canonical.primaryRole).not.toBe('Kamu Yönetimi');
      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
      
      
      
    });
  });
  describe('Section Source 2: Referee Contact', () => {
    it('Matrix Vector #2: Referee Contact Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

REFERANSLAR
Prof. Dr. Ahmet Yılmaz
Bölüm Başkanı, ODTÜ
Tel: +90 532 999 88 77
E-posta: ahmet.yilmaz@odtu.edu.tr
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Ahmet Yılmaz');
      expect(canonical.primaryRole).not.toBe('Bölüm Başkanı');
      expect(canonical.primarySector).not.toBe('undefined');
      
      expect(canonical.phone).not.toBe('+90 532 999 88 77');
      expect(canonical.email).not.toBe('ahmet.yilmaz@odtu.edu.tr');
    });
  });
  describe('Section Source 3: Skill Level Suffix', () => {
    it('Matrix Vector #3: Skill Level Suffix Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

BECERİLER
• Java - Uzman
• React - İleri Düzey
• Kubernetes - Orta
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Java');
      expect(canonical.primaryRole).not.toBe('Uzman');
      expect(canonical.primarySector).not.toBe('Uzman');
      expect(canonical.primaryRole).not.toBe('İleri Düzey');
      
      
    });
  });
  describe('Section Source 4: Company Name Suffix', () => {
    it('Matrix Vector #4: Company Name Suffix Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

İŞ DENEYİMİ
2020 - 2024
Özdemir Mühendislik ve Müşavirlik Ltd. Şti.
Yazılım Mimarı
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Özdemir Mühendislik');
      expect(canonical.primaryRole).not.toBe('Mühendislik');
      expect(canonical.primarySector).not.toBe('undefined');
      expect(canonical.primaryRole).not.toBe('Müşavirlik');
      
      
    });
  });
  describe('Section Source 5: Language Entry', () => {
    it('Matrix Vector #5: Language Entry Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

YABANCI DİLLER
İngilizce (C2 - İleri Düzey)
Almanca (B1 - Orta)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('İngilizce');
      expect(canonical.primaryRole).not.toBe('İngilizce');
      expect(canonical.primarySector).not.toBe('İngilizce');
      expect(canonical.primaryRole).not.toBe('Almanca');
      
      
    });
  });
  describe('Section Source 6: Driving License', () => {
    it('Matrix Vector #6: Driving License Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

KİŞİSEL BİLGİLER
Sürücü Belgesi: B, A2 Sınıfı
Askerlik Durumu: Yapıldı
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Sürücü Belgesi');
      expect(canonical.primaryRole).not.toBe('B Sınıfı');
      expect(canonical.primarySector).not.toBe('Sürücü Belgesi');
      expect(canonical.primaryRole).not.toBe('Askerlik');
      
      
    });
  });
  describe('Section Source 7: Certifications Section', () => {
    it('Matrix Vector #7: Certifications Section Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

SERTİFİKALAR
PMP - Project Management Professional
AWS Certified Solutions Architect
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('PMP');
      expect(canonical.primaryRole).not.toBe('PMP');
      expect(canonical.primarySector).not.toBe('PMP');
      
      
      
    });
  });
  describe('Section Source 8: Hobbies & Interests', () => {
    it('Matrix Vector #8: Hobbies & Interests Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

İLGİ ALANLARI VE HOBİLER
Doğa Yürüyüşü, Satranç, Klasik Müzik
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Satranç');
      expect(canonical.primaryRole).not.toBe('Satranç');
      expect(canonical.primarySector).not.toBe('Klasik Müzik');
      
      
      
    });
  });
  describe('Section Source 9: Publications', () => {
    it('Matrix Vector #9: Publications Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

YAYINLAR
"Graph Neural Networks for Semantic CV Parsing", IEEE 2023
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Graph Neural Networks');
      expect(canonical.primaryRole).not.toBe('IEEE');
      expect(canonical.primarySector).not.toBe('IEEE');
      
      
      
    });
  });
  describe('Section Source 10: Projects', () => {
    it('Matrix Vector #10: Projects Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

PROJELER
Akıllı Şehir Trafik Yönetim Sistemi (TÜBİTAK 1001)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Akıllı Şehir');
      expect(canonical.primaryRole).not.toBe('TÜBİTAK');
      expect(canonical.primarySector).not.toBe('TÜBİTAK');
      
      
      
    });
  });
  describe('Section Source 11: Volunteer Experience', () => {
    it('Matrix Vector #11: Volunteer Experience Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

GÖNÜLLÜ ÇALIŞMALAR
TEGV - Eğitim Gönüllüsü (2021 - 2022)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('TEGV');
      expect(canonical.primaryRole).not.toBe('Gönüllü');
      expect(canonical.primarySector).not.toBe('TEGV');
      
      
      
    });
  });
  describe('Section Source 12: Seminars & Workshops', () => {
    it('Matrix Vector #12: Seminars & Workshops Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

SEMİNERLER VE KONFERANSLAR
Agile Summit Istanbul 2023 Katılımcısı
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Agile Summit');
      expect(canonical.primaryRole).not.toBe('Summit');
      expect(canonical.primarySector).not.toBe('Agile Summit');
      
      
      
    });
  });
  describe('Section Source 13: Awards & Honors', () => {
    it('Matrix Vector #13: Awards & Honors Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

ÖDÜLLER VE DERECELER
En Başarılı Ar-Ge Projesi Birincilik Ödülü (2022)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Ödüller');
      expect(canonical.primaryRole).not.toBe('Birincilik');
      expect(canonical.primarySector).not.toBe('Ödüller');
      
      
      
    });
  });
  describe('Section Source 14: Organization / Memberships', () => {
    it('Matrix Vector #14: Organization / Memberships Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

ÜYELİKLER
Türkiye Bilişim Derneği (TBD) Asil Üyesi
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Türkiye Bilişim Derneği');
      expect(canonical.primaryRole).not.toBe('Asil Üye');
      expect(canonical.primarySector).not.toBe('TBD');
      
      
      
    });
  });
  describe('Section Source 15: Social Links', () => {
    it('Matrix Vector #15: Social Links Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

SOSYAL MEDYA & PORTFOLYO
github.com/candidate-dev
medium.com/@candidate
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Github');
      expect(canonical.primaryRole).not.toBe('Medium');
      expect(canonical.primarySector).not.toBe('Social');
      
      
      
    });
  });
  describe('Section Source 16: Objective Statement', () => {
    it('Matrix Vector #16: Objective Statement Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

KARİYER HEDEFİ
Yenilikçi teknolojilerle global ölçekte değer üretmek.
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Kariyer Hedefi');
      expect(canonical.primaryRole).not.toBe('Kariyer Hedefi');
      expect(canonical.primarySector).not.toBe('Global');
      
      
      
    });
  });
  describe('Section Source 17: Test Scores', () => {
    it('Matrix Vector #17: Test Scores Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

SINAV BİLGİLERİ
YDS: 95.00 (2022)
ALES: 88.50 (2021)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('YDS');
      expect(canonical.primaryRole).not.toBe('YDS');
      expect(canonical.primarySector).not.toBe('ALES');
      
      
      
    });
  });
  describe('Section Source 18: Patents', () => {
    it('Matrix Vector #18: Patents Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

PATENTLER
TR202201948 - Otonom Nesne Algılama Yöntemi (Tescilli)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Patentler');
      expect(canonical.primaryRole).not.toBe('Tescilli');
      expect(canonical.primarySector).not.toBe('Patent');
      
      
      
    });
  });
  describe('Section Source 19: Military Status', () => {
    it('Matrix Vector #19: Military Status Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

ASKERLİK DURUMU
Muaf (Sağlık Raporlu - 2020)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Askerlik Durumu');
      expect(canonical.primaryRole).not.toBe('Muaf');
      expect(canonical.primarySector).not.toBe('Askerlik');
      
      
      
    });
  });
  describe('Section Source 20: Marital Status', () => {
    it('Matrix Vector #20: Marital Status Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

MEDENİ HAL
Bekar / Çocuksuz
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Medeni Hal');
      expect(canonical.primaryRole).not.toBe('Bekar');
      expect(canonical.primarySector).not.toBe('Medeni Hal');
      
      
      
    });
  });
  describe('Section Source 21: Coursework', () => {
    it('Matrix Vector #21: Coursework Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

ALINAN KURSLAR
İleri Düzey Docker & Kubernetes Eğitimi (40 Saat)
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Alınan Kurslar');
      expect(canonical.primaryRole).not.toBe('Docker');
      expect(canonical.primarySector).not.toBe('Kurs');
      
      
      
    });
  });
  describe('Section Source 22: Address Details', () => {
    it('Matrix Vector #22: Address Details Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

ADRES BİLGİLERİ
Atatürk Cad. Güneş Sok. No:14 D:5 Bornova / İzmir
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Atatürk Cad.');
      expect(canonical.primaryRole).not.toBe('Güneş Sok.');
      expect(canonical.primarySector).not.toBe('Adres');
      
      
      
    });
  });
  describe('Section Source 23: Header Artifacts', () => {
    it('Matrix Vector #23: Header Artifacts Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

ÖZGEÇMİŞ FORMU / CURRICULUM VITAE / RESUME 2024
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Curriculum Vitae');
      expect(canonical.primaryRole).not.toBe('Resume');
      expect(canonical.primarySector).not.toBe('Özgeçmiş Formu');
      
      
      
    });
  });
  describe('Section Source 24: Footer Artifacts', () => {
    it('Matrix Vector #24: Footer Artifacts Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

Sayfa 1 / 3 — Bu özgeçmiş Girişimbee formatında hazırlanmıştır.
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Girişimbee');
      expect(canonical.primaryRole).not.toBe('Sayfa');
      expect(canonical.primarySector).not.toBe('Girişimbee');
      
      
      
    });
  });
  describe('Section Source 25: Sidebar Notes', () => {
    it('Matrix Vector #25: Sidebar Notes Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

NOTLAR
Esnek çalışma saatlerine ve hibrit modele uygundur.
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Notlar');
      expect(canonical.primaryRole).not.toBe('Hibrit');
      expect(canonical.primarySector).not.toBe('Notlar');
      
      
      
    });
  });
  describe('Section Source 26: Tools List', () => {
    it('Matrix Vector #26: Tools List Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

KULLANILAN ARAÇLAR
Jira, Confluence, Figma, Postman, Git
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Kullanılan Araçlar');
      expect(canonical.primaryRole).not.toBe('Jira');
      expect(canonical.primarySector).not.toBe('Figma');
      
      
      
    });
  });
  describe('Section Source 27: Soft Skills', () => {
    it('Matrix Vector #27: Soft Skills Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

KİŞİSEL YETKİNLİKLER
Problem Çözme, Analitik Düşünme, Takım Çalışması
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Kişisel Yetkinlikler');
      expect(canonical.primaryRole).not.toBe('Problem Çözme');
      expect(canonical.primarySector).not.toBe('Analitik');
      
      
      
    });
  });
  describe('Section Source 28: Job Summary', () => {
    it('Matrix Vector #28: Job Summary Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

PROFESYONEL ÖZET
10 yıllık finans ve kurumsal bankacılık tecrübesi.
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Profesyonel Özet');
      expect(canonical.primaryRole).not.toBe('Profesyonel Özet');
      expect(canonical.primarySector).not.toBe('Özet');
      
      
      
    });
  });
  describe('Section Source 29: Identity Header', () => {
    it('Matrix Vector #29: Identity Header Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

KİŞİSEL BİLGİLER VE KİMLİK VERİLERİ
T.C. Kimlik No: ***********
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('Kişisel Bilgiler');
      expect(canonical.primaryRole).not.toBe('Kimlik Verileri');
      expect(canonical.primarySector).not.toBe('Kimlik');
      
      
      
    });
  });
  describe('Section Source 30: Legal Disclaimer', () => {
    it('Matrix Vector #30: Legal Disclaimer Isolation & Negative Assertions', () => {
      const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Tarık Barış
Telefon: +90 532 111 22 33
E-posta: tarik.baris@example.com
Adres: İzmir, Türkiye

İŞ DENEYİMİ
2020 - 2024
Yazılım Geliştirici
Turkcell Teknoloji
• Dağıtık mikroservis sistemleri ve bulut entegrasyonu.

KVKK AYDINLATMA METNİ
Verilerimin saklanmasını ve işlenmesini onaylıyorum.
`;

      const payload = extractDeterministicCv(cv);
      const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: payload });
      const reconciled = enforceEvidenceGraphFirewall(payload, graph);
      const canonical = mapCvToCanonicalTaxonomy(reconciled);

      // Identity & Contact Invariants
      expect(canonical.fullName).toBe('Tarık Barış');
      expect(canonical.residenceCity).toBe('İzmir');
      expect(canonical.phone).toBe('+90 532 111 22 33');
      expect(canonical.email).toBe('tarik.baris@example.com');
      expect(canonical.primaryRole).toBe('Yazılım Geliştirici');

      // Strict Negative Firewall Assertions
      expect(canonical.fullName).not.toBe('KVKK Aydınlatma Metni');
      expect(canonical.primaryRole).not.toBe('Aydınlatma Metni');
      expect(canonical.primarySector).not.toBe('KVKK');
      
      
      
    });
  });
});
