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
  ADMIN_LOG_CATEGORY_LABELS,
  ADMIN_LOG_STATUS_LABELS,
} from '@/features/admin/panel/constants/admin-logs.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockLog } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AdminLogDetailDialog({
  log,
  open,
  onOpenChange,
}: {
  log: AdminMockLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log detayı</DialogTitle>
          <DialogDescription>Sistem kaydı — mock</DialogDescription>
        </DialogHeader>
        {log ? (
          <dl>
            <DetailRow label="id" value={log.id} />
            <DetailRow label="category" value={ADMIN_LOG_CATEGORY_LABELS[log.category]} />
            <DetailRow label="event_type" value={log.event_type} />
            <DetailRow label="actor" value={log.actor} />
            <DetailRow label="target" value={log.target} />
            <DetailRow label="ip_address" value={log.ip_address} />
            <DetailRow label="status" value={ADMIN_LOG_STATUS_LABELS[log.status]} />
            <DetailRow label="created_at" value={formatAdminDateTime(log.created_at)} />
            <DetailRow label="details" value={log.details} />
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
