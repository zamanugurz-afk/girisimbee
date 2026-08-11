import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { ids } from '@/lib/domain/ids';
import { STANDARD_PUBLISH_CONFIG, STANDARD_REPUBLISH_CONFIG } from '@/features/monetization/types/listing-placement.types';
import { isPremiumLivePayments } from '@/features/shared/config/features';

const PUBLISH_API_PATTERN = /^\/api\/listings\/([^/]+)\/publish$/;

const SLOT_STATUSES = ['published', 'pending_review', 'expired', 'archived'] as const;

/**
 * Middleware gate for server-side publish API routes.
 * Rule: 1 free listing per category; extra / renew = 99 TL (package credit or test mode).
 */
export async function validatePublishRequest(request: NextRequest): Promise<NextResponse | null> {
  const match = request.nextUrl.pathname.match(PUBLISH_API_PATTERN);
  if (!match || request.method !== 'POST') return null;

  const { supabase } = createClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
  }

  const listingId = ids.listing(match[1]);
  const { data: listing, error } = await supabase
    .from('marketplace_listings')
    .select('id, owner_id, company_id, category_id, published_at, status')
    .eq('id', listingId)
    .maybeSingle();

  if (error || !listing) {
    return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
  }

  if (listing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Bu ilan üzerinde işlem yapma yetkiniz yok.' }, { status: 403 });
  }

  // Already published once → renew path elsewhere; allow republish API if used.
  if (listing.published_at) {
    return null;
  }

  const { count: usedInCategory } = await supabase
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .eq('category_id', listing.category_id)
    .in('status', [...SLOT_STATUSES])
    .neq('id', listingId)
    .is('deleted_at', null);

  const freeAvailable = (usedInCategory ?? 0) < STANDARD_PUBLISH_CONFIG.freePerCategory;
  if (freeAvailable) {
    return null;
  }

  if (!isPremiumLivePayments()) {
    // Test / pre-PSP: form simulates 99 TL payment.
    return null;
  }

  const nowIso = new Date().toISOString();
  const { data: packages } = await supabase
    .from('marketplace_user_packages')
    .select('package_slug, company_id, credits_remaining, expires_at, status')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const active = (packages ?? []).filter((pkg) => {
    if (pkg.expires_at && pkg.expires_at < nowIso) return false;
    if (pkg.package_slug === 'single_listing' && (pkg.credits_remaining ?? 0) <= 0) return false;
    return true;
  });

  const hasCompany = listing.company_id
    && active.some((p) => p.package_slug === 'company_package' && p.company_id === listing.company_id);
  const hasMonthly = active.some((p) => p.package_slug === 'monthly_unlimited');
  const hasSingle = active.some((p) => p.package_slug === 'single_listing' && (p.credits_remaining ?? 0) > 0);

  if (hasCompany || hasMonthly || hasSingle) {
    return null;
  }

  return NextResponse.json(
    {
      error: `Bu kategoride ücretsiz hakkınızı kullandınız. Ek ilan ${STANDARD_REPUBLISH_CONFIG.priceCents / 100} TL’dir.`,
    },
    { status: 402 },
  );
}
