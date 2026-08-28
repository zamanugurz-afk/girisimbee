'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Store,
  Building2,
  Target,
  Briefcase,
  Percent,
  CreditCard,
  Clock,
  CheckCircle2,
  Sliders,
  Phone,
  MapPin,
  Sparkles,
  Package,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DirectContactDialog } from '@/components/girisimco/listing/direct-contact-dialog';
import { ListingOwnerPackagePanel } from '@/components/girisimco/listing/listing-owner-package-panel';
import { ListingOwnerActionsBar } from '@/components/girisimco/listing/listing-owner-actions-bar';
import { PremiumGate } from '@/components/girisimco/premium/premium-gate';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { FranchiseCardData } from '@/features/listings/types/listing.types';
import { cn } from '@/lib/utils';

interface FranchiseProfilePreviewProps {
  franchise: FranchiseCardData;
  listingId?: string;
  ownerUserId?: string;
  className?: string;
}

const theme = {
  cardBorder: 'border-rose-200/90 dark:border-rose-800/40',
  cardGlow: 'shadow-[0_2px_12px_-4px_rgba(244,63,94,0.12)]',
  headerText: 'text-rose-700 dark:text-rose-400',
  iconBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  numNode: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 font-bold',
  ctaBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-bold',
};

function toDisplay(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim() || fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    const joined = val
      .filter(Boolean)
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(', ');
    return joined || fallback;
  }
  if (typeof val === 'object') {
    try {
      return Object.values(val as Record<string, unknown>).filter(Boolean).map(String).join(' · ') || fallback;
    } catch {
      return fallback;
    }
  }
  return String(val);
}

function safeList(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map((v) => toDisplay(v)).filter(Boolean);
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map((v) => toDisplay(v)).filter(Boolean);
    } catch {}
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function FranchiseProfilePreview({
  franchise,
  listingId,
  ownerUserId,
  className,
}: FranchiseProfilePreviewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const [isPulsing, setIsPulsing] = React.useState(true);
  const isOwner = Boolean(user?.id && ownerUserId && user.id === ownerUserId);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const f = franchise || ({} as Partial<FranchiseCardData>);

  const displayTitle = toDisplay(f.companyName, 'Franchise & Bayilik');
  const displaySector = toDisplay(f.sector, 'Genel Sektör');
  const displayLocation =
    [toDisplay(f.city), toDisplay(f.district)].filter(Boolean).join(' - ') || 'Türkiye Geneli';

  const citiesList = safeList(f.availableCities);
  const displayCities =
    citiesList.length > 0
      ? citiesList
      : ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'];

  const summaryText = toDisplay(
    f.longDescription,
    `${displayTitle}, ${displaySector} sektöründe güçlü marka bilinirliği ve kanıtlanmış karlı iş modeli ile yatırımcılarına yüksek getiri ve sürdürülebilir büyüme fırsatı sunmaktadır. Şube açılışından operasyonel süreçlere kadar tüm aşamalarda anahtar teslim destek sağlanmaktadır.`,
  );

  const handleContactClick = () => {
    setIsPulsing(false);
    setContactDialogOpen(true);
  };

  const cleanPhoneForWhatsapp = (phoneStr?: string | null) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 7) return '';
    if (cleaned.startsWith('0')) cleaned = '90' + cleaned.slice(1);
    else if (!cleaned.startsWith('90') && cleaned.length === 10) cleaned = '90' + cleaned;
    return cleaned;
  };

  const whatsappNumber = cleanPhoneForWhatsapp(f.contactWhatsapp || f.contactPhone);

  return (
    <div className={cn('w-full space-y-5', className)}>
      {listingId && isOwner ? (
        <ListingOwnerActionsBar listingId={listingId} title={displayTitle} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
        {/* SOL SÜTUN - AYRIK KARTLAR */}
        <aside className="space-y-3.5 sm:space-y-4">
          {/* 1. KART: Marka Adı, Logo & Konum */}
          <div
            className={cn(
              'rounded-2xl border bg-white dark:bg-card p-4 sm:p-5',
              theme.cardBorder,
              theme.cardGlow,
            )}
          >
            {f.coverUrl ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 border border-slate-200/80 dark:border-border bg-slate-100 dark:bg-muted">
                <Image
                  src={f.coverUrl}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            ) : null}
            <h2 className="font-bold text-slate-900 dark:text-foreground text-base sm:text-lg leading-snug">
              {displayTitle}
            </h2>
            <hr className="border-slate-100 dark:border-border/80 my-2.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                {displaySector} · {toDisplay(f.establishmentYear, 'Kurulu')} Kuruluş
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-muted-foreground flex items-center gap-1">
                <span>{displayLocation}</span>
              </p>
            </div>
          </div>

          {/* 2. KART: Franchise Modeli & Şube Sayısı */}
          <div
            className={cn(
              'rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5',
              theme.cardBorder,
              theme.cardGlow,
            )}
          >
            <div
              className={cn(
                'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                theme.headerText,
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>FRANCHISE YAPISI</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                {toDisplay(f.franchiseModel, 'Anahtar Teslim Şube / Franchise')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                {f.branchCount ? `${toDisplay(f.branchCount)} Aktif Şube & Satış Noktası` : 'Büyüyen Şube Ağı'}
              </p>
            </div>
          </div>

          {/* 3. KART: Finansal Şartlar / Giriş Bedeli */}
          <div
            className={cn(
              'rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5',
              theme.cardBorder,
              theme.cardGlow,
            )}
          >
            <div
              className={cn(
                'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                theme.headerText,
              )}
            >
              <CreditCard className="h-4 w-4" />
              <span>YATIRIM VE ŞARTLAR</span>
            </div>
            <div className="space-y-2">
              {f.totalInvestment ? (
                <div className="flex items-start gap-2.5">
                  <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Toplam Yatırım Bütçesi
                    </p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      {toDisplay(f.totalInvestment)}
                    </p>
                  </div>
                </div>
              ) : null}

              {f.franchiseFee ? (
                <div className="flex items-start gap-2.5">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Franchise Giriş Bedeli
                    </p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      {toDisplay(f.franchiseFee)}
                    </p>
                  </div>
                </div>
              ) : null}

              {f.profitMargin ? (
                <div className="flex items-start gap-2.5">
                  <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Hedeflenen Kâr Marjı
                    </p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      {toDisplay(f.profitMargin)}
                    </p>
                  </div>
                </div>
              ) : null}

              {f.returnPeriod ? (
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Yatırım Geri Dönüş Süresi
                    </p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      {toDisplay(f.returnPeriod)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* 4. KART: İletişim Aksiyon Butonu */}
          <Button
            type="button"
            onClick={handleContactClick}
            className={cn(
              'w-full h-10 rounded-xl px-4 text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-500 bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
              isPulsing && 'animate-pulse-gentle ring-2 ring-offset-1 ring-rose-500/50 shadow-md',
            )}
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>İLAN SAHİBİYLE İLETİŞİME GEÇ</span>
          </Button>
        </aside>

        {/* Doğrudan İletişim Modalı */}
        <DirectContactDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          title="Franchise Yetkilisiyle İletişime Geç"
          subtitle={`${displayTitle} franchise fırsatı için doğrudan iletişim kanalları:`}
          contactName={f.contactName}
          contactRoleLabel="Franchise Yetkilisi"
          phone={f.contactPhone}
          whatsapp={f.contactWhatsapp || f.contactPhone}
          email={f.contactEmail}
          listingId={listingId}
        />

        {/* SAĞ GENİŞ KOLON - ANA İÇERİK KARTI */}
        <main
          className={cn(
            'rounded-2xl border bg-white dark:bg-card p-5 sm:p-6 lg:p-6 pb-4 gap-5 sm:gap-6 flex flex-col justify-between',
            theme.cardBorder,
            theme.cardGlow,
          )}
        >
          <div className="space-y-4 sm:space-y-5">
            {/* Üst Kısım: Franchise Fırsat Özeti */}
            <div className="space-y-1.5">
              <div
                className={cn(
                  'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                  theme.headerText,
                )}
              >
                <Store className="h-4 w-4" />
                <span>FRANCHISE FIRSAT ÖZETİ</span>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 dark:border-border dark:bg-card/50 p-4 sm:p-4.5">
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                  {summaryText}
                </p>
              </div>
            </div>

            {/* İç İki Kolon: Franchise Avantajları & Hedef Şehirler */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-5 lg:gap-7">
              {/* İç Sol Kolon (%65 Genişlik): 3 Aşamalı Destek & Model Paketi */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                      theme.headerText,
                    )}
                  >
                    <Layers className="h-4 w-4" />
                    <span>FRANCHISE DESTEK VE İŞLETME MODELİ</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-muted dark:text-muted-foreground">
                    3 Aşama
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Madde 1: Kurulum & Lokasyon */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
                          theme.numNode,
                        )}
                      >
                        1
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Kurulum
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Lokasyon Analizi & Mimari Konsept
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {f.minSquareMeters ? `Min. ${toDisplay(f.minSquareMeters)} m²` : 'Esnek Metrekare'} ·{' '}
                        {toDisplay(f.storeLocationType, 'Cadde & AVM Uygun')}
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>Merkezi lokasyon seçimi, fizibilite raporu ve mimari projelendirme desteği.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>Anahtar teslim mağaza dekorasyonu ve kurumsal kimlik standartları.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Madde 2: Eğitim & Operasyon */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
                          theme.numNode,
                        )}
                      >
                        2
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Eğitim
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Personel & Yönetici Akademi Eğitimi
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        Operasyonel Standartlar · Sürekli Denetim
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>İşe alım, barista/satış personeli ve şube müdürü için kapsamlı sertifikasyon.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>Açılış haftasında merkez operasyon ekibinden birebir yerinde refakat.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Madde 3: Tedarik & Pazarlama */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
                          theme.numNode,
                        )}
                      >
                        3
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Tedarik
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Hammadde Tedariği & Ulusal Pazarlama
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {toDisplay(f.royaltyFee, 'Merkezi Lojistik & Reklam')}
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>Merkezi depodan düzenli ve uygun maliyetli hammadde/ürün sevkiyatı.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>Ulusal ve yerel dijital pazarlama, sosyal medya ve marka bilinirliği kampanyaları.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* İç Sağ Kolon (%35 Genişlik): Öncelikli Hedef Şehirler */}
              <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-slate-200/90 dark:lg:border-border/80 lg:pl-6 space-y-3 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border/60 lg:self-center lg:my-auto">
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                    theme.headerText,
                  )}
                >
                  <MapPin className="h-4 w-4" />
                  <span>ÖNCELİKLİ HEDEF ŞEHİRLER</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {displayCities.map((cityName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 dark:bg-muted/40 dark:border-border text-xs text-slate-800 dark:text-slate-200 font-medium"
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                          theme.iconBg,
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <span className="truncate">{cityName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Alt Kısım: İlan Sahibi Paket & Vitrin Paneli */}
          {listingId && isOwner ? (
            <div className="pt-3 border-t border-slate-100 dark:border-border/60">
              <PremiumGate>
                <ListingOwnerPackagePanel listingId={listingId} />
              </PremiumGate>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
