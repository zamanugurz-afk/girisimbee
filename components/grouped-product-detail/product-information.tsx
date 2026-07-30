'use client';

import { Tag } from 'lucide-react';
import type { GroupedProductDetailView } from '@/lib/grouped-product-detail';
import { SectionCard } from '@/components/data-display/section-card';

interface ProductInformationProps {
  product: GroupedProductDetailView;
}

export function ProductInformation({ product }: ProductInformationProps) {
  const digitalDisc =
    product.edition === 'DIGITAL'
      ? 'Digital'
      : product.edition === 'DISC'
        ? 'Disc'
        : product.editionLabel;

  return (
    <SectionCard title="Ürün bilgisi" description="Normalize edilmiş ürün özellikleri" icon={Tag}>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="Edition" value={product.editionLabel} />
        <InfoRow label="Depolama" value={product.storage} />
        <InfoRow label="Digital / Disc" value={digitalDisc} />
        <InfoRow label="Durum" value={product.conditionLabel} />
      </dl>
    </SectionCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}
