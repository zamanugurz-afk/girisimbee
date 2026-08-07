import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { MessagesInboxView } from '@/components/girisimco/messaging/messages-inbox-view';

export const metadata = {
  title: 'Mesajlar — GirisimBee',
};

export default async function MessagesPage() {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  return (
    <main className="pt-14">
      <div className="border-b border-border/80">
        <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Mesajlar
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">İlan sahipleriyle yazışmalarınız</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
        <MessagesInboxView />
      </div>
    </main>
  );
}
