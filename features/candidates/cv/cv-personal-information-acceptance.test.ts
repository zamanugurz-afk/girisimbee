import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { extractUniversalDemographics } from './cv-universal-normalizer';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import { cvService } from './cv.service';
import type { CareerProfileFormValues } from '@/features/career-profile/types';
import zlib from 'zlib';

function createMockPdf(lines: string[]): Buffer {
  const stream = `
BT
/F1 12 Tf
${lines.map((l) => `(${l.replace(/([()])/g, '\\$1')}) Tj\nT*`).join('\n')}
ET
  `;
  const compressed = zlib.deflateSync(Buffer.from(stream, 'utf8'));
  const pdfString = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n${compressed.toString('binary')}\nendstream\nendobj\n%%EOF`;
  return Buffer.from(pdfString, 'binary');
}

function createMockDocx(xmlContent: string): Buffer {
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

describe('GİRİŞİMBEE — PERSONAL INFORMATION EXTRACTION & ZERO HALLUCINATION ACCEPTANCE SUITE', () => {
  // 1. Normal Single Column CV
  it('1. extracts name, city, district from single-column layout', () => {
    const text = `Ahmet Yılmaz\nİstanbul / Kadıköy\nKıdemli Yazılım Geliştirici\n\nDENEYİM\nTrendyol 2020 - 2024\nSenior Developer\n* Backend mikroservis mimarileri.\n\nEĞİTİM\nİTÜ - Bilgisayar Mühendisliği (Lisans) - 2019`;
    const res = extractDeterministicCv(text);
    expect(res.fullName).toBe('Ahmet Yılmaz');
    expect(res.locations).toContain('İstanbul');
    expect(res.locations).toContain('Kadıköy');
  });

  // 2. Two-Column Sidebar CV
  it('2. extracts name and demographics from two-column sidebar layout', () => {
    const text = `ÖZGEÇMİŞ\nBurak Batıl Özdemir\nİletişim: burak@example.com | 0532 111 22 33\nLokasyon: İzmir / Bornova\n\nİŞ DENEYİMLERİ\nEge Yazılım 2019 - 2024\nFull Stack Developer`;
    const res = extractDeterministicCv(text);
    expect(res.fullName).toBe('Burak Batıl Özdemir');
    expect(res.locations).toContain('İzmir');
    expect(res.locations).toContain('Bornova');
    expect(res.email).toBe('burak@example.com');
    expect(res.phone).toBe('0532 111 22 33');
  });

  // 3. Name in ALL CAPS
  it('3. extracts name formatted in ALL UPPERCASE', () => {
    const text = `MUSTAFA CEM YILMAZ\nİstanbul / Ataşehir\nBanka Şube Müdürü\n\nDENEYİM\nGaranti BBVA 2018 - 2024\nŞube Müdürü`;
    const res = extractDeterministicCv(text);
    expect(res.fullName?.toLocaleLowerCase('tr-TR')).toBe('mustafa cem yılmaz');
  });

  // 4. Turkish Special Characters in Name
  it('4. preserves Turkish special characters in multi-part names', () => {
    const text = `Gülfem Şaylan Çelik\nİstanbul / Sarıyer\nİnsan Kaynakları Müdürü\n\nDENEYİM\nUnilever 2018 - 2024\nHR Manager`;
    const res = extractDeterministicCv(text);
    expect(res.fullName).toBe('Gülfem Şaylan Çelik');
  });

  // 5. Professional Titles before Name (Av., Dr., Şef, Müh.)
  it('5. handles professional title prefixes like Av., Dr., Şef, Müh.', () => {
    const text1 = `Av. Gizem Korkmaz\nİstanbul / Beşiktaş\nKıdemli Avukat\n\nDENEYİM\nEsin Hukuk 2019 - 2024\nAssociate`;
    const res1 = extractDeterministicCv(text1);
    expect(res1.fullName).toBe('Gizem Korkmaz');

    const text2 = `Dr. Mehmet Ali Kaya\nAnkara / Çankaya\nKlinik Araştırma Lideri`;
    const res2 = extractDeterministicCv(text2);
    expect(res2.fullName).toBe('Mehmet Ali Kaya');

    const text3 = `Şef Volkan Aydın\nİstanbul / Beşiktaş\nExecutive Chef`;
    const res3 = extractDeterministicCv(text3);
    expect(res3.fullName).toBe('Volkan Aydın');
  });

  // 6. Explicit Name Label (İsim:, Ad Soyad:, Full Name:)
  it('6. extracts name when preceded by explicit labels', () => {
    const text1 = `KİŞİSEL BİLGİLER\nAd Soyad: İpek Nur Çağlar\nDoğum Tarihi: 14.05.1994\nCinsiyet: Kadın\nŞehir: Bursa / Nilüfer`;
    const res1 = extractDeterministicCv(text1);
    expect(res1.fullName).toBe('İpek Nur Çağlar');
    expect(res1.birthDate).toBe('1994-05-14');
    expect(res1.gender).toBe('Kadın');

    const text2 = `CURRICULUM VITAE\nFull Name: Johnathan Doe\nLocation: London`;
    const res2 = extractDeterministicCv(text2);
    expect(res2.fullName).toBe('Johnathan Doe');
  });

  // 7. Homonym Disambiguation (Person Name = District/City Name)
  it('7. disambiguates names that are also Turkish city or district names (Fatih, Kartal, Aydın)', () => {
    const text1 = `Fatih Çelik\nİstanbul / Beşiktaş\nYazılım Mühendisi`;
    const res1 = extractDeterministicCv(text1);
    expect(res1.fullName).toBe('Fatih Çelik');
    expect(res1.locations).toContain('Beşiktaş');

    const text2 = `Aydın Korkmaz\nAnkara / Çankaya\nMali İşler Uzmanı`;
    const res2 = extractDeterministicCv(text2);
    expect(res2.fullName).toBe('Aydın Korkmaz');
    expect(res2.locations).toContain('Ankara');

    const text3 = `Kartal Kaya\nBursa / Nilüfer\nEndüstri Mühendisi`;
    const res3 = extractDeterministicCv(text3);
    expect(res3.fullName).toBe('Kartal Kaya');
    expect(res3.locations).toContain('Bursa');
  });

  // 8. Pipe / Dash Separated Header Line (e.g. "Mustafa Yılmaz | İstanbul / Kadıköy")
  it('8. extracts name when line contains pipe or dash separated details', () => {
    const text = `Mustafa Yılmaz | İstanbul / Kadıköy | 0533 123 45 67\nKıdemli Veri Analisti\n\nDENEYİM\nGetir 2021 - 2024\nData Analyst`;
    const res = extractDeterministicCv(text);
    expect(res.fullName).toBe('Mustafa Yılmaz');
    expect(res.locations).toContain('İstanbul');
    expect(res.locations).toContain('Kadıköy');
  });

  // 9. ZERO HALLUCINATION: Gender MUST be empty if not explicitly stated in CV
  it('9. strictly avoids guessing gender from first names when gender is not in CV', () => {
    const maleText = `Ahmet Can Demir\nİstanbul\nYazılım Geliştirici\n\nDENEYİM\nTrendyol 2020 - 2024\nDeveloper`;
    const maleRes = extractDeterministicCv(maleText);
    expect(maleRes.gender).toBeUndefined(); // Zero hallucination!

    const femaleText = `Ayşe Fatma Yılmaz\nAnkara\nİnsan Kaynakları Uzmanı`;
    const femaleRes = extractDeterministicCv(femaleText);
    expect(femaleRes.gender).toBeUndefined(); // Zero hallucination!

    // But if explicitly declared, it must be captured:
    const explicitFemale = `Ayşe Fatma Yılmaz\nCinsiyet: Kadın\nAnkara`;
    const expRes = extractDeterministicCv(explicitFemale);
    expect(expRes.gender).toBe('Kadın');
  });

  // 10. ZERO HALLUCINATION: Birth Date MUST be empty if no birth keywords exist
  it('10. strictly avoids guessing birth date from job/education dates', () => {
    const text = `Burak Demir\nİstanbul / Sarıyer\nYazılım Mühendisi\n\nDENEYİM\nSofttech 2016 - 2024\nSenior QA\n\nEĞİTİM\nİTÜ 2012 - 2016`;
    const res = extractDeterministicCv(text);
    expect(res.birthDate).toBeUndefined(); // Must not grab 2016 or 2012 as birthDate!

    // But if explicitly stated:
    const textWithDob = `Burak Demir\nDoğum Tarihi: 24.04.1992\nİstanbul / Sarıyer`;
    const resWithDob = extractDeterministicCv(textWithDob);
    expect(resWithDob.birthDate).toBe('1992-04-24');
  });

  // 11. Contact Info Extraction (Email, Phone, LinkedIn, Website, Nationality, Address)
  it('11. extracts all present contact and identity fields without hallucinating missing ones', () => {
    const fullText = `Selin Demirtaş\nİstanbul / Beşiktaş\nUyruk: T.C.\nAdres: Dikilitaş Mah. Barış Sok. No: 12 Beşiktaş\nE-posta: selin.demirtas@example.com\nTelefon: 0542 987 65 43\nLinkedIn: linkedin.com/in/selindemirtas\nWeb: github.com/selindemirtas\n\nDENEYİM\nYapı Kredi 2020 - 2024\nHazine Uzmanı`;
    const res = extractDeterministicCv(fullText);

    expect(res.fullName).toBe('Selin Demirtaş');
    expect(res.nationality).toBe('T.C.');
    expect(res.address).toContain('Dikilitaş Mah');
    expect(res.email).toBe('selin.demirtas@example.com');
    expect(res.phone).toBe('0542 987 65 43');
    expect(res.linkedin).toContain('selindemirtas');
    expect(res.website).toContain('github.com/selindemirtas');
  });

  // 12. Negative Disambiguation: Entities, Universities, Sections MUST NOT be extracted as name
  it('12. ensures companies, universities, section headers and roles are never extracted as person name', () => {
    const demo1 = extractUniversalDemographics(`EĞİTİM\nİstanbul Teknik Üniversitesi\nBilgisayar Mühendisliği 2020\n\nİŞ DENEYİMİ\nTrendyol A.Ş. 2021 - 2024`);
    expect(demo1.fullName).not.toBe('İstanbul Teknik Üniversitesi');
    expect(demo1.fullName).not.toBe('Trendyol A.Ş.');
    expect(demo1.fullName).not.toBe('İŞ DENEYİMİ');
    expect(demo1.fullName).not.toBe('EĞİTİM');
  });

  // 13. End-to-End Pipeline & Form Hydration (Zero-Data-Loss for Full Name)
  it('13. verifies that fullName is preserved through entire pipeline into CareerProfileFormValues and CustomFields', async () => {
    const rawLines = [
      'Gülfem Şaylan',
      'İstanbul / Kadıköy',
      'Kıdemli Yazılım Geliştirici',
      'E-posta: gulfem.saylan@example.com',
      'Telefon: 0532 999 88 77',
      'İŞ DENEYİMİ',
      'Trendyol Tech 2021 - 2024',
      'Senior Developer',
      '* Mikroservis mimarileri geliştirildi.',
      'EĞİTİM',
      'Boğaziçi Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2020',
      'YETKİNLİKLER: React, Node.js, TypeScript, Go',
      'DİLLER: İngilizce (İleri / C1)',
    ];

    const pdfBuffer = createMockPdf(rawLines);

    // 1. Process CV Buffer
    const draft = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'gulfem_saylan_cv.pdf',
      mimeType: 'application/pdf',
    });

    const values = draft.formValues as CareerProfileFormValues;

    // 2. Validate Full Name in Form Values
    expect(values.fullName).toBe('Gülfem Şaylan');
    expect(values.city).toBe('İstanbul');
    expect(values.residenceDistrict).toBe('Kadıköy');
    expect(values.role).toBe('Yazılım Geliştirici');
    expect(values.sector).toBe('Bilişim / Yazılım');

    // 3. Serialize to Database CustomFields
    const customFields = formValuesToCustomFields('seek', values);
    expect(customFields.fullName).toBe('Gülfem Şaylan');

    // 4. Reload from DB / Storage
    const reloaded = valuesFromCareerSource({
      city: 'İstanbul',
      location: 'İstanbul',
      customFields,
    });

    expect(reloaded.fullName).toBe('Gülfem Şaylan');
    expect(reloaded.role).toBe('Yazılım Geliştirici');
    expect(reloaded.experiences?.length).toBe(1);
    expect(reloaded.experiences?.[0].company).toBe('Trendyol Tech');
  });

  // 14. DOCX Full Name & Personal Information Extraction
  it('14. verifies DOCX document XML extraction for full name and personal fields', async () => {
    const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:t>Özgeçmiş - Selin Demirtaş</w:t></w:p>
    <w:p><w:t>İstanbul / Beşiktaş | selin@example.com | 0533 222 11 00</w:t></w:p>
    <w:p><w:t>Hazine Operasyonları Uzmanı</w:t></w:p>
    <w:p><w:t>İŞ DENEYİMİ</w:t></w:p>
    <w:p><w:t>Yapı Kredi 2020 - 2024</w:t></w:p>
    <w:p><w:t>Hazine Uzmanı</w:t></w:p>
    <w:p><w:t>• Likidite ve fon yönetimi operasyonları.</w:t></w:p>
  </w:body>
</w:document>`;

    const docxBuffer = createMockDocx(docxXml);
    const draft = await cvService.processCvBuffer({
      buffer: docxBuffer,
      fileName: 'selin_demirtas.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const values = draft.formValues as CareerProfileFormValues;
    expect(values.fullName).toBe('Selin Demirtaş');
    expect(values.city).toBe('İstanbul');
    expect(values.residenceDistrict).toBe('Beşiktaş');
  });

  // 15. 15 PDF CV Acceptance Matrix
  describe('15 PDF CV Format & Layout Acceptance Matrix', () => {
    const pdfCandidates = [
      { name: 'Emre Kaan Yıldırım', city: 'Ankara', dist: 'Çankaya', role: 'Avukat', sec: 'Hukuk', exp: 'Esin Hukuk', gender: undefined, dob: undefined },
      { name: 'Duygu Şahin', city: 'İstanbul', dist: 'Kadıköy', role: 'Pazarlama Uzmanı', sec: 'Pazarlama', exp: 'Unilever', gender: 'Kadın', dob: '1995-06-12' },
      { name: 'Kerem Alper Çelik', city: 'İzmir', dist: 'Bornova', role: 'Yazılım Geliştirici', sec: 'Bilişim / Yazılım', exp: 'Ege Tech', gender: undefined, dob: undefined },
      { name: 'Merve Nur Aydın', city: 'Bursa', dist: 'Nilüfer', role: 'İnsan Kaynakları Uzmanı', sec: 'İnsan Kaynakları', exp: 'Bosch', gender: undefined, dob: undefined },
      { name: 'Oğuzhan Koç', city: 'Antalya', dist: 'Muratpaşa', role: 'Şef / Aşçı', sec: 'Turizm / Otelcilik', exp: 'Rixos', gender: 'Erkek', dob: undefined },
      { name: 'Zeynep Ece Kara', city: 'Eskişehir', dist: 'Tepebaşı', role: 'Mimar', sec: 'Mimarlık', exp: 'Tasarım Ofisi', gender: undefined, dob: '1996-03-24' },
      { name: 'Alperen Barış Güler', city: 'Kocaeli', dist: 'Gebze', role: 'Makine Mühendisi', sec: 'Üretim / Endüstriyel', exp: 'Ford Otosan', gender: undefined, dob: undefined },
      { name: 'Hilal Melis Doğan', city: 'İstanbul', dist: 'Beşiktaş', role: 'Grafik Tasarımcı', sec: 'Tasarım / Yaratıcı', exp: 'Ajans 360', gender: undefined, dob: undefined },
      { name: 'Tolga Serkan Tekin', city: 'Ankara', dist: 'Yenimahalle', role: 'Siber Güvenlik Uzmanı', sec: 'Bilişim / Yazılım', exp: 'Havelsan', gender: undefined, dob: undefined },
      { name: 'Burcu Ezgi Aksoy', city: 'İzmir', dist: 'Konak', role: 'Banka Şube Müdürü', sec: 'Finans / Bankacılık', exp: 'İş Bankası', gender: undefined, dob: '1988-11-05' },
      { name: 'Canberk Eren Yalçın', city: 'Adana', dist: 'Seyhan', role: 'Ziraat Mühendisi', sec: 'Tarım / Hayvancılık', exp: 'Tarım A.Ş.', gender: undefined, dob: undefined },
      { name: 'Büşra Damla Polat', city: 'Gaziantep', dist: 'Şehitkamil', role: 'Gıda Mühendisi', sec: 'Gıda', exp: 'Sanko Gıda', gender: undefined, dob: undefined },
      { name: 'Umut Mert Karaca', city: 'Mersin', dist: 'Yenişehir', role: 'Lojistik Operasyon Uzmanı', sec: 'Lojistik / Taşımacılık', exp: 'Arkas Lojistik', gender: undefined, dob: undefined },
      { name: 'Pınar Yasemin Çetin', city: 'Samsun', dist: 'Atakum', role: 'Eczacı', sec: 'Sağlık / Medikal', exp: 'Merkez Eczanesi', gender: undefined, dob: undefined },
      { name: 'Gökhan Koray Vural', city: 'Tekirdağ', dist: 'Çorlu', role: 'Kalite Güvence Mühendisi', sec: 'Kalite / Denetim', exp: 'Korozo', gender: undefined, dob: undefined },
    ];

    for (let i = 0; i < pdfCandidates.length; i++) {
      const c = pdfCandidates[i];
      it(`PDF ${i + 1}/15: extracts ${c.name} accurately from simulated PDF`, async () => {
        const lines = [
          c.name,
          `${c.city} / ${c.dist}`,
          c.role,
          ...(c.gender ? [`Cinsiyet: ${c.gender}`] : []),
          ...(c.dob ? [`Doğum Tarihi: ${c.dob}`] : []),
          'İŞ DENEYİMİ',
          `${c.exp} 2020 - 2024`,
          c.role,
          `* ${c.sec} alanında operasyon ve yönetim.`,
          'EĞİTİM',
          'Üniversite Mezunu 2019',
        ];

        const buffer = createMockPdf(lines);
        const draft = await cvService.processCvBuffer({
          buffer,
          fileName: `candidate_${i + 1}.pdf`,
          mimeType: 'application/pdf',
        });

        const fv = draft.formValues as CareerProfileFormValues;
        expect(fv.fullName).toBe(c.name);
        expect(fv.city).toBe(c.city);
        expect(fv.residenceDistrict).toBe(c.dist);
        if (c.gender) {
          expect(fv.profileGender).toBe(c.gender);
        } else {
          expect(fv.profileGender).toBeFalsy(); // Zero hallucination
        }
        if (c.dob) {
          expect(fv.birthDate).toBe(c.dob);
        } else {
          expect(fv.birthDate).toBeFalsy(); // Zero hallucination
        }
      });
    }
  });

  // 16. 15 DOCX CV Acceptance Matrix
  describe('16 DOCX CV Format & Layout Acceptance Matrix', () => {
    const docxCandidates = [
      { name: 'Cemre İlayda Aslan', city: 'İstanbul', dist: 'Sarıyer', role: 'Finansal Analist', sec: 'Finans / Bankacılık', exp: 'Akbank', gender: undefined, dob: undefined },
      { name: 'Tarik Samet Erdem', city: 'Ankara', dist: 'Gölbaşı', role: 'DevOps Mühendisi', sec: 'Bilişim / Yazılım', exp: 'Aselsan', gender: undefined, dob: undefined },
      { name: 'Neslihan Sevil Yavuz', city: 'İzmir', dist: 'Karşıyaka', role: 'Kurumsal İletişim Uzmanı', sec: 'Pazarlama', exp: 'Yaşar Holding', gender: 'Kadın', dob: undefined },
      { name: 'Yiğit Bora Sönmez', city: 'Bursa', dist: 'Osmangazi', role: 'Otomotiv Mühendisi', sec: 'Otomotiv', exp: 'Tofaş', gender: undefined, dob: undefined },
      { name: 'Dilek Songül Çakır', city: 'Antalya', dist: 'Konyaaltı', role: 'Ön Büro Müdürü', sec: 'Turizm / Otelcilik', exp: 'Hilton', gender: undefined, dob: '1992-07-18' },
      { name: 'Furkan Eray Öztürk', city: 'Kocaeli', dist: 'İzmit', role: 'Kimya Mühendisi', sec: 'Kimya', exp: 'Tüpraş', gender: undefined, dob: undefined },
      { name: 'Beyza Nur Taşkın', city: 'İstanbul', dist: 'Ümraniye', role: 'Veri Bilimci', sec: 'Bilişim / Yazılım', exp: 'Hepsiburada', gender: undefined, dob: undefined },
      { name: 'Eren Berk Yıldız', city: 'Trabzon', dist: 'Ortahisar', role: 'İnşaat Mühendisi', sec: 'İnşaat / Gayrimenkul', exp: 'Hekimoğlu İnşaat', gender: undefined, dob: undefined },
      { name: 'Hande Asuman Koçak', city: 'Manisa', dist: 'Yunusemre', role: 'Endüstri Mühendisi', sec: 'Üretim / Endüstriyel', exp: 'Vestel', gender: undefined, dob: undefined },
      { name: 'Sinan Tayfun Meriç', city: 'Denizli', dist: 'Pamukkale', role: 'Tekstil Mühendisi', sec: 'Tekstil / Konfeksiyon', exp: 'Menderes Tekstil', gender: undefined, dob: undefined },
      { name: 'Melis Cansu Güneş', city: 'Muğla', dist: 'Bodrum', role: 'Restoran Müdürü', sec: 'Restoran / Yiyecek / İçecek', exp: 'Lucca', gender: undefined, dob: undefined },
      { name: 'Arda Koray Şimşek', city: 'Sakarya', dist: 'Serdivan', role: 'Mobil Uygulama Geliştirici', sec: 'Bilişim / Yazılım', exp: 'Toyota Tech', gender: undefined, dob: undefined },
      { name: 'Mine Sinem Bulut', city: 'Balıkesir', dist: 'Karesi', role: 'Veteriner Hekim', sec: 'Sağlık / Medikal', exp: 'Karesi Vet', gender: undefined, dob: undefined },
      { name: 'Enes Anıl Keskin', city: 'Konya', dist: 'Selçuklu', role: 'Satış Danışmanı', sec: 'Perakende / Mağazacılık', exp: 'Borusan', gender: undefined, dob: undefined },
      { name: 'Hülya Melisa Varol', city: 'Çanakkale', dist: 'Merkez', role: 'Çevre Mühendisi', sec: 'Çevre / Enerji', exp: 'İçdaş', gender: undefined, dob: undefined },
    ];

    for (let i = 0; i < docxCandidates.length; i++) {
      const c = docxCandidates[i];
      it(`DOCX ${i + 1}/15: extracts ${c.name} accurately from simulated DOCX XML`, async () => {
        const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:t>${c.name}</w:t></w:p>
    <w:p><w:t>${c.city} / ${c.dist} | ${c.role}</w:t></w:p>
    ${c.gender ? `<w:p><w:t>Cinsiyet: ${c.gender}</w:t></w:p>` : ''}
    ${c.dob ? `<w:p><w:t>Doğum Tarihi: ${c.dob}</w:t></w:p>` : ''}
    <w:p><w:t>İŞ DENEYİMİ</w:t></w:p>
    <w:p><w:t>${c.exp} 2019 - 2024</w:t></w:p>
    <w:p><w:t>${c.role}</w:t></w:p>
  </w:body>
</w:document>`;

        const buffer = createMockDocx(docxXml);
        const draft = await cvService.processCvBuffer({
          buffer,
          fileName: `candidate_${i + 1}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const fv = draft.formValues as CareerProfileFormValues;
        expect(fv.fullName).toBe(c.name);
        expect(fv.city).toBe(c.city);
        expect(fv.residenceDistrict).toBe(c.dist);
        if (c.gender) {
          expect(fv.profileGender).toBe(c.gender);
        } else {
          expect(fv.profileGender).toBeFalsy(); // Zero hallucination
        }
        if (c.dob) {
          expect(fv.birthDate).toBe(c.dob);
        } else {
          expect(fv.birthDate).toBeFalsy(); // Zero hallucination
        }
      });
    }
  });

  // 17. 15 TXT CV Acceptance Matrix
  describe('17 TXT CV Format & Layout Acceptance Matrix', () => {
    const txtCandidates = [
      { name: 'Gülfem Şaylan', city: 'İstanbul', dist: 'Kadıköy', email: 'gulfem@example.com', phone: '0532 111 22 33' },
      { name: 'Uğur Zaman', city: 'İzmir', dist: 'Urla', email: 'ugur@example.com', phone: '0533 222 33 44' },
      { name: 'Burak Batıl Özdemir', city: 'İstanbul', dist: 'Beşiktaş', email: 'burak@example.com', phone: '0534 333 44 55' },
      { name: 'Rukiye Gürsoy', city: 'Ankara', dist: 'Çankaya', email: 'rukiye@example.com', phone: '0535 444 55 66' },
      { name: 'Meryem Ekşi', city: 'Trabzon', dist: 'Ortahisar', email: 'meryem@example.com', phone: '0536 555 66 77' },
      { name: 'Ahmet Can Demir', city: 'Bursa', dist: 'Nilüfer', email: 'ahmet@example.com', phone: '0537 666 77 88' },
      { name: 'Ayşe Fatma Yılmaz', city: 'Antalya', dist: 'Muratpaşa', email: 'ayse@example.com', phone: '0538 777 88 99' },
      { name: 'Mustafa Kemal Çelik', city: 'Eskişehir', dist: 'Odunpazarı', email: 'mustafa@example.com', phone: '0539 888 99 00' },
      { name: 'Selin Ece Aktaş', city: 'Kocaeli', dist: 'Gebze', email: 'selin@example.com', phone: '0530 123 45 67' },
      { name: 'Dorukhan Alp Tan', city: 'Mersin', dist: 'Mezitli', email: 'dorukhan@example.com', phone: '0531 234 56 78' },
      { name: 'Zeynep Hilal Şimşek', city: 'Gaziantep', dist: 'Şahinbey', email: 'zeynep@example.com', phone: '0541 345 67 89' },
      { name: 'Kaan Volkan Ergün', city: 'Kayseri', dist: 'Melikgazi', email: 'kaan@example.com', phone: '0542 456 78 90' },
      { name: 'Ebru Gamze Dural', city: 'Samsun', dist: 'İlkadım', email: 'ebru@example.com', phone: '0543 567 89 01' },
      { name: 'Mert Onur Dinçer', city: 'Aydın', dist: 'Efeler', email: 'mert@example.com', phone: '0544 678 90 12' },
      { name: 'Gizem Damla Bozkurt', city: 'Muğla', dist: 'Fethiye', email: 'gizem@example.com', phone: '0545 789 01 23' },
    ];

    for (let i = 0; i < txtCandidates.length; i++) {
      const c = txtCandidates[i];
      it(`TXT ${i + 1}/15: extracts ${c.name} accurately from plain text CV`, async () => {
        const text = `${c.name}\n${c.city} / ${c.dist}\nE-posta: ${c.email} | Tel: ${c.phone}\nKıdemli Uzman\n\nDENEYİM\nKurumsal A.Ş. 2019 - 2024\nUzman`;
        const res = extractDeterministicCv(text);

        expect(res.fullName).toBe(c.name);
        expect(res.locations).toContain(c.city);
        expect(res.locations).toContain(c.dist);
        expect(res.email).toBe(c.email);
        expect(res.phone).toBe(c.phone);
        expect(res.gender).toBeUndefined(); // Zero hallucination
        expect(res.birthDate).toBeUndefined(); // Zero hallucination
      });
    }
  });
});
