'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, ListChecks, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { ListingContactCta } from '@/features/contact-requests/components/listing-contact-cta';
import { FollowUserButton } from '@/components/girisimco/profile/follow-user-button';
import {
  DetailCard,
  FactGrid,
  FactRow,
} from '@/components/girisimco/listing/detail-primitives';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getProfileService } from '@/lib/persistence/container';
import type { ListingDetail } from '@/features/listings';
import type { UserId } from '@/lib/domain/ids';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';
import { formatNumber } from '@/lib/utils';

interface ListingSidebarProps {
  listing: ListingDetail;
}

export function ListingSidebar({ listing }: ListingSidebarProps) {
  const { user } = useAuth();
  const ownerId = listing.ownerUserId;
  const isOwner = Boolean(user?.id && ownerId && user.id === ownerId);
  const profileHref =
    listing.publisher.href && listing.publisher.href !== '#'
      ? listing.publisher.href
      : null;

  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [listingsCount, setListingsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!ownerId) return;
    let cancelled = false;
    const run = async () => {
      try {
        const service = getProfileService();
        const { getClientContainer } = await import('@/lib/persistence/container');
        const { listingRepository } = getClientContainer();
        const [followers, listingsResult] = await Promise.all([
          service.countFollowers(ownerId as UserId),
          listingRepository.search(
            { ownerId: ownerId as UserId, status: 'published' },
            { page: 1, limit: 1 },
          ),
        ]);
        if (cancelled) return;
        setFollowersCount(followers);
        setListingsCount(listingsResult.total);
      } catch {
        if (!cancelled) {
          setFollowersCount(null);
          setListingsCount(null);
        }
      }
    };
    // Defer sidebar stats so they don't compete with first paint / hydration.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => {
        void run();
      }, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(() => {
        void run();
      }, 200);
    }
    return () => {
      cancelled = true;
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [ownerId]);

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {listing.listingId && !isOwner ? (
        <ListingContactCta
          listingId={listing.listingId}
          listingTitle={listing.title}
          isOwner={isOwner}
        />
      ) : null}

      <DetailCard className="!p-0 overflow-hidden">
        <div className="border-b border-border/70 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent px-5 py-5 dark:border-white/10 dark:from-primary/10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            İlan sahibi
          </p>
          <div className="mt-4 flex items-start gap-3.5">
            {listing.publisher.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.publisher.avatarUrl}
                alt=""
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-background shadow-sm"
              />
            ) : (
              <Avatar className="h-14 w-14 rounded-2xl">
                <AvatarFallback
                  className="rounded-2xl text-sm font-semibold text-white"
                  style={{ backgroundColor: listing.category.accent }}
                >
                  {listing.publisher.initials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {listing.owner.name || listing.publisher.name}
                </h3>
                {listing.publisher.verified && listing.publisher.trust ? (
                  <VerifiedBadgeGroup
                    user={listing.publisher.trust.user}
                    company={listing.publisher.trust.company}
                    investor={listing.publisher.trust.investor}
                  />
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {!isEmptyDisplayValue(listing.owner.role)
                  ? listing.owner.role
                  : listing.publisher.subtitle ??
                    (listing.publisher.type === 'company' ? 'Şirket' : 'Üye')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" aria-hidden />
                <span className="text-[11px]">Takipçi</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {followersCount == null ? '—' : formatNumber(followersCount)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" aria-hidden />
                <span className="text-[11px]">İlan</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {listingsCount == null ? '—' : formatNumber(listingsCount)}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Üye olma:{' '}
            <span className="font-medium text-foreground">
              {!isEmptyDisplayValue(listing.owner.memberSince)
                ? listing.owner.memberSince
                : '—'}
            </span>
          </p>

          <div className="flex flex-col gap-2">
            {!isOwner && ownerId ? (
              <FollowUserButton
                targetUserId={ownerId}
                className="h-10 w-full"
                onFollowChange={(next) => {
                  setFollowersCount((prev) => {
                    if (prev == null) return prev;
                    return Math.max(0, prev + (next ? 1 : -1));
                  });
                }}
              />
            ) : null}
            {profileHref ? (
              <Button asChild className="h-10 w-full rounded-2xl">
                <Link href={profileHref}>Profili gör</Link>
              </Button>
            ) : (
              <Button type="button" className="h-10 w-full rounded-2xl" disabled>
                Profili gör
              </Button>
            )}
          </div>
        </div>
      </DetailCard>

      {(
        [
          listing.investment.requested,
          listing.investment.equity,
          listing.investment.stage,
          listing.investment.industry,
        ].some((v) => !isEmptyDisplayValue(v))
      ) ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Hızlı bilgiler</h3>
          <div className="mt-2">
            <FactGrid>
              <FactRow label="Yatırım" value={listing.investment.requested} />
              <FactRow label="Hisse" value={listing.investment.equity} />
              <FactRow label="Aşama" value={listing.investment.stage} />
              <FactRow label="Sektör" value={listing.investment.industry} />
            </FactGrid>
          </div>
        </DetailCard>
      ) : null}

      {!isEmptyDisplayValue(listing.company.name) ||
      !isEmptyDisplayValue(listing.company.summary) ? (
        <DetailCard>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted/40 text-xl dark:bg-white/5">
              {listing.company.emoji}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {listing.company.name}
              </p>
              {!isEmptyDisplayValue(listing.company.city) ? (
                <p className="text-xs text-muted-foreground">{listing.company.city}</p>
              ) : null}
            </div>
          </div>
          {!isEmptyDisplayValue(listing.company.summary) ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {listing.company.summary}
            </p>
          ) : null}
        </DetailCard>
      ) : null}

      {listing.tags.length > 0 ? (
        <DetailCard padding="sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            Etiketler
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-2xl border border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground dark:border-white/10 dark:bg-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </DetailCard>
      ) : null}
    </aside>
  );
}
