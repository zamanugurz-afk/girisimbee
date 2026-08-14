import { describe, expect, it } from 'vitest';
import {
  ageFromBirthDate,
  maskDisplaySurname,
  publicGenderLabel,
} from './career-public-identity';

describe('career public identity', () => {
  it('masks surname with one star per letter', () => {
    expect(maskDisplaySurname('Uğur Zaman')).toBe('Uğur *****');
    expect(maskDisplaySurname('Ada Lovelace')).toBe('Ada ********');
    expect(maskDisplaySurname('Uğur')).toBe('Uğur');
    expect(maskDisplaySurname('')).toBeNull();
  });

  it('computes age without exposing the birth date string', () => {
    expect(ageFromBirthDate('1992-04-18', new Date('2026-08-14'))).toBe(34);
    expect(ageFromBirthDate('1992-08-20', new Date('2026-08-14'))).toBe(33);
    expect(ageFromBirthDate('1992-04-18T00:00:00.000Z', new Date('2026-08-14'))).toBe(34);
    expect(ageFromBirthDate('not-a-date')).toBeNull();
  });

  it('only publishes explicit gender choices', () => {
    expect(publicGenderLabel('Erkek')).toBe('Erkek');
    expect(publicGenderLabel('Kadın')).toBe('Kadın');
    expect(publicGenderLabel('Belirtmek istemiyorum')).toBeNull();
  });
});
