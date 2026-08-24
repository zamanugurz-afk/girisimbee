import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { cvService } from './cv.service';
import { extractCandidateName } from './cv-name-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

describe('Real User Flow End-to-End CV Extraction & Verification', () => {
  const MOJIBAKE_DETECTION_REGEX = /Ã§|Ã‡|Ä±|Ä°|Ã¶|Ã–|ÅŸ|Åž|ÄŸ|Äž|Ã¼|Ãœ|SatÄ±ÅŸ|YÃ¶netim|Ã‡aÄŸrÄ±|MÃ¼ÅŸteri|Ä°letiÅŸim|Ã–zgeÃ§miÅŸ|\uFFFD/;

  const testCvsDir = 'c:/Users/ugurz/Downloads/test_cvs';

  it('1. Extracts and verifies all 10 real Turkish PDF CVs from downloads folder', async () => {
    if (!fs.existsSync(testCvsDir)) {
      console.warn(`Directory ${testCvsDir} does not exist, skipping real PDF batch test`);
      return;
    }

    const files = fs.readdirSync(testCvsDir).filter((f) => f.endsWith('.pdf'));
    expect(files.length).toBeGreaterThanOrEqual(10);

    for (const fileName of files) {
      const filePath = path.join(testCvsDir, fileName);
      const buffer = fs.readFileSync(filePath);

      const draft = await cvService.processCvBuffer({
        buffer,
        fileName,
        mimeType: 'application/pdf',
      });

      // A) Extraction check
      expect(draft).toBeDefined();
      expect(draft.formValues).toBeDefined();

      // B) Name check — Must NEVER be a section header
      const name = draft.formValues.fullName;
      if (name) {
        expect(name).not.toBe('Kişisel Bilgiler');
        expect(name).not.toBe('KİŞİSEL BİLGİLER');
        expect(name).not.toBe('İletişim Bilgileri');
        expect(name).not.toBe('Genel Bilgiler');
        expect(name).not.toBe('Özgeçmiş');
        expect(name).not.toBe('Kariyer Özeti');
        expect(name.length).toBeGreaterThanOrEqual(4);
      }

      // C) Mojibake check across all fields
      const allText = JSON.stringify(draft.formValues);
      const match = allText.match(MOJIBAKE_DETECTION_REGEX);
      if (match) {
        console.error(`[Mojibake detected in ${fileName}]: matched pattern "${match[0]}" at position ${match.index}`);
        console.error('Snippet:', allText.substring(Math.max(0, (match.index || 0) - 40), (match.index || 0) + 40));
      }
      expect(match).toBeNull();
    }
  }, 30000);

  it('2. End-to-End Real User Flow with Uğur Zaman CV', async () => {
    const rawCvText = `
KİŞİSEL BİLGİLER

Uğur Zaman

Telefon: 0532 111 22 33
E-posta: ugur.zaman@example.com
İstanbul / Maltepe

KARİYER ÖZETİ
19 yıllık kurumsal çağrı merkezi, müşteri deneyimi ve telemarketing operasyonları yönetim tecrübesine sahibim. Satış yönetimi, yeni müşteri kazanımı, iş geliştirme ve ekip liderliği alanlarında başarılı projelere imza attım. Çağrı merkezi operasyonlarının kurulması ve büyütülmesi süreçlerini yönettim.

İŞ DENEYİMLERİ
Çağrı Merkezi Operasyonları Direktörü
ABC Holding A.Ş.
2020 - Devam Ediyor
* Saha satış yönetimi ve telemarketing operasyonlarının koordinasyonunu sağladım.
* Yeni müşteri kazanımı ve kurumsal müşteri yönetimi süreçlerini optimize ettim.

Kıdemli Satış Müdürü
XYZ İletişim Hizmetleri Ltd. Şti.
2015 - 2020
* 50 kişilik çağrı merkezi ve satış ekibinin yönetimini üstlendim.
* Müşteri memnuniyeti ve satış hedeflerinin üzerinde performans elde edildi.

EĞİTİM
Marmara Üniversitesi
İşletme (Lisans)
2000 - 2004

YETENEKLER
Satış Yönetimi, Çağrı Merkezi Yönetimi, Yeni Müşteri Kazanımı, Ekip Liderliği, CRM, Müşteri İlişkileri

DİLLER
Türkçe (Ana dil), İngilizce (İleri Düzey)

SERTİFİKALAR
İleri Satış ve Müzakere Teknikleri Sertifikası
    `;

    // 1. Raw Extraction
    const deterministic = extractDeterministicCv(rawCvText);

    // 2. Candidate Name Extraction Check
    expect(deterministic.fullName).toBe('Uğur Zaman');
    expect(deterministic.fullName).not.toBe('Kişisel Bilgiler');
    expect(deterministic.fullName).not.toBe('KİŞİSEL BİLGİLER');
    expect(deterministic.fullName).not.toBe('Genel Bilgiler');
    expect(deterministic.fullName).not.toBe('İletişim Bilgileri');

    // 3. Canonical Taxonomy Mapping
    const canonical = mapCvToCanonicalTaxonomy(deterministic);

    // 4. Profile Draft Building
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur_zaman_cv.pdf', 'doc-ugur-1');
    const fv = draft.formValues;

    // 5. Verification of all Form Fields
    expect(fv.fullName).toBe('Uğur Zaman');
    expect(fv.role).toContain('Çağrı Merkezi');
    expect(fv.residenceCity).toBe('İstanbul');
    expect(fv.residenceDistrict).toBe('Maltepe');
    expect(fv.experiences?.length).toBeGreaterThanOrEqual(2);
    expect(fv.experiences?.[0].role).toContain('Çağrı Merkezi');
    expect(fv.experiences?.[0].responsibilities).toContain('Saha satış yönetimi');
    expect(fv.experiences?.[0].responsibilities).toContain('Yeni müşteri kazanımı');
    expect(fv.educationHistory?.length).toBeGreaterThanOrEqual(1);
    expect(fv.educationHistory?.[0].school).toBe('Marmara Üniversitesi');
    expect(fv.educationHistory?.[0].field).toBe('İşletme');
    expect(fv.candidateTraits).toContain('19 yıllık');
    expect(fv.candidateTraits?.length).toBeLessThanOrEqual(1000);
    expect(fv.professionalSkillsList).toContain('Satış Yönetimi');
    expect(fv.professionalSkillsList).toContain('Yeni Müşteri Kazanımı');
    expect(fv.languages).toContain('İngilizce');
    expect(fv.certificates).toContain('İleri Satış ve Müzakere Teknikleri Sertifikası');

    // 6. Mojibake Verification
    const draftJson = JSON.stringify(fv);
    expect(MOJIBAKE_DETECTION_REGEX.test(draftJson)).toBe(false);

    // 7. Database Save Simulation (formValuesToCustomFields)
    const completeFormState: CareerProfileFormValues = {
      fullName: fv.fullName || '',
      role: fv.role || '',
      roles: fv.roles || [],
      sector: fv.sector || '',
      sectors: fv.sectors || [],
      experienceLevel: fv.experienceLevel || 'Direktör',
      experiences: fv.experiences || [],
      professionalSkills: fv.professionalSkills || '',
      professionalSkillsList: fv.professionalSkillsList || [],
      technicalSkills: fv.technicalSkills || '',
      technicalSkillsList: fv.technicalSkillsList || [],
      tools: fv.tools || '',
      toolsList: fv.toolsList || [],
      educationLevel: fv.educationLevel || 'Lisans',
      educationField: fv.educationField || '',
      educationHistory: fv.educationHistory || [],
      languages: fv.languages || '',
      certificates: fv.certificates || '',
      city: fv.city || 'İstanbul',
      residenceCity: fv.residenceCity || 'İstanbul',
      residenceDistrict: fv.residenceDistrict || 'Maltepe',
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      availability: 'Hemen',
      candidateTraits: fv.candidateTraits || '',
    };

    const savedCustomFields = formValuesToCustomFields('seek', completeFormState);
    expect(savedCustomFields).toBeDefined();
    expect(savedCustomFields.fullName).toBe('Uğur Zaman');
    expect((savedCustomFields.experiences as any[]).length).toBe(completeFormState.experiences.length);

    // 8. Database Reload Simulation (valuesFromCareerSource)
    const reloaded = valuesFromCareerSource({
      city: completeFormState.city,
      location: completeFormState.city,
      customFields: savedCustomFields,
    });

    expect(reloaded.fullName).toBe('Uğur Zaman');
    expect(reloaded.residenceDistrict).toBe('Maltepe');
    expect(reloaded.experiences?.length).toBe(completeFormState.experiences.length);
    expect(reloaded.experiences?.[0].role).toContain('Çağrı Merkezi');
    expect(reloaded.experiences?.[0].responsibilities).toContain('Saha satış yönetimi');

    // 9. Career Card Safe Preview Input Simulation (toSafeCareerPreviewInput)
    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: {
        city: reloaded.city,
        location: reloaded.city,
        customFields: savedCustomFields,
      },
      displayName: 'Uğur Zaman',
    });

    expect(reloaded.fullName).toBe('Uğur Zaman');
    expect(savedCustomFields.fullName).toBe('Uğur Zaman');
    expect(preview.desiredRole).toContain('Çağrı Merkezi');
    expect(preview.residenceCity).toBe('İstanbul');
    expect(preview.residenceDistrict).toBe('Maltepe');
    expect(preview.experiences?.length).toBe(completeFormState.experiences.length);
    expect(preview.experiences?.[0].role).toContain('Çağrı Merkezi');
    expect(preview.longDescription).toContain('19 yıllık');
    expect(preview.professionalSkills).toContain('Satış Yönetimi');

    // 10. Listing Creation Form Field Mapping Simulation
    const formHydratedFields = {
      desiredRole: fv.desiredRole || fv.role,
      primarySector: fv.primarySector || fv.sector,
      experienceLevel: fv.experienceLevel,
      experiences: fv.experiences,
      professionalSkills: fv.professionalSkills,
      educationLevel: fv.educationLevel,
      educationField: fv.educationField,
      languages: fv.languages,
      certificates: fv.certificates,
      fullName: fv.fullName,
      residenceCity: fv.residenceCity,
      residenceDistrict: fv.residenceDistrict,
      longDescription: fv.candidateTraits,
    };

    expect(formHydratedFields.fullName).toBe('Uğur Zaman');
    expect(formHydratedFields.fullName).not.toBe('Kişisel Bilgiler');
    expect(formHydratedFields.desiredRole).toContain('Çağrı Merkezi');
    expect(formHydratedFields.residenceCity).toBe('İstanbul');
    expect(formHydratedFields.residenceDistrict).toBe('Maltepe');
    expect(formHydratedFields.longDescription).toContain('19 yıllık');
  });
});
