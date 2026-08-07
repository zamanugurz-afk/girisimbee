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
import {
  ADMIN_PAYMENT_METHOD_LABELS,
  ADMIN_PAYMENT_PACKAGE_LABELS,
  ADMIN_PAYMENT_STATUS_LABELS,
} from '@/features/admin/panel/constants/admin-payments.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockPayment } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminInvoiceDialog({
  payment,
  open,
  onOpenChange,
}: {
  payment: AdminMockPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fatura ayrıntısı</DialogTitle>
          <DialogDescription>Mock fatura — gerçek sağlayıcı bağlantısı yok</DialogDescription>
        </DialogHeader>
        {payment ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/80 p-4 dark:border-white/10">
              <p className="text-xs text-muted-foreground">Fatura no</p>
              <p className="font-display text-xl font-semibold text-foreground">
                {payment.invoice_number}
              </p>
            </div>
            <dl>
              <DetailRow label="Ödeme id" value={payment.id} />
              <DetailRow label="Müşteri" value={`${payment.user_name} (${payment.user_id})`} />
              <DetailRow label="İlan" value={payment.listing_id} />
              <DetailRow
                label="Paket"
                value={ADMIN_PAYMENT_PACKAGE_LABELS[payment.package_type]}
              />
              <DetailRow label="Tutar" value={formatMoney(payment.amount, payment.currency)} />
              <DetailRow
                label="Komisyon"
                value={formatMoney(payment.commission_amount, payment.currency)}
              />
              <DetailRow
                label="Ödeme yöntemi"
                value={ADMIN_PAYMENT_METHOD_LABELS[payment.payment_method]}
              />
              <DetailRow label="Durum" value={ADMIN_PAYMENT_STATUS_LABELS[payment.status]} />
              <DetailRow label="Düzenleme" value={formatAdminDateTime(payment.created_at)} />
            </dl>
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
