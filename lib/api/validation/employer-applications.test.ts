import { describe, it, expect } from 'vitest';
import {
  employerApplicationStatusSchema,
  employerApplicationStatusUpdateSchema,
} from '@/lib/api/validation/employer-applications';

describe('employer application validation', () => {
  it('accepts valid status values', () => {
    expect(employerApplicationStatusSchema.parse('pending')).toBe('pending');
    expect(employerApplicationStatusSchema.parse('accepted')).toBe('accepted');
  });

  it('accepts status update with note', () => {
    const parsed = employerApplicationStatusUpdateSchema.parse({
      status: 'reviewing',
      note: 'Reviewing CV',
    });
    expect(parsed.status).toBe('reviewing');
    expect(parsed.note).toBe('Reviewing CV');
  });
});
