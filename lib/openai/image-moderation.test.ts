import { describe, expect, it } from 'vitest';
import { verdictFromModerationPayload } from '@/lib/openai/image-moderation-verdict';

describe('image moderation verdict', () => {
  it('allows a clean product photo', () => {
    expect(
      verdictFromModerationPayload({
        results: [{ flagged: false, categories: { sexual: false, 'sexual/minors': false } }],
      }),
    ).toEqual({ allowed: true });
  });

  it('blocks sexual content', () => {
    const verdict = verdictFromModerationPayload({
      results: [{ flagged: true, categories: { sexual: true, 'sexual/minors': false } }],
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/Çıplaklık/);
  });

  it('blocks sexual/minors ahead of other flags', () => {
    const verdict = verdictFromModerationPayload({
      results: [{ flagged: true, categories: { sexual: true, 'sexual/minors': true } }],
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/yüklenemez/);
  });
});
