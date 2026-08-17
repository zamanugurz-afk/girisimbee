'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CareerProfileForm } from '@/features/career-profile/components/career-profile-form';
import {
  CAREER_PROFILE_PRIVACY_DETAIL,
  CAREER_PROFILE_PRIVACY_NOTE,
} from '@/features/career-profile/copy';
import { CAREER_JOURNEY_EMPTY } from '@/features/career-profile/journey';
import type { CareerProfilePageData } from '@/features/career-profile/types';

export function CareerProfilePage({
  data,
  displayName,
}: {
  data: CareerProfilePageData;
  displayName?: string | null;
}) {
  if (!data.seek && !data.hire) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card px-5 py-8">
        <h2 className="text-base font-semibold text-foreground">{CAREER_JOURNEY_EMPTY.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{CAREER_JOURNEY_EMPTY.description}</p>
        <p className="mt-3 text-xs text-muted-foreground">{CAREER_PROFILE_PRIVACY_NOTE}</p>
        <p className="mt-1 text-xs text-muted-foreground">{CAREER_PROFILE_PRIVACY_DETAIL}</p>
        <Button asChild className="mt-4 h-10 w-full rounded-2xl sm:w-auto">
          <Link href={CAREER_JOURNEY_EMPTY.ctaHref}>{CAREER_JOURNEY_EMPTY.ctaLabel}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-10">
      {data.seek ? (
        <section className="min-w-0 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">İş Arıyorum profili</h2>
          <CareerProfileForm record={data.seek} displayName={displayName} />
        </section>
      ) : null}
      {data.hire ? (
        <section className="min-w-0 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">İşe Alıyorum profili</h2>
          <CareerProfileForm record={data.hire} displayName={displayName} />
        </section>
      ) : null}
    </div>
  );
}
