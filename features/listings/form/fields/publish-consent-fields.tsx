import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Phone, ShieldCheck } from 'lucide-react';
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
} from '@/features/authentication/constants/legal-routes';
import type { UserId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

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
  /** Career (İş Arıyorum): explain contact-request gating without widening consent scope. */
  variant?: 'default' | 'career';
  /** Category dynamic theme color (amber, emerald, sky, blue, purple, teal, rose). */
  themeColor?: string;
}

const CONSENT_THEME_CLASSES: Record<
  string,
  {
    headerIcon: string;
    checkedCard: string;
    checkbox: string;
    linkText: string;
    badgeText: string;
  }
> = {
  emerald: {
    headerIcon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    checkedCard: 'border-emerald-500/50 bg-emerald-500/[0.04] shadow-2xs dark:border-emerald-500/40 dark:bg-emerald-500/[0.06]',
    checkbox: 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600',
    linkText: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    headerIcon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    checkedCard: 'border-amber-500/50 bg-amber-500/[0.04] shadow-2xs dark:border-amber-500/40 dark:bg-amber-500/[0.06]',
    checkbox: 'data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600',
    linkText: 'hover:text-amber-600 dark:hover:text-amber-400',
    badgeText: 'text-amber-600 dark:text-amber-400',
  },
  sky: {
    headerIcon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    checkedCard: 'border-sky-500/50 bg-sky-500/[0.04] shadow-2xs dark:border-sky-500/40 dark:bg-sky-500/[0.06]',
    checkbox: 'data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600',
    linkText: 'hover:text-sky-600 dark:hover:text-sky-400',
    badgeText: 'text-sky-600 dark:text-sky-400',
  },
  blue: {
    headerIcon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    checkedCard: 'border-blue-500/50 bg-blue-500/[0.04] shadow-2xs dark:border-blue-500/40 dark:bg-blue-500/[0.06]',
    checkbox: 'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600',
    linkText: 'hover:text-blue-600 dark:hover:text-blue-400',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    headerIcon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    checkedCard: 'border-purple-500/50 bg-purple-500/[0.04] shadow-2xs dark:border-purple-500/40 dark:bg-purple-500/[0.06]',
    checkbox: 'data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600',
    linkText: 'hover:text-purple-600 dark:hover:text-purple-400',
    badgeText: 'text-purple-600 dark:text-purple-400',
  },
  teal: {
    headerIcon: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    checkedCard: 'border-teal-500/50 bg-teal-500/[0.04] shadow-2xs dark:border-teal-500/40 dark:bg-teal-500/[0.06]',
    checkbox: 'data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600',
    linkText: 'hover:text-teal-600 dark:hover:text-teal-400',
    badgeText: 'text-teal-600 dark:text-teal-400',
  },
  rose: {
    headerIcon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    checkedCard: 'border-rose-500/50 bg-rose-500/[0.04] shadow-2xs dark:border-rose-500/40 dark:bg-rose-500/[0.06]',
    checkbox: 'data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600',
    linkText: 'hover:text-rose-600 dark:hover:text-rose-400',
    badgeText: 'text-rose-600 dark:text-rose-400',
  },
};

const CONSENT_DOC_CONFIG: Record<
  PublishConsentKey,
  {
    docRoute: string;
    docLabel: string;
    plainDescription: (variant: 'default' | 'career') => string;
  }
> = {
  clarificationText: {
    docRoute: LEGAL_ROUTES.kvkk,
    docLabel: '(Aydınlatma Metni)',
    plainDescription: () => 'KVKK aydınlatma metnini okudum ve anladım.',
  },
  phoneDisplay: {
    docRoute: LEGAL_ROUTES.explicitConsent,
    docLabel: '(Açık Rıza Metni)',
    plainDescription: (variant) =>
      variant === 'career'
        ? 'Doğrulanmış telefon numaramın iletişim talebi sürecinde kullanılmasına açık rıza veriyorum. Telefon numaram herkese açık gösterilmez, yalnızca onaylanan taleplerde paylaşılır.'
        : 'Doğrulanmış telefon numaramın bu ilanda iletişim amacıyla kullanılmasına ve iletişime geçilmesine açık rıza veriyorum.',
  },
  thirdPartyHrSharing: {
    docRoute: LEGAL_ROUTES.explicitConsent,
    docLabel: '(Açık Rıza Metni)',
    plainDescription: () =>
      'Profilimin ve iletişim bilgilerimin iş fırsatlarının değerlendirilmesi kapsamında yetkili kurumsal işverenler ile paylaşılmasına açık rıza veriyorum.',
  },
  explicitConsent: {
    docRoute: LEGAL_ROUTES.terms,
    docLabel: '(Kullanıcı Sözleşmesi)',
    plainDescription: () =>
      'İlanımın yayınlanmasını onaylıyor, verilerimin belirtilen amaçlarla işlenmesine açık rıza veriyor ve kullanıcı sözleşmesini kabul ediyorum.',
  },
};

export function PublishConsentFields({
  value,
  onChange,
  disabled,
  error,
  phoneHint,
  userId,
  onPhoneSaved,
  variant = 'default',
  themeColor = 'emerald',
}: PublishConsentFieldsProps) {
  const [draftPhone, setDraftPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const currentTheme = CONSENT_THEME_CLASSES[themeColor] || CONSENT_THEME_CLASSES.emerald;

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
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', currentTheme.headerIcon)}>
          <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
            Yasal İzinler ve Rıza Beyanları
          </h3>
          <p className="text-xs text-muted-foreground">
            İlanınızın yayına alınabilmesi için lütfen aşağıdaki yasal maddeleri onaylayınız.
          </p>
        </div>
      </div>

      {/* Yasal Onay Checkbox Kartları */}
      <div className="space-y-2.5 pt-1">
        {PUBLISH_CONSENT_POLICY_ITEMS.map((item) => {
          const isChecked = value[item.key];
          const docConfig = CONSENT_DOC_CONFIG[item.key];
          return (
            <label
              key={item.key}
              htmlFor={`publish-consent-${item.key}`}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-150 cursor-pointer select-none',
                isChecked
                  ? currentTheme.checkedCard
                  : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-border dark:bg-card',
              )}
            >
              <Checkbox
                id={`publish-consent-${item.key}`}
                checked={isChecked}
                onCheckedChange={(checked) => toggle(item.key, checked === true)}
                disabled={disabled}
                className={cn('mt-0.5 shrink-0 rounded-md', currentTheme.checkbox)}
              />
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <LegalDocLink
                    href={docConfig.docRoute}
                    className={cn(
                      'text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground no-underline transition-colors inline-flex items-center gap-1.5 cursor-pointer',
                      currentTheme.linkText,
                    )}
                  >
                    <span>{item.label}</span>
                    <span className={cn('text-[11px] font-semibold underline underline-offset-2', currentTheme.badgeText)}>
                      {docConfig.docLabel}
                    </span>
                  </LegalDocLink>
                </div>
                <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                  {docConfig.plainDescription(variant)}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <FormFieldFooter
        helperText="Tüm onay kutuları tamamlanmadan yayınlama adımına geçilemez."
        error={error}
      />
    </div>
  );
}

export function validatePublishConsents(value: PublishConsentValues): boolean {
  return areAllPublishConsentsAccepted(value);
}
