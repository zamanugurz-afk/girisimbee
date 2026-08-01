/** Extract client IP / User-Agent for audit trails. */
export function getRequestClientMeta(request: Request): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ipAddress =
    forwarded?.split(',')[0]?.trim() ||
    realIp?.trim() ||
    null;

  return {
    ipAddress,
    userAgent: request.headers.get('user-agent'),
  };
}
