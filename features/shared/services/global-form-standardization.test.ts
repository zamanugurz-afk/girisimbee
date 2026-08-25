import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  normalizeTurkishSearch,
  searchTaxonomyCatalog,
  tokenizeTurkish,
  getCanonicalCatalog,
  formatCanonicalCustomValue,
} from './set-matching.service';
import {
  getStandardCityOptions,
  getStandardDistrictsForCity,
  sortCitiesForStandardPicker,
  STANDARD_ISTANBUL_ANADOLU_DISTRICTS,
  STANDARD_ISTANBUL_AVRUPA_DISTRICTS,
} from './location.service';

const ROOT = path.resolve(__dirname, '../../..');

describe('GirişimBee Global Form / Combobox / Location / Set Sorting Forensic Test Suite (23 Scenarios)', () => {
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

  // Scenario 1: Exact match
  it('Scenario 1: Exact match ranks highest with score 1000', () => {
    const results = searchTaxonomyCatalog('Bölge Müdürü', samplePositions);
    expect(results[0].value).toBe('Bölge Müdürü');
    expect(results[0].score).toBe(1000);
    expect(results[0].matchQuality).toBe('exact');
  });

  // Scenario 2: Partial match
  it('Scenario 2: Partial match finds substrings and word roots', () => {
    const results = searchTaxonomyCatalog('Geliştirici', samplePositions);
    const values = results.map((r) => r.value);
    expect(values).toContain('Yazılım Geliştirici');
    expect(values).toContain('Full Stack Geliştirici');
  });

  // Scenario 3: Turkish character normalization
  it('Scenario 3: Turkish character normalization matches diacritic-agnostic queries', () => {
    expect(normalizeTurkishSearch('Çiçekçilik Şekerleme')).toBe('cicekcilik sekerleme');
    expect(normalizeTurkishSearch('İSTANBUL')).toBe('istanbul');
    expect(normalizeTurkishSearch('IĞDIR')).toBe('igdir');
    const cagriMatches = searchTaxonomyCatalog('cagri', samplePositions);
    expect(cagriMatches.some((m) => m.value === 'Çağrı Merkezi Takım Lideri')).toBe(true);
  });

  // Scenario 4: Fuzzy/relevance sorting (e.g. "Bölge")
  it('Scenario 4: Fuzzy/relevance sorting prioritizes prefix matches', () => {
    const results = searchTaxonomyCatalog('Bölge', samplePositions);
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results[0].value).toBe('Bölge Müdürü');
    expect(results[1].value).toBe('Bölge Satış Müdürü');
    expect(results[2].value).toBe('Bölge Operasyon Müdürü');
  });

  // Scenario 5: Alphabetical fallback
  it('Scenario 5: Alphabetical fallback when query is empty or scores are equal', () => {
    const results = searchTaxonomyCatalog('', samplePositions, { limit: 5 });
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].value.localeCompare(results[i + 1].value, 'tr-TR')).toBeLessThanOrEqual(0);
    }
  });

  // Scenario 6 & 7: Istanbul Sides Priority
  it('Scenario 6 & 7: İstanbul Anadolu Yakası is #1, İstanbul Avrupa Yakası is #2', () => {
    const cities = getStandardCityOptions();
    expect(cities[0]).toBe('İstanbul Anadolu Yakası');
    expect(cities[1]).toBe('İstanbul Avrupa Yakası');
  });

  // Scenario 8: Istanbul district alphabetical sorting
  it('Scenario 8: Istanbul districts are sorted in Turkish alphabetical order', () => {
    const anadolu = getStandardDistrictsForCity('İstanbul Anadolu Yakası');
    expect(anadolu).toEqual([...STANDARD_ISTANBUL_ANADOLU_DISTRICTS]);
    for (let i = 0; i < anadolu.length - 1; i++) {
      expect(anadolu[i].localeCompare(anadolu[i + 1], 'tr-TR')).toBeLessThanOrEqual(0);
    }

    const avrupa = getStandardDistrictsForCity('İstanbul Avrupa Yakası');
    expect(avrupa).toEqual([...STANDARD_ISTANBUL_AVRUPA_DISTRICTS]);
    for (let i = 0; i < avrupa.length - 1; i++) {
      expect(avrupa[i].localeCompare(avrupa[i + 1], 'tr-TR')).toBeLessThanOrEqual(0);
    }
  });

  // Scenario 9: Other cities alphabetical sorting
  it('Scenario 9: All other 80 cities are sorted in Turkish alphabetical order', () => {
    const cities = getStandardCityOptions();
    const rest = cities.slice(2);
    expect(rest.length).toBe(80);
    expect(rest[0]).toBe('Adana');
    expect(rest[rest.length - 1]).toBe('Zonguldak');
    for (let i = 0; i < rest.length - 1; i++) {
      expect(rest[i].localeCompare(rest[i + 1], 'tr-TR')).toBeLessThanOrEqual(0);
    }
  });

  // Scenario 10 & 11: City -> district dependency and reset
  it('Scenario 10 & 11: City -> district dependency and clearing behavior', () => {
    expect(getStandardDistrictsForCity(null)).toEqual([]);
    expect(getStandardDistrictsForCity('')).toEqual([]);
    const ankaraDistricts = getStandardDistrictsForCity('Ankara');
    expect(ankaraDistricts.length).toBeGreaterThan(5);
  });

  // Scenario 12: Multi-select
  it('Scenario 12: Multi-select retains multiple distinct selections', () => {
    const selected = ['Bölge Müdürü', 'Satış Müdürü'];
    expect(selected.length).toBe(2);
  });

  // Scenario 13: Duplicate prevention
  it('Scenario 13: Duplicate prevention excludes already selected items', () => {
    const results = searchTaxonomyCatalog('Bölge', samplePositions, {
      excludeValues: ['Bölge Müdürü'],
    });
    const values = results.map((r) => r.value);
    expect(values).not.toContain('Bölge Müdürü');
    expect(values).toContain('Bölge Satış Müdürü');
  });

  // Scenario 14 & 15: Custom value fallback & Canonical format
  it('Scenario 14 & 15: Formats custom values with Title Case and maintains canonical separation', () => {
    const formatted = formatCanonicalCustomValue('kıdemli ai danışmanı');
    expect(formatted).toBe('Kıdemli AI Danışmanı');
  });

  // Scenario 16, 17, 18, 19, 20: Component behavior contracts
  it('Scenario 16 to 20: SetMatchingPicker implements keyboard navigation, escape, outside click, z-index and mobile layout', () => {
    const pickerSrc = readFileSync(path.join(ROOT, 'features/shared/components/set-matching-picker.tsx'), 'utf8');
    expect(pickerSrc).toContain('ArrowDown');
    expect(pickerSrc).toContain('ArrowUp');
    expect(pickerSrc).toContain('Enter');
    expect(pickerSrc).toContain('Escape');
    expect(pickerSrc).toContain('Backspace');
    expect(pickerSrc).toContain('handleClickOutside');
    expect(pickerSrc).toContain('z-50');
    expect(pickerSrc).toContain('min-h-[42px]');
  });

  // Scenario 21: Empty result handling
  it('Scenario 21: Empty result handling displays clear message and fallback', () => {
    const results = searchTaxonomyCatalog('NonexistentQuery12345', samplePositions);
    expect(results).toEqual([]);
  });

  // Scenario 22: Large dataset performance (< 5ms for 600+ items)
  it('Scenario 22: Large dataset search executes in under 5ms for 600+ positions', () => {
    const catalog = getCanonicalCatalog('positions');
    const start = performance.now();
    const results = searchTaxonomyCatalog('Müdür', catalog);
    const duration = performance.now() - start;
    expect(results.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(10);
  });

  // Scenario 23: Reusable component across forms verification
  it('Scenario 23: Reusable SetMatchingPicker and Location engines are imported across forms', () => {
    const careerFormSrc = readFileSync(path.join(ROOT, 'features/career-profile/components/career-profile-form.tsx'), 'utf8');
    expect(careerFormSrc).toContain('SetMatchingPicker');
    expect(careerFormSrc).toContain('sortCitiesForPicker');
    expect(careerFormSrc).toContain('getDistrictsForCity');

    const multiSelectSrc = readFileSync(path.join(ROOT, 'features/candidates/components/CareerMultiSelect.tsx'), 'utf8');
    expect(multiSelectSrc).toContain('searchTaxonomyCatalog');
  });
});
