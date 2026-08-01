import { ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
  InvalidTransitionError,
} from '@/lib/domain/errors';
import type { AuthContext } from '@/lib/api/with-auth';
import { resolveProfileForUser } from '@/lib/api/resolve-profile';
import { actionOk, actionFail, type ActionResult } from '@/lib/api/action-result';
import { traceValidationFailure } from '@/lib/debug/validation-trace';
import { tracePublishFailure } from '@/lib/debug/listing-publish-trace';
import {
  formatSupabaseErrorMessages,
  isSupabaseError,
  logSupabaseError,
} from '@/lib/persistence/supabase-payload';

export async function resolveActionContext(): Promise<ActionResult<AuthContext>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionFail('Oturum açmanız gerekiyor.', 401, { code: 'UNAUTHORIZED' });
  }

  const container = getServerContainer(supabase);
  const profile = await resolveProfileForUser(user, container);

  return actionOk({
    user,
    userId: ids.user(user.id),
    profileId: profile.id,
    profile,
    container,
  });
}

export async function runAuthenticatedAction<T>(
  fn: (ctx: AuthContext) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const ctxResult = await resolveActionContext();
    if (!ctxResult.success) return ctxResult;
    const data = await fn(ctxResult.data);
    return actionOk(data);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function runOptionalAuthAction<T>(
  fn: (ctx: AuthContext | null) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let ctx: AuthContext | null = null;
    if (user) {
      const container = getServerContainer(supabase);
      const profile = await container.profileRepository.findByUserId(ids.user(user.id));
      if (profile) {
        ctx = {
          user,
          userId: ids.user(user.id),
          profileId: profile.id,
          profile,
          container,
        };
      }
    }

    const data = await fn(ctx);
    return actionOk(data);
  } catch (err) {
    return handleActionError(err);
  }
}

export function handleActionError(err: unknown): ActionResult<never> {
  if (err instanceof ZodError) {
    traceValidationFailure('action', err);
    return actionFail('Doğrulama hatası.', 400, {
      code: 'VALIDATION_ERROR',
      fieldErrors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof ValidationError) {
    return actionFail(err.message, 400, { code: err.code, fieldErrors: err.fieldErrors });
  }

  if (err instanceof NotFoundError) {
    return actionFail(err.message, 404, { code: err.code });
  }

  if (err instanceof ForbiddenError) {
    return actionFail(err.message, 403, { code: err.code });
  }

  if (err instanceof ConflictError) {
    return actionFail(err.message, 409, { code: err.code });
  }

  if (err instanceof InvalidTransitionError) {
    return actionFail(err.message, 422, { code: err.code });
  }

  if (err instanceof DomainError) {
    return actionFail(err.message, err.statusCode, { code: err.code });
  }

  if (isSupabaseError(err)) {
    tracePublishFailure('action', 'handleActionError', err);
    logSupabaseError(err, 'handleActionError');
    const [message] = formatSupabaseErrorMessages(err);
    return actionFail(message, 500, { code: err.code ?? 'INTERNAL_ERROR' });
  }

  if (err instanceof Error) {
    tracePublishFailure('action', 'handleActionError', err);
    return actionFail(err.message, 500, { code: 'INTERNAL_ERROR' });
  }

  tracePublishFailure('action', 'handleActionError', err);
  return actionFail('Sunucu hatası.', 500, { code: 'INTERNAL_ERROR' });
}
