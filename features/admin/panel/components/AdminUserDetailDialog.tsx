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
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_STATUS_LABELS,
} from '@/features/admin/panel/constants/admin-users.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockUser } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AdminUserDetailDialog({
  user,
  open,
  onOpenChange,
  onEdit,
}: {
  user: AdminMockUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: AdminMockUser) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kullanıcı detayı</DialogTitle>
          <DialogDescription>Mock kullanıcı kaydı — salt okunur özet</DialogDescription>
        </DialogHeader>
        {user ? (
          <dl>
            <DetailRow label="id" value={user.id} />
            <DetailRow label="full_name" value={user.full_name} />
            <DetailRow label="username" value={user.username} />
            <DetailRow label="email" value={user.email} />
            <DetailRow label="role" value={ADMIN_USER_ROLE_LABELS[user.role]} />
            <DetailRow label="status" value={ADMIN_USER_STATUS_LABELS[user.status]} />
            <DetailRow label="created_at" value={formatAdminDateTime(user.created_at)} />
            <DetailRow
              label="last_login_at"
              value={formatAdminDateTime(user.last_login_at)}
            />
          </dl>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          {user ? (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(user);
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
