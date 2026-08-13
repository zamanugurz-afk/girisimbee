import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseListingRepository } from '@/features/listings/repository/supabase/listing.repository.supabase';
import { ids } from '@/lib/domain/ids';

describe('SupabaseListingRepository owner_id enrichment', () => {
  it('fails closed when enrichOwnerId is set without a privileged reader', () => {
    const supabase = {} as SupabaseClient;
    expect(
      () => new SupabaseListingRepository(supabase, { enrichOwnerId: true }),
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('uses only the privileged reader for owner-scoped id resolution', async () => {
    const userFrom = vi.fn();
    const supabase = { from: userFrom } as unknown as SupabaseClient;

    const isDeleted = vi.fn(async () => ({ data: [], error: null }));
    const eqOwner = vi.fn(() => ({ is: isDeleted }));
    const selectIds = vi.fn(() => ({ eq: eqOwner }));
    const privilegedFrom = vi.fn(() => ({ select: selectIds }));
    const ownerIdReader = { from: privilegedFrom } as unknown as SupabaseClient;

    const repo = new SupabaseListingRepository(supabase, {
      enrichOwnerId: true,
      ownerIdReader,
    });

    const result = await repo.search(
      { ownerId: ids.user('u0000001-0001-4000-8000-000000000001') },
      { page: 1, limit: 10 },
    );

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(privilegedFrom).toHaveBeenCalledWith('marketplace_listings');
    expect(userFrom).not.toHaveBeenCalled();
  });
});
