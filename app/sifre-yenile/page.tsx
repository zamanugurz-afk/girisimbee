import { redirect } from 'next/navigation';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

/** Legacy path — password reset now lives at /sifre-sifirla */
export default function LegacyResetPasswordRedirect() {
  redirect(AUTH_ROUTES.resetPassword);
}
