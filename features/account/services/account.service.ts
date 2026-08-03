import type { UserId } from '@/lib/domain/ids';
import type { SignUpConsents } from '@/features/authentication/types/auth.types';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
import type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
import type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';
import type {
  CreateAccountProfileInput,
  UpdateAccountProfileInput,
} from '@/features/account/types/account-profile.types';
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
  /** Stored on profiles.role — OAuth defaults to `user` */
  role?: string;
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
    return this.profiles.update(userId, input);
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
      // Never overwrite an elevated role (admin / super_admin) with signup default.
      if (existing.role === 'super_admin' || existing.role === 'admin') {
        return {
          profile: existing,
          consent: null,
          settings: await this.settings.upsert({
            userId: input.userId,
            emailNotifications: input.consents?.consentEmail ?? true,
            smsNotifications: input.consents?.consentSms ?? false,
          }),
          securityLog: await this.securityLogs.create({
            userId: input.userId,
            action: 'register',
            device: input.device,
            browser: input.browser,
            ipAddress: input.ipAddress,
          }),
        };
      }
    }

    const profile = await this.profiles.upsert({
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      phone: input.phone,
      emailVerified: input.emailVerified ?? false,
      role: input.role ?? 'user',
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
