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
  ADMIN_SUPPORT_CATEGORY_LABELS,
  ADMIN_SUPPORT_PRIORITY_LABELS,
  ADMIN_SUPPORT_STATUS_LABELS,
} from '@/features/admin/panel/constants/admin-support.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockSupportTicket } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AdminSupportDetailDialog({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: AdminMockSupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Destek talebi detayı</DialogTitle>
          <DialogDescription>Support Center — mock kayıt</DialogDescription>
        </DialogHeader>
        {ticket ? (
          <div className="space-y-4">
            <dl>
              <DetailRow label="id" value={ticket.id} />
              <DetailRow label="ticket_id" value={ticket.ticket_id} />
              <DetailRow label="user_id" value={ticket.user_id} />
              <DetailRow label="operator_id" value={ticket.operator_id ?? '—'} />
              <DetailRow label="subject" value={ticket.subject} />
              <DetailRow
                label="category"
                value={ADMIN_SUPPORT_CATEGORY_LABELS[ticket.category]}
              />
              <DetailRow
                label="priority"
                value={ADMIN_SUPPORT_PRIORITY_LABELS[ticket.priority]}
              />
              <DetailRow label="status" value={ADMIN_SUPPORT_STATUS_LABELS[ticket.status]} />
              <DetailRow label="created_at" value={formatAdminDateTime(ticket.created_at)} />
              <DetailRow label="updated_at" value={formatAdminDateTime(ticket.updated_at)} />
              <DetailRow label="closed_at" value={formatAdminDateTime(ticket.closed_at)} />
            </dl>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Notlar</p>
              {ticket.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not yok</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                  {ticket.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Yanıtlar</p>
              {ticket.replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">Yanıt yok</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                  {ticket.replies.map((reply) => (
                    <li key={reply}>{reply}</li>
                  ))}
                </ul>
              )}
            </div>
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
