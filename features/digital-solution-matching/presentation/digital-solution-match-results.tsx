'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DIGITAL_SOLUTION_MATCH_GRID_CLASS,
  DIGITAL_SOLUTION_MATCH_PAGE_CLASS,
} from '@/features/digital-solution-matching/presentation/digital-solution-match-layout';
import { DigitalSolutionMatchCardView } from '@/features/digital-solution-matching/presentation/digital-solution-match-card';
import {
  DIGITAL_SOLUTION_MATCH_EMPTY_DESCRIPTION,
  DIGITAL_SOLUTION_MATCH_EMPTY_TITLE,
  DIGITAL_SOLUTION_MATCH_MISSING_CONTEXT_DESCRIPTION,
  DIGITAL_SOLUTION_MATCH_MISSING_CONTEXT_TITLE,
  DIGITAL_SOLUTION_MATCH_PAGE_DESCRIPTION,
  DIGITAL_SOLUTION_MATCH_PAGE_TITLE,
  DIGITAL_SOLUTION_MATCH_UPDATE_PROFILE_CTA,
  DIGITAL_SOLUTION_MATCH_VIEW_ALL_CTA,
  DIGITAL_SOLUTION_MATCH_VIEW_ALL_HREF,
} from '@/features/digital-solution-matching/presentation/digital-solution-match-copy';
import type { DigitalSolutionMatchesResult } from '@/features/digital-solution-matching/types';

export function DigitalSolutionMatchResults({
  result,
}: {
  result: DigitalSolutionMatchesResult;
}) {
  const { solutions, hasConsumerContext, missingContextLabel } = result;
  const matches = solutions?.matches || [];

  return (
    <div className={DIGITAL_SOLUTION_MATCH_PAGE_CLASS}>
      <header className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {DIGITAL_SOLUTION_MATCH_PAGE_TITLE}
        </h1>
        <p className="text-sm text-muted-foreground">
          {DIGITAL_SOLUTION_MATCH_PAGE_DESCRIPTION}
        </p>
      </header>

      {!hasConsumerContext ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">
            {DIGITAL_SOLUTION_MATCH_MISSING_CONTEXT_TITLE}
          </h2>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
            {missingContextLabel || DIGITAL_SOLUTION_MATCH_MISSING_CONTEXT_DESCRIPTION}
          </p>
          <div className="mt-4">
            <Button asChild className="rounded-xl">
              <Link href="/dashboard/profil">{DIGITAL_SOLUTION_MATCH_UPDATE_PROFILE_CTA}</Link>
            </Button>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-base font-semibold text-foreground">
            {DIGITAL_SOLUTION_MATCH_EMPTY_TITLE}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {DIGITAL_SOLUTION_MATCH_EMPTY_DESCRIPTION}
          </p>
          <div className="mt-6">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={DIGITAL_SOLUTION_MATCH_VIEW_ALL_HREF}>
                {DIGITAL_SOLUTION_MATCH_VIEW_ALL_CTA}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className={DIGITAL_SOLUTION_MATCH_GRID_CLASS}>
            {matches.map((card) => (
              <DigitalSolutionMatchCardView key={card.listingId} card={card} />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button asChild variant="outline" className="rounded-xl px-6">
              <Link href={DIGITAL_SOLUTION_MATCH_VIEW_ALL_HREF}>
                {DIGITAL_SOLUTION_MATCH_VIEW_ALL_CTA}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
