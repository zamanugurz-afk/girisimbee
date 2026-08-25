import { describe, expect, it } from 'vitest';
import {
  normalizeTurkishSearch,
  searchTaxonomyCatalog,
  tokenizeTurkish,
  getCanonicalCatalog,
  formatCanonicalCustomValue,
} from './set-matching.service';

describe('SetMatchingService — Turkish Normalized Autocomplete & Catalog Matching', () => {
  const samplePositions = [
    'Bölge Müdürü',
    'Bölge Satış Müdürü',
    'Bölge Operasyon Müdürü',
    'Satış Müdürü',
    'Kıdemli Satış Uzmanı',
    'Yazılım Geliştirici',
    'Full Stack Geliştirici',
    'İnsan Kaynakları Uzmanı',
    'Çağrı Merkezi Takım Lideri',
    'Muhasebe ve Finans Müdürü',
  ];

  describe('1. Turkish Search Normalization', () => {
    it('normalizes Turkish characters, accents and whitespace correctly', () => {
      expect(normalizeTurkishSearch('BÖLGE')).toBe('bolge');
      expect(normalizeTurkishSearch('bölge')).toBe('bolge');
      expect(normalizeTurkishSearch('İSTANBUL')).toBe('istanbul');
      expect(normalizeTurkishSearch('istanbul')).toBe('istanbul');
      expect(normalizeTurkishSearch('IĞDIR')).toBe('igdir');
      expect(normalizeTurkishSearch('Çiçekçilik & Şekerleme')).toBe('cicekcilik sekerleme');
      expect(normalizeTurkishSearch('Üretim / İmalat')).toBe('uretim imalat');
      expect(normalizeTurkishSearch('   ')).toBe('');
      expect(normalizeTurkishSearch(null)).toBe('');
    });

    it('tokenizes Turkish text accurately', () => {
      expect(tokenizeTurkish('Bölge Satış Müdürü')).toEqual(['bolge', 'satis', 'muduru']);
      expect(tokenizeTurkish('Çağrı Merkezi - Müşteri')).toEqual(['cagri', 'merkezi', 'musteri']);
    });
  });

  describe('2. Prefix & Exact Matching (e.g. "Bölge" Scenario)', () => {
    it('returns exact match at the top with score 1000', () => {
      const results = searchTaxonomyCatalog('Bölge Müdürü', samplePositions);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].value).toBe('Bölge Müdürü');
      expect(results[0].score).toBe(1000);
      expect(results[0].matchQuality).toBe('exact');
    });

    it('returns all "Bölge" positions when searching "Bölge" or "bolge"', () => {
      const results1 = searchTaxonomyCatalog('Bölge', samplePositions);
      const values1 = results1.map((r) => r.value);
      expect(values1).toContain('Bölge Müdürü');
      expect(values1).toContain('Bölge Satış Müdürü');
      expect(values1).toContain('Bölge Operasyon Müdürü');

      // Turkish char insensitive check
      const results2 = searchTaxonomyCatalog('bolge', samplePositions);
      const values2 = results2.map((r) => r.value);
      expect(values2).toEqual(values1);
    });

    it('ranks prefix matches before substring matches', () => {
      const results = searchTaxonomyCatalog('Satış', samplePositions);
      expect(results[0].value).toBe('Satış Müdürü');
      expect(results[0].matchQuality).toBe('prefix');
      expect(results.some((r) => r.value === 'Bölge Satış Müdürü')).toBe(true);
    });
  });

  describe('3. Partial / Word-Boundary / Multi-Token Matching', () => {
    it('finds items when searching for middle words (e.g. "Geliştirici")', () => {
      const results = searchTaxonomyCatalog('Geliştirici', samplePositions);
      const values = results.map((r) => r.value);
      expect(values).toContain('Yazılım Geliştirici');
      expect(values).toContain('Full Stack Geliştirici');
    });

    it('matches when words are out of order via multi-token search', () => {
      const results = searchTaxonomyCatalog('Müdürü Bölge', samplePositions);
      const values = results.map((r) => r.value);
      expect(values).toContain('Bölge Müdürü');
      expect(values).toContain('Bölge Satış Müdürü');
    });

    it('matches "cagri" to "Çağrı Merkezi Takım Lideri" and "satış" to "Satış Müdürü"', () => {
      const cagriMatches = searchTaxonomyCatalog('cagri', samplePositions);
      expect(cagriMatches.some((m) => m.value === 'Çağrı Merkezi Takım Lideri')).toBe(true);

      const satisMatches = searchTaxonomyCatalog('satış', samplePositions);
      expect(satisMatches[0].value).toBe('Satış Müdürü');
    });
  });

  describe('4. Duplicate Prevention & Exclude List', () => {
    it('filters out already selected values from the results', () => {
      const results = searchTaxonomyCatalog('Bölge', samplePositions, {
        excludeValues: ['Bölge Müdürü'],
      });
      const values = results.map((r) => r.value);
      expect(values).not.toContain('Bölge Müdürü');
      expect(values).toContain('Bölge Satış Müdürü');
      expect(values).toContain('Bölge Operasyon Müdürü');
    });
  });

  describe('5. Empty Query & Limit Handling', () => {
    it('returns top catalog items in Turkish alphabetical order when query is empty', () => {
      const results = searchTaxonomyCatalog('', samplePositions, { limit: 4 });
      expect(results.length).toBe(4);
      expect(results[0].value).toBe('Bölge Müdürü');
      expect(results[1].value).toBe('Bölge Operasyon Müdürü');
      expect(results[2].value).toBe('Bölge Satış Müdürü');
      expect(results[3].value).toBe('Çağrı Merkezi Takım Lideri');
    });

    it('returns empty array when query does not match any item in catalog', () => {
      const results = searchTaxonomyCatalog('Kuantum Fizikçisi 999', samplePositions);
      expect(results).toEqual([]);
    });
  });

  describe('6. Canonical Catalogs Registry', () => {
    it('resolves positions catalog correctly with and without sector context', () => {
      const allPositions = getCanonicalCatalog('positions');
      expect(allPositions.length).toBeGreaterThan(50);
      expect(allPositions).toContain('Yazılım Geliştirici');

      const itPositions = getCanonicalCatalog('positions', { sector: 'Bilişim / Yazılım' });
      expect(itPositions.length).toBeGreaterThan(10);
      expect(itPositions.some((p) => p.includes('Geliştirici') || p.includes('Yazılım'))).toBe(true);
    });

    it('resolves sectors catalog', () => {
      const sectors = getCanonicalCatalog('sectors');
      expect(sectors).toContain('Bilişim / Yazılım');
      expect(sectors).toContain('Finans / Bankacılık');
    });

    it('resolves tools, languages, and education fields catalogs', () => {
      const tools = getCanonicalCatalog('tools');
      expect(tools).toContain('Excel');
      expect(tools).toContain('Figma');
      expect(tools).toContain('Git / GitHub');

      const languages = getCanonicalCatalog('languages');
      expect(languages).toContain('İngilizce');
      expect(languages).toContain('Almanca');

      const eduFields = getCanonicalCatalog('education-fields');
      expect(eduFields).toContain('Bilgisayar Mühendisliği');
    });
  });

  describe('7. Custom Fallback Value Formatting', () => {
    it('formats user custom text cleanly with Title Case', () => {
      expect(formatCanonicalCustomValue('kıdemli blockchain mimarı')).toBe('Kıdemli Blockchain Mimarı');
      expect(formatCanonicalCustomValue('   özel   proje   danışmanı  ')).toBe('Özel Proje Danışmanı');
      expect(formatCanonicalCustomValue('')).toBe('');
    });
  });
});
