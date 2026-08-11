import { LegalDocumentView } from '@/features/legal/components/LegalDocumentView';
import { buildContactCommunicationDocument } from '@/features/legal/content/contact-communication.v1';

export const metadata = { title: 'İletişim ve Mesajlaşma Kullanım Koşulları — Girisimbee' };

export default function ContactCommunicationPage() {
  return <LegalDocumentView body={buildContactCommunicationDocument()} />;
}
