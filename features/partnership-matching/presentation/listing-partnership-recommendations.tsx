'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListingContactCta } from '@/features/contact-requests/components/listing-contact-cta';
import {
  PARTNERSHIP_MATCH_CARD_LAYOUT_CLASS,
  PARTNERSHIP_MATCH_CTA_ROW_CLASS,
  PARTNERSHIP_MATCH_GRID_CLASS,
} from '@/features/partnership-matching/presentation/partnership-match-layout';
import {
  formatPartnershipMatchScore,
  PARTNERSHIP_MATCH_CONTACT_CTA,
  PARTNERSHIP_MATCH_PRIVACY_NOTE,
  PARTNERSHIP_MATCH_SECTION_COPY,
  presentPartnershipMatchReasons,
} from '@/features/partnership-matching/presentation/partnership-match-copy';
import { partnershipCardMetaRows } from '@/features/partnership-matching/presentation/partnership-match-party';
import type {
  PartnershipMatchCard,
  PartnershipMatchDirection,
  PartnershipMatchSection,
} from '@/features/partnership-matching/types';

function scoreTone(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/40';
  if (score >= 65) return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/40';
  return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/40';
}

function CardMeta({ card, direction }: { card: PartnershipMatchCard; direction: PartnershipMatchDirection }) {
  const rows = partnershipCardMetaRows(card, direction);
  if (!rows.length) return null;

  return (
    <div className="mt-2 min-w-0 space-y-1 text-xs text-muted-foreground">
      {rows.map((row) => (
        <p key={row} className="break-words [overflow-wrap:anywhere]">
          {row}
        </p>
      ))}
    </div>
  );
}

export function PartnershipMatchCardView({
  card,
  direction,
}: {
  card: PartnershipMatchCard;
  direction: PartnershipMatchDirection;
}) {
  const copy = PARTNERSHIP_MATCH_SECTION_COPY[direction];
  const reasons = presentPartnershipMatchReasons(card.reasons);

  return (
    <article className={PARTNERSHIP_MATCH_CARD_LAYOUT_CLASS}>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scoreTone(card.score)}`}>
          {formatPartnershipMatchScore(card.score)}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{card.bandLabel}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
        {card.title}
      </h3>

      <CardMeta card={card} direction={direction} />

      <div className="mt-3 min-w-0 border-t border-border/60 pt-3">
        <p className="text-xs font-medium text-muted-foreground">{copy.whyTitle}</p>
        <ul className="mt-1.5 space-y-1 text-xs text-foreground">
          {reasons.slice(0, 5).map((reason) => (
            <li key={`${reason.kind}-${reason.text}`} className="flex items-start gap-1.5 break-words [overflow-wrap:anywhere]">
              <span className={reason.kind === 'match' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {reason.kind === 'match' ? '✓' : '•'}
              </span>
              <span>{reason.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={PARTNERSHIP_MATCH_CTA_ROW_CLASS}>
        <Button asChild variant="outline" className="h-9 w-full min-w-0 rounded-2xl text-xs sm:flex-1">
          <Link href={card.href}>{copy.reviewCta}</Link>
        </Button>
        <div className="min-w-0 w-full sm:flex-1">
          <ListingContactCta
            listingId={card.listingId}
            listingTitle={card.title}
            variant="compact"
            buttonLabel={PARTNERSHIP_MATCH_CONTACT_CTA}
            categoryId="ortak-bul"
            className="w-full min-w-0"
          />
        </div>
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground">{PARTNERSHIP_MATCH_PRIVACY_NOTE}</p>
    </article>
  );
}

interface ListingPartnershipRecommendationsProps {
  listingId: string;
  initialSection?: PartnershipMatchSection | null;
}

export function ListingPartnershipRecommendations({
  listingId,
  initialSection = null,
}: ListingPartnershipRecommendationsProps) {
  const [section, setSection] = useState<PartnershipMatchSection | null>(initialSection);
  const [loading, setLoading] = useState(!initialSection);

  useEffect(() => {
    if (initialSection) return;
    let active = true;
    setLoading(true);

    fetch(`/api/partnership/recommendations?listingId=${encodeURIComponent(listingId)}`)
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
        <div className={PARTNERSHIP_MATCH_GRID_CLASS}>
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
            {section.direction === 'partners'
              ? 'Girişiminize uygun ortak henüz bulunmuyor.'
              : 'Profilinize uygun ortak arayan girişim henüz bulunmuyor.'}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            İlan detaylarınızı güncelledikçe daha uygun eşleşmeler bulabiliriz.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={PARTNERSHIP_MATCH_GRID_CLASS}>
            {matches.map((card) => (
              <PartnershipMatchCardView
                key={card.listingId}
                card={card}
                direction={section.direction}
              />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button asChild variant="outline" className="rounded-xl px-6">
              <Link href={section.direction === 'partners' ? '/partners?intent=seeking' : '/partners?intent=joining'}>
                {section.direction === 'partners' ? 'Tüm uygun ortakları gör' : 'Tüm uygun girişimleri gör'}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
