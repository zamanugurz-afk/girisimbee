import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { OwnerContactRequestsInbox } from '@/features/contact-requests/components/owner-contact-requests-inbox';

export const metadata = {
  title: 'İletişim Talepleri — Kullanıcı Paneli — Girisimbee',
};

function InboxFallback() {
  return (
    <div className="space-y-3 px-5 py-8 sm:px-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/70" />
      ))}
    </div>
  );
}

export default async function DashboardIletisimTalepleriPage() {
  const user = await getServerSession();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <>
      <DashboardPageHeader
        title="İletişim Talepleri"
        description="İlanlarınıza gelen iletişim taleplerini buradan kabul veya reddedebilirsiniz. Kabul sonrası Mesajlarım üzerinden yanıtlayın."
      />
      <div className="px-5 py-8 sm:px-8">
        <Suspense fallback={<InboxFallback />}>
          <OwnerContactRequestsInbox />
        </Suspense>
      </div>
    </>
  );
}
