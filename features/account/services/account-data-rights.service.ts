import type { UserId } from '@/lib/domain/ids';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
import type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
import type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';

export type UserDataExportPayload = {
  exportedAt: string;
  userId: string;
  profile: unknown;
  consentLatest: unknown;
  settings: unknown;
  securityLogs: unknown;
};

/**
 * Builds a self-service export of the authenticated user's own account data.
 * Does not include other users, admin-only fields, or payment card data.
 */
export class AccountDataRightsService {
  constructor(
    private readonly profiles: AccountProfileRepository,
    private readonly consents: UserConsentRepository,
    private readonly settings: UserSettingsRepository,
    private readonly securityLogs: UserSecurityLogRepository,
  ) {}

  async buildExport(userId: UserId): Promise<UserDataExportPayload> {
    const [profile, consent, settings, securityLogs] = await Promise.all([
      this.profiles.findByUserId(userId),
      this.consents.findLatestByUserId(userId),
      this.settings.findByUserId(userId),
      this.securityLogs.listByUserId(userId, 100),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId: String(userId),
      profile: profile
        ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            status: profile.status,
            emailVerified: profile.emailVerified,
            phoneVerified: profile.phoneVerified,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            lastLoginAt: profile.lastLoginAt,
          }
        : null,
      consentLatest: consent
        ? {
            termsAccepted: consent.termsAccepted,
            privacyAccepted: consent.privacyAccepted,
            kvkkAcknowledged: consent.kvkkAccepted,
            cookiesAcknowledged: consent.cookiesAccepted,
            marketingAccepted: consent.marketingAccepted,
            smsAccepted: consent.smsAccepted,
            emailAccepted: consent.emailAccepted,
            termsVersion: consent.termsVersion ?? null,
            privacyVersion: consent.privacyVersion ?? null,
            kvkkAckVersion: consent.kvkkAckVersion ?? null,
            cookiesVersion: consent.cookiesVersion ?? null,
            marketingWithdrawnAt: consent.marketingWithdrawnAt ?? null,
            smsWithdrawnAt: consent.smsWithdrawnAt ?? null,
            emailWithdrawnAt: consent.emailWithdrawnAt ?? null,
            createdAt: consent.createdAt,
          }
        : null,
      settings: settings
        ? {
            emailNotifications: settings.emailNotifications,
            smsNotifications: settings.smsNotifications,
          }
        : null,
      securityLogs: (securityLogs ?? []).map((row) => ({
        action: row.action,
        createdAt: row.createdAt,
        ipAddress: row.ipAddress,
      })),
    };
  }
}
