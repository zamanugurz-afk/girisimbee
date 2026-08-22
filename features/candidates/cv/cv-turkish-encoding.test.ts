import { describe, expect, it } from 'vitest';
import zlib from 'zlib';
import {
  repairTurkishEncodingAndMojibake,
  decodeCp1254OrUtf8,
  decodeCp1254Byte,
} from './cv-turkish-encoding';
import {
  extractCvText,
  extractTextFromPdf,
  extractTextFromDocx,
} from './cv-text-extractor';

describe('Turkish Character Encoding & Mojibake Repair Engine', () => {
  it('correctly repairs double-encoded UTF-8 mojibake strings', () => {
    const corrupted =
      'YÃ¶netim ve MÃ¼ÅŸteri Ä°liÅŸkileri DirektÃ¶rÃ¼ | Ã‡alÄ±ÅŸan GeliÅŸimi | SaÄŸlÄ±k ve Ä°letiÅŸim';
    const repaired = repairTurkishEncodingAndMojibake(corrupted);

    expect(repaired).toContain('Yönetim');
    expect(repaired).toContain('Müşteri');
    expect(repaired).toContain('İlişkileri');
    expect(repaired).toContain('Direktörü');
    expect(repaired).toContain('Çalışan');
    expect(repaired).toContain('Gelişimi');
    expect(repaired).toContain('Sağlık');
    expect(repaired).toContain('İletişim');
  });

  it('correctly repairs Windows-1254 misread as Latin-1 (ISO-8859-1)', () => {
    // In Latin-1, þ = ş, Þ = Ş, ð = ğ, Ð = Ğ, ý = ı, Ý = İ
    const latin1Corrupted = 'Müþteri Ýliþkileri ve Satıþ Yönetiþi | Öðrenci ve Baþarılı Çalıþan';
    const repaired = repairTurkishEncodingAndMojibake(latin1Corrupted);

    expect(repaired).toContain('Müşteri');
    expect(repaired).toContain('İlişkileri');
    expect(repaired).toContain('Satış');
    expect(repaired).toContain('Öğrenci');
    expect(repaired).toContain('Başarılı');
    expect(repaired).toContain('Çalışan');
  });

  it('correctly decodes XML numeric and named entities', () => {
    const xmlText = 'Telemarketing ve &#199;a&#287;r&#305; Merkezi Operasyonlar&#305; Y&#246;netimi &amp; M&#252;&#351;teri';
    const repaired = repairTurkishEncodingAndMojibake(xmlText);

    expect(repaired).toContain('Çağrı');
    expect(repaired).toContain('Operasyonları');
    expect(repaired).toContain('Yönetimi');
    expect(repaired).toContain('Müşteri');
    expect(repaired).toContain('&');
  });

  it('correctly decodes single-byte CP1254 bytes without generating replacement characters', () => {
    // "Yönetim" in Windows-1254: 0x59, 0xF6 (ö), 0x6E, 0x65, 0x74, 0x69, 0x6D
    const bufYonetim = Buffer.from([0x59, 0xf6, 0x6e, 0x65, 0x74, 0x69, 0x6d]);
    const decodedYonetim = decodeCp1254OrUtf8(bufYonetim);
    expect(decodedYonetim).toBe('Yönetim');

    // "Müşteri" in Windows-1254: 0x4D, 0xFC (ü), 0xFE (ş), 0x74, 0x65, 0x72, 0x69 (i)
    const bufMusteri = Buffer.from([0x4d, 0xfc, 0xfe, 0x74, 0x65, 0x72, 0x69]);
    const decodedMusteri = decodeCp1254OrUtf8(bufMusteri);
    expect(decodedMusteri).toBe('Müşteri');

    // "Çağrı" in Windows-1254: 0xC7 (Ç), 0x61 (a), 0xF0 (ğ), 0x72 (r), 0xFD (ı)
    const bufCagri = Buffer.from([0xc7, 0x61, 0xf0, 0x72, 0xfd]);
    const decodedCagri = decodeCp1254OrUtf8(bufCagri);
    expect(decodedCagri).toBe('Çağrı');
  });

  it('cleans box-drawing dividers (│) and ligatures into clean text', () => {
    const textWithBoxes = 'Telemarketing │ Çağrı Merkezi │ Satış │ ﬁnansal analiz';
    const cleaned = repairTurkishEncodingAndMojibake(textWithBoxes);

    expect(cleaned).toContain('Telemarketing | Çağrı Merkezi | Satış | finansal analiz');
    expect(cleaned).not.toContain('│');
    expect(cleaned).not.toContain('ﬁ');
  });
});

describe('PDF and DOCX Turkish Extraction Integration', () => {
  it('extracts real Turkish characters from PDF streams', async () => {
    // Generate a mock PDF buffer with Turkish words in single-byte CP1254 octal escapes
    const stream = `
BT
/F1 12 Tf
(U\\304UR ZAMAN - Telemarketing ve \\307a\\360r\\375 Merkezi Operasyonlar\\375 Direkt\\366r\\374) Tj
T*
(M\\374\\376teri \\335li\\376kileri ve Saha Sat\\375\\376 Y\\366netimi) Tj
ET
    `;
    let pdfString = '%PDF-1.4\n';
    const compressed = zlib.deflateSync(Buffer.from(stream, 'latin1'));
    pdfString += `
1 0 obj
<< /Length ${compressed.length} /Filter /FlateDecode >>
stream
${compressed.toString('binary')}
endstream
endobj
%%EOF`;

    const buffer = Buffer.from(pdfString, 'binary');
    const res = await extractCvText(buffer, 'ugur_zaman_cv.pdf', 'application/pdf');

    expect(res.text).toContain('Çağrı');
    expect(res.text).toContain('Operasyonları');
    expect(res.text).toContain('Direktörü');
    expect(res.text).toContain('Müşteri');
    expect(res.text).toContain('İlişkileri');
    expect(res.text).toContain('Satış');
    expect(res.text).toContain('Yönetimi');
  });
});
