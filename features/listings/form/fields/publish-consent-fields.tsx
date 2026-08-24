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
}

function consentDescription(key: PublishConsentKey, variant: 'default' | 'career'): ReactNode {
  switch (key) {
    case 'clarificationText':
      return (
        <>
          <LegalDocLink href={LEGAL_ROUTES.kvkk} className="font-semibold text-primary underline">
            KVKK aydınlatma metnini
          </LegalDocLink>{' '}
          okudum ve anladım.
        </>
      );
    case 'phoneDisplay':
      if (variant === 'career') {
        return (
          <>
            Doğrulanmış telefon numaramın iletişim talebi sürecinde kullanılmasına açık rıza veriyorum.
            Telefon numaram herkese açık gösterilmez, yalnızca onaylanan taleplerde paylaşılır.{' '}
            <LegalDocLink href={LEGAL_ROUTES.explicitConsent} className="font-semibold text-primary underline">
              (Açık Rıza Metni)
            </LegalDocLink>
          </>
        );
      }
      return (
        <>
          Doğrulanmış telefon numaramın bu ilanda iletişim amacıyla kullanılmasına ve iletişime geçilmesine açık rıza veriyorum.{' '}
          <LegalDocLink href={LEGAL_ROUTES.explicitConsent} className="font-semibold text-primary underline">
            (Açık Rıza Metni)
          </LegalDocLink>
        </>
      );
    case 'thirdPartyHrSharing':
      return (
        <>
          Profilimin ve iletişim bilgilerimin iş fırsatlarının değerlendirilmesi kapsamında yetkili kurumsal işverenler ile paylaşılmasına{' '}
          <LegalDocLink href={LEGAL_ROUTES.explicitConsent} className="font-semibold text-primary underline">
            açık rıza
          </LegalDocLink>{' '}
          veriyorum.
        </>
      );
    case 'explicitConsent':
      return (
        <>
          İlanımın yayınlanmasını onaylıyor, verilerimin belirtilen amaçlarla işlenmesine açık rıza veriyor ve{' '}
          <LegalDocLink href={LEGAL_ROUTES.terms} className="font-semibold text-primary underline">
            Kullanıcı Sözleşmesi
          </LegalDocLink>
          'ni kabul ediyorum.
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
  variant = 'default',
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
      {/* KVKK & Güvenlik Güvencesi */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-border dark:bg-card/50">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground">
            KVKK & Güvenli İletişim Güvencesi
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {variant === 'career'
              ? 'Kariyer kartınızda soyadınız, telefon numaranız ve doğum tarihiniz herkese açık yayınlanmaz. İletişim yalnızca onaylanan talepler üzerinden güvenle sağlanır.'
              : 'İşveren ilanınızda iletişim ve kurumsal bilgileriniz KVKK standartlarına uygun şekilde korunur ve doğrulanmış iletişim kanalları üzerinden yürütülür.'}
          </p>
        </div>
      </div>

      {/* İletişim Numarası Barı */}
      {phoneHint ? (
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-border dark:bg-card shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Phone className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 block">Kayıtlı İletişim Numarası</span>
              <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                {phoneHint}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
            ✓ Doğrulandı
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/30 space-y-2">
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
            İlanınızda iletişim sağlanabilmesi için telefon numarası gereklidir:
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="tel"
              inputMode="tel"
              placeholder="05xx xxx xx xx"
              value={draftPhone}
              onChange={(e) => setDraftPhone(e.target.value)}
              disabled={disabled || savingPhone || !userId}
              className="h-9 bg-white text-xs dark:bg-background rounded-xl"
            />
            <Button
              type="button"
              size="sm"
              className="shrink-0 rounded-xl text-xs font-semibold"
              disabled={disabled || savingPhone || !userId}
              onClick={() => void savePhone()}
            >
              {savingPhone ? 'Kaydediliyor…' : 'Telefonu Kaydet'}
            </Button>
          </div>
        </div>
      )}

      {/* Yasal Onay Checkbox Kartları */}
      <div className="space-y-2.5">
        {PUBLISH_CONSENT_POLICY_ITEMS.map((item) => {
          const isChecked = value[item.key];
          return (
            <label
              key={item.key}
              htmlFor={`publish-consent-${item.key}`}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-150 cursor-pointer select-none',
                isChecked
                  ? 'border-primary/40 bg-primary/[0.02] shadow-2xs dark:border-primary/30 dark:bg-primary/[0.04]'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-border dark:bg-card',
              )}
            >
              <Checkbox
                id={`publish-consent-${item.key}`}
                checked={isChecked}
                onCheckedChange={(checked) => toggle(item.key, checked === true)}
                disabled={disabled}
                className="mt-0.5 shrink-0 rounded-md"
              />
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                  {consentDescription(item.key, variant)}
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
