'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  amount?: string;
}

/** Checkout dialog — premium-only, never opened during MVP. */
export function PaymentDialog({
  open,
  onOpenChange,
  planName = 'Pro',
  amount = '299',
}: PaymentDialogProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{planName} planına geç</DialogTitle>
          <DialogDescription>
            Aylık {amount} TL — istediğiniz zaman iptal edebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-border/80 p-4 dark:border-white/10">
            <p className="text-xs text-muted-foreground">Ödenecek tutar</p>
            <p className="text-2xl font-semibold text-foreground">{amount} TL</p>
          </div>
          <Button
            className="w-full rounded-lg"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
