import { redirect } from 'next/navigation';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';

/** Broken relative /kvkk links → canonical page. */
export default function KvkkRootRedirectPage() {
  redirect(LEGAL_ROUTES.kvkk);
}
