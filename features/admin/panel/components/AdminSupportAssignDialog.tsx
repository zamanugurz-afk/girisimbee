'use client';

import { useEffect, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ADMIN_SUPPORT_OPERATORS } from '@/features/admin/panel/constants/admin-support.constants';
import type { AdminMockSupportTicket } from '@/features/admin/panel/types/admin-panel.types';

export function AdminSupportAssignDialog({
  ticket,
  open,
  onOpenChange,
  onAssign,
}: {
  ticket: AdminMockSupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (ticketId: string, operatorId: string, operatorName: string) => void;
}) {
  const [operatorId, setOperatorId] = useState<string>(ADMIN_SUPPORT_OPERATORS[0].id);

  useEffect(() => {
    if (!ticket || !open) return;
    setOperatorId(ticket.operator_id ?? ADMIN_SUPPORT_OPERATORS[0].id);
  }, [ticket, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Operatör ata</DialogTitle>
          <DialogDescription>Talebi bir operatöre ata (mock).</DialogDescription>
        </DialogHeader>
        <Select value={operatorId} onValueChange={setOperatorId}>
          <SelectTrigger aria-label="Operatör seç">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_SUPPORT_OPERATORS.map((op) => (
              <SelectItem key={op.id} value={op.id}>
                {op.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            type="button"
            disabled={!ticket}
            onClick={() => {
              if (!ticket) return;
              const op = ADMIN_SUPPORT_OPERATORS.find((item) => item.id === operatorId);
              if (!op) return;
              onAssign(ticket.id, op.id, op.name);
              onOpenChange(false);
            }}
          >
            Ata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
