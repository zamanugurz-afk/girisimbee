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

export function AdminPaymentDetailDialog({
  payment,
  open,
  onOpenChange,
  onOpenInvoice,
}: {
  payment: AdminMockPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenInvoice?: (payment: AdminMockPayment) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ödeme ayrıntısı</DialogTitle>
          <DialogDescription>Payment Center — mock kayıt (sağıcı yok)</DialogDescription>
        </DialogHeader>
        {payment ? (
          <dl>
            <DetailRow label="id" value={payment.id} />
            <DetailRow label="user_id" value={payment.user_id} />
            <DetailRow label="listing_id" value={payment.listing_id} />
            <DetailRow
              label="package_type"
              value={ADMIN_PAYMENT_PACKAGE_LABELS[payment.package_type]}
            />
            <DetailRow label="amount" value={formatMoney(payment.amount, payment.currency)} />
            <DetailRow
              label="commission"
              value={formatMoney(payment.commission_amount, payment.currency)}
            />
            <DetailRow label="currency" value={payment.currency} />
            <DetailRow
              label="payment_method"
              value={ADMIN_PAYMENT_METHOD_LABELS[payment.payment_method]}
            />
            <DetailRow label="invoice_number" value={payment.invoice_number} />
            <DetailRow label="status" value={ADMIN_PAYMENT_STATUS_LABELS[payment.status]} />
            <DetailRow label="created_at" value={formatAdminDateTime(payment.created_at)} />
            <DetailRow label="updated_at" value={formatAdminDateTime(payment.updated_at)} />
          </dl>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          {payment && onOpenInvoice ? (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenInvoice(payment);
              }}
            >
              Fatura ayrıntısı
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
