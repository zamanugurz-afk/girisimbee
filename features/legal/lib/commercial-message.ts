import { LEGAL_COMMERCIAL_MESSAGE_STATUS } from '@/features/legal/config/legal-third-party.config';
import { sendTransactionalEmail, type TransactionalEmailResult } from '@/lib/email/send';

/**
 * Commercial / marketing messages — hard-gated until IYS + marketingSendEnabled.
 * Transactional mail must use sendTransactionalEmail directly, not this helper.
 */
export async function sendCommercialEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Caller must confirm user has marketing/email consent stored. */
  userHasMarketingConsent: boolean;
}): Promise<TransactionalEmailResult> {
  if (!LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled) {
    return {
      ok: false,
      skipped: true,
      reason: 'marketingSendEnabled=false (IYS / commercial stack not configured)',
    };
  }
  if (!LEGAL_COMMERCIAL_MESSAGE_STATUS.iysConfigured) {
    return { ok: false, skipped: true, reason: 'IYS integration NOT CONFIGURED' };
  }
  if (!input.userHasMarketingConsent) {
    return { ok: false, skipped: true, reason: 'user marketing consent missing' };
  }
  return sendTransactionalEmail({
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
