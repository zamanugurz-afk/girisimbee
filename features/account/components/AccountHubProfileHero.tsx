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
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-primary/[0.04]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-15" aria-hidden />

      {coverUrl ? (
        <div className="relative h-24 w-full border-b border-slate-100 sm:h-28 dark:border-zinc-800">
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 1280px) 100vw, 1024px"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />
        </div>
      ) : null}

      <div className="relative px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                {displayName || 'Kullanıcı'}
              </h2>
              {verified ? (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  title="E-posta doğrulandı"
                >
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Doğrulandı
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {username ? `@${username}` : 'Kullanıcı adı henüz belirlenmedi'}
            </p>

            {roleLabel ? (
              <span className="mt-2.5 inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                {roleLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-bold text-slate-950 shadow-xs hover:from-amber-400 hover:to-amber-500"
            >
              <Link href="/ayarlar">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Profili düzenle
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
              <Link href="/dashboard/profil">Hesap bilgileri</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
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
