import { redirect } from 'next/navigation';

/** Legacy /hire → canonical İş İlanları browse. */
export default function HirePage() {
  redirect('/is');
}
