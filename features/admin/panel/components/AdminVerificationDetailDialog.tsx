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
  ADMIN_VERIFICATION_STATUS_LABELS,
  ADMIN_VERIFICATION_TYPE_LABELS,
} from '@/features/admin/panel/constants/admin-verifications.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockVerification } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AdminVerificationDetailDialog({
  verification,
  open,
  onOpenChange,
}: {
  verification: AdminMockVerification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Doğrulama detayı</DialogTitle>
          <DialogDescription>Verification Center — mock kayıt</DialogDescription>
        </DialogHeader>
        {verification ? (
          <dl>
            <DetailRow label="id" value={verification.id} />
            <DetailRow label="user_id" value={verification.user_id} />
            <DetailRow label="full_name" value={verification.full_name} />
            <DetailRow
              label="verification_type"
              value={ADMIN_VERIFICATION_TYPE_LABELS[verification.verification_type]}
            />
            <DetailRow
              label="status"
              value={ADMIN_VERIFICATION_STATUS_LABELS[verification.status]}
            />
            <DetailRow label="created_at" value={formatAdminDateTime(verification.created_at)} />
            <DetailRow label="updated_at" value={formatAdminDateTime(verification.updated_at)} />
            <DetailRow label="note" value={verification.note ?? '—'} />
          </dl>
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
