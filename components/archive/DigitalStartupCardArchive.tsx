'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

/**
 * ARCHIVED COMPONENT: Dijital ve Startup Çözümler Kartı
 * İhtiyaç duyulduğunda yeniden kullanılabilmesi için tasarımı, rota ve sayaç mantığıyla birebir saklanmaktadır.
 */
export function DigitalStartupHeroCard({
  count = 0,
  isLoading = false,
}: {
  count?: number;
  isLoading?: boolean;
}) {
  return (
    <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer">
      <Link
        href="/dijital-ai"
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
        aria-label="Dijital ve Startup Çözümler"
      />
      <div className="relative z-1 pointer-events-none">
        <div className="flex items-center justify-between mb-3">
          <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4" />
          </span>
          <span aria-hidden className="inline-flex">
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300" />
          </span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
            Dijital ve Startup Çözümler
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed min-h-[34px]">
            Büyümeyi hızlandıran SaaS araçları ve uzman destekleri.
          </p>
        </div>
      </div>
      <div className="relative z-1 pointer-events-none mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          ● {isLoading ? '—' : count} Aktif Çözüm
        </span>
      </div>
    </div>
  );
}
