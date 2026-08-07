import { AdminPackagesLiveView } from '@/features/admin/panel/views/AdminPackagesLiveView';

export const metadata = { title: 'Kuponlar — Yönetim' };

/** Coupons are managed inside the live packages view. */
export default function AdminCouponsPage() {
  return <AdminPackagesLiveView />;
}
