'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  DollarSign,
  Store,
} from 'lucide-react';
import { PracticalBusinessIdea } from '@/lib/data/monthly-trend-ideas';
import { cn } from '@/lib/utils';

export function TrendIdeaCard({ item, index }: { item: PracticalBusinessIdea; index?: number }) {
  const detailHref = `/trend-fikirler/${item.id}`;

  return (
    <Link
      href={detailHref}
      className={cn(
        'group relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-2xl',
        'border border-slate-200/90 bg-white/90 shadow-sm transition-all duration-300',
        'hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5',
        'dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-amber-500/40',
      )}
    >
      {/* Görsel Alanı */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Store className="h-10 w-10 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Görsel Üstü Rozetler */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-400 border border-white/10">
            {index !== undefined ? `NİŞ #${index + 1}` : 'NİŞ FİKİR'}
          </span>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
            {item.businessModelBadge}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
          <div className="text-[11px] font-bold text-amber-300">{item.category}</div>
          <div className="text-base font-black truncate">{item.title}</div>
        </div>
      </div>

      {/* Kart İçerik Alanı */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-4">
        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {item.tagline}
        </p>

        {/* Finansal Matris */}
        <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-slate-100 dark:border-zinc-800 text-center">
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
            <div className="text-[9.5px] font-bold text-muted-foreground uppercase">Sermaye</div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">₺{(item.financials.minCapital / 1000).toFixed(0)}k</div>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
            <div className="text-[9.5px] font-bold uppercase">Net Kâr</div>
            <div className="text-xs font-black mt-0.5">₺{(item.financials.monthlyNetProfit / 1000).toFixed(0)}k/ay</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
            <div className="text-[9.5px] font-bold text-muted-foreground uppercase">Amortisman</div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{item.financials.paybackPeriodMonths} Ay</div>
          </div>
        </div>

        {/* Alt Link */}
        <div className="flex items-center justify-between pt-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500">
          <span>Detaylı Fizibiliteyi İncele</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

export function TrendIdeaAdvertiseCta() {
  return (
    <Link
      href="/#assistant-section"
      className={cn(
        'group relative flex h-full min-h-[16rem] flex-col items-center justify-center p-6 text-center',
        'rounded-2xl border-2 border-dashed border-amber-400/80 bg-amber-500/[0.03] transition-all duration-300',
        'hover:border-amber-500 hover:bg-amber-500/[0.08] hover:shadow-md hover:-translate-y-0.5',
        'dark:border-amber-500/50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20',
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm transition-transform duration-300 group-hover:scale-110">
        <Sparkles className="h-6 w-6 fill-slate-950" />
      </div>
      <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
        BU ALAN MÜSAİT
      </span>
      <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
        Kendi Niş Fikrini Simüle Et
      </h3>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 max-w-xs leading-relaxed">
        Girişimbee asistanında sermayeni gir, m², kira ve personel maliyetlerini otomatik hesapla.
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500">
        <span>Hemen Başlayın</span>
        <span>→</span>
      </span>
    </Link>
  );
}
