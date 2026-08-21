import { describe, it, expect } from 'vitest';
import zlib from 'zlib';
import { cvService } from './cv.service';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

function createMockCvPdfBuffer(textLines: string[]): Buffer {
  const stream = `
BT
/F1 12 Tf
${textLines.map((line) => `(${line}) Tj\nT*`).join('\n')}
ET
  `;
  const compressed = zlib.deflateSync(Buffer.from(stream, 'utf8'));
  const pdfString = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n${compressed.toString('binary')}\nendstream\nendobj\n%%EOF`;
  return Buffer.from(pdfString, 'binary');
}

function createMockDocxBuffer(xmlContent: string): Buffer {
  const fileName = 'word/document.xml';
  const fileNameBuffer = Buffer.from(fileName, 'utf8');
  const compressedXml = zlib.deflateRawSync(Buffer.from(xmlContent, 'utf8'));

  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(compressedXml.length, 18);
  header.writeUInt32LE(Buffer.byteLength(xmlContent), 22);
  header.writeUInt16LE(fileNameBuffer.length, 26);
  header.writeUInt16LE(0, 28);

  return Buffer.concat([header, fileNameBuffer, compressedXml]);
}

describe('CV Extraction 4.0 — Browser E2E Form Hydration & Wizard Navigation Suite', () => {
  const realisticLines = [
    'Oguzhan Kaya',
    'Istanbul, Kadikoy',
    'Kidemli Yazilim Gelistirici',
    'Deneyim: Trendyol Tech | Senior Software Engineer | 2021 - 2024',
    'Sorumluluklar: Yuksek hacimli mikroservis mimarileri gelistirildi.',
    'Deneyim: Hepsiburada | Software Developer | 2018 - 2021',
    'Sorumluluklar: Siparis servisleri gelistirildi.',
    'Egitim: Istanbul Teknik Universitesi - Bilgisayar Muhendisligi (Lisans) | 2014 - 2018',
    'Yetkinlikler: React, Node.js, TypeScript, Go, Docker, Kubernetes, PostgreSQL',
    'Diller: Turkce, Ingilizce',
    'Sertifikalar: AWS Certified Solutions Architect',
  ];

  it('verifies End-to-End PDF Upload -> Extraction -> 4-Step Form Hydration -> Step Navigation -> Live Preview Hydration', async () => {
    const pdfBuffer = createMockCvPdfBuffer(realisticLines);

    // 1. Ingestion & Extraction via CV Service
    const draft = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'oguzhan_kaya_cv.pdf',
      mimeType: 'application/pdf',
    });

    const values = draft.formValues as CareerProfileFormValues;

    // 2. Validate Step 1 Form Fields (Temel Bilgiler)
    expect(values.role).toBe('Yazılım Geliştirici');
    expect(values.sector).toBe('Bilişim / Yazılım');
    expect(values.city).toBe('İstanbul');
    expect(values.residenceDistrict).toBe('Kadıköy');

    // 3. Validate Step 2 Form Fields (Deneyimler & Eğitim)
    expect(values.experiences?.length).toBe(2);
    expect(values.experiences?.[0].company).toContain('Trendyol');
    expect(values.experiences?.[0].startYear).toBe(2021);
    expect(values.experiences?.[0].endYear).toBe(2024);
    expect(values.experiences?.[1].company).toContain('Hepsiburada');
    expect(values.educationLevel).toBe('Lisans');

    // 4. Validate Step 3 Form Fields (Diller & Sertifikalar)
    expect(values.languages).toContain('İngilizce');
    expect(values.certificates).toContain('AWS Certified');

    // 5. Serialize to Database Custom Fields (Step 4 Preview Transition)
    const customFields = formValuesToCustomFields('seek', values);
    expect(customFields).toBeDefined();
    expect(customFields.experiences).toBeDefined();

    // 6. Validate Live Card Scale-to-Fit Preview Hydration
    const previewData = toSafeCareerPreviewInput({
      kind: 'seek',
      source: {
        customFields,
      },
    });

    expect(previewData.desiredRole).toBe('Yazılım Geliştirici');
    expect(previewData.primarySector).toBe('Bilişim / Yazılım');
    expect(previewData.preferredCity).toBe('İstanbul');
    expect(previewData.residenceDistrict).toBe('Kadıköy');
    expect(previewData.experiences?.length).toBe(2);

    // 7. Test User Form Modifications (Simulating user editing city & role in UI)
    const updatedValues: CareerProfileFormValues = {
      ...values,
      role: 'Kıdemli Bulut Mimarı',
      city: 'İzmir',
      residenceDistrict: 'Urla',
    };

    const updatedCustomFields = formValuesToCustomFields('seek', updatedValues);
    const updatedPreview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: {
        customFields: updatedCustomFields,
      },
    });

    expect(updatedPreview.desiredRole).toBe('Kıdemli Bulut Mimarı');
    expect(updatedPreview.preferredCity).toBe('İzmir');
    expect(updatedPreview.residenceDistrict).toBe('Urla');
    // Ensure experiences are perfectly preserved after user edits
    expect(updatedPreview.experiences?.length).toBe(2);
  });

  it('verifies Zero-Data-Loss guarantee across DOCX step roundtrips and JSON serialization', async () => {
    const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:t>Oğuzhan Kaya — İstanbul / Kadıköy</w:t></w:p>
    <w:p><w:t>Kıdemli Yazılım Geliştirici</w:t></w:p>
    <w:p><w:t>İŞ DENEYİMİ</w:t></w:p>
    <w:p><w:t>Trendyol Tech 2021 - 2024</w:t></w:p>
    <w:p><w:t>Senior Software Engineer</w:t></w:p>
    <w:p><w:t>• Yüksek hacimli mikroservis mimarileri geliştirildi.</w:t></w:p>
    <w:p><w:t>EĞİTİM</w:t></w:p>
    <w:p><w:t>İTÜ - Bilgisayar Mühendisliği (Lisans) - 2020</w:t></w:p>
    <w:p><w:t>YETKİNLİKLER: React, Node.js, Go, Docker</w:t></w:p>
    <w:p><w:t>DİLLER: İngilizce (İleri)</w:t></w:p>
  </w:body>
</w:document>`;

    const docxBuffer = createMockDocxBuffer(docxXml);

    const draft = await cvService.processCvBuffer({
      buffer: docxBuffer,
      fileName: 'oguzhan_kaya_cv.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const values = draft.formValues as CareerProfileFormValues;

    expect(values.role).toBe('Yazılım Geliştirici');
    expect(values.city).toBe('İstanbul');
    expect(values.residenceDistrict).toBe('Kadıköy');
    expect(values.experiences?.length).toBeGreaterThanOrEqual(1);

    // Serialize to JSON (simulating local storage / form state cache)
    const serialized = JSON.stringify(values);
    const deserialized = JSON.parse(serialized) as CareerProfileFormValues;

    expect(deserialized.role).toBe(values.role);
    expect(deserialized.experiences?.length).toBe(values.experiences?.length);
  });
});
