import type { UserId } from '@/lib/domain/ids';
import type { SignUpConsents } from '@/features/authentication/types/auth.types';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
import type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
import type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';
import type {
  AccountStoredRole,
  CreateAccountProfileInput,
  UpdateAccountProfileInput,
} from '@/features/account/types/account-profile.types';
import type { CreateUserSecurityLogInput } from '@/features/account/types/user-security-log.types';
import type { UpdateUserSettingsInput } from '@/features/account/types/user-settings.types';
import type {
  RecordLegalAcceptanceInput,
  UpdateOptionalConsentsInput,
} from '@/features/account/types/user-consent.types';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';

export interface BootstrapAccountInput {
  userId: UserId;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  emailVerified?: boolean;
  /**
   * Ignored for privilege — signup/OAuth always persist role `user`.
   * Elevated roles are assigned only via trusted admin/service operations.
   */
  role?: AccountStoredRole;
  consents?: SignUpConsents;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: string | null;
  browser?: string | null;
}

/**
 * Orchestrates account-level profile, consents, settings, and security logs.
 * Does not touch marketplace profiles, listings, homepage, or admin surfaces.
 */
export class AccountService {
  constructor(
    private readonly profiles: AccountProfileRepository,
    private readonly consents: UserConsentRepository,
    private readonly settings: UserSettingsRepository,
    private readonly securityLogs: UserSecurityLogRepository,
  ) {}

  getProfile(userId: UserId) {
    return this.profiles.findByUserId(userId);
  }

  upsertProfile(input: CreateAccountProfileInput) {
    return this.profiles.upsert(input);
  }

  getLatestConsent(userId: UserId) {
    return this.consents.findLatestByUserId(userId);
  }

  getSettings(userId: UserId) {
    return this.settings.findByUserId(userId);
  }

  /** Profilim page: profiles + latest consents + settings */
  async getProfilePageData(userId: UserId) {
    const [profile, consent, settings] = await Promise.all([
      this.profiles.findByUserId(userId),
      this.consents.findLatestByUserId(userId),
      this.settings.findByUserId(userId),
    ]);
    return { profile, consent, settings };
  }

  updateProfile(userId: UserId, input: UpdateAccountProfileInput) {
    // Client/account paths must never mutate role — DB trigger is the backstop.
    const { role: _ignoredRole, ...safe } = input;
    void _ignoredRole;
    return this.profiles.update(userId, safe);
  }

  updateSettings(userId: UserId, input: UpdateUserSettingsInput) {
    return this.settings.update(userId, input);
  }

  ensureSettings(userId: UserId) {
    return this.settings.upsert({ userId });
  }

  listSecurityLogs(userId: UserId, limit?: number) {
    return this.securityLogs.listByUserId(userId, limit);
  }

  logSecurity(input: CreateUserSecurityLogInput) {
    return this.securityLogs.create(input);
  }

  async recordLogin(userId: UserId, meta?: Omit<CreateUserSecurityLogInput, 'userId' | 'action'>) {
    await this.profiles.touchLastLogin(userId);
    return this.securityLogs.create({
      userId,
      action: 'login',
      device: meta?.device ?? null,
      browser: meta?.browser ?? null,
      ipAddress: meta?.ipAddress ?? null,
    });
  }

  /**
   * After signup: upsert account profile, persist consents, seed settings, log register.
   * Safe no-op path when tables are not migrated yet (repos degrade gracefully).
   */
  async bootstrapFromSignup(input: BootstrapAccountInput) {
    const existing = await this.profiles.findByUserId(input.userId);
    if (existing) {
      // Profile already present (auth trigger or prior signup) — secondary writes are best-effort.
      const settings = await this.settings
        .upsert({
          userId: input.userId,
          emailNotifications: input.consents?.consentEmail ?? true,
          smsNotifications: input.consents?.consentSms ?? false,
        })
        .catch((error) => {
          console.error('[account] bootstrap settings upsert failed', error);
          return null;
        });
      const securityLog = await this.securityLogs
        .create({
          userId: input.userId,
          action: 'register',
          device: input.device,
          browser: input.browser,
          ipAddress: input.ipAddress,
        })
        .catch((error) => {
          console.error('[account] bootstrap security log failed', error);
          return null;
        });
      return { profile: existing, consent: null, settings, securityLog };
    }

    // Never honor client/OAuth metadata role (admin/super_admin escalation).
    void input.role;
    const profile = await this.profiles.upsert({
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      phone: input.phone,
      emailVerified: input.emailVerified ?? false,
      role: 'user',
      status: 'active',
    });

    // Consents / settings / logs must not abort OAuth after the auth session exists.
    let consent = null;
    if (input.consents) {
      consent = await this.consents
        .create({
          userId: input.userId,
          termsAccepted: input.consents.acceptTerms,
          privacyAccepted: input.consents.acceptPrivacy,
          kvkkAccepted: input.consents.acceptKvkk,
          cookiesAccepted: input.consents.acceptCookies,
          marketingAccepted: input.consents.consentCommercial,
          smsAccepted: input.consents.consentSms,
          emailAccepted: input.consents.consentEmail,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          termsVersion: input.consents.acceptTerms
            ? LEGAL_DOCUMENT_VERSIONS.user_terms.version
            : null,
          privacyVersion: input.consents.acceptPrivacy
            ? LEGAL_DOCUMENT_VERSIONS.privacy.version
            : null,
          kvkkAckVersion: input.consents.acceptKvkk
            ? LEGAL_DOCUMENT_VERSIONS.kvkk_clarification.version
            : null,
          cookiesVersion: input.consents.acceptCookies
            ? LEGAL_DOCUMENT_VERSIONS.cookie_policy.version
            : null,
        })
        .catch((error) => {
          console.error('[account] bootstrap consent create failed', error);
          return null;
        });
    }

    const settings = await this.settings
      .upsert({
        userId: input.userId,
        emailNotifications: input.consents?.consentEmail ?? true,
        smsNotifications: input.consents?.consentSms ?? false,
      })
      .catch((error) => {
        console.error('[account] bootstrap settings upsert failed', error);
        return null;
      });

    const securityLog = await this.securityLogs
      .create({
        userId: input.userId,
        action: 'register',
        device: input.device,
        browser: input.browser,
        ipAddress: input.ipAddress,
      })
      .catch((error) => {
        console.error('[account] bootstrap security log failed', error);
        return null;
      });

    return { profile, consent, settings, securityLog };
  }

  /**
   * Explicit UI acceptance of terms / privacy + KVKK & cookie acknowledgment.
   * Appends a new consent row (audit trail). Does not invent marketing consent.
   */
  async recordLegalAcceptance(input: RecordLegalAcceptanceInput) {
    const latest = await this.consents.findLatestByUserId(input.userId);
    const now = new Date().toISOString();

    const consent = await this.consents.create({
      userId: input.userId,
      termsAccepted: input.termsAccepted,
      privacyAccepted: input.privacyAccepted,
      kvkkAccepted: input.kvkkAcknowledged,
      cookiesAccepted: input.cookiesAcknowledged,
      marketingAccepted: input.marketingAccepted ?? latest?.marketingAccepted ?? false,
      smsAccepted: input.smsAccepted ?? latest?.smsAccepted ?? false,
      emailAccepted: input.emailAccepted ?? latest?.emailAccepted ?? false,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      termsVersion: input.termsVersion,
      privacyVersion: input.privacyVersion,
      kvkkAckVersion: input.kvkkAckVersion,
      cookiesVersion: input.cookiesVersion,
      marketingWithdrawnAt: latest?.marketingWithdrawnAt ?? null,
      smsWithdrawnAt: latest?.smsWithdrawnAt ?? null,
      emailWithdrawnAt: latest?.emailWithdrawnAt ?? null,
    });

    await this.securityLogs
      .create({
        userId: input.userId,
        action: 'legal_acceptance',
        ipAddress: input.ipAddress,
        browser: input.userAgent,
      })
      .catch((error) => {
        console.error('[account] legal_acceptance security log failed', error);
        return null;
      });

    void now;
    return consent;
  }

  /** Update withdrawable optional consents (marketing / SMS / email). */
  async updateOptionalConsents(input: UpdateOptionalConsentsInput) {
    const latest = await this.consents.findLatestByUserId(input.userId);
    const now = new Date().toISOString();

    const marketingAccepted =
      input.marketingAccepted !== undefined
        ? input.marketingAccepted
        : (latest?.marketingAccepted ?? false);
    const smsAccepted =
      input.smsAccepted !== undefined ? input.smsAccepted : (latest?.smsAccepted ?? false);
    const emailAccepted =
      input.emailAccepted !== undefined ? input.emailAccepted : (latest?.emailAccepted ?? false);

    const marketingWithdrawnAt =
      input.marketingAccepted === false
        ? now
        : input.marketingAccepted === true
          ? null
          : (latest?.marketingWithdrawnAt ?? null);
    const smsWithdrawnAt =
      input.smsAccepted === false
        ? now
        : input.smsAccepted === true
          ? null
          : (latest?.smsWithdrawnAt ?? null);
    const emailWithdrawnAt =
      input.emailAccepted === false
        ? now
        : input.emailAccepted === true
          ? null
          : (latest?.emailWithdrawnAt ?? null);

    const consent = await this.consents.create({
      userId: input.userId,
      termsAccepted: latest?.termsAccepted ?? false,
      privacyAccepted: latest?.privacyAccepted ?? false,
      kvkkAccepted: latest?.kvkkAccepted ?? false,
      cookiesAccepted: latest?.cookiesAccepted ?? false,
      marketingAccepted,
      smsAccepted,
      emailAccepted,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      termsVersion: latest?.termsVersion ?? null,
      privacyVersion: latest?.privacyVersion ?? null,
      kvkkAckVersion: latest?.kvkkAckVersion ?? null,
      cookiesVersion: latest?.cookiesVersion ?? null,
      marketingWithdrawnAt,
      smsWithdrawnAt,
      emailWithdrawnAt,
    });

    await this.settings.upsert({
      userId: input.userId,
      emailNotifications: emailAccepted,
      smsNotifications: smsAccepted,
    }).catch(() => undefined);

    await this.securityLogs.create({
      userId: input.userId,
      action: 'consent_update',
      ipAddress: input.ipAddress,
      browser: input.userAgent,
    });

    return consent;
  }

  /** Soft-delete account profile — retains consent/security evidence per retention policy. */
  async requestAccountDeletion(userId: UserId, meta?: { ipAddress?: string | null; userAgent?: string | null }) {
    const profile = await this.profiles.update(userId, { status: 'deleted' });
    await this.securityLogs.create({
      userId,
      action: 'account_delete_requested',
      ipAddress: meta?.ipAddress ?? null,
      browser: meta?.userAgent ?? null,
    });
    return profile;
  }

  needsLegalAcceptance(userId: UserId) {
    return this.consents.findLatestByUserId(userId).then((c) => !c?.termsAccepted);
  }
}
