import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  resetRateLimitBucketsForTests,
} from '@/lib/api/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimitBucketsForTests();
  });

  it('allows requests under the limit', () => {
    const now = 1_000_000;
    expect(checkRateLimit('k', 3, 60_000, now).ok).toBe(true);
    expect(checkRateLimit('k', 3, 60_000, now + 1).ok).toBe(true);
    expect(checkRateLimit('k', 3, 60_000, now + 2).ok).toBe(true);
  });

  it('blocks when limit exceeded and resets after window', () => {
    const now = 2_000_000;
    checkRateLimit('block', 2, 10_000, now);
    checkRateLimit('block', 2, 10_000, now + 1);
    const blocked = checkRateLimit('block', 2, 10_000, now + 2);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
    expect(checkRateLimit('block', 2, 10_000, now + 10_001).ok).toBe(true);
  });
});
