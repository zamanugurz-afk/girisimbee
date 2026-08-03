import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import type { AccountProfilePageLoadResult } from '@/features/account/types/account-profile-page.types';

/** Server loader for /hesabim/profilim — profiles + consents + settings */
export async function loadAccountProfilePage(
  userId: string,
): Promise<AccountProfilePageLoadResult> {
  try {
    const supabase = createClient();
    const accountService = getServerContainer(supabase).accountService;
    const data = await accountService.getProfilePageData(ids.user(userId));
    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Profil bilgileri yüklenemedi.';
    return { ok: false, error: message };
  }
}
