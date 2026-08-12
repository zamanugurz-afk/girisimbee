import { redirect } from 'next/navigation';

/** Legacy /jobs → İş İlanları hub (İşe Alıyorum / İş Arıyorum). */
export default function JobsPage() {
  redirect('/is');
}
