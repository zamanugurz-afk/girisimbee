'use client';

import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';

export interface KvkkConsentValues {
  cvSharing: boolean;
  thirdPartySharing: boolean;
  employerSharing: boolean;
  clarificationText: boolean;
  explicitConsent: boolean;
}

export const EMPTY_KVKK_CONSENTS: KvkkConsentValues = {
  cvSharing: false,
  thirdPartySharing: false,
  employerSharing: false,
  clarificationText: false,
  explicitConsent: false,
};

const CONSENT_ITEMS: {
  key: keyof KvkkConsentValues;
  label: string;
  description: string;
}[] = [
  {
    key: 'cvSharing',
    label: 'CV paylaşım izni',
    description: 'Özgeçmişimin ilan sahipleri ve platform tarafından görüntülenmesine izin veriyorum.',
  },
  {
    key: 'thirdPartySharing',
    label: 'Üçüncü taraf paylaşım izni',
    description: 'Verilerimin iş ortakları ve hizmet sağlayıcılarla paylaşılmasına izin veriyorum.',
  },
  {
    key: 'employerSharing',
    label: 'İşveren paylaşım izni',
    description: 'Profil ve CV bilgilerimin ilgili işverenlerle paylaşılmasına izin veriyorum.',
  },
  {
    key: 'clarificationText',
    label: 'Aydınlatma metni onayı',
    description: 'Kişisel verilerin işlenmesine ilişkin aydınlatma metnini okudum ve anladım.',
  },
  {
    key: 'explicitConsent',
    label: 'Açık rıza onayı',
    description: 'Kişisel verilerimin belirtilen amaçlarla işlenmesine açık rıza veriyorum.',
  },
];

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
  function toggle(key: keyof KvkkConsentValues, checked: boolean) {
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
        {CONSENT_ITEMS.map((item) => (
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
  return Object.values(value).every(Boolean);
}
