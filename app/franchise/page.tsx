import { redirect } from 'next/navigation';

/** Canonical franchise browse is /franchise/buy — keep /franchise as a stable alias. */
export default function FranchiseIndexPage() {
  redirect('/franchise/buy');
}
