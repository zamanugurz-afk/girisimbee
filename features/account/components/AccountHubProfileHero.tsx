'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { getRoleLabel } from '@/features/authentication/constants/roles';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { cn } from '@/lib/utils';

export function AccountHubProfileHero({
  displayName,
  username,
  avatarUrl,
  coverUrl,
}: {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
}) {
  const { user } = useAuth();
  const roleLabel = getRoleLabel(user?.rawRole ?? user?.role ?? null);
  const publicHref = username ? `/profil/${username}` : '/dashboard/profil';

  return (
    <AccountPanelCard className="overflow-hidden p-0 hover:translate-y-0">
      <div className="relative h-36 w-full bg-gradient-to-br from-[#60A5FA] via-[#5B5CF6] to-[#6C63FF] sm:h-44">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1024px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 opacity-40 gc-dot-grid" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      <div className="relative px-5 pb-6 pt-0 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div
              className={cn(
                'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl',
                'border-4 border-card bg-primary/10 shadow-md',
              )}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              ) : (
                <Camera className="h-8 w-8 text-primary/70" aria-hidden />
              )}
            </div>
            <div className="pb-1">
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {displayName || 'Kullanıcı'}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {username ? `@${username}` : 'Kullanıcı adı henüz yok'}
              </p>
              {roleLabel ? (
                <p className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {roleLabel}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-2xl">
              <Link href="/ayarlar">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Profili düzenle
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-2xl">
              <Link href="/dashboard/profil">
                Hesap bilgileri
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-2xl">
              <Link href={publicHref}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Herkese açık profili görüntüle
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AccountPanelCard>
  );
}
