import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
  InvalidTransitionError,
  RateLimitError,
} from '@/lib/domain/errors';
import { apiError } from '@/lib/api/response';
import { traceValidationFailure } from '@/lib/debug/validation-trace';
import { tracePublishFailure } from '@/lib/debug/listing-publish-trace';
import {
  formatSupabaseErrorMessages,
  isSupabaseError,
  logSupabaseError,
} from '@/lib/persistence/supabase-payload';

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    traceValidationFailure('api', err);
    const fieldErrors = err.flatten().fieldErrors;
    const firstEntry = Object.entries(fieldErrors).find(
      ([key, messages]) => key !== '_errors' && Array.isArray(messages) && messages.length > 0,
    );
    const detail = firstEntry?.[1]?.[0];
    return apiError(detail ?? 'Doğrulama hatası.', 400, {
      code: 'VALIDATION_ERROR',
      fieldErrors,
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

  if (err instanceof RateLimitError) {
    const res = apiError(err.message, 429, { code: err.code });
    if (err.retryAfterSec) {
      res.headers.set('Retry-After', String(err.retryAfterSec));
    }
    return res;
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

  if (isSupabaseError(err)) {
    tracePublishFailure('api', 'handleApiError', err);
    logSupabaseError(err, 'handleApiError');
    const [message] = formatSupabaseErrorMessages(err);
    return apiError(message, 500, { code: err.code ?? 'INTERNAL_ERROR' });
  }

  if (err instanceof Error) {
    tracePublishFailure('api', 'handleApiError', err);
    return apiError(err.message, 500, { code: 'INTERNAL_ERROR' });
  }

  tracePublishFailure('api', 'handleApiError', err);
  return apiError('Sunucu hatası.', 500, { code: 'INTERNAL_ERROR' });
}
