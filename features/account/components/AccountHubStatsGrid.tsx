import {
  Heart,
  Megaphone,
  MessageSquare,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';

const CARDS: {
  key: keyof AccountHubStats;
  title: string;
  icon: LucideIcon;
}[] = [
  { key: 'listings', title: 'İlanlarım', icon: Megaphone },
  { key: 'favorites', title: 'Favorilerim', icon: Heart },
  { key: 'messages', title: 'Mesajlarım', icon: MessageSquare },
  { key: 'followers', title: 'Takipçilerim', icon: Users },
];

export function AccountHubStatsGrid({ stats }: { stats: AccountHubStats }) {
  return (
    <section aria-label="Hesap özeti" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, title, icon: Icon }) => (
        <AccountPanelCard key={key} className="flex h-full min-h-[7.5rem] flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <p className="mt-4 font-display text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {stats[key]}
          </p>
        </AccountPanelCard>
      ))}
    </section>
  );
}
