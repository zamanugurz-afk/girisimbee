'use client';

import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import {
  EMPTY_PUBLISH_CONSENTS,
  PUBLISH_CONSENT_POLICY_ITEMS,
  areAllPublishConsentsAccepted,
  type PublishConsentKey,
  type PublishConsentValues,
} from '@/features/kvkk/constants/publish-consent-policy';

export type { PublishConsentValues };
export { EMPTY_PUBLISH_CONSENTS };

export interface PublishConsentFieldsProps {
  value: PublishConsentValues;
  onChange: (value: PublishConsentValues) => void;
  disabled?: boolean;
  error?: string;
  phoneHint?: string | null;
}

export function PublishConsentFields({
  value,
  onChange,
  disabled,
  error,
  phoneHint,
}: PublishConsentFieldsProps) {
  function toggle(key: PublishConsentKey, checked: boolean) {
    onChange({ ...value, [key]: checked });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Yayın onayları</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          İlanınız yayınlandığında iletişim yalnızca telefon üzerinden yapılır.{' '}
          <Link href="/kvkk" className="font-medium text-primary hover:text-primary/80">
            KVKK metnini inceleyin
          </Link>
        </p>
        {phoneHint ? (
          <p className="mt-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground">
            İlanda görünecek numara: <span className="font-semibold">{phoneHint}</span>
          </p>
        ) : (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            Profilinizde telefon numarası bulunamadı. Yayınlamak için önce{' '}
            <Link href="/dashboard/profil" className="font-semibold underline">
              profilinize telefon ekleyin
            </Link>
            .
          </p>
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
              <p className="text-xs text-muted-foreground">{item.description}</p>
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

export function validatePublishConsents(value: PublishConsentValues): boolean {
  return areAllPublishConsentsAccepted(value);
}
