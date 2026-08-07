import { notFound } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { PublicCompanyPageView } from '@/components/girisimco/company/public-company-view';
import { loadPublicCompany } from '@/features/companies/lib/public-company.loader';
import type { UserId } from '@/lib/domain/ids';

interface CompanyPublicPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: CompanyPublicPageProps) {
  const { username } = await params;
  const data = await loadPublicCompany(username);
  if (!data) return { title: 'Şirket — GirisimBee' };
  return {
    title: `${data.company.name} — GirisimBee`,
    description: data.company.description?.slice(0, 160),
  };
}

export default async function CompanyPublicPage({ params }: CompanyPublicPageProps) {
  const { username } = await params;
  const session = await getServerSession();
  const data = await loadPublicCompany(username, session?.id as UserId | undefined);

  if (!data) notFound();

  return <PublicCompanyPageView data={data} />;
}
