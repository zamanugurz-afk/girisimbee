'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { ListingCallButton } from '@/components/girisimco/listing/listing-call-button';
import { FollowUserButton } from '@/components/girisimco/profile/follow-user-button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { ListingDetail } from '@/features/listings';
import type { ListingId } from '@/lib/domain/ids';

/** Fixed bottom action bar for mobile listing detail. */
export function ListingDetailMobileBar({ listing }: { listing: ListingDetail }) {
  const { user } = useAuth();
  const isOwner =
    Boolean(user?.id && listing.ownerUserId && user.id === listing.ownerUserId);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl dark:border-white/10 lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        {listing.listingId ? (
          <FavoriteButton
            listingId={listing.listingId as ListingId}
            title={listing.title}
            className="h-11 w-11 shrink-0 rounded-2xl border border-border/80"
          />
        ) : (
          <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-2xl" disabled>
            <Heart className="h-4 w-4" />
          </Button>
        )}

        {!isOwner && listing.ownerUserId ? (
          <FollowUserButton targetUserId={listing.ownerUserId} className="h-11 flex-1" />
        ) : null}

        {!isOwner ? (
          <ListingCallButton
            phone={listing.contactPhone}
            className="h-11 flex-[1.4] rounded-2xl"
            label="Ara"
          />
        ) : (
          <Button type="button" className="h-11 flex-1 rounded-2xl" disabled>
            Sizin ilanınız
          </Button>
        )}
      </div>
    </div>
  );
}
