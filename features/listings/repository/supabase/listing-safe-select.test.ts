import { describe, expect, it } from 'vitest';
import {
  ACCEPTED_REQUESTER_CONTACT_PHONE_RPC,
  ACCEPTED_REQUESTER_OWNER_IDENTITY_RPC,
  LISTING_SAFE_SELECT,
} from '@/features/listings/repository/supabase/listing-safe-select';

import { stripListingContactPhone } from '@/features/contact-requests/lib/strip-listing-phone';

describe('LISTING_SAFE_SELECT', () => {
  it('excludes direct contact channels from PostgREST select list', () => {
    const columns = LISTING_SAFE_SELECT.split(',');
    expect(columns).not.toContain('contact_phone');
    expect(columns).not.toContain('contact_whatsapp');
    expect(columns).not.toContain('contact_email');
    expect(columns).toContain('id');
    expect(columns).toContain('title');
    expect(columns).toContain('owner_id');
  });

  it('exposes accepted-requester phone RPC name (not table select)', () => {
    expect(ACCEPTED_REQUESTER_CONTACT_PHONE_RPC).toBe(
      'marketplace_listing_accepted_requester_contact_phone',
    );
  });

  it('exposes accepted-requester owner identity RPC name', () => {
    expect(ACCEPTED_REQUESTER_OWNER_IDENTITY_RPC).toBe(
      'marketplace_listing_accepted_requester_owner_identity',
    );
  });
});

describe('stripListingContactPhone', () => {
  it('nulls phone, whatsapp, and email on public DTOs', () => {
    const stripped = stripListingContactPhone({
      id: '1',
      contactPhone: '+905551111111',
      contactWhatsapp: '+905551111111',
      contactEmail: 'a@b.com',
    });
    expect(stripped.contactPhone).toBeNull();
    expect(stripped.contactWhatsapp).toBeNull();
    expect(stripped.contactEmail).toBeNull();
  });
});
