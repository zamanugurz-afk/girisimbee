import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { extractCvText } from './cv-text-extractor';
import { extractCandidateName, generateScoredNameCandidates } from './cv-name-extractor';
import {
  extractDeterministicCv,
  extractDeterministicExperiences,
  extractDeterministicEducation,
  extractDeterministicSkillsAndTools,
  extractDeterministicLanguagesAndCerts,
} from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { cvService } from './cv.service';

describe('Real PDF Forensic Investigation: "CV - UĞUR ZAMAN (4).pdf"', () => {
  const pdfPath = 'C:/Users/ugurz/Desktop/CV - UĞUR ZAMAN (4).pdf';

  it('Phase 1: Real PDF Raw Text & Coordinate Forensics', async () => {
    if (!fs.existsSync(pdfPath)) return;
    const buffer = fs.readFileSync(pdfPath);
    expect(buffer.length).toBeGreaterThan(1000);

    const textResult = await extractCvText(buffer, 'CV - UĞUR ZAMAN (4).pdf', 'application/pdf');
    console.log('\n======================================================');
    console.log('PHASE 1: REAL PDF RAW EXTRACTED TEXT');
    console.log('======================================================');
    console.log('Text Length:', textResult.text.length);
    console.log('--- RAW TEXT BEGIN ---');
    console.log(textResult.text);
    console.log('--- RAW TEXT END ---\n');

    const lines = textResult.text.split(/\r?\n/).map((l, i) => ({ lineNo: i + 1, text: l }));
    console.log('--- LINE BY LINE BREAKDOWN ---');
    for (const l of lines) {
      console.log(`[L${String(l.lineNo).padStart(2, '0')}] ${l.text}`);
    }

    // 2. Name Extraction Forensics
    console.log('\n======================================================');
    console.log('PHASE 4: NAME RESOLVER FORENSICS');
    console.log('======================================================');
    const resolvedName = extractCandidateName(textResult.text);
    console.log('Resolved Candidate Name:', resolvedName);
    expect(resolvedName).toBe('Uğur Zaman');

    // 3. Deterministic Extraction Forensics
    console.log('\n======================================================');
    console.log('PHASE 5-8: DETERMINISTIC EXTRACTION FORENSICS');
    console.log('======================================================');
    const payload = extractDeterministicCv(textResult.text);
    console.log('Deterministic Signals:', {
      fullName: payload.fullName,
      headline: payload.headline,
      roles: payload.roles,
      sectors: payload.sectors,
      experiencesCount: payload.experiences.length,
      educationCount: payload.education.length,
      skillsCount: payload.skills.length,
      toolsCount: payload.tools.length,
      phone: payload.phone,
      email: payload.email,
      locations: payload.locations
    });

    console.log('--- EXPERIENCES LIST ---');
    payload.experiences.forEach((exp, i) => {
      console.log(`[EXP ${i + 1}] Company: "${exp.company}" | Role: "${exp.role}" | Dates: ${exp.startYear} - ${exp.endYear || 'Present'} | Current: ${exp.isCurrent}`);
    });

    console.log('--- EDUCATION LIST ---');
    payload.education.forEach((edu, i) => {
      console.log(`[EDU ${i + 1}] School: "${edu.school}" | Level: "${edu.level}" | Field: "${edu.field}" | Year: ${edu.graduationYear}`);
    });

    console.log('--- SKILLS & TOOLS ---');
    const skills = extractDeterministicSkillsAndTools(textResult.text);
    console.log('Professional Skills:', skills.professionalSkills);
    console.log('Technical Skills:', skills.technicalSkills);
    console.log('Tools:', skills.tools);

    // 4. Canonical Taxonomy Mapping Forensics
    console.log('\n======================================================');
    console.log('PHASE 10-11: CANONICAL TAXONOMY FORENSICS');
    console.log('======================================================');
    const canonical = mapCvToCanonicalTaxonomy(payload);
    console.log('Canonical Results:', {
      fullName: canonical.fullName,
      primaryRole: canonical.primaryRole,
      primarySector: canonical.primarySector,
      experienceLevel: canonical.experienceLevel,
      residenceCity: canonical.residenceCity,
      residenceDistrict: canonical.residenceDistrict,
      languages: canonical.languages,
      matchedRoles: canonical.matchedRoles,
      matchedSectors: canonical.matchedSectors,
      experiencesCount: canonical.experiences.length,
      educationCount: canonical.educationList.length,
      skillsList: canonical.professionalSkillsList
    });

    expect(canonical.fullName).toBe('Uğur Zaman');
    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primaryRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(canonical.experiences).toHaveLength(6);
    expect(canonical.educationList).toHaveLength(2);

    // 5. Full Server-Side cvService Draft Forensics
    console.log('\n======================================================');
    console.log('PHASE 13: END-TO-END CV SERVICE DRAFT FORENSICS');
    console.log('======================================================');
    const draft = await cvService.processCvBuffer({
      buffer,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf'
    });

    console.log('Draft Form Values:\n', JSON.stringify(draft.formValues, null, 2));

    expect(draft.formValues.fullName).toBe('Uğur Zaman');
    expect(draft.formValues.primarySector).toBe('Çağrı merkezi');
    expect(draft.formValues.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(draft.formValues.experienceLevel).toBe('Yönetici');
    expect(draft.formValues.experiences).toHaveLength(6);
    expect(draft.formValues.educationHistory).toHaveLength(2);
    expect(draft.formValues.professionalSkillsList?.length).toBeGreaterThanOrEqual(5);
    expect(draft.formValues.professionalSkillsList?.length).toBeLessThanOrEqual(10);
  });
});
