import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { loadAccountHubPage } from '@/features/account/lib/load-account-hub-page';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Doğrulamalar — Kullanıcı Paneli — GirisimBee',
};

export default async function DashboardDogrulamalarPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { view } = await loadAccountHubPage(user);

  const rows = [
    {
      id: 'email',
      label: 'E-posta doğrulaması',
      description: view.email || user.email,
      ok: view.emailVerified,
      href: '/dashboard/profil',
      cta: view.emailVerified ? null : 'Profil sayfasından doğrula',
      icon: Mail,
    },
    {
      id: 'phone',
      label: 'SMS / telefon doğrulaması',
      description: view.phone || 'Telefon henüz eklenmedi',
      ok: view.phoneVerified,
      href: '/dashboard/profil',
      cta: view.phoneVerified ? null : 'Telefon ekle / doğrula',
      icon: Phone,
    },
  ] as const;

  return (
    <>
      <DashboardPageHeader
        title="Doğrulamalar"
        description="Yalnızca e-posta ve SMS doğrulaması. Kullanıcı, şirket ve yatırımcı doğrulaması bu sürümde yok."
      />
      <div className="space-y-4 px-5 py-8 sm:px-8">
        {rows.map(({ id, label, description, ok, href, cta, icon: Icon }) => (
          <AccountPanelCard key={id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-bold text-foreground">{label}</h2>
                  <p className="mt-1 text-sm font-medium text-foreground/70">{description}</p>
                  <span
                    className={cn(
                      'mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold',
                      ok
                        ? 'bg-emerald-600/12 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-slate-200',
                    )}
                  >
                    {ok ? 'Doğrulandı' : 'Bekliyor'}
                  </span>
                </div>
              </div>
              {cta ? (
                <Button asChild className="rounded-xl font-semibold">
                  <Link href={href}>{cta}</Link>
                </Button>
              ) : null}
            </div>
          </AccountPanelCard>
        ))}
      </div>
    </>
  );
}
