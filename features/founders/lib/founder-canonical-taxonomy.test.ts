import { describe, expect, it } from 'vitest';
import {
  searchTaxonomyCatalog,
  getCanonicalCatalog,
  TAXONOMY_ALIASES,
} from '@/features/shared/services/set-matching.service';
import { resolveFounderSuggestions } from '@/features/founders/lib/founder-suggestions';
import { resolvePartnershipWeights } from '@/features/partnership-matching/scoring';
import { scorePartnershipProfiles } from '@/features/partnership-matching/engine';
import type { PartnershipMatchProfile } from '@/features/partnership-matching/types';

describe('Girişimbee Canonical Taxonomy, Suggestions and Fuzzy Matching Suite', () => {
  describe('1. Fuzzy Matching and Taxonomy Aliases', () => {
    it('matches "segem" to SEGEM certification', () => {
      const catalog = getCanonicalCatalog('certificates');
      const matches = searchTaxonomyCatalog('segem', catalog);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toContain('SEGEM');
    });

    it('matches "sigorta" to insurance advisor and SEGEM certification', () => {
      const certs = searchTaxonomyCatalog('sigorta', getCanonicalCatalog('certificates'));
      expect(certs.some((c) => c.value.toLowerCase().includes('sigorta') || c.value.includes('SEGEM'))).toBe(true);

      const pt = searchTaxonomyCatalog('sigorta', getCanonicalCatalog('partnership-types'));
      expect(pt.some((p) => p.value.toLowerCase().includes('sigorta'))).toBe(true);
    });

    it('matches "fabrika" to factory and production partnership options', () => {
      const catalog = getCanonicalCatalog('partnership-types');
      const matches = searchTaxonomyCatalog('fabrika', catalog);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toBe('Fabrika ve Üretim Tesisi Sağlayıcı Ortak');
    });

    it('matches "dukkan" and "dükkan" to store space partnership options', () => {
      const catalog = getCanonicalCatalog('partnership-types');
      const matches1 = searchTaxonomyCatalog('dükkan', catalog);
      const matches2 = searchTaxonomyCatalog('dukkan', catalog);
      expect(matches1[0].value).toContain('Dükkan');
      expect(matches2[0].value).toContain('Dükkan');
    });

    it('matches "depo" and "lojistik" to warehouse space options', () => {
      const catalog = getCanonicalCatalog('partnership-types');
      const matches = searchTaxonomyCatalog('depo', catalog);
      expect(matches.some((m) => m.value.includes('Depo'))).toBe(true);
    });

    it('matches "arac" and "filo" to fleet and commercial vehicle options', () => {
      const catalog = getCanonicalCatalog('partnership-types');
      const matches = searchTaxonomyCatalog('filo', catalog);
      expect(matches.some((m) => m.value.includes('Filo'))).toBe(true);
    });

    it('matches "makine" to industrial machinery options', () => {
      const catalog = getCanonicalCatalog('partnership-types');
      const matches = searchTaxonomyCatalog('makine', catalog);
      expect(matches.some((m) => m.value.includes('Makine'))).toBe(true);
    });

    it('matches "bolge" and "bölge" to regional management positions and partnership roles', () => {
      const catalog = getCanonicalCatalog('partnership-types');
      const matches = searchTaxonomyCatalog('bölge', catalog);
      expect(matches.some((m) => m.value.includes('Bölge'))).toBe(true);
    });
  });

  describe('2. Context-Aware Dynamic Suggestions', () => {
    it('suggests production, CNC, and CAD/CAM for Manufacturing + Factory Partner', () => {
      const res = resolveFounderSuggestions({
        sector: 'Üretim',
        targetPartnerType: 'Fabrika ve Üretim Tesisi Sağlayıcı Ortak',
        stage: 'İlk müşteriler',
      });

      expect(res.partnershipTypes).toContain('Fabrika ve Üretim Tesisi Sağlayıcı Ortak');
      expect(res.technicalSkills.some((s) => s.includes('CAD') || s.includes('CNC') || s.includes('Tesis'))).toBe(true);
      expect(res.tools.some((t) => t.includes('SolidWorks') || t.includes('AutoCAD') || t.includes('SAP'))).toBe(true);
    });

    it('suggests restaurant operations, POS, and food cost for Food + Restaurant Partner', () => {
      const res = resolveFounderSuggestions({
        sector: 'Gıda',
        targetPartnerType: 'Restoran ve Cafe İşletme Ortağı',
        stage: 'İlk müşteriler',
      });

      expect(res.partnershipTypes).toContain('Restoran ve Cafe İşletme Ortağı');
      expect(res.professionalSkills.some((s) => s.includes('Restoran') || s.includes('Gıda'))).toBe(true);
      expect(res.technicalSkills.some((s) => s.includes('POS') || s.includes('Paket Servis'))).toBe(true);
    });

    it('suggests ESG, Carbon Footprint, and B2B sales for Climate Tech + Agency Partner', () => {
      const res = resolveFounderSuggestions({
        sector: 'İklim teknolojisi',
        targetPartnerType: 'Acentelik ve Temsilcilik Ortağı',
        stage: 'MVP aşaması',
      });

      expect(res.partnershipTypes).toContain('Acentelik ve Temsilcilik Ortağı');
      expect(res.professionalSkills.some((s) => s.includes('ESG') || s.includes('Karbon') || s.includes('Acentelik'))).toBe(true);
    });
  });

  describe('3. Dynamic Partnership Matching Weights', () => {
    it('allocates 30% location weight for Physical Partnership (Total = 100%)', () => {
      const profile1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Fabrika ve Üretim Tesisi Ortağı Arıyoruz',
        partnershipTypes: ['Fabrika ve Üretim Tesisi Sağlayıcı Ortak'],
        location: 'İstanbul (Anadolu Yakası)',
      };
      const profile2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Fabrika alanı sağlayacak ortak',
        partnershipTypes: ['Fabrika ve Üretim Tesisi Sağlayıcı Ortak'],
        location: 'İstanbul (Anadolu Yakası)',
      };

      const weights = resolvePartnershipWeights(profile1, profile2);
      expect(weights.location).toBe(30);
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(total).toBe(100);
    });

    it('allocates 40% skills weight for Technical Partnership (Total = 100%)', () => {
      const profile1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Teknik Ortak (CTO) Arıyoruz',
        partnershipTypes: ['Teknik Ortak (CTO)'],
        skills: ['React', 'Node.js'],
      };
      const profile2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Yazılım ve CTO Ortağı Olmak İstiyorum',
        partnershipTypes: ['Teknik Ortak (CTO)'],
        skills: ['React', 'Node.js'],
      };

      const weights = resolvePartnershipWeights(profile1, profile2);
      expect(weights.skills).toBe(40);
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(total).toBe(100);
    });

    it('allocates 25% sector, 20% stage, 20% equity for Investor Partnership (Total = 100%)', () => {
      const profile1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Melek Yatırımcı ve Sermaye Ortağı Arıyoruz',
        partnershipTypes: ['Melek Yatırımcı (Angel Investor)'],
        sectors: ['Fintech'],
      };
      const profile2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Melek Yatırımcı Ortak Olmak İstiyor',
        partnershipTypes: ['Melek Yatırımcı (Angel Investor)'],
        sectors: ['Fintech'],
      };

      const weights = resolvePartnershipWeights(profile1, profile2);
      expect(weights.sector).toBe(25);
      expect(weights.stage).toBe(20);
      expect(weights.equity).toBe(20);
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(total).toBe(100);
    });
  });

  describe('4. Extended Fuzzy Search Keywords', () => {
    it('matches all required keywords to canonical system options', () => {
      const ptCatalog = getCanonicalCatalog('partnership-types');
      const certCatalog = getCanonicalCatalog('certificates');
      const profCatalog = getCanonicalCatalog('professional-skills');
      const techCatalog = getCanonicalCatalog('technical-skills');

      // segem
      expect(searchTaxonomyCatalog('segem', certCatalog)[0].value).toContain('SEGEM');
      // sigorta
      expect(searchTaxonomyCatalog('sigorta', ptCatalog).some((p) => p.value.includes('Sigorta'))).toBe(true);
      // bolge
      expect(searchTaxonomyCatalog('bölge', ptCatalog).some((p) => p.value.includes('Bölge'))).toBe(true);
      // fabrika
      expect(searchTaxonomyCatalog('fabrika', ptCatalog)[0].value).toBe('Fabrika ve Üretim Tesisi Sağlayıcı Ortak');
      // dukkan
      expect(searchTaxonomyCatalog('dükkan', ptCatalog)[0].value).toBe('Dükkan ve Mağaza Alanı Sağlayıcı Ortak');
      // depo
      expect(searchTaxonomyCatalog('depo', ptCatalog).some((p) => p.value.includes('Depo'))).toBe(true);
      // arac
      expect(searchTaxonomyCatalog('araç', ptCatalog).some((p) => p.value.includes('Araç'))).toBe(true);
      // makine
      expect(searchTaxonomyCatalog('makine', ptCatalog).some((p) => p.value.includes('Makine'))).toBe(true);
      // arsa
      expect(searchTaxonomyCatalog('arsa', ptCatalog).some((p) => p.value.includes('Arsa'))).toBe(true);
      // cto
      expect(searchTaxonomyCatalog('cto', ptCatalog)[0].value).toBe('Teknik Ortak (CTO)');
      // yazilim
      expect(searchTaxonomyCatalog('yazılım', ptCatalog).some((p) => p.value.includes('Yazılım'))).toBe(true);
      // finans
      expect(searchTaxonomyCatalog('finans', ptCatalog).some((p) => p.value.includes('Finans'))).toBe(true);
      // yatirim
      expect(searchTaxonomyCatalog('yatırım', ptCatalog).some((p) => p.value.includes('Yatırım'))).toBe(true);
    });
  });

  describe('5. Real-world Matching Scenarios', () => {
    it('Scenario 1: Fabrika ortağı ↔ üretim tesisi arayan', () => {
      const p1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Üretim Tesisi ve Fabrika Alanı Sağlayacak Ortak',
        partnershipTypes: ['Fabrika ve Üretim Tesisi Sağlayıcı Ortak'],
        sectors: ['Üretim ve Sanayi'],
        location: 'İstanbul (Anadolu Yakası)',
      };
      const p2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Fabrika alanı sağlayacak ortak',
        partnershipTypes: ['Fabrika ve Üretim Tesisi Sağlayıcı Ortak'],
        sectors: ['Üretim ve Sanayi'],
        location: 'İstanbul (Anadolu Yakası)',
      };
      const result = scorePartnershipProfiles(p1, p2);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.band).toBe('very_strong');
    });

    it('Scenario 2: Dükkan ortağı ↔ mağaza açmak isteyen', () => {
      const p1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Dükkan ve Mağaza Alanı Sağlayacak Ortak',
        partnershipTypes: ['Dükkan ve Mağaza Alanı Sağlayıcı Ortak'],
        sectors: ['Perakende'],
        location: 'İstanbul (Avrupa Yakası)',
      };
      const p2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Mağaza alanı sağlayacak ortak',
        partnershipTypes: ['Dükkan ve Mağaza Alanı Sağlayıcı Ortak'],
        sectors: ['Perakende'],
        location: 'İstanbul (Avrupa Yakası)',
      };
      const result = scorePartnershipProfiles(p1, p2);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('Scenario 3: Depo ortağı ↔ lojistik ihtiyacı olan', () => {
      const p1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Depo ve Lojistik Alanı Ortağı Arıyoruz',
        partnershipTypes: ['Depo ve Lojistik Alanı Sağlayıcı Ortak'],
        sectors: ['Lojistik'],
        location: 'Kocaeli',
      };
      const p2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Lojistik ve depo alanı sağlayacak ortak',
        partnershipTypes: ['Depo ve Lojistik Alanı Sağlayıcı Ortak'],
        sectors: ['Lojistik'],
        location: 'Kocaeli',
      };
      const result = scorePartnershipProfiles(p1, p2);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('Scenario 4: Teknik ortak ↔ CTO / yazılım uzmanı', () => {
      const p1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Teknik Ortak (CTO) Arıyoruz',
        partnershipTypes: ['Teknik Ortak (CTO)'],
        sectors: ['SaaS / Yazılım'],
        skills: ['Full-Stack Web Geliştirme', 'DevOps, CI/CD ve Bulut Altyapı'],
        commitment: 'Tam zamanlı',
      };
      const p2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Yazılım ve CTO Kurucu Ortak Olmak İstiyorum',
        partnershipTypes: ['Teknik Ortak (CTO)'],
        sectors: ['SaaS / Yazılım'],
        skills: ['Full-Stack Web Geliştirme', 'DevOps, CI/CD ve Bulut Altyapı'],
        commitment: 'Tam zamanlı',
      };
      const result = scorePartnershipProfiles(p1, p2);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.band).toBe('very_strong');
    });

    it('Scenario 5: Satış ortağı ↔ B2B satış ihtiyacı', () => {
      const p1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'B2B Kurumsal Satış Ortağı Arıyoruz',
        partnershipTypes: ['Satış ve B2B İş Geliştirme Ortağı'],
        sectors: ['Fintech'],
        skills: ['B2B Kurumsal Satış'],
        commitment: 'Tam zamanlı',
      };
      const p2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Satış Ortağı Olmak İstiyorum',
        partnershipTypes: ['Satış ve B2B İş Geliştirme Ortağı'],
        sectors: ['Fintech'],
        skills: ['B2B Kurumsal Satış'],
        commitment: 'Tam zamanlı',
      };
      const result = scorePartnershipProfiles(p1, p2);
      expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it('Scenario 6: Yatırımcı ↔ sermaye arayan girişim', () => {
      const p1: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'Erken Aşama Melek Yatırımcı Arıyoruz',
        partnershipTypes: ['Melek Yatırımcı (Angel Investor)'],
        sectors: ['Yapay zeka'],
        stage: 'MVP aşaması',
        equity: 10,
      };
      const p2: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Yapay Zeka Girişimlerine Melek Yatırımcı',
        partnershipTypes: ['Melek Yatırımcı (Angel Investor)'],
        sectors: ['Yapay zeka'],
        stage: 'MVP aşaması',
        equity: 10,
      };
      const result = scorePartnershipProfiles(p1, p2);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.band).toBe('very_strong');
    });
  });
});
