import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ProfileEditorForm } from '@/features/profiles/components/profile-editor-form';

export const metadata = {
  title: 'Profil Ayarları — GirisimBee',
  description: 'Profilinizi tamamlayın ve güncelleyin.',
};

export default async function SettingsPage() {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-20 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Profil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profilinizi tamamlayın, görünürlük ayarlarını yönetin ve herkese açık sayfanızı oluşturun.
        </p>
      </div>
      <ProfileEditorForm />
    </main>
  );
}
