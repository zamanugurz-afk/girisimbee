import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CAREER_JOURNEY_ACTIONS_CLASS,
  CAREER_JOURNEY_BUTTON_CLASS,
  CAREER_JOURNEY_EMPTY,
  CAREER_JOURNEY_STACK_CLASS,
  presentCareerJourney,
} from '@/features/career-profile/journey';
import type { CareerProfilePageData, CareerProfileRecord } from '@/features/career-profile/types';

function JourneyActions({
  complete,
  journey,
}: {
  complete: boolean;
  journey: ReturnType<typeof presentCareerJourney>;
}) {
  if (complete) {
    return (
      <div className={CAREER_JOURNEY_ACTIONS_CLASS}>
        <Button asChild className={CAREER_JOURNEY_BUTTON_CLASS}>
          <Link href={journey.completeCta.href}>{journey.completeCta.label}</Link>
        </Button>
        <Button asChild variant="outline" className={CAREER_JOURNEY_BUTTON_CLASS}>
          <Link href={journey.completeSecondary.href}>{journey.completeSecondary.label}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={CAREER_JOURNEY_ACTIONS_CLASS}>
      <Button asChild className={CAREER_JOURNEY_BUTTON_CLASS}>
        <Link href={journey.incompletePrimary.href}>{journey.incompletePrimary.label}</Link>
      </Button>
      <Button asChild variant="outline" className={CAREER_JOURNEY_BUTTON_CLASS}>
        <Link href={journey.incompleteSecondary.href}>{journey.incompleteSecondary.label}</Link>
      </Button>
    </div>
  );
}

function ProfileJourneyCard({ record }: { record: CareerProfileRecord }) {
  const journey = presentCareerJourney(record.kind, record.completion);

  return (
    <section className="min-w-0 rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">{journey.title}</h2>
      <p className="mt-2 text-sm font-medium text-foreground">{journey.percentLabel}</p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, record.completion.percent))}%` }}
        />
      </div>
      {record.completion.complete ? (
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{journey.completeTitle}</p>
          <p>{journey.description}</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>{journey.description}</p>
          {journey.missingLabels.length > 0 ? (
            <div>
              <p className="font-medium text-foreground">{journey.strengthenTitle}</p>
              <ul className="mt-1 space-y-0.5">
                {journey.missingLabels.map((label) => (
                  <li key={label}>• {label}</li>
                ))}
              </ul>
              <Link
                href={journey.incompletePrimary.href}
                className="mt-2 inline-flex text-sm font-medium text-primary"
              >
                {journey.strengthenCtaLabel}
              </Link>
            </div>
          ) : null}
        </div>
      )}
      <JourneyActions complete={record.completion.complete} journey={journey} />
    </section>
  );
}

export function CareerProfileOverviewCard({ data }: { data: CareerProfilePageData }) {
  const records = [data.seek, data.hire].filter((record): record is CareerProfileRecord => Boolean(record));
  if (records.length === 0) {
    return (
      <section className="min-w-0 rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">{CAREER_JOURNEY_EMPTY.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{CAREER_JOURNEY_EMPTY.description}</p>
        <Button asChild className="mt-4 h-10 w-full rounded-2xl sm:w-auto">
          <Link href={CAREER_JOURNEY_EMPTY.ctaHref}>{CAREER_JOURNEY_EMPTY.ctaLabel}</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className={CAREER_JOURNEY_STACK_CLASS}>
      {records.map((record) => (
        <ProfileJourneyCard key={record.listingId} record={record} />
      ))}
    </div>
  );
}
