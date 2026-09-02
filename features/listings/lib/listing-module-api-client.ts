import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CategoryId } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';
import { getListingCategoryModule } from '@/features/listings/config/listing-category-module.config';
import { traceListingPublish, tracePublishFailure } from '@/lib/debug/listing-publish-trace';
import { createClient } from '@/lib/supabase/client';

async function moduleFetch<T>(moduleKey: string, path: string, init?: RequestInit): Promise<T> {
  traceListingPublish(moduleKey, 'action_request', { payload: { path, method: init?.method ?? 'GET' } });

  let token: string | undefined;
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch {
    // fallback
  }

  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    tracePublishFailure(moduleKey, 'action_fetch', error, { path, method: init?.method ?? 'GET' });
    throw error;
  }

  const body = (await res.json().catch(() => ({}))) as {
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  };

  if (!res.ok) {
    const message = body.error ?? `İstek başarısız (${res.status})`;
    tracePublishFailure(moduleKey, 'action_response', message, { path, status: res.status, response: body });
    if (body.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
      throw new ValidationError(message, body.fieldErrors);
    }
    throw new Error(message);
  }

  traceListingPublish(moduleKey, 'action_response', { response: body });
  return body.data as T;
}

/** Publish listing via module REST API (?publish=true). */
export async function publishModuleListing(
  categoryId: CategoryId,
  payload: Record<string, unknown>,
): Promise<Listing> {
  const config = getListingCategoryModule(categoryId);
  if (!config) {
    throw new Error('Modül yayın yapılandırması bulunamadı.');
  }

  const { flow, ...listingFields } = payload;
  const query = new URLSearchParams({ publish: 'true' });
  const path = `${config.publishApiPath}?${query.toString()}`;

  const data = await moduleFetch<{ listing: Listing }>(config.moduleKey, path, {
    method: 'POST',
    body: JSON.stringify(config.moduleKey === 'franchise' ? { flow: flow ?? 'give', ...listingFields } : listingFields),
  });

  if (!data?.listing) {
    throw new Error('Yayın yanıtında ilan bulunamadı.');
  }

  return data.listing;
}
