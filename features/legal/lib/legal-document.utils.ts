import { getResolvedLegalCompany } from '@/features/legal/config/legal-company.config';
import type { LegalDocumentMeta } from '@/features/legal/config/legal-documents.config';

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalDocumentBody = {
  meta: LegalDocumentMeta;
  intro?: string;
  sections: LegalSection[];
};

/** Replace {{field}} tokens with resolved company values. */
export function interpolateLegalText(template: string): string {
  const company = getResolvedLegalCompany();
  return template
    .replaceAll('{{legalName}}', company.legalName)
    .replaceAll('{{tradeName}}', company.tradeName)
    .replaceAll('{{taxNumber}}', company.taxNumber)
    .replaceAll('{{mersisNumber}}', company.mersisNumber)
    .replaceAll('{{address}}', company.address)
    .replaceAll('{{phone}}', company.phone)
    .replaceAll('{{email}}', company.email)
    .replaceAll('{{kvkkEmail}}', company.kvkkEmail)
    .replaceAll('{{kvkkApplicationAddress}}', company.kvkkApplicationAddress)
    .replaceAll('{{kepAddress}}', company.kepAddress);
}

export function materializeDocument(body: LegalDocumentBody): LegalDocumentBody {
  return {
    meta: body.meta,
    intro: body.intro ? interpolateLegalText(body.intro) : undefined,
    sections: body.sections.map((section) => ({
      ...section,
      title: interpolateLegalText(section.title),
      paragraphs: section.paragraphs.map(interpolateLegalText),
    })),
  };
}
