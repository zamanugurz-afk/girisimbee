import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';

export function AccountNotificationsEmpty({
  title = 'Henüz bildiriminiz bulunmuyor.',
  description = 'Yeni etkinlikler burada görüntülenecek.',
}: {
  title?: string;
  description?: string;
} = {}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bell className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild size="sm" className="rounded-2xl">
          <Link href={DASHBOARD_ROUTES.ilanlarim}>İlanlarım</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-2xl">
          <Link href={DASHBOARD_ROUTES.mesajlarim}>Mesajlar</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-2xl">
          <Link href={DASHBOARD_ROUTES.favorilerim}>Favoriler</Link>
        </Button>
      </div>
    </div>
  );
}
