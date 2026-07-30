'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight, TrendingDown, Package } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { ErrorState } from '@/components/feedback/error-state';
import { StatCardSkeleton } from '@/components/feedback/skeletons';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/feedback/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketStatsQuery } from '@/lib/queries';
import { CATEGORIES, PRODUCT_MODELS, OWNER_ROUTE } from '@/config/site';
import { ICON_MAP } from '@/config/navigation';
import { formatTry, formatNumber, formatPct, cn } from '@/lib/utils';

export default function CategoriesPage() {
  const { data: stats, isLoading, isError, refetch } = useMarketStatsQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShoppingBag}
        title="Kategoriler"
        description="Takip edilen ürün kategorileri. Mimari sınırsız kategori destekler — şu anda oyun konsolları ve akıllı saatleri kapsıyor."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Kategoriler' }]}
      />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <StaggerGroup className="space-y-6">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? ShoppingBag;
            const items = stats
              ? stats.filter((s) => PRODUCT_MODELS.find((p) => p.id === s.productModelId)?.categoryId === cat.id)
              : [];
            const avgMedian = items.length
              ? Math.round(items.reduce((a, s) => a + s.medianPriceTry, 0) / items.length)
              : 0;
            const totalSamples = items.reduce((a, s) => a + s.sampleCount, 0);
            const avgTrend = items.length
              ? Math.round((items.reduce((a, s) => a + s.trendPct30d, 0) / items.length) * 10) / 10
              : 0;
            const models = PRODUCT_MODELS.filter((p) => p.categoryId === cat.id);

            return (
              <StaggerItem key={cat.id}>
                <SectionCard>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-1 ring-primary/20">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <h2 className="font-display text-lg font-semibold">{cat.name}</h2>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`${OWNER_ROUTE}/products`}>
                          Gezin
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>

                    {isLoading ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <StatCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <MiniStat icon={Package} label="Takip edilen model" value={formatNumber(models.length)} />
                        <MiniStat icon={TrendingDown} label="Ort. medyan fiyat" value={formatTry(avgMedian)} />
                        <MiniStat
                          icon={ShoppingBag}
                          label="Toplam ilan"
                          value={formatNumber(totalSamples)}
                          trend={avgTrend}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {models.map((m, i) => {
                        const s = items.find((it) => it.productModelId === m.id);
                        return (
                          <FadeIn key={m.id} delay={i * 0.04}>
                            <Link
                              href={`${OWNER_ROUTE}/products/${m.slug}`}
                              className="group block rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-foreground">{m.name}</p>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{m.brand} · {m.releaseYear}</p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="font-display text-base font-semibold">
                                  {formatTry(s?.medianPriceTry ?? m.refPriceTry)}
                                </span>
                                {s && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    {s.sampleCount} ilan
                                  </Badge>
                                )}
                              </div>
                              {s && (
                                <p
                                  className={cn(
                                    'mt-1 text-xs font-medium',
                                    s.trendPct30d > 0 ? 'text-warning' : 'text-success',
                                  )}
                                >
                                  30g: {formatPct(s.trendPct30d)}
                                </p>
                              )}
                            </Link>
                          </FadeIn>
                        );
                      })}
                    </div>
                  </div>
                </SectionCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  trend?: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="font-display text-base font-semibold">{value}</p>
          {trend != null && (
            <span className={cn('text-xs font-medium', trend > 0 ? 'text-warning' : 'text-success')}>
              {formatPct(trend)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
