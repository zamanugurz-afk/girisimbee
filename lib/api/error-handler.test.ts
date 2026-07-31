import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
  InvalidTransitionError,
} from '@/lib/domain/errors';
import { handleApiError } from '@/lib/api/error-handler';

describe('handleApiError', () => {
  it('maps NotFoundError to 404', () => {
    const res = handleApiError(new NotFoundError('Listing', 'abc'));
    expect(res.status).toBe(404);
  });

  it('maps ForbiddenError to 403', () => {
    const res = handleApiError(new ForbiddenError());
    expect(res.status).toBe(403);
  });

  it('maps ValidationError to 400', () => {
    const res = handleApiError(new ValidationError('Bad input', { field: ['required'] }));
    expect(res.status).toBe(400);
  });

  it('maps ConflictError to 409', () => {
    const res = handleApiError(new ConflictError('Duplicate'));
    expect(res.status).toBe(409);
  });

  it('maps InvalidTransitionError to 422', () => {
    const res = handleApiError(new InvalidTransitionError('submitted', 'hired'));
    expect(res.status).toBe(422);
  });

  it('maps ZodError to 400 with fieldErrors', async () => {
    const res = handleApiError(new ZodError([]));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('maps generic DomainError to its statusCode', () => {
    const res = handleApiError(new DomainError('Custom', 'CUSTOM', 418));
    expect(res.status).toBe(418);
  });

  it('maps unknown errors to 500', () => {
    const res = handleApiError(new Error('boom'));
    expect(res.status).toBe(500);
  });
});
