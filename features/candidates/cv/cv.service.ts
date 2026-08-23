import 'server-only';

import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';
import { maskCvPii } from '@/features/candidates/cv/cv-pii-masker';
import { extractDeterministicCvSignals } from '@/features/candidates/cv/cv-deterministic-extractor';
import { extractCvWithSingleAiCall } from '@/features/candidates/cv/cv-ai-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { cvAnalysisCache } from '@/features/candidates/cv/cv-cache';
import { verifyCvPipelineIntegrity } from '@/features/candidates/cv/cv-data-loss-guard';
import { calculateCvQualityScore } from '@/features/candidates/cv/cv-quality-score';
import { validateAndReconcileCvPayload } from '@/features/candidates/cv/cv-cross-validator';
import { buildCvEvidenceGraph, enforceEvidenceGraphFirewall } from '@/features/candidates/cv/cv-evidence-graph';
import { cvContradictionEngine } from '@/features/candidates/cv/cv-contradiction-engine';
import {
  CV_EXTRACTION_VERSION,
  CAREER_TAXONOMY_VERSION,
  CV_PARSER_VERSION,
  type CvProfileDraftResult,
} from '@/features/candidates/cv/cv.types';

export class CvService {
  /**
   * CV EXTRACTION 3.0 UNIVERSAL PIPELINE:
   * 1. Multi-Format Ingestion with binary signature check (PDF / DOCX / TXT)
   * 2. Spatial Layout & Multi-Column Reading Order Reconstruction
   * 3. Deterministic PII Masking (KVKK Safe)
   * 4. SHA-256 Hash Cache Lookup
   * 5. Section Intelligence & Deterministic Entity Resolution
   * 6. Cross-Field Validation & Deduplication
   * 7. Gated Minimal-Context Grounded AI Fallback (0 or max 1 targeted call)
   * 8. Unified Canonical Taxonomy & Ontology Mapping
   * 9. Zero Data Loss Guard Verification
   * 10. Profile Draft Builder, Multi-Factor Confidence & Quality Scoring
   * 11. Cache Write & Return
   */
  async processCvBuffer(input: {
    buffer: Buffer;
    fileName: string;
    mimeType?: string;
    documentId?: string;
  }): Promise<CvProfileDraftResult> {
    const startTime = Date.now();

    // Step 1 & 2: Spatial Text Extraction & Layout Reconstruction
    const extractedText = await extractCvText(input.buffer, input.fileName, input.mimeType);

    // Step 3: Deterministic PII masking
    const piiResult = maskCvPii(extractedText.text);

    // Step 4: Cache Lookup
    const cachedResult = cvAnalysisCache.get(piiResult.maskedText);
    if (cachedResult) {
      cachedResult.metrics.processingTimeMs = Date.now() - startTime;
      return cachedResult;
    }

    // Step 5: Deterministic Pre-extraction signals
    const signals = extractDeterministicCvSignals(piiResult.maskedText);

    // Step 6: Extraction with AI Call Gate (0 or max 1 minimal call)
    let aiPayload = await extractCvWithSingleAiCall(piiResult.maskedText, signals);

    // Step 7: Cross-field consistency validation & deduplication
    aiPayload = validateAndReconcileCvPayload(aiPayload);

    // Step 7.5: Evidence Graph & Cross-Contamination Firewall Construction & Enforcement
    const evidenceGraph = buildCvEvidenceGraph({
      rawText: extractedText.text,
      rawExtraction: aiPayload,
    });
    aiPayload = enforceEvidenceGraphFirewall(aiPayload, evidenceGraph);
    const graphSummary = evidenceGraph.getSummary();

    // Step 8: Deterministic Canonical Taxonomy Mapping
    const canonical = mapCvToCanonicalTaxonomy(aiPayload);

    // Step 8.5: Cross-Field Contradiction Detection & Multi-Candidate Ranking
    const contradictionReport = cvContradictionEngine.detectContradictions({
      rawPayload: aiPayload,
      canonical,
      rawText: extractedText.text,
    });
    canonical.contradictions = contradictionReport.contradictions;
    canonical.roleCandidates = contradictionReport.roleCandidates;
    canonical.sectorCandidates = contradictionReport.sectorCandidates;

    // Step 9: Zero Data Loss Guard
    verifyCvPipelineIntegrity({
      rawExtraction: aiPayload,
      canonical,
    });

    // Step 10: Profile Draft Builder
    const draft = buildProfileDraftFromCanonicalResult(
      canonical,
      input.fileName,
      input.documentId,
    );

    console.log('[CV SERVER FORENSIC 01-UPLOAD]', { fileName: input.fileName, size: input.buffer?.length });
    console.log('[CV SERVER FORENSIC 02-RAW]', { textLength: extractedText.text.length, sample: extractedText.text.slice(0, 150) });
    console.log('[CV SERVER FORENSIC 04-EXTRACTED]', {
      fullName: aiPayload.fullName,
      roles: aiPayload.roles,
      sectors: aiPayload.sectors,
      experiences: aiPayload.experiences.length,
      education: aiPayload.education.length,
    });
    console.log('[CV SERVER FORENSIC 05-CANONICAL]', {
      fullName: canonical.fullName,
      primaryRole: canonical.primaryRole,
      primarySector: canonical.primarySector,
      residenceCity: canonical.residenceCity,
      residenceDistrict: canonical.residenceDistrict,
    });
    console.log('[CV SERVER FORENSIC 06-DRAFT]', {
      fullName: draft.formValues.fullName,
      desiredRole: draft.formValues.desiredRole,
      primarySector: draft.formValues.primarySector,
      experienceLevel: draft.formValues.experienceLevel,
      residenceCity: draft.formValues.residenceCity,
      residenceDistrict: draft.formValues.residenceDistrict,
      experiences: draft.formValues.experiences?.length,
      educationHistory: draft.formValues.educationHistory?.length,
    });

    // Step 11: Multi-Factor Quality Scoring & Exact Metrics
    const qualityReport = calculateCvQualityScore({
      canonical,
      experiences: aiPayload.experiences,
      summaryLength: canonical.summary.length,
    });

    const aiMetrics = (aiPayload as any)._aiMetrics;
    const deterministicCount =
      canonical.experiences.length +
      canonical.educationList.length +
      canonical.professionalSkills.length +
      canonical.technicalSkills.length +
      canonical.tools.length +
      (canonical.residenceCity ? 1 : 0) +
      (canonical.languages ? 1 : 0) +
      (canonical.certificates ? 1 : 0) +
      (canonical.summary ? 1 : 0);

    draft.metrics = {
      aiCallCount: aiMetrics?.aiCalled ? 1 : 0,
      aiCalled: Boolean(aiMetrics?.aiCalled),
      aiSkipped: Boolean(aiMetrics?.aiSkipped),
      inputTokens: aiMetrics?.inputTokens ?? 0,
      outputTokens: aiMetrics?.outputTokens ?? 0,
      estimatedCostUsd: aiMetrics?.estimatedCostUsd ?? 0,
      deterministicFieldsCount: deterministicCount,
      aiExtractedFieldsCount: aiMetrics?.aiCalled ? 4 : 0,
      taxonomyMappedCount: canonical.matchedRoles.length + canonical.matchedSectors.length,
      ambiguousCount: canonical.ambiguousItems.length,
      piiMaskedCount: piiResult.piiMaskedCount,
      cacheHit: false,
      extractionVersion: CV_EXTRACTION_VERSION,
      taxonomyVersion: CAREER_TAXONOMY_VERSION,
      parserVersion: CV_PARSER_VERSION,
      coverageScore: qualityReport.overallScore,
      confidenceScores: qualityReport.confidenceScores,
      processingTimeMs: Date.now() - startTime,
      contradictionsCount: contradictionReport.totalConflicts,
    };

    // Step 12: Store in cache
    cvAnalysisCache.set(piiResult.maskedText, draft);

    return draft;
  }
}

// Singleton export
export const cvService = new CvService();
