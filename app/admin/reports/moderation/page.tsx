import { redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/features/admin/panel/constants/admin-nav.constants';

/** Legacy path — moderation moved to /admin/moderation */
export default function AdminReportsModerationRedirectPage() {
  redirect(ADMIN_ROUTES.moderation);
}
