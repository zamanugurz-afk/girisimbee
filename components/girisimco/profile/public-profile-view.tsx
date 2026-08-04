'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Globe, Linkedin, MapPin, Pencil } from 'lucide-react';
import { ContentCard as ListingCard } from '@/components/girisimco/content-card';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { FollowUserButton } from '@/components/girisimco/profile/follow-user-button';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import type { PublicProfileView } from '@/features/profiles/types/profile-public.types';
import { ListingCallButton } from '@/components/girisimco/listing/listing-call-button';
import { Button } from '@/components/ui/button';
import { formatDate, formatNumber, initials } from '@/lib/utils';

interface PublicProfilePageViewProps {
  data: PublicProfileView;
}

export function PublicProfilePageView({ data: initialData }: PublicProfilePageViewProps) {
  const [data, setData] = useState(initialData);
  const { profile, stats, listings, isOwner } = data;
  const listingItems = listingsToContentItems(
    listings,
    new Map(
      listings.map((l) => [
        l.id,
        { user: profile.isVerified, investor: profile.investorVerified, company: false },
      ]),
    ),
  );
  const contactListing = listings.find((l) => l.status === 'published');
  const location = [profile.city, profile.country === 'TR' ? 'Türkiye' : profile.country]
    .filter(Boolean)
    .join(', ');

  const showWebsite = profile.websiteVisible && profile.website;
  const showEmail = profile.emailVisible && profile.email;
  const showPhone = profile.phoneVisible && profile.phone;

  return (
    <div className="pt-14">
        <div className="relative h-44 border-b border-border/80 bg-muted/50 sm:h-56">
          {profile.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted sm:h-28 sm:w-28">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg font-semibold text-muted-foreground">
                    {initials(profile.displayName)}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {profile.displayName}
                  </h1>
                  <VerifiedBadgeGroup
                    user={profile.isVerified}
                    investor={profile.investorVerified}
                  />
                </div>
                {profile.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
                {profile.headline && (
                  <p className="mt-1 text-sm text-foreground/90">{profile.headline}</p>
                )}
              </div>
            </div>

            {isOwner ? (
              <Button asChild variant="outline" className="rounded-lg">
                <Link href="/ayarlar">
                  <Pencil className="mr-2 h-4 w-4" />
                  Profili Düzenle
                </Link>
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <FollowUserButton
                  targetUserId={profile.userId}
                  initialFollowing={data.isFollowing}
                  className="rounded-lg"
                  onFollowChange={(next) => {
                    setData((prev) => ({
                      ...prev,
                      isFollowing: next,
                      stats: {
                        ...prev.stats,
                        followersCount: Math.max(
                          0,
                          prev.stats.followersCount + (next ? 1 : -1),
                        ),
                      },
                    }));
                  }}
                />
                <ListingCallButton
                  phone={showPhone ? profile.phone : contactListing?.contactPhone}
                  className="rounded-lg"
                  label="Ara"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            )}
            {(profile.companyName || profile.position) && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {[profile.position, profile.companyName].filter(Boolean).join(' · ')}
              </span>
            )}
            <span>Üye: {formatDate(profile.createdAt)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <Stat label="İlan" value={stats.listingsCount} />
            <Stat label="Takipçi" value={stats.followersCount} />
            <Stat label="Takip" value={stats.followingCount} />
          </div>

          {(showWebsite || profile.linkedInUrl || showEmail || showPhone) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {showWebsite && (
                <a
                  href={profile.website!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-sm text-foreground hover:bg-muted/40 dark:border-white/10 dark:text-white dark:hover:bg-white/[0.03]"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {profile.linkedInUrl && (
                <a
                  href={profile.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-sm text-foreground hover:bg-muted/40 dark:border-white/10 dark:text-white dark:hover:bg-white/[0.03]"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {profile.twitterUrl && (
                <a
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-sm text-foreground hover:bg-muted/40 dark:border-white/10 dark:text-white dark:hover:bg-white/[0.03]"
                >
                  X
                </a>
              )}
              {showEmail && (
                <span className="inline-flex items-center rounded-lg border border-border/80 px-3 py-1.5 text-sm text-muted-foreground dark:border-white/10">
                  {profile.email}
                </span>
              )}
              {showPhone && (
                <span className="inline-flex items-center rounded-lg border border-border/80 px-3 py-1.5 text-sm text-muted-foreground dark:border-white/10">
                  {profile.phone}
                </span>
              )}
            </div>
          )}

          {profile.bio && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hakkında</h2>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                {profile.bio}
              </p>
            </section>
          )}

          <section className="mt-10 pb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">İlanlar</h2>
            {listingItems.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
                <p className="text-sm text-muted-foreground">Henüz yayınlanmış ilan bulunmuyor.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listingItems.map((item) => (
                  <ListingCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="font-semibold text-foreground">
        {formatNumber(value)}
      </span>{' '}
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
