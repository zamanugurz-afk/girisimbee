'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListingContactCta } from '@/features/contact-requests/components/listing-contact-cta';
import type { CareerMatchCard, CareerMatchCompletionSummary, CareerMatchSection, CareerMatchesResult, MatchDirection } from '@/features/matching-engine/types';
import { presentCareerJourney, resolveCareerMatchEmptyState } from '@/features/career-profile/journey';
import {
  MATCH_CONTACT_CTA_LABEL,
  MATCH_EMPTY_FILTERED,
  MATCH_PRIVACY_NOTE,
  MATCH_SECTION_COPY,
  formatMatchScore,
  presentMatchReasons,
} from '@/features/matching-engine/presentation/career-match-copy';
import {
  DEFAULT_MATCH_FILTERS,
  filterAndSortMatchCards,
  uniqueFilterValues,
  type CareerMatchFilterState,
} from '@/features/matching-engine/presentation/career-match-filters';
import {
  MATCH_CARD_LAYOUT_CLASS,
  MATCH_GRID_CLASS,
} from '@/features/matching-engine/presentation/career-match-layout';

function scoreTone(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/40';
  if (score >= 65) return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/40';
  return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/40';
}

function MatchFilters({
  cards,
  value,
  onChange,
}: {
  cards: readonly CareerMatchCard[];
  value: CareerMatchFilterState;
  onChange: (next: CareerMatchFilterState) => void;
}) {
  const locations = uniqueFilterValues(cards, 'location');
  const workModels = uniqueFilterValues(cards, 'workModel');
  const selectClass =
    'h-10 w-full min-w-0 rounded-2xl border border-border/80 bg-background px-3 text-sm text-foreground';

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <label className="min-w-0 space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Minimum uyum</span>
        <select
          className={selectClass}
          value={value.minScore}
          aria-label="Minimum uyum"
          onChange={(event) =>
            onChange({ ...value, minScore: event.target.value as CareerMatchFilterState['minScore'] })
          }
        >
          <option value="all">Tümü (≥ %50)</option>
          <option value="65">%65+ (Güçlü)</option>
          <option value="80">%80+ (Çok Güçlü)</option>
        </select>
      </label>
      <label className="min-w-0 space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Lokasyon</span>
        <select
          className={selectClass}
          value={value.location}
          aria-label="Lokasyon"
          onChange={(event) => onChange({ ...value, location: event.target.value })}
        >
          <option value="all">Tümü</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0 space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Çalışma modeli</span>
        <select
          className={selectClass}
          value={value.workModel}
          aria-label="Çalışma modeli"
          onChange={(event) => onChange({ ...value, workModel: event.target.value })}
        >
          <option value="all">Tümü</option>
          {workModels.map((workModel) => (
            <option key={workModel} value={workModel}>
              {workModel}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0 space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Sıralama</span>
        <select
          className={selectClass}
          value={value.sort}
          aria-label="Sıralama"
          onChange={(event) =>
            onChange({ ...value, sort: event.target.value as CareerMatchFilterState['sort'] })
          }
        >
          <option value="score">En yüksek uyum</option>
          <option value="newest">En yeni</option>
        </select>
      </label>
    </div>
  );
}

export function CareerMatchCardView({ card, direction }: { card: CareerMatchCard; direction: MatchDirection }) {
  const copy = MATCH_SECTION_COPY[direction];
  const reasons = presentMatchReasons(card.reasons, direction);
  const metaParts = [
    card.sectorLabel,
    card.location,
    card.workModel,
  ].filter(Boolean);
  const identityGated = direction === 'candidates';

  return (
    <article className={MATCH_CARD_LAYOUT_CLASS}>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scoreTone(card.score)}`}>
          {formatMatchScore(card.score)}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{card.bandLabel}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
        {card.title}
      </h3>

      {card.partyLabel ? (
        <p className="mt-1 break-words text-sm font-medium text-foreground/80">{card.partyLabel}</p>
      ) : null}

      {metaParts.length > 0 ? (
        <p className="mt-1 break-words text-xs text-muted-foreground">{metaParts.join(' · ')}</p>
      ) : null}

      {card.salary ? (
        <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {card.salary}
        </p>
      ) : null}

      {direction === 'candidates' && (card.experienceLabel || card.highlightSkills.length > 0) ? (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {card.experienceLabel ? <p>Deneyim: {card.experienceLabel}</p> : null}
          {card.highlightSkills.length > 0 ? (
            <p className="break-words [overflow-wrap:anywhere]">
              Yetkinlikler: {card.highlightSkills.join(' · ')}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 min-w-0 border-t border-border/60 pt-3">
        <p className="text-xs font-medium text-muted-foreground">{copy.whyTitle}</p>
        <ul className="mt-1.5 space-y-1 text-xs text-foreground">
          {reasons.slice(0, 5).map((reason) => (
            <li key={`${reason.kind}-${reason.text}`} className="flex items-start gap-1.5 break-words">
              <span className={reason.kind === 'match' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {reason.kind === 'match' ? '✓' : '•'}
              </span>
              <span>{reason.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex min-w-0 flex-col gap-2 pt-4 sm:flex-row">
        <Button asChild variant="outline" className="h-9 w-full min-w-0 rounded-2xl text-xs sm:flex-1">
          <Link href={card.href}>{copy.reviewCta}</Link>
        </Button>
        <div className="min-w-0 w-full sm:flex-1">
          <ListingContactCta
            listingId={card.listingId}
            listingTitle={card.title}
            variant="compact"
            buttonLabel={MATCH_CONTACT_CTA_LABEL}
            identityGated={identityGated}
            categoryId={identityGated ? 'find-job' : 'hire'}
            className="w-full min-w-0"
          />
        </div>
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground">{MATCH_PRIVACY_NOTE}</p>
    </article>
  );
}

function MatchSection({
  section,
  complete,
}: {
  section: CareerMatchSection;
  complete: boolean;
}) {
  const [filters, setFilters] = useState<CareerMatchFilterState>(DEFAULT_MATCH_FILTERS);
  const visible = useMemo(
    () => filterAndSortMatchCards(section.matches, filters),
    [section.matches, filters],
  );
  const copy = MATCH_SECTION_COPY[section.direction];
  const empty = resolveCareerMatchEmptyState({
    kind: section.sourceKind,
    hasPublishedSource: true,
    hasProfileRecord: true,
    complete,
    matchCount: section.matches.length,
  });

  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{copy.title}</h2>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
      </div>

      {section.matches.length > 0 ? (
        <MatchFilters cards={section.matches} value={filters} onChange={setFilters} />
      ) : null}

      {section.matches.length === 0 && empty ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-8 text-center sm:px-6">
          <p className="text-base font-medium text-foreground">{empty.title}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{empty.description}</p>
          <Button asChild className="mt-4 h-10 rounded-2xl">
            <Link href={empty.ctaHref}>{empty.ctaLabel}</Link>
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-6">
          <p className="text-sm font-medium text-foreground">{MATCH_EMPTY_FILTERED.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{MATCH_EMPTY_FILTERED.description}</p>
        </div>
      ) : (
        <>
          <div className={MATCH_GRID_CLASS}>
            {visible.map((card) => (
              <CareerMatchCardView key={card.listingId} card={card} direction={section.direction} />
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button asChild variant="outline" className="h-10 rounded-2xl px-6 text-sm font-medium">
              <Link href={copy.viewAllHref}>{copy.viewAllCta}</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

function CompletionBanner({ summary }: { summary: CareerMatchCompletionSummary }) {
  const journey = presentCareerJourney(summary.kind, summary);
  return (
    <div className="rounded-2xl border border-border/80 bg-card px-4 py-4">
      {summary.complete ? (
        <p className="text-sm font-medium text-foreground">{journey.completeTitle}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">{journey.matchBannerPercent}</p>
          <p className="mt-1 text-sm text-muted-foreground">{journey.matchBannerHint}</p>
          <Button asChild variant="outline" className="mt-3 h-10 w-full rounded-2xl sm:w-auto">
            <Link href={journey.incompletePrimary.href}>{journey.incompletePrimary.label}</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export function CareerMatchResults({ result }: { result: CareerMatchesResult }) {
  const hasSource = Boolean(result.opportunities || result.candidates);
  const completion = result.completion;
  const presence = result.presence ?? { seek: 'none' as const, hire: 'none' as const };

  if (!hasSource) {
    const kind = presence.seek !== 'none' ? 'seek' : presence.hire !== 'none' ? 'hire' : null;
    const empty = resolveCareerMatchEmptyState({
      kind,
      hasPublishedSource: false,
      hasProfileRecord: presence.seek !== 'none' || presence.hire !== 'none',
      complete: false,
      matchCount: 0,
    });
    return (
      <div className="rounded-2xl border border-border/80 bg-card px-5 py-8 text-center">
        <p className="text-base font-semibold text-foreground">{empty?.title}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{empty?.description}</p>
        <Button asChild className="mt-4 h-10 rounded-2xl">
          <Link href={empty?.ctaHref ?? '/ilan/olustur'}>{empty?.ctaLabel}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-10">
      {completion?.seek || completion?.hire ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
          {completion?.seek ? <CompletionBanner summary={completion.seek} /> : null}
          {completion?.hire ? <CompletionBanner summary={completion.hire} /> : null}
        </div>
      ) : null}
      {result.opportunities ? (
        <MatchSection section={result.opportunities} complete={Boolean(completion?.seek?.complete)} />
      ) : null}
      {result.candidates ? (
        <MatchSection section={result.candidates} complete={Boolean(completion?.hire?.complete)} />
      ) : null}
    </div>
  );
}
