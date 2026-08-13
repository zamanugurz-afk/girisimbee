import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regression guards for password recovery anti-prefetch design.
 * GET /auth/callback must not call verifyOtp for token_hash recovery;
 * POST /api/auth/verify-recovery is the only consumer.
 */
describe('password recovery flow source guards', () => {
  const root = process.cwd();

  it('callback GET does not call verifyOtp for recovery token_hash path', () => {
    const src = readFileSync(join(root, 'app/auth/callback/route.ts'), 'utf8');
    expect(src).toMatch(/token_hash/);
    expect(src).toMatch(/AUTH_ROUTES\.recoveryContinue/);
    // Ensure the recovery token_hash branch redirects without verifyOtp nearby.
    const recoveryStart = src.indexOf('tokenHash && (type === \'recovery\' || passwordRecovery)');
    const recoveryBlock = src.slice(recoveryStart, recoveryStart + 350);
    expect(recoveryBlock).toMatch(/AUTH_ROUTES\.recoveryContinue/);
    expect(recoveryBlock).not.toMatch(/verifyOtp/);
  });

  it('verify-recovery POST is the verifyOtp consumer', () => {
    const src = readFileSync(join(root, 'app/api/auth/verify-recovery/route.ts'), 'utf8');
    expect(src).toMatch(/export async function POST/);
    expect(src).toMatch(/verifyOtp/);
    expect(src).toMatch(/type:\s*['"]recovery['"]/);
  });
});
