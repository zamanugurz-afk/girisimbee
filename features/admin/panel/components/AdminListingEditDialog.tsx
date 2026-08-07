'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_LISTING_CATEGORIES,
  ADMIN_LISTING_STATUS_LABELS,
  ADMIN_LISTING_STATUSES,
} from '@/features/admin/panel/constants/admin-listings.constants';
import type {
  AdminListingStatus,
  AdminMockListing,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminListingEditDraft = {
  title: string;
  category: string;
  owner: string;
  status: AdminListingStatus;
};

export function AdminListingEditDialog({
  listing,
  open,
  onOpenChange,
  owners,
  onSave,
}: {
  listing: AdminMockListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owners: string[];
  onSave: (listingId: string, draft: AdminListingEditDraft) => void;
}) {
  const [draft, setDraft] = useState<AdminListingEditDraft | null>(null);

  useEffect(() => {
    if (!listing || !open) return;
    setDraft({
      title: listing.title,
      category: listing.category,
      owner: listing.owner,
      status: listing.status,
    });
  }, [listing, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>İlanı düzenle</DialogTitle>
          <DialogDescription>
            Değişiklikler yalnızca bu oturumdaki mock listede tutulur.
          </DialogDescription>
        </DialogHeader>
        {draft && listing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-listing-title">Başlık</Label>
              <Input
                id="admin-listing-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={draft.category}
                  onValueChange={(value) => setDraft({ ...draft, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_LISTING_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  value={draft.status}
                  onValueChange={(value) =>
                    setDraft({ ...draft, status: value as AdminListingStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_LISTING_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {ADMIN_LISTING_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sahip</Label>
              <Select
                value={draft.owner}
                onValueChange={(value) => setDraft({ ...draft, owner: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      {owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">id: {listing.id}</p>
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            type="button"
            disabled={!draft || !listing}
            onClick={() => {
              if (!draft || !listing) return;
              onSave(listing.id, draft);
              onOpenChange(false);
            }}
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
