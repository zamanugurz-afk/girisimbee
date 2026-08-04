'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminEmptyState } from '@/features/admin/panel/components/AdminEmptyState';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import {
  cloneSuspiciousQueue,
  replaceSuspiciousQueue,
  type SuspiciousContentItem,
  type SuspiciousQueueStatus,
} from '@/features/admin/content-policy/mock/suspicious-content.mock';

const STATUS_LABEL: Record<SuspiciousQueueStatus, string> = {
  pending: 'Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

export function AdminSuspiciousContentView() {
  const [items, setItems] = useState<SuspiciousContentItem[]>(() => cloneSuspiciousQueue());
  const [statusFilter, setStatusFilter] = useState<SuspiciousQueueStatus | 'all'>('pending');

  const filtered = useMemo(() => {
    return items.filter((row) => statusFilter === 'all' || row.status === statusFilter);
  }, [items, statusFilter]);

  function persist(next: SuspiciousContentItem[]) {
    setItems(next);
    replaceSuspiciousQueue(next);
  }

  function setStatus(id: string, status: SuspiciousQueueStatus) {
    persist(
      items.map((row) =>
        row.id === id ? { ...row, status, updatedAt: new Date().toISOString() } : row,
      ),
    );
    toast.success(status === 'approved' ? 'Onaylandı (mock)' : 'Reddedildi (mock)');
  }

  return (
    <AdminPageShell
      title="Şüpheli içerik kuyruğu"
      description="Otomatik politika bayraklarıyla işaretlenen veya incelemeye düşen ilan içerikleri."
      toolbar={
        <div className="flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={statusFilter === key ? 'default' : 'outline'}
              onClick={() => setStatusFilter(key)}
            >
              {key === 'all' ? 'Tümü' : STATUS_LABEL[key]}
            </Button>
          ))}
        </div>
      }
    >
      {filtered.length === 0 ? (
        <AdminEmptyState
          title="Kuyruk boş"
          description="Bu filtrede şüpheli içerik kaydı yok."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-foreground">{row.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{row.snippet}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Sahip: {row.ownerLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {row.flags.map((flag) => (
                      <Badge key={flag} variant="secondary">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge variant={row.status === 'pending' ? 'default' : 'outline'}>
                  {STATUS_LABEL[row.status]}
                </Badge>
              </div>
              {row.status === 'pending' ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => setStatus(row.id, 'approved')}>
                    Onayla
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus(row.id, 'rejected')}
                  >
                    Reddet
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AdminPageShell>
  );
}
