import { describe, expect, it, vi } from 'vitest';
import * as openAiModule from '@/lib/openai/career-openai';
import { extractCvWithSingleAiCall } from '@/features/candidates/cv/cv-ai-extractor';

describe('CV Extraction 2.0 - Minimal AI Payload Tests', () => {
  it('sends only unresolved context and restricts prompt token size under 800 tokens', async () => {
    let capturedPrompt = '';
    vi.spyOn(openAiModule, 'openaiJsonCompletion').mockImplementation(async (args) => {
      capturedPrompt = args.user;
      return {
        model: 'gpt-4o-mini',
        json: {
          roles: ['Proje Yöneticisi'],
          summary: 'Kısa kariyer özeti.',
        },
      };
    });

    const semiStructuredCv = `
Aday Bilgisi
İstanbul
2020 - 2024 arasında çeşitli projelerde koordinasyon ve müşteri iletişimi sağladım.
`;

    await extractCvWithSingleAiCall(semiStructuredCv);

    expect(capturedPrompt.length).toBeGreaterThan(0);
    // Estimated token count = characters / 4
    const estimatedTokens = capturedPrompt.length / 4;
    expect(estimatedTokens).toBeLessThanOrEqual(800);
  });
});
