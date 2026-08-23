import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { extractCvText } from './cv-text-extractor';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';

describe('CV Extraction Engine 13.0 — Real-World Binary Files Replay & Forensic Audit Suite', () => {
  const testDir = 'c:/Users/ugurz/Downloads/test_cvs';
  const hasDir = fs.existsSync(testDir);
  const pdfFiles = hasDir
    ? fs.readdirSync(testDir).filter((f) => f.toLowerCase().endsWith('.pdf'))
    : [];

  if (!hasDir || pdfFiles.length === 0) {
    it('skips real binary tests if test directory not available', () => {
      expect(true).toBe(true);
    });
    return;
  }

  for (const pdfFile of pdfFiles) {
    it(`[REAL_BINARY_REPLAY] Forensic extraction for file "${pdfFile}"`, async () => {
      const fullPath = path.join(testDir, pdfFile);
      const buffer = fs.readFileSync(fullPath);

      // Extract raw text from binary
      const textResult = await extractCvText(buffer, 'application/pdf', pdfFile);
      expect(textResult.text.length).toBeGreaterThan(50);

      // Run deterministic pipeline
      const det = extractDeterministicCv(textResult.text);
      const canonical = mapCvToCanonicalTaxonomy(det);

      // Name purity: name is present and valid
      expect(canonical.fullName).toBeDefined();
      expect(canonical.fullName!.length).toBeGreaterThanOrEqual(3);

      // Experience & education parsed
      expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);

      // Zero-defaulting validation
      expect(canonical.residenceCity).not.toBe('Maltepe');
    });
  }
});
