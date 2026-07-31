import { describe, it, expect } from 'vitest';
import { candidateCvRegisterSchema } from '@/lib/api/validation/candidate-cv';

describe('candidate cv validation', () => {
  it('accepts valid CV register payload', () => {
    const parsed = candidateCvRegisterSchema.parse({
      name: 'CV 2026.pdf',
      storagePath: 'cvs/user/cv.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 102400,
      visibility: 'private',
    });
    expect(parsed.name).toBe('CV 2026.pdf');
  });
});
