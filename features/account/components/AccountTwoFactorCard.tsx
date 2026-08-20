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
      <h2 className="font-display text-lg font-semibold text-foreground">
        İki adımlı doğrulama
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hesabınızı ek doğrulama yöntemleriyle koruyun.
      </p>

      <div className="mt-5 space-y-3">
        <FactorRow
          title="E-posta doğrulaması"
          description="Giriş ve kritik işlemlerde e-posta kodu."
          enabled={twoFactor.emailVerified}
          actionLabel={twoFactor.emailVerified ? 'Yeniden doğrula' : 'Etkinleştir'}
          onAction={() => {
            onChange({ ...twoFactor, emailVerified: true });
            toast.success('E-posta doğrulaması etkin (mock)');
          }}
        />
        <FactorRow
          title="Telefon doğrulaması"
          description="SMS ile tek kullanımlık kod."
          enabled={twoFactor.phoneVerified}
          actionLabel={twoFactor.phoneVerified ? 'Yeniden doğrula' : 'Etkinleştir'}
          onAction={() => {
            onChange({ ...twoFactor, phoneVerified: true });
            toast.success('Telefon doğrulaması etkin (mock)');
          }}
        />
        <FactorRow
          title="Google Authenticator"
          description="Authenticator uygulaması ile TOTP."
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
          title="Yedek kodlar"
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
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-800/40">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-xs sm:text-sm text-foreground">{title}</p>
          <Badge variant={enabled ? 'default' : 'outline'} className="text-[10px] px-2 py-0.5">
            {enabled ? 'Aktif' : 'Kapalı'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button type="button" size="sm" variant="outline" className="rounded-xl h-8 text-xs" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
