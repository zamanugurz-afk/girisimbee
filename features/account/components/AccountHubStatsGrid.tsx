import {
  Heart,
  Megaphone,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';

const CARDS: {
  key: keyof AccountHubStats;
  title: string;
  icon: LucideIcon;
  href?: string;
}[] = [
  { key: 'listings', title: 'İlanlarım', icon: Megaphone, href: '/dashboard/ilanlarim' },
  { key: 'favorites', title: 'Favorilerim', icon: Heart, href: '/dashboard/favorilerim' },
  { key: 'followers', title: 'Takipçilerim', icon: Users, href: '/dashboard/takipcilerim' },
  { key: 'following', title: 'Takip ettiklerim', icon: Users, href: '/dashboard/takipcilerim' },
];

export function AccountHubStatsGrid({ stats }: { stats: AccountHubStats }) {
  return (
    <section aria-label="Hesap özeti" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, title, icon: Icon, href }) => {
        const inner = (
          <AccountPanelCard className="group flex h-full min-h-[7.5rem] flex-col justify-between border-border/70 bg-gradient-to-b from-card to-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <p className="text-gc-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">{title}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {stats[key]}
            </p>
          </AccountPanelCard>
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
