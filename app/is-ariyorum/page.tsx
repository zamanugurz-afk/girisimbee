import { redirect } from 'next/navigation';

/** Legacy seeker browse → unified İş İlanları feed. */
export default function IsAriyorumPage() {
  redirect('/is');
}
