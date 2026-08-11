import { describe, expect, it } from 'vitest';
import {
  LEGAL_COMPANY_PROFILE_COMPLETE,
  getMissingLegalCompanyFields,
  getResolvedLegalCompany,
  resolveLegalCompanyField,
} from '@/features/legal/config/legal-company.config';
import {
  checkLegalConfiguration,
  containsLegalPlaceholder,
  isLegalPublicPublishAllowed,
} from '@/features/legal/config/legal-launch-gate';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import { LEGAL_COMMERCIAL_MESSAGE_STATUS } from '@/features/legal/config/legal-third-party.config';
import { buildUserTermsDocument } from '@/features/legal/content/user-terms.v1';
import { buildPrivacyDocument } from '@/features/legal/content/privacy.v1';
import { buildKvkkClarificationDocument } from '@/features/legal/content/kvkk-clarification.v1';
import { buildExplicitConsentHubDocument } from '@/features/legal/content/explicit-consents.v1';
import { buildCookiePolicyDocument } from '@/features/legal/content/cookie-policy.v1';
import { materializeDocument } from '@/features/legal/lib/legal-document.utils';
import {
  DEFAULT_COOKIE_PREFS,
  writeCookiePrefs,
  readCookiePrefs,
} from '@/features/legal/lib/cookie-prefs';
import { AccountService } from '@/features/account/services/account.service';
import { MockAccountProfileRepository } from '@/features/account/repository/mock/account-profile.repository.mock';
import { MockUserConsentRepository } from '@/features/account/repository/mock/user-consent.repository.mock';
import { MockUserSettingsRepository } from '@/features/account/repository/mock/user-settings.repository.mock';
import { MockUserSecurityLogRepository } from '@/features/account/repository/mock/user-security-log.repository.mock';
import { AccountDataRightsService } from '@/features/account/services/account-data-rights.service';
import { ids } from '@/lib/domain/ids';
import { DEFAULT_OAUTH_CONSENTS } from '@/features/authentication/lib/oauth-bootstrap';
import {
  areAllPublishConsentsAccepted,
  buildPublishConsentItemSnapshots,
  EMPTY_PUBLISH_CONSENTS,
} from '@/features/kvkk/constants/publish-consent-policy';

describe('legal config', () => {
  it('keeps company profile incomplete until real data is filled', () => {
    expect(LEGAL_COMPANY_PROFILE_COMPLETE).toBe(false);
    expect(getMissingLegalCompanyFields().length).toBeGreaterThan(0);
    expect(checkLegalConfiguration().code).toBe('LEGAL_CONFIGURATION_INCOMPLETE');
    expect(checkLegalConfiguration().ok).toBe(false);
  });

  it('resolves placeholders for empty registry fields', () => {
    expect(resolveLegalCompanyField('legalName')).toContain('[ŞİRKET');
    expect(resolveLegalCompanyField('taxNumber')).toContain('[VERGİ');
    const company = getResolvedLegalCompany();
    expect(company.tradeName).toBe('Girisimbee');
  });

  it('detects placeholder tokens', () => {
    expect(containsLegalPlaceholder('[ŞİRKET TİCARİ UNVANI]')).toBe(true);
    expect(containsLegalPlaceholder('Girisimbee')).toBe(false);
  });

  it('allows incomplete legal pages outside production', () => {
    expect(isLegalPublicPublishAllowed()).toBe(true);
  });
});

describe('legal document versions', () => {
  it('versions user terms and related docs', () => {
    expect(LEGAL_DOCUMENT_VERSIONS.user_terms.version).toBe('USER_TERMS_V1');
    expect(LEGAL_DOCUMENT_VERSIONS.privacy.version).toBe('PRIVACY_V1');
    expect(LEGAL_DOCUMENT_VERSIONS.kvkk_clarification.version).toBe('KVKK_V1');
    expect(LEGAL_DOCUMENT_VERSIONS.cookie_policy.version).toBe('COOKIE_V1');
  });
});

describe('legal page content builders', () => {
  it('builds user terms without inventing tax/mersis numbers as real values', () => {
    const doc = materializeDocument(buildUserTermsDocument());
    expect(doc.meta.title).toMatch(/Kullanıcı/i);
    expect(doc.sections.length).toBeGreaterThan(10);
    const flat = [doc.intro, ...doc.sections.flatMap((s) => s.paragraphs)].join(' ');
    expect(flat).not.toMatch(/\b1234567890\b/);
    expect(containsLegalPlaceholder(flat) || flat.includes('Girisimbee')).toBe(true);
  });

  it('builds privacy, kvkk, consent hub, cookie policy', () => {
    expect(materializeDocument(buildPrivacyDocument()).sections.length).toBeGreaterThan(3);
    expect(materializeDocument(buildKvkkClarificationDocument()).sections.length).toBeGreaterThan(5);
    expect(materializeDocument(buildExplicitConsentHubDocument()).sections.length).toBeGreaterThan(3);
    expect(materializeDocument(buildCookiePolicyDocument()).sections.length).toBeGreaterThan(2);
  });
});

describe('cookie preference persistence', () => {
  it('defaults non-essential off', () => {
    expect(DEFAULT_COOKIE_PREFS.necessary).toBe(true);
    expect(DEFAULT_COOKIE_PREFS.analytics).toBe(false);
    expect(DEFAULT_COOKIE_PREFS.marketing).toBe(false);
  });

  it('persists prefs in localStorage when available', () => {
    const store: Record<string, string> = {};
    const storage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    } satisfies Storage;
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: storage,
        dispatchEvent: () => true,
      },
      configurable: true,
    });
    writeCookiePrefs({ functional: true, analytics: false, marketing: false });
    const prefs = readCookiePrefs();
    expect(prefs?.functional).toBe(true);
    expect(prefs?.analytics).toBe(false);
  });
});

describe('consent create + withdrawal', () => {
  function makeService() {
    return new AccountService(
      new MockAccountProfileRepository(),
      new MockUserConsentRepository(),
      new MockUserSettingsRepository(),
      new MockUserSecurityLogRepository(),
    );
  }

  it('creates consents and records legal acceptance with versions', async () => {
    const service = makeService();
    const userId = ids.user('00000000-0000-4000-8000-000000000001');
    await service.bootstrapFromSignup({
      userId,
      email: 'a@example.com',
      consents: { ...DEFAULT_OAUTH_CONSENTS },
    });
    expect(await service.needsLegalAcceptance(userId)).toBe(true);

    await service.recordLegalAcceptance({
      userId,
      termsAccepted: true,
      privacyAccepted: true,
      kvkkAcknowledged: true,
      cookiesAcknowledged: true,
      termsVersion: 'USER_TERMS_V1',
      privacyVersion: 'PRIVACY_V1',
      kvkkAckVersion: 'KVKK_V1',
      cookiesVersion: 'COOKIE_V1',
      source: 'test',
    });
    expect(await service.needsLegalAcceptance(userId)).toBe(false);
    const latest = await service.getLatestConsent(userId);
    expect(latest?.termsVersion).toBe('USER_TERMS_V1');
  });

  it('withdraws marketing consent', async () => {
    const service = makeService();
    const userId = ids.user('00000000-0000-4000-8000-000000000002');
    await service.bootstrapFromSignup({
      userId,
      email: 'b@example.com',
      consents: {
        acceptTerms: true,
        acceptPrivacy: true,
        acceptKvkk: true,
        acceptCookies: true,
        consentCommercial: true,
        consentSms: true,
        consentEmail: true,
      },
    });
    const updated = await service.updateOptionalConsents({
      userId,
      marketingAccepted: false,
      smsAccepted: false,
    });
    expect(updated.marketingAccepted).toBe(false);
    expect(updated.marketingWithdrawnAt).toBeTruthy();
  });
});

describe('oauth legal defaults', () => {
  it('does not auto-accept legal documents', () => {
    expect(DEFAULT_OAUTH_CONSENTS.acceptTerms).toBe(false);
    expect(DEFAULT_OAUTH_CONSENTS.acceptKvkk).toBe(false);
    expect(DEFAULT_OAUTH_CONSENTS.acceptPrivacy).toBe(false);
    expect(DEFAULT_OAUTH_CONSENTS.acceptCookies).toBe(false);
  });
});

describe('listing publish consents', () => {
  it('requires all publish consents and builds snapshots', () => {
    expect(areAllPublishConsentsAccepted(EMPTY_PUBLISH_CONSENTS)).toBe(false);
    const full = {
      clarificationText: true,
      phoneDisplay: true,
      explicitConsent: true,
    };
    expect(areAllPublishConsentsAccepted(full)).toBe(true);
    const snaps = buildPublishConsentItemSnapshots(full);
    expect(snaps.every((s) => s.accepted)).toBe(true);
    expect(snaps[0]?.description).toMatch(/bilgilendirme/i);
  });
});

describe('user delete + export', () => {
  it('soft-deletes account and exports own data only', async () => {
    const profiles = new MockAccountProfileRepository();
    const consents = new MockUserConsentRepository();
    const settings = new MockUserSettingsRepository();
    const logs = new MockUserSecurityLogRepository();
    const service = new AccountService(profiles, consents, settings, logs);
    const userId = ids.user('00000000-0000-4000-8000-000000000003');

    await service.bootstrapFromSignup({
      userId,
      email: 'c@example.com',
      firstName: 'Test',
      lastName: 'User',
      consents: {
        acceptTerms: true,
        acceptPrivacy: true,
        acceptKvkk: true,
        acceptCookies: true,
        consentCommercial: false,
        consentSms: false,
        consentEmail: false,
      },
    });

    const deleted = await service.requestAccountDeletion(userId);
    expect(deleted.status).toBe('deleted');

    const exporter = new AccountDataRightsService(profiles, consents, settings, logs);
    const payload = await exporter.buildExport(userId);
    expect(payload.userId).toBe(String(userId));
    expect(payload.profile).toMatchObject({ email: 'c@example.com' });
    expect(JSON.stringify(payload)).not.toMatch(/other-user/i);
  });
});

describe('commercial message + launch gate', () => {
  it('keeps marketing send disabled without IYS', () => {
    expect(LEGAL_COMMERCIAL_MESSAGE_STATUS.infrastructureReady).toBe(true);
    expect(LEGAL_COMMERCIAL_MESSAGE_STATUS.iysConfigured).toBe(false);
    expect(LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled).toBe(false);
  });

  it('production launch gate remains incomplete', () => {
    const check = checkLegalConfiguration();
    expect(check.code).toBe('LEGAL_CONFIGURATION_INCOMPLETE');
    expect(check.pendingThirdPartyTransfers.length).toBeGreaterThan(0);
  });
});
