import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { CompanyCreateForm } from '@/features/companies/components/company-create-form';

export const metadata = {
  title: 'Şirket Oluştur — GirisimBee',
};

export default async function CompanyCreatePage() {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-20 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Şirket Oluştur
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Şirket profilinizi oluşturun ve ilanları şirket adına yayınlayın.
        </p>
      </div>
      <CompanyCreateForm />
    </main>
  );
}
