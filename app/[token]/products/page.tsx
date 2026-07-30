'use client';

import { useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Tag, Star, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { DataTable } from '@/components/data-display/data-table';
import { StatCardSkeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { useMarketStatsQuery } from '@/lib/queries';
import { PRODUCT_MODELS, CATEGORIES, CATEGORY_MAP, OWNER_ROUTE } from '@/config/site';
import { formatTry, formatPct, cn } from '@/lib/utils';
import { productUrl } from '@/lib/nav';
import type { MarketStats } from '@/types';
import { useRouter } from 'next/navigation';

type Row = MarketStats & {
  name: string;
  brand: string;
  category: string;
  refPrice: number;
};

export default function ProductsPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMarketStatsQuery();
  const [filter, setFilter] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    if (!data) return [];
    return data
      .map((s) => {
        const p = PRODUCT_MODELS.find((m) => m.id === s.productModelId)!;
        return {
          ...s,
          name: p.name,
          brand: p.brand,
          category: CATEGORY_MAP[p.categoryId]?.name ?? '—',
          refPrice: p.refPriceTry,
        };
      })
      .filter((r) => !filter || PRODUCT_MODELS.find((m) => m.id === r.productModelId)?.categoryId === filter);
  }, [data, filter]);

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Ürün',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-foreground">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.brand}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: 'medianPriceTry',
        header: 'Medyan',
        cell: ({ row }) => (
          <span className="font-medium">{formatTry(row.original.medianPriceTry)}</span>
        ),
      },
      {
        accessorKey: 'minPriceTry',
        header: 'Min',
        cell: ({ row }) => (
          <span className="text-success">{formatTry(row.original.minPriceTry)}</span>
        ),
      },
      {
        accessorKey: 'sampleCount',
        header: 'İlan',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.sampleCount}</span>
        ),
      },
      {
        accessorKey: 'trendPct30d',
        header: '30g eğilim',
        cell: ({ row }) => {
          const v = row.original.trendPct30d;
          const up = v > 0;
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                up ? 'text-warning' : 'text-success',
              )}
            >
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPct(v)}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Tag}
        title="Ürünler"
        description="Tüm kaynaklardan canlı piyasa istatistikleriyle takip edilen ürün modelleri."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Ürünler' }]}
        actions={
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter(null)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                !filter ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              Tümü
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  filter === c.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        }
      />

      <SectionCard noPadding bodyClassName="p-0">
        {isError ? (
          <div className="p-5">
            <ErrorState onRetry={refetch} />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Tag} title="Ürün yok" description="Bu kategoride henüz takip edilen ürün yok." />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            onRowClick={(row) => {
              const model = PRODUCT_MODELS.find((m) => m.id === row.productModelId);
              if (model) router.push(productUrl(model.slug));
            }}
          />
        )}
      </SectionCard>

      {rows.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {rows.length} takip edilen model · {rows.reduce((a, r) => a + r.sampleCount, 0)} toplam ilan
        </p>
      )}
    </div>
  );
}
