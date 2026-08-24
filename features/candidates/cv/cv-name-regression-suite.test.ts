import { describe, expect, it } from 'vitest';
import {
  extractCandidateName,
  isForbiddenNameCandidate,
  formatTurkishTitleCase,
} from './cv-name-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { extractUniversalDemographics } from './cv-universal-normalizer';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';

describe('CV Name Extraction & Form Hydration Comprehensive Regression Suite', () => {
  // TEST 1: CV: KİŞİSEL BİLGİLER \n Uğur Zaman
  it('TEST 1: extracts "Uğur Zaman" under KİŞİSEL BİLGİLER', () => {
    const cvText = `KİŞİSEL BİLGİLER\nUğur Zaman\n0532 000 00 00\nugur@example.com\nİstanbul / Maltepe`;
    const name = extractCandidateName(cvText);
    expect(name).toBe('Uğur Zaman');

    const demo = extractUniversalDemographics(cvText);
    expect(demo.fullName).toBe('Uğur Zaman');
  });

  // TEST 2: CV: KİŞİSEL BİLGİLER \n Uğur Zaman \n EĞİTİM
  it('TEST 2: extracts "Uğur Zaman" even when followed immediately by EĞİTİM', () => {
    const cvText = `KİŞİSEL BİLGİLER\nUğur Zaman\nEĞİTİM\nAnadolu Üniversitesi İşletme Fakültesi\n\nİŞ DENEYİMLERİ\nABC Holding Çağrı Merkezi Müdürü`;
    const name = extractCandidateName(cvText);
    expect(name).toBe('Uğur Zaman');

    const det = extractDeterministicCv(cvText);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur_cv.pdf');

    expect(draft.formValues.fullName).toBe('Uğur Zaman');
  });

  // TEST 3: CV without a name candidate -> fullName === "" or null
  it('TEST 3: returns empty fullName when CV does not contain a person name', () => {
    const headlessCv = `EĞİTİM\nİstanbul Teknik Üniversitesi\nBilgisayar Mühendisliği 2020\n\nİŞ DENEYİMİ\nTrendyol A.Ş. 2021 - 2024`;
    const name = extractCandidateName(headlessCv);
    expect(name).toBeNull();

    const det = extractDeterministicCv(headlessCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'headless.pdf');

    expect(draft.formValues.fullName).toBe('');
  });

  // TEST 4: "Eğitim" and section headings can NEVER be fullName
  it('TEST 4: strictly rejects "Eğitim" and all section heading variants as name', () => {
    const invalidCandidates = [
      'Eğitim',
      'EĞİTİM',
      ' eğitim ',
      'Eğitim\n',
      'Eğitim ve Gelişim',
      'EĞİTİM VE GELİŞİM',
      'Eğitim Bilgileri',
      'Eğitim Durumu',
      'Eğitim Geçmişi',
      'Öğrenim',
      'Öğrenim Durumu',
      'Deneyimler',
      'Deneyimlerim',
      'İş Deneyimleri',
      'İş Deneyimi',
      'Uzmanlık Alanları',
      'Uzmanlıkların',
      'Çalışma Tercihleri',
      'Kariyer Özeti',
      'Genel Bilgiler',
      'Kişisel Bilgiler',
      'Kişisel Bilgilerim',
      'İletişim Bilgileri',
      'Özgeçmiş',
      'Profil',
      'CV',
      'CV Özeti',
      'Sertifika',
      'Sertifikalar',
      'Sertifika / Dil',
      'Yetenekler',
      'Yetkinlikler',
      'Teknik Yetkinlikler',
      'Referanslar',
    ];

    for (const candidate of invalidCandidates) {
      expect(isForbiddenNameCandidate(candidate)).toBe(true);
      expect(extractCandidateName(candidate)).toBeNull();
    }
  });

  // TEST 5: "Uğur Zaman" normalizes cleanly
  it('TEST 5: preserves "Uğur Zaman" correctly with Turkish casing', () => {
    expect(formatTurkishTitleCase('UĞUR ZAMAN')).toBe('Uğur Zaman');
    expect(formatTurkishTitleCase('uğur zaman')).toBe('Uğur Zaman');
    expect(formatTurkishTitleCase('Uğur Zaman')).toBe('Uğur Zaman');
    expect(normalizeCvText('Uğur Zaman')).toBe('Uğur Zaman');
  });

  // TEST 6: Mojibake strings continue to be repaired
  it('TEST 6: repairs Turkish mojibake strings cleanly', () => {
    expect(normalizeCvText('SatÄ±ÅŸ')).toBe('Satış');
    expect(normalizeCvText('YÃ¶netim')).toBe('Yönetim');
    expect(normalizeCvText('Ã‡aÄŸrÄ±')).toBe('Çağrı');
    expect(normalizeCvText('MÃ¼ÅŸteri')).toBe('Müşteri');
    expect(normalizeCvText('Ä°letiÅŸim')).toBe('İletişim');
    expect(normalizeCvText('Ã–zgeÃ§miÅŸ')).toBe('Özgeçmiş');
  });

  // TEST 7: handleApplyCvDraft form state and customFields mapping
  it('TEST 7: maps "Uğur Zaman" into customFields without bleeding section headings', () => {
    const rawCv = `UĞUR ZAMAN\n0532 111 22 33\nugur@example.com\nİstanbul / Maltepe\n\nÖZGEÇMİŞ\n19 yıllık kurumsal çağrı merkezi ve telemarketing operasyonları yönetim deneyimi.\n\nEĞİTİM\nAnadolu Üniversitesi İşletme Lisans 2004\n\nİŞ DENEYİMLERİ\nABC Holding | Çağrı Merkezi Operasyonları Direktörü | 2020 - 2023\nSaha satış yönetimi ve telemarketing operasyonlarının koordinasyonu.`;

    const det = extractDeterministicCv(rawCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur_cv.pdf');

    expect(draft.formValues.fullName).toBe('Uğur Zaman');
    expect(draft.formValues.fullName).not.toBe('Eğitim');

    const customFields = formValuesToCustomFields('seek', draft.formValues);
    expect(customFields.fullName).toBe('Uğur Zaman');
    expect(customFields.fullName).not.toBe('Eğitim');

    const hydrated = valuesFromCareerSource({
      city: 'İstanbul',
      location: 'İstanbul',
      customFields,
    });

    expect(hydrated.fullName).toBe('Uğur Zaman');
    expect(hydrated.fullName).not.toBe('Eğitim');
  });

  // TEST 8: UI safe preview input mapping
  it('TEST 8: feeds "Uğur Zaman" to CareerProfilePreview input and never "Eğitim"', () => {
    const customFields = formValuesToCustomFields('seek', {
      fullName: 'Uğur Zaman',
      role: 'Çağrı Merkezi Operasyonları Direktörü',
      sector: 'Finans',
      experienceLevel: 'Direktör',
    });

    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: { city: 'İstanbul', location: 'İstanbul', customFields },
      displayName: customFields.fullName as string,
    });

    expect(preview.displayNameMasked).toBe('Uğur *****');
    expect(preview.displayNameMasked).not.toContain('Eğitim');
  });

  // TEST 9: Other imported CV fields remain completely intact
  it('TEST 9: preserves all other CV fields (desiredRole, sector, level, location, experiences, education, skills, certs)', () => {
    const fullCv = `UĞUR ZAMAN\n0532 111 22 33\nugur@example.com\nİstanbul / Maltepe\n\nKARİYER ÖZETİ\n19 yıllık çağrı merkezi ve telemarketing operasyonları yönetim deneyimi.\n\nUZMANLIK ALANLARI\nSatış Yönetimi, Telemarketing, Ekip Liderliği, CRM, Excel, PowerBI\n\nSERTİFİKALAR\nSEGEM, BES, İleri Satış Teknikleri\n\nEĞİTİM\nMarmara Üniversitesi İşletme Lisans 2004\n\nİŞ DENEYİMLERİ\nABC Holding | Çağrı Merkezi Operasyonları Direktörü | 2020 - Halen\nSaha satış ve operasyon yönetimi.`;

    const det = extractDeterministicCv(fullCv);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'full_cv.pdf');

    expect(draft.formValues.fullName).toBe('Uğur Zaman');
    expect(draft.formValues.desiredRole).toBe('Çağrı Merkezi Operasyonları Direktörü');
    expect(draft.formValues.primarySector).toBeTruthy();
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Maltepe');
    expect(draft.formValues.experiences?.length).toBeGreaterThan(0);
    expect(draft.formValues.educationHistory?.length).toBeGreaterThan(0);
  });

  // TEST 10: Messy / unlabelled / inline multi-column header
  it('TEST 10: extracts "Uğur Zaman" from messy unlabelled text containing contact info inline', () => {
    const messyText = `Kişisel Bilgiler\nzamanugurz@gmail.com\n5309367745\nMaltepe, İSTANBUL, Türkiye\nUğur Zaman\nEğitim\nBeceriler\nSatış Yönetimi - Uzman`;
    const name = extractCandidateName(messyText);
    expect(name).toBe('Uğur Zaman');
  });

  // TEST 11: Real-world PDF string with UĞUR ZAMAN
  it('TEST 11: extracts "Uğur Zaman" from real PDF text format without explicit label', () => {
    const pdfText = `UĞUR ZAMAN\nzamanugurz@gmail.com | 0530 936 77 45 | Maltepe / İstanbul\nÇağrı Merkezi Operasyon Müdürü\n19 yıllık kurumsal çağrı merkezi deneyimi.`;
    const name = extractCandidateName(pdfText);
    expect(name).toBe('Uğur Zaman');
  });

  // TEST 12: Compound Turkish names (e.g. Mehmet Ali Yılmaz, Ahmet Burak Demir)
  it('TEST 12: extracts compound Turkish given names via sliding window scanner', () => {
    const text1 = `mehmet.ali.yilmaz@gmail.com 05551112233 Mehmet Ali Yılmaz Yazılım Geliştirici`;
    expect(extractCandidateName(text1)).toBe('Mehmet Ali Yılmaz');

    const text2 = `burak.batil@example.com Burak Batıl Bilgisayar Mühendisi`;
    expect(extractCandidateName(text2)).toBe('Burak Batıl');

    const text3 = `gizem.saylan@example.com Gizem Saylan İnsan Kaynakları`;
    expect(extractCandidateName(text3)).toBe('Gizem Saylan');
  });

  // TEST 13: İzgi Zaman real CV format with CMC Turkey and zero education-bleed fake jobs
  it('TEST 13: extracts İzgi Zaman CV with 100% accuracy and ZERO education-bleed fake jobs', () => {
    const izgiText = `ÖZET
Çağrı Merkezi sektöründe 6 yıldır görev yapmaktayım. Bu süreç içerisinde birçok firma ile çalışma 
fırsatım oldu. Türkiye’nin önde gelen parakende ve finans firmalarında operasyon yöneticisi olarak 
görev yaptım. Inbound ve Sosyal Medya operasyon yönetimi, proje kurulum ve geliştirilmesi, bütçe 
yönetimi, müşteri ilişkileri yönetimi konusunda birçok deneyime sahip oldum.

İŞ DENEYİMLERİ
CMC TURKEY- OPERASYON YÖNETİCİSİ
2017-12 -
CMC TURKEY- SOSYAL MEDYA TAKIM LİDERİ
2014-12 - 2017-11
• Inbound Operasyon Yönetimi
• Bütçe Yönetimi(Ciro, Karlılık)
• Performans Yönetim ve Takibi
• Raporlama ve Analiz
• Vardiya Yönetimi, Planlama ve Raporlama

İZGİ ZAMAN
Operasyon Yöneticisi
İstanbul, Maltepe | 0530-941-2060 | izgiozseyhan@gmail.com

İSTANBUL ÜNİVERSİTESİ ESKİ YUNAN DİLİ VE EDEBİYATI
2010 - TERK
İSTANBUL ÜNİVERSİTESİ FELSEFE
2017 - DEVAM
EĞİTİM

SERTİFİKA
KOÇVARİ LİDERLİK: IMMIP, 2017

YETENEK
GENESYS Mİ4BİZ ALOTECH MONİTERA ORACLE RİGHTNOW BOOMSONAR`;

    const det = extractDeterministicCv(izgiText, '_zgi.CV (1).pdf');
    expect(det.fullName).toBe('İzgi Zaman');
    expect(det.email).toBe('izgiozseyhan@gmail.com');
    expect(det.phone).toBe('0530-941-2060');
    expect(det.locations).toContain('İstanbul');
    expect(det.locations).toContain('Maltepe');

    console.log('IZGI EXPERIENCES:', JSON.stringify(det.experiences, null, 2));
    expect(det.experiences.length).toBeGreaterThanOrEqual(1);
    for (const exp of det.experiences) {
      expect((exp.company || '').toLowerCase()).not.toContain('terk');
      expect((exp.company || '').toLowerCase()).not.toContain('universite');
      expect((exp.role || '').toLowerCase()).not.toContain('felsefe');
    }

    // Tools & Skills
    expect(det.tools).toContain('Genesys');
    expect(det.tools).toContain('Mi4Biz');
    expect(det.tools).toContain('AloTech');

    // Canonical mapping
    const canonical = mapCvToCanonicalTaxonomy(det);
    expect(canonical.fullName).toBe('İzgi Zaman');
    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.residenceDistrict).toBe('Maltepe');
  });

  // TEST 14: Rukiye Gürsoy Kariyer.net CV format
  it('TEST 14: extracts Rukiye Gürsoy Kariyer.net CV with 100% accuracy and correct demographics', () => {
    const rukiyeText = `Rukiye Gürsoy
+90 (535) 206 21 48
rukiyegursoytr@gmail.com
1995 (29 Yaş)
İstanbul(Asya) , Çekmeköy
Özel Bilgiler
Cinsiyet
Kadın
Vatandaşlık
Türkiye Cumhuriyeti
Sürücü Belgesi
Yok

Özgeçmiş Özeti
2013 yılında başlamış olduğum iş hayatıma doğru, yenilikçi, öncü, firmalarlarla büyümek ve ilerlemek.

İş Deneyimleri
Çağrı Merkezi Elemanı
Özel Medicana Hospitals Çamlıca | Ekim 2022 - Hala çalışıyorum
Sürekli / Tam zamanlı
Sağlık Sektörü, Pazarlama Departmanı
Medicana Hastaneler Grubun da ameliyat hastalarının satış, ameliyat ve takip süreçleri...

Üretim Elemanı
Altıparmak Gıda | Ekim 2019 - Ekim 2021
Sürekli / Tam zamanlı
Gıda Sektörü, Üretim / İmalat Departmanı

Mağaza Elemanı
A-101 Yeni Mağazacılık A.Ş | Mart 2015 - Ekim 2018
Sürekli / Tam zamanlı

Bilgi İşlem Elemanı
Happy Center | Ocak 2013 - Haziran 2015
Sürekli / Tam zamanlı

Eğitim Bilgileri
Ümraniye Anadolu İmam Hatip Lisesi
Anadolu İmam Hatip Lisesi, Açıköğretim Lisesi | Terk
Lise

Diller
İngilizce (Temel)

Yetenekler
Bilgisayar, Microsoft Office Programları, Bilgisayar Kullanımı`;

    const det = extractDeterministicCv(rukiyeText, 'rukiye_gursoy.pdf');
    expect(det.fullName).toBe('Rukiye Gürsoy');
    expect(det.gender).toBe('Kadın');
    expect(det.birthDate).toBe('1995-01-01');
    expect(det.email).toBe('rukiyegursoytr@gmail.com');
    expect(det.locations).toContain('İstanbul');
    expect(det.locations).toContain('Çekmeköy');

    const canonical = mapCvToCanonicalTaxonomy(det);
    expect(canonical.fullName).toBe('Rukiye Gürsoy');
    expect(canonical.gender).toBe('Kadın');
    expect(canonical.birthDate).toBe('1995-01-01');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.residenceDistrict).toBe('Çekmeköy');
  });
});
