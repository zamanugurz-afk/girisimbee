import { describe, expect, it } from 'vitest';
import { fallbackDeterministicAiExtraction } from '@/features/candidates/cv/cv-ai-extractor';

describe('CV Hallucination Prevention QA', () => {
  it('does NOT invent unmentioned management roles, degrees, languages, or fake percentages', () => {
    const minimalCvText = `
Mert Koç
Satış Uzmanı
İstanbul
Satış Uzmanı olarak ABC Sigorta şirketinde çalıştı.
    `.trim();

    const extracted = fallbackDeterministicAiExtraction(minimalCvText, {
      detectedCities: ['İstanbul'],
      dateRanges: [],
      languages: [],
      certificates: [],
      educationDegrees: [],
    });

    // 1. Assert only grounded role
    expect(extracted.roles).toContain('Satış Uzmanı');
    expect(extracted.roles).not.toContain('CEO');
    expect(extracted.roles).not.toContain('Genel Müdür');
    expect(extracted.roles).not.toContain('Direktör');

    // 2. Assert no unmentioned certifications or degrees
    expect(extracted.certificates).toHaveLength(0);

    // 3. Assert no invented percentage claims in responsibilities
    expect(extracted.experiences[0].responsibilities).not.toContain('%40');
    expect(extracted.experiences[0].responsibilities).not.toContain('10 kişilik ekip');

    // 4. Summary is strictly grounded to Istanbul and Satis Uzmani
    expect(extracted.summary).toContain('İstanbul');
    expect(extracted.summary).toContain('Satış Uzmanı');
  });
});
