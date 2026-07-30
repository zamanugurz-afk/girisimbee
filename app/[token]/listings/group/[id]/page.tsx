'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { useGroupedProductDetail } from '@/lib/queries';
import { extractGroupedProductId } from '@/lib/nav';
import { OWNER_ROUTE } from '@/config/site';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/feedback/spinner';
import { ErrorState } from '@/components/feedback/error-state';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { GroupedProductHeader } from '@/components/grouped-product-detail/grouped-product-header';
import { PriceComparisonTable } from '@/components/grouped-product-detail/price-comparison-table';
import { MarketSummary } from '@/components/grouped-product-detail/market-summary';
import { ProductInformation } from '@/components/grouped-product-detail/product-information';
import { GroupedPriceHistorySection, GroupedProductIntelligence } from '@/components/grouped-product-detail/product-intelligence';
import { DetailSidebar } from '@/components/grouped-product-detail/detail-sidebar';

export default function GroupedProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) ?? null;
  const groupId = rawId ? extractGroupedProductId(rawId) : null;

  const { data: product, isLoading, isError, refetch } = useGroupedProductDetail(groupId);

  if (!groupId || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} />
          <p className="text-sm text-muted-foreground">Ürün detayları yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Ürün bulunamadı"
          description="Bu gruplu ürün artık mevcut değil veya kaldırılmış olabilir."
          onRetry={() => (product ? refetch() : router.push(`${OWNER_ROUTE}/listings`))}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Panel', href: OWNER_ROUTE },
            { label: 'İlanlar', href: `${OWNER_ROUTE}/listings` },
            { label: product.name },
          ]}
        />
        <Button variant="ghost" size="sm" asChild>
          <Link href={`${OWNER_ROUTE}/listings`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            İlanlara dön
          </Link>
        </Button>
      </div>

      <GroupedProductHeader product={product} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <PriceComparisonTable listings={product.listings} />
          <GroupedPriceHistorySection groupId={product.id} />
          <MarketSummary product={product} />
          <GroupedProductIntelligence product={product} />
          <ProductInformation product={product} />
        </div>

        <DetailSidebar product={product} />
      </div>

      {product.listingCount === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          <Package className="mx-auto mb-2 h-5 w-5" />
          Bu ürün için aktif ilan bulunamadı.
        </div>
      )}
    </div>
  );
}
