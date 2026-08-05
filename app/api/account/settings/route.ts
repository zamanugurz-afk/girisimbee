import { z } from 'zod';
import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import type { UserId } from '@/lib/domain/ids';
import type { UserSettings } from '@/features/account/types/user-settings.types';
import type { AccountPanelSettingsData } from '@/features/account/types/account-settings.types';
import { getDefaultAccountPanelSettings } from '@/features/account/services/account-settings-mock.service';

const patchSchema = z.object({
  notifications: z
    .object({
      systemNotifications: z.boolean(),
      favoriteNotifications: z.boolean(),
      emailNotifications: z.boolean(),
      smsNotifications: z.boolean(),
    })
    .optional(),
  profileVisibility: z.enum(['public', 'connections', 'private']).optional(),
  privacy: z
    .object({
      emailVisible: z.boolean(),
      phoneVisible: z.boolean(),
      linkedInVisible: z.boolean(),
      websiteVisible: z.boolean(),
    })
    .optional(),
  preferences: z
    .object({
      language: z.enum(['tr', 'en']),
      timezone: z.string().min(1).max(80),
      dateFormat: z.enum(['dd.mm.yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd']),
    })
    .optional(),
});

function mapToPanel(
  settings: UserSettings | null,
  extras?: {
    privacy?: AccountPanelSettingsData['privacy'];
    preferences?: AccountPanelSettingsData['preferences'];
  },
): AccountPanelSettingsData {
  const defaults = getDefaultAccountPanelSettings();
  return {
    notifications: {
      systemNotifications: settings?.systemNotifications ?? defaults.notifications.systemNotifications,
      favoriteNotifications:
        settings?.favoriteNotifications ?? defaults.notifications.favoriteNotifications,
      emailNotifications: settings?.emailNotifications ?? defaults.notifications.emailNotifications,
      smsNotifications: settings?.smsNotifications ?? defaults.notifications.smsNotifications,
    },
    privacy: extras?.privacy ?? defaults.privacy,
    preferences: extras?.preferences ?? defaults.preferences,
  };
}

export const GET = withAuth(async (ctx) => {
  try {
    await ctx.container.accountService.ensureSettings(ctx.userId as UserId);
    const settings = await ctx.container.accountService.getSettings(ctx.userId as UserId);
    return ok({
      settings: mapToPanel(settings),
      profileVisibility: settings?.profileVisibility ?? 'public',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ayarlar yüklenemedi';
    return apiError(message, 500, { code: 'SETTINGS_LOAD_FAILED' });
  }
});

export const PATCH = withAuth(async (ctx, request) => {
  try {
    const body = await parseJsonBody(request);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Geçersiz ayar verisi', 400, {
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
    }

    await ctx.container.accountService.ensureSettings(ctx.userId as UserId);

    const update: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      favoriteNotifications?: boolean;
      systemNotifications?: boolean;
      profileVisibility?: 'public' | 'connections' | 'private';
    } = {};

    if (parsed.data.notifications) {
      update.emailNotifications = parsed.data.notifications.emailNotifications;
      update.smsNotifications = parsed.data.notifications.smsNotifications;
      update.favoriteNotifications = parsed.data.notifications.favoriteNotifications;
      update.systemNotifications = parsed.data.notifications.systemNotifications;
    }
    if (parsed.data.profileVisibility) {
      update.profileVisibility = parsed.data.profileVisibility;
    }

    const settings =
      Object.keys(update).length > 0
        ? await ctx.container.accountService.updateSettings(ctx.userId as UserId, update)
        : await ctx.container.accountService.getSettings(ctx.userId as UserId);

    return ok({
      settings: mapToPanel(settings, {
        privacy: parsed.data.privacy,
        preferences: parsed.data.preferences,
      }),
      profileVisibility: settings?.profileVisibility ?? 'public',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ayarlar kaydedilemedi';
    return apiError(message, 500, { code: 'SETTINGS_SAVE_FAILED' });
  }
});
