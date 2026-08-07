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
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUS_LABELS,
  ADMIN_USER_STATUSES,
} from '@/features/admin/panel/constants/admin-users.constants';
import type {
  AdminMockUser,
  AdminUserRole,
  AdminUserStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminUserEditDraft = {
  full_name: string;
  username: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
};

export function AdminUserEditDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: {
  user: AdminMockUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, draft: AdminUserEditDraft) => void;
}) {
  const [draft, setDraft] = useState<AdminUserEditDraft | null>(null);

  useEffect(() => {
    if (!user || !open) return;
    setDraft({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  }, [user, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kullanıcıyı düzenle</DialogTitle>
          <DialogDescription>
            Değişiklikler yalnızca bu oturumdaki mock listede tutulur.
          </DialogDescription>
        </DialogHeader>
        {draft && user ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-user-full-name">Ad soyad</Label>
              <Input
                id="admin-user-full-name"
                value={draft.full_name}
                onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-user-username">Kullanıcı adı</Label>
              <Input
                id="admin-user-username"
                value={draft.username}
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-user-email">E-posta</Label>
              <Input
                id="admin-user-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={draft.role}
                  onValueChange={(value) =>
                    setDraft({ ...draft, role: value as AdminUserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ADMIN_USER_ROLE_LABELS[role]}
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
                    setDraft({ ...draft, status: value as AdminUserStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_USER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {ADMIN_USER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">id: {user.id}</p>
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            type="button"
            disabled={!draft || !user}
            onClick={() => {
              if (!draft || !user) return;
              onSave(user.id, draft);
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
