/**
 * PostgREST select list for marketplace_listings that excludes:
 * - direct contact channels (contact_phone / whatsapp / email) — revoked at DB
 * - owner_id — must not be readable via anon/authenticated PostgREST
 *   (enumeration: listingId → owner_id → /uye). Server hydrates ownerId via
 *   privileged reader (see SupabaseListingRepository enrichOwnerId).
 *
 * DB column SELECT for contact_* is revoked for anon/authenticated — `select('*')` would fail.
 * Owner/admin contact reads go through marketplace_listing_owner_contact_channels RPC.
 * Accepted-requester identity/phone use dedicated SECURITY DEFINER RPCs (unchanged).
 */
export const LISTING_SAFE_SELECT = [
  'id',
  'slug',
  // owner_id intentionally omitted — not for anon/authenticated PostgREST projection
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

/**
 * Privileged projection for server-side ownerId hydration only.
 * After migration revoke, only service_role (or equivalent) may SELECT these columns.
 */
export const LISTING_OWNER_ID_SELECT = 'id,owner_id';

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
