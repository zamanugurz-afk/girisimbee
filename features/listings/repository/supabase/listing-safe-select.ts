/**
 * PostgREST select list for marketplace_listings that excludes direct contact channels:
 * contact_phone, contact_whatsapp, contact_email.
 * DB column SELECT is revoked for anon/authenticated — `select('*')` would fail.
 * Owner/admin reads go through marketplace_listing_owner_contact_channels RPC.
 */
export const LISTING_SAFE_SELECT = [
  'id',
  'slug',
  'owner_id',
  'company_id',
  'category_id',
  'listing_type_id',
  'subcategory_id',
  'module_key',
  'title',
  'short_description',
  'long_description',
  'status',
  'location',
  'city',
  'district',
  'industry',
  'country',
  'remote_policy',
  'anonymous_mode',
  'workflow_status',
  'contact_website',
  'custom_fields',
  'view_count',
  'interested_count',
  'application_count',
  'is_verified',
  'is_featured',
  'is_urgent',
  'featured_until',
  'urgent_until',
  'published_at',
  'expires_at',
  'rejected_reason',
  'created_at',
  'updated_at',
  'deleted_at',
].join(',');

/** @deprecated Prefer OWNER_CONTACT_CHANNELS_RPC */
export const OWNER_CONTACT_PHONE_RPC = 'marketplace_listing_owner_contact_phone';

/** Phone for accepted contact-request requester only (listing + requester scoped). */
export const ACCEPTED_REQUESTER_CONTACT_PHONE_RPC =
  'marketplace_listing_accepted_requester_contact_phone';

/** Owner display/first/last name for accepted contact-request requester only. */
export const ACCEPTED_REQUESTER_OWNER_IDENTITY_RPC =
  'marketplace_listing_accepted_requester_owner_identity';

export const OWNER_CONTACT_CHANNELS_RPC = 'marketplace_listing_owner_contact_channels';

export type OwnerContactChannels = {
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
};
