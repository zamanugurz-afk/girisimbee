import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { CompanyPanelLayout } from '@/features/companies/components/CompanyPanelLayout';
import { CompanySettingsForm } from '@/features/companies/components/company-settings-form';

interface CompanySettingsPageProps {
  params: Promise<{ username: string }>;
}

export const metadata = {
  title: 'Şirket Ayarları — Girisimbee',
};

export default async function CompanySettingsPage({ params }: CompanySettingsPageProps) {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  const { username } = await params;

  return (
    <CompanyPanelLayout slug={username}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
            <span>Şirket Paneli</span>
            <span>/</span>
            <span className="text-foreground">@{username}</span>
            <span>/</span>
            <span className="text-foreground">Ayarlar</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Şirket Ayarları
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Şirket ünvanı, logo, sektör, iletişim ve sosyal medya bilgilerinizi güncelleyin.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs backdrop-blur-md">
          <CompanySettingsForm slug={username} />
        </div>
      </div>
    </CompanyPanelLayout>
  );
}
