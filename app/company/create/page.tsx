import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPanelLayout } from '@/features/dashboard/panel';
import { CompanyCreateForm } from '@/features/companies/components/company-create-form';

export const metadata = {
  title: 'Şirket Oluştur — Girisimbee',
};

export default async function CompanyCreatePage() {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  return (
    <DashboardPanelLayout>
      <div className="space-y-6 py-6 sm:py-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
            <span>Kullanıcı Paneli</span>
            <span>/</span>
            <span className="text-foreground">Şirket Oluştur</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Yeni Kurumsal Şirket Profili
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Şirket profilinizi oluşturun, ekibinizi yönetin ve kurumsal ilanları şirketiniz adına yayınlayın.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs backdrop-blur-md">
          <CompanyCreateForm />
        </div>
      </div>
    </DashboardPanelLayout>
  );
}
