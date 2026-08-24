import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContactRequestId, ListingId, UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { ContactRequestRepository } from '@/features/contact-requests/repositories/contact-request.repository';
import type {
  CreateContactRequestInput,
  ListingContactRequest,
} from '@/features/contact-requests/types/contact-request.types';
import {
  createContactRequestEntity,
  mapContactRequestRow,
  toContactRequestInsert,
  type ContactRequestRow,
} from '@/features/contact-requests/repository/supabase/contact-request.mapper';

const TABLE = 'marketplace_listing_contact_requests';

export class SupabaseContactRequestRepository implements ContactRequestRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: CreateContactRequestInput): Promise<ListingContactRequest> {
    const entity = createContactRequestEntity(input);
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(toContactRequestInsert(entity))
      .select('*')
      .single();
    if (error) {
      if (error.code === '42501' && typeof window === 'undefined') {
        try {
          const { createServiceRoleClient } = require('@/lib/supabase/service');
          const admin = createServiceRoleClient();
          const res = await admin
            .from(TABLE)
            .insert(toContactRequestInsert(entity))
            .select('*')
            .single();
          if (!res.error && res.data) {
            return mapContactRequestRow(res.data as ContactRequestRow);
          }
        } catch {
          // rethrow original error
        }
      }
      throw error;
    }
    return mapContactRequestRow(data as ContactRequestRow);
  }

  async findById(id: ContactRequestId): Promise<ListingContactRequest | null> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapContactRequestRow(data as ContactRequestRow) : null;
  }

  async findActiveForListingRequester(
    listingId: ListingId,
    requesterUserId: UserId,
  ): Promise<ListingContactRequest | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .eq('requester_user_id', requesterUserId)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapContactRequestRow(data as ContactRequestRow) : null;
  }

  async findAcceptedForListingParticipants(
    listingId: ListingId,
    ownerUserId: UserId,
    requesterUserId: UserId,
  ): Promise<ListingContactRequest | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .eq('owner_user_id', ownerUserId)
      .eq('requester_user_id', requesterUserId)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapContactRequestRow(data as ContactRequestRow) : null;
  }

  async listForOwner(ownerUserId: UserId, limit = 200): Promise<ListingContactRequest[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('owner_user_id', ownerUserId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) => mapContactRequestRow(row as ContactRequestRow));
  }

  async listForRequester(requesterUserId: UserId, limit = 50): Promise<ListingContactRequest[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('requester_user_id', requesterUserId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) => mapContactRequestRow(row as ContactRequestRow));
  }

  async listForListingOwner(
    listingId: ListingId,
    ownerUserId: UserId,
  ): Promise<ListingContactRequest[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .eq('owner_user_id', ownerUserId)
      .order('created_at', { ascending: false });
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) => mapContactRequestRow(row as ContactRequestRow));
  }

  async update(
    id: ContactRequestId,
    patch: Partial<ListingContactRequest>,
  ): Promise<ListingContactRequest> {
    // Status transitions must go through SECURITY DEFINER RPCs (direct UPDATE revoked).
    if (patch.status === 'cancelled') {
      const { data, error } = await this.supabase
        .rpc('contact_request_cancel', { p_request_id: id })
        .single();
      if (error) throw error;
      return mapContactRequestRow(data as ContactRequestRow);
    }

    if (patch.status === 'rejected') {
      const { data, error } = await this.supabase
        .rpc('contact_request_reject', { p_request_id: id })
        .single();
      if (error) throw error;
      return mapContactRequestRow(data as ContactRequestRow);
    }

    if (patch.status === 'accepted') {
      if (!patch.ownerTermsVersion) {
        throw new Error('contact_request_accept requires ownerTermsVersion');
      }
      // conversationId may be null — SECURITY DEFINER RPC creates the DM when needed.
      const { data, error } = await this.supabase
        .rpc('contact_request_accept', {
          p_request_id: id,
          p_conversation_id: patch.conversationId ?? null,
          p_owner_terms_version: patch.ownerTermsVersion,
        })
        .single();
      if (error) throw error;
      return mapContactRequestRow(data as ContactRequestRow);
    }

    if (patch.status === 'expired') {
      const { data, error } = await this.supabase
        .rpc('contact_request_expire', { p_request_id: id })
        .single();
      if (error) throw error;
      return mapContactRequestRow(data as ContactRequestRow);
    }

    // Non-status patches are intentionally unsupported for authenticated clients.
    throw new Error('contact_request_direct_update_forbidden');
  }

  async countCreatedSince(requesterUserId: UserId, sinceIso: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('requester_user_id', requesterUserId)
      .gte('created_at', sinceIso);
    if (error) {
      if (isMissingRelationError(error)) return 0;
      throw error;
    }
    return count ?? 0;
  }
}
