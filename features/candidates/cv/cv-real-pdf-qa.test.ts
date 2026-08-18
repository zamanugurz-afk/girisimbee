import { describe, expect, it } from 'vitest';
import zlib from 'zlib';
import {
  extractCvText,
  extractTextFromPdf,
  CvExtractionError,
  MAX_CV_FILE_SIZE_BYTES,
} from '@/features/candidates/cv/cv-text-extractor';

/**
 * Generates a mock binary PDF buffer containing specified text streams.
 */
function createMockPdfBuffer(textStreams: string[]): Buffer {
  let pdfString = '%PDF-1.4\n';

  textStreams.forEach((streamContent, idx) => {
    const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf8'));
    pdfString += `
${idx + 1} 0 obj
<< /Length ${compressed.length} /Filter /FlateDecode >>
stream
${compressed.toString('binary')}
endstream
endobj
`;
  });

  pdfString += '%%EOF';
  return Buffer.from(pdfString, 'binary');
}

describe('Real PDF QA Suite', () => {
  it('extracts single-column classic CV text with Turkish characters', async () => {
    const stream = `
BT
/F1 12 Tf
(Ahmet Caliskan - Yazilim Gelistirici) Tj
T*
(Istanbul, Turkiye) Tj
T*
(Deneyim: 2019-2024 yillari arasinda Full Stack Developer olarak calisti.) Tj
T*
(Yetenekler: TypeScript, React, Node.js, PostgreSQL, Docker) Tj
ET
    `;
    const buffer = createMockPdfBuffer([stream]);
    const res = await extractCvText(buffer, 'ahmet_cv.pdf', 'application/pdf');

    expect(res.format).toBe('pdf');
    expect(res.text).toContain('Ahmet Caliskan');
    expect(res.text).toContain('Yazilim Gelistirici');
    expect(res.text).toContain('TypeScript');
    expect(res.charCount).toBeGreaterThan(50);
  });

  it('extracts two-column and table-like CV structures with TJ kerning arrays', async () => {
    const stream = `
BT
/F1 14 Tf
[(Kariyer ) 10 (Gecmisi)] TJ
T*
[(Sirket A ) 20 (Satis Uzmani ) 15 (2020-2023)] TJ
T*
[(Sirket B ) 20 (Kurumsal Satis ) 15 (2023-2025)] TJ
ET
    `;
    const buffer = createMockPdfBuffer([stream]);
    const res = await extractCvText(buffer, 'two_column_cv.pdf', 'application/pdf');

    expect(res.text).toContain('Kariyer Gecmisi');
    expect(res.text).toContain('Satis Uzmani');
    expect(res.text).toContain('Kurumsal Satis');
  });

  it('handles multi-page long CVs across multiple PDF stream objects', async () => {
    const page1 = `
BT
(Sayfa 1: Mehmet Demir - Proje Yoneticisi) Tj
T*
(10 yillik cevik proje yonetimi ve PMP sertifikali lider.) Tj
ET
    `;
    const page2 = `
BT
(Sayfa 2: Egitim ve Sertifikalar) Tj
T*
(ODTU Endustri Muhendisligi, PMP, Scrum Master) Tj
ET
    `;
    const buffer = createMockPdfBuffer([page1, page2]);
    const res = await extractCvText(buffer, 'long_cv.pdf', 'application/pdf');

    expect(res.text).toContain('Mehmet Demir');
    expect(res.text).toContain('Proje Yoneticisi');
    expect(res.text).toContain('Sayfa 2');
    expect(res.text).toContain('ODTU Endustri');
  });

  it('rejects files exceeding the 5 MB limit gracefully', async () => {
    const oversizedBuffer = Buffer.alloc(MAX_CV_FILE_SIZE_BYTES + 1024, 'A');

    await expect(
      extractCvText(oversizedBuffer, 'huge_file.pdf', 'application/pdf'),
    ).rejects.toThrow(CvExtractionError);

    await expect(
      extractCvText(oversizedBuffer, 'huge_file.pdf', 'application/pdf'),
    ).rejects.toThrow('5 MB');
  });

  it('rejects corrupt or empty PDF files with a friendly manual guidance message', async () => {
    const corruptBuffer = Buffer.from('NOT A REAL PDF FILE HEADER', 'utf8');

    await expect(
      extractCvText(corruptBuffer, 'corrupt.pdf', 'application/pdf'),
    ).rejects.toThrow("CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın.");

    const emptyBuffer = Buffer.alloc(0);
    await expect(
      extractCvText(emptyBuffer, 'empty.pdf', 'application/pdf'),
    ).rejects.toThrow('boş veya okunamıyor');
  });
});
