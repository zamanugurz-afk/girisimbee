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
    <section className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10 sm:p-6">
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
            twoFactor.backupCodesRemaining > 0
              ? `${twoFactor.backupCodesRemaining} yedek kod kaldı`
              : 'Henüz yedek kod oluşturulmadı'
          }
          enabled={twoFactor.backupCodesRemaining > 0}
          actionLabel="Kodları oluştur"
          onAction={() => {
            onChange({ ...twoFactor, backupCodesRemaining: 8 });
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
    <div className="flex flex-col gap-3 rounded-lg border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{title}</p>
          <Badge variant={enabled ? 'default' : 'outline'}>
            {enabled ? 'Aktif' : 'Kapalı'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
