'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function GirisimcoLogo({ className }: LogoProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Link
      href="/"
      prefetch
      className={cn('group flex items-center gap-2.5', className)}
      onClick={(event) => {
        if (pathname === '/') {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        event.preventDefault();
        router.push('/');
      }}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-glow transition-transform duration-300 ease-smooth group-hover:scale-105">
        <span className="font-display text-sm font-bold text-primary-foreground">G</span>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Girisimco
      </span>
    </Link>
  );
}
