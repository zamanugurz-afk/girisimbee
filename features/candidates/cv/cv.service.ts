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
import {
  CV_EXTRACTION_VERSION,
  CAREER_TAXONOMY_VERSION,
  CV_PARSER_VERSION,
  type CvProfileDraftResult,
} from '@/features/candidates/cv/cv.types';

export class CvService {
  /**
   * CV EXTRACTION 2.0 PIPELINE:
   * 1. Buffer -> Text extraction (PDF / DOCX)
   * 2. Text -> Deterministic PII masking
   * 3. Cache Check (SHA-256 hash lookup with version invalidation)
   * 4. Deterministic extraction (100% code-driven: dates, education, experiences, skills, tools)
   * 5. AI Call Gate -> Skip AI if complete (AI calls = 0) or minimal semantic enrichment (max 1 call)
   * 6. Canonical Taxonomy Mapping
   * 7. Zero Data Loss Guard Verification
   * 8. Profile Draft Builder & Confidence / Quality Scoring
   * 9. Cache write & Return
   */
  async processCvBuffer(input: {
    buffer: Buffer;
    fileName: string;
    mimeType?: string;
    documentId?: string;
  }): Promise<CvProfileDraftResult> {
    const startTime = Date.now();

    // Step 1: Text extraction
    const extractedText = await extractCvText(input.buffer, input.fileName, input.mimeType);

    // Step 2: Deterministic PII masking
    const piiResult = maskCvPii(extractedText.text);

    // Step 3: Cache Lookup
    const cachedResult = cvAnalysisCache.get(piiResult.maskedText);
    if (cachedResult) {
      cachedResult.metrics.processingTimeMs = Date.now() - startTime;
      return cachedResult;
    }

    // Step 4: Deterministic Pre-extraction signals
    const signals = extractDeterministicCvSignals(piiResult.maskedText);

    // Step 5: Extraction with AI Call Gate (0 or max 1 minimal call)
    const aiPayload = await extractCvWithSingleAiCall(piiResult.maskedText, signals);

    // Step 6: Deterministic Canonical Taxonomy Mapping
    const canonical = mapCvToCanonicalTaxonomy(aiPayload);

    // Step 7: Zero Data Loss Guard
    verifyCvPipelineIntegrity({
      rawExtraction: aiPayload,
      canonical,
    });

    // Step 8: Profile Draft Builder
    const draft = buildProfileDraftFromCanonicalResult(
      canonical,
      input.fileName,
      input.documentId,
    );

    // Step 9: Quality Scoring & Exact Metrics
    const qualityReport = calculateCvQualityScore({
      canonical,
      experiences: aiPayload.experiences,
      summaryLength: canonical.summary.length,
    });

    const aiMetrics = aiPayload._aiMetrics;
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
    };

    // Step 10: Store in cache
    cvAnalysisCache.set(piiResult.maskedText, draft);

    return draft;
  }
}

// Singleton export
export const cvService = new CvService();
