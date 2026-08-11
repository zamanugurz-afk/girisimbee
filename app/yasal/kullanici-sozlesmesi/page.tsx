import { LegalDocumentView } from '@/features/legal/components/LegalDocumentView';
import { buildUserTermsDocument } from '@/features/legal/content/user-terms.v1';

export const metadata = { title: 'Kullanıcı Sözleşmesi — Girisimbee' };

export default function TermsPage() {
  return <LegalDocumentView body={buildUserTermsDocument()} />;
}
