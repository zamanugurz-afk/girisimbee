'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, Phone, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ListingCallButton, formatListingPhoneDisplay } from '@/components/girisimco/listing/listing-call-button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { loginUrl } from '@/features/authentication/constants/routes';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { CONTACT_REQUEST_CONFIG } from '@/features/contact-requests/config/contact-request.config';
import type { ContactRequestPublicView } from '@/features/contact-requests/types/contact-request.types';
import { cn } from '@/lib/utils';

type CtaVariant = 'card' | 'compact';

export interface ListingContactCtaProps {
  listingId: string;
  listingTitle?: string;
  isOwner?: boolean;
  /** Career / anonymous listings — stronger privacy copy before accept. */
  identityGated?: boolean;
  variant?: CtaVariant;
  /** Presentation-only label for the primary button. Does not change request flow. */
  buttonLabel?: string;
  className?: string;
  /** Controlled open for mobile bar / shared modal */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function statusLabel(view: ContactRequestPublicView, identityGated: boolean): string {
  switch (view.effectiveStatus) {
    case 'pending':
      return 'Talebiniz ilan sahibine iletildi. Yanıt bekleniyor.';
    case 'accepted':
      return identityGated
        ? 'İletişim talebi kabul edildi. Ad soyad ve izin verilen iletişim bilgileri size açıldı; mesajlaşabilirsiniz.'
        : 'Talebiniz kabul edildi. Mesajlaşabilir; telefon ve ad-soyad bilgisi size açıldı.';
    case 'rejected':
      return 'Talebiniz reddedildi.';
    case 'expired':
      return 'Talebinizin süresi doldu. Yeni talep gönderebilirsiniz.';
    case 'cancelled':
      return 'Talebinizi iptal ettiniz. Yeni talep gönderebilirsiniz.';
    default:
      return '';
  }
}

export function ListingContactCta({
  listingId,
  listingTitle,
  isOwner = false,
  identityGated = false,
  variant = 'card',
  buttonLabel,
  className,
  open: controlledOpen,
  onOpenChange,
}: ListingContactCtaProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mine, setMine] = useState<ContactRequestPublicView | null | undefined>(undefined);
  const [internalOpen, setInternalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const loadMine = useCallback(async () => {
    if (!user || isOwner) {
      setMine(null);
      return;
    }
    try {
      const res = await fetch(`/api/listings/${listingId}/contact-requests/mine`);
      if (!res.ok) {
        setMine(null);
        return;
      }
      const json = (await res.json()) as { data?: { request?: ContactRequestPublicView | null } };
      setMine(json.data?.request ?? null);
    } catch {
      setMine(null);
    }
  }, [user, isOwner, listingId]);

  useEffect(() => {
    if (authLoading) return;
    void loadMine();
  }, [authLoading, loadMine]);

  if (isOwner) {
    return null;
  }

  function requireLogin() {
    router.push(loginUrl(pathname || `/ilan/${listingId}`));
  }

  function openModal() {
    if (!user) {
      requireLogin();
      return;
    }
    setOpen(true);
  }

  async function handleSubmit() {
    const trimmed = message.trim();
    if (trimmed.length < CONTACT_REQUEST_CONFIG.messageMinLength) {
      toast.error(`Mesaj en az ${CONTACT_REQUEST_CONFIG.messageMinLength} karakter olmalıdır.`);
      return;
    }
    if (!acceptTerms) {
      toast.error('İletişim ve Mesajlaşma Kullanım Koşullarını kabul etmelisiniz.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/contact-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          acceptTerms: true,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        data?: { request?: ContactRequestPublicView };
      };
      if (!res.ok) {
        throw new Error(json.error ?? 'Talep gönderilemedi');
      }
      setMine(json.data?.request ?? null);
      setOpen(false);
      setMessage('');
      setAcceptTerms(false);
      toast.success('İletişim talebiniz gönderildi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Talep gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  }

  const canCreate =
    !mine
    || mine.effectiveStatus === 'rejected'
    || mine.effectiveStatus === 'expired'
    || mine.effectiveStatus === 'cancelled';

  const phoneDisplay =
    mine?.effectiveStatus === 'accepted'
      ? formatListingPhoneDisplay(mine.ownerContactPhone)
      : null;

  const ownerNameLabel =
    mine?.effectiveStatus === 'accepted'
      ? (mine.ownerFullName
        || [mine.ownerFirstName, mine.ownerLastName].filter(Boolean).join(' ')
        || mine.ownerDisplayName
        || null)
      : null;

  const revealBlock =
    mine?.effectiveStatus === 'accepted' ? (
      <div className="space-y-2 rounded-xl border border-primary/25 bg-primary/[0.04] px-3 py-2.5 dark:border-primary/30">
        {ownerNameLabel ? (
          <p className="text-sm font-medium text-foreground">
            İlan sahibi: <span className="text-primary">{ownerNameLabel}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">İlan sahibi adı henüz eklenmemiş.</p>
        )}
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          {phoneDisplay ?? 'Telefon henüz eklenmemiş'}
        </p>
        {mine.ownerContactPhone ? (
          <ListingCallButton phone={mine.ownerContactPhone} fullWidth className="rounded-2xl" />
        ) : null}
      </div>
    ) : null;

  const primaryButton = (
    <Button
      type="button"
      className={cn(
        variant === 'compact' ? 'h-10 rounded-2xl' : 'h-11 w-full rounded-2xl',
        className,
      )}
      onClick={openModal}
      disabled={authLoading || (!!user && mine === undefined)}
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      {user ? (buttonLabel ?? 'İletişim Talebi Gönder') : 'Giriş yapıp talep gönder'}
    </Button>
  );

  const statusBlock =
    mine && !canCreate ? (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{statusLabel(mine, identityGated)}</p>
        {mine.effectiveStatus === 'accepted' && mine.conversationId ? (
          <Button asChild className="h-10 w-full rounded-2xl" variant={variant === 'compact' ? 'default' : 'secondary'}>
            <Link href={`${DASHBOARD_ROUTES.mesajlarim}?c=${mine.conversationId}`}>
              Mesajlara git
            </Link>
          </Button>
        ) : null}
        {revealBlock}
        {mine.effectiveStatus === 'pending' ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full rounded-2xl"
            onClick={async () => {
              try {
                const res = await fetch(`/api/contact-requests/${mine.id}/cancel`, {
                  method: 'POST',
                });
                const json = (await res.json().catch(() => ({}))) as {
                  error?: string;
                  data?: { request?: ContactRequestPublicView };
                };
                if (!res.ok) throw new Error(json.error ?? 'İptal edilemedi');
                setMine(json.data?.request ?? null);
                toast.message('Talep iptal edildi');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'İptal edilemedi');
              }
            }}
          >
            Talebi iptal et
          </Button>
        ) : null}
      </div>
    ) : null;

  const modal = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İletişim talebi gönder</DialogTitle>
          <DialogDescription>
            {listingTitle
              ? `“${listingTitle}” ilanı için ilan sahibine talep gönderin.`
              : 'İlan sahibiyle iletişime geçmek için talep gönderin.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="contact-request-message">
              Mesaj (zorunlu, en az {CONTACT_REQUEST_CONFIG.messageMinLength} karakter)
            </Label>
            <Textarea
              id="contact-request-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={CONTACT_REQUEST_CONFIG.messageMaxLength}
              placeholder="Kendinizi ve talebinizi en az 30 karakterle kısaca anlatın…"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              {message.trim().length}/{CONTACT_REQUEST_CONFIG.messageMinLength} minimum karakter
            </p>
          </div>
          <label className="flex items-start gap-2.5 text-sm leading-snug">
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(v) => setAcceptTerms(v === true)}
              className="mt-0.5"
            />
            <span>
              <Link
                href={LEGAL_ROUTES.contactCommunication}
                target="_blank"
                className="font-medium text-foreground underline underline-offset-2"
              >
                İletişim ve Mesajlaşma Kullanım Koşulları
              </Link>
              ’nı okudum ve kabul ediyorum.
            </span>
          </label>
          <p className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground dark:border-white/10">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
            {identityGated
              ? 'Kişisel bilgiler adayın onayı olmadan paylaşılmaz. Talep kabul edilirse ad soyad ve izin verilen iletişim bilgileri yalnızca size açılır.'
              : 'Telefon numarası kamuya açık gösterilmez. Talep kabul edilirse Platform üzerinden mesajlaşma açılır ve numara yalnızca size gösterilir.'}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Vazgeç
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              submitting
              || !acceptTerms
              || message.trim().length < CONTACT_REQUEST_CONFIG.messageMinLength
            }
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Gönder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (variant === 'compact') {
    let compactBody = primaryButton;
    if (user && mine && !canCreate) {
      if (mine.effectiveStatus === 'accepted' && mine.conversationId) {
        compactBody = (
          <Button asChild className={cn('h-10 rounded-2xl', className)}>
            <Link href={`${DASHBOARD_ROUTES.mesajlarim}?c=${mine.conversationId}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Mesajlara git
            </Link>
          </Button>
        );
      } else {
        compactBody = (
          <Button type="button" variant="secondary" className={cn('h-10 rounded-2xl', className)} disabled>
            Talep bekleniyor
          </Button>
        );
      }
    }
    return (
      <>
        {compactBody}
        {modal}
      </>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/[0.07] to-card p-4 shadow-md ring-1 ring-primary/10 dark:border-primary/40',
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        İletişim talebi
      </p>
      <h3 className="mt-1 text-base font-semibold text-foreground">
        {identityGated ? 'Anonim Profille İletişime Geç' : 'İlan Sahibiyle İletişime Geç'}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {identityGated
          ? 'Bu profil anonimdir. Kişisel bilgiler adayın onayı olmadan paylaşılmaz.'
          : 'Telefon ve ad-soyad kamuya kapalıdır. Talep kabul edilirse yalnızca size açılır; mesajlaşma Platform üzerinden başlar.'}
      </p>
      <div className="mt-3">
        {canCreate || !user ? primaryButton : statusBlock}
      </div>
      {modal}
    </div>
  );
}
