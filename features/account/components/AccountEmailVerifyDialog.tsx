'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/authentication/hooks/use-auth';

export function AccountEmailVerifyDialog({
  open,
  email,
  onClose,
}: {
  open: boolean;
  email: string;
  onClose: () => void;
}) {
  const { resendVerification, refreshSession } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!open) return null;

  async function handleResend() {
    if (!email) {
      toast.error('E-posta adresi bulunamadı');
      return;
    }
    setSending(true);
    const { error } = await resendVerification(email);
    setSending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Doğrulama e-postası gönderildi. Gelen kutunuzu kontrol edin.');
  }

  async function handleCheckStatus() {
    setChecking(true);
    try {
      const { error } = await refreshSession();
      if (error) {
        toast.error(error);
        return;
      }
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { user: fresh } } = await createClient().auth.getUser();
      if (!fresh?.email_confirmed_at) {
        toast.message('Henüz doğrulanmadı', {
          description: 'E-postadaki bağlantıya tıkladıktan sonra tekrar kontrol edin.',
        });
        return;
      }
      toast.success('E-posta doğrulandı');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Durum kontrol edilemedi');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Kapat"
        onClick={onClose}
        disabled={sending || checking}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-verify-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-border/80 bg-background p-5 shadow-lg sm:rounded-2xl sm:p-6 dark:border-white/10"
      >
        <h2 id="email-verify-title" className="font-display text-xl font-semibold text-foreground">
          E-posta doğrulama
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <strong className="text-foreground">{email || '—'}</strong> adresine doğrulama
          bağlantısı gönderin. Bağlantıya tıkladıktan sonra bu pencereyi açık bırakırsanız
          durum otomatik güncellenir; veya “Doğruladım, kontrol et”e basın.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="rounded-xl"
            onClick={handleResend}
            disabled={sending || checking || !email}
          >
            {sending ? 'Gönderiliyor…' : 'Doğrulama e-postası gönder'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={handleCheckStatus}
            disabled={sending || checking}
          >
            {checking ? 'Kontrol…' : 'Doğruladım, kontrol et'}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full rounded-xl"
          onClick={onClose}
          disabled={sending || checking}
        >
          Kapat
        </Button>
      </div>
    </div>
  );
}
