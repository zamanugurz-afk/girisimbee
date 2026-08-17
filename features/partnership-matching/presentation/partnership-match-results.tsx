'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ListingContactCta } from '@/features/contact-requests/components/listing-contact-cta';
import {
  DEFAULT_PARTNERSHIP_MATCH_FILTERS,
  filterAndSortPartnershipMatchCards,
  parsePartnershipMatchFilters,
  partnershipMatchFiltersAreDefault,
  partnershipMatchFiltersToQuery,
  uniquePartnershipFilterValues,
  type PartnershipMatchFilterState,
} from '@/features/partnership-matching/presentation/partnership-match-filters';
import {
  formatPartnershipMatchScore,
  PARTNERSHIP_MATCH_CLEAR_FILTERS_LABEL,
  PARTNERSHIP_MATCH_CONTACT_CTA,
  PARTNERSHIP_MATCH_EMPTY_FILTERED,
  PARTNERSHIP_MATCH_PRIVACY_NOTE,
  PARTNERSHIP_MATCH_SECTION_COPY,
  presentPartnershipMatchReasons,
  resolvePartnershipMatchEmptyState,
} from '@/features/partnership-matching/presentation/partnership-match-copy';
import {
  PARTNERSHIP_MATCH_CARD_LAYOUT_CLASS,
  PARTNERSHIP_MATCH_CTA_ROW_CLASS,
  PARTNERSHIP_MATCH_GRID_CLASS,
} from '@/features/partnership-matching/presentation/partnership-match-layout';
import { partnershipCardMetaRows } from '@/features/partnership-matching/presentation/partnership-match-party';
import type {
  PartnershipMatchCard,
  PartnershipMatchCompletionSummary,
  PartnershipMatchDirection,
  PartnershipMatchesResult,
  PartnershipMatchSection,
} from '@/features/partnership-matching/types';

function scoreTone(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200';
  if (score >= 65) return 'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200';
  return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200';
}

function MatchFilters({
  cards,
  value,
  onChange,
}: {
  cards: readonly PartnershipMatchCard[];
  value: PartnershipMatchFilterState;
  onChange: (next: PartnershipMatchFilterState) => void;
}) {
  const locations = uniquePartnershipFilterValues(cards, 'location');
  const types = uniquePartnershipFilterValues(cards, 'partnershipType');
  const selectClass =
    'h-10 w-full min-w-0 max-w-full rounded-2xl border border-border/80 bg-background px-3 text-sm text-foreground';
  const showClear = !partnershipMatchFiltersAreDefault(value);

  return (
    <div className="min-w-0 max-w-full space-y-3">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="min-w-0 space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Minimum uyum</span>
          <select
            className={selectClass}
            value={value.minScore}
            aria-label="Minimum uyum"
            onChange={(event) =>
              onChange({ ...value, minScore: event.target.value as PartnershipMatchFilterState['minScore'] })
            }
          >
            <option value="50">%50+</option>
            <option value="65">%65+</option>
            <option value="80">%80+</option>
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
          <span className="text-xs font-medium text-muted-foreground">Ortaklık tipi</span>
          <select
            className={selectClass}
            value={value.partnershipType}
            aria-label="Ortaklık tipi"
            onChange={(event) => onChange({ ...value, partnershipType: event.target.value })}
          >
            <option value="all">Tümü</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
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
              onChange({ ...value, sort: event.target.value as PartnershipMatchFilterState['sort'] })
            }
          >
            <option value="score">En yüksek uyum</option>
            <option value="newest">En yeni</option>
          </select>
        </label>
      </div>
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full rounded-2xl sm:w-auto"
          onClick={() => onChange(DEFAULT_PARTNERSHIP_MATCH_FILTERS)}
        >
          {PARTNERSHIP_MATCH_CLEAR_FILTERS_LABEL}
        </Button>
      ) : null}
    </div>
  );
}

function CardMeta({ card, direction }: { card: PartnershipMatchCard; direction: PartnershipMatchDirection }) {
  const rows = partnershipCardMetaRows(card, direction);
  if (!rows.length) return null;

  return (
    <div className="mt-2 min-w-0 space-y-1 text-sm text-muted-foreground">
      {rows.map((row) => (
        <p key={row} className="break-words [overflow-wrap:anywhere]">
          {row}
        </p>
      ))}
    </div>
  );
}

function MatchCard({ card, direction }: { card: PartnershipMatchCard; direction: PartnershipMatchDirection }) {
  const copy = PARTNERSHIP_MATCH_SECTION_COPY[direction];
  const reasons = presentPartnershipMatchReasons(card.reasons);

  return (
    <article className={PARTNERSHIP_MATCH_CARD_LAYOUT_CLASS}>
      <div className={`inline-flex w-fit max-w-full rounded-full px-2.5 py-1 text-xs font-semibold ${scoreTone(card.score)}`}>
        {formatPartnershipMatchScore(card.score)}
      </div>
      <h3 className="mt-3 line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
        {card.title}
      </h3>
      <CardMeta card={card} direction={direction} />
      <p className="mt-3 text-xs font-medium text-muted-foreground">{card.bandLabel}</p>

      <div className="mt-3 min-w-0">
        <p className="text-sm font-medium text-foreground">{copy.whyTitle}</p>
        <ul className="mt-2 space-y-1 text-sm text-foreground">
          {reasons.map((reason) => (
            <li key={`${reason.kind}-${reason.text}`} className="break-words [overflow-wrap:anywhere]">
              {reason.kind === 'match' ? `✓ ${reason.text}` : `• ${reason.text}`}
            </li>
          ))}
        </ul>
      </div>

      <div className={PARTNERSHIP_MATCH_CTA_ROW_CLASS}>
        <Button asChild variant="outline" className="h-10 w-full min-w-0 max-w-full rounded-2xl lg:flex-1">
          <Link href={card.href}>{copy.reviewCta}</Link>
        </Button>
        <div className="min-w-0 w-full max-w-full lg:flex-1">
          <ListingContactCta
            listingId={card.listingId}
            listingTitle={card.title}
            variant="compact"
            buttonLabel={PARTNERSHIP_MATCH_CONTACT_CTA}
            identityGated
            categoryId="find-partner"
            className="w-full min-w-0 max-w-full whitespace-normal"
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{PARTNERSHIP_MATCH_PRIVACY_NOTE}</p>
    </article>
  );
}

function MatchSection({
  section,
  complete,
  filters,
  onFiltersChange,
}: {
  section: PartnershipMatchSection;
  complete: boolean;
  filters: PartnershipMatchFilterState;
  onFiltersChange: (next: PartnershipMatchFilterState) => void;
}) {
  const visible = useMemo(
    () => filterAndSortPartnershipMatchCards(section.matches, filters),
    [section.matches, filters],
  );
  const copy = PARTNERSHIP_MATCH_SECTION_COPY[section.direction];
  const empty = resolvePartnershipMatchEmptyState({
    intent: section.sourceIntent,
    hasPublishedSource: true,
    hasDraftSource: true,
    complete,
    matchCount: section.matches.length,
    sourceListingId: section.sourceListingId,
    focus: 'matches',
  });

  return (
    <section className="min-w-0 max-w-full space-y-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground">{copy.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
      </div>

      {section.matches.length > 0 ? (
        <MatchFilters cards={section.matches} value={filters} onChange={onFiltersChange} />
      ) : null}

      {section.matches.length === 0 && empty ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-6">
          <p className="text-sm font-medium text-foreground">{empty.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{empty.description}</p>
          <Button asChild className="mt-4 h-10 w-full rounded-2xl sm:w-auto">
            <Link href={empty.ctaHref}>{empty.ctaLabel}</Link>
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-6">
          <p className="text-sm font-medium text-foreground">{PARTNERSHIP_MATCH_EMPTY_FILTERED.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{PARTNERSHIP_MATCH_EMPTY_FILTERED.description}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-10 w-full rounded-2xl sm:w-auto"
            onClick={() => onFiltersChange(DEFAULT_PARTNERSHIP_MATCH_FILTERS)}
          >
            {PARTNERSHIP_MATCH_CLEAR_FILTERS_LABEL}
          </Button>
        </div>
      ) : (
        <div className={PARTNERSHIP_MATCH_GRID_CLASS}>
          {visible.map((card) => (
            <MatchCard key={card.listingId} card={card} direction={section.direction} />
          ))}
        </div>
      )}
    </section>
  );
}

function CompletionBanner({ summary }: { summary: PartnershipMatchCompletionSummary }) {
  if (summary.complete) return null;

  return (
    <div className="min-w-0 rounded-2xl border border-border/80 bg-card px-4 py-4">
      <p className="text-sm font-medium text-foreground">
        Daha doğru ortaklık eşleşmeleri için profilinizi tamamlayın.
      </p>
      {summary.missingLabels.length > 0 ? (
        <p className="mt-1 break-words text-sm text-muted-foreground">Eksik: {summary.missingLabels.join(', ')}</p>
      ) : null}
      <Button asChild variant="outline" className="mt-3 h-10 w-full rounded-2xl sm:w-auto">
        <Link href={`/ilanlarim/${summary.listingId}/duzenle`}>Profilimi Tamamla</Link>
      </Button>
    </div>
  );
}

function PartnershipMatchResultsView({
  result,
  filters,
  onFiltersChange,
}: {
  result: PartnershipMatchesResult;
  filters: PartnershipMatchFilterState;
  onFiltersChange: (next: PartnershipMatchFilterState) => void;
}) {
  const hasSource = Boolean(result.partners || result.ventures);
  const draftOnly =
    !hasSource && (result.presence.seeking === 'draft' || result.presence.joining === 'draft');

  if (!hasSource) {
    const empty = resolvePartnershipMatchEmptyState({
      intent: result.presence.joining !== 'none' ? 'joining' : result.presence.seeking !== 'none' ? 'seeking' : null,
      hasPublishedSource: false,
      hasDraftSource: draftOnly,
      complete: false,
      matchCount: 0,
      sourceListingId: result.editListingId,
      focus: 'source',
    });

    return (
      <div className="min-w-0 rounded-2xl border border-border/80 bg-card px-5 py-8">
        <p className="text-sm font-medium text-foreground">{empty?.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{empty?.description}</p>
        <Button asChild className="mt-4 h-10 w-full rounded-2xl sm:w-auto">
          <Link href={empty?.ctaHref ?? '/ilan/olustur?hub=venture'}>{empty?.ctaLabel}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-10 overflow-x-hidden">
      {result.completion.seeking || result.completion.joining ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
          {result.completion.seeking ? <CompletionBanner summary={result.completion.seeking} /> : null}
          {result.completion.joining ? <CompletionBanner summary={result.completion.joining} /> : null}
        </div>
      ) : null}
      {result.partners ? (
        <MatchSection
          section={result.partners}
          complete={Boolean(result.completion.seeking?.complete)}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      ) : null}
      {result.ventures ? (
        <MatchSection
          section={result.ventures}
          complete={Boolean(result.completion.joining?.complete)}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      ) : null}
    </div>
  );
}

function PartnershipMatchResultsWithQuery({ result }: { result: PartnershipMatchesResult }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = parsePartnershipMatchFilters(searchParams);

  function onFiltersChange(next: PartnershipMatchFilterState) {
    const query = partnershipMatchFiltersToQuery(next);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return <PartnershipMatchResultsView result={result} filters={filters} onFiltersChange={onFiltersChange} />;
}

export function PartnershipMatchResults({ result }: { result: PartnershipMatchesResult }) {
  return (
    <Suspense
      fallback={
        <PartnershipMatchResultsView
          result={result}
          filters={DEFAULT_PARTNERSHIP_MATCH_FILTERS}
          onFiltersChange={() => undefined}
        />
      }
    >
      <PartnershipMatchResultsWithQuery result={result} />
    </Suspense>
  );
}
