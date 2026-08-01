import type { ReactNode } from 'react';
import Link from 'next/link';
import { GirisimcoLogo } from '@/components/girisimco/logo';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export function LegalDocumentPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-40" />
      <header className="relative border-b border-border/60 px-5 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <GirisimcoLogo />
          <Link
            href={AUTH_ROUTES.register}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Kayıt ol
          </Link>
        </div>
      </header>
      <main className="relative mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>
    </div>
  );
}
