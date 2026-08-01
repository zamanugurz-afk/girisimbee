import type { UserId } from '@/lib/domain/ids';
import type { SignUpConsents } from '@/features/authentication/types/auth.types';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
import type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
import type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';
import type { CreateAccountProfileInput } from '@/features/account/types/account-profile.types';
import type { CreateUserSecurityLogInput } from '@/features/account/types/user-security-log.types';
import type { UpdateUserSettingsInput } from '@/features/account/types/user-settings.types';

export interface BootstrapAccountInput {
  userId: UserId;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  emailVerified?: boolean;
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
    const profile = await this.profiles.upsert({
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      phone: input.phone,
      emailVerified: input.emailVerified ?? false,
      status: 'active',
    });

    let consent = null;
    if (input.consents) {
      consent = await this.consents.create({
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
      });
    }

    const settings = await this.settings.upsert({
      userId: input.userId,
      emailNotifications: input.consents?.consentEmail ?? true,
      smsNotifications: input.consents?.consentSms ?? false,
    });

    const securityLog = await this.securityLogs.create({
      userId: input.userId,
      action: 'register',
      device: input.device,
      browser: input.browser,
      ipAddress: input.ipAddress,
    });

    return { profile, consent, settings, securityLog };
  }
}
