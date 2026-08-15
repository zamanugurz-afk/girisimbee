import { describe, expect, it } from 'vitest';
import { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';

describe('career hub navigation labels', () => {
  it('groups jobs under Kariyer ve İş Fırsatları in the header', () => {
    const career = NAV_LINKS.find((link) => link.href === '/is');
    expect(career?.label).toBe('Kariyer ve İş Fırsatları');
    expect(career?.href).toBe('/is');
    expect(NAV_LINKS.some((link) => link.label === 'Yatırım Arıyorum')).toBe(true);
    expect(NAV_LINKS.some((link) => link.label === 'Ortak Arıyorum')).toBe(true);
    expect(NAV_LINKS.some((link) => link.label === 'Franchise İlanları')).toBe(true);
    expect(NAV_LINKS.map((link) => link.label as string)).not.toContain('İş İlanları');
  });

  it('uses the same parent label in the footer categories column', () => {
    const categories = getFooterLinks().Kategoriler ?? [];
    expect(categories.some((link) => link.label === 'Kariyer ve İş Fırsatları' && link.href === '/is')).toBe(true);
    expect(categories.some((link) => link.label === 'Yatırım Arıyorum')).toBe(true);
    expect(categories.map((link) => link.label)).not.toContain('İş İlanları');
  });
});
