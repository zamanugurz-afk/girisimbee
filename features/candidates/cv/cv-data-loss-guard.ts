import type {
  AiCvExtractionPayload,
  CanonicalTaxonomyMappingResult,
  CvProfileDraftResult,
} from '@/features/candidates/cv/cv.types';

export class CvDataLossError extends Error {
  constructor(
    public readonly field: string,
    public readonly beforeCount: number,
    public readonly afterCount: number,
    public readonly stage: string,
  ) {
    super(
      `[CV Pipeline Data Loss] Field '${field}' count reduced from ${beforeCount} to ${afterCount} in stage '${stage}'`,
    );
    this.name = 'CvDataLossError';
  }
}

export function assertExperienceCountNotReduced(
  beforeCount: number,
  afterCount: number,
  stage: string = 'unknown',
): void {
  if (afterCount < beforeCount) {
    throw new CvDataLossError('experiences', beforeCount, afterCount, stage);
  }
}

export function assertEducationCountNotReduced(
  beforeCount: number,
  afterCount: number,
  stage: string = 'unknown',
): void {
  if (afterCount < beforeCount) {
    throw new CvDataLossError('education', beforeCount, afterCount, stage);
  }
}

export function assertSkillsCountNotReduced(
  beforeCount: number,
  afterCount: number,
  stage: string = 'unknown',
): void {
  if (afterCount < beforeCount) {
    throw new CvDataLossError('skills', beforeCount, afterCount, stage);
  }
}

export function assertToolsCountNotReduced(
  beforeCount: number,
  afterCount: number,
  stage: string = 'unknown',
): void {
  if (afterCount < beforeCount) {
    throw new CvDataLossError('tools', beforeCount, afterCount, stage);
  }
}

export function assertLanguageCountNotReduced(
  beforeCount: number,
  afterCount: number,
  stage: string = 'unknown',
): void {
  if (afterCount < beforeCount) {
    throw new CvDataLossError('languages', beforeCount, afterCount, stage);
  }
}

export function assertCertificateCountNotReduced(
  beforeCount: number,
  afterCount: number,
  stage: string = 'unknown',
): void {
  if (afterCount < beforeCount) {
    throw new CvDataLossError('certificates', beforeCount, afterCount, stage);
  }
}

/**
 * Validates integrity across consecutive pipeline stages.
 */
export function verifyCvPipelineIntegrity(input: {
  rawExtraction: AiCvExtractionPayload;
  canonical: CanonicalTaxonomyMappingResult;
  draft?: CvProfileDraftResult;
}): { valid: boolean; lossDetected: boolean; details: Record<string, { before: number; after: number }> } {
  const details: Record<string, { before: number; after: number }> = {};
  let lossDetected = false;

  // 1. Experiences
  const rawExp = input.rawExtraction.experiences?.length ?? 0;
  const canonicalExp = input.canonical.experiences?.length ?? 0;
  details.experiences = { before: rawExp, after: canonicalExp };
  if (canonicalExp < rawExp) lossDetected = true;

  // 2. Education
  const rawEdu = input.rawExtraction.education?.length ?? 0;
  const canonicalEdu = input.canonical.educationList?.length ?? (input.canonical.educationLevel ? 1 : 0);
  details.education = { before: rawEdu, after: canonicalEdu };
  if (canonicalEdu < rawEdu) lossDetected = true;

  // 3. Skills
  const rawSkills = input.rawExtraction.skills?.length ?? 0;
  const canonicalSkills = input.canonical.professionalSkills.length + input.canonical.technicalSkills.length;
  details.skills = { before: rawSkills, after: canonicalSkills };
  // If raw had skills, canonical should preserve them
  if (rawSkills > 0 && canonicalSkills === 0) lossDetected = true;

  // 4. Tools
  const rawTools = input.rawExtraction.tools?.length ?? 0;
  const canonicalTools = input.canonical.tools?.length ?? 0;
  details.tools = { before: rawTools, after: canonicalTools };
  if (rawTools > 0 && canonicalTools === 0) lossDetected = true;

  return {
    valid: !lossDetected,
    lossDetected,
    details,
  };
}
