import {
  Heart,
  Megaphone,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';

const CARDS: {
  key: keyof AccountHubStats;
  title: string;
  icon: LucideIcon;
  href?: string;
  borderColor: string;
  bgColor: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    key: 'listings',
    title: 'İlanlarım',
    icon: Megaphone,
    href: '/dashboard/ilanlarim',
    borderColor: 'border-sky-200/90 dark:border-sky-900/40 hover:border-sky-400',
    bgColor: 'bg-sky-50/20 dark:bg-sky-950/20',
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    key: 'favorites',
    title: 'Favorilerim',
    icon: Heart,
    href: '/dashboard/favorilerim',
    borderColor: 'border-rose-200/90 dark:border-rose-900/40 hover:border-rose-400',
    bgColor: 'bg-rose-50/20 dark:bg-rose-950/20',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'followers',
    title: 'Takipçilerim',
    icon: Users,
    href: '/dashboard/profil',
    borderColor: 'border-amber-200/90 dark:border-amber-900/40 hover:border-amber-400',
    bgColor: 'bg-amber-50/20 dark:bg-amber-950/20',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'following',
    title: 'Takip Ettiklerim',
    icon: Users,
    href: '/dashboard/profil',
    borderColor: 'border-emerald-200/90 dark:border-emerald-900/40 hover:border-emerald-400',
    bgColor: 'bg-emerald-50/20 dark:bg-emerald-950/20',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

export function AccountHubStatsGrid({ stats }: { stats: AccountHubStats }) {
  return (
    <section aria-label="Hesap özeti" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, title, icon: Icon, href, borderColor, bgColor, iconBg, iconColor }) => {
        const inner = (
          <div
            className={`group flex h-full min-h-[7.5rem] flex-col justify-between rounded-2xl border ${borderColor} ${bgColor} bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900/90`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 transition-colors group-hover:text-slate-900 dark:group-hover:text-white">
                {title}
              </p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums tracking-tight text-slate-950 dark:text-white">
              {stats[key]}
            </p>
          </div>
        );

        return href ? (
          <Link
            key={key}
            href={href}
            className="block rounded-2xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            {inner}
          </Link>
        ) : (
          <div key={key}>{inner}</div>
        );
      })}
    </section>
  );
}
