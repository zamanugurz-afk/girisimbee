import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CvService } from '@/features/candidates/cv/cv.service';
import { extractCvText } from '@/features/candidates/cv/cv-text-extractor';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { buildCvEvidenceGraph } from '@/features/candidates/cv/cv-evidence-graph';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';

describe('Real CV Binary Files Desktop Forensic Red Team Suite', () => {
  const service = new CvService();

  // Test 1: CV - UĞUR ZAMAN (4).pdf
  it('Real Document 1: "CV - UĞUR ZAMAN (4).pdf" Forensic Inspection & Zero Contamination', async () => {
    const filePath = 'C:/Users/ugurz/Desktop/CV - UĞUR ZAMAN (4).pdf';
    if (!fs.existsSync(filePath)) {
      console.warn('[SKIP: File not on Desktop]:', filePath);
      return;
    }

    const buffer = fs.readFileSync(filePath);
    const fileName = 'CV - UĞUR ZAMAN (4).pdf';

    // 1. Text & Spatial Extraction
    const extracted = await extractCvText(buffer, fileName, 'application/pdf');
    expect(extracted.text.length).toBeGreaterThan(500);

    // 2. Deterministic Extraction
    const detRes = extractDeterministicCv(extracted.text, fileName);
    expect(detRes.fullName).toBe('Uğur Zaman');
    expect(detRes.fullName).not.toBe('Eğitim');

    // 3. Evidence Graph & Firewall
    const graph = buildCvEvidenceGraph({
      rawText: extracted.text,
      rawExtraction: detRes,
    });
    expect(graph.getFirewallViolations()).toHaveLength(0);
    expect(graph.getActiveNodes().length).toBeGreaterThanOrEqual(5);

    // 4. Canonical Taxonomy Mapping
    const canonical = mapCvToCanonicalTaxonomy(detRes);
    expect(canonical.fullName).toBe('Uğur Zaman');
    expect(canonical.primarySector).toBe('Çağrı merkezi');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(canonical.primaryRole).not.toBe('Uzman');

    // 5. Full Pipeline Service Call
    const draftResult = await service.processCvBuffer({
      buffer,
      fileName,
      mimeType: 'application/pdf',
    });

    expect(draftResult.formValues.fullName).toBe('Uğur Zaman');
    expect(draftResult.formValues.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(draftResult.formValues.primarySector).toBe('Çağrı merkezi');
    expect(draftResult.formValues.experienceLevel).toBe('Yönetici');
    expect(draftResult.formValues.residenceCity).toBe('İstanbul');
    expect(draftResult.formValues.residenceDistrict).toBe('Maltepe');
    expect(draftResult.formValues.experiences?.length).toBe(6);
    expect(draftResult.formValues.educationHistory?.length).toBe(2);
    expect(draftResult.formValues.professionalSkillsList?.length).toBe(6);
  });

  // Test 2: CV BURAK BATIL ÖZDEMİR.pdf
  it('Real Document 2: "CV BURAK BATIL ÖZDEMİR.pdf" Forensic Inspection & Zero Contamination', async () => {
    const filePath = 'C:/Users/ugurz/Desktop/CV BURAK BATIL ÖZDEMİR.pdf';
    if (!fs.existsSync(filePath)) {
      console.warn('[SKIP: File not on Desktop]:', filePath);
      return;
    }

    const buffer = fs.readFileSync(filePath);
    const fileName = 'CV BURAK BATIL ÖZDEMİR.pdf';

    // 1. Text & Spatial Extraction
    const extracted = await extractCvText(buffer, fileName, 'application/pdf');
    expect(extracted.text.length).toBeGreaterThan(100);

    // 2. Deterministic Extraction
    const detRes = extractDeterministicCv(extracted.text);
    console.log('[BURAK BATIL DET RES]:', {
      fullName: detRes.fullName,
      roles: detRes.roles,
      sectors: detRes.sectors,
      experiences: detRes.experiences?.length,
      education: detRes.education?.length,
    });

    // 3. Full Pipeline Service Call
    const draftResult = await service.processCvBuffer({
      buffer,
      fileName,
      mimeType: 'application/pdf',
    });

    console.log('[BURAK BATIL DRAFT RESULT]:', {
      fullName: draftResult.formValues.fullName,
      desiredRole: draftResult.formValues.desiredRole,
      primarySector: draftResult.formValues.primarySector,
      experiences: draftResult.formValues.experiences?.length,
      education: draftResult.formValues.educationHistory?.length,
    });

    // Negative assertions (Forbidden values)
    const forbidden = ['Eğitim', 'Deneyim', 'Referanslar', 'Uzman', 'Kamu / Belediye'];
    expect(forbidden.includes(draftResult.formValues.fullName || '')).toBe(false);
    expect(draftResult.formValues.primarySector).not.toBe('Kamu / Belediye');
    expect(draftResult.formValues.desiredRole).not.toBe('Uzman');
  });
});
