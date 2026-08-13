/**
 * Domain errors — typed failures for service layer.
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super(id ? `${entity} not found: ${id}` : `${entity} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string[]>,
  ) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends DomainError {
  constructor(message = 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.', retryAfterSec?: number) {
    super(message, 'RATE_LIMITED', 429);
    this.name = 'RateLimitError';
    this.retryAfterSec = retryAfterSec;
  }

  readonly retryAfterSec?: number;
}

export class InvalidTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Invalid status transition: ${from} → ${to}`, 'INVALID_TRANSITION', 400);
    this.name = 'InvalidTransitionError';
  }
}
