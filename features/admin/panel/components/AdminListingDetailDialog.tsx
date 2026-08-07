'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ADMIN_LISTING_STATUS_LABELS } from '@/features/admin/panel/constants/admin-listings.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockListing } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AdminListingDetailDialog({
  listing,
  open,
  onOpenChange,
  onEdit,
}: {
  listing: AdminMockListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (listing: AdminMockListing) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>İlan detayı</DialogTitle>
          <DialogDescription>Mock ilan kaydı — salt okunur özet</DialogDescription>
        </DialogHeader>
        {listing ? (
          <dl>
            <DetailRow label="id" value={listing.id} />
            <DetailRow label="title" value={listing.title} />
            <DetailRow label="category" value={listing.category} />
            <DetailRow label="owner" value={listing.owner} />
            <DetailRow label="status" value={ADMIN_LISTING_STATUS_LABELS[listing.status]} />
            <DetailRow label="view_count" value={String(listing.view_count)} />
            <DetailRow label="favorite_count" value={String(listing.favorite_count)} />
            <DetailRow label="created_at" value={formatAdminDateTime(listing.created_at)} />
            <DetailRow label="updated_at" value={formatAdminDateTime(listing.updated_at)} />
            <DetailRow label="vitrin" value={listing.is_featured ? 'Evet' : 'Hayır'} />
            <DetailRow label="acil vitrin" value={listing.is_urgent ? 'Evet' : 'Hayır'} />
          </dl>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          {listing ? (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(listing);
              }}
            >
              Düzenle
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
