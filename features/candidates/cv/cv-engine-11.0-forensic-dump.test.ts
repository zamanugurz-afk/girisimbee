import { describe, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { extractCvText } from './cv-text-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph, enforceEvidenceGraphFirewall } from './cv-evidence-graph';
import { cvService } from './cv.service';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';

describe('CV Extraction Engine 11.0 — Forensic Dump on Real Documents', () => {
  const dir = 'c:/Users/ugurz/Downloads/test_cvs';
  const realPdfNames = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.pdf')) : [];

  it('Dumps pipeline stages for real PDFs in test_cvs', async () => {
    for (const fileName of realPdfNames) {
      const fullPath = path.join(dir, fileName);
      const buf = fs.readFileSync(fullPath);
      console.log(`\n======================================================================`);
      console.log(`[REAL PDF FORENSIC DUMP] ${fileName}`);
      console.log(`======================================================================`);

      const extracted = await extractCvText(buf, fileName, 'application/pdf');
      console.log(`[RAW TEXT PREVIEW (${extracted.text.length} chars)]:\n${extracted.text.slice(0, 350)}\n---`);

      const sanitized = normalizeCvText(extracted.text);
      const rawDet = extractDeterministicCv(sanitized);
      console.log(`[DETERMINISTIC RAW EXTRACTION]:`, {
        fullName: rawDet.fullName,
        roles: rawDet.roles,
        sectors: rawDet.sectors,
        experiencesCount: rawDet.experiences.length,
        educationCount: rawDet.education.length,
        skillsCount: Array.isArray(rawDet.skills) ? rawDet.skills.length : Object.keys(rawDet.skills || {}).length,
        locations: rawDet.locations,
      });

      const draft = await cvService.processCvBuffer({
        buffer: buf,
        fileName,
        mimeType: 'application/pdf',
      });

      console.log(`[DRAFT OUTPUT]:`, {
        fullName: draft.formValues.fullName,
        desiredRole: draft.formValues.desiredRole,
        primarySector: draft.formValues.primarySector,
        experienceLevel: draft.formValues.experienceLevel,
        residenceCity: draft.formValues.residenceCity,
        residenceDistrict: draft.formValues.residenceDistrict,
        experiences: draft.formValues.experiences?.map((e) => ({ company: e.company, role: e.role, startYear: e.startYear, endYear: e.endYear })),
        education: draft.formValues.educationHistory?.map((e) => ({ school: e.school, level: e.level, field: e.field, graduationYear: e.graduationYear })),
      });

      const hydrated = buildHydratedCustomFieldsFromCvDraft(draft);
      console.log(`[CLIENT HYDRATED STATE]:`, {
        fullName: hydrated.nextCustomFields.fullName,
        desiredRole: hydrated.nextCustomFields.desiredRole,
        primarySector: hydrated.nextCustomFields.primarySector,
        residenceCity: hydrated.nextCustomFields.residenceCity,
        residenceDistrict: hydrated.nextCustomFields.residenceDistrict,
        experiencesCount: (hydrated.nextCustomFields.experiences as any[])?.length,
        educationCount: (hydrated.nextCustomFields.educationHistory as any[])?.length,
      });
    }
  });
});
