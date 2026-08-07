import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AccountPaymentsEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-border/80 px-6 py-14 text-center dark:border-white/10">
      <p className="font-display text-lg font-semibold text-foreground">
        Henüz bir ödeme kaydınız bulunmuyor.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Paket satın alımlarınız burada listelenir. Kart bilgileriniz saklanmaz.
      </p>
      <Button asChild className="mt-6 rounded-lg" size="sm" variant="outline">
        <Link href="/dashboard/paketlerim">Paketlerime git</Link>
      </Button>
    </div>
  );
}
