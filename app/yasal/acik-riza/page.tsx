import { LegalDocumentView } from '@/features/legal/components/LegalDocumentView';
import { buildExplicitConsentHubDocument } from '@/features/legal/content/explicit-consents.v1';

export const metadata = { title: 'Açık Rıza Metinleri — Girisimbee' };

export default function ExplicitConsentPage() {
  return <LegalDocumentView body={buildExplicitConsentHubDocument()} />;
}
