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
  ShieldCheck,
  MapPin,
  Sparkles,
  Package,
  Layers,
  MessageSquare,
  Mail,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ListingOwnerPackagePanel } from '@/components/girisimco/listing/listing-owner-package-panel';
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
  badgeBg: 'bg-rose-500/10 text-rose-700 border-rose-300/40 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700/40',
  ctaBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-bold',
};

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

  const {
    companyName,
    establishmentYear,
    franchiseModel,
    sector,
    branchCount,
    totalInvestment,
    franchiseFee,
    profitMargin,
    advertisingFee,
    returnPeriod,
    royaltyFee,
    trainingSupport = true,
    operationalSupport = true,
    marketingSupport = true,
    locationSupport = true,
    logisticsSupport = true,
    exclusiveTerritory = true,
    trademarkStatus,
    minSquareMeters,
    storeLocationType,
    availableCities = [],
    city,
    district,
    coverUrl,
    longDescription,
    contactPhone,
    contactWhatsapp,
    contactEmail,
    contactName,
  } = franchise;

  const displayTitle = companyName || 'Franchise & Bayilik';
  const displaySector = sector || 'Genel Sektör';
  const displayLocation = [city, district].filter(Boolean).join(' - ') || 'Türkiye Geneli';

  const displayCities = availableCities.length > 0
    ? availableCities
    : ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'];

  const summaryText = longDescription || `${displayTitle}, ${displaySector} sektöründe güçlü marka bilinirliği ve kanıtlanmış karlı iş modeli ile yatırımcılarına yüksek getiri ve sürdürülebilir büyüme fırsatı sunmaktadır. Şube açılışından operasyonel süreçlere kadar tüm aşamalarda anahtar teslim destek sağlanmaktadır.`;

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

  const whatsappNumber = cleanPhoneForWhatsapp(contactWhatsapp || contactPhone);

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
        
        {/* SOL SÜTUN - AYRIK KARTLAR */}
        <aside className="space-y-3.5 sm:space-y-4">
          
          {/* 1. KART: Marka Adı, Görsel & Sektör */}
          <div className={cn('rounded-2xl border bg-white dark:bg-card p-4 sm:p-5', theme.cardBorder, theme.cardGlow)}>
            {coverUrl ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 border border-slate-200/80 dark:border-border bg-slate-100 dark:bg-muted">
                <Image
                  src={coverUrl}
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
                {displaySector} {establishmentYear ? `· Kur: ${establishmentYear}` : ''}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-muted-foreground">
                {displayLocation}
              </p>
            </div>
          </div>

          {/* 2. KART: Şube & Büyüklük */}
          <div className={cn('rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5', theme.cardBorder, theme.cardGlow)}>
            <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
              <Store className="h-4 w-4" />
              <span>ŞUBE & BÜYÜKLÜK</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                {branchCount ? `${branchCount}+ Aktif Şube` : 'Hızla Büyüyen Şube Ağı'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                {trademarkStatus || 'TürkPatent Tescilli Marka'}
              </p>
            </div>
          </div>

          {/* 3. KART: Konsept Türü */}
          <div className={cn('rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5', theme.cardBorder, theme.cardGlow)}>
            <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
              <Target className="h-4 w-4" />
              <span>KONSEPT TÜRÜ</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                {franchiseModel || storeLocationType || 'Cadde & AVM Mağazası'}
              </p>
              {minSquareMeters ? (
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                  Minimum {minSquareMeters} m² Alan Gereksinimi
                </p>
              ) : null}
            </div>
          </div>

          {/* 4. KART: Franchise Şartları */}
          <div className={cn('rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5', theme.cardBorder, theme.cardGlow)}>
            <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
              <Briefcase className="h-4 w-4" />
              <span>FRANCHISE ŞARTLARI</span>
            </div>
            <div className="space-y-2">
              {totalInvestment ? (
                <div className="flex items-start gap-2.5">
                  <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Yatırım Bütçesi</p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">{totalInvestment} ₺</p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Geri Dönüş Süresi (ROI)</p>
                  <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">{returnPeriod || '18 - 24 Ay'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">İsim Hakkı (Fee)</p>
                  <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                    {franchiseFee ? `${franchiseFee} ₺` : 'Yok / Paket Dahil'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Royalty (Ciro Payı)</p>
                  <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                    {royaltyFee || '%3 / Ay'}
                  </p>
                </div>
              </div>

              {profitMargin ? (
                <div className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Ortalama Kâr Marjı</p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">%{profitMargin}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* 5. KART: Aksiyon Butonu */}
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
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader className="space-y-1.5 text-left">
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                <Phone className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <span>Franchise Yetkilisiyle İletişime Geç</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-muted-foreground">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{displayTitle}</span> franchise fırsatı için doğrudan iletişim kanalları:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {contactName && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-muted dark:border-border text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <UserCheck className="h-4 w-4 text-rose-600" />
                  <span>Franchise Yetkilisi: <strong className="text-slate-900 dark:text-foreground">{contactName}</strong></span>
                </div>
              )}

              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-bold text-xs sm:text-sm transition-all group dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-rose-600" />
                    <span>Telefonla Ara: {contactPhone}</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              )}

              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm transition-all group dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp Başvuru Hattı ({contactWhatsapp || contactPhone})</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              )}

              <Button
                type="button"
                onClick={() => {
                  setContactDialogOpen(false);
                  if (listingId) router.push(`/mesajlarim?listing=${listingId}`);
                  else router.push('/mesajlarim');
                }}
                variant="outline"
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold"
              >
                <MessageSquare className="h-4 w-4 text-slate-600" />
                <span>Platform Üzerinden Mesaj Gönder</span>
              </Button>

              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-all dark:bg-muted dark:border-border dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span>Başvuru E-postası: {contactEmail}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              )}

              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Girişimbee doğrudan iletişim güvencesiyle iletişim bilgileri anında açıktır.</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* SAĞ GENİŞ KOLON - ANA İÇERİK KARTI */}
        <main className={cn('rounded-2xl border bg-white dark:bg-card p-5 sm:p-6 lg:p-6 pb-4 gap-5 sm:gap-6 flex flex-col justify-between', theme.cardBorder, theme.cardGlow)}>
          <div className="space-y-4 sm:space-y-5">
            
            {/* Üst Kısım: Franchise Fırsat Özeti */}
            <div className="space-y-1.5">
              <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
                <Store className="h-4 w-4" />
                <span>FRANCHISE FIRSAT ÖZETİ</span>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 dark:border-border dark:bg-card/50 p-4 sm:p-4.5">
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                  {summaryText}
                </p>
              </div>
            </div>

            {/* İç İki Kolon: Destekler & Hedef Şehirler */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-5 lg:gap-7">
              
              {/* İç Sol Kolon (%65 Genişlik): Franchise Destekleri & Operasyon */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
                    <Package className="h-4 w-4" />
                    <span>FRANCHISE DESTEKLERİ & ŞARTLAR</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-muted dark:text-muted-foreground">
                    3 Bölüm
                  </span>
                </div>

                <div className="space-y-2.5">
                  
                  {/* Madde 1: Eğitim & Oryantasyon */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs', theme.numNode)}>
                        1
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Eğitim
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Eğitim & Personel Oryantasyonu
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        Kapsamlı İşletmecilik ve Barista/Personel Eğitimi
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{trainingSupport ? 'Şube açılışı öncesinde işletmeci ve tüm personel için standart eğitim.' : 'Merkezi eğitim kılavuzları ve operasyon el kitabı.'}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{operationalSupport ? 'Açılış haftasında merkezden uzman süpervizör desteği.' : 'Düzenli operasyonel denetim ve kalite güvence takibi.'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Madde 2: Yer Seçimi & Mimari Proje */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs', theme.numNode)}>
                        2
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Mimari
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Yer Seçimi Analizi & Mimari Konsept
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        Doğru Lokasyon ve Anahtar Teslim Dekorasyon
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{locationSupport ? 'Yaya trafiği, ciro potansiyeli ve bölge fizibilite analizi desteği.' : 'Standartlaştırılmış mağaza mimari yerleşim konsepti.'}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{minSquareMeters ? `Minimum ${minSquareMeters} m² kullanım alanı için optimize edilmiş anahtar teslim proje.` : 'Standart ekipman ve kurumsal tabela montaj desteği.'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Madde 3: Pazarlama & Tedarik Gücü */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs', theme.numNode)}>
                        3
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Lojistik
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Pazarlama, Tedarik & Bölge Koruması
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        Ulusal Reklam Gücü ve Güvenli Tedarik Ağı
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{marketingSupport ? 'Ulusal medya, dijital reklam ve sosyal medya pazarlama kampanyaları.' : 'Yerel tanıtım materyalleri ve marka desteği.'}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{exclusiveTerritory ? 'Şubenize özel tanımlanmış korumalı bölge alanı garantisi.' : 'Kesintisiz merkezi hammadde ve lojistik sevkiyatı.'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

              {/* İç Sağ Kolon (%35 Genişlik): Hedef Şehirler & Kriterler */}
              <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-slate-200/90 dark:lg:border-border/80 lg:pl-5 space-y-2.5 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border/60">
                <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
                  <MapPin className="h-4 w-4" />
                  <span>HEDEF ŞEHİRLER & KRİTERLER</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {displayCities.map((cityName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 dark:bg-muted/40 dark:border-border text-xs text-slate-800 dark:text-slate-200 font-medium"
                    >
                      <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full', theme.iconBg)}>
                        <MapPin className="h-3 w-3" />
                      </div>
                      <span className="truncate">{cityName}</span>
                    </div>
                  ))}
                  {minSquareMeters ? (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 dark:bg-muted/40 dark:border-border text-xs text-slate-800 dark:text-slate-200 font-medium mt-1">
                      <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full', theme.iconBg)}>
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <span className="truncate">Min. {minSquareMeters} m² Alan</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 dark:bg-muted/40 dark:border-border text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full', theme.iconBg)}>
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                    <span className="truncate">Bölge Koruması Garantisi</span>
                  </div>
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
