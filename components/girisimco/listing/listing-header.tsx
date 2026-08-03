'use client';

import { useState } from 'react';
import {
  Eye,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { ListingOwnerPackagePanel } from '@/components/girisimco/listing/listing-owner-package-panel';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { ListingDetail } from '@/features/listings';
import type { ListingId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';

interface ListingHeaderProps {
  listing: ListingDetail;
}

export function ListingHeader({ listing }: ListingHeaderProps) {
  const { user, isLoading } = useAuth();
  const [interested, setInterested] = useState(false);
  const isOwner =
    Boolean(user?.id && listing.ownerUserId && user.id === listing.ownerUserId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-border/80 px-3 py-1 text-xs font-medium dark:border-white/10"
              style={{
                backgroundColor: `${listing.category.accent}10`,
                color: listing.category.accent,
                borderColor: `${listing.category.accent}30`,
              }}
            >
              {listing.category.label}
            </Badge>
            {listing.verified && listing.publisher.trust && (
              <VerifiedBadgeGroup
                user={listing.publisher.trust.user}
                company={listing.publisher.trust.company}
                investor={listing.publisher.trust.investor}
                showLabel
              />
            )}
          </div>

          <div className="mt-4 flex items-start gap-3">
            <span className="text-3xl" role="img" aria-hidden>
              {listing.emoji}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                {listing.title}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {listing.shortDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {!isEmptyDisplayValue(listing.location) && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.location}
                </span>
                <Separator orientation="vertical" className="hidden h-3.5 sm:block" />
              </>
            )}
            {!isEmptyDisplayValue(listing.publishedAt) && (
              <>
                <span>{listing.publishedAt}</span>
                <Separator orientation="vertical" className="hidden h-3.5 sm:block" />
              </>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {listing.views.toLocaleString('tr-TR')} görüntülenme
            </span>
            <Separator orientation="vertical" className="hidden h-3.5 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {listing.interestedCount} ilgilenen
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch lg:pt-1">
          {!isLoading && isOwner ? (
            <Button
              size="lg"
              className="h-11 rounded-xl bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90"
              onClick={() => {
                document.getElementById('owner-package-panel')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              Paket Al / Vitrine Çıkar
            </Button>
          ) : (
            <Button
              size="lg"
              className={cn(
                'h-11 rounded-xl px-6 text-sm font-medium transition-colors',
                interested
                  ? 'bg-[#22C55E] text-white hover:bg-[#22C55E]/90'
                  : 'bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-primary-foreground',
              )}
              onClick={() => setInterested(!interested)}
            >
              {interested ? 'İlgileniyorsunuz' : 'İlgileniyorum'}
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="h-11 flex-1 rounded-xl border-border/80 text-sm font-medium dark:border-white/10"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Paylaş
            </Button>
            {listing.listingId && (
              <FavoriteButton
                listingId={listing.listingId as ListingId}
                title={listing.title}
                className="h-11 w-11 rounded-xl border-border/80"
              />
            )}
          </div>
        </div>
      </div>

      {!isLoading && isOwner && listing.listingId && (
        <div id="owner-package-panel">
          <ListingOwnerPackagePanel listingId={listing.listingId} />
        </div>
      )}
    </div>
  );
}
