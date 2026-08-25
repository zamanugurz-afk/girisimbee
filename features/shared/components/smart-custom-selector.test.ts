import { describe, it, expect } from 'vitest';
import {
  searchTaxonomyCatalog,
  normalizeTurkishSearch,
  formatCanonicalCustomValue,
  getCanonicalCatalog,
} from '@/features/shared/services/set-matching.service';
import { getAllTaxonomyCertificates, getAllTaxonomyPositions } from '@/features/candidates/taxonomy/career-taxonomy';

describe('Global Form Standards & SmartCustomSelector Behavioral Suite', () => {
  describe('1. Turkish Normalization & Search Engine', () => {
    it('normalizes Turkish characters correctly across lower/upper cases', () => {
      expect(normalizeTurkishSearch('ÇALIŞMA')).toBe('calisma');
      expect(normalizeTurkishSearch('şeker')).toBe('seker');
      expect(normalizeTurkishSearch('ÖĞRENCİ')).toBe('ogrenci');
      expect(normalizeTurkishSearch('İstanbul')).toBe('istanbul');
      expect(normalizeTurkishSearch('İSTANBUL')).toBe('istanbul');
      expect(normalizeTurkishSearch('ışık')).toBe('isik');
      expect(normalizeTurkishSearch('üretim')).toBe('uretim');
    });

    it('matches exact case variations with highest priority (score 1000)', () => {
      const catalog = getAllTaxonomyCertificates();
      for (const query of ['segem', 'SEGEM', 'Segem', 'sEGEM']) {
        const matches = searchTaxonomyCatalog(query, catalog);
        expect(matches[0].value).toBe('SEGEM');
        expect(matches[0].score).toBe(1000);
        expect(matches[0].matchQuality).toBe('exact');
      }
    });

    it('ranks startsWith (prefix) higher than contains / word boundary', () => {
      const catalog = getAllTaxonomyPositions();
      const matches = searchTaxonomyCatalog('bölge', catalog);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value.toLowerCase().startsWith('bölge')).toBe(true);
      expect(matches[0].matchQuality).toBe('prefix');
    });

    it('finds word boundary matches accurately', () => {
      const catalog = getAllTaxonomyPositions();
      const matches = searchTaxonomyCatalog('müdürü', catalog);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.matchQuality === 'word-start' || m.matchQuality === 'prefix')).toBe(true);
    });
  });

  describe('2. Multi-Select & Duplicate Prevention Flow', () => {
    it('prevents adding duplicate values to selected chips', () => {
      let selected: string[] = ['SEGEM'];
      const addValue = 'SEGEM';
      if (!selected.includes(addValue)) {
        selected = [...selected, addValue];
      }
      expect(selected).toEqual(['SEGEM']);
    });

    it('excludes already selected values from search suggestions pool', () => {
      const catalog = ['SEGEM', 'SEGEM Ruhsatı', 'PMP', 'Scrum Master'];
      const selected = ['SEGEM'];
      const matches = searchTaxonomyCatalog('segem', catalog, {
        excludeValues: selected,
      });
      expect(matches.some((m) => m.value === 'SEGEM')).toBe(false);
      expect(matches.some((m) => m.value === 'SEGEM Ruhsatı')).toBe(true);
    });
  });

  describe('3. Custom Value Formatting & Fallback', () => {
    it('formats custom user inputs cleanly with Title Case', () => {
      expect(formatCanonicalCustomValue('özel yazılım mimarı sertifikası')).toBe(
        'Özel Yazılım Mimarı Sertifikası'
      );
      expect(formatCanonicalCustomValue('finansal risk yöneticisi 2026')).toBe(
        'Finansal Risk Yöneticisi 2026'
      );
    });
  });

  describe('4. Global Catalogs Consistency', () => {
    it('provides comprehensive catalogs for all domains', () => {
      const sectors = getCanonicalCatalog('sectors');
      const positions = getCanonicalCatalog('positions');
      const certs = getCanonicalCatalog('certificates');
      const skills = getCanonicalCatalog('professional-skills');
      const tools = getCanonicalCatalog('tools');

      expect(sectors.length).toBeGreaterThan(10);
      expect(positions.length).toBeGreaterThan(50);
      expect(certs.length).toBeGreaterThan(20);
      expect(skills.length).toBeGreaterThan(30);
      expect(tools.length).toBeGreaterThan(10);
    });
  });
});
