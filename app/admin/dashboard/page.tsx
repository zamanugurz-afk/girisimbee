import { redirect } from 'next/navigation';
import { ADMIN_PANEL_BASE } from '@/features/admin/panel/constants/admin-nav.constants';

/** Legacy path — overview now lives at /admin */
export default function AdminDashboardRedirectPage() {
  redirect(ADMIN_PANEL_BASE);
}
