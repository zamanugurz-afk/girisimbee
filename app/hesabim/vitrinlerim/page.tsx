import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Vitrinlerim — Hesabım — Girisimbee',
};

/** Legacy alias — canonical packages UI lives under the user dashboard. */
export default function HesabimVitrinlerimPage() {
  redirect('/dashboard/paketlerim');
}
