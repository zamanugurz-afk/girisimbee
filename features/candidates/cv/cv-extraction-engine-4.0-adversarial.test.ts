import { describe, expect, it } from 'vitest';
import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';
import { detectCvFormatFromBuffer } from '@/features/candidates/cv/cv-format-detector';
import { extractCandidateName, isForbiddenNameCandidate } from '@/features/candidates/cv/cv-name-extractor';
import {
  extractDeterministicCv,
  extractDeterministicSkillsAndTools,
  extractDeterministicExperiences,
} from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { cvService } from '@/features/candidates/cv/cv.service';
import { UGUR_ZAMAN_CV_TEXT } from '@/features/candidates/cv/cv-real-world-ugur-zaman.test';

describe('CV Extraction Engine 4.0 — Production-Grade Adversarial & Property Test Suite', () => {
  // ==========================================================================
  // PROPERTY 1: Section Headings are NEVER Extracted as Candidate Name
  // ==========================================================================
  describe('Property 1: Section Headings vs Candidate Name Guard', () => {
    const forbiddenHeadings = [
      'EĞİTİM',
      'Eğitim Bilgileri',
      'İş Deneyimi',
      'Deneyimler',
      'Beceriler',
      'Yetkinlikler',
      'Kişisel Bilgiler',
      'Kişisel Özet',
      'Referanslar',
      'Diller',
      'Sertifikalar',
      'Hakkımda',
      'Education',
      'Work Experience',
      'Skills',
      'References',
      'Languages',
      'Certifications',
    ];

    it.each(forbiddenHeadings)('rejects heading "%s" from being candidate fullName', (heading) => {
      expect(isForbiddenNameCandidate(heading)).toBe(true);
      const cvText = `${heading}\nLisans Derecesi\n2015 - 2019\nAnadolu Üniversitesi`;
      const name = extractCandidateName(cvText);
      expect(name).not.toBe(heading);
    });

    it('extracts real candidate name when preceding or following prominent section headings', () => {
      const cvText = `
EĞİTİM
MARMARA ÜNİVERSİTESİ
2020 - 2022

KİŞİSEL BİLGİLER
Uğur Zaman
Maltepe, İstanbul
zamanugurz@gmail.com
      `;
      const name = extractCandidateName(cvText);
      expect(name).toBe('Uğur Zaman');
    });
  });

  // ==========================================================================
  // PROPERTY 2: Education Field NEVER Pollutes Primary Sector
  // ==========================================================================
  describe('Property 2: Education Degree Isolation from Primary Sector', () => {
    it('does NOT assign "Kamu / Belediye" sector when candidate has "Kamu Yönetimi" degree but works in Call Center', () => {
      const payload = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
      const canonical = mapCvToCanonicalTaxonomy(payload);

      expect(canonical.primarySector).toBe('Çağrı merkezi');
      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
      expect(canonical.educationField).toContain('Kamu Yönetimi');
    });

    it('leaves primarySector unresolved (empty) when CV contains ONLY an education degree and no work experience', () => {
      const pureEduCv = `
Mert Kaya
Kadıköy, İstanbul
mert@example.com

EĞİTİM
Kamu Yönetimi Lisans
Anadolu Üniversitesi
2015 - 2019
      `;
      const payload = extractDeterministicCv(pureEduCv);
      const canonical = mapCvToCanonicalTaxonomy(payload);

      expect(canonical.primarySector).not.toBe('Kamu / Belediye');
      expect(canonical.primaryRole).not.toBe('Uzman');
    });
  });

  // ==========================================================================
  // PROPERTY 3: Reference Phone and Contacts Never Assigned to Candidate
  // ==========================================================================
  describe('Property 3: Reference Contacts Non-Contamination Guard', () => {
    it('isolates reference phone number 5233758901 and candidate phone 5309367745', () => {
      const payload = extractDeterministicCv(UGUR_ZAMAN_CV_TEXT);
      expect(payload.phone).not.toContain('5233758901');
      if (payload.phone) {
        expect(payload.phone).toMatch(/530/);
      }
    });
  });

  // ==========================================================================
  // PROPERTY 4: Skill Extraction & Proficiency Normalization
  // ==========================================================================
  describe('Property 4: Explicit Skill Normalization & Proficiency Suffix Stripping', () => {
    it('normalizes "Satış Yönetimi - Uzman" to "Satış Yönetimi" without trailing proficiency or separators', () => {
      const skillsAndTools = extractDeterministicSkillsAndTools(UGUR_ZAMAN_CV_TEXT);
      expect(skillsAndTools.professionalSkills).toContain('Satış Yönetimi');
      expect(skillsAndTools.professionalSkills).toContain('Operasyon Yönetimi');
      expect(skillsAndTools.professionalSkills).toContain('Çağrı Merkezi Yönetimi');
      expect(skillsAndTools.professionalSkills).toContain('Yeni Müşteri Kazanımı');
      expect(skillsAndTools.professionalSkills).toContain('Saha Satış Yönetimi');
      expect(skillsAndTools.professionalSkills).toContain('Ekip ve Performans Yönetimi');

      for (const skill of skillsAndTools.professionalSkills) {
        expect(skill).not.toMatch(/\s*[-–—:]\s*Uzman/i);
        expect(skill).not.toBe('Uzman');
        expect(skill).not.toBe('|');
      }
    });

    it('suppresses global keyword frequency explosion when explicit skills section is present', () => {
      const skillsAndTools = extractDeterministicSkillsAndTools(UGUR_ZAMAN_CV_TEXT);
      expect(skillsAndTools.professionalSkills.length).toBeLessThanOrEqual(10);
      expect(skillsAndTools.professionalSkills.length).toBeGreaterThanOrEqual(6);
    });
  });

  // ==========================================================================
  // PROPERTY 5: Experience Consolidation (No Bullet/Date Fragmentation)
  // ==========================================================================
  describe('Property 5: Experience Consolidation & Anti-Fragmentation', () => {
    it('extracts exactly 6 consolidated work experiences for Uğur Zaman CV', () => {
      const experiences = extractDeterministicExperiences(UGUR_ZAMAN_CV_TEXT);
      expect(experiences).toHaveLength(6);

      const companies = experiences.map((e) => e.company || '').join(' ');
      expect(companies).toMatch(/IGS/i);
      expect(companies).toMatch(/Gedik/i);
      expect(companies).toMatch(/Mehrwerk/i);
      expect(companies).toMatch(/Viennalife/i);
      expect(companies).toMatch(/Fibabanka/i);
      expect(companies).toMatch(/Mplus/i);

      for (const exp of experiences) {
        expect(exp.role).toBeDefined();
        expect(exp.company).toBeDefined();
        expect(exp.startYear).toBeDefined();
      }
    });
  });

  // ==========================================================================
  // PROPERTY 6: Multi-Format Ingestion (PDF, DOCX, TXT, RTF)
  // ==========================================================================
  describe('Property 6: Multi-Format Support & Corruption Rejection', () => {
    it('detects and extracts plain text correctly', async () => {
      const buf = Buffer.from(UGUR_ZAMAN_CV_TEXT, 'utf-8');
      const result = await extractCvText(buf, 'cv.txt', 'text/plain');
      expect(result.format).toBe('txt');
      expect(result.text).toContain('UĞUR ZAMAN');
    });

    it('detects and extracts RTF format correctly', async () => {
      const rtfString = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Courier;}} \\f0\\fs24 Uğur Zaman\\par Telemarketing Müdürü\\par}';
      const buf = Buffer.from(rtfString, 'utf-8');
      const detection = detectCvFormatFromBuffer(buf, 'cv.rtf', 'application/rtf');
      expect(detection.format).toBe('rtf');

      const result = await extractCvText(buf, 'cv.rtf', 'application/rtf');
      expect(result.format).toBe('rtf');
      expect(result.text).toContain('Uğur Zaman');
    });

    it('rejects empty or corrupt buffers with CvExtractionError', async () => {
      const corruptBuf = Buffer.from('SHORT');
      await expect(extractCvText(corruptBuf, 'corrupt.pdf', 'application/pdf')).rejects.toThrow(
        CvExtractionError,
      );
    });
  });

  // ==========================================================================
  // PROPERTY 7: End-to-End Canonical Profile Builder Consistency
  // ==========================================================================
  describe('Property 7: End-to-End Canonical Profile Draft Contract', () => {
    it('builds a verified canonical draft matching all target acceptance criteria', async () => {
      const buf = Buffer.from(UGUR_ZAMAN_CV_TEXT, 'utf-8');
      const draft = await cvService.processCvBuffer({
        buffer: buf,
        fileName: 'CV - UĞUR ZAMAN (4).pdf',
        mimeType: 'application/pdf',
      });

      const fv = draft.formValues;

      expect(fv.fullName).toBe('Uğur Zaman');
      expect(fv.primarySector).toBe('Çağrı merkezi');
      expect(fv.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
      expect(fv.experienceLevel).toBe('Yönetici');
      expect(fv.residenceCity).toBe('İstanbul');
      expect(fv.residenceDistrict).toBe('Maltepe');
      expect(fv.experiences).toHaveLength(6);
      expect(fv.educationHistory).toHaveLength(2);
      expect(fv.professionalSkillsList?.length).toBeGreaterThanOrEqual(6);
      expect(fv.professionalSkillsList?.length).toBeLessThanOrEqual(10);
    });
  });
});
