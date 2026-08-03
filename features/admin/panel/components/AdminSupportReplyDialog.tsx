'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminMockSupportTicket } from '@/features/admin/panel/types/admin-panel.types';

export function AdminSupportReplyDialog({
  ticket,
  open,
  onOpenChange,
  mode,
  onSave,
}: {
  ticket: AdminMockSupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'reply' | 'note';
  onSave: (ticketId: string, text: string, mode: 'reply' | 'note') => void;
}) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!open) return;
    setText('');
  }, [open, ticket?.id, mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'reply' ? 'Yanıt ver' : 'Not ekle'}</DialogTitle>
          <DialogDescription>
            {mode === 'reply'
              ? 'Kullanıcıya mock yanıt gönder.'
              : 'İç not ekle (yalnızca operatör görür).'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="admin-support-reply">{mode === 'reply' ? 'Yanıt' : 'Not'}</Label>
          <Textarea
            id="admin-support-reply"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={mode === 'reply' ? 'Yanıt metni…' : 'Operatör notu…'}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            type="button"
            disabled={!ticket || !text.trim()}
            onClick={() => {
              if (!ticket || !text.trim()) return;
              onSave(ticket.id, text.trim(), mode);
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
