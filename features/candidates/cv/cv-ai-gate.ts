import type {
  AiCvExtractionPayload,
} from '@/features/candidates/cv/cv.types';

export interface AiGateDecision {
  shouldCall: boolean;
  reason: string;
  unknownSemanticBlocks?: {
    unresolvedRoles?: string[];
    unstructuredBullets?: string[];
    needsSummarySynthesis: boolean;
    minimalContextSnippet: string;
  };
}

/**
 * AI Call Gate: Evaluates if deterministic extraction is sufficient or if minimal AI enrichment is strictly required.
 */
export function evaluateAiCallGate(
  deterministicPayload: AiCvExtractionPayload,
  rawMaskedText: string,
): AiGateDecision {
  const hasExperiences = deterministicPayload.experiences && deterministicPayload.experiences.length >= 1;
  const hasEducation = deterministicPayload.education && deterministicPayload.education.length >= 1;
  const hasSkills = deterministicPayload.skills && deterministicPayload.skills.length >= 4;
  const hasRole = (deterministicPayload.roles && deterministicPayload.roles.length > 0) || Boolean(deterministicPayload.experiences?.[0]?.role);
  const hasSector = deterministicPayload.sectors && deterministicPayload.sectors.length > 0;
  const hasSummary = Boolean(deterministicPayload.summary && deterministicPayload.summary.length >= 30);

  // If deterministic extraction succeeded across all essential dimensions, SKIP AI COMPLETELY!
  if (hasExperiences && hasEducation && hasSkills && hasRole && hasSector && hasSummary) {
    return {
      shouldCall: false,
      reason: 'Deterministic extraction complete: all canonical dimensions successfully resolved without AI.',
    };
  }

  // If semantic gaps exist, prepare MINIMAL payload for AI
  const unstructuredBullets: string[] = [];
  for (const exp of deterministicPayload.experiences || []) {
    if (exp.responsibilities && exp.responsibilities.length > 20) {
      unstructuredBullets.push(exp.responsibilities);
    }
  }

  const snippet = rawMaskedText.slice(0, 1500); // Strict token limit: max ~300-500 tokens

  return {
    shouldCall: true,
    reason: 'Semantic enrichment needed for unresolved roles or unstructured skills.',
    unknownSemanticBlocks: {
      unresolvedRoles: deterministicPayload.roles,
      unstructuredBullets: unstructuredBullets.slice(0, 5),
      needsSummarySynthesis: !hasSummary,
      minimalContextSnippet: snippet,
    },
  };
}
