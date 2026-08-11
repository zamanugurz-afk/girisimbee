'use client';

import type { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import {
  EMPTY_KVKK_CONSENTS,
  KVKK_CONSENT_POLICY_ITEMS,
  areAllKvkkConsentsAccepted,
  type KvkkConsentKey,
  type KvkkConsentValues,
} from '@/features/kvkk/constants/kvkk-consent-policy';
import { LegalDocLink } from '@/features/authentication/components/legal-doc-link';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';

export type { KvkkConsentValues };
export { EMPTY_KVKK_CONSENTS };

export interface KvkkConsentFieldsProps {
  value: KvkkConsentValues;
  onChange: (value: KvkkConsentValues) => void;
  disabled?: boolean;
  error?: string;
}

function kvkkDescription(key: KvkkConsentKey, fallback: string): ReactNode {
  switch (key) {
    case 'clarificationText':
      return (
        <>
          <LegalDocLink href={LEGAL_ROUTES.kvkk}>KVKK aydınlatma metnini</LegalDocLink> okudum.
          Bu bir bilgilendirmedir; açık rıza değildir.
        </>
      );
    case 'explicitConsent':
      return (
        <>
          Yukarıda işaretlediğim amaçlarla kişisel verilerimin işlenmesine{' '}
          <LegalDocLink href={LEGAL_ROUTES.explicitConsent}>açık rıza</LegalDocLink> veriyorum.
          Rızamı geri çekebilirim.
        </>
      );
    case 'cvSharing':
      return (
        <>
          Özgeçmişimin ilgili ilan sahipleri tarafından görüntülenmesine açık rıza veriyorum.
          CV’de özel nitelikli kişisel veri (sağlık, inanç vb.) paylaşmamaya özen gösterin.
        </>
      );
    case 'thirdPartySharing':
      return (
        <>
          İş arayan sürecinin yürütülmesi için gerekli hizmet sağlayıcılarla sınırlı paylaşımına
          açık rıza veriyorum. Detay:{' '}
          <LegalDocLink href={LEGAL_ROUTES.explicitConsent}>açık rıza metinleri</LegalDocLink>.
        </>
      );
    case 'employerSharing':
      return (
        <>
          Profil ve CV bilgilerimin ilgili işverenlerle paylaşılmasına açık rıza veriyorum.
        </>
      );
    default:
      return fallback;
  }
}

export function KvkkConsentFields({
  value,
  onChange,
  disabled,
  error,
}: KvkkConsentFieldsProps) {
  function toggle(key: KvkkConsentKey, checked: boolean) {
    onChange({ ...value, [key]: checked });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">KVKK bilgilendirme ve açık rızalar</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Aydınlatma bilgilendirmedir; CV / işveren / üçüncü taraf paylaşımları ayrı açık rızadır.
          Metinler yeni sekmede açılır.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          <LegalDocLink href={LEGAL_ROUTES.kvkk}>KVKK aydınlatma metni</LegalDocLink>
          {' · '}
          <LegalDocLink href={LEGAL_ROUTES.explicitConsent}>Açık rıza metni</LegalDocLink>
          {' · '}
          <LegalDocLink href={LEGAL_ROUTES.privacy}>Gizlilik politikası</LegalDocLink>
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-4">
        {KVKK_CONSENT_POLICY_ITEMS.map((item) => (
          <div key={item.key} className="flex items-start gap-3">
            <Checkbox
              id={`kvkk-${item.key}`}
              checked={value[item.key]}
              onCheckedChange={(checked) => toggle(item.key, checked === true)}
              disabled={disabled}
            />
            <div className="space-y-0.5">
              <Label htmlFor={`kvkk-${item.key}`} className="text-sm font-medium leading-none">
                {item.label}
              </Label>
              <p className="text-xs text-muted-foreground">
                {kvkkDescription(item.key, item.description)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <FormFieldFooter
        helperText="Tüm onay kutularını işaretlemeden devam edemezsiniz."
        error={error}
      />
    </div>
  );
}

export function validateKvkkConsents(value: KvkkConsentValues): boolean {
  return areAllKvkkConsentsAccepted(value);
}
