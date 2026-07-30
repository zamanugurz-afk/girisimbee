'use client';

import type { ListingStatus } from '@/features/listings/types/listing.entity.types';
import { getListingStatusLabel } from '@/features/listings/utils/listing-status-labels';
import { cn } from '@/lib/utils';

interface ListingStatusBannerProps {
  status: ListingStatus;
  rejectedReason?: string | null;
  expiresAt?: string | null;
}

const BANNER_STYLES: Record<ListingStatus, string> = {
  draft: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]',
  pending_review: 'border-amber-200 bg-amber-50 text-amber-900',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  paused: 'border-orange-200 bg-orange-50 text-orange-900',
  expired: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]',
  archived: 'border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]',
  rejected: 'border-red-200 bg-red-50 text-red-900',
  sold: 'border-blue-200 bg-blue-50 text-blue-900',
  deleted: 'border-red-200 bg-red-50 text-red-900',
};

export function ListingStatusBanner({ status, rejectedReason, expiresAt }: ListingStatusBannerProps) {
  return (
    <div className={cn('mb-6 rounded-xl border px-4 py-3', BANNER_STYLES[status])}>
      <p className="text-sm font-medium">{getListingStatusLabel(status)}</p>
      {status === 'pending_review' && (
        <p className="mt-1 text-xs opacity-90">İlanınız inceleme sürecinde. Onaylandığında yayına alınacaktır.</p>
      )}
      {status === 'rejected' && rejectedReason && (
        <p className="mt-1 text-xs opacity-90">Red nedeni: {rejectedReason}</p>
      )}
      {status === 'published' && expiresAt && (
        <p className="mt-1 text-xs opacity-90">
          Bitiş tarihi: {new Date(expiresAt).toLocaleDateString('tr-TR')}
        </p>
      )}
      {status === 'expired' && (
        <p className="mt-1 text-xs opacity-90">İlan süresi doldu. Yenileyerek tekrar yayınlayabilirsiniz.</p>
      )}
    </div>
  );
}
