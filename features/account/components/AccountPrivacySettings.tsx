'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { AccountPrivacySettingsState } from '@/features/account/types/account-settings.types';

export function AccountPrivacySettings({
  value,
  onChange,
}: {
  value: AccountPrivacySettingsState;
  onChange: (next: AccountPrivacySettingsState) => void;
}) {
  return (
    <section
      id="gizlilik"
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all"
    >
      <h2 className="font-display text-lg font-semibold text-foreground">
        Gizlilik ayarları
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Profilinizde hangi iletişim bilgilerinin görüneceğini yönetin.
      </p>

      <div className="mt-5 space-y-3">
        <ToggleRow
          id="privacy-email"
          label="E-posta görünürlüğü"
          description="Herkese açık profilde e-posta adresinizi gösterin."
          checked={value.emailVisible}
          onCheckedChange={(checked) => onChange({ ...value, emailVisible: checked })}
        />
        <ToggleRow
          id="privacy-phone"
          label="Telefon görünürlüğü"
          description="Herkese açık profilde telefon numaranızı gösterin."
          checked={value.phoneVisible}
          onCheckedChange={(checked) => onChange({ ...value, phoneVisible: checked })}
        />
        <ToggleRow
          id="privacy-linkedin"
          label="LinkedIn görünürlüğü"
          description="Herkese açık profilde LinkedIn bağlantınızı gösterin."
          checked={value.linkedInVisible}
          onCheckedChange={(checked) => onChange({ ...value, linkedInVisible: checked })}
        />
        <ToggleRow
          id="privacy-website"
          label="İnternet sitesi görünürlüğü"
          description="Herkese açık profilde internet sitenizi gösterin."
          checked={value.websiteVisible}
          onCheckedChange={(checked) => onChange({ ...value, websiteVisible: checked })}
        />
      </div>
    </section>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
    </div>
  );
}
