import { redirect } from 'next/navigation';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';

/** Legacy / typo path → canonical KVKK clarification page. */
export default function KvkkLegacyRedirectPage() {
  redirect(LEGAL_ROUTES.kvkk);
}
