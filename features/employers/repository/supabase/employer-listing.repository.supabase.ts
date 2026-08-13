/**
 * Employers listing repository — delegates reads/updates to shared repo; create uses canonical FK IDs.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseListingRepository,
  type SupabaseListingRepositoryOptions,
} from '@/features/listings/repository/supabase/listing.repository.supabase';
import type { CreateListingInput } from '@/features/listings/types/listing.entity.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { createEmployerListing } from '@/features/employers/lib/employer-listing-insert';

export class EmployerListingRepository extends SupabaseListingRepository {
  constructor(
    private readonly client: SupabaseClient,
    options?: SupabaseListingRepositoryOptions,
  ) {
    super(client, options);
  }

  override async create(input: CreateListingInput): Promise<Listing> {
    return createEmployerListing(this.client, input);
  }
}
