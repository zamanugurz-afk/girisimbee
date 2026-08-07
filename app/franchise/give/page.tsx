import { redirect } from 'next/navigation';

/** Bayilik Al / Ver ayrımı kaldırıldı — tek franchise listesine yönlendir. */
export default function FranchiseGivePage() {
  redirect('/franchise/buy');
}
