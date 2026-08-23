import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { cvService } from './cv.service';
import { segmentCvIntoDocumentZones } from './cv-document-zoning';

import { extractCvText } from './cv-text-extractor';

interface RealFileAuditResult {
  fileName: string;
  format: string;
  rawSize: number;
  extractedChars: number;
  zonesCount: number;
  fullName: string;
  desiredRole: string;
  primarySector: string;
  residenceCity: string;
  residenceDistrict: string;
  experiencesCount: number;
  educationCount: number;
  skillsCount: number;
  confidence: number;
  contradictionsCount: number;
  aiCalls: number;
  processingTimeMs: number;
}

describe('CV Extraction Engine 12.0 — Real-World Binary Files Forensic Audit Suite', () => {
  const dir = 'c:/Users/ugurz/Downloads/test_cvs';
  const ugurPdfPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';
  const burakPdfPath = 'c:/Users/ugurz/Downloads/CV BURAK BATIL ÖZDEMİR.pdf';

  const auditLog: RealFileAuditResult[] = [];

  it('Real Files Audit: Processes all available real disk files and builds comprehensive scorecard', async () => {
    const filePaths: Array<{ path: string; name: string }> = [];

    if (fs.existsSync(ugurPdfPath)) {
      filePaths.push({ path: ugurPdfPath, name: 'CV - UĞUR ZAMAN (4).pdf' });
    }
    if (fs.existsSync(burakPdfPath)) {
      filePaths.push({ path: burakPdfPath, name: 'CV BURAK BATIL ÖZDEMİR.pdf' });
    }
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.pdf') || f.endsWith('.docx'));
      for (const df of dirFiles) {
        filePaths.push({ path: path.join(dir, df), name: df });
      }
    }

    expect(filePaths.length).toBeGreaterThanOrEqual(10);

    for (const f of filePaths) {
      const startTime = performance.now();
      const buffer = fs.readFileSync(f.path);
      const mimeType = f.name.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf';

      const extracted = await extractCvText(buffer, f.name, mimeType);
      const rawText = extracted.text;

      const draft = await cvService.processCvBuffer({
        buffer,
        fileName: f.name,
        mimeType,
      });
      const elapsed = Math.round(performance.now() - startTime);

      const fv = draft.formValues;
      const zones = segmentCvIntoDocumentZones(rawText);

      const record: RealFileAuditResult = {
        fileName: f.name,
        format: f.name.endsWith('.docx') ? 'DOCX' : 'PDF',
        rawSize: buffer.length,
        extractedChars: rawText.length,
        zonesCount: zones.zones.length,
        fullName: fv.fullName || '',
        desiredRole: fv.desiredRole || '',
        primarySector: fv.primarySector || '',
        residenceCity: fv.residenceCity || fv.city || '',
        residenceDistrict: fv.residenceDistrict || fv.district || '',
        experiencesCount: fv.experiences?.length || 0,
        educationCount: fv.educationHistory?.length || 0,
        skillsCount: (fv.professionalSkills?.length || 0) + (fv.tools?.length || 0),
        confidence: draft.metrics?.coverageScore || 1.0,
        contradictionsCount: draft.metrics?.contradictionsCount || 0,
        aiCalls: draft.metrics?.aiCallCount || 0,
        processingTimeMs: elapsed,
      };

      auditLog.push(record);

      // Forensic Invariants on Real Files
      expect(record.fullName).toBeTruthy();
      expect(record.fullName).not.toMatch(/Eğitim|Deneyim|Beceriler|Kişisel|Müdür|Uzman/i);
      expect(record.desiredRole).toBeTruthy();
      expect(record.primarySector).toBeTruthy();
      expect(record.experiencesCount).toBeGreaterThanOrEqual(1);
      expect(record.aiCalls).toBeLessThanOrEqual(1);
      expect(record.processingTimeMs).toBeLessThan(10000); // Concurrency-safe execution under full multi-worker load
    }

    console.table(auditLog);
  });
});
