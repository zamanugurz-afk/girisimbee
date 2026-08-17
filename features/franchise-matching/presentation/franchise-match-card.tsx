'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListingContactCta } from '@/features/contact-requests/components/listing-contact-cta';
import {
  FRANCHISE_MATCH_CARD_LAYOUT_CLASS,
  FRANCHISE_MATCH_CTA_ROW_CLASS,
} from '@/features/franchise-matching/presentation/franchise-match-layout';
import {
  formatFranchiseMatchScore,
  FRANCHISE_MATCH_CONTACT_CTA,
  FRANCHISE_MATCH_PRIVACY_NOTE,
  FRANCHISE_MATCH_REVIEW_CTA,
} from '@/features/franchise-matching/presentation/franchise-match-copy';
import type { FranchiseMatchCard } from '@/features/franchise-matching/types';

function scoreTone(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/40';
  if (score >= 65) return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/40';
  return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/40';
}

export function FranchiseMatchCardView({
  card,
}: {
  card: FranchiseMatchCard;
}) {
  return (
    <article className={FRANCHISE_MATCH_CARD_LAYOUT_CLASS}>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scoreTone(card.score)}`}>
          {formatFranchiseMatchScore(card.score)}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{card.bandLabel}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
        {card.title}
      </h3>

      <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
        {card.sector ? (
          <span className="rounded-md bg-muted/60 px-2 py-0.5 font-medium text-foreground">
            {card.sector}
          </span>
        ) : null}
        {card.businessCategory ? (
          <span className="rounded-md bg-muted/60 px-2 py-0.5">
            {card.businessCategory}
          </span>
        ) : null}
        {card.formattedInvestment ? (
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
            💰 {card.formattedInvestment}
          </span>
        ) : null}
        {card.location ? (
          <span className="rounded-md bg-muted/60 px-2 py-0.5">
            📍 {card.location}
          </span>
        ) : null}
      </div>

      <div className="mt-3 min-w-0 border-t border-border/60 pt-3">
        <p className="text-xs font-medium text-muted-foreground">Neden Uyumlu?</p>
        <ul className="mt-1.5 space-y-1 text-xs text-foreground">
          {card.reasons.slice(0, 5).map((reason) => (
            <li key={`${reason.kind}-${reason.text}`} className="flex items-start gap-1.5 break-words [overflow-wrap:anywhere]">
              <span className={reason.kind === 'match' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {reason.kind === 'match' ? '✓' : '◐'}
              </span>
              <span>{reason.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={FRANCHISE_MATCH_CTA_ROW_CLASS}>
        <Button asChild variant="outline" className="h-9 w-full min-w-0 rounded-2xl text-xs sm:flex-1">
          <Link href={card.href}>{FRANCHISE_MATCH_REVIEW_CTA}</Link>
        </Button>
        <div className="min-w-0 w-full sm:flex-1">
          <ListingContactCta
            listingId={card.listingId}
            listingTitle={card.title}
            variant="compact"
            buttonLabel={FRANCHISE_MATCH_CONTACT_CTA}
            categoryId="bayilik-al"
            className="w-full min-w-0"
          />
        </div>
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground">{FRANCHISE_MATCH_PRIVACY_NOTE}</p>
    </article>
  );
}
