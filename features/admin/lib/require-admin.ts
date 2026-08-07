import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { isAdmin } from '@/features/authorization/rbac.service';

/** Server-side guard — `admin` and `super_admin` may access admin routes.
 * `super_admin` inherits all `admin` capabilities via `isAdmin()`.
 */
export async function requireAdminSession(): Promise<void> {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);
  if (!isAdmin(user.role)) redirect(AUTH_ROUTES.dashboard);
}
