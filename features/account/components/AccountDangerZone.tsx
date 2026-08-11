'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function AccountDangerZone({ onSignOutAll }: { onSignOutAll: () => void }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch('/api/account/export');
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Dışa aktarma başarısız');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `girisimbee-verilerim-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Verileriniz indirildi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Dışa aktarma başarısız');
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem profilinizi silinmiş olarak işaretler. Hukuki ispat kayıtları saklanabilir.',
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Silme başarısız');
      toast.success('Hesap silme talebi işlendi');
      router.replace('/');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silme başarısız');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Hesap işlemleri</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Verilerinizi indirin veya hesabınızı silin. İspat için gerekli kayıtlar saklanabilir.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg"
          disabled={exporting}
          onClick={() => void exportData()}
        >
          {exporting ? 'Hazırlanıyor…' : 'Verilerimi indir'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg text-destructive hover:text-destructive"
          disabled={deleting}
          onClick={() => void deleteAccount()}
        >
          {deleting ? 'Siliniyor…' : 'Hesabımı sil'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => {
            onSignOutAll();
            toast.success('Oturum kapatıldı');
          }}
        >
          Tüm cihazlardan çıkış yap
        </Button>
      </div>
    </section>
  );
}
