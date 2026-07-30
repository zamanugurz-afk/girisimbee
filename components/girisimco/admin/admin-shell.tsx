'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/features/shared';
import { cn } from '@/lib/utils';

const NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: '/admin', label: 'Panel', exact: true },
  { href: '/admin/users', label: 'Kullanıcılar' },
  { href: '/admin/companies', label: 'Şirketler' },
  { href: '/admin/listings', label: 'İlanlar' },
  { href: '/admin/packages', label: 'Paketler' },
  { href: '/admin/reports', label: 'Raporlar' },
  { href: '/admin/verifications', label: 'Doğrulama' },
  { href: '/admin/search', label: 'Arama' },
];

interface AdminShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="pt-14">
        <div className="border-b border-border/80">
          <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap gap-2">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-white dark:bg-white dark:text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
