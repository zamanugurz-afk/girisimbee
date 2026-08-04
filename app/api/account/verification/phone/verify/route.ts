import { cookies } from 'next/headers';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import {
  formatPhoneDisplay,
  PHONE_OTP_COOKIE,
  PHONE_OTP_COOKIE_MAX_AGE,
  serializePhoneOtpChallenge,
  verifyPhoneOtpCode,
} from '@/features/account/lib/phone-otp';

export const POST = withAuth(async (ctx, request) => {
  const body = (await parseJsonBody(request)) as { code?: unknown };
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!/^\d{6}$/.test(code)) {
    return apiError('6 haneli doğrulama kodunu girin.', 400, { code: 'INVALID_CODE' });
  }

  const cookieStore = cookies();
  const token = cookieStore.get(PHONE_OTP_COOKIE)?.value;
  const result = verifyPhoneOtpCode(token, code);

  if (!result.ok) {
    if (result.challenge) {
      cookieStore.set(PHONE_OTP_COOKIE, serializePhoneOtpChallenge(result.challenge), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: PHONE_OTP_COOKIE_MAX_AGE,
      });
    }
    return apiError(result.error, 400, { code: 'OTP_FAILED' });
  }

  const displayPhone = formatPhoneDisplay(result.phone);
  const updated = await ctx.container.accountService.updateProfile(ctx.userId, {
    phone: displayPhone,
    phoneVerified: true,
  });

  cookieStore.set(PHONE_OTP_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  await ctx.container.accountService.logSecurity({
    userId: ctx.userId,
    action: 'phone_verified',
    device: null,
    browser: null,
    ipAddress: null,
  }).catch(() => undefined);

  return ok({
    phone: updated.phone,
    phoneVerified: updated.phoneVerified,
  });
});
