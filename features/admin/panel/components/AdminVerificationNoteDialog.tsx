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
import type { AdminMockVerification } from '@/features/admin/panel/types/admin-panel.types';

export function AdminVerificationNoteDialog({
  verification,
  open,
  onOpenChange,
  onSave,
}: {
  verification: AdminMockVerification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, note: string) => void;
}) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!verification || !open) return;
    setNote(verification.note ?? '');
  }, [verification, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Not ekle</DialogTitle>
          <DialogDescription>
            Doğrulama kaydına yönetici notu ekleyin (mock oturum state).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="admin-verification-note">Not</Label>
          <Textarea
            id="admin-verification-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="İnceleme notu…"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            type="button"
            disabled={!verification}
            onClick={() => {
              if (!verification) return;
              onSave(verification.id, note.trim());
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
