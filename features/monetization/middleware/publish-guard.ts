import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import { fetchProfile } from '@/features/authentication/services/supabase-auth.service';
import { ids } from '@/lib/domain/ids';
import type { ListingId } from '@/lib/domain/ids';

const PUBLISH_API_PATTERN = /^\/api\/listings\/([^/]+)\/publish$/;

/**
 * Middleware gate for server-side publish API routes.
 * Client-side publish still enforced in ListingEngine via ListingPackageService.
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
    .select('id, owner_id, company_id, published_at, status')
    .eq('id', listingId)
    .maybeSingle();

  if (error || !listing) {
    return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
  }

  if (listing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Bu ilan üzerinde işlem yapma yetkiniz yok.' }, { status: 403 });
  }

  if (listing.published_at) {
    return null;
  }

  const { data: settings } = await supabase
    .from('marketplace_settings')
    .select('free_listing_limit, current_published_count')
    .eq('id', 'global')
    .maybeSingle();

  const limit = settings?.free_listing_limit ?? 100;
  const count = settings?.current_published_count ?? 0;

  if (count < limit) {
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
    { error: 'Ücretsiz ilan kotası doldu. Yayınlamak için aktif bir paket gereklidir.' },
    { status: 402 },
  );
}
