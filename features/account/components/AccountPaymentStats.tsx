import type { AccountPaymentStatsData } from '@/features/account/types/account-payments.types';
import { formatTryAmount } from '@/features/account/services/account-payments-mock.service';

const STAT_CARDS: {
  key: keyof AccountPaymentStatsData;
  label: string;
  format?: (value: number) => string;
}[] = [
  { key: 'totalPayments', label: 'Toplam ödeme' },
  {
    key: 'totalSpentTry',
    label: 'Toplam harcama',
    format: formatTryAmount,
  },
  { key: 'activePackageCount', label: 'Aktif paket sayısı' },
];

export function AccountPaymentStats({ stats }: { stats: AccountPaymentStatsData }) {
  return (
    <section aria-label="Ödeme özeti">
      <div className="grid gap-4 sm:grid-cols-3">
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
