import { z } from 'zod';
import { emailSchema } from '@/lib/domain/validation';
import { PHONE_REGEX, SLUG_REGEX } from '@/lib/domain/base';

const requiredConsent = (message: string) =>
  z.boolean().refine((value) => value === true, { message });

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'Ad en az 2 karakter olmalı.')
      .max(50, 'Ad en fazla 50 karakter olabilir.'),
    lastName: z
      .string()
      .trim()
      .min(2, 'Soyad en az 2 karakter olmalı.')
      .max(50, 'Soyad en fazla 50 karakter olabilir.'),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, 'Kullanıcı adı en az 3 karakter olmalı.')
      .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir.')
      .regex(SLUG_REGEX, 'Kullanıcı adı yalnızca küçük harf, rakam ve tire içerebilir.'),
    phone: z
      .string()
      .trim()
      .regex(PHONE_REGEX, 'Geçerli bir telefon numarası girin. (örn. 05xxxxxxxxx)'),
    email: emailSchema.transform((value) => value.trim().toLowerCase()),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalı.')
      .max(128, 'Şifre en fazla 128 karakter olabilir.'),
    confirmPassword: z.string(),
    acceptTerms: requiredConsent('Kullanıcı sözleşmesini kabul etmelisiniz.'),
    acceptKvkk: requiredConsent('KVKK aydınlatma metnini okuduğunuzu onaylayın (bilgilendirme).'),
    acceptPrivacy: requiredConsent('Gizlilik politikasını kabul etmelisiniz.'),
    acceptCookies: requiredConsent('Çerez politikasını okuduğunuzu onaylayın.'),
    consentCommercial: z.boolean(),
    consentSms: z.boolean(),
    consentEmail: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Şifre en az 8 karakter olmalı.').max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor.',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type NewPasswordSchema = z.infer<typeof newPasswordSchema>;
