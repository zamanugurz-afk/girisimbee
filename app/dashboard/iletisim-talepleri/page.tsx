import { redirect } from 'next/navigation';

/** Keep old dashboard URL working — canonical page is /iletisim-talepleri. */
export default function DashboardIletisimTalepleriRedirect() {
  redirect('/iletisim-talepleri');
}
