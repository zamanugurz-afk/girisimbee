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
  ADMIN_COMPLAINT_STATUS_LABELS,
  ADMIN_COMPLAINT_TYPE_LABELS,
} from '@/features/admin/panel/constants/admin-complaints.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockComplaint } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AdminComplaintDetailDialog({
  complaint,
  open,
  onOpenChange,
}: {
  complaint: AdminMockComplaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Şikâyet detayı</DialogTitle>
          <DialogDescription>Mock şikâyet kaydı</DialogDescription>
        </DialogHeader>
        {complaint ? (
          <dl>
            <DetailRow label="id" value={complaint.id} />
            <DetailRow
              label="report_type"
              value={ADMIN_COMPLAINT_TYPE_LABELS[complaint.report_type]}
            />
            <DetailRow label="target_id" value={complaint.target_id} />
            <DetailRow label="reporter" value={complaint.reporter} />
            <DetailRow label="reason" value={complaint.reason} />
            <DetailRow label="description" value={complaint.description} />
            <DetailRow
              label="status"
              value={ADMIN_COMPLAINT_STATUS_LABELS[complaint.status]}
            />
            <DetailRow label="created_at" value={formatAdminDateTime(complaint.created_at)} />
            <DetailRow label="assignee" value={complaint.assignee ?? '—'} />
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
