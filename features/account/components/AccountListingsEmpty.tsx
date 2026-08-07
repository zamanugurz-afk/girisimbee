import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AccountListingsEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-border/80 px-6 py-14 text-center dark:border-white/10">
      <p className="font-display text-lg font-semibold text-foreground">
        Henüz bir ilanınız bulunmuyor.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Hemen ilk ilanınızı oluşturmaya başlayın.
      </p>
      <Button asChild className="mt-6 rounded-lg" size="sm">
        <Link href="/ilan/olustur">Yeni ilan oluştur</Link>
      </Button>
    </div>
  );
}
