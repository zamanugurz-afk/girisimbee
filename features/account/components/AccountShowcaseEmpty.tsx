import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AccountShowcaseEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-border/80 px-6 py-14 text-center dark:border-white/10">
      <p className="font-display text-lg font-semibold text-foreground">
        Henüz aktif bir vitrin paketiniz bulunmuyor.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        İlanlarınızı vitrine taşıyarak daha fazla görünürlük kazanabilirsiniz.
      </p>
      <Button asChild className="mt-6 rounded-lg" size="sm">
        <Link href="/dashboard/ilanlarim">İlanlarıma git</Link>
      </Button>
    </div>
  );
}
