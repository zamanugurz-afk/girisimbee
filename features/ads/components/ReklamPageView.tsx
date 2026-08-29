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
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import {
  ADS_ROUTES,
  MARKET_AD_PRICE_LABEL,
  PARTNERSHIP_TYPE_LABELS,
} from '@/features/ads/constants/ad-inquiry.constants';
import { adsPublicApi } from '@/features/ads/lib/ad-inquiry-api';
import { uploadMarketAdMedia } from '@/features/ads/lib/upload-market-ad-media';
import { assertUploadImageSafe } from '@/features/listings/lib/image-safety';
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
      await assertUploadImageSafe(file);
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
    <div className="gc-header-offset bg-background border-b border-border/60">
      <div className="relative overflow-hidden border-b border-slate-200/80 dark:border-zinc-800 bg-gradient-to-b from-amber-500/[0.04] via-card to-background backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-[120px] opacity-[0.06] bg-amber-500"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
          <ScrollReveal>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <Megaphone className="h-4 w-4" aria-hidden />
                Girişimbee Market · Fırsat & Çözüm Portalı
              </span>
            </div>
            <h1 className="mt-3.5 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Fırsatınızı veya <span className="text-amber-500">Çözümünüzü</span> Öne Çıkarın
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Girişim ekosisteminin karar vericilerine ulaşın. İster MARKET vitrininde doğrudan <strong>{MARKET_AD_PRICE_LABEL}</strong> ile sponsorlu ilan verin, ister kurumsal çözüm ve stratejik ortaklık talebi oluşturun.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/70 px-3.5 py-1.5 font-bold text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
                <Store className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
                1. Sponsorlu Fırsat / Reklam · {MARKET_AD_PRICE_LABEL} · Anında Canlı
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300">
                <Handshake className="h-4 w-4 text-slate-600 dark:text-slate-400" aria-hidden />
                2. Kurumsal Dijital Çözüm & İş Birliği Talebi
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {doneId ? (
          <ScrollReveal>
            <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-card p-8 sm:p-10 text-center shadow-lg">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden />
              <h2 className="mt-4 font-display text-2xl font-bold">
                {publishedItemId ? 'İlanınız Yayına Alındı!' : 'Talebiniz Alındı!'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {publishedItemId
                  ? 'Ödemeniz başarıyla doğrulandı. Fırsat kartınız Girişimbee Market vitrininde yayında.'
                  : `Yönetim ekibi talebinizi inceleyecek ve sizinle ${CONTACT_EMAILS.ads} üzerinden iletişime geçecektir.`}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {publishedItemId ? (
                  <Button asChild className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950">
                    <Link href={`/market/${publishedItemId}`}>
                      Kartı Görüntüle
                      <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" className="rounded-xl font-bold" onClick={() => setDoneId(null)}>
                    Yeni Başvuru
                  </Button>
                )}
                <Button asChild variant={publishedItemId ? 'outline' : 'default'} className="rounded-xl font-bold">
                  <Link href={ADS_ROUTES.market}>
                    Market Vitrinine Git
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
            <aside className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 pl-1">
                İlan & Talep Türü
              </span>
              <TabButton
                active={tab === 'market_ad'}
                onClick={() => setTab('market_ad')}
                icon={Store}
                title="Sponsorlu Fırsat / Reklam"
                subtitle={`${MARKET_AD_PRICE_LABEL} · Vitrinde anında yayın`}
              />
              <TabButton
                active={tab === 'partnership'}
                onClick={() => setTab('partnership')}
                icon={Handshake}
                title="Kurumsal Çözüm & İş Birliği"
                subtitle="Dijital araç, hizmet, sponsorluk…"
              />
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-zinc-900 border border-amber-200/60 dark:border-zinc-800 text-xs text-muted-foreground mt-4">
                💡 Girişimbee Market vitrinindeki tüm güncel fırsatları görmek için{' '}
                <Link href={ADS_ROUTES.market} className="font-bold text-amber-700 dark:text-amber-400 hover:underline">
                  Market Vitrini
                </Link>
                {' '}sayfasını ziyaret edebilirsiniz.
              </div>
            </aside>

            <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-card p-6 sm:p-9 shadow-md">
              {tab === 'market_ad' ? (
                <form onSubmit={(e) => void submitMarket(e)} className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold">Sponsorlu Fırsat / Reklam İlanı</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      Girişimbee Market ana sayfa vitrininde ve katalogda öne çıkacak fırsat kartınızı oluşturun.{' '}
                      <strong className="text-amber-600 dark:text-amber-400">{MARKET_AD_PRICE_LABEL}</strong> güvenli ödeme sonrası kartınız hemen yayına alınır.
                    </p>
                    {!user && !authLoading ? (
                      <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Ödeme ve yayın için{' '}
                        <Link
                          href={loginUrl(ADS_ROUTES.public)}
                          className="font-bold underline"
                        >
                          giriş yapın
                        </Link>
                        {' '}veya{' '}
                        <Link href={AUTH_ROUTES.register} className="font-bold underline">
                          ücretsiz kayıt olun
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
                      ve talebinizi iletin.
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
        'w-full rounded-2xl border px-4 py-3.5 text-left transition-all duration-200',
        active
          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-sm ring-1 ring-amber-500/50'
          : 'border-slate-200 dark:border-zinc-800 bg-card hover:border-slate-300 dark:hover:border-zinc-700',
      )}
    >
      <span className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
            active ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('block text-sm font-bold leading-snug', active ? 'text-slate-900 dark:text-white' : 'text-foreground')}>
            {title}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground leading-relaxed">
            {subtitle}
          </span>
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
