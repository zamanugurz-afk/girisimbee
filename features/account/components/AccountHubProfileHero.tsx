'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRoleLabel } from '@/features/authentication/constants/roles';
import { useAuth } from '@/features/authentication/hooks/use-auth';

/**
 * Hub identity strip — matches marketplace / PlatformHero light wash architecture
 * (soft indigo tint + gc-dot-grid), not a dark social cover banner.
 */
export function AccountHubProfileHero({
  displayName,
  username,
  coverUrl,
  emailVerified,
}: {
  displayName: string;
  username: string | null;
  coverUrl: string | null;
  emailVerified?: boolean;
}) {
  const { user } = useAuth();
  const roleLabel = getRoleLabel(user?.rawRole ?? user?.role ?? null);
  const publicHref = username ? `/profil/${username}` : '/dashboard/profil';
  const verified = Boolean(emailVerified ?? user?.emailVerified);

  return (
    <section className="gc-card relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366f1]/[0.07] via-transparent to-[#818cf8]/[0.04]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-20" aria-hidden />

      {coverUrl ? (
        <div className="relative h-24 w-full border-b border-border/60 sm:h-28">
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 1280px) 100vw, 1024px"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>
      ) : null}

      <div className="relative px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="gc-page-heading truncate text-gc-xl sm:text-gc-2xl">
                {displayName || 'Kullanıcı'}
              </h2>
              {verified ? (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-gc-xs font-medium text-emerald-700 dark:text-emerald-400"
                  title="E-posta doğrulandı"
                >
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Doğrulandı
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-gc-sm text-muted-foreground">
              {username ? `@${username}` : 'Kullanıcı adı henüz yok'}
            </p>

            {roleLabel ? <p className="gc-badge mt-2.5">{roleLabel}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/ayarlar">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Profili düzenle
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link href="/dashboard/profil">Hesap bilgileri</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link href={publicHref}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Herkese açık profil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
