import { describe, expect, it } from 'vitest';
import {
  getDistrictsForCity,
  ISTANBUL_ANADOLU_DISTRICTS,
  ISTANBUL_AVRUPA_DISTRICTS,
} from './turkish-districts';

describe('Istanbul side districts', () => {
  it('returns only Avrupa Yakası districts when that side is selected', () => {
    const districts = getDistrictsForCity('İstanbul Avrupa Yakası');
    expect(districts).toEqual(expect.arrayContaining(['Beşiktaş', 'Şişli', 'Bakırköy', 'Fatih', 'Diğer']));
    expect(districts).not.toContain('Kadıköy');
    expect(districts).not.toContain('Üsküdar');
    expect(districts).toHaveLength(ISTANBUL_AVRUPA_DISTRICTS.length + 1);
  });

  it('returns only Anadolu Yakası districts when that side is selected', () => {
    const districts = getDistrictsForCity('İstanbul Anadolu Yakası');
    expect(districts).toEqual(expect.arrayContaining(['Kadıköy', 'Üsküdar', 'Ataşehir', 'Pendik', 'Diğer']));
    expect(districts).not.toContain('Beşiktaş');
    expect(districts).not.toContain('Şişli');
    expect(districts).toHaveLength(ISTANBUL_ANADOLU_DISTRICTS.length + 1);
  });

  it('keeps the full Istanbul list for plain İstanbul', () => {
    const districts = getDistrictsForCity('İstanbul');
    expect(districts).toEqual(expect.arrayContaining(['Kadıköy', 'Beşiktaş', 'Diğer']));
  });
});
