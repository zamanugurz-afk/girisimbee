import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccountFavoritesEmpty({
  title = 'Henüz favori listeniz boş.',
  description = 'İlgilendiğiniz ilanları favorilerinize ekleyerek daha sonra kolayca ulaşabilirsiniz.',
  ctaHref = '/kesfet',
  ctaLabel = 'İlanları keşfet',
}: {
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
} = {}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Heart className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="mt-5 font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6 rounded-2xl" size="sm">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
