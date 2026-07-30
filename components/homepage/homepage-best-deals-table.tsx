'use client';

import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';
import type { GroupedProductView } from '@/lib/grouped-product-view';
import { groupedProductUrl } from '@/lib/nav';
import { formatTry, formatPct } from '@/lib/utils';
import { Spinner } from '@/components/feedback/spinner';

interface HomepageBestDealsTableProps {
  groups: GroupedProductView[];
  isLoading?: boolean;
}

export function HomepageBestDealsTable({ groups, isLoading }: HomepageBestDealsTableProps) {
  const router = useRouter();

  return (
    <div className="ib-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Bugünün En İyi Fırsatları</h2>
            <p className="text-xs text-muted-foreground">Gruplu ürünler · fırsat puanına göre sıralı</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {groups.length} ürün
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : groups.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted-foreground">
          Seçili filtrelere uyan aktif ürün bulunamadı.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Ürün
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  İlan
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  En düşük
                </th>
                <th className="hidden px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:table-cell">
                  Ortalama
                </th>
                <th className="hidden px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground md:table-cell">
                  En yüksek
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Fırsat
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const average = group.dealScore?.average_price ?? group.dealScore?.market_average ?? 0;
                const highest = group.dealScore?.highest_price ?? group.lowestPrice;
                const dealPct = group.dealScore?.deal_percentage ?? 0;

                return (
                  <tr
                    key={group.id}
                    className="cursor-pointer border-b border-border/70 transition-colors hover:bg-muted/40"
                    onClick={() => router.push(groupedProductUrl(group.id))}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {group.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={group.imageUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{group.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {group.marketplaceCount} pazaryeri
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{group.listingIds.length}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatTry(group.lowestPrice)}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">
                      {formatTry(average)}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-muted-foreground md:table-cell">
                      {formatTry(highest)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          dealPct < -5
                            ? 'font-semibold text-success'
                            : 'text-muted-foreground'
                        }
                      >
                        {formatPct(dealPct)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
