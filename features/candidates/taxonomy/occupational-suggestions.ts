import { suggestTools } from '@/features/candidates/taxonomy/career-tools';
import {
  suggestCertificates,
  suggestProfessionalSkills,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';
import {
  buildOccupationalContext,
  occupationalConfidence,
  occupationalFingerprint,
  relatedOccupationsFor,
  shouldUseOccupationalAi,
  type OccupationalProfileInput,
  type OccupationalRelatedOccupation,
} from '@/features/candidates/taxonomy/occupational-context';

export type OccupationalSuggestionResult = {
  professionalSkills: string[];
  technicalSkills: string[];
  tools: string[];
  certificates: string[];
  relatedOccupations: OccupationalRelatedOccupation[];
  confidence: number;
  fingerprint: string;
  source: 'taxonomy';
  needsAi: boolean;
};

export function resolveOccupationalSuggestions(
  input: OccupationalProfileInput,
): OccupationalSuggestionResult {
  const context = buildOccupationalContext(input);
  const confidence = occupationalConfidence(context);
  return {
    professionalSkills: suggestProfessionalSkills(input),
    technicalSkills: suggestTechnicalSkills(input),
    tools: suggestTools(input),
    certificates: suggestCertificates(input),
    relatedOccupations: relatedOccupationsFor(context),
    confidence,
    fingerprint: occupationalFingerprint(context),
    source: 'taxonomy',
    needsAi: shouldUseOccupationalAi(confidence, context),
  };
}
