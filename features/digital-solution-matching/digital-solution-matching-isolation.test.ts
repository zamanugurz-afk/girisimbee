import { describe, expect, it } from 'vitest';
import { CAREER_MATCH_WEIGHTS } from '@/features/matching-engine/scoring';
import { PARTNERSHIP_MATCH_WEIGHTS } from '@/features/partnership-matching/scoring';
import { DIGITAL_SOLUTION_MATCH_WEIGHTS } from '@/features/digital-solution-matching/scoring';
import { DASHBOARD_ROUTES, DASHBOARD_NAV_ITEMS } from '@/features/dashboard/panel/dashboard-nav.constants';
import { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';

describe('Digital Solution Matching Isolation', () => {
  it('preserves career matching weights and configuration untouched', () => {
    expect(CAREER_MATCH_WEIGHTS.role).toBe(25);
    expect(CAREER_MATCH_WEIGHTS.professionalSkills).toBe(12);
    expect(CAREER_MATCH_WEIGHTS.technicalSkills).toBe(8);
    expect(CAREER_MATCH_WEIGHTS.sector).toBe(15);
    expect(CAREER_MATCH_WEIGHTS.location).toBe(15);
    expect(CAREER_MATCH_WEIGHTS.experience).toBe(10);
    expect(CAREER_MATCH_WEIGHTS.workModel).toBe(10);
    expect(CAREER_MATCH_WEIGHTS.salary).toBe(3);
    expect(CAREER_MATCH_WEIGHTS.availability).toBe(2);
  });

  it('preserves partnership matching weights untouched', () => {
    expect(PARTNERSHIP_MATCH_WEIGHTS.skills).toBe(25);
    expect(PARTNERSHIP_MATCH_WEIGHTS.sector).toBe(20);
    expect(PARTNERSHIP_MATCH_WEIGHTS.partnershipType).toBe(15);
    expect(PARTNERSHIP_MATCH_WEIGHTS.commitment).toBe(15);
    expect(PARTNERSHIP_MATCH_WEIGHTS.stage).toBe(10);
    expect(PARTNERSHIP_MATCH_WEIGHTS.experience).toBe(5);
    expect(PARTNERSHIP_MATCH_WEIGHTS.location).toBe(5);
    expect(PARTNERSHIP_MATCH_WEIGHTS.equity).toBe(5);
  });

  it('has independent digital solution matching weights', () => {
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.sector).toBe(25);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.targetAudience).toBe(20);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.capabilities).toBe(20);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.solutionType).toBe(15);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.deliveryModel).toBe(10);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.location).toBe(5);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.priceRange).toBe(3);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.language).toBe(2);
  });

  it('preserves dashboard navigation structure without extraneous items', () => {
    expect(DASHBOARD_ROUTES.kariyerProfilim).toBe('/dashboard/kariyer-profilim');
    expect(DASHBOARD_ROUTES.eslesmeler).toBe('/dashboard/eslesmeler');
    expect(DASHBOARD_ROUTES.ortaklikEslesmeleri).toBe('/dashboard/ortaklik-eslesmeleri');
    expect(DASHBOARD_NAV_ITEMS.some((item) => item.id === 'eslesmeler')).toBe(false);
    expect(DASHBOARD_NAV_ITEMS.some((item) => item.id === 'ortaklikEslesmeleri')).toBe(false);
  });

  it('keeps navigation and footer clean and free of investment discovery', () => {
    expect(NAV_LINKS.find((link) => link.label === 'Kariyer ve İş Fırsatları')?.href).toBe('/is');
    expect(NAV_LINKS.find((link) => link.label === 'Girişim ve Ortaklık')?.href).toBe('/girisim-ortaklik');
    expect(NAV_LINKS.find((link) => link.label === 'Fırsatlar')?.href).toBe('/market');
    expect(NAV_LINKS.find((link) => link.label === 'Çözümler')?.href).toBe('/dijital-ai');

    const footer = getFooterLinks();
    expect(JSON.stringify(footer)).not.toMatch(/\/invest|Yatırım Arıyorum/);
  });
});
