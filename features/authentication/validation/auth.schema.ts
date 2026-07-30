import { z } from 'zod';
import { emailSchema } from '@/lib/domain/validation';

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Ad en az 2 karakter olmalı.').max(100).optional(),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı.')
    .max(128, 'Şifre en fazla 128 karakter olabilir.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor.',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const newPasswordSchema = z.object({
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor.',
  path: ['confirmPassword'],
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type NewPasswordSchema = z.infer<typeof newPasswordSchema>;
