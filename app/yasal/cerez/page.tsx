import { LegalDocumentView } from '@/features/legal/components/LegalDocumentView';
import { buildCookiePolicyDocument } from '@/features/legal/content/cookie-policy.v1';

export const metadata = { title: 'Çerez Politikası — Girisimbee' };

export default function CookiePolicyPage() {
  return <LegalDocumentView body={buildCookiePolicyDocument()} />;
}
