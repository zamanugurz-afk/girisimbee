'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ListingFormPreviewContent } from '@/features/listings/components/listing-form-preview-content';
import type { ListingFormValues } from '@/features/listings/form/dynamic-listing-form';
import type { ListingType } from '@/features/listings/types/listing-type.types';

interface ListingPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: ListingFormValues;
  listingType: ListingType;
}

export function ListingPreviewDialog({
  open,
  onOpenChange,
  values,
  listingType,
}: ListingPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>İlan Önizleme</DialogTitle>
        </DialogHeader>
        <ListingFormPreviewContent values={values} listingType={listingType} readOnly />
      </DialogContent>
    </Dialog>
  );
}
