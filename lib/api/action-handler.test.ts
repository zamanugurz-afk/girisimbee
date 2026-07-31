import { describe, it, expect } from 'vitest';
import { ZodError, z } from 'zod';
import { NotFoundError, ForbiddenError, ConflictError, InvalidTransitionError } from '@/lib/domain/errors';
import { handleActionError } from '@/lib/api/action-handler';
import { actionOk, actionFail } from '@/lib/api/action-result';

describe('action-handler', () => {
  it('maps ZodError to 400 with fieldErrors', () => {
    const schema = z.object({ name: z.string().min(1) });
    let err: unknown;
    try {
      schema.parse({});
    } catch (e) {
      err = e;
    }
    const result = handleActionError(err);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.fieldErrors).toBeDefined();
    }
  });

  it('maps domain errors to correct status codes', () => {
    const notFound = handleActionError(new NotFoundError('X', '1'));
    const forbidden = handleActionError(new ForbiddenError('denied'));
    const conflict = handleActionError(new ConflictError('dup'));
    const invalid = handleActionError(new InvalidTransitionError('a', 'b'));
    expect(notFound.success).toBe(false);
    expect(forbidden.success).toBe(false);
    expect(conflict.success).toBe(false);
    expect(invalid.success).toBe(false);
    if (!notFound.success) expect(notFound.status).toBe(404);
    if (!forbidden.success) expect(forbidden.status).toBe(403);
    if (!conflict.success) expect(conflict.status).toBe(409);
    if (!invalid.success) expect(invalid.status).toBe(422);
  });

  it('actionOk and actionFail helpers', () => {
    expect(actionOk({ id: 1 })).toEqual({ success: true, data: { id: 1 } });
    expect(actionFail('err', 401, { code: 'UNAUTHORIZED' })).toEqual({
      success: false,
      error: 'err',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
