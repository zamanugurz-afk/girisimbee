import {
  formatSupabaseErrorMessages,
  isSupabaseError,
  type SupabaseErrorLike,
} from '@/lib/persistence/supabase-payload';

/** Dev-only structured logging for listing publish pipeline tracing. */
export function traceListingPublish(
  module: string,
  step: string,
  data: {
    input?: unknown;
    payload?: unknown;
    response?: unknown;
    error?: unknown;
  },
) {
  if (process.env.NODE_ENV === 'production') return;

  const entry = {
    module,
    step,
    ...(data.input !== undefined ? { input: data.input } : {}),
    ...(data.payload !== undefined ? { payload: data.payload } : {}),
    ...(data.response !== undefined ? { response: data.response } : {}),
    ...(data.error !== undefined
      ? { error: data.error instanceof Error ? data.error.message : data.error }
      : {}),
  };

  console.log(`[ListingPublish:${module}:${step}]`, JSON.stringify(entry, null, 2));
}

export interface PublishFailureTrace {
  module: string;
  step: string;
  exceptionName?: string;
  exceptionMessage?: string;
  stack?: string;
  sqlErrorCode?: string;
  supabase?: Pick<SupabaseErrorLike, 'message' | 'details' | 'hint' | 'code'>;
  formattedMessages?: string[];
  [key: string]: unknown;
}

/** Dev-only failure trace with exception + Supabase/Postgres details. */
export function tracePublishFailure(
  module: string,
  step: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === 'production') return;

  const trace: PublishFailureTrace = { module, step, ...extra };

  if (error instanceof Error) {
    trace.exceptionName = error.name;
    trace.exceptionMessage = error.message;
    trace.stack = error.stack;
  } else if (typeof error === 'string') {
    trace.exceptionMessage = error;
  }

  if (isSupabaseError(error)) {
    trace.sqlErrorCode = error.code;
    trace.supabase = {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    };
    trace.formattedMessages = formatSupabaseErrorMessages(error);
  }

  console.error(`[ListingPublish:${module}:${step}:FAILURE]`, JSON.stringify(trace, null, 2));
}

/** Publication fields on marketplace_listings (is_published/reviewed_at are derived or N/A). */
export interface PublicationStateSnapshot {
  status: string | null;
  is_published: boolean;
  published_at: string | null;
  reviewed_at: string | null;
  deleted_at: string | null;
}

export function snapshotPublicationState(row: Record<string, unknown>): PublicationStateSnapshot {
  const status = (row.status as string | null | undefined) ?? null;
  return {
    status,
    is_published: status === 'published',
    published_at: (row.published_at as string | null | undefined) ?? null,
    reviewed_at: (row.reviewed_at as string | null | undefined) ?? null,
    deleted_at: (row.deleted_at as string | null | undefined) ?? null,
  };
}

export function logPublicationState(
  module: string,
  phase: 'before_insert' | 'after_insert' | 'browse_query',
  row: Record<string, unknown>,
  extra?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === 'production') return;

  console.log(
    `[PublicationState:${module}:${phase}]`,
    JSON.stringify({ ...snapshotPublicationState(row), ...extra }, null, 2),
  );
}
