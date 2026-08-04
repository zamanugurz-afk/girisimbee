'use client';

import { Flag, Heart, Link2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { ListingCallButton } from '@/components/girisimco/listing/listing-call-button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { ListingDetail } from '@/features/listings';
import type { ListingId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

export function ListingDetailActions({
  listing,
  className,
}: {
  listing: ListingDetail;
  className?: string;
}) {
  const { user } = useAuth();
  const isOwner =
    Boolean(user?.id && listing.ownerUserId && user.id === listing.ownerUserId);

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Bağlantı panoya kopyalandı');
    } catch {
      toast.message('Paylaşım iptal edildi');
    }
  }

  function handleFollow() {
    if (listing.publisher.href && listing.publisher.href !== '#') {
      window.location.href = listing.publisher.href;
      return;
    }
    toast.message('Takip için yayınlayan profiline gidin');
  }

  function handleReport() {
    toast.message('İlan bildirimi yakında aktif olacak');
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-sm backdrop-blur-sm dark:border-white/10',
        className,
      )}
    >
      {listing.listingId ? (
        <div className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border/70 bg-background px-2.5 transition-colors hover:border-primary/30 dark:border-white/10">
          <FavoriteButton
            listingId={listing.listingId as ListingId}
            title={listing.title}
            className="h-8 w-8 rounded-xl border-0 bg-transparent shadow-none"
          />
          <span className="pr-1.5 text-sm font-medium text-foreground">Favorilere ekle</span>
        </div>
      ) : (
        <Button type="button" variant="outline" className="h-10 rounded-2xl" disabled>
          <Heart className="mr-2 h-4 w-4" />
          Favorilere ekle
        </Button>
      )}

      {!isOwner ? (
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-2xl"
          onClick={handleFollow}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Takip et
        </Button>
      ) : null}

      {!isOwner ? (
        <ListingCallButton
          phone={listing.contactPhone}
          className="h-10 rounded-2xl px-4"
          label="Ara"
        />
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-2xl"
        onClick={handleShare}
      >
        <Link2 className="mr-2 h-4 w-4" />
        Paylaş
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="h-10 rounded-2xl text-muted-foreground hover:text-destructive"
        onClick={handleReport}
      >
        <Flag className="mr-2 h-4 w-4" />
        İlanı bildir
      </Button>
    </div>
  );
}
