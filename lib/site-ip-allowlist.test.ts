import { describe, expect, it } from 'vitest';
import { ipMatchesAllowlistEntry, isIpGatePublicPath, normalizeIp } from '@/lib/site-ip-allowlist';
import { isMaintenanceBypassPath } from '@/lib/site-mode';

describe('site IP preview gate', () => {
  it('matches this machine IPv4 and rotating IPv6 /64', () => {
    expect(ipMatchesAllowlistEntry('159.146.69.219', '159.146.69.219')).toBe(true);
    expect(ipMatchesAllowlistEntry('95.2.45.51', '95.2.45.51')).toBe(true);
    expect(ipMatchesAllowlistEntry('95.2.45.51', '95.2.0.0/16')).toBe(true);
    expect(ipMatchesAllowlistEntry('95.2.99.100', '95.2.0.0/16')).toBe(true);
    expect(ipMatchesAllowlistEntry('95.3.1.1', '95.2.0.0/16')).toBe(false);
    expect(ipMatchesAllowlistEntry('10.22.51.74', '10.0.0.0/8')).toBe(true);
    expect(
      ipMatchesAllowlistEntry(
        '2a02:ff0:3d10:ddae:adcd:8276:398:8e2e',
        '2a02:ff0:3d10:ddae::/64',
      ),
    ).toBe(true);
    expect(
      ipMatchesAllowlistEntry(
        '2a02:ff0:3d10:ddae:1986:abe4:532:6be8',
        '2a02:ff0:3d10:ddae::/64',
      ),
    ).toBe(true);
    expect(
      ipMatchesAllowlistEntry('2a02:ff0:3d10:ffff::1', '2a02:ff0:3d10:ddae::/64'),
    ).toBe(false);
  });

  it('normalizes IPv4-mapped IPv6', () => {
    expect(normalizeIp('::ffff:159.146.69.219')).toBe('159.146.69.219');
  });

  it('does not expose product routes while the public gate is on', () => {
    expect(isIpGatePublicPath('/')).toBe(false);
    expect(isIpGatePublicPath('/ilan/olustur')).toBe(false);
    expect(isIpGatePublicPath('/giris')).toBe(false);
    expect(isIpGatePublicPath('/api/listings')).toBe(false);
    expect(isIpGatePublicPath('/dashboard')).toBe(false);
    expect(isIpGatePublicPath('/bakim')).toBe(true);
    expect(isMaintenanceBypassPath('/ilan/foo')).toBe(false);
    expect(isMaintenanceBypassPath('/api/health')).toBe(false);
  });
});
