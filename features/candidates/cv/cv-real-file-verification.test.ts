import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { extractCvText } from '@/features/candidates/cv/cv-text-extractor';
import { cvService } from '@/features/candidates/cv/cv.service';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import { scoreCareerDimensions, normalizeMatchScore } from '@/features/matching-engine/scoring';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';

describe('Real CV Binary File Final Acceptance Test - CV - UĞUR ZAMAN (4).pdf', () => {
  const realPdfPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  it('verifies the entire end-to-end pipeline with the actual binary file from disk', async () => {
    // 1. Read the actual binary PDF file from disk
    if (!fs.existsSync(realPdfPath)) {
      console.warn(`File not found at ${realPdfPath}, skipping local file test`);
      return;
    }
    const pdfBuffer = fs.readFileSync(realPdfPath);
    const txt = await extractCvText(pdfBuffer, 'CV - UĞUR ZAMAN (4).pdf');
    console.log('DIRECT EXTRACTED TEXT:\n', txt.text);

    // 2. Run universal pipeline: Text Extraction -> PII Masking -> Deterministic + AI -> Canonical Taxonomy -> Draft
    const draft = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
      documentId: 'doc-real-ugur-zaman',
    });

    console.log('UGUR EXTRACTED TEXT:\n', txt.text);
    console.log('UGUR EXPS:', JSON.stringify(draft.formValues.experiences, null, 2));

    // 3. Minimum Acceptance Criteria Assertions
    // Position
    expect(draft.formValues.role).toBeTruthy();
    expect(draft.formValues.role).not.toBe('Pozisyon belirtilmedi');
    expect(draft.formValues.role).toMatch(/Çağrı Merkezi|Operasyon|Satış|Direktör|Müdür/i);

    // Experiences (Must be 6)
    expect(draft.formValues.experiences).toBeDefined();
    expect(draft.formValues.experiences!.length).toBeGreaterThanOrEqual(6);
    expect(draft.categoriesFound.experiences).toBeGreaterThanOrEqual(6);

    // Verify Experience fields
    const exps = draft.formValues.experiences!;
    expect(exps.length).toBeGreaterThanOrEqual(6);
    expect(exps.every((e) => Boolean(e.role))).toBe(true);

    // Skills (Must be >= 6)
    const profSkills = (draft.formValues.professionalSkillsList || []).concat(
      draft.formValues.professionalSkills ? draft.formValues.professionalSkills.split(',').map((s) => s.trim()) : [],
    );
    console.log('PROF SKILLS:', profSkills);
    expect(profSkills.length).toBeGreaterThanOrEqual(6);
    expect(profSkills.some((s) => /Satış Yönetimi/i.test(s))).toBe(true);
    expect(profSkills.some((s) => /Operasyon Yönetimi/i.test(s))).toBe(true);
    expect(profSkills.some((s) => /Çağrı Merkezi/i.test(s))).toBe(true);

    // Education (Yüksek lisans as highest level, preserving fields)
    expect(draft.formValues.educationLevel).toBe('Yüksek lisans');
    expect(draft.formValues.educationField).toBeTruthy();
    expect(draft.formValues.educationField).toMatch(/Sermaye Piyasası|Kamu Yönetimi/i);

    // Location (Residence: İstanbul, preferences clean)
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.preferredDistrict).toBe('');
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.availability).toBe('');

    // Career Summary (Must be populated and grounded)
    expect(draft.formValues.candidateTraits).toBeTruthy();
    expect(draft.formValues.candidateTraits).toContain('19 yıl');

    // 4. Persistence Simulation (Save -> Reload)
    const ownerId = ids.user('user-ugur-zaman-real');
    const repo = new MockListingRepository();
    const profileService = new CareerProfileService(repo);

    const profileListingId = ids.listing('profile-seek-ugur-zaman');
    const profileListing = createListing({
      id: profileListingId,
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: draft.formValues.role || 'Çağrı Merkezi Operasyon Müdürü',
      shortDescription: draft.formValues.candidateTraits || '19 yıllık kariyer özeti',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-01T00:00:00.000Z',
      customFields: {
        desiredRole: draft.formValues.role,
        primarySector: draft.formValues.sector,
        cvFileName: draft.formValues.cvFileName,
      },
    });
    repo.save(profileListing);

    // Save profile with confirmed values
    const saved = await profileService.saveProfile(ownerId, profileListingId, {
      role: draft.formValues.role || 'Çağrı Merkezi Operasyon Müdürü',
      sector: draft.formValues.sector || 'Çağrı merkezi',
      experienceLevel: draft.formValues.experienceLevel || '10+ Yıl Deneyim',
      educationLevel: draft.formValues.educationLevel || 'Yüksek Lisans',
      educationField: draft.formValues.educationField || 'Sermaye Piyasası ve Borsa',
      city: draft.formValues.city || 'İstanbul',
      residenceCity: draft.formValues.residenceCity || 'İstanbul',
      residenceDistrict: draft.formValues.residenceDistrict || '',
      preferredDistrict: draft.formValues.preferredDistrict || '',
      workType: draft.formValues.workType || 'Tam zamanlı',
      workplacePreference: draft.formValues.workplacePreference || 'Hibrit',
      availability: draft.formValues.availability || 'Hemen Başlayabilir',
      salaryMin: draft.formValues.salaryMin,
      salaryMax: draft.formValues.salaryMax,
      professionalSkills: draft.formValues.professionalSkills || '',
      professionalSkillsList: draft.formValues.professionalSkillsList,
      technicalSkills: draft.formValues.technicalSkills || '',
      technicalSkillsList: draft.formValues.technicalSkillsList,
      tools: draft.formValues.tools || '',
      toolsList: draft.formValues.toolsList,
      languages: draft.formValues.languages || '',
      certificates: draft.formValues.certificates || '',
      candidateTraits: draft.formValues.candidateTraits || '',
      experiences: draft.formValues.experiences,
      educationHistory: draft.formValues.educationHistory,
      cvFileName: draft.formValues.cvFileName,
      cvDocumentId: draft.formValues.cvDocumentId,
      cvUploadedAt: draft.formValues.cvUploadedAt,
    });
    expect(saved.values.role).toBe(draft.formValues.role);
    expect(saved.values.experiences?.length).toBeGreaterThanOrEqual(6);
  });

  it('verifies Ravza Mudak CV extraction', () => {
    const ravzaText = `
RAVZA MUDAK
Uzman Sigorta Danışmanı & Operasyon Uzmanı
Konum: Ümraniye / İstanbul Telefon: (531) 739 0862 E-Posta: ravzatuncc34@gmail.com
PROFIL & ÖNYAZI
Operasyon süreçleri, asistans hizmetleri ve sigortacılık alanında 5-6 yıllık
kurumsal tecrübeye sahibim. Sağlık, Kasko, Trafik, Konut ve Ferdi Kaza
sigortaları branşlarında derin uzmanlığa sahip olup; CRM, Office programları ve
veri analitiği araçlarını etkin şekilde kullanmaktayım. SAP ERP ve SPSS
modüllerine hakimim. Raporlama, hızlı aksiyon alma ve süreç takibi
konularındaki yetkinliklerimi yüksek iletişim becerileriyle birleştirerek müşteri
memnuniyeti ve operasyonel verimlilik odaklı çalışmaktayım. 
İŞ DENEYIMI
IGS ASİSTANS HİZMETLERİ Güncel
Asistans ve Operasyon Uzmanı
Asistans hizmetleri operasyonel süreçlerinin takibi, müşteri taleplerinin yönetimi, dosya
yönetimi ve hızlı aksiyon alarak çözüm odaklı hizmet sunulması. 
SİGORTAMBİR A.Ş 2025
Uzman Sigorta Danışmanı
Sağlık, Kasko, Trafik, Konut ve Ferdi Kaza sigorta ürünlerinde portföy yönetimi,
poliçeleştirme ve danışmanlık süreçlerinin yürütülmesi. 
SİGORTAMNET A.Ş 2023
Uzman Sigorta Danışmanı
Müşteri ihtiyaç analizi doğrultusunda en uygun sigorta tekliflerinin hazırlanması,
operasyonel süreçlerin takibi ve satış sonrası destek. 
TASARRUF A.Ş 2021
Çağrı Merkezi Müşteri Temsilcileri Kalite Eğitim Uzmanı
Gayrimenkul ve araç finansman katılım süreçlerinde çağrı merkezi ekibinin kalite
standartlarının denetlenmesi ve eğitim süreçlerinin yönetilmesi. 
STAJ DENEYIMLERI
Ümraniye Belediyesi - Sosyal Destek Birimi 2019 - 2020
Sosyal Hizmetler Kıdemli Stajyeri
Sosyal yardım taleplerinin değerlendirilmesi, saha incelemeleri ve operasyonel
raporlamalar. 
Özel Duygu Demeti Anaokulu 2017 - 2018
Okul Öncesi Stajyeri
EĞITIM
İstanbul Medipol Üniversitesi 2020
Sosyal Bilimler MYO / Sosyal Hizmetler
Halide Edip Mesleki ve Teknik Anadolu Lisesi 2018
Çocuk Gelişimi ve Eğitimi / Okul Öncesi
KIŞISEL BILGILER
T.C. Uyruk: Evet
Doğum Yeri: İstanbul
Doğum T.: 21.12.2000
Medeni Hal: Evli
PROGRAM & YETKINLIKLER
CRM Sistemleri İleri Düzey
MS Office Programları İleri Düzey
SPSS Analiz İleri Düzey
MS Windows İleri Düzey
SAP - ERP Temel/Orta
SERTIFIKA & BELGELER
SEGEM Lisans Belgesi
TSB - 2023
Mesleki Ruhsat
Etkili İletişim / Diksiyon / Beden Dili
Cem Öğretir - Rodos Grup (2018)
TÜBİTAK Araştırmacısı - Değerler Eğitimi
MEB Belge No: 213 (2018)
İş Sağlığı ve Güvenliği Eğitimi
İstanbul Medipol Üniv. (2019)
Sosyal Bilimler ve Kültür Akademisi
Ümraniye Belediyesi (2017)
REFERANSLAR 
Lingo City Dil Okulu / Kadıköy 2016
İngilizce Dil Eğitimi
`;
    const det = extractDeterministicCv(ravzaText);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ravza.pdf');

    expect(draft.formValues.experiences?.length).toBe(6);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Ümraniye');
    expect(draft.formValues.sector).toBe('Sigorta');
    expect(draft.formValues.role).toMatch(/Sigorta Danışmanı|Operasyon Uzmanı|Müşteri Hizmetleri/);
    expect(draft.formValues.tools).toContain('CRM');
    expect(draft.formValues.tools).toContain('Spss');
    expect(draft.formValues.tools).toContain('Sap ERP');
    expect(draft.formValues.certificates).toContain('SEGEM');
    expect(draft.formValues.languages).toContain('İngilizce');
    expect(draft.formValues.educationHistory?.length).toBeGreaterThanOrEqual(2);
  });

  it('verifies Rukiye Gürsoy CV extraction without data loss', async () => {
    const rukiyePdfPath = 'c:/Users/ugurz/.gemini/antigravity/brain/1eff9ad7-c63d-4178-b141-eae60dc9e471/.user_uploaded/media_1787129727026.pdf';
    expect(fs.existsSync(rukiyePdfPath)).toBe(true);
    const pdfBuffer = fs.readFileSync(rukiyePdfPath);

    const draft = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'Rukiye Gürsoy Özgemiş_241122_232243.pdf',
      mimeType: 'application/pdf',
    });

    expect(draft.formValues.experiences?.length).toBeGreaterThanOrEqual(4);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Çekmeköy');
  });

  it('verifies Dorukhan Şengel CV extraction', () => {
    const dorukhanText = `
DORUKHAN ŞENGEL
Ekonomi & Finans
Uzmanı
İLETİŞİM
Peker Mah. 5127/1 Sokak No: 5/1A Kat: 2 Karabağlar / İZMİR
Sengeldorukhan@gmail.com
05527132986
YETKİNLİKLER
Finansal Analiz & Raporlama
Finansal Okuryazarlık (Düzey 1-2-3)
Bilanço & Gelir Tablosu Analizi
Proje & Risk Yönetimi
Stratejik Planlama
Ürün Yönetimi (Product Owner)
CRM & Müşteri İlişkileri
Marka Yönetimi & İletişim
İngilizce: Başlangıç (Mesleki Terminoloji)
KİŞİSEL BECERİLER
Analitik Düşünme
Takım Çalışması
Sunum Becerileri
Kriz Yönetimi
Sonuç Odaklılık
HAKKIMDA
Manisa Celal Bayar Üniversitesi Ekonomi ve Finans mezunu olarak yatırım operasyonları, müşteri ilişkileri ve portföy geliştirme alanlarında deneyim kazandım. Gedik Yatırım'da görev aldığım süre boyunca şube operasyonlarının yürütülmesi, yeni müşteri kazanımı, portföy büyütme çalışmaları ve yatırımcı ilişkileri süreçlerinde aktif rol aldım. Güçlü iletişim becerim, analitik düşünce yapım ve sonuç odaklı çalışma anlayışımla kurumuma değer katmayı hedefliyorum.
İŞ DENEYİMİ
Gedik Yatırım 03.10.2024 - 03.04.2025
Manisa Yatırım Operasyonları & Portföy kazanımı
Müşteri hesap açılışları, portföy devir işlemleri ve yatırımcı taleplerinin takibi gerçekleştirildi.
Yeni müşteri kazanımı ve portföy geliştirme çalışmalarında aktif rol alındı.
Saha faaliyetleri ve müşteri görüşmeleriyle yatırım ürünlerinin tanıtımına ve müşteri ilişkilerinin geliştirilmesine katkı sağlandı.
Müşteri İlişkileri (CRM): Yatırımcı taleplerinin karşılanması ve memnuniyetin artırılması süreçlerinde şube yönetimine asistanlık yapıldı.
EĞİTİM VE SERTİFİKALAR
EĞİTİMLER
Manisa Celal Bayar Üniversitesi | Ekonomi ve Finans (Lisans)(Eylül 2021 – Haziran 2025 )
Anadolu Üniversitesi | Sermaye Piyasası ve Menkul Değerler (Ön Lisans)(2024 – Devam Ediyor)
SERTİFİKALAR
İleri Düzey Finansal Okuryazarlık (SPL 1-2-3): Piyasa analizi ve bütçe yönetimi.
Şirket Değerleme ve Yatırım Analizi: Bilanço ve değerleme teknikleri.
Proje ve Risk Yönetimi (ODTÜ): Kaynak planlama ve kriz yönetimi.
Product Owner (Agile): Ürün vizyonu ve değer odaklı analiz.
Müşteri İlişkileri Yönetimi (CRM): Tüketici analizi ve ikna teknikleri.
Dış Ticaret Uzmanlığı: İthalat-ihracat ve gümrük mevzuatı.
REFERANSLAR
Uğur ZAMAN
Head of Telemarkerting and commercial support
Mail: zamanugurz@gmail.com
Doğucan ŞENGEL
İş Ortaklıkları Müdürü
Mail: dogucan.sengell@Outlook.com
`;
    const det = extractDeterministicCv(dorukhanText);
    const canonical = mapCvToCanonicalTaxonomy(det);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'dorukhan.pdf');

    expect(draft.formValues.role).toBe('Finans Uzmanı');
    expect(draft.formValues.sector).toBe('Finans / Bankacılık');
    expect(draft.formValues.city).toBe('İzmir');
    expect(draft.formValues.residenceDistrict).toBe('Karabağlar');
    expect(draft.formValues.experiences?.length).toBeGreaterThanOrEqual(1);
    expect(draft.formValues.experiences?.[0].company).toBe('Gedik Yatırım');
    expect(draft.formValues.experiences?.[0].role).toBe('Finans Uzmanı');
    expect(draft.formValues.experiences?.[0].startYear).toBe(2024);
    expect(draft.formValues.experiences?.[0].endYear).toBe(2025);
  });
});
