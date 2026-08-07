import { cookies } from 'next/headers';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import {
  createPhoneOtpChallenge,
  formatPhoneDisplay,
  normalizeTrPhone,
  PHONE_OTP_COOKIE,
  PHONE_OTP_COOKIE_MAX_AGE,
  shouldExposePhoneOtpDebugCode,
} from '@/features/account/lib/phone-otp';

export const POST = withAuth(async (ctx, request) => {
  const body = (await parseJsonBody(request)) as { phone?: unknown };
  const rawPhone =
    typeof body.phone === 'string' && body.phone.trim()
      ? body.phone
      : (await ctx.container.accountService.getProfile(ctx.userId))?.phone ?? '';

  const normalized = normalizeTrPhone(rawPhone);
  if (!normalized) {
    return apiError('Geçerli bir telefon numarası gerekli. Önce profilinizden telefon ekleyin.', 400, {
      code: 'INVALID_PHONE',
    });
  }

  const { code, token, expiresAt } = createPhoneOtpChallenge(normalized);
  cookies().set(PHONE_OTP_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: PHONE_OTP_COOKIE_MAX_AGE,
  });

  // Persist phone on account profile if missing / changed (unverified until OTP ok).
  const profile = await ctx.container.accountService.getProfile(ctx.userId);
  const displayPhone = formatPhoneDisplay(normalized);
  if (!profile?.phone || normalizeTrPhone(profile.phone) !== normalized) {
    await ctx.container.accountService.updateProfile(ctx.userId, {
      phone: displayPhone,
      phoneVerified: false,
    });
  }

  await ctx.container.accountService.logSecurity({
    userId: ctx.userId,
    action: 'phone_otp_sent',
    device: null,
    browser: null,
    ipAddress: null,
  }).catch(() => undefined);

  return ok({
    phone: displayPhone,
    expiresAt,
    channel: shouldExposePhoneOtpDebugCode() ? 'debug' : 'sms',
    message: shouldExposePhoneOtpDebugCode()
      ? 'Geliştirme ortamı: doğrulama kodu yanıtta döndü.'
      : 'Doğrulama kodu telefonunuza gönderildi.',
    ...(shouldExposePhoneOtpDebugCode() ? { debugCode: code } : {}),
  });
});
