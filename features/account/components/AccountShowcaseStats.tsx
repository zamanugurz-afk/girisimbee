import type { AccountShowcaseStatsData } from '@/features/account/types/account-showcase.types';

const STAT_CARDS: {
  key: keyof AccountShowcaseStatsData;
  label: string;
}[] = [
  { key: 'activePackageCount', label: 'Aktif paket sayısı' },
  { key: 'totalViews', label: 'Toplam görüntülenme' },
  { key: 'totalFavorites', label: 'Toplam favori' },
  { key: 'totalClicks', label: 'Toplam tıklanma' },
];

export function AccountShowcaseStats({ stats }: { stats: AccountShowcaseStatsData }) {
  return (
    <section aria-label="Vitrin özeti">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
              {stats[card.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
