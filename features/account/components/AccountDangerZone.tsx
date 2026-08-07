'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function AccountDangerZone({ onSignOutAll }: { onSignOutAll: () => void }) {
  return (
    <section className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Hesap işlemleri</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Kritik işlemler. Bu adımda yalnızca arayüz simülasyonu yapılır.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => toast.message('Hesap dondurma yakında (mock)')}
        >
          Hesabı dondur
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg text-destructive hover:text-destructive"
          onClick={() => toast.message('Hesap silme yakında (mock)')}
        >
          Hesabı sil
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => {
            onSignOutAll();
            toast.success('Tüm cihazlardan çıkış yapıldı (mock)');
          }}
        >
          Tüm cihazlardan çıkış yap
        </Button>
      </div>
    </section>
  );
}
