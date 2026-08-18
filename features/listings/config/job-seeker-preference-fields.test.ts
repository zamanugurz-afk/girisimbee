import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  CAREER_AVAILABILITY_OPTIONS,
  CAREER_WORKPLACE_OPTIONS,
  JOB_SECTOR_OPTIONS,
  SALARY_RANGES,
  rankWorkplaceOptions,
} from '@/features/listings/config/listing-field-options';
import { HIRING_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';

function field(key: string) {
  return JOB_SEEKER_FIELD_SCHEMA.fields.find((item) => item.key === key);
}

describe('İş Arıyorum preference fields stay on existing option lists', () => {
  it('keeps workplace / salary / city fields unchanged', () => {
    expect(field('workplacePreference')?.options).toEqual([...CAREER_WORKPLACE_OPTIONS]);
    expect(field('salaryExpectation')?.options).toEqual([...SALARY_RANGES]);
    expect(field('availability')?.options).toEqual([...CAREER_AVAILABILITY_OPTIONS]);
    expect(field('preferredCity')?.type).toBe('string');
    expect(field('preferredDistrict')?.type).toBe('string');
  });

  it('uses the same workplace catalog on İşe Alıyorum and ranks factory work first', () => {
    const hire = HIRING_FIELD_SCHEMA.fields.find((item) => item.key === 'workplacePreference');
    expect(hire?.options).toEqual([...CAREER_WORKPLACE_OPTIONS]);
    expect(CAREER_WORKPLACE_OPTIONS).toEqual(
      expect.arrayContaining(['Ofis', 'Uzaktan', 'Hibrit', 'Saha', 'Fabrika / Tesis', 'Vardiyalı']),
    );
    expect(rankWorkplaceOptions('Üretim / Sanayi', 'Fabrika işçisi')[0]).toBe('Fabrika / Tesis');
    expect(rankWorkplaceOptions('Turizm / Otelcilik', 'Otel resepsiyonisti')[0]).toBe('Mağaza / Şube');
    expect(rankWorkplaceOptions('Bilişim / Yazılım', 'Yazılım geliştirici')[0]).toBe('Uzaktan');
  });

  it('allows taxonomy positions and manual sector entry without dropping known sectors', () => {
    const sectors = field('preferredSectors')?.options ?? [];
    expect(sectors).toEqual(expect.arrayContaining([...JOB_SECTOR_OPTIONS, MANUAL_OPTION]));
    expect(field('preferredRoles')?.options).toEqual(
      expect.arrayContaining(['Şube Müdürü', 'Yazılım Geliştirici', MANUAL_OPTION]),
    );
    expect(field('preferredRolesOther')?.type).toBe('string');
  });
});
