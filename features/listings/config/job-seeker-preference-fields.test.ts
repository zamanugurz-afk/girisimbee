import { describe, expect, it } from 'vitest';
import {
  CAREER_AVAILABILITY_OPTIONS,
  CAREER_WORKPLACE_OPTIONS,
  JOB_POSITION_OPTIONS,
  JOB_SECTOR_OPTIONS,
  SALARY_RANGES,
} from '@/features/listings/config/listing-field-options';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';

function field(key: string) {
  return JOB_SEEKER_FIELD_SCHEMA.fields.find((item) => item.key === key);
}

describe('İş Arıyorum preference fields stay on existing option lists', () => {
  it('does not move preference fields onto the career taxonomy cascade', () => {
    expect(field('preferredSectors')?.options).toEqual([...JOB_SECTOR_OPTIONS]);
    expect(field('preferredRoles')?.options).toEqual([...JOB_POSITION_OPTIONS]);
    expect(field('workplacePreference')?.options).toEqual([...CAREER_WORKPLACE_OPTIONS]);
    expect(field('salaryExpectation')?.options).toEqual([...SALARY_RANGES]);
    expect(field('availability')?.options).toEqual([...CAREER_AVAILABILITY_OPTIONS]);
    expect(field('preferredCity')?.type).toBe('string');
    expect(field('preferredDistrict')?.type).toBe('string');
  });
});
