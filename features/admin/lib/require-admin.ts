import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

/** Server-side guard — only role=admin may access admin routes. */
export async function requireAdminSession(): Promise<void> {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);
  if (user.role !== 'admin') redirect(AUTH_ROUTES.dashboard);
}
