import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { DashboardMessages } from '@/features/messaging/components/dashboard/DashboardMessages';

export const metadata = {
  title: 'Mesajlarım — Kullanıcı Paneli — Girisimbee',
};

export default async function DashboardMesajlarimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <>
      <DashboardPageHeader
        title="Mesajlarım"
        description="Gelen kutusu, gönderilenler ve sohbetleriniz. Kabul edilen talepler sonrası doğrudan buradan yazışabilirsiniz."
      />
      <div className="px-5 py-8 sm:px-8">
        <Suspense
          fallback={
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[120px] animate-pulse rounded-2xl bg-muted/70" />
              ))}
            </div>
          }
        >
          <DashboardMessages />
        </Suspense>
      </div>
    </>
  );
}
