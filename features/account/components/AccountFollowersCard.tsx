import Link from 'next/link';
import { Users, UserPlus, ExternalLink } from 'lucide-react';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FollowNetworkUser } from '@/features/profiles/types/follow.types';
import { initials } from '@/lib/utils';

export function AccountFollowersCard({
  followers,
  following,
  followersCount,
  followingCount,
}: {
  followers: FollowNetworkUser[];
  following: FollowNetworkUser[];
  followersCount: number;
  followingCount: number;
}) {
  const combined = [...followers, ...following].slice(0, 6);

  return (
    <AccountPanelCard className="h-full">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-base font-bold tracking-tight text-slate-950 dark:text-white">
              Takip & Ağım
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Takipçi ve takip ettikleriniz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="rounded-lg bg-slate-50 px-2.5 py-1 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
            <span className="text-slate-500 dark:text-zinc-400">Takipçi: </span>
            <strong className="font-bold text-slate-900 dark:text-white tabular-nums">{followersCount}</strong>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-1 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
            <span className="text-slate-500 dark:text-zinc-400">Takip: </span>
            <strong className="font-bold text-slate-900 dark:text-white tabular-nums">{followingCount}</strong>
          </div>
        </div>
      </div>

      {combined.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
          <UserPlus className="mx-auto h-6 w-6 text-slate-400 dark:text-zinc-600 mb-1.5" />
          Henüz takipçi veya takip edilen profil bulunmuyor. İlanlar üzerinden kullanıcıları takip edebilirsiniz.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {combined.map((u) => {
            const href = u.username ? `/profil/${u.username}` : '#';
            return (
              <Link
                key={u.userId}
                href={href}
                className="group flex items-center justify-between gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/50 p-2.5 transition-all hover:border-amber-500/30 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                    {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" className="rounded-lg" /> : null}
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {initials(u.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 group-hover:text-amber-600 dark:text-white transition-colors">
                      {u.displayName}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                      {u.username ? `@${u.username}` : `${u.listingsCount} ilan`}
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </AccountPanelCard>
  );
}
