import 'server-only';

import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';
import { maskCvPii } from '@/features/candidates/cv/cv-pii-masker';
import { extractDeterministicCvSignals } from '@/features/candidates/cv/cv-deterministic-extractor';
import { extractCvWithSingleAiCall } from '@/features/candidates/cv/cv-ai-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';

export class CvService {
  /**
   * Universal CV analysis pipeline:
   * 1. Buffer -> Text extraction (PDF / DOCX)
   * 2. Text -> PII masking (sanitizes email, phone, LinkedIn, websites)
   * 3. Deterministic extraction (cities, dates, languages, degrees, certificates)
   * 4. Single AI extraction call (structured data + grounded summary)
   * 5. Deterministic taxonomy mapping (canonical roles, sectors, tools)
   * 6. Profile draft builder (preferences kept for user confirmation)
   */
  async processCvBuffer(input: {
    buffer: Buffer;
    fileName: string;
    mimeType?: string;
    documentId?: string;
  }): Promise<CvProfileDraftResult> {
    // Step 1: Text extraction
    const extractedText = await extractCvText(input.buffer, input.fileName, input.mimeType);

    // Step 2: Deterministic PII masking
    const piiResult = maskCvPii(extractedText.text);

    // Step 3: Deterministic Pre-extraction signals
    const signals = extractDeterministicCvSignals(piiResult.maskedText);

    // Step 4: Single AI Extraction call (Exactly 1 call)
    const aiPayload = await extractCvWithSingleAiCall(piiResult.maskedText, signals);

    // Step 5: Deterministic Canonical Taxonomy Mapping
    const canonical = mapCvToCanonicalTaxonomy(aiPayload);

    // Step 6: Profile Draft Builder
    const draft = buildProfileDraftFromCanonicalResult(
      canonical,
      input.fileName,
      input.documentId,
    );

    // Update metrics with exact counts
    draft.metrics.piiMaskedCount = piiResult.piiMaskedCount;
    draft.metrics.deterministicFieldsCount =
      signals.detectedCities.length +
      signals.dateRanges.length +
      signals.languages.length +
      signals.certificates.length +
      signals.educationDegrees.length;

    return draft;
  }
}

// Singleton export
export const cvService = new CvService();
