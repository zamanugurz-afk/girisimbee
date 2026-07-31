import { describe, it, expect } from 'vitest';
import {
  employerJobListingCreateSchema,
  parseEmployerListingCreate,
} from '@/lib/api/validation/employer-listings';

describe('employer listing validation', () => {
  it('accepts valid job listing create payload', () => {
    const parsed = employerJobListingCreateSchema.parse({
      title: 'Senior Developer',
      shortDescription: 'Full-time remote position available',
      longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
      city: 'Istanbul',
      district: 'Kadıköy',
      sector: 'Technology',
      remotePolicy: 'remote',
      experienceYearsMin: 3,
      contactPhone: '+905551234567',
      contactEmail: 'jobs@acme.com',
    });

    expect(parsed.remotePolicy).toBe('remote');
    expect(parsed.experienceYearsMin).toBe(3);
  });

  it('rejects short title', () => {
    expect(() =>
      employerJobListingCreateSchema.parse({
        title: 'Ab',
        shortDescription: 'Full-time remote position available',
      }),
    ).toThrow();
  });

  it('parseEmployerListingCreate delegates to schema', () => {
    const parsed = parseEmployerListingCreate({
      title: 'Backend Engineer',
      shortDescription: 'Node.js backend engineer role open',
      contactPhone: '+905551234567',
    });
    expect(parsed.title).toBe('Backend Engineer');
  });
});
