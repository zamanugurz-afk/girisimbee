'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  ImagePlus,
  Loader2,
  Megaphone,
  Store,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
import {
  ADS_ROUTES,
  MARKET_AD_PRICE_LABEL,
  PARTNERSHIP_TYPE_LABELS,
} from '@/features/ads/constants/ad-inquiry.constants';
import { adsPublicApi } from '@/features/ads/lib/ad-inquiry-api';
import { uploadMarketAdMedia } from '@/features/ads/lib/upload-market-ad-media';
import { PARTNERSHIP_TYPES, type PartnershipType } from '@/features/ads/types/ad-inquiry.types';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES, loginUrl } from '@/features/authentication/constants/routes';
import { cn } from '@/lib/utils';
import { CONTACT_EMAILS } from '@/features/shared/constants/contact';

type Tab = 'market_ad' | 'partnership';

const emptyMarket = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  ctaLabel: 'İncele',
};

const emptyPartnership = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  partnershipType: 'sponsorship' as PartnershipType,
  message: '',
};

export function ReklamPageView() {
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('market_ad');
  const [market, setMarket] = useState(emptyMarket);
  const [partnership, setPartnership] = useState(emptyPartnership);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [publishedItemId, setPublishedItemId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleImageSelect(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!user) {
      toast.error('Görsel yüklemek için giriş yapmalısınız');
      window.location.assign(loginUrl(ADS_ROUTES.public));
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadMarketAdMedia(user.id, file);
      setMarket((s) => ({ ...s, imageUrl: url }));
      toast.success('Görsel yüklendi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Görsel yüklenemedi');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }

  async function submitMarket(e: React.FormEvent) {
    e.preventDefault();
    if (authLoading) return;
    if (!user) {
      toast.error('Ödeme için giriş yapmalısınız');
      window.location.assign(loginUrl(ADS_ROUTES.public));
      return;
    }

    setSubmitting(true);
    try {
      const { checkout } = await adsPublicApi.checkoutMarketAd({
        fullName: market.fullName,
        email: market.email,
        phone: market.phone || undefined,
        company: market.company || undefined,
        title: market.title,
        description: market.description || undefined,
        imageUrl: market.imageUrl || undefined,
        linkUrl: market.linkUrl || undefined,
        ctaLabel: market.ctaLabel || undefined,
      });

      if (checkout.mode === 'redirect') {
        toast.message('Ödeme sayfasına yönlendiriliyorsunuz…');
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      setPublishedItemId(checkout.marketItem.id);
      setDoneId(checkout.inquiryId);
      setMarket(emptyMarket);
      toast.success('Ödeme alındı — reklamınız yayınlandı');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ödeme başlatılamadı';
      if (/oturum|unauth|401|giriş/i.test(msg)) {
        toast.error('Ödeme için giriş yapmalısınız');
        window.location.assign(loginUrl(ADS_ROUTES.public));
        return;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPartnership(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { inquiry } = await adsPublicApi.submit({
        kind: 'partnership',
        fullName: partnership.fullName,
        email: partnership.email,
        phone: partnership.phone || undefined,
        company: partnership.company || undefined,
        partnershipType: partnership.partnershipType,
        message: partnership.message,
      });
      setPublishedItemId(null);
      setDoneId(inquiry.id);
      setPartnership(emptyPartnership);
      toast.success('İşbirliği talebiniz alındı');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-b border-border/60">
      <div className="relative overflow-hidden border-b border-border/60 bg-muted/20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-muted/30"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <ScrollReveal>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Megaphone className="h-3.5 w-3.5" aria-hidden />
              Reklam & işbirliği
            </p>
            <h1 className="gc-page-heading mt-2 max-w-2xl text-gc-xl sm:text-gc-2xl">
              Markanızı GirisimBee’da öne çıkarın
            </h1>
            <p className="mt-3 max-w-xl text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
              MARKET reklamını {MARKET_AD_PRICE_LABEL} ödeyerek hemen yayınlayın veya özel işbirliği
              için talep oluşturun.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1">
                <Store className="h-3.5 w-3.5 text-primary" aria-hidden />
                MARKET reklamı · {MARKET_AD_PRICE_LABEL} · anında yayın
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1">
                <Handshake className="h-3.5 w-3.5 text-primary" aria-hidden />
                Özel işbirliği talebi
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        {doneId ? (
          <ScrollReveal>
            <div className="mx-auto max-w-lg rounded-2xl border border-border/80 bg-card p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <h2 className="mt-4 font-display text-xl font-semibold">
                {publishedItemId ? 'Reklamınız yayınlandı' : 'Talebiniz alındı'}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {publishedItemId
                  ? 'Ödemeniz alındı. Kartınız MARKET alanında yayında.'
                  : `Yönetim ekibi talebinizi inceleyecek. Gerekirse ${CONTACT_EMAILS.ads} üzerinden sizinle iletişime geçilecek.`}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {publishedItemId ? (
                  <Button asChild>
                    <Link href={`/market/${publishedItemId}`}>
                      Kartı görüntüle
                      <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setDoneId(null)}>
                    Yeni talep
                  </Button>
                )}
                <Button asChild variant={publishedItemId ? 'outline' : 'default'}>
                  <Link href={ADS_ROUTES.market}>
                    MARKET’e git
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            <aside className="space-y-2">
              <TabButton
                active={tab === 'market_ad'}
                onClick={() => setTab('market_ad')}
                icon={Store}
                title="MARKET’te yer al"
                subtitle={`${MARKET_AD_PRICE_LABEL} · anında yayın`}
              />
              <TabButton
                active={tab === 'partnership'}
                onClick={() => setTab('partnership')}
                icon={Handshake}
                title="Özel işbirliği"
                subtitle="Sponsorluk, medya, etkinlik…"
              />
              <p className="pt-4 text-xs leading-relaxed text-muted-foreground">
                Güncel fırsatları görmek için{' '}
                <Link href={ADS_ROUTES.market} className="font-medium text-primary hover:underline">
                  MARKET sayfasına
                </Link>{' '}
                bakabilirsiniz.
              </p>
            </aside>

            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
              {tab === 'market_ad' ? (
                <form onSubmit={(e) => void submitMarket(e)} className="space-y-5">
                  <div>
                    <h2 className="font-display text-lg font-semibold">MARKET reklamı oluştur</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Admin panelindeki MARKET kartı alanlarıyla aynı yapı.{' '}
                      <strong className="text-foreground">{MARKET_AD_PRICE_LABEL}</strong> ödeyerek
                      kartınız hemen yayınlanır.
                    </p>
                    {!user && !authLoading ? (
                      <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                        Ödeme için{' '}
                        <Link
                          href={loginUrl(ADS_ROUTES.public)}
                          className="font-semibold underline"
                        >
                          giriş yapın
                        </Link>
                        {' '}veya{' '}
                        <Link href={AUTH_ROUTES.register} className="font-semibold underline">
                          kayıt olun
                        </Link>
                        .
                      </p>
                    ) : null}
                  </div>

                  <ContactFields
                    values={market}
                    onChange={(patch) => setMarket((s) => ({ ...s, ...patch }))}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Reklam başlığı *" htmlFor="ad-title">
                      <Input
                        id="ad-title"
                        required
                        maxLength={120}
                        value={market.title}
                        onChange={(e) => setMarket((s) => ({ ...s, title: e.target.value }))}
                        placeholder="Örn. Seed turu arayan SaaS girişimi"
                      />
                    </Field>
                    <Field label="CTA metni" htmlFor="ad-cta">
                      <Input
                        id="ad-cta"
                        maxLength={40}
                        value={market.ctaLabel}
                        onChange={(e) => setMarket((s) => ({ ...s, ctaLabel: e.target.value }))}
                        placeholder="İncele"
                      />
                    </Field>
                  </div>

                  <Field label="Kısa açıklama" htmlFor="ad-desc">
                    <Textarea
                      id="ad-desc"
                      rows={3}
                      maxLength={500}
                      value={market.description}
                      onChange={(e) => setMarket((s) => ({ ...s, description: e.target.value }))}
                      placeholder="Kart üzerinde görünecek 1–2 cümle"
                    />
                  </Field>

                  <div className="space-y-1.5">
                    <Label htmlFor="ad-image-file">Reklam görseli</Label>
                    <input
                      ref={imageInputRef}
                      id="ad-image-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={uploadingImage || submitting}
                      onChange={(e) => void handleImageSelect(e.target.files)}
                    />
                    {market.imageUrl ? (
                      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted">
                        <div className="relative aspect-[16/10] w-full max-w-xl">
                          <Image
                            src={market.imageUrl}
                            alt="Reklam görseli önizleme"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 480px"
                            unoptimized
                          />
                        </div>
                        <div className="absolute right-2 top-2 flex gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-lg bg-background/95 text-xs shadow-sm"
                            disabled={uploadingImage}
                            onClick={() => imageInputRef.current?.click()}
                          >
                            Değiştir
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-lg bg-background/95 shadow-sm"
                            disabled={uploadingImage}
                            onClick={() => setMarket((s) => ({ ...s, imageUrl: '' }))}
                            aria-label="Görseli kaldır"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadingImage || submitting}
                        onClick={() => {
                          if (!user) {
                            toast.error('Görsel yüklemek için giriş yapmalısınız');
                            window.location.assign(loginUrl(ADS_ROUTES.public));
                            return;
                          }
                          imageInputRef.current?.click();
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void handleImageSelect(e.dataTransfer.files);
                        }}
                        className={cn(
                          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80',
                          'bg-muted/30 px-4 py-8 text-center transition-colors',
                          'hover:border-primary/40 hover:bg-primary/[0.04]',
                          'disabled:pointer-events-none disabled:opacity-60',
                        )}
                      >
                        {uploadingImage ? (
                          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <ImagePlus className="h-6 w-6" aria-hidden />
                          </span>
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {uploadingImage ? 'Yükleniyor…' : 'Görsel seç veya sürükle'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          JPEG, PNG, WebP veya GIF · en fazla 5 MB · 16:10 önerilir
                        </span>
                      </button>
                    )}
                  </div>

                  <Field label="Hedef link" htmlFor="ad-link">
                    <Input
                      id="ad-link"
                      value={market.linkUrl}
                      onChange={(e) => setMarket((s) => ({ ...s, linkUrl: e.target.value }))}
                      placeholder="https://… veya /sayfa"
                    />
                  </Field>

                  <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Güvenli ödeme sonrası kart MARKET’te anında yayınlanır.
                    </p>
                    <Button
                      type="submit"
                      disabled={submitting || authLoading || uploadingImage}
                      className="rounded-xl"
                    >
                      {submitting ? 'Ödeme hazırlanıyor…' : 'Öde ve yayınla'}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={(e) => void submitPartnership(e)} className="space-y-5">
                  <div>
                    <h2 className="font-display text-lg font-semibold">Özel işbirliği talebi</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Farklı paket, sponsorluk veya uzun soluklu işbirliği için firma bilgilerinizi
                      ve talebinizi iletin. Admin panelinden takip edilir.
                    </p>
                  </div>

                  <ContactFields
                    values={partnership}
                    onChange={(patch) => setPartnership((s) => ({ ...s, ...patch }))}
                  />

                  <Field label="İşbirliği türü *" htmlFor="p-type">
                    <Select
                      value={partnership.partnershipType}
                      onValueChange={(v) =>
                        setPartnership((s) => ({
                          ...s,
                          partnershipType: v as PartnershipType,
                        }))
                      }
                    >
                      <SelectTrigger id="p-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTNERSHIP_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {PARTNERSHIP_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Talebiniz *" htmlFor="p-message">
                    <Textarea
                      id="p-message"
                      required
                      rows={5}
                      minLength={20}
                      maxLength={2000}
                      value={partnership.message}
                      onChange={(e) =>
                        setPartnership((s) => ({ ...s, message: e.target.value }))
                      }
                      placeholder="Ne tür bir reklam veya işbirliği düşünüyorsunuz? Hedef kitle, süre, bütçe aralığı…"
                    />
                  </Field>

                  <div className="flex justify-end border-t border-border/60 pt-5">
                    <Button type="submit" disabled={submitting} className="rounded-xl">
                      {submitting ? 'Gönderiliyor…' : 'Talebi gönder'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Store;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border px-3.5 py-3 text-left transition-colors',
        active
          ? 'border-primary/30 bg-primary/5 shadow-sm'
          : 'border-border/70 bg-card hover:border-border',
      )}
    >
      <span className="flex items-start gap-2.5">
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span>
        </span>
      </span>
    </button>
  );
}

function ContactFields({
  values,
  onChange,
}: {
  values: { fullName: string; email: string; phone: string; company: string };
  onChange: (patch: Partial<typeof values>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Ad soyad *" htmlFor="c-name">
        <Input
          id="c-name"
          required
          value={values.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
        />
      </Field>
      <Field label="E-posta *" htmlFor="c-email">
        <Input
          id="c-email"
          type="email"
          required
          value={values.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </Field>
      <Field label="Telefon" htmlFor="c-phone">
        <Input
          id="c-phone"
          value={values.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="05xx…"
        />
      </Field>
      <Field label="Firma" htmlFor="c-company">
        <Input
          id="c-company"
          value={values.company}
          onChange={(e) => onChange({ company: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
