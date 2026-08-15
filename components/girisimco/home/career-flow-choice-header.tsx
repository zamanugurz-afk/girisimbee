'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CAREER_HUB_LANDING } from '@/components/girisimco/home/home-marketplace.data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BACK_CLASS =
  'inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B1220] dark:hover:text-foreground';

function CategoriesBackControl({
  href,
  onBack,
}: {
  href?: string;
  onBack?: () => void;
}) {
  const label = (
    <>
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Kategorilere dön
    </>
  );

  if (onBack) {
    return (
      <button type="button" onClick={onBack} className={BACK_CLASS}>
        {label}
      </button>
    );
  }

  return (
    <Link href={href ?? '/'} className={BACK_CLASS}>
      {label}
    </Link>
  );
}

export function CareerFlowChoiceHeader({
  headingLevel = 'h1',
  headingId,
  backHref = '/',
  onBack,
}: {
  headingLevel?: 'h1' | 'h2';
  headingId?: string;
  backHref?: string;
  onBack?: () => void;
}) {
  const Heading = headingLevel;

  return (
    <header className="mx-auto max-w-2xl text-center">
      <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
        {CAREER_HUB_LANDING.badge}
      </Badge>
      <Heading
        id={headingId}
        className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]"
      >
        {CAREER_HUB_LANDING.title}
      </Heading>
      <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
        {CAREER_HUB_LANDING.description}
      </p>
      <div className={cn('mt-3 flex justify-center')}>
        <CategoriesBackControl href={backHref} onBack={onBack} />
      </div>
    </header>
  );
}
