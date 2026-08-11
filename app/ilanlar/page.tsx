import { redirect } from 'next/navigation';

/** Reserved path — must not fall through to app/[token] (İkinciBazar shell). */
export default function IlanlarRedirectPage() {
  redirect('/kesfet');
}
