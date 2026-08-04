import { redirect } from 'next/navigation';

/** Legacy /jobs (İş Bul) → /hire (İş İlanları). */
export default function JobsPage() {
  redirect('/hire');
}
