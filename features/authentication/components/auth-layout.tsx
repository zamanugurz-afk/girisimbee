import type { ReactNode } from 'react';
import Link from 'next/link';
import { GirisimbeeLogo } from '@/components/girisimco/logo';

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/5 to-transparent" />

      <header className="relative border-b border-border/60 px-5 py-5">
        <div className="mx-auto flex max-w-md justify-center">
          <GirisimbeeLogo />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
              {title}
            </h1>
            {description && (
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="gc-card p-6 shadow-card sm:p-8">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
    >
      {children}
    </Link>
  );
}
