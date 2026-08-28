'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Store,
  Building2,
  Target,
  Percent,
  CreditCard,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  Sparkles,
  Package,
  Layers,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  Coffee,
  Users,
  Truck,
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

        {/* SAĞ GENİŞ KOLON - YENİ NESİL PREMIUM GÖVDE */}
        <main className="space-y-4">
          {/* 1. ÜST ÖZET & VURGU KARTI */}
          <div className="rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-white dark:bg-card p-4 sm:p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Coffee className="h-6 w-6" />
            </div>
            <p className="text-xs sm:text-[13.5px] font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {summaryText}
            </p>
          </div>

          {/* 2. ORTA BÖLÜM: 3 AŞAMA SÜRECİ & HEDEF ŞEHİRLER */}
          <div className="rounded-2xl border border-rose-100/90 dark:border-border bg-white dark:bg-card p-5 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            {/* Başlık Çubuğu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
                <Layers className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span>FRANCHISE DESTEK VE İŞLETME MODELİ</span>
              </div>
              <span className="rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/40 px-3 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                3 AŞAMA
              </span>
            </div>

            {/* İki Kolonlu Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Sol Kolon (3 Aşamalı Renkli Kartlar) - %65 */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                {/* 01. AŞAMA - Lokasyon Analizi */}
                <div className="rounded-2xl border border-rose-100/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-rose-200 transition-colors">
                  {/* Sol Renkli Sütun */}
                  <div className="w-16 sm:w-20 bg-[#be185d] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">01</span>
                    <MapPin className="h-6 w-6 stroke-[1.75]" />
                  </div>
                  {/* Sağ İçerik */}
                  <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                    <div>
                      <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                        Lokasyon Analizi & Mimari Konsept
                      </h4>
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                        {f.minSquareMeters ? `Min. ${toDisplay(f.minSquareMeters)} m²` : 'Esnek Metrekare'} •{' '}
                        {toDisplay(f.storeLocationType, 'Cadde & AVM Uygun')}
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600/80 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>Merkezi lokasyon seçimi, fizibilite raporu ve mimari projelendirme desteği.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600/80 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>Anahtar teslim mağaza dekorasyonu ve kurumsal kimlik standartları.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 02. AŞAMA - Personel & Eğitim */}
                <div className="rounded-2xl border border-rose-100/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-rose-200 transition-colors">
                  {/* Sol Renkli Sütun */}
                  <div className="w-16 sm:w-20 bg-[#881337] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">02</span>
                    <Users className="h-6 w-6 stroke-[1.75]" />
                  </div>
                  {/* Sağ İçerik */}
                  <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                    <div>
                      <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                        Personel & Yönetici Akademi Eğitimi
                      </h4>
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                        Operasyonel Standartlar • Sürekli Denetim
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600/80 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>İşe alım, barista/satış personeli ve şube müdürü için kapsamlı sertifikasyon.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600/80 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>Açılış haftasında merkez operasyon ekibinden birebir yerinde refakat.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 03. AŞAMA - Hammadde & Tedarik */}
                <div className="rounded-2xl border border-rose-100/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-rose-200 transition-colors">
                  {/* Sol Renkli Sütun */}
                  <div className="w-16 sm:w-20 bg-[#4c0519] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">03</span>
                    <Truck className="h-6 w-6 stroke-[1.75]" />
                  </div>
                  {/* Sağ İçerik */}
                  <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                    <div>
                      <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                        Hammadde Tedariği & Ulusal Pazarlama
                      </h4>
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                        {toDisplay(f.royaltyFee, 'Merkezi Lojistik & Reklam')}
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600/80 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>Merkezi depodan düzenli ve uygun maliyetli hammadde/ürün sevkiyatı.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-rose-600/80 dark:text-rose-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>Ulusal ve yerel dijital pazarlama, sosyal medya ve marka bilinirliği kampanyaları.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Kolon (Öncelikli Hedef Şehirler Kartı) - %35 */}
              <div className="lg:col-span-5 xl:col-span-4 rounded-2xl border border-rose-100/90 dark:border-border bg-white dark:bg-card/50 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-rose-100/80 dark:border-border">
                    <Target className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
                      ÖNCELİKLİ HEDEF ŞEHİRLER
                    </span>
                  </div>

                  <div className="space-y-2 pt-3">
                    {displayCities.map((cityName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50/30 dark:bg-muted/30 border border-rose-100/70 dark:border-border hover:bg-rose-50/80 dark:hover:bg-muted/60 transition-colors group cursor-default"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {cityName}
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ALT 4'LÜ AVANTAJ / DESTEK ŞERİDİ */}
          <div className="rounded-2xl border border-rose-100/90 dark:border-border bg-white dark:bg-card p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-border/60">
              {/* 1. Sütun */}
              <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-2 first:pl-0">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-rose-900/40">
                  <Store className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Anahtar Teslim Mağaza
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Tasarım, dekorasyon ve ekipman desteği
                  </p>
                </div>
              </div>

              {/* 2. Sütun */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-rose-900/40">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Akademi & Eğitim
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Barista ve yöneticiler için sertifikalı eğitim
                  </p>
                </div>
              </div>

              {/* 3. Sütun */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-rose-900/40">
                  <Coffee className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Merkezi Kahve Tedariği
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Taze kavrulmuş, yüksek kaliteli kahve tedariki
                  </p>
                </div>
              </div>

              {/* 4. Sütun */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-3 last:pr-0">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100/80 dark:border-rose-900/40">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Sürekli Destek
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Operasyon, pazarlama ve büyüme desteği
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İlan Sahibi Paket & Vitrin Paneli */}
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
