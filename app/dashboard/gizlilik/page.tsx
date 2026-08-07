import Link from 'next/link';
import { Lock } from 'lucide-react';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { DashboardPageHeader } from '@/features/dashboard/panel';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Gizlilik — Kullanıcı Paneli — Girisimbee',
};

/** Privacy settings are deferred — kept route for bookmarks, UI closed for now. */
export default function DashboardGizlilikPage() {
  return (
    <>
      <DashboardPageHeader
        title="Gizlilik"
        description="Gizlilik ayarları şimdilik kapalı. İleride yeniden açılabilir."
      />
      <div className="px-5 py-8 sm:px-8">
        <AccountPanelCard>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
              <Lock className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground">Geçici olarak kapalı</h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                Profil görünürlük tercihleri bu sürümde gösterilmiyor. Temel hesap
                yönetimi için genel bakış veya profil sayfasını kullanabilirsiniz.
              </p>
            </div>
            <Button asChild className="rounded-xl font-semibold">
              <Link href="/dashboard">Genel bakışa dön</Link>
            </Button>
          </div>
        </AccountPanelCard>
      </div>
    </>
  );
}
