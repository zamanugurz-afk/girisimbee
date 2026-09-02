'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Calculator,
  Scale,
  Landmark,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const COCKPIT_SHORTCUTS = [
  {
    id: 'radar',
    title: 'Lokasyon Radarı',
    badge: 'Canlı Pazar',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    description: 'Harita üzerinden ilçe ve yarıçap seçerek rakip yoğunluğunu, demografiyi ve AI yatırım puanını analiz edin.',
    href: '/radar',
    icon: Compass,
    accentBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'assistant',
    title: 'İş Kurma Asistanı',
    badge: '55 Sektör & Bütçe',
    badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    description: 'm² bazlı dükkan kirası, zorunlu demirbaşlar, SGK personel bordrosu ve amortisman fizibilitesi hesaplayın.',
    href: '/is-kurma-asistani',
    icon: Calculator,
    accentBorder: 'hover:border-sky-500/50 hover:shadow-sky-500/5',
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  {
    id: 'legal',
    title: 'Resmi Başvuru Süreci',
    badge: '2026 Mevzuat',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    description: 'MERSİS kuruluşundan Belediye ruhsatına 5 adımlı yol haritası ve resmi başvuru dilekçe şablonları.',
    href: '/is-kurma-asistani#legal-section',
    icon: Scale,
    accentBorder: 'hover:border-indigo-500/50 hover:shadow-indigo-500/5',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'grants',
    title: 'Hibe & Teşvik Radarı',
    badge: 'KOSGEB & İŞKUR',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    description: '375.000 TL KOSGEB hibe desteği, Genç Girişimci vergi muafiyeti ve 81 il bölgesel teşvik analizi.',
    href: '/is-kurma-asistani#grants-section',
    icon: Landmark,
    accentBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/5',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
];

export function AccountCockpitShortcuts() {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Girişimcilik & Yatırım Robotları
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">
          2026 Entegre Kokpitler
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {COCKPIT_SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex flex-col justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${item.accentBorder}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className={`p-2 rounded-xl ${item.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-1">
                    <span>{item.title}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </h4>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-primary">
                <span>Kokpite Git</span>
                <span className="text-xs group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
