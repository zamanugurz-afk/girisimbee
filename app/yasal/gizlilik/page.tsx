import { LegalDocumentView } from '@/features/legal/components/LegalDocumentView';
import { buildPrivacyDocument } from '@/features/legal/content/privacy.v1';

export const metadata = { title: 'Gizlilik Politikası — Girisimbee' };

export default function PrivacyPage() {
  return <LegalDocumentView body={buildPrivacyDocument()} />;
}
