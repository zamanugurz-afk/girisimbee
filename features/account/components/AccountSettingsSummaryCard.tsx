import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserSettings } from '@/features/account/types/user-settings.types';
import Link from 'next/link';

const VISIBILITY_LABELS: Record<UserSettings['profileVisibility'], string> = {
  public: 'Herkese açık',
  connections: 'Yalnızca bağlantılar',
  private: 'Gizli',
};

function SettingRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 dark:border-white/10">
      <span className="text-sm text-foreground">{label}</span>
      <Badge variant={on ? 'default' : 'outline'}>{on ? 'Açık' : 'Kapalı'}</Badge>
    </div>
  );
}

export function AccountSettingsSummaryCard({
  settings,
}: {
  settings: UserSettings | null;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Hesap ayarları özeti
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bildirim ve görünürlük tercihlerinizin özeti.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-lg">
          <Link href="/dashboard/ayarlar">Ayarlarda düzenle</Link>
        </Button>
      </div>

      {!settings ? (
        <p className="mt-6 rounded-lg border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/10">
          Henüz kayıtlı ayar bulunmuyor.
        </p>
      ) : (
        <div className="mt-5 space-y-2">
          <SettingRow label="E-posta bildirimleri" on={settings.emailNotifications} />
          <SettingRow label="SMS bildirimleri" on={settings.smsNotifications} />
          <SettingRow label="Favori bildirimleri" on={settings.favoriteNotifications} />
          <SettingRow label="Sistem bildirimleri" on={settings.systemNotifications} />
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 dark:border-white/10">
            <span className="text-sm text-foreground">Profil görünürlüğü</span>
            <Badge variant="secondary">
              {VISIBILITY_LABELS[settings.profileVisibility]}
            </Badge>
          </div>
        </div>
      )}
    </section>
  );
}
