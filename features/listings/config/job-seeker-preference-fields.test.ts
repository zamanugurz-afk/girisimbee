import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  CAREER_AVAILABILITY_OPTIONS,
  CAREER_WORKPLACE_OPTIONS,
  JOB_SECTOR_OPTIONS,
  SALARY_RANGES,
} from '@/features/listings/config/listing-field-options';
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

  it('allows taxonomy positions and manual sector entry without dropping known sectors', () => {
    const sectors = field('preferredSectors')?.options ?? [];
    expect(sectors).toEqual(expect.arrayContaining([...JOB_SECTOR_OPTIONS, MANUAL_OPTION]));
    expect(field('preferredRoles')?.options).toEqual(
      expect.arrayContaining(['Şube müdürü', 'Yazılım geliştirici', MANUAL_OPTION]),
    );
    expect(field('preferredRolesOther')?.type).toBe('string');
  });
});
