import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CareerMatchCardView } from '@/features/matching-engine/components/career-match-results';
import { MATCH_GRID_CLASS } from '@/features/matching-engine/presentation/career-match-layout';
import type { CareerMatchesResult } from '@/features/matching-engine/types';

export function AccountDashboardMatchingHighlights({
  careerMatches,
}: {
  careerMatches?: CareerMatchesResult | null;
}) {
  if (!careerMatches) return null;

  // Find the primary section that has matches
  const section = careerMatches.opportunities?.matches.length
    ? careerMatches.opportunities
    : careerMatches.candidates?.matches.length
      ? careerMatches.candidates
      : null;

  if (!section || section.matches.length === 0) return null;

  const topMatches = section.matches.slice(0, 3);
  const isSeeker = section.direction === 'opportunities';

  return (
    <section className="min-w-0 space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {isSeeker ? 'Kariyeriniz İçin Öneriler' : 'İlanınız İçin Önerilen Adaylar'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSeeker
              ? 'Profilinize ve tercihlerinize göre öne çıkan en uygun iş fırsatları.'
              : 'Açık pozisyonunuz için öne çıkan en uygun adaylar.'}
          </p>
        </div>
        <Button asChild variant="ghost" className="h-9 self-start rounded-xl text-xs font-semibold text-primary sm:self-auto">
          <Link href="/dashboard/eslesmeler">
            Tümünü Gör ({section.matches.length}) →
          </Link>
        </Button>
      </div>

      <div className={MATCH_GRID_CLASS}>
        {topMatches.map((card) => (
          <CareerMatchCardView
            key={card.listingId}
            card={card}
            direction={section.direction}
          />
        ))}
      </div>
    </section>
  );
}
