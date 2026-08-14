export type CareerAiAutoAnalyzeDecision = 'skip' | 'show-cached' | 'request';

/**
 * Auto-analyze only when the compact profile first becomes ready.
 * Same fingerprint never requests twice. Step revisits / keystrokes are not triggers.
 */
export function decideCareerAiAutoAnalyze(input: {
  profileReady: boolean;
  disabled?: boolean;
  fingerprint: string;
  dismissedFingerprint?: string | null;
  hasCachedResult: boolean;
  alreadyRequested: boolean;
}): CareerAiAutoAnalyzeDecision {
  if (input.disabled || !input.profileReady || !input.fingerprint) return 'skip';
  if (input.dismissedFingerprint && input.dismissedFingerprint === input.fingerprint) {
    return 'skip';
  }
  if (input.hasCachedResult) return 'show-cached';
  if (input.alreadyRequested) return 'skip';
  return 'request';
}
