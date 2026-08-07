'use client';

import Link from 'next/link';
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

export type { KvkkConsentValues };
export { EMPTY_KVKK_CONSENTS };

export interface KvkkConsentFieldsProps {
  value: KvkkConsentValues;
  onChange: (value: KvkkConsentValues) => void;
  disabled?: boolean;
  error?: string;
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
        <h3 className="text-sm font-medium text-foreground">KVKK Onayları</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          İlanınızı yayınlamadan önce aşağıdaki onayları işaretlemeniz gerekmektedir.{' '}
          <Link href="/kvkk" className="font-medium text-primary hover:text-primary/80">
            KVKK metnini inceleyin
          </Link>
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

export function validateKvkkConsents(value: KvkkConsentValues): boolean {
  return areAllKvkkConsentsAccepted(value);
}
