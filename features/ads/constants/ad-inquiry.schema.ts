/**
 * Reklam & işbirliği — veri modeli (Supabase).
 *
 * Tablolar:
 * 1) marketplace_ad_inquiries  — public form talepleri (MARKET + özel işbirliği)
 * 2) marketplace_payments      — MARKET 5.000 TL ödemeleri (purpose = market_ad)
 * 3) marketplace_market_items  — yayınlanan MARKET kartları
 *
 * Migrations:
 * - 20260805150000_create_ad_inquiries.sql
 * - 20260805160000_market_ad_payment.sql
 * - 20260805170000_ad_inquiries_admin_indexes.sql
 *
 * Admin UI: /admin/reklam  (Reklam & İşbirliği)
 * Public UI: /reklam
 */

export const AD_INQUIRY_SCHEMA = {
  table: 'marketplace_ad_inquiries',
  kinds: ['market_ad', 'partnership'] as const,
  statuses: ['new', 'reviewing', 'accepted', 'rejected', 'closed'] as const,
  partnershipTypes: ['sponsorship', 'content', 'event', 'media', 'other'] as const,
  workflow: {
    partnership: 'new → reviewing → accepted|rejected|closed',
    market_ad: 'reviewing (ödeme) → accepted + market_item_id (yayın)',
  },
} as const;
