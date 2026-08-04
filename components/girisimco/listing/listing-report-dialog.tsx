'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { useRouter } from 'next/navigation';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'fraud', label: 'Dolandırıcılık' },
  { value: 'misleading', label: 'Yanıltıcı bilgi' },
  { value: 'inappropriate', label: 'Uygunsuz içerik' },
  { value: 'duplicate', label: 'Mükerrer ilan' },
  { value: 'other', label: 'Diğer' },
] as const;

export function ListingReportDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [reason, setReason] = useState<string>('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!user) {
      toast.message('Şikayet için giriş yapmalısınız');
      router.push(AUTH_ROUTES.login);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'listing',
          entityId: listingId,
          reason,
          description: details.trim() || null,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? 'Şikayet gönderilemedi');
      }
      toast.success('Şikayetiniz alındı. Moderasyon ekibi inceleyecek.');
      onOpenChange(false);
      setDetails('');
      setReason('spam');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Şikayet gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İlanı bildir</DialogTitle>
          <DialogDescription>
            “{listingTitle}” için şikayet oluşturun. Kayıt admin Moderasyon sekmesine düşer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Sebep</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-details">Açıklama (isteğe bağlı)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Kısaca sorunu anlatın…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? 'Gönderiliyor…' : 'Şikayet gönder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
