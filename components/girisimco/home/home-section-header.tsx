'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomeSectionHeader({
  headingId,
  title,
  description,
  href,
  ctaLabel = 'Tümünü Gör',
  icon: Icon,
  variant = 'amber',
}: {
  headingId: string;
  title: string;
  description?: string;
  href: string;
  ctaLabel?: string;
  icon?: LucideIcon;
  variant?: 'amber' | 'emerald' | 'rose' | 'sky' | 'purple' | 'default';
}) {
  const variantStyles = {
    amber: {
      frame: 'bg-gradient-to-r from-amber-500/[0.07] via-amber-500/[0.02] to-white/90 dark:from-amber-500/10 dark:via-zinc-900/80 dark:to-zinc-900/90 border-amber-200/60 dark:border-amber-900/30',
      iconBox: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      hoverAccent: 'hover:border-amber-400/60 hover:text-amber-600',
    },
    emerald: {
      frame: 'bg-gradient-to-r from-emerald-500/[0.07] via-emerald-500/[0.02] to-white/90 dark:from-emerald-500/10 dark:via-zinc-900/80 dark:to-zinc-900/90 border-emerald-200/60 dark:border-emerald-900/30',
      iconBox: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      hoverAccent: 'hover:border-emerald-400/60 hover:text-emerald-600',
    },
    rose: {
      frame: 'bg-gradient-to-r from-rose-500/[0.07] via-rose-500/[0.02] to-white/90 dark:from-rose-500/10 dark:via-zinc-900/80 dark:to-zinc-900/90 border-rose-200/60 dark:border-rose-900/30',
      iconBox: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      hoverAccent: 'hover:border-rose-400/60 hover:text-rose-600',
    },
    sky: {
      frame: 'bg-gradient-to-r from-sky-500/[0.07] via-sky-500/[0.02] to-white/90 dark:from-sky-500/10 dark:via-zinc-900/80 dark:to-zinc-900/90 border-sky-200/60 dark:border-sky-900/30',
      iconBox: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      hoverAccent: 'hover:border-sky-400/60 hover:text-sky-600',
    },
    purple: {
      frame: 'bg-gradient-to-r from-purple-500/[0.07] via-purple-500/[0.02] to-white/90 dark:from-purple-500/10 dark:via-zinc-900/80 dark:to-zinc-900/90 border-purple-200/60 dark:border-purple-900/30',
      iconBox: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      hoverAccent: 'hover:border-purple-400/60 hover:text-purple-600',
    },
    default: {
      frame: 'bg-gradient-to-r from-slate-100/60 via-slate-50/30 to-white/90 dark:from-zinc-800/40 dark:via-zinc-900/80 dark:to-zinc-900/90 border-slate-200/80 dark:border-zinc-800',
      iconBox: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      hoverAccent: 'hover:border-slate-400/60 hover:text-slate-900',
    },
  }[variant];

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3.5',
        'p-3.5 sm:p-4.5 rounded-2xl border backdrop-blur-md shadow-xs',
        variantStyles.frame
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className={cn('p-2.5 rounded-xl shrink-0', variantStyles.iconBox)}>
            <Icon className="w-5 h-5" />
          </span>
        )}
        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-display text-base sm:text-lg lg:text-[1.25rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug"
          >
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      <Link
        href={href}
        className={cn(
          'group inline-flex items-center gap-1.5 self-start sm:self-center shrink-0',
          'px-4 py-1.5 rounded-full text-xs font-semibold',
          'bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md',
          'border border-slate-200/80 dark:border-zinc-700/80',
          'text-zinc-700 dark:text-zinc-300 shadow-xs',
          'hover:bg-white hover:shadow-xs transition-all duration-200',
          variantStyles.hoverAccent
        )}
      >
        <span>{ctaLabel}</span>
        <ArrowRight
          className="h-3.5 w-3.5 text-zinc-400 group-hover:text-current transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
