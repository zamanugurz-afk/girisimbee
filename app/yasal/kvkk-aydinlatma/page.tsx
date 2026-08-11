import { LegalDocumentView } from '@/features/legal/components/LegalDocumentView';
import { buildKvkkClarificationDocument } from '@/features/legal/content/kvkk-clarification.v1';

export const metadata = { title: 'KVKK Aydınlatma Metni — Girisimbee' };

export default function KvkkClarificationPage() {
  return <LegalDocumentView body={buildKvkkClarificationDocument()} />;
}
