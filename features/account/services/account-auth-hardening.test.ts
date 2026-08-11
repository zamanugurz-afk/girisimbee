import { describe, expect, it } from 'vitest';
import { AccountService } from '@/features/account/services/account.service';
import { MockAccountProfileRepository } from '@/features/account/repository/mock/account-profile.repository.mock';
import { MockUserConsentRepository } from '@/features/account/repository/mock/user-consent.repository.mock';
import { MockUserSettingsRepository } from '@/features/account/repository/mock/user-settings.repository.mock';
import { MockUserSecurityLogRepository } from '@/features/account/repository/mock/user-security-log.repository.mock';
import { ids } from '@/lib/domain/ids';
import { DEFAULT_OAUTH_CONSENTS } from '@/features/authentication/lib/oauth-bootstrap';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';

function createService() {
  const profiles = new MockAccountProfileRepository();
  const consents = new MockUserConsentRepository();
  const settings = new MockUserSettingsRepository();
  const securityLogs = new MockUserSecurityLogRepository();
  const service = new AccountService(profiles, consents, settings, securityLogs);
  return { service, profiles, consents, settings, securityLogs };
}

describe('AccountService auth/profile hardening', () => {
  it('signup metadata role=admin → persisted role user', async () => {
    const { service, profiles } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000001');
    await service.bootstrapFromSignup({
      userId,
      email: 'a@example.com',
      role: 'admin',
      consents: {
        acceptTerms: true,
        acceptPrivacy: true,
        acceptKvkk: true,
        acceptCookies: true,
        consentCommercial: false,
        consentSms: false,
        consentEmail: true,
      },
    });
    const profile = await profiles.findByUserId(userId);
    expect(profile?.role).toBe('user');
  });

  it('signup metadata role=super_admin → persisted role user', async () => {
    const { service, profiles } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000002');
    await service.bootstrapFromSignup({
      userId,
      email: 'b@example.com',
      role: 'super_admin',
    });
    expect((await profiles.findByUserId(userId))?.role).toBe('user');
  });

  it('OAuth bootstrap forces role user even if role=admin passed', async () => {
    const { service, profiles } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000003');
    await service.bootstrapFromSignup({
      userId,
      email: 'oauth@example.com',
      role: 'admin',
      consents: DEFAULT_OAUTH_CONSENTS,
    });
    expect((await profiles.findByUserId(userId))?.role).toBe('user');
  });

  it('preserves existing admin on re-bootstrap', async () => {
    const { service, profiles } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000004');
    await profiles.upsert({ userId, email: 'admin@example.com', role: 'admin' });
    // Force-seed elevated role (upsert path only sets role on insert).
    await profiles.update(userId, {});
    const seeded = await profiles.findByUserId(userId);
    // Directly mutate mock store role for admin seed (update strips role).
    (seeded as { role: string }).role = 'admin';

    const result = await service.bootstrapFromSignup({
      userId,
      email: 'admin@example.com',
      role: 'user',
    });
    expect(result.profile.role).toBe('admin');
  });

  it('preserves existing super_admin on re-bootstrap', async () => {
    const { service, profiles } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000005');
    await profiles.upsert({ userId, email: 'sa@example.com', role: 'super_admin' });
    const seeded = await profiles.findByUserId(userId);
    (seeded as { role: string }).role = 'super_admin';

    const result = await service.bootstrapFromSignup({
      userId,
      role: 'admin',
    });
    expect(result.profile.role).toBe('super_admin');
  });

  it('updateProfile strips role escalation attempts', async () => {
    const { service, profiles } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000006');
    await profiles.upsert({ userId, email: 'u@example.com', role: 'user' });
    await service.updateProfile(userId, {
      firstName: 'Ugur',
      role: 'admin',
    });
    expect((await profiles.findByUserId(userId))?.role).toBe('user');

    await service.updateProfile(userId, { role: 'super_admin' });
    expect((await profiles.findByUserId(userId))?.role).toBe('user');
  });

  it('optional consent changes append a new row (no history rewrite)', async () => {
    const { service, consents } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000007');
    await service.recordLegalAcceptance({
      userId,
      termsAccepted: true,
      privacyAccepted: true,
      kvkkAcknowledged: true,
      cookiesAcknowledged: true,
      termsVersion: LEGAL_DOCUMENT_VERSIONS.user_terms.version,
      privacyVersion: LEGAL_DOCUMENT_VERSIONS.privacy.version,
      kvkkAckVersion: LEGAL_DOCUMENT_VERSIONS.kvkk_clarification.version,
      cookiesVersion: LEGAL_DOCUMENT_VERSIONS.cookie_policy.version,
    });
    await service.updateOptionalConsents({
      userId,
      marketingAccepted: true,
    });
    await service.updateOptionalConsents({
      userId,
      marketingAccepted: false,
    });
    const rows = await consents.listByUserId(userId);
    expect(rows.length).toBe(3);
    expect(rows.some((r) => r.marketingAccepted === true)).toBe(true);
    expect(rows.some((r) => r.marketingAccepted === false)).toBe(true);
    expect(rows[0]?.marketingAccepted).toBe(false);
  });

  it('security logs are append-only via service create API', async () => {
    const { service, securityLogs } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000008');
    await service.logSecurity({ userId, action: 'login' });
    await service.logSecurity({ userId, action: 'logout' });
    const rows = await securityLogs.listByUserId(userId);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.action).sort()).toEqual(['login', 'logout']);
  });

  it('legal gate still records USER_TERMS_V1 / PRIVACY_V1 / KVKK_V1 / COOKIE_V1', async () => {
    const { service } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000009');
    const consent = await service.recordLegalAcceptance({
      userId,
      termsAccepted: true,
      privacyAccepted: true,
      kvkkAcknowledged: true,
      cookiesAcknowledged: true,
      termsVersion: LEGAL_DOCUMENT_VERSIONS.user_terms.version,
      privacyVersion: LEGAL_DOCUMENT_VERSIONS.privacy.version,
      kvkkAckVersion: LEGAL_DOCUMENT_VERSIONS.kvkk_clarification.version,
      cookiesVersion: LEGAL_DOCUMENT_VERSIONS.cookie_policy.version,
    });
    expect(consent.termsVersion).toBe('USER_TERMS_V1');
    expect(consent.privacyVersion).toBe('PRIVACY_V1');
    expect(consent.kvkkAckVersion).toBe('KVKK_V1');
    expect(consent.cookiesVersion).toBe('COOKIE_V1');
  });

  it('creates profile + settings on new signup', async () => {
    const { service, settings } = createService();
    const userId = ids.user('a0000001-0001-4000-8000-000000000010');
    const result = await service.bootstrapFromSignup({
      userId,
      email: 'new@example.com',
      firstName: 'Ada',
    });
    expect(result.profile.email).toBe('new@example.com');
    expect(result.profile.role).toBe('user');
    expect(await settings.findByUserId(userId)).not.toBeNull();
  });
});
