import { describe, expect, it } from 'vitest';
import zlib from 'zlib';
import { extractCvText } from '@/features/candidates/cv/cv-text-extractor';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { cvService } from '@/features/candidates/cv/cv.service';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

/**
 * Creates an in-memory mock PDF buffer containing deflate-compressed text streams.
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

/**
 * Creates an in-memory mock DOCX ZIP archive containing word/document.xml.
 */
function createMockDocxBuffer(xmlContent: string): Buffer {
  const fileName = 'word/document.xml';
  const fileNameBuffer = Buffer.from(fileName, 'utf8');
  const compressedXml = zlib.deflateRawSync(Buffer.from(xmlContent, 'utf8'));

  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0); // Local header signature
  header.writeUInt16LE(20, 4); // Version needed
  header.writeUInt16LE(0, 6); // Flags
  header.writeUInt16LE(8, 8); // Compression method (8 = Deflate)
  header.writeUInt16LE(0, 10); // Time
  header.writeUInt16LE(0, 12); // Date
  header.writeUInt32LE(0, 14); // CRC32
  header.writeUInt32LE(compressedXml.length, 18); // Compressed size
  header.writeUInt32LE(Buffer.byteLength(xmlContent), 22); // Uncompressed size
  header.writeUInt16LE(fileNameBuffer.length, 26); // File name length
  header.writeUInt16LE(0, 28); // Extra field length

  return Buffer.concat([header, fileNameBuffer, compressedXml]);
}

describe('Universal CV Extraction — Unseen Stress & Format Acceptance Suite', () => {

  // ==========================================================================
  // 1. PDF FORMAT: Two-Column Sidebar Layout with Medical Executive
  // ==========================================================================
  it('Unseen Archetype 01 [PDF - Two-Column Sidebar]: Healthcare Medical Director', async () => {
    const stream = `
BT
/F1 14 Tf
(Dr. Selim Yilmaz) Tj
T*
(Istanbul / Bakirkoy | selim.yilmaz@medikal.com | +90 532 111 2233) Tj
T*
(Medikal Direktor) Tj
T*
(DENEYIM) Tj
T*
(Acibadem Saglik Grubu \\(2017 - 2024\\)) Tj
T*
(Medikal Direktor) Tj
T*
(Klinik kalite standartlari, hekim kadrosu yonetimi ve JCI akreditasyon surecleri.) Tj
T*
(EGITIM) Tj
T*
(Cerrahpasa Tip Fakultesi - Tip Doktoru \\(Doktora\\) - 2008) Tj
T*
(YETKINLIKLER & DILLER) Tj
T*
(Ingilizce, Almanca, JCI Akreditasyonu, Saglik Yonetimi, SPSS) Tj
ET
    `;
    const pdfBuffer = createMockPdfBuffer([stream]);
    const extracted = await extractCvText(pdfBuffer, 'dr_selim_yilmaz.pdf', 'application/pdf');
    expect(extracted.format).toBe('pdf');
    expect(extracted.text).toContain('Dr. Selim Yilmaz');

    const res = extractDeterministicCv(extracted.text);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'dr_selim_yilmaz.pdf');

    // Verification of fields
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Bakırköy');
    expect(draft.formValues.role).toMatch(/Hastane yöneticisi|Sağlık Yöneticisi|Doktor|Medikal/i);
    expect(draft.formValues.sector).toBe('Sağlık');
    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Ac[ıi]badem/i);
    expect(res.experiences[0].startYear).toBe(2017);
    expect(res.experiences[0].endYear).toBe(2024);
    expect(draft.formValues.educationLevel).toBe('Doktora');
    expect(draft.formValues.languages).toContain('İngilizce');
  });

  // ==========================================================================
  // 2. PDF FORMAT: Table-Heavy Grid Layout with Financial Controller
  // ==========================================================================
  it('Unseen Archetype 02 [PDF - Table Grid]: Corporate Finance Director', async () => {
    const stream = `
BT
/F1 12 Tf
(Deniz Arslan) Tj
T*
(Ankara / Cankaya) Tj
T*
(Finans Muduru) Tj
T*
(IS DENEYIMI) Tj
T*
[(Koc Holding ) 20 (Finans Muduru ) 15 (2018 - 2024)] TJ
T*
(Nakit akisi, butce planlama, IFRS raporlama ve banka iliskileri yonetimi.) Tj
T*
[(Turk Telekom ) 20 (Mali Isler Uzmani ) 15 (2013 - 2018)] TJ
T*
(Finansal modelleme, hazine operasyonlari ve vergi planlamasi.) Tj
T*
(EGITIM) Tj
T*
(Bilkent Universitesi - Iktisat \\(Yuksek Lisans\\) - 2013) Tj
T*
(ODTU - Isletme \\(Lisans\\) - 2011) Tj
T*
(SERTIFIKALAR: CFA, SMMM) Tj
ET
    `;
    const pdfBuffer = createMockPdfBuffer([stream]);
    const extracted = await extractCvText(pdfBuffer, 'deniz_arslan_finans.pdf', 'application/pdf');
    const res = extractDeterministicCv(extracted.text);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'deniz_arslan.pdf');

    expect(res.experiences.length).toBeGreaterThanOrEqual(2);
    expect(res.experiences[0].company).toMatch(/Ko[cç] Holding/i);
    expect(res.experiences[0].role).toMatch(/Finans M[uü]d[uü]r[uü]/i);
    expect(draft.formValues.sector).toBe('Finans / Bankacılık');
    expect(draft.formValues.certificates).toMatch(/SMMM|CFA/i);
    expect(canonical.educationList.length).toBeGreaterThanOrEqual(2);
    expect(draft.formValues.educationLevel).toBe('Yüksek lisans');
  });

  // ==========================================================================
  // 3. PDF FORMAT: Multi-Page 3-Page Executive Document with Footers
  // ==========================================================================
  it('Unseen Archetype 03 [PDF - Multi-page 3-Page]: Supply Chain & Fleet Director', async () => {
    const page1 = `
BT
(Sayfa 1 / 3 - Ozgecmis) Tj
T*
(Aylin Cetin) Tj
T*
(Izmir / Bornova | aylin.cetin@logistics.com) Tj
T*
(Tedarik Zinciri Direktoru) Tj
T*
(DENEYIM) Tj
T*
(Ekol Lojistik \\(2019 - 2024\\)) Tj
T*
(Tedarik Zinciri Direktoru) Tj
T*
(500 araclik filo yonetimi, depo optimizasyonu ve uluslararasi rotalama.) Tj
ET
    `;
    const page2 = `
BT
(Sayfa 2 / 3 - Ozgecmis) Tj
T*
(Mars Logistics \\(2012 - 2019\\)) Tj
T*
(Lojistik Muduru) Tj
T*
(Gumrukleme, cross-dock operasyonlari ve SAP ERP entegrasyonu.) Tj
ET
    `;
    const page3 = `
BT
(Sayfa 3 / 3 - Gizli Dokuman) Tj
T*
(EGITIM) Tj
T*
(Dokuz Eylul Universitesi - Endustri Muhendisligi \\(Lisans\\) - 2011) Tj
T*
(BELGELER: UDY 3, ODY 2, SAP ERP) Tj
T*
(DILLER: Turkce, Ingilizce) Tj
ET
    `;
    const pdfBuffer = createMockPdfBuffer([page1, page2, page3]);
    const extracted = await extractCvText(pdfBuffer, 'aylin_cetin.pdf', 'application/pdf');
    const res = extractDeterministicCv(extracted.text);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'aylin_cetin.pdf');

    expect(res.experiences.length).toBeGreaterThanOrEqual(2);
    expect(draft.formValues.city).toBe('İzmir');
    expect(draft.formValues.residenceDistrict).toBe('Bornova');
    expect(draft.formValues.sector).toBe('Lojistik / Depolama');
    expect(draft.formValues.certificates).toMatch(/ÜDY|SAP/i);
    expect(res.experiences[0].responsibilities || '').not.toContain('Sayfa 1 / 3');
  });

  // ==========================================================================
  // 4. DOCX FORMAT: OpenXML XML Tables & Cyber Security Specialist
  // ==========================================================================
  it('Unseen Archetype 04 [DOCX - OpenXML Tables]: Cyber Security & SOC Lead', async () => {
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:t>Kerem Demirtaş</w:t>
    </w:p>
    <w:p>
      <w:t>İstanbul / Beşiktaş | kerem.sec@cyber.io</w:t>
    </w:p>
    <w:p>
      <w:t>Siber Güvenlik Uzmanı</w:t>
    </w:p>
    <w:p>
      <w:t>İŞ GEÇMİŞİ</w:t>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:t>Şirket: Trendyol</w:t></w:p></w:tc>
        <w:tc><w:p><w:t>Rol: Siber Güvenlik Uzmanı</w:t></w:p></w:tc>
        <w:tc><w:p><w:t>Dönem: 2020 - 2024</w:t></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p>
      <w:t>• SIEM, Splunk, EDR ve SOC monitoring operasyonlarının yürütülmesi.</w:t>
    </w:p>
    <w:p>
      <w:t>• Sızma testleri, ISO 27001 denetimleri ve zafiyet taramaları.</w:t>
    </w:p>
    <w:p>
      <w:t>EĞİTİM</w:t>
    </w:p>
    <w:p>
      <w:t>Yıldız Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2019</w:t>
    </w:p>
    <w:p>
      <w:t>SERTİFİKALAR: CEH, OSCP, ISO 27001</w:t>
    </w:p>
    <w:p>
      <w:t>YETKİNLİKLER: Python, SIEM, Splunk, Wireshark, Linux, Firewall</w:t>
    </w:p>
  </w:body>
</w:document>`;

    const docxBuffer = createMockDocxBuffer(documentXml);
    const extracted = await extractCvText(docxBuffer, 'kerem_demirtas.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(extracted.format).toBe('docx');

    const res = extractDeterministicCv(extracted.text);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'kerem_demirtas.docx');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Trendyol/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.certificates).toContain('CEH');
    expect(draft.formValues.certificates).toContain('OSCP');
    expect(draft.formValues.tools).toContain('SIEM');
    expect(draft.formValues.tools).toContain('Splunk');
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Beşiktaş');
  });

  // ==========================================================================
  // 5. DOCX FORMAT: Bullet List Hierarchy with HR Business Partner
  // ==========================================================================
  it('Unseen Archetype 05 [DOCX - Bullet Hierarchy]: HR Business Partner', async () => {
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:t>Bahar Şahin</w:t>
    </w:p>
    <w:p>
      <w:t>Bursa / Nilüfer</w:t>
    </w:p>
    <w:p>
      <w:t>İnsan Kaynakları Uzmanı</w:t>
    </w:p>
    <w:p>
      <w:t>DENEYİM</w:t>
    </w:p>
    <w:p>
      <w:t>Bosch Türkiye (2018 - 2024)</w:t>
    </w:p>
    <w:p>
      <w:t>İnsan Kaynakları İş Ortağı</w:t>
    </w:p>
    <w:p>
      <w:t>• Bordro, özlük işleri, SGK ve iş kanunu mevzuatı takibi.</w:t>
    </w:p>
    <w:p>
      <w:t>• Performans değerlendirme sistemleri ve yetenek yönetimi.</w:t>
    </w:p>
    <w:p>
      <w:t>EĞİTİM</w:t>
    </w:p>
    <w:p>
      <w:t>Uludağ Üniversitesi - Çalışma Ekonomisi (Lisans) - 2017</w:t>
    </w:p>
    <w:p>
      <w:t>PROGRAMLAR: SAP HR, Logo Tiger, PDKS</w:t>
    </w:p>
  </w:body>
</w:document>`;

    const docxBuffer = createMockDocxBuffer(documentXml);
    const extracted = await extractCvText(docxBuffer, 'bahar_sahin.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const res = extractDeterministicCv(extracted.text);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'bahar_sahin.docx');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Bosch/i);
    expect(draft.formValues.sector).toBe('İnsan kaynakları');
    expect(draft.formValues.city).toBe('Bursa');
    expect(draft.formValues.residenceDistrict).toBe('Nilüfer');
    expect(draft.formValues.tools).toContain('PDKS');
  });

  // ==========================================================================
  // 6. ATS FORMAT: Clean Hybrid English-Turkish SRE Engineer
  // ==========================================================================
  it('Unseen Archetype 06 [ATS Hybrid]: Site Reliability Engineer', () => {
    const cv = `
Emre Can Aydın
İstanbul / Kadıköy | emrecan@cloudops.dev | +90 533 999 8877

DevOps / Cloud Mühendisi

SUMMARY
Senior Site Reliability Engineer with 7+ years of experience designing high-availability Kubernetes infrastructure, CI/CD pipelines, and cloud observability on AWS and GCP.

WORK EXPERIENCE
Getir (2020 - 2024)
DevOps / Cloud Mühendisi
- Managed 50+ microservices on AWS EKS using Terraform and Helm.
- Implemented Prometheus & Grafana alerting, reducing MTTR by 45%.
- Maintained 99.99% system availability across multi-region deployments.

Trendyol (2017 - 2020)
Sistem Yöneticisi
- Linux server automation with Ansible and GitLab CI/CD.

EDUCATION
Istanbul Technical University - Computer Engineering (Bachelor) - 2017

TECHNICAL SKILLS: Docker, Kubernetes, AWS, Terraform, Prometheus, Grafana, Linux, Python
CERTIFICATES: AWS Certified Solutions Architect, CKA
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'emrecan.pdf');

    expect(res.experiences.length).toBe(2);
    expect(res.experiences[0].company).toBe('Getir');
    expect(draft.formValues.role).toMatch(/DevOps|Cloud|Sistem/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.certificates).toContain('AWS Certified');
    expect(draft.formValues.tools).toContain('Kubernetes');
    expect(draft.formValues.tools).toContain('Docker');
    expect(draft.formValues.tools).toContain('Terraform');
  });

  // ==========================================================================
  // 7. COMPACT PORTFOLIO: 1-Page UI/UX Designer & Frontend Developer
  // ==========================================================================
  it('Unseen Archetype 07 [Compact Portfolio]: UI/UX Designer & Product Designer', () => {
    const cv = `
Seda Kurtuluş
Eskişehir / Tepebaşı
Grafik Tasarımcı

ÖZET: 4 yıllık mobil ve web arayüz tasarımı, kullanıcı deneyimi araştırmaları ve Figma uzmanı.

İŞ DENEYİMİ
Pixel Creative Studio (2021 - 2024)
Grafik Tasarımcı
Kullanıcı akışları, wireframe, prototip üretimi ve tasarım sistemleri mimarisi.

EĞİTİM
Anadolu Üniversitesi - Görsel İletişim Tasarımı (Lisans) - 2021

ARAÇLAR & BECERİLER: Figma, Adobe XD, Photoshop, Illustrator, HTML, CSS, Tasarım Sistemleri
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'seda_kurtulus.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Pixel/i);
    expect(draft.formValues.sector).toMatch(/Pazarlama|Tasarım/i);
    expect(draft.formValues.tools).toContain('Figma');
    expect(draft.formValues.tools).toContain('Adobe Illustrator');
    expect(draft.formValues.city).toBe('Eskişehir');
    expect(draft.formValues.residenceDistrict).toBe('Tepebaşı');
  });

  // ==========================================================================
  // 8. GLYPH-HEAVY: Modern Glyph Delimited Food Safety & QA Manager
  // ==========================================================================
  it('Unseen Archetype 08 [Glyph-Heavy]: Food Engineer & Quality Assurance Lead', () => {
    const cv = `
Volkan Güler
Balıkesir / Bandırma
Gıda Mühendisi

✦ KARİYER ÖZETİ: 8 yıllık endüstriyel gıda üretiminde kalite kontrol ve HACCP denetimleri.

▶ İŞ TECRÜBESİ
Sütaş A.Ş. (2018 - 2024)
Kalite Kontrol Uzmanı
▪ HACCP ve ISO 22000 gıda güvenliği yönetim sistemi yürütücülüğü.
▪ Laboratuvar mikrobiyolojik analizleri ve hammadde kabul denetimleri.

▶ ÖĞRENİM BİLGİLERİ
Ege Üniversitesi ✦ Gıda Mühendisliği (Lisans) ✦ 2017

★ BELGELER: ISO 22000, HACCP, Hijyen Belgesi
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'volkan_guler.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Sütaş/i);
    expect(res.experiences[0].role).toMatch(/Kalite/i);
    expect(draft.formValues.city).toBe('Balıkesir');
    expect(draft.formValues.residenceDistrict).toBe('Bandırma');
    expect(draft.formValues.certificates).toMatch(/ISO|HACCP/i);
  });

  // ==========================================================================
  // 9. HIGH VOLTAGE ELECTRICAL & ENERGY ENGINEER
  // ==========================================================================
  it('Unseen Archetype 09 [Heavy Industry]: High Voltage Substation Engineer', () => {
    const cv = `
Burak Yıldırım
Adana / Seyhan
Elektrik Mühendisi

İŞ DENEYİMİ
Toroslar EDAŞ (2017 - 2024)
Elektrik Mühendisi
154 kV trafo merkezleri bakım onarımı, SCADA otomasyonu ve YG işletme sorumluluğu.

EĞİTİM
Çukurova Üniversitesi - Elektrik-Elektronik Mühendisliği (Lisans) - 2016

SERTİFİKALAR: YG İşletme Sorumluluğu Belgesi, İSG
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'burak_yildirim.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Toroslar EDAŞ/i);
    expect(draft.formValues.city).toBe('Adana');
    expect(draft.formValues.residenceDistrict).toBe('Seyhan');
  });

  // ==========================================================================
  // 10. LEGAL & COMPLIANCE COUNSEL
  // ==========================================================================
  it('Unseen Archetype 10 [Corporate Legal]: In-House Legal Counsel', () => {
    const cv = `
Av. Merve Tan
İstanbul / Şişli
Hukuk Danışmanı

İŞ GEÇMİŞİ
Doğan Holding (2018 - 2024)
Hukuk Danışmanı
Ticari sözleşmelerin hazırlanması, KVKK uyum süreçleri ve dava takibi.

EĞİTİM
Galatasaray Üniversitesi - Hukuk Fakültesi (Lisans) - 2017

DİLLER: Türkçe, Fransızca, İngilizce
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'av_merve_tan.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Doğan Holding/i);
    expect(draft.formValues.sector).toBe('Hukuk');
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Şişli');
    expect(draft.formValues.languages).toContain('Fransızca');
    expect(draft.formValues.languages).toContain('İngilizce');
  });

  // ==========================================================================
  // 11. TOURISM & GASTRONOMY EXECUTIVE CHEF
  // ==========================================================================
  it('Unseen Archetype 11 [Gastronomy / Tourism]: Executive Chef', () => {
    const cv = `
Murat Şimşek
Antalya / Alanya
Aşçı

İŞ DENEYİMİ
Rixos Premium Belek (2016 - 2024)
Aşçı
Otel ana mutfak koordinasyonu, menü mühendisliği, maliyet analizi ve 40 kişilik aşçı ekibi yönetimi.

EĞİTİM
Akdeniz Üniversitesi - Gastronomi ve Mutfak Sanatları (Lisans) - 2015

BELGELER: HACCP, Hijyen Belgesi, Usta Öğreticilik
DİLLER: Türkçe, Rusça, İngilizce
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'murat_simsek.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Rixos/i);
    expect(draft.formValues.sector).toBe('Turizm / Otelcilik');
    expect(draft.formValues.languages).toContain('Rusça');
  });

  // ==========================================================================
  // 12. E-COMMERCE & MARKETPLACE GROWTH MANAGER
  // ==========================================================================
  it('Unseen Archetype 12 [E-Commerce]: Marketplace Growth & Category Manager', () => {
    const cv = `
Tuğçe Yılmaz
İstanbul / Ataşehir
Kategori Yöneticisi

DENEYİM
Hepsiburada (2019 - 2024)
Kategori Yöneticisi
Elektronik kategorisinde 100M TL ciro hedeflerinin yönetimi ve satıcı büyüme stratejileri.

EĞİTİM
Marmara Üniversitesi - İktisat (Lisans) - 2018

YETKİNLİKLER: E-Ticaret, Kategori Yönetimi, Google Analytics, Excel, Pazaryeri Entegrasyonları
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'tugce_yilmaz.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Hepsiburada/i);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Ataşehir');
    expect(draft.formValues.tools).toContain('Google Analytics');
  });

  // ==========================================================================
  // 13. AUTOMOTIVE PLANT & MANUFACTURING DIRECTOR
  // ==========================================================================
  it('Unseen Archetype 13 [Automotive]: Automotive Plant Manager', () => {
    const cv = `
Hakan Tekin
Kocaeli / Gebze
Üretim Müdürü

İŞ DENEYİMİ
Ford Otosan (2015 - 2024)
Üretim Müdürü
Gövde üretim hattı verimlilik artışı, Kaizen, 5S ve IATF 16949 denetimleri.

EĞİTİM
Kocaeli Üniversitesi - Makine Mühendisliği (Lisans) - 2014

BELGELER: IATF 16949, Six Sigma Black Belt
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'hakan_tekin.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Ford Otosan/i);
    expect(draft.formValues.sector).toBe('Üretim / Sanayi');
    expect(draft.formValues.city).toBe('Kocaeli');
    expect(draft.formValues.residenceDistrict).toBe('Gebze');
    expect(draft.formValues.certificates).toMatch(/IATF|Six Sigma/i);
  });

  // ==========================================================================
  // 14. AGRICULTURAL & IRRIGATION ENGINEER
  // ==========================================================================
  it('Unseen Archetype 14 [Agriculture]: Smart Greenhouse & Irrigation Engineer', () => {
    const cv = `
Fatma Çakır
Mersin / Tarsus
Ziraat Mühendisi

DENEYİM
Agro Tarım Teknolojileri (2019 - 2024)
Ziraat Mühendisi
Akıllı sera otomasyonu, damla sulama projeleri ve bitki besleme danışmanlığı.

EĞİTİM
Çukurova Üniversitesi - Ziraat Fakültesi (Lisans) - 2018

UZMANLIK: Topraksız Tarım, Damla Sulama, Gübreleme, Sera Otomasyonu
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'fatma_cakir.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].company).toMatch(/Agro Tarım/i);
    expect(draft.formValues.city).toBe('Mersin');
    expect(draft.formValues.residenceDistrict).toBe('Tarsus');
  });

  // ==========================================================================
  // 15. FRESH GRADUATE WITH INTERNSHIPS & ERASMUS (ZERO HALLUCINATION)
  // ==========================================================================
  it('Unseen Archetype 15 [Junior Student / Intern]: Zero Hallucination Student CV', () => {
    const cv = `
Kaan Aksoy
İstanbul / Maltepe
Yazılım Geliştirici

ÖZET: İTÜ Bilgisayar Mühendisliği 2024 mezunu. React ve Node.js teknolojilerine odaklı yazılımcı.

DENEYİM
Trendyol (2023 - 2024)
Yazılım Stajyeri
Mikroservis mimarisinde backend servis geliştirme ve birim test yazımı.

EĞİTİM
İTÜ - Bilgisayar Mühendisliği (Lisans) - 2024
Varşova Teknoloji Üniversitesi (Erasmus) - 2023

BECERİLER: JavaScript, TypeScript, React, Node.js, Git
DİLLER: Türkçe, İngilizce
    `.trim();

    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'kaan_aksoy.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(res.experiences[0].role).toMatch(/Stajyer|Geliştirici/i);
    expect(draft.formValues.experienceLevel).toMatch(/Yeni Mezun|Junior|Uzman/i);
    expect(draft.formValues.certificates).toHaveLength(0); // Zero fake certificates
    expect(draft.formValues.languages).toContain('İngilizce');
    expect(draft.formValues.languages).toContain('Türkçe');
  });

  // ==========================================================================
  // 16. END-TO-END BROWSER / LIFECYCLE PIPELINE TEST: Binary PDF & DOCX
  // ==========================================================================
  it('verifies end-to-end Binary Upload -> Parse -> Canonical Map -> UI Preview Hydration for both PDF and DOCX', async () => {
    // 1. PDF Pipeline
    const pdfStream = `
BT
/F1 12 Tf
(Gülfem Yılmaz) Tj
T*
(Satış Yöneticisi) Tj
T*
(İstanbul / Üsküdar) Tj
T*
(DENEYİM) Tj
T*
(Akbank 2018 - 2024) Tj
T*
(Kurumsal Müşteri Yöneticisi) Tj
T*
(Kurumsal kredi tahsis, portföy yönetimi ve finansal risk değerlendirme.) Tj
T*
(EĞİTİM) Tj
T*
(Marmara Üniversitesi - İktisat \\(Lisans\\) - 2017) Tj
T*
(YETKİNLİKLER: Portföy Yönetimi, Kredi Tahsis, Finansal Analiz) Tj
ET
    `;
    const pdfBuf = createMockPdfBuffer([pdfStream]);
    const pdfDraft = await cvService.processCvBuffer({
      buffer: pdfBuf,
      fileName: 'gulfem_cv.pdf',
      mimeType: 'application/pdf',
    });

    expect(pdfDraft.formValues.role).toMatch(/Müşteri Yöneticisi|Satış Yöneticisi|Satış Müdürü/i);
    expect(pdfDraft.formValues.sector).toBe('Finans / Bankacılık');
    expect(pdfDraft.formValues.city).toBe('İstanbul');
    expect(pdfDraft.formValues.residenceDistrict).toBe('Üsküdar');

    // Serialize to DB custom fields and verify UI preview hydration
    const customFields = formValuesToCustomFields('seek', pdfDraft.formValues as CareerProfileFormValues);
    expect(customFields.experiences).toBeDefined();

    const previewData = toSafeCareerPreviewInput({
      kind: 'seek',
      source: {
        customFields,
      },
    });
    expect(previewData.desiredRole).toBe(pdfDraft.formValues.role);
    expect(previewData.experiences?.length).toBe(1);
    expect(previewData.experiences?.[0].company).toBe('Akbank');

    // 2. DOCX Pipeline
    const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:t>Tolga Akın</w:t></w:p>
    <w:p><w:t>İzmir / Karşıyaka</w:t></w:p>
    <w:p><w:t>Yazılım Test Mühendisi</w:t></w:p>
    <w:p><w:t>İŞ GEÇMİŞİ</w:t></w:p>
    <w:p><w:t>Netcad (2020 - 2024)</w:t></w:p>
    <w:p><w:t>QA / Test Uzmanı</w:t></w:p>
    <w:p><w:t>Otomasyon testleri, Selenium ve API testleri yürütülmesi.</w:t></w:p>
    <w:p><w:t>EĞİTİM: Ege Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2019</w:t></w:p>
    <w:p><w:t>ARAÇLAR: Selenium, Cypress, Postman, Jira</w:t></w:p>
  </w:body>
</w:document>`;
    const docxBuf = createMockDocxBuffer(docxXml);
    const docxDraft = await cvService.processCvBuffer({
      buffer: docxBuf,
      fileName: 'tolga_akin.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    expect(docxDraft.formValues.role).toMatch(/QA|Test/i);
    expect(docxDraft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(docxDraft.formValues.city).toBe('İzmir');
    expect(docxDraft.formValues.residenceDistrict).toBe('Karşıyaka');
    expect(docxDraft.formValues.tools).toContain('Selenium');
    expect(docxDraft.formValues.tools).toContain('Postman');

    const docxCustomFields = formValuesToCustomFields('seek', docxDraft.formValues as CareerProfileFormValues);
    const docxPreview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: {
        customFields: docxCustomFields,
      },
    });
    expect(docxPreview.desiredRole).toBe(docxDraft.formValues.role);
    expect(docxPreview.experiences?.[0].company).toBe('Netcad');
  });
});
