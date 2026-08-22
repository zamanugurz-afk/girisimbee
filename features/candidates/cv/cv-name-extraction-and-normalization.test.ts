import { describe, expect, it } from 'vitest';
import {
  extractCandidateName,
  isForbiddenNameCandidate,
  formatTurkishTitleCase,
} from './cv-name-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { buildProfileDraftFromCanonicalResult, dedupeNormalizedStrings } from './cv-profile-builder';
import type { CanonicalTaxonomyMappingResult } from './cv.types';

describe('CV Candidate Full Name Extraction & Section Heading Rejection', () => {
  it('correctly extracts "Uğur Zaman" and rejects "KİŞİSEL BİLGİLER" heading', () => {
    const cvText = `
KİŞİSEL BİLGİLER

Uğur Zaman

Telefon: 0532 111 22 33
E-posta: ugur@example.com
İstanbul / Maltepe

KARİYER ÖZETİ
19 yıllık kurumsal çağrı merkezi ve telemarketing operasyonları yönetim deneyimi...
    `;

    const extracted = extractCandidateName(cvText);

    expect(extracted).not.toBe('Kişisel Bilgiler');
    expect(extracted).not.toBe('KİŞİSEL BİLGİLER');
    expect(extracted).toBe('Uğur Zaman');
  });

  it('rejects all standard CV section headings as candidate names', () => {
    const forbiddenHeadings = [
      'Kişisel Bilgiler',
      'Kişisel Bilgilerim',
      'İletişim Bilgileri',
      'İletişim',
      'Özgeçmiş',
      'CV',
      'Curriculum Vitae',
      'Kariyer Özeti',
      'Hakkımda',
      'Profil',
      'Profil Özeti',
      'Eğitim',
      'Eğitim Bilgileri',
      'Deneyim',
      'İş Deneyimi',
      'İş Deneyimlerim',
      'Sertifika',
      'Sertifikalar',
      'Yetenekler',
      'Uzmanlık Alanları',
      'Referanslar',
      'Diğer Bilgiler',
      'Genel Bilgiler',
    ];

    for (const heading of forbiddenHeadings) {
      expect(isForbiddenNameCandidate(heading)).toBe(true);
      expect(isForbiddenNameCandidate(heading.toLocaleUpperCase('tr-TR'))).toBe(true);
      expect(isForbiddenNameCandidate(heading.toLocaleLowerCase('tr-TR'))).toBe(true);
    }
  });

  it('returns null if no reliable person name candidate exists in CV text', () => {
    const headlessCv = `
GENEL BİLGİLER
Telefon: 0555 123 45 67
E-posta: contact@example.com
Adres: Kadıköy, İstanbul

İŞ DENEYİMLERİ
Yazılım Geliştirici - ABC Bilişim A.Ş.
    `;

    const extracted = extractCandidateName(headlessCv);
    expect(extracted).toBeNull();
  });

  it('extracts names from explicit labels (Ad Soyad, İsim, Full Name)', () => {
    expect(extractCandidateName('Ad Soyad: Burak Batıl\nE-posta: b@b.com')).toBe('Burak Batıl');
    expect(extractCandidateName('İsim Soyisim: Gülfem Şaylan\nTel: 0500')).toBe('Gülfem Şaylan');
    expect(extractCandidateName('Adı: Ahmet\nSoyadı: Yılmaz\nİstanbul')).toBe('Ahmet Yılmaz');
    expect(extractCandidateName('Full Name: Selin Demirtaş\nLocation: Ankara')).toBe('Selin Demirtaş');
  });

  it('extracts names from top header line with titles and separators', () => {
    expect(extractCandidateName('Dr. Mehmet Ali Kaya | Kıdemli Danışman\nİstanbul')).toBe('Mehmet Ali Kaya');
    expect(extractCandidateName('Av. Canan Demirdağ - Hukuk Müşaviri\nAnkara')).toBe('Canan Demirdağ');
    expect(extractCandidateName('İPEK NUR ÇAĞLAR / İstanbul\n0533 000 00 00')).toBe('İpek Nur Çağlar');
  });
});

describe('Turkish Character & Mojibake Normalization Engine (normalizeCvText)', () => {
  it('preserves valid Turkish characters perfectly', () => {
    const validTerms = [
      'Çalışma',
      'Satış',
      'Yönetim',
      'Çağrı Merkezi',
      'Müşteri',
      'İletişim',
      'Görüşme',
      'Ücret',
      'Öğrenim',
      'Kıdem',
      'İşveren',
      'Şirket',
      'Değişiklik',
      'Gelişim',
      'Özgeçmiş',
    ];

    for (const term of validTerms) {
      expect(normalizeCvText(term)).toBe(term);
    }
  });

  it('repairs double-encoded UTF-8 and Latin-1 mojibake strings', () => {
    expect(normalizeCvText('SatÄ±ÅŸ')).toBe('Satış');
    expect(normalizeCvText('YÃ¶netim')).toBe('Yönetim');
    expect(normalizeCvText('Ã‡aÄŸrÄ± Merkezi')).toBe('Çağrı Merkezi');
    expect(normalizeCvText('MÃ¼ÅŸteri')).toBe('Müşteri');
    expect(normalizeCvText('Ä°letiÅŸim')).toBe('İletişim');
    expect(normalizeCvText('Ã–zgeÃ§miÅŸ')).toBe('Özgeçmiş');
    expect(normalizeCvText('SatÄ±ÅŸ YÃ¶netimi')).toBe('Satış Yönetimi');
    expect(normalizeCvText('Kurumsal MÃ¼ÅŸteri Ä°liÅŸkileri YÃ¶netimi')).toBe('Kurumsal Müşteri İlişkileri Yönetimi');
  });

  it('safely handles null and undefined inputs', () => {
    expect(normalizeCvText(null)).toBe('');
    expect(normalizeCvText(undefined)).toBe('');
    expect(normalizeCvText('')).toBe('');
  });
});

describe('Case-Insensitive String Deduplication (dedupeNormalizedStrings)', () => {
  it('removes duplicates regardless of casing and trims spaces', () => {
    const rawList = [
      'Satış',
      'satış',
      'SATIŞ',
      'Satış Yönetimi',
      'satış yönetimi',
      'Müşteri İlişkileri',
      '  Müşteri İlişkileri  ',
    ];

    const deduped = dedupeNormalizedStrings(rawList);

    expect(deduped).toEqual(['Satış', 'Satış Yönetimi', 'Müşteri İlişkileri']);
  });
});

describe('Canonical CV Draft Builder Mapping Integrity', () => {
  it('maps structured data cleanly without injecting section headings as fullName', () => {
    const canonical: CanonicalTaxonomyMappingResult = {
      primaryRole: 'Satış Müdürü',
      matchedRoles: ['Satış Müdürü', 'Satış Yöneticisi'],
      primarySector: 'Finans',
      matchedSectors: ['Finans', 'Bankacılık'],
      professionalSkills: ['Satış Yönetimi', 'satış yönetimi', 'Ekip Liderliği'],
      technicalSkills: ['CRM', 'crm', 'Excel'],
      tools: ['Salesforce', 'salesforce'],
      educationLevel: 'Lisans',
      educationField: 'İşletme',
      educationList: [
        {
          school: 'İstanbul Üniversitesi',
          field: 'İşletme',
          level: 'Lisans',
          graduationYear: 2018,
        },
      ],
      languages: 'İngilizce (İleri)',
      certificates: 'İleri Satış Teknikleri',
      residenceCity: 'İstanbul',
      residenceDistrict: 'Maltepe',
      fullName: 'Kişisel Bilgiler', // Simulating an invalid section header reaching canonical
      gender: 'Erkek',
      birthDate: '1990-05-15',
      experiences: [
        {
          company: 'ABC Bankası',
          role: 'Satış Müdürü',
          sector: 'Finans',
          duration: '4 yıl',
          responsibilities: 'Kurumsal portföy yönetimi',
          startYear: 2020,
          isCurrent: true,
        },
      ],
      summary: '10 yıllık kurumsal satış ve müşteri yönetimi deneyimi.',
      ambiguousItems: [],
      canonicalConfidence: 1.0,
    };

    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur_zaman_cv.pdf', 'doc-123');

    // fullName should NOT be "Kişisel Bilgiler", it should be empty for safe manual entry
    expect(draft.formValues.fullName).not.toBe('Kişisel Bilgiler');
    expect(draft.formValues.fullName).toBe('');

    // Skills should be deduplicated
    expect(draft.formValues.professionalSkillsList).toEqual(['Satış Yönetimi', 'Ekip Liderliği']);
    expect(draft.formValues.technicalSkillsList).toEqual(['CRM', 'Excel']);
    expect(draft.formValues.toolsList).toEqual(['Salesforce']);

    // Experiences preserved with correct roles and sectors
    expect(draft.formValues.experiences?.[0].role).toBe('Satış Müdürü');
    expect(draft.formValues.experiences?.[0].sector).toBe('Finans');
  });
});
