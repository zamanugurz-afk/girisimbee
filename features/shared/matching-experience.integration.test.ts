import { describe, expect, it } from 'vitest';
import { CAREER_MATCH_WEIGHTS } from '@/features/matching-engine/scoring';
import { PARTNERSHIP_MATCH_WEIGHTS } from '@/features/partnership-matching/scoring';
import { DIGITAL_SOLUTION_MATCH_WEIGHTS } from '@/features/digital-solution-matching/scoring';
import { FRANCHISE_MATCH_WEIGHTS } from '@/features/franchise-matching/scoring';
import { MATCH_GRID_CLASS } from '@/features/matching-engine/presentation/career-match-layout';
import { PARTNERSHIP_MATCH_GRID_CLASS } from '@/features/partnership-matching/presentation/partnership-match-layout';
import { DIGITAL_SOLUTION_MATCH_GRID_CLASS } from '@/features/digital-solution-matching/presentation/digital-solution-match-layout';
import { FRANCHISE_MATCH_GRID_CLASS } from '@/features/franchise-matching/presentation/franchise-match-layout';
import { assertNoContactLeak as assertNoCareerContactLeak } from '@/features/matching-engine/adapters/public-card';
import { assertNoPartnershipContactLeak } from '@/features/partnership-matching/presentation/partnership-match-party';
import { assertNoDigitalSolutionContactLeak } from '@/features/digital-solution-matching/adapters/public-card';
import { assertNoFranchiseContactLeak } from '@/features/franchise-matching/adapters/public-card';
import { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';

describe('Unified Matching Experience & Integration Quality Gates', () => {
  it('all 4 matching systems maintain exact independent weights', () => {
    // 1. Career: 25 + 12 + 8 + 15 + 15 + 10 + 10 + 3 + 2 = 100
    const careerSum = Object.values(CAREER_MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(careerSum).toBe(100);

    // 2. Partnership: 25 + 20 + 15 + 15 + 10 + 5 + 5 + 5 = 100
    const partnershipSum = Object.values(PARTNERSHIP_MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(partnershipSum).toBe(100);

    // 3. Digital & AI: 25 + 20 + 20 + 15 + 10 + 5 + 3 + 2 = 100
    const digitalSum = Object.values(DIGITAL_SOLUTION_MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(digitalSum).toBe(100);

    // 4. Franchise: 30 + 25 + 20 + 15 + 5 + 5 = 100
    const franchiseSum = Object.values(FRANCHISE_MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(franchiseSum).toBe(100);
  });

  it('all 4 matching systems share standard responsive grid layouts', () => {
    expect(MATCH_GRID_CLASS).toContain('grid');
    expect(MATCH_GRID_CLASS).toContain('sm:grid-cols-2');
    expect(MATCH_GRID_CLASS).toContain('lg:grid-cols-3');

    expect(PARTNERSHIP_MATCH_GRID_CLASS).toContain('grid');
    expect(PARTNERSHIP_MATCH_GRID_CLASS).toContain('sm:grid-cols-2');
    expect(PARTNERSHIP_MATCH_GRID_CLASS).toContain('lg:grid-cols-3');

    expect(DIGITAL_SOLUTION_MATCH_GRID_CLASS).toContain('grid');
    expect(DIGITAL_SOLUTION_MATCH_GRID_CLASS).toContain('sm:grid-cols-2');
    expect(DIGITAL_SOLUTION_MATCH_GRID_CLASS).toContain('lg:grid-cols-3');

    expect(FRANCHISE_MATCH_GRID_CLASS).toContain('grid');
    expect(FRANCHISE_MATCH_GRID_CLASS).toContain('sm:grid-cols-2');
    expect(FRANCHISE_MATCH_GRID_CLASS).toContain('lg:grid-cols-3');
  });

  it('all 4 matching systems strictly assert anti-leak privacy rules', () => {
    const leakedData = {
      title: 'Test Card',
      score: 90,
      contactPhone: '05550001122',
      contactEmail: 'secret@domain.com',
    };

    expect(() => assertNoCareerContactLeak(leakedData)).toThrow();
    expect(() => assertNoPartnershipContactLeak(leakedData)).toThrow();
    expect(() => assertNoDigitalSolutionContactLeak(leakedData)).toThrow();
    expect(() => assertNoFranchiseContactLeak(leakedData)).toThrow();

    const safeData = {
      title: 'Safe Public Card',
      score: 88,
      band: 'very_strong',
      reasons: [{ kind: 'match', text: 'Uyumlu sektör' }],
    };

    expect(() => assertNoCareerContactLeak(safeData)).not.toThrow();
    expect(() => assertNoPartnershipContactLeak(safeData)).not.toThrow();
    expect(() => assertNoDigitalSolutionContactLeak(safeData)).not.toThrow();
    expect(() => assertNoFranchiseContactLeak(safeData)).not.toThrow();
  });

  it('preserves clean navigation and strictly excludes Yatırım Arıyorum / /invest', () => {
    expect(NAV_LINKS.map((l) => l.href)).toEqual([
      '/is',
      '/girisim-ortaklik',
      '/market',
    ]);

    const footer = getFooterLinks();
    expect(JSON.stringify(footer)).not.toMatch(/\/invest|Yatırım Arıyorum/);
  });
});
