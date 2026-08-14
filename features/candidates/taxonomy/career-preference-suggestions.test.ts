import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  suggestPreferredRoles,
  suggestPreferredSectors,
} from './career-preference-suggestions';

describe('career preference suggestions from experience', () => {
  it('puts banking management sectors and roles first for şube müdürü', () => {
    const input = {
      experiences: [
        {
          sector: 'Finans / Bankacılık',
          role: 'Şube müdürü',
          roleOther: '',
        },
      ],
    };

    const sectors = suggestPreferredSectors(input);
    expect(sectors[0]).toBe('Finans / Bankacılık');
    expect(sectors).toEqual(
      expect.arrayContaining([
        'Sigorta',
        'Muhasebe / Mali müşavirlik',
        'Holding / Yönetim',
        'Danışmanlık',
        'Satış',
        MANUAL_OPTION,
      ]),
    );
    expect(sectors.at(-1)).toBe(MANUAL_OPTION);
    expect(sectors).not.toContain('Turizm / Otelcilik');
    expect(sectors).not.toContain('Tarım');
    expect(sectors).not.toContain('Çağrı merkezi');
    expect(sectors).not.toContain('Müşteri hizmetleri');
    expect(sectors).not.toContain('Hukuk');
    expect(sectors).not.toContain('Yapay zeka / Veri');

    const roles = suggestPreferredRoles(input);
    expect(roles[0]).toBe('Şube müdürü');
    const managerSlice = roles.slice(0, 12);
    expect(managerSlice).toEqual(
      expect.arrayContaining(['Şube müdürü', 'Bölge müdürü', 'Satış müdürü']),
    );
    expect(roles).toEqual(
      expect.arrayContaining([
        'Portföy yöneticisi',
        'Yönetim danışmanı',
        MANUAL_OPTION,
      ]),
    );
    expect(roles.at(-1)).toBe(MANUAL_OPTION);
    expect(roles).not.toContain('Müşteri temsilcisi');
    expect(roles).not.toContain('Banka müşteri temsilcisi');
    expect(roles).not.toContain('Çağrı merkezi temsilcisi');
    expect(roles).not.toContain('Acente temsilcisi');
    expect(roles).not.toContain('İç satış uzmanı');
    expect(roles).not.toContain('Hesap yöneticisi');
    expect(roles).not.toContain('Bordro uzmanı');
    expect(roles).not.toContain('İnsan kaynakları uzmanı');
    expect(roles).not.toContain('Underwriter');
    expect(roles).not.toContain('Kredi uzmanı');
    expect(roles).not.toContain('Yatırım danışmanı');
    expect(roles).not.toContain('Bankacı / banka personeli');
    expect(roles).not.toContain('Yazılım geliştirici');
    expect(roles).not.toContain('Garson');
  });

  it('keeps already selected values and always offers manual entry', () => {
    const sectors = suggestPreferredSectors({
      experiences: [{ sector: 'Sağlık', role: 'Hemşire', roleOther: '' }],
      selected: ['Turizm / Otelcilik'],
    });
    expect(sectors).toContain('Turizm / Otelcilik');
    expect(sectors).toContain('Sağlık');
    expect(sectors.at(-1)).toBe(MANUAL_OPTION);

    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Sağlık', role: 'Hemşire', roleOther: '' }],
      selected: ['Garson'],
    });
    expect(roles).toContain('Garson');
    expect(roles).toContain('Hemşire');
    expect(roles.at(-1)).toBe(MANUAL_OPTION);
  });

  it('uses roleOther when the experience position is manual', () => {
    const roles = suggestPreferredRoles({
      experiences: [
        {
          sector: 'Finans / Bankacılık',
          role: MANUAL_OPTION,
          roleOther: 'şube müdürü',
        },
      ],
    });
    expect(roles).toEqual(expect.arrayContaining(['şube müdürü', 'Bölge müdürü', 'Satış müdürü', MANUAL_OPTION]));
  });

  it('does not dump the full market for a software developer', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Bilişim / Yazılım', role: 'Yazılım geliştirici', roleOther: '' }],
    });
    expect(roles[0]).toBe('Yazılım geliştirici');
    expect(roles).toEqual(
      expect.arrayContaining(['Frontend geliştirici', 'CTO / Teknik lider', 'Ürün yöneticisi', MANUAL_OPTION]),
    );
    expect(roles).not.toContain('Şube müdürü');
    expect(roles).not.toContain('Aşçı');
  });

  it('surfaces store leadership and retail-adjacent work for mağaza müdürü', () => {
    const sectors = suggestPreferredSectors({
      experiences: [{ sector: 'Perakende / Mağaza', role: 'Mağaza müdürü', roleOther: '' }],
    });
    expect(sectors[0]).toBe('Perakende / Mağaza');
    expect(sectors).toEqual(
      expect.arrayContaining(['Satış', 'E-ticaret / Pazaryeri', 'Lojistik / Depolama', MANUAL_OPTION]),
    );

    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Perakende / Mağaza', role: 'Mağaza müdürü', roleOther: '' }],
    });
    expect(roles[0]).toBe('Mağaza müdürü');
    expect(roles).toEqual(
      expect.arrayContaining(['Bölge müdürü', 'Satış müdürü', MANUAL_OPTION]),
    );
    expect(roles).not.toContain('Kasiyer');
    expect(roles).not.toContain('Satış danışmanı');
    expect(roles).not.toContain('Satış temsilcisi');
    expect(roles).not.toContain('Market personeli');
    expect(roles).not.toContain('İç satış uzmanı');
  });

  it('hides waiters from a restaurant manager and payroll from an HR manager', () => {
    const restaurantRoles = suggestPreferredRoles({
      experiences: [{ sector: 'Gıda / Restoran', role: 'Restoran müdürü', roleOther: '' }],
    });
    expect(restaurantRoles[0]).toBe('Restoran müdürü');
    expect(restaurantRoles).toEqual(expect.arrayContaining(['Otel müdürü', 'Şef / mutfak şefi', MANUAL_OPTION]));
    expect(restaurantRoles).not.toContain('Garson');
    expect(restaurantRoles).not.toContain('Komi');
    expect(restaurantRoles).not.toContain('Aşçı yardımcısı');

    const hrRoles = suggestPreferredRoles({
      experiences: [{ sector: 'İnsan kaynakları', role: 'İK yöneticisi', roleOther: '' }],
    });
    expect(hrRoles[0]).toBe('İK yöneticisi');
    expect(hrRoles).not.toContain('Bordro uzmanı');
    expect(hrRoles).not.toContain('İnsan kaynakları uzmanı');
    expect(hrRoles).not.toContain('İşe alım uzmanı');
  });

  it('lets a bank teller see frontline peers and a promotion path', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Finans / Bankacılık', role: 'Banka müşteri temsilcisi', roleOther: '' }],
    });
    expect(roles[0]).toBe('Banka müşteri temsilcisi');
    expect(roles).toEqual(
      expect.arrayContaining(['Müşteri temsilcisi', 'Şube müdürü', MANUAL_OPTION]),
    );
  });
});
