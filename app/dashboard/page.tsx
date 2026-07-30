import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ROLE_LABELS } from '@/features/authentication/constants/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Panel — Girisimco',
};

export default async function DashboardPage() {
  const user = await getServerSession();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-16 pt-20 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Hoş geldiniz{user.displayName ? `, ${user.displayName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard title="Rol" value={ROLE_LABELS[user.role]} />
          <DashboardCard
            title="E-posta Durumu"
            value={user.emailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
            variant={user.emailVerified ? 'default' : 'secondary'}
          />
          <DashboardCard title="Hesap" value="Aktif" />
        </div>

        {!user.emailVerified && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              E-posta adresiniz henüz doğrulanmadı.{' '}
              <Link href={AUTH_ROUTES.verifyEmail} className="font-medium underline">
                Doğrulama sayfasına gidin
              </Link>
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction href="/company/create" title="Şirket Oluştur" description="Şirket profilinizi oluşturun" />
          <QuickAction href="/ilanlarim" title="İlanlarım" description="İlanlarınızı yönetin" />
          <QuickAction href="/ilan/olustur" title="İlan Oluştur" description="Yeni ilan yayınlayın" />
          <QuickAction href="/kesfet" title="Keşfet" description="Yayınlanan ilanları inceleyin" />
          <QuickAction href="/ayarlar" title="Profili Tamamla" description="Profilinizi güncelleyin" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/kesfet">İlanları Keşfet</Link>
          </Button>
        </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  variant = 'default',
}: {
  title: string;
  value: string;
  variant?: 'default' | 'secondary';
}) {
  return (
    <div className="rounded-xl border border-border/80 p-5 dark:border-white/10">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="mt-2">
        {variant === 'secondary' ? (
          <Badge variant="secondary">{value}</Badge>
        ) : (
          <p className="font-display text-lg font-semibold text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border/80 p-5 transition-colors hover:border-primary/25 hover:bg-muted/40 dark:border-white/10 dark:hover:bg-white/[0.03]"
    >
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
