import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ListChecks, UserPlus, Users } from 'lucide-react';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { loadFollowNetworkPage } from '@/features/profiles/lib/load-follow-network-page';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { FollowNetworkUser } from '@/features/profiles/types/follow.types';
import { formatNumber, initials } from '@/lib/utils';

export const metadata = {
  title: 'Takipçilerim — Kullanıcı Paneli — Girisimco',
};

export default async function DashboardTakipcilerimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const network = await loadFollowNetworkPage(user.id);

  return (
    <>
      <DashboardPageHeader
        title="Takipçiler"
        description="Takip ettiğiniz kullanıcıları yönetin; profillerine giderek diğer ilanlarını görün."
      />
      <div className="space-y-6 px-5 py-8 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <AccountPanelCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground/75">Takipçilerim</p>
                <p className="mt-3 font-display text-3xl font-bold tabular-nums text-foreground">
                  {network.followersCount}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Users className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </AccountPanelCard>
          <AccountPanelCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground/75">Takip ettiklerim</p>
                <p className="mt-3 font-display text-3xl font-bold tabular-nums text-foreground">
                  {network.followingCount}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <UserPlus className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </AccountPanelCard>
        </div>

        <FollowListSection
          title="Takip ettiklerim"
          empty="Henüz kimseyi takip etmiyorsunuz. İlan sahiplerinde “Takip et” ile başlayın."
          users={network.following}
        />

        <FollowListSection
          title="Takipçilerim"
          empty="Henüz takipçiniz yok."
          users={network.followers}
        />
      </div>
    </>
  );
}

function FollowListSection({
  title,
  empty,
  users,
}: {
  title: string;
  empty: string;
  users: FollowNetworkUser[];
}) {
  return (
    <AccountPanelCard>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {users.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/70">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/70 dark:divide-white/10">
          {users.map((person) => (
            <li key={person.userId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar className="h-11 w-11 rounded-xl">
                {person.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.avatarUrl}
                    alt=""
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <AvatarFallback className="rounded-xl text-sm font-semibold">
                    {initials(person.displayName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {person.displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {person.username ? `@${person.username}` : null}
                  {person.username && person.headline ? ' · ' : null}
                  {person.headline}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ListChecks className="h-3 w-3" aria-hidden />
                  {formatNumber(person.listingsCount)} ilan
                </p>
              </div>
              {person.href ? (
                <Button asChild size="sm" className="shrink-0 rounded-xl font-semibold">
                  <Link href={person.href}>Profil & ilanlar</Link>
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AccountPanelCard>
  );
}
