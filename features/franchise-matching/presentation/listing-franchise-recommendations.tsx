'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FRANCHISE_MATCH_GRID_CLASS } from '@/features/franchise-matching/presentation/franchise-match-layout';
import { FranchiseMatchCardView } from '@/features/franchise-matching/presentation/franchise-match-card';
import type { FranchiseMatchSection } from '@/features/franchise-matching/types';

interface ListingFranchiseRecommendationsProps {
  listingId: string;
  initialSection?: FranchiseMatchSection | null;
}

export function ListingFranchiseRecommendations({
  listingId,
  initialSection = null,
}: ListingFranchiseRecommendationsProps) {
  const [section, setSection] = useState<FranchiseMatchSection | null>(initialSection);
  const [loading, setLoading] = useState(!initialSection);

  useEffect(() => {
    if (initialSection) return;
    let active = true;
    setLoading(true);

    fetch(`/api/franchise/recommendations?listingId=${encodeURIComponent(listingId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then((data) => {
        if (active) {
          setSection(data.section ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setSection(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [listingId, initialSection]);

  if (loading) {
    return (
      <div className="mt-14 space-y-4 border-t border-border/80 pt-10 dark:border-white/10">
        <div className="h-6 w-56 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted/40" />
        <div className={FRANCHISE_MATCH_GRID_CLASS}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  if (!section) return null;

  const matches = section.matches || [];

  return (
    <section className="mt-14 space-y-6 border-t border-border/80 pt-10 dark:border-white/10">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {section.title}
        </h2>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center">
          <p className="text-base font-semibold text-foreground">
            Şu anda benzer bir franchise fırsatı bulunmuyor.
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Platforma yeni markalar eklendikçe burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={FRANCHISE_MATCH_GRID_CLASS}>
            {matches.map((card) => (
              <FranchiseMatchCardView key={card.listingId} card={card} />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button asChild variant="outline" className="rounded-xl px-6">
              <Link href="/franchise/buy">Tüm uygun franchise fırsatlarını gör</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
