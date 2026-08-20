import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserSettings } from '@/features/account/types/user-settings.types';
import Link from 'next/link';

const VISIBILITY_LABELS: Record<UserSettings['profileVisibility'], string> = {
  public: 'Herkese açık',
  connections: 'Yalnızca bağlantılar',
  private: 'Gizli',
};

function SettingRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-200/70 bg-sky-50/40 px-3.5 py-2.5 dark:border-sky-800/40 dark:bg-sky-950/20">
      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{label}</span>
      <Badge
        variant={on ? 'default' : 'outline'}
        className={cn(
          'text-[10px] font-bold px-2 py-0.5',
          on
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
            : 'text-slate-500',
        )}
      >
        {on ? 'Açık' : 'Kapalı'}
      </Badge>
    </div>
  );
}

export function AccountSettingsSummaryCard({
  settings,
}: {
  settings: UserSettings | null;
}) {
  const active = settings ?? {
    emailNotifications: true,
    smsNotifications: true,
    favoriteNotifications: true,
    systemNotifications: true,
    profileVisibility: 'public' as const,
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
            Hesap Ayarları Özeti
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Bildirim ve görünürlük tercihlerinizin özeti.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold">
          <Link href="/dashboard/ayarlar">Ayarlarda Düzenle</Link>
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        <SettingRow label="E-posta bildirimleri" on={active.emailNotifications} />
        <SettingRow label="SMS bildirimleri" on={active.smsNotifications} />
        <SettingRow label="Favori bildirimleri" on={active.favoriteNotifications} />
        <SettingRow label="Sistem bildirimleri" on={active.systemNotifications} />
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/40 px-3.5 py-2.5 dark:border-amber-800/40 dark:bg-amber-950/20">
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Profil görünürlüğü</span>
          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
            {VISIBILITY_LABELS[active.profileVisibility]}
          </span>
        </div>
      </div>
    </section>
  );
}
