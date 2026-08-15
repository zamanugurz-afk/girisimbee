'use client';

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CREATE_LISTING_CATEGORY_CARD_GRID } from '@/components/girisimco/listing/create-listing-category-card';
import { CREATE_LISTING_CAREER_COPY } from '@/components/girisimco/listing/create-listing-career.data';

export function CreateListingCareerGroup({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack: () => void;
}) {
  return (
    <section aria-labelledby="create-career-heading">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B1220] dark:hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kategorilere dön
      </button>

      <div className="mb-6 max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          Adım 1
        </p>
        <h2
          id="create-career-heading"
          className="mt-1.5 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-2xl"
        >
          {CREATE_LISTING_CAREER_COPY.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          {CREATE_LISTING_CAREER_COPY.description}
        </p>
      </div>

      <div className={CREATE_LISTING_CATEGORY_CARD_GRID}>{children}</div>
    </section>
  );
}
