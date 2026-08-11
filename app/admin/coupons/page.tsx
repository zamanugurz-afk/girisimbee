import { redirect } from 'next/navigation';

export const metadata = { title: 'Kuponlar — Yönetim' };

/** Coupons are managed inside the live packages view. */
export default function AdminCouponsPage() {
  redirect('/admin/packages');
}
