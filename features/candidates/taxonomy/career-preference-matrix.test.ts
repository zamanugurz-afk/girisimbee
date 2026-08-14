import { describe, expect, it } from 'vitest';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { getPositionsForSector, MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  suggestPreferredRoles,
  suggestPreferredSectors,
} from './career-preference-suggestions';

const LEAKS: Array<{ sector: string; role: string; forbidden: string[] }> = [
  {
    sector: 'Üretim / Sanayi',
    role: 'Fabrika işçisi',
    forbidden: ['Gıda mühendisi', 'Garson', 'Yazılım geliştirici', 'Satış temsilcisi', 'Çelik işçisi', 'Mobilya ustası'],
  },
  {
    sector: 'Tekstil / Hazır giyim',
    role: 'Üretim işçisi',
    forbidden: ['Gıda mühendisi', 'Garson', 'Yazılım geliştirici', 'Mobilya ustası', 'Çelik işçisi'],
  },
  {
    sector: 'Mobilya',
    role: 'Mobilya ustası',
    forbidden: ['Gıda mühendisi', 'Kaynakçı', 'Çelik işçisi', 'Garson'],
  },
  {
    sector: 'Kimya / Plastik',
    role: 'Üretim işçisi',
    forbidden: ['Garson', 'Yazılım geliştirici', 'Mobilya ustası'],
  },
  {
    sector: 'Gıda / Restoran',
    role: 'Garson',
    forbidden: ['Fabrika işçisi', 'Yazılım geliştirici', 'Şube müdürü'],
  },
  {
    sector: 'Gıda / Restoran',
    role: 'Gıda mühendisi',
    forbidden: ['Garson', 'Komi', 'Kaynakçı', 'Çelik işçisi'],
  },
  {
    sector: 'Turizm / Otelcilik',
    role: 'Otel resepsiyonisti',
    forbidden: ['Fabrika işçisi', 'Yazılım geliştirici', 'Kasiyer'],
  },
  {
    sector: 'Sağlık',
    role: 'Hemşire',
    forbidden: ['Garson', 'Fabrika işçisi', 'Satış temsilcisi'],
  },
  {
    sector: 'Eğitim',
    role: 'Eğitmen / öğretmen',
    forbidden: ['Garson', 'Fabrika işçisi', 'Satış temsilcisi'],
  },
  {
    sector: 'Lojistik / Depolama',
    role: 'Depo görevlisi',
    forbidden: ['Fabrika işçisi', 'Garson', 'Yazılım geliştirici'],
  },
  {
    sector: 'Ulaşım / Şoförlük',
    role: 'Şoför (kamyon / TIR)',
    forbidden: ['Fabrika işçisi', 'Kaynakçı', 'Garson'],
  },
  {
    sector: 'Oto servis / Yetkili servis',
    role: 'Servis danışmanı',
    forbidden: ['Fabrika işçisi', 'Garson', 'Yazılım geliştirici'],
  },
  {
    sector: 'Güvenlik',
    role: 'Güvenlik görevlisi',
    forbidden: ['Fabrika işçisi', 'Garson', 'Yazılım geliştirici'],
  },
  {
    sector: 'Tarım',
    role: 'Çiftçi / tarım işçisi',
    forbidden: ['Fabrika işçisi', 'Garson', 'Yazılım geliştirici'],
  },
  {
    sector: 'Bilişim / Yazılım',
    role: 'Yazılım geliştirici',
    forbidden: ['Şube müdürü', 'Aşçı', 'Fabrika işçisi', 'Garson'],
  },
  {
    sector: 'Pazarlama / Reklam',
    role: 'Pazarlama uzmanı',
    forbidden: ['Fabrika işçisi', 'Garson', 'Şube müdürü'],
  },
  {
    sector: 'Muhasebe / Mali müşavirlik',
    role: 'Muhasebeci',
    forbidden: ['Fabrika işçisi', 'Garson', 'Yazılım geliştirici'],
  },
  {
    sector: 'Hukuk',
    role: 'Avukat',
    forbidden: ['Fabrika işçisi', 'Garson', 'Kasiyer'],
  },
  {
    sector: 'Madencilik',
    role: 'İş sağlığı ve güvenliği uzmanı',
    forbidden: ['Garson', 'Yazılım geliştirici', 'Kasiyer'],
  },
];

describe('preference catalog matrix', () => {
  it('starts every sector/position catalog with the current job and ends with manual entry', () => {
    const pairs: Array<{ sector: string; role: string }> = [];
    for (const sector of JOB_SECTOR_OPTIONS) {
      if (sector === 'Diğer') continue;
      for (const role of getPositionsForSector(sector)) {
        if (role === MANUAL_OPTION) continue;
        pairs.push({ sector, role });
      }
    }

    expect(pairs.length).toBeGreaterThan(200);

    for (const { sector, role } of pairs) {
      const input = { experiences: [{ sector, role, roleOther: '' }] };
      const sectors = suggestPreferredSectors(input);
      const roles = suggestPreferredRoles(input);
      expect(sectors[0], `${sector} / ${role} sector head`).toBe(sector);
      expect(sectors.at(-1), `${sector} / ${role} sector tail`).toBe(MANUAL_OPTION);
      expect(roles[0], `${sector} / ${role} role head`).toBe(role);
      expect(roles.at(-1), `${sector} / ${role} role tail`).toBe(MANUAL_OPTION);
    }
  });

  it('does not leak unrelated titles across representative occupations', () => {
    for (const { sector, role, forbidden } of LEAKS) {
      const roles = suggestPreferredRoles({
        experiences: [{ sector, role, roleOther: '' }],
      });
      for (const title of forbidden) {
        expect(roles, `${sector} / ${role}`).not.toContain(title);
      }
    }
  });
});
