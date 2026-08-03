import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardMessages } from '@/features/messaging/components/dashboard/DashboardMessages';
import { DashboardPageHeader } from '@/features/dashboard/panel';

export const metadata = {
  title: 'Mesajlarım — Kullanıcı Paneli — Girisimco',
};

function MessagesFallback() {
  return (
    <div className="space-y-3 px-5 py-8 sm:px-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[120px] animate-pulse rounded-2xl bg-muted/70" />
      ))}
    </div>
  );
}

export default async function DashboardMesajlarimPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <>
      <DashboardPageHeader
        title="Mesajlarım"
        description="Gelen kutusu, gönderilenler ve arşivlenmiş konuşmalarınız."
      />
      <div className="px-5 py-8 sm:px-8">
        <Suspense fallback={<MessagesFallback />}>
          <DashboardMessages />
        </Suspense>
      </div>
    </>
  );
}
