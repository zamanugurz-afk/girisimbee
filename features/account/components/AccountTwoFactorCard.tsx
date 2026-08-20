'use client';

import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AccountTwoFactorState } from '@/features/account/types/account-security.types';

export function AccountTwoFactorCard({
  twoFactor,
  onChange,
}: {
  twoFactor: AccountTwoFactorState;
  onChange: (next: AccountTwoFactorState) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
        İki Adımlı Doğrulama (2FA)
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
        Hesabınızı ek doğrulama ve yedek kod yöntemleriyle koruyun.
      </p>

      <div className="mt-4 space-y-2.5">
        <FactorRow
          title="Google Authenticator"
          description="Authenticator uygulaması ile TOTP kodu."
          enabled={twoFactor.authenticatorEnabled}
          actionLabel={twoFactor.authenticatorEnabled ? 'Yönet' : 'Bağla'}
          onAction={() => {
            onChange({
              ...twoFactor,
              authenticatorEnabled: true,
              backupCodesRemaining: twoFactor.backupCodesRemaining || 8,
            });
            toast.success('Authenticator bağlandı (mock)');
          }}
        />
        <FactorRow
          title="Yedek Güvenlik Kodları"
          description={
            twoFactor.backupCodesRemaining
              ? `${twoFactor.backupCodesRemaining} yedek kod kullanılabilir.`
              : 'Acil durum kodları henüz oluşturulmadı.'
          }
          enabled={twoFactor.backupCodesRemaining > 0}
          actionLabel={twoFactor.backupCodesRemaining > 0 ? 'Yenile' : 'Oluştur'}
          onAction={() => {
            onChange({ ...twoFactor, backupCodesRemaining: 10 });
            toast.success('Yedek kodlar oluşturuldu (mock)');
          }}
        />
      </div>
    </section>
  );
}

function FactorRow({
  title,
  description,
  enabled,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  enabled: boolean;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-sky-200/70 bg-sky-50/40 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-sky-800/40 dark:bg-sky-950/20">
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{title}</p>
          <Badge variant={enabled ? 'default' : 'outline'} className="text-[10px] px-2 py-0.5">
            {enabled ? 'Aktif' : 'Kapalı'}
          </Badge>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">{description}</p>
      </div>
      <Button type="button" size="sm" variant="outline" className="rounded-xl h-7.5 px-3 text-xs font-semibold" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
