import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import type { ListingId } from '@/lib/domain/ids';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
  }

  const listingId = ids.listing(params.id) as ListingId;
  const container = getServerContainer(supabase);
  const listing = await container.listingRepository.findById(listingId);
  if (!listing) {
    return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
  }

  if (listing.ownerId !== ids.user(user.id)) {
    return NextResponse.json({ error: 'Bu ilan üzerinde işlem yapma yetkiniz yok.' }, { status: 403 });
  }

  try {
    const aggregate = await container.listingEngine.publishListing(listingId, {
      actorId: ids.user(user.id),
    });
    return NextResponse.json({ listing: aggregate.listing });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Yayınlama başarısız';
    const status = message.includes('hakkınız') || message.includes('paket') ? 402 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
