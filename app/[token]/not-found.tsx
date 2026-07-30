'use client';

import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OWNER_ROUTE } from '@/config/site';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-soft text-primary ring-1 ring-primary/20">
        <Compass className="h-9 w-9" />
      </div>
      <p className="mt-6 font-display text-6xl font-bold tracking-tight text-foreground">404</p>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Sayfa bulunamadı</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Aradığınız sayfa taşınmış, kaldırılmış veya hiç var olmamış olabilir.
      </p>
      <Button asChild className="mt-6">
        <Link href={OWNER_ROUTE}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Panele dön
        </Link>
      </Button>
    </div>
  );
}
