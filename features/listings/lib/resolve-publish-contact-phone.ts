import type { UserId } from '@/lib/domain/ids';
import { getAccountService, getProfileService } from '@/lib/persistence/container';

/**
 * Resolve phone for listing publish — marketplace profile first, then account profile.
 * Google OAuth users often only have account-side phone after manual entry.
 */
export async function resolvePublishContactPhone(userId: UserId): Promise<string | null> {
  let marketplacePhone: string | null = null;
  let accountPhone: string | null = null;

  try {
    const profile = await getProfileService().getByUserId(userId);
    marketplacePhone = profile?.phone?.trim() || null;
  } catch {
    /* optional */
  }

  try {
    const account = await getAccountService().getProfile(userId);
    accountPhone = account?.phone?.trim() || null;
  } catch {
    /* optional — mock account stack may not match */
  }

  return marketplacePhone || accountPhone || null;
}

/** Persist phone onto marketplace_profiles so listing publish can read it. */
export async function syncMarketplaceProfilePhone(
  userId: UserId,
  phone: string,
): Promise<string> {
  const normalized = phone.trim();
  if (!normalized) {
    throw new Error('Telefon numarası gerekli.');
  }

  const service = getProfileService();
  let profile = await service.getByUserId(userId);
  if (!profile) {
    profile = await service.ensureProfile(userId, 'Kullanıcı');
  }
  await service.update(profile.id, { phone: normalized });

  try {
    await getAccountService().updateProfile(userId, { phone: normalized });
  } catch {
    /* account profiles row may lag behind marketplace */
  }

  return normalized;
}
