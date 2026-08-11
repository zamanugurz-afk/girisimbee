'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import {
  EMPTY_PUBLISH_CONSENTS,
  PUBLISH_CONSENT_POLICY_ITEMS,
  areAllPublishConsentsAccepted,
  type PublishConsentKey,
  type PublishConsentValues,
} from '@/features/kvkk/constants/publish-consent-policy';
import { syncMarketplaceProfilePhone } from '@/features/listings/lib/resolve-publish-contact-phone';
import { LegalDocLink } from '@/features/authentication/components/legal-doc-link';
import {
  LEGAL_ROUTES,
  PUBLISH_LEGAL_LINKS,
} from '@/features/authentication/constants/legal-routes';
import type { UserId } from '@/lib/domain/ids';

export type { PublishConsentValues };
export { EMPTY_PUBLISH_CONSENTS };

export interface PublishConsentFieldsProps {
  value: PublishConsentValues;
  onChange: (value: PublishConsentValues) => void;
  disabled?: boolean;
  error?: string;
  phoneHint?: string | null;
  userId?: string | null;
  onPhoneSaved?: (phone: string) => void;
}

function consentDescription(key: PublishConsentKey): ReactNode {
  switch (key) {
    case 'clarificationText':
      return (
        <>
          <LegalDocLink href={LEGAL_ROUTES.kvkk}>KVKK aydınlatma metnini</LegalDocLink> okudum.
          Bu bir bilgilendirmedir; açık rıza değildir.
        </>
      );
    case 'phoneDisplay':
      return (
        <>
          Doğrulanmış telefon numaramın bu ilanda iletişim amacıyla görüntülenmesine ve
          aranmasına açık rıza veriyorum. Birincil iletişim telefon üzerindendir; platform içi
          mesajlaşma ürün yapılandırmasına bağlıdır. Ayrıntılar:{' '}
          <LegalDocLink href={LEGAL_ROUTES.explicitConsent}>açık rıza metni</LegalDocLink>.
        </>
      );
    case 'explicitConsent':
      return (
        <>
          İlanımın yayınlanması ve iletişim amacıyla belirtilen kişisel verilerimin işlenmesine{' '}
          <LegalDocLink href={LEGAL_ROUTES.explicitConsent}>açık rıza</LegalDocLink> veriyorum.
          Ayrıca{' '}
          <LegalDocLink href={LEGAL_ROUTES.terms}>kullanıcı sözleşmesi</LegalDocLink>ni kabul
          ediyorum.
        </>
      );
    default:
      return null;
  }
}

export function PublishConsentFields({
  value,
  onChange,
  disabled,
  error,
  phoneHint,
  userId,
  onPhoneSaved,
}: PublishConsentFieldsProps) {
  const [draftPhone, setDraftPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  function toggle(key: PublishConsentKey, checked: boolean) {
    onChange({ ...value, [key]: checked });
  }

  async function savePhone() {
    if (!userId) {
      toast.error('Telefon eklemek için giriş yapın.');
      return;
    }
    const next = draftPhone.trim();
    if (next.length < 10) {
      toast.error('Geçerli bir telefon numarası girin.');
      return;
    }
    setSavingPhone(true);
    try {
      const saved = await syncMarketplaceProfilePhone(userId as UserId, next);
      onPhoneSaved?.(saved);
      setDraftPhone('');
      toast.success('Telefon kaydedildi. Yayınlamaya devam edebilirsiniz.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Telefon kaydedilemedi.');
    } finally {
      setSavingPhone(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Yayın onayları</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          İlanınız yayınlandığında iletişim yalnızca telefon üzerinden yapılır. Google ile kayıt
          olsanız bile yayın için telefon zorunludur. Onay vermeden önce aşağıdaki metinleri
          inceleyin.
        </p>

        <ul className="mt-2 space-y-1.5 rounded-lg border border-border/80 bg-muted/15 px-3 py-2.5">
          {PUBLISH_LEGAL_LINKS.map((item) => (
            <li key={item.href} className="text-xs text-muted-foreground">
              <LegalDocLink href={item.href}>{item.label}</LegalDocLink>
              <span className="text-muted-foreground/90"> — {item.blurb}</span>
            </li>
          ))}
        </ul>

        {phoneHint ? (
          <p className="mt-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground">
            İlanda görünecek numara: <span className="font-semibold">{phoneHint}</span>
          </p>
        ) : (
          <div className="mt-2 space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            <p>
              Profilinizde telefon yok. Yayınlamak için aşağıya numaranızı ekleyin — eklemeden ilan
              yayınlanamaz.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="tel"
                inputMode="tel"
                placeholder="05xx xxx xx xx"
                value={draftPhone}
                onChange={(e) => setDraftPhone(e.target.value)}
                disabled={disabled || savingPhone || !userId}
                className="h-9 bg-white dark:bg-background"
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                disabled={disabled || savingPhone || !userId}
                onClick={() => void savePhone()}
              >
                {savingPhone ? 'Kaydediliyor…' : 'Telefonu kaydet'}
              </Button>
            </div>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-100/80">
              İsterseniz{' '}
              <Link href="/dashboard/profil" className="font-semibold underline">
                profilinizden
              </Link>{' '}
              de ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-4">
        {PUBLISH_CONSENT_POLICY_ITEMS.map((item) => (
          <div key={item.key} className="flex items-start gap-3">
            <Checkbox
              id={`publish-consent-${item.key}`}
              checked={value[item.key]}
              onCheckedChange={(checked) => toggle(item.key, checked === true)}
              disabled={disabled}
            />
            <div className="space-y-0.5">
              <Label
                htmlFor={`publish-consent-${item.key}`}
                className="text-sm font-medium leading-none"
              >
                {item.label}
              </Label>
              <p className="text-xs text-muted-foreground">{consentDescription(item.key)}</p>
            </div>
          </div>
        ))}
      </div>

      <FormFieldFooter
        helperText="Telefon kaydı ve tüm onay kutuları tamamlanmadan devam edemezsiniz."
        error={error}
      />
    </div>
  );
}

export function validatePublishConsents(value: PublishConsentValues): boolean {
  return areAllPublishConsentsAccepted(value);
}
