import { redirect } from 'next/navigation';

/** Keep old dashboard URL working — canonical page is /mesajlarim. */
export default function DashboardMesajlarimRedirect() {
  redirect('/mesajlarim');
}
