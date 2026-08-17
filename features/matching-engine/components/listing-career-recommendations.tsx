'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CareerMatchCardView } from '@/features/matching-engine/components/career-match-results';
import { MATCH_GRID_CLASS } from '@/features/matching-engine/presentation/career-match-layout';
import type { CareerMatchSection } from '@/features/matching-engine/types';

interface ListingCareerRecommendationsProps {
  listingId: string;
  initialSection?: CareerMatchSection | null;
}

export function ListingCareerRecommendations({
  listingId,
  initialSection = null,
}: ListingCareerRecommendationsProps) {
  const [section, setSection] = useState<CareerMatchSection | null>(initialSection);
  const [loading, setLoading] = useState(!initialSection);

  useEffect(() => {
    if (initialSection) return;
    let active = true;
    setLoading(true);

    fetch(`/api/career/recommendations?listingId=${encodeURIComponent(listingId)}`)
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
        <div className="h-6 w-48 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/40" />
        <div className={MATCH_GRID_CLASS}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  if (!section) return null;

  const isSeeker = section.direction === 'opportunities';
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
            {isSeeker ? 'Sana uygun iş ilanı henüz bulunmuyor.' : 'İlanınıza uygun aday henüz bulunmuyor.'}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isSeeker
              ? 'Profilinizi ve tercihlerinizi güncelledikçe daha uygun ilanlar bulabiliriz.'
              : 'İlan detaylarınızı güncelledikçe daha uygun adaylar bulabiliriz.'}
          </p>
          {isSeeker ? (
            <Button asChild className="mt-4 h-10 rounded-2xl">
              <Link href="/dashboard/kariyer-profilim">Profilimi Güncelle</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className={MATCH_GRID_CLASS}>
          {matches.map((card) => (
            <CareerMatchCardView
              key={card.listingId}
              card={card}
              direction={section.direction}
            />
          ))}
        </div>
      )}
    </section>
  );
}
