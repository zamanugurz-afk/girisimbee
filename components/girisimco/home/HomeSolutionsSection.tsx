'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  DIGITAL_AI_BROWSE_DESCRIPTION,
  DIGITAL_AI_HOME_CTA_HREF,
} from '@/features/listings/presentation/digital-ai-copy';
import { cn } from '@/lib/utils';

/** Homepage solutions strip — clean, modern, compact SaaS banner directly under Market. */
export function HomeSolutionsSection() {
  return (
    <section
      id="cozumler"
      className="relative z-[1] min-w-0 overflow-x-hidden bg-transparent py-4 lg:py-6"
      aria-labelledby="home-solutions-heading"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-8">
        <Link
          href={DIGITAL_AI_HOME_CTA_HREF}
          className={cn(
            'group relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl p-6 sm:p-7 md:flex-row md:items-center',
            'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md',
            'border border-zinc-200/80 dark:border-zinc-800',
            'shadow-sm transition-all duration-300 ease-out',
            'hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg',
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <span>Dijital ve AI Ekosistemi</span>
              </div>
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Dijital ve AI Çözümleri
              </h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm">
                {DIGITAL_AI_BROWSE_DESCRIPTION}
              </p>
            </div>
          </div>

          <div className="w-full shrink-0 md:w-auto">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all group-hover:shadow-md dark:bg-white dark:text-zinc-900 md:w-auto">
              Tüm çözümleri gör
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
