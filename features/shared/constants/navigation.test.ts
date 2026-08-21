import { describe, expect, it } from 'vitest';
import { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';

describe('homepage information architecture navigation', () => {
  it('exposes the four homepage pillars in the header', () => {
    expect(NAV_LINKS.map((link) => [link.label, link.href])).toEqual([
      ['Kariyer ve İş Fırsatları', '/is'],
      ['Ortaklık ve Devir', '/girisim-ortaklik'],
      ['Fırsatlar', '/market'],
      ['Çözümler', '/dijital-ai'],
    ]);
    expect(NAV_LINKS.map((link) => link.label).join(' ')).not.toContain('Yatırım');
    expect(NAV_LINKS.map((link) => link.label).join(' ')).not.toContain('&');
  });

  it('mirrors the same pillars in the footer without showing investment', () => {
    const footer = getFooterLinks();
    expect(Object.keys(footer)).toEqual([
      'Kariyer ve İş Fırsatları',
      'Ortaklık ve Devir',
      'Fırsatlar',
      'Çözümler',
      'Hesap',
      'İletişim',
    ]);
    expect(footer['Kariyer ve İş Fırsatları']?.map((link) => [link.label, link.href])).toEqual([
      ['İş Arıyorum', '/is?flow=hire'],
      ['İşe Alıyorum', '/is?flow=seek'],
    ]);
    expect(footer['Ortaklık ve Devir']?.map((link) => [link.label, link.href])).toEqual([
      ['Ortak Arıyorum', '/partners?intent=seeking'],
      ['Ortak Olmak İstiyorum', '/partners?intent=joining'],
      ['Franchise Fırsatları', '/franchise/buy'],
    ]);
    expect(footer.Fırsatlar?.map((link) => [link.label, link.href])).toEqual([
      ['Girişimbee MARKET', '/market'],
    ]);
    expect(footer.Çözümler?.map((link) => [link.label, link.href])).toEqual([
      ['Dijital & AI Çözümleri', '/dijital-ai'],
    ]);
    const allLabels = Object.values(footer).flat().map((link) => link.label);
    expect(allLabels).not.toContain('Yatırım Arıyorum');
    expect(allLabels).not.toContain('Yatırım Yap');
  });
});
