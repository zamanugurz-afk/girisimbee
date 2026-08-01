import { ZodError, type ZodIssue } from 'zod';

function issueDetails(issue: ZodIssue) {
  const field = issue.path.length > 0 ? issue.path.join('.') : '(root)';
  const details: Record<string, unknown> = {
    field,
    code: issue.code,
    message: issue.message,
  };

  if ('expected' in issue && issue.expected !== undefined) {
    details.expected = issue.expected;
  }
  if ('received' in issue && issue.received !== undefined) {
    details.received = issue.received;
  }
  if ('validation' in issue && issue.validation !== undefined) {
    details.constraint = issue.validation;
  }

  return details;
}

/** Dev-only structured logging for Zod validation failures. */
export function traceValidationFailure(
  context: string,
  error: ZodError,
  extra?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === 'production') return;

  const entry = {
    context,
    issueCount: error.issues.length,
    issues: error.issues.map(issueDetails),
    stack: error.stack,
    ...extra,
  };

  console.log(`[ValidationTrace:${context}]`, JSON.stringify(entry, null, 2));
}
