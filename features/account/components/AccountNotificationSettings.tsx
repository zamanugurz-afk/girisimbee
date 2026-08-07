'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { AccountNotificationSettingsState } from '@/features/account/types/account-settings.types';

const ROWS: {
  key: keyof AccountNotificationSettingsState;
  label: string;
  description: string;
}[] = [
  {
    key: 'systemNotifications',
    label: 'Sistem bildirimleri',
    description: 'Hesap ve güvenlik ile ilgili bildirimler.',
  },
  {
    key: 'favoriteNotifications',
    label: 'Favori bildirimleri',
    description: 'Favori ilan güncellemeleri.',
  },
  {
    key: 'emailNotifications',
    label: 'E-posta bildirimleri',
    description: 'Önemli güncellemeler e-posta ile gönderilir.',
  },
  {
    key: 'smsNotifications',
    label: 'SMS bildirimleri',
    description: 'Kritik uyarılar SMS ile iletilir.',
  },
];

export function AccountNotificationSettings({
  value,
  onChange,
}: {
  value: AccountNotificationSettingsState;
  onChange: (next: AccountNotificationSettingsState) => void;
}) {
  return (
    <section className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Bildirim ayarları
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hangi bildirimleri almak istediğinizi seçin.
      </p>

      <div className="mt-5 space-y-4">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-start justify-between gap-4 rounded-lg border border-border/70 p-4 dark:border-white/10"
          >
            <div className="min-w-0 space-y-1">
              <Label htmlFor={`notif-${row.key}`} className="text-sm font-medium">
                {row.label}
              </Label>
              <p className="text-sm text-muted-foreground">{row.description}</p>
            </div>
            <Switch
              id={`notif-${row.key}`}
              checked={value[row.key]}
              onCheckedChange={(checked) =>
                onChange({ ...value, [row.key]: checked === true })
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
