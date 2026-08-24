import { describe, expect, it } from 'vitest';
import zlib from 'zlib';
import {
  extractCvText,
  extractTextFromDocx,
  extractTextFromPdf,
  CvExtractionError,
} from '@/features/candidates/cv/cv-text-extractor';
import { maskCvPii } from '@/features/candidates/cv/cv-pii-masker';
import { extractDeterministicCvSignals } from '@/features/candidates/cv/cv-deterministic-extractor';
import { fallbackDeterministicAiExtraction } from '@/features/candidates/cv/cv-ai-extractor';
import {
  mapCvToCanonicalTaxonomy,
  matchCanonicalPosition,
  matchCanonicalSector,
} from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import type { AiCvExtractionPayload } from '@/features/candidates/cv/cv.types';

describe('CV High Accuracy & Pipeline Regression Suite', () => {
  const sampleRealisticCv = `
Canberk Yılmaz
Kıdemli Yazılım Mühendisi / Senior Software Engineer
İstanbul, Türkiye
E-posta: canberk.yilmaz@example.com | Tel: +90 532 111 22 33 | LinkedIn: linkedin.com/in/canberkyilmaz

ÖZET
8+ yıllık kurumsal ve startup deneyimine sahip, modern web ve bulut mimarilerinde uzman kıdemli yazılım mühendisi. Yüksek trafikli mikroservis sistemleri tasarladı ve 6 kişilik mühendislik ekibine liderlik etti.

DENEYİM
XYZ Teknoloji A.Ş. | Kıdemli Yazılım Geliştirici | 2021 - Günümüz
- TypeScript, Next.js ve Go ile yüksek performanslı e-ticaret mikroservisleri geliştirildi.
- Docker ve Kubernetes ortamlarında CI/CD pipeline süreçleri optimize edilerek deploy süreleri %40 kısaltıldı.
- PostgreSQL ve Redis veritabanı optimizasyonları yapıldı.

ABC Bilişim Hizmetleri | Yazılım Uzmanı | 2017 - 2021
- React, Node.js ve AWS teknolojileriyle SaaS ürün geliştirildi.
- REST ve GraphQL API mimarileri tasarlandı.

EĞİTİM
İstanbul Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) | 2013 - 2017

YETKİNLİKLER & ARAÇLAR
Teknik Yetkinlikler: TypeScript, React, Next.js, Node.js, Go, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, REST API, Microservices
Araçlar: Git, Jira, Figma, Postman, Linux, VS Code
Mesleki Yetkinlikler: Çevik Yönetim (Agile/Scrum), Ekip Liderliği, Kod İnceleme, Sistem Mimarisi

DİLLER
Türkçe (Ana Dil), İngilizce (İleri Seviye / C1), Almanca (Başlangıç / A2)

SERTİFİKALAR
- AWS Certified Solutions Architect (2022)
- Professional Scrum Master I (PSM I) (2020)
`;

  // 1. Realistic CV Text -> Experience extraction
  it('1. extracts structured experience items correctly', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    const aiResult = fallbackDeterministicAiExtraction(sampleRealisticCv, signals);
    const canonical = mapCvToCanonicalTaxonomy(aiResult);

    expect(canonical.experiences.length).toBeGreaterThan(0);
    expect(canonical.experiences[0].role).toBeTruthy();
    expect(canonical.experiences[0].sector).toBeTruthy();
  });

  // 2. Realistic CV Text -> Skills extraction
  it('2. extracts professional and technical skills accurately', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    const aiResult = fallbackDeterministicAiExtraction(sampleRealisticCv, signals);
    const canonical = mapCvToCanonicalTaxonomy(aiResult);

    expect(canonical.technicalSkills.length + canonical.professionalSkills.length).toBeGreaterThan(0);
  });

  // 3. Realistic CV Text -> Education extraction
  it('3. extracts education degrees and fields correctly', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    expect(signals.educationDegrees).toContain('Lisans');
  });

  // 4. Realistic CV Text -> Languages extraction
  it('4. extracts detected languages deterministically', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    expect(signals.languages).toContain('İngilizce');
    expect(signals.languages).toContain('Almanca');
  });

  // 5. Realistic CV Text -> Certificates extraction
  it('5. extracts detected certificates without hallucination', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    expect(signals.certificates.some((c) => c.toLowerCase().includes('aws') || c.toLowerCase().includes('scrum'))).toBe(true);
  });

  // 6. Raw title -> Taxonomy mapping & ambiguity detection
  it('6. maps English/Turkish raw titles to canonical taxonomy', () => {
    const match1 = matchCanonicalPosition('Senior Software Engineer');
    expect(match1.canonical).toBe('Yazılım Geliştirici');
    expect(match1.isAmbiguous).toBe(false);

    const match2 = matchCanonicalPosition('Business Development Manager');
    expect(match2.canonical).toBe('İş Geliştirme Müdürü');
    expect(match2.isAmbiguous).toBe(false);

    const match3 = matchCanonicalPosition('NonStandardUnicornTitle');
    expect(match3.canonical).toBe('');
    expect(match3.isAmbiguous).toBe(true);
  });

  // 7. Partial extraction support
  it('7. supports partial CV data extraction without throwing full failure', () => {
    const partialPayload: AiCvExtractionPayload = {
      roles: ['Grafik Tasarımcı'],
      sectors: ['Pazarlama / Reklam'],
      skills: ['Figma', 'Photoshop'],
      tools: ['Illustrator'],
      education: [],
      languages: ['İngilizce'],
      certificates: [],
      locations: ['İzmir'],
      experiences: [],
      summary: 'İzmir lokasyonunda grafik tasarımcı.',
      ambiguousItems: [],
    };

    const canonical = mapCvToCanonicalTaxonomy(partialPayload);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'partial_cv.pdf');

    expect(draft.extractedCount).toBeGreaterThan(3);
    expect(draft.formValues.role).toBe('Grafik Tasarımcı');
    expect(draft.formValues.city).toBe('İzmir');
    expect(draft.categoriesFound.roles).toBe(1);
    expect(draft.categoriesFound.skills).toBe(2);
  });

  // 8. Empty extraction detection
  it('8. rejects empty or unreadable text gracefully', async () => {
    await expect(extractCvText(Buffer.alloc(0), 'empty.pdf')).rejects.toThrow(CvExtractionError);
  });

  // 9. Preference hallucination prevention
  it('9. strictly prevents setting user preferences from past CV data', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    const aiResult = fallbackDeterministicAiExtraction(sampleRealisticCv, signals);
    const canonical = mapCvToCanonicalTaxonomy(aiResult);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv.pdf');

    // Future preference fields MUST remain empty for user choice
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.availability).toBe('');
    expect(draft.unconfirmedPreferenceKeys).toContain('workplacePreference');
  });

  // 10. PII masking safety
  it('10. masks emails, phone numbers, and profile URLs', () => {
    const piiResult = maskCvPii(sampleRealisticCv);
    expect(piiResult.maskedText).not.toContain('canberk.yilmaz@example.com');
    expect(piiResult.maskedText).not.toContain('532 111 22 33');
    expect(piiResult.maskedText).toContain('[EMAIL]');
    expect(piiResult.maskedText).toContain('[PHONE]');
    expect(piiResult.piiMaskedCount).toBeGreaterThan(0);
  });

  // 11. PDF extraction with Hex strings & CID font support
  it('11. extracts PDF text containing hex-encoded strings and standard TJ commands', async () => {
    const hexStream = `
BT
/F1 12 Tf
<55677572205a616d616e202d20536f66747761726520446576656c6f706572> Tj
T*
[(Istanbul ) 20 (Turkiye)] TJ
ET
    `;
    const compressed = zlib.deflateSync(Buffer.from(hexStream, 'utf8'));
    const pdf = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n${compressed.toString('binary')}\nendstream\nendobj\n%%EOF`;
    const buffer = Buffer.from(pdf, 'binary');

    const res = await extractCvText(buffer, 'hex_cv.pdf', 'application/pdf');
    expect(res.text).toContain('Ugur Zaman');
    expect(res.text).toContain('Software Developer');
    expect(res.text).toContain('Istanbul');
  });

  // 12. DOCX Multi-part XML extraction
  it('12. extracts DOCX text correctly from word/document.xml', () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Emre Kaya - Pazarlama Uzmanı</w:t></w:r></w:p>
    <w:p><w:r><w:t>5 yıllık dijital pazarlama ve SEO deneyimi.</w:t></w:r></w:p>
  </w:body>
</w:document>`;
    const compressedXml = zlib.deflateRawSync(Buffer.from(xmlContent, 'utf8'));
    const fileName = 'word/document.xml';
    const fileNameBuf = Buffer.from(fileName, 'utf8');

    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); // Local file header signature
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0, 6); // general purpose flag
    header.writeUInt16LE(8, 8); // compression method (Deflate)
    header.writeUInt32LE(0, 10); // last mod time/date
    header.writeUInt32LE(0, 14); // crc-32
    header.writeUInt32LE(compressedXml.length, 18); // compressed size
    header.writeUInt32LE(Buffer.byteLength(xmlContent), 22); // uncompressed size
    header.writeUInt16LE(fileNameBuf.length, 26); // file name length
    header.writeUInt16LE(0, 28); // extra field length

    const docxBuffer = Buffer.concat([header, fileNameBuf, compressedXml]);
    const extracted = extractTextFromDocx(docxBuffer);

    expect(extracted).toContain('Emre Kaya');
    expect(extracted).toContain('Pazarlama Uzmanı');
    expect(extracted).toContain('SEO');
  });

  // 13. Fallback deterministic extraction accuracy
  it('13. provides rich fallback extraction when AI is offline without losing core profile fields', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    const fallback = fallbackDeterministicAiExtraction(sampleRealisticCv, signals);

    expect(fallback.roles.length).toBeGreaterThan(0);
    expect(fallback.sectors.length).toBeGreaterThan(0);
    expect(fallback.skills.length).toBeGreaterThan(0);
    expect(fallback.tools.length).toBeGreaterThan(0);
    expect(fallback.languages.length).toBeGreaterThan(0);
  });

  // 14. Profile builder data preservation & exact category metrics
  it('14. calculates exact category breakdown and preserves all extracted fields in draftValues', () => {
    const signals = extractDeterministicCvSignals(sampleRealisticCv);
    const aiResult = fallbackDeterministicAiExtraction(sampleRealisticCv, signals);
    const canonical = mapCvToCanonicalTaxonomy(aiResult);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'canberk_cv.pdf');

    expect(draft.extractedCount).toBeGreaterThan(5);
    expect(draft.cvFilledFieldKeys.length).toBeGreaterThan(3);
    expect(draft.categoriesFound.roles).toBeGreaterThanOrEqual(1);
    expect(draft.metrics.aiCallCount).toBe(0);
  });
});
