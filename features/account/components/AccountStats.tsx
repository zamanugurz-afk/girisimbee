import type { AccountDashboardStats } from '@/features/account/types/account-panel.types';

const STAT_CARDS: {
  key: keyof AccountDashboardStats;
  label: string;
  format?: (value: string | number) => string;
}[] = [
  { key: 'totalListings', label: 'Toplam ilan sayısı' },
  { key: 'activeListings', label: 'Aktif ilan sayısı' },
  { key: 'totalViews', label: 'Toplam görüntülenme sayısı' },
  { key: 'totalFavorites', label: 'Toplam favori sayısı' },
  {
    key: 'remainingShowcaseDuration',
    label: 'Kalan vitrin süresi',
    format: (value) => String(value),
  },
];

export function AccountStats({ stats }: { stats: AccountDashboardStats }) {
  return (
    <section aria-label="Panel özeti">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const raw = stats[card.key];
          const value = card.format ? card.format(raw) : String(raw);
          return (
            <div
              key={card.key}
              className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
