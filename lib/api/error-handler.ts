import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
  InvalidTransitionError,
} from '@/lib/domain/errors';
import { apiError } from '@/lib/api/response';

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return apiError('Doğrulama hatası.', 400, {
      code: 'VALIDATION_ERROR',
      fieldErrors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof ValidationError) {
    return apiError(err.message, 400, {
      code: err.code,
      fieldErrors: err.fieldErrors,
    });
  }

  if (err instanceof NotFoundError) {
    return apiError(err.message, 404, { code: err.code });
  }

  if (err instanceof ForbiddenError) {
    return apiError(err.message, 403, { code: err.code });
  }

  if (err instanceof ConflictError) {
    return apiError(err.message, 409, { code: err.code });
  }

  if (err instanceof InvalidTransitionError) {
    return apiError(err.message, 422, { code: err.code });
  }

  if (err instanceof DomainError) {
    return apiError(err.message, err.statusCode, { code: err.code });
  }

  const message = err instanceof Error ? err.message : 'Sunucu hatası.';
  return apiError(message, 500, { code: 'INTERNAL_ERROR' });
}
