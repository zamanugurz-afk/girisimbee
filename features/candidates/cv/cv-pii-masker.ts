import type { ExtractedContactInfo, MaskedCvResult } from '@/features/candidates/cv/cv.types';

// Email regex pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone regex pattern (handles +90, 05xx, spaced, dotted, parenthesized)
const PHONE_REGEX = /(?:\+?90[\s.-]?)?(?:\(?0?5\d{2}\)?[\s.-]?)\d{3}[\s.-]?\d{2}[\s.-]?\d{2}|\b05\d{9}\b|\b5\d{9}\b/g;

// LinkedIn profile regex
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub|profile)\/[a-zA-Z0-9_-]+/gi;

// General website / portfolio regex
const WEBSITE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:github\.com|behance\.net|dribbble\.com|medium\.com|gitlab\.com|[a-zA-Z0-9-]+\.(?:com|org|net|io|me|dev|co))(?:\/[^\s,)]*)?/gi;

/**
 * Deterministically extracts PII (email, phone, LinkedIn, websites)
 * and returns completely sanitized text with [EMAIL], [PHONE], [LINKEDIN], [WEBSITE] tokens.
 */
export function maskCvPii(rawText: string): MaskedCvResult {
  if (!rawText) {
    return {
      rawText: '',
      maskedText: '',
      contacts: { emails: [], phones: [], linkedInUrls: [], websites: [] },
      piiMaskedCount: 0,
    };
  }

  const emails: string[] = [];
  const phones: string[] = [];
  const linkedInUrls: string[] = [];
  const websites: string[] = [];

  let piiCount = 0;

  // 1. Extract & Mask LinkedIn URLs first (before generic websites)
  let masked = rawText.replace(LINKEDIN_REGEX, (match) => {
    linkedInUrls.push(match.trim());
    piiCount++;
    return '[LINKEDIN]';
  });

  // 2. Extract & Mask Emails
  masked = masked.replace(EMAIL_REGEX, (match) => {
    emails.push(match.trim());
    piiCount++;
    return '[EMAIL]';
  });

  // 3. Extract & Mask Phone Numbers
  masked = masked.replace(PHONE_REGEX, (match) => {
    const cleaned = match.replace(/[\s().-]/g, '');
    if (cleaned.length >= 10 && cleaned.length <= 13) {
      phones.push(match.trim());
      piiCount++;
      return '[PHONE]';
    }
    return match;
  });

  // 4. Extract & Mask other websites/portfolios
  masked = masked.replace(WEBSITE_REGEX, (match) => {
    if (match === '[LINKEDIN]' || match === '[EMAIL]' || match === '[PHONE]') {
      return match;
    }
    websites.push(match.trim());
    piiCount++;
    return '[WEBSITE]';
  });

  return {
    rawText,
    maskedText: masked,
    contacts: {
      emails: [...new Set(emails)],
      phones: [...new Set(phones)],
      linkedInUrls: [...new Set(linkedInUrls)],
      websites: [...new Set(websites)],
    },
    piiMaskedCount: piiCount,
  };
}
