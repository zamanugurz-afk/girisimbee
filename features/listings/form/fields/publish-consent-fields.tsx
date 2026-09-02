import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Phone, ShieldCheck, Mail, Building2, CheckCircle2 } from 'lucide-react';
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
  /** Direct controlled phone input value and handler */
  contactPhone?: string | null;
  onPhoneChange?: (phone: string) => void;
  /** Direct controlled company email input value and handler */
  contactEmail?: string;
  onEmailChange?: (email: string) => void;
  phoneError?: string;
  emailError?: string;
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
  contactPhone,
  onPhoneChange,
  contactEmail,
  onEmailChange,
  phoneError,
  emailError,
  variant = 'default',
  themeColor = 'emerald',
}: PublishConsentFieldsProps) {
  const [showManualEdit, setShowManualEdit] = useState(false);
  const currentTheme = CONSENT_THEME_CLASSES[themeColor] || CONSENT_THEME_CLASSES.emerald;

  const effectivePhone = contactPhone !== undefined ? (contactPhone || '') : (phoneHint || '');
  const hasValidPhone = Boolean(effectivePhone && effectivePhone.replace(/\D/g, '').length >= 10);
  const hasValidEmail = Boolean(contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()));
  const isComplete = hasValidPhone && hasValidEmail && !phoneError && !emailError;
  const shouldShowInputs = !isComplete || showManualEdit;

  function toggle(key: PublishConsentKey, checked: boolean) {
    onChange({ ...value, [key]: checked });
  }

  function handlePhoneChange(val: string) {
    onPhoneChange?.(val);
    onPhoneSaved?.(val);
  }

  return (
    <div className="space-y-4">
      {/* 1. İlan İletişim & Şirket Bilgileri (Yalnızca Eksik Olduğunda veya Düzenle Denildiğinde Görünür) */}
      {!shouldShowInputs ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground truncate">
                İletişim: <span className="font-semibold text-slate-900 dark:text-foreground">{effectivePhone}</span> · <span className="font-semibold text-slate-900 dark:text-foreground">{contactEmail}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowManualEdit(true)}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline shrink-0 ml-2 cursor-pointer"
          >
            Düzenle
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', currentTheme.headerIcon)}>
                <Building2 className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                  İlan İletişim & Şirket Bilgileri (Zorunlu)
                </h3>
                <p className="text-xs text-muted-foreground">
                  İlanınız yayınlandığında ilgilenen tarafların ve sistemin sizinle iletişime geçebilmesi için zorunludur.
                </p>
              </div>
            </div>
            {isComplete && (
              <button
                type="button"
                onClick={() => setShowManualEdit(false)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              >
                Kapat
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Telefon Numarası */}
            <div className="space-y-1.5">
              <Label htmlFor="publish-contact-phone" className="text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-zinc-100">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>Telefon Numarası *</span>
                </span>
                {effectivePhone && effectivePhone.replace(/\D/g, '').length >= 10 ? (
                  <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Girildi
                  </span>
                ) : (
                  <span className="text-[10.5px] font-semibold text-rose-500">Zorunlu</span>
                )}
              </Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="publish-contact-phone"
                  type="tel"
                  value={effectivePhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className={cn(
                    'h-10 pl-9 text-xs font-medium bg-white dark:bg-zinc-950',
                    phoneError ? 'border-rose-500 ring-1 ring-rose-500/30' : 'border-slate-200 dark:border-zinc-800',
                  )}
                  disabled={disabled}
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] font-medium text-rose-500">{phoneError}</p>
              ) : (
                <p className="text-[10.5px] text-muted-foreground">İletişim ve SMS doğrulama için kullanılır.</p>
              )}
            </div>

            {/* Şirket / Kurumsal E-posta */}
            <div className="space-y-1.5">
              <Label htmlFor="publish-company-email" className="text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-zinc-100">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>Şirket / İletişim E-Postası *</span>
                </span>
                {contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) ? (
                  <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Girildi
                  </span>
                ) : (
                  <span className="text-[10.5px] font-semibold text-rose-500">Zorunlu</span>
                )}
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="publish-company-email"
                  type="email"
                  value={contactEmail || ''}
                  onChange={(e) => onEmailChange?.(e.target.value)}
                  placeholder="ornek@sirketiniz.com"
                  className={cn(
                    'h-10 pl-9 text-xs font-medium bg-white dark:bg-zinc-950',
                    emailError ? 'border-rose-500 ring-1 ring-rose-500/30' : 'border-slate-200 dark:border-zinc-800',
                  )}
                  disabled={disabled}
                />
              </div>
              {emailError ? (
                <p className="text-[11px] font-medium text-rose-500">{emailError}</p>
              ) : (
                <p className="text-[10.5px] text-muted-foreground">Teklif ve resmi bildirimler bu adrese iletilir.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Yasal İzinler ve Rıza Beyanları Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/60 pt-2">
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

      {/* 3. Yasal Onay Checkbox Kartları */}
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
