'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag, TrendingDown, TrendingUp, BarChart3, Package, MapPin, Clock } from 'lucide-react';
import { useProductDetail } from '@/hooks/use-product-detail';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { StatCard } from '@/components/data-display/stat-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { Spinner } from '@/components/feedback/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { OWNER_ROUTE } from '@/config/site';
import { productUrl } from '@/lib/nav';
import { formatTry, formatPct, timeAgo, cn } from '@/lib/utils';
import {
  handleListingRowClick,
  ListingSourceIconButton,
} from '@/components/data-display/listing-source-actions';
import { openListingSource } from '@/lib/listing-source';
import { PriceTrendChart } from '@/components/charts';
import type { PricePoint } from '@/types';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.id as string) ?? null;

  const data = useProductDetail(slug);

  if (!slug || !data.product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {slug && data.product === null ? (
          <EmptyState
            icon={Tag}
            title="Ürün bulunamadı"
            description="Bu ürün mevcut değil veya kaldırılmış olabilir."
            action={{ label: 'Ürünlere dön', onClick: () => router.push(`${OWNER_ROUTE}/products`) }}
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Spinner size={32} />
            <p className="text-sm text-muted-foreground">Ürün yükleniyor…</p>
          </div>
        )}
      </div>
    );
  }

  const { product, category, stats, relatedListings, priceHistory, bestDeal, avgPrice, lowestPrice, highestPrice, listingCount } = data;

  const chartData: PricePoint[] = priceHistory.map((p) => ({
    date: p.detected_at,
    median: p.price,
    min: Math.round(p.price * 0.9),
    max: Math.round(p.price * 1.1),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumbs
          items={[
            { label: 'Panel', href: OWNER_ROUTE },
            { label: 'Ürünler', href: `${OWNER_ROUTE}/products` },
            { label: product.name },
          ]}
        />
        <Button variant="ghost" size="sm" asChild>
          <Link href={`${OWNER_ROUTE}/products`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Ürünlere dön
          </Link>
        </Button>
      </div>

      <PageHeader
        icon={Tag}
        title={product.name}
        description={`${product.brand} · ${product.model}${category ? ' · ' + category.name : ''}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ortalama fiyat" value={formatTry(avgPrice)} icon={BarChart3} tone="primary" />
        <StatCard label="En düşük fiyat" value={formatTry(lowestPrice)} icon={TrendingDown} tone="success" />
        <StatCard label="En yüksek fiyat" value={formatTry(highestPrice)} icon={TrendingUp} tone="warning" />
        <StatCard label="Aktif ilan" value={listingCount} icon={Package} tone="primary" />
      </div>

      {stats && (
        <SectionCard title="Piyasa İstatistikleri" description="Tüm kaynaklardan toplanan veriler" icon={BarChart3}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Metric label="Medyan" value={formatTry(stats.median_price)} tone="primary" />
            <Metric label="Ortalama" value={formatTry(stats.average_price)} tone="primary" />
            <Metric label="Min" value={formatTry(stats.minimum_price)} tone="success" />
            <Metric label="Maks" value={formatTry(stats.maximum_price)} tone="warning" />
            <Metric label="Yayılma" value={`${stats.spread_pct}%`} tone="muted" />
          </div>
        </SectionCard>
      )}

      {chartData.length > 0 && (
        <SectionCard title="Fiyat Geçmişi" description="Son dönem fiyat eğilimi" icon={TrendingDown}>
          <PriceTrendChart data={chartData} height={280} />
        </SectionCard>
      )}

      <SectionCard title="İlgili İlanlar" description={`${listingCount} aktif ilan`} icon={Package} noPadding bodyClassName="p-0">
        {relatedListings.length === 0 ? (
          <EmptyState icon={Package} title="İlan yok" description="Bu ürün için şu an aktif ilan bulunmuyor." className="border-0" />
        ) : (
          <div className="divide-y divide-border">
            {relatedListings.map((item, idx) => {
              const { listing, analysis, discountPct } = item;
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.02 }}
                  className="group flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                  onClick={() => handleListingRowClick(listing)}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {listing.image_urls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.image_urls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.district}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(listing.first_seen_at)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold tabular-nums text-foreground">{formatTry(listing.price)}</p>
                    {discountPct > 0 && (
                      <p className="text-[10px] font-semibold text-success">-{discountPct}% piyasa</p>
                    )}
                  </div>
                  {analysis && (
                    <Badge variant="secondary" className={cn(analysis.opportunity_score >= 80 ? 'border-success/30 bg-success-soft text-success' : '')}>
                      AI: {analysis.opportunity_score}
                    </Badge>
                  )}
                  <ListingSourceIconButton
                    listing={listing}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    iconClassName="h-3 w-3"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {bestDeal && (
        <SectionCard title="En İyi Fırsat" description="Bu ürünün en yüksek AI puanlı ilanı" icon={TrendingDown}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
              {bestDeal.image_urls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bestDeal.image_urls[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{bestDeal.title}</p>
              <p className="text-xs text-muted-foreground">{formatTry(bestDeal.price)} · {bestDeal.district}</p>
            </div>
            <Button size="sm" onClick={() => openListingSource(bestDeal)}>
              İncele
              <ArrowLeft className="ml-1.5 h-3.5 w-3.5 rotate-180" />
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'primary' | 'success' | 'warning' | 'muted' }) {
  const cls = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    muted: 'text-muted-foreground',
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 font-display text-base font-bold', cls)}>{value}</p>
    </div>
  );
}
