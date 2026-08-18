import { describe, expect, it } from 'vitest';
import zlib from 'zlib';
import { extractCvText, extractTextFromDocx } from '@/features/candidates/cv/cv-text-extractor';

/**
 * Creates a mock in-memory DOCX ZIP archive containing word/document.xml.
 */
function createMockDocxBuffer(xmlContent: string): Buffer {
  const fileName = 'word/document.xml';
  const fileNameBuffer = Buffer.from(fileName, 'utf8');
  const compressedXml = zlib.deflateRawSync(Buffer.from(xmlContent, 'utf8'));

  // Local file header (30 bytes + filename + data)
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0); // Local header signature
  header.writeUInt16LE(20, 4); // Version needed
  header.writeUInt16LE(0, 6); // Flags
  header.writeUInt16LE(8, 8); // Compression method (8 = Deflate)
  header.writeUInt16LE(0, 10); // Time
  header.writeUInt16LE(0, 12); // Date
  header.writeUInt32LE(0, 14); // CRC32 (dummy)
  header.writeUInt32LE(compressedXml.length, 18); // Compressed size
  header.writeUInt32LE(Buffer.byteLength(xmlContent), 22); // Uncompressed size
  header.writeUInt16LE(fileNameBuffer.length, 26); // File name length
  header.writeUInt16LE(0, 28); // Extra field length

  return Buffer.concat([header, fileNameBuffer, compressedXml]);
}

describe('DOCX QA Suite', () => {
  it('extracts paragraphs, headings, tables, bullets, Turkish characters, and dates from DOCX XML', async () => {
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:t>Zeynep Kaya — Kıdemli Pazarlama Müdürü</w:t>
    </w:p>
    <w:p>
      <w:t>İstanbul, Türkiye | 2018 - 2024</w:t>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:t>Şirket</w:t></w:p></w:tc>
        <w:tc><w:p><w:t>Pozisyon</w:t></w:p></w:tc>
        <w:tc><w:p><w:t>Süre</w:t></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:t>ABC Holding</w:t></w:p></w:tc>
        <w:tc><w:p><w:t>Pazarlama Yöneticisi</w:t></w:p></w:tc>
        <w:tc><w:p><w:t>2020 - Günümüz</w:t></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p>
      <w:t>• Bütçe ve dijital reklam stratejilerinin yönetimi</w:t>
    </w:p>
    <w:p>
      <w:t>• Google Ads, Meta Business Suite, SEO optimizasyonu</w:t>
    </w:p>
    <w:p>
      <w:t>Eğitim: Boğaziçi Üniversitesi İşletme (Lisans)</w:t>
    </w:p>
  </w:body>
</w:document>`;

    const docxBuffer = createMockDocxBuffer(documentXml);
    const result = await extractCvText(docxBuffer, 'zeynep_kaya_cv.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    expect(result.format).toBe('docx');
    expect(result.text).toContain('Zeynep Kaya — Kıdemli Pazarlama Müdürü');
    expect(result.text).toContain('İstanbul, Türkiye');
    expect(result.text).toContain('ABC Holding');
    expect(result.text).toContain('Pazarlama Yöneticisi');
    expect(result.text).toContain('Google Ads');
    expect(result.text).toContain('Boğaziçi Üniversitesi');
  });
});
