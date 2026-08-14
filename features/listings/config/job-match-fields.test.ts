import { describe, expect, it } from 'vitest';
import { suggestResponsibilities } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  HIRING_FIELD_SCHEMA,
  JOB_SEEKER_FIELD_SCHEMA,
} from '@/features/listings/config/listing-type-config';
import { SALARY_RANGES } from '@/features/listings/config/listing-field-options';
import { JOB_MATCH_FIELD_KEYS } from './job-match-fields';

function schemaField(schema: typeof JOB_SEEKER_FIELD_SCHEMA, key: string) {
  return schema.fields.find((item) => item.key === key);
}

describe('İş Arıyorum ↔ İşe Alıyorum match keys', () => {
  it('keeps the same customField keys on both schemas', () => {
    for (const key of JOB_MATCH_FIELD_KEYS) {
      expect(schemaField(JOB_SEEKER_FIELD_SCHEMA, key)?.key).toBe(key);
      expect(schemaField(HIRING_FIELD_SCHEMA, key)?.key).toBe(key);
    }
  });

  it('uses the same enum option lists for shared match fields', () => {
    for (const key of [
      'primarySector',
      'desiredRole',
      'experienceLevel',
      'workType',
      'workplacePreference',
      'educationLevel',
      'availability',
    ] as const) {
      expect(schemaField(HIRING_FIELD_SCHEMA, key)?.options).toEqual(
        schemaField(JOB_SEEKER_FIELD_SCHEMA, key)?.options,
      );
    }
  });

  it('aligns hire salaryRange with seeker salaryExpectation bands', () => {
    expect(schemaField(HIRING_FIELD_SCHEMA, 'salaryRange')?.options).toEqual([...SALARY_RANGES]);
    expect(schemaField(JOB_SEEKER_FIELD_SCHEMA, 'salaryExpectation')?.options).toEqual([
      ...SALARY_RANGES,
    ]);
  });

  it('uses the same position catalog for hire duties and seeker experience', () => {
    const input = { sector: 'Sağlık', role: 'Hemşire', experienceLevel: 'Mid' };
    expect(suggestResponsibilities(input)).toEqual(suggestResponsibilities(input));
    expect(suggestResponsibilities(input).length).toBeGreaterThan(1);
  });
});
