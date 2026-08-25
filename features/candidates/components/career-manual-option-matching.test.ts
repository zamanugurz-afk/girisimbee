import { describe, it, expect } from 'vitest';
import {
  searchTaxonomyCatalog,
  getCanonicalCatalog,
  formatCanonicalCustomValue,
} from '@/features/shared/services/set-matching.service';
import {
  getAllTaxonomyCertificates,
  getAllTaxonomyPositions,
  parseSelectedList,
  joinSelectedList,
  MANUAL_OPTION,
  isManualCareerOption,
} from '@/features/candidates/taxonomy/career-taxonomy';

describe('Career Manual Option Matching & Live Set Matcher (SEGEM & Global Sets)', () => {
  describe('1. SEGEM Certificate Scenario (Root-Cause & Acceptance Tests)', () => {
    it('always includes SEGEM in the global certificates taxonomy', () => {
      const allCerts = getAllTaxonomyCertificates();
      expect(allCerts).toContain('SEGEM');
      expect(allCerts.some((c) => c.includes('SEGEM'))).toBe(true);
    });

    it('matches "segem" directly to canonical "SEGEM" as exact match (score 1000)', () => {
      const allCerts = getAllTaxonomyCertificates();
      const matches = searchTaxonomyCatalog('segem', allCerts);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toBe('SEGEM');
      expect(matches[0].score).toBe(1000);
      expect(matches[0].matchQuality).toBe('exact');
    });

    it('matches "SEGEM", "Segem", "sEGEM" identically with 1000 score', () => {
      const allCerts = getAllTaxonomyCertificates();
      for (const query of ['SEGEM', 'Segem', 'sEGEM', 'segem']) {
        const matches = searchTaxonomyCatalog(query, allCerts);
        expect(matches[0].value).toBe('SEGEM');
        expect(matches[0].score).toBe(1000);
      }
    });

    it('matches prefix "sege" to "SEGEM"', () => {
      const allCerts = getAllTaxonomyCertificates();
      const matches = searchTaxonomyCatalog('sege', allCerts);
      const matchedNames = matches.map((m) => m.value);
      expect(matchedNames).toContain('SEGEM');
    });

    it('matches "pmp" to "PMP" and "PMP (Proje Yönetimi)"', () => {
      const allCerts = getAllTaxonomyCertificates();
      const matches = searchTaxonomyCatalog('pmp', allCerts);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toBe('PMP');
    });
  });

  describe('2. Multi-Select & Duplicate Prevention Flow', () => {
    it('simulates user selecting SEGEM, then searching and adding PMP', () => {
      const allCerts = getAllTaxonomyCertificates();
      let selected: string[] = [MANUAL_OPTION]; // User checked "Diğer / Kendim gireceğim"

      // Step 1: User types "segem"
      const segemMatches = searchTaxonomyCatalog('segem', allCerts, {
        excludeValues: selected.filter((s) => !isManualCareerOption(s)),
      });
      expect(segemMatches[0].value).toBe('SEGEM');

      // Step 2: User clicks SEGEM
      selected = [...selected, segemMatches[0].value];
      expect(selected).toContain('SEGEM');

      // Step 3: User types "pmp" -> SEGEM is excluded, PMP is found
      const pmpMatches = searchTaxonomyCatalog('pmp', allCerts, {
        excludeValues: selected.filter((s) => !isManualCareerOption(s)),
      });
      expect(pmpMatches[0].value).toBe('PMP');

      // Step 4: User clicks PMP
      selected = [...selected, pmpMatches[0].value];
      expect(selected).toContain('SEGEM');
      expect(selected).toContain('PMP');

      // Step 5: Serialized string contains both
      const serialized = joinSelectedList(selected.filter((s) => !isManualCareerOption(s)));
      expect(serialized).toBe('SEGEM · PMP');
      expect(parseSelectedList(serialized)).toEqual(['SEGEM', 'PMP']);
    });
  });

  describe('3. Manual Fallback for Custom Values', () => {
    it('formats and preserves custom non-catalog values cleanly', () => {
      const allCerts = getAllTaxonomyCertificates();
      const customQuery = 'özel kalite denetçisi sertifikası 2026';

      const matches = searchTaxonomyCatalog(customQuery, allCerts);
      expect(matches.some((m) => m.matchQuality === 'exact')).toBe(false);

      const formatted = formatCanonicalCustomValue(customQuery);
      expect(formatted).toBe('Özel Kalite Denetçisi Sertifikası 2026');
    });
  });

  describe('4. "Bölge" Positions Autocomplete & Ranking', () => {
    it('matches "bölge" to all regional manager positions in ranked order', () => {
      const allPositions = getAllTaxonomyPositions();
      const matches = searchTaxonomyCatalog('bölge', allPositions);
      const values = matches.map((m) => m.value);

      expect(values).toContain('Bölge Müdürü');
      expect(values).toContain('Bölge Satış Müdürü');
      expect(values).toContain('Bölge Operasyon Müdürü');
      expect(matches[0].matchQuality).toBe('prefix');
      expect(matches[0].score).toBeGreaterThanOrEqual(700);
    });
  });

  describe('5. Skills, Tools, and Other Domains', () => {
    it('searches and matches professional skills (e.g. "risk", "müzakere")', () => {
      const profSkills = getCanonicalCatalog('professional-skills');
      const matches = searchTaxonomyCatalog('müzakere', profSkills);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.value.includes('Müzakere'))).toBe(true);
    });

    it('searches and matches technical skills (e.g. "docker", "sql")', () => {
      const techSkills = getCanonicalCatalog('technical-skills');
      const matches = searchTaxonomyCatalog('docker', techSkills);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.value.includes('Docker'))).toBe(true);
    });

    it('searches and matches tools (e.g. "excel", "figma", "jira")', () => {
      const tools = getCanonicalCatalog('tools');
      const matches = searchTaxonomyCatalog('excel', tools);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.value.includes('Excel'))).toBe(true);
    });
  });
});
