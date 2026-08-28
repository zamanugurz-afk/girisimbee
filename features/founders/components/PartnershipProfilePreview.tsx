'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Briefcase,
  Target,
  Rocket,
  Percent,
  CreditCard,
  Clock,
  Users,
  CheckCircle2,
  Sliders,
  Phone,
  BarChart3,
  Layers,
  Sparkles,
  ShieldCheck,
  Package,
  TrendingUp,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DirectContactDialog } from '@/components/girisimco/listing/direct-contact-dialog';
import { ListingOwnerPackagePanel } from '@/components/girisimco/listing/listing-owner-package-panel';
import { ListingOwnerActionsBar } from '@/components/girisimco/listing/listing-owner-actions-bar';
import { PremiumGate } from '@/components/girisimco/premium/premium-gate';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { PartnershipCardData } from '@/features/listings/types/listing.types';
import { cn } from '@/lib/utils';

interface PartnershipProfilePreviewProps {
  partnership: PartnershipCardData;
  listingId?: string;
  ownerUserId?: string;
  className?: string;
}

const theme = {
  cardBorder: 'border-amber-200/90 dark:border-amber-800/40',
  cardGlow: 'shadow-[0_2px_12px_-4px_rgba(245,158,11,0.12)]',
  headerText: 'text-amber-700 dark:text-amber-400',
  iconBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  numNode: 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 font-bold',
  ctaBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-bold',
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

export function PartnershipProfilePreview({
  partnership,
  listingId,
  ownerUserId,
  className,
}: PartnershipProfilePreviewProps) {
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

  const p = partnership || ({} as Partial<PartnershipCardData>);

  const isTransfer =
    p.intent === 'transfer' ||
    Boolean(p.businessType || p.transferPrice || p.transferScope || p.monthlyRevenue);

  const displayTitle = toDisplay(
    p.title || p.companyName || p.businessName,
    isTransfer ? 'İşletme Devri' : 'Girişim Ortaklığı',
  );
  const displaySector = toDisplay(p.sector, 'Genel Sektör');
  const displayLocation =
    [toDisplay(p.city), toDisplay(p.district)].filter(Boolean).join(' - ') || 'Türkiye Geneli';

  const allPartnershipTypes = [
    ...safeList(p.partnershipTypes || (p as Record<string, unknown>).partnershipType),
    ...(p.partnershipTypesOther ? [toDisplay(p.partnershipTypesOther)] : []),
  ].filter(Boolean);

  const allSkills = [
    ...safeList(p.professionalSkills),
    ...(p.professionalSkillsOther ? [toDisplay(p.professionalSkillsOther)] : []),
    ...safeList(p.technicalSkills || (p as Record<string, unknown>).expertise),
    ...(p.technicalSkillsOther ? [toDisplay(p.technicalSkillsOther)] : []),
    ...safeList(p.tools),
    ...(p.toolsOther ? [toDisplay(p.toolsOther)] : []),
  ].filter(Boolean);

  const displaySkillsList =
    allSkills.length > 0
      ? allSkills
      : isTransfer
        ? [
            'İşletme Yönetimi',
            'Müşteri İlişkileri',
            'Pazarlama & Satış',
            'Nakit Akışı Yönetimi',
            'Personel Yönetimi',
            'Tedarik Ağı',
          ]
        : [
            'Satış & İş Geliştirme',
            'Dijital Pazarlama',
            'Ekip Liderliği',
            'Finansal Modelleme',
            'Yazılım / Teknoloji',
            'CRM / ERP Sistemleri',
          ];

  const summaryText = toDisplay(
    p.longDescription,
    isTransfer
      ? `${displayTitle}, ${displayLocation} lokasyonunda ${displaySector} sektöründe faaliyet gösteren faal bir işletmedir. Devir kapsamında mevcut müşteri portföyü, demirbaşlar ve operasyonel altyapı eksiksiz olarak aktarılacaktır.`
      : `${displayTitle}, ${displaySector} alanında yenilikçi çözümler sunan ölçeklenebilir bir projedir. Güçlü bir vizyonla sektörel büyüme hedefleyen girişimimiz için tamamlayıcı yetkinliklere sahip vizyoner kurucu ortaklar aranmaktadır.`,
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

  const whatsappNumber = cleanPhoneForWhatsapp(p.contactWhatsapp || p.contactPhone);

  const problemText = toDisplay(
    p.problem,
    isTransfer
      ? 'Yüksek yaya trafiğine ve oturmuş müşteri tabanına sahip lokasyon.'
      : 'Sektörel verimsizlikleri ortadan kaldıran yenilikçi çözüm modeli.',
  );
  const solutionText = toDisplay(
    p.solution,
    isTransfer
      ? 'Eksiksiz ruhsat, kurumsal altyapı ve hazır personel kadrosu.'
      : 'Doğrulanmış ürün mimarisi ve ölçeklenebilir teknoloji altyapısı.',
  );

  const businessModelText = toDisplay(
    p.businessModel,
    isTransfer ? toDisplay(p.businessType, 'Fiziksel / Perakende') : 'B2B SaaS / Pazaryeri',
  );
  const targetCustomerText = toDisplay(p.targetCustomer);

  return (
    <div className={cn('w-full space-y-5', className)}>
      {listingId && isOwner ? (
        <ListingOwnerActionsBar listingId={listingId} title={displayTitle} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
        {/* SOL SÜTUN - AYRIK KARTLAR */}
        <aside className="space-y-3.5 sm:space-y-4">
          {/* 1. KART: Başlık, Görsel & Konum */}
          <div
            className={cn(
              'rounded-2xl border bg-white dark:bg-card p-4 sm:p-5',
              theme.cardBorder,
              theme.cardGlow,
            )}
          >
            {p.coverUrl ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 border border-slate-200/80 dark:border-border bg-slate-100 dark:bg-muted">
                <Image
                  src={p.coverUrl}
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
                {displaySector} {p.businessType ? `· ${toDisplay(p.businessType)}` : ''}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-muted-foreground flex items-center gap-1">
                <span>{displayLocation}</span>
              </p>
            </div>
          </div>

          {/* 2. KART: Girişim / İşletme Aşaması */}
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
              <Rocket className="h-4 w-4" />
              <span>{isTransfer ? 'İŞLETME DURUMU' : 'GİRİŞİM AŞAMASI'}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                {toDisplay(p.stage, isTransfer ? 'Faal & Cirolu İşletme' : 'MVP - Gelir Üreten')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                {p.commitment
                  ? `Çalışma Modeli: ${toDisplay(p.commitment)}`
                  : isTransfer
                    ? 'Hazır Kurulu Düzen'
                    : 'Büyüme Odaklı'}
              </p>
            </div>
          </div>

          {/* 3. KART: İş Modeli / Hedef Kitle */}
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
              <Target className="h-4 w-4" />
              <span>İŞ MODELİ / HEDEF</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                {businessModelText}
              </p>
              {targetCustomerText ? (
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                  Hedef Kitle: {targetCustomerText}
                </p>
              ) : null}
            </div>
          </div>

          {/* 4. KART: Ortaklık / Devir Şartları */}
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
              <Briefcase className="h-4 w-4" />
              <span>{isTransfer ? 'DEVİR ŞARTLARI' : 'ORTAKLIK ŞARTLARI'}</span>
            </div>
            <div className="space-y-2">
              {isTransfer ? (
                <>
                  {p.transferPrice ? (
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Devir Bedeli
                        </p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                          {toDisplay(p.transferPrice)} ₺
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {p.monthlyRevenue ? (
                    <div className="flex items-start gap-2.5">
                      <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Aylık Ortalama Ciro
                        </p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                          {toDisplay(p.monthlyRevenue)} ₺
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {p.transferScope ? (
                    <div className="flex items-start gap-2.5">
                      <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Devir Kapsamı
                        </p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                          {toDisplay(p.transferScope)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  {p.equityOffered !== undefined && p.equityOffered !== null ? (
                    <div className="flex items-start gap-2.5">
                      <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Sunulan Hisse Oranı
                        </p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                          %{toDisplay(p.equityOffered)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {p.investmentAmount ? (
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Aranan Sermaye Katkısı
                        </p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                          {toDisplay(p.investmentAmount)} ₺
                        </p>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {p.commitment ? (
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Çalışma / Taahhüt
                    </p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      {toDisplay(p.commitment)}
                    </p>
                  </div>
                </div>
              ) : null}

              {allPartnershipTypes.length > 0 ? (
                <div className="flex items-start gap-2.5">
                  <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Ortaklık Türü
                    </p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      {allPartnershipTypes.join(', ')}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* 5. KART: İletişim Aksiyon Butonu */}
          <Button
            type="button"
            onClick={handleContactClick}
            className={cn(
              'w-full h-10 rounded-xl px-4 text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-500 bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
              isPulsing && 'animate-pulse-gentle ring-2 ring-offset-1 ring-amber-500/50 shadow-md',
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
          title={
            isTransfer
              ? 'İşletme Devir Yetkilisiyle İletişime Geç'
              : 'İlan Sahibiyle İletişime Geç'
          }
          subtitle={`${displayTitle} ilanı için doğrudan iletişim kanalları:`}
          contactName={p.contactName}
          contactRoleLabel={isTransfer ? 'Devir Yetkilisi' : 'İlan Sahibi'}
          phone={p.contactPhone}
          whatsapp={p.contactWhatsapp || p.contactPhone}
          email={p.contactEmail}
          listingId={listingId}
        />

        {/* SAĞ GENİŞ KOLON - YENİ NESİL PREMIUM GÖVDE */}
        <main className="space-y-4">
          {/* 1. ÜST ÖZET & VURGU KARTI */}
          <div className="rounded-2xl border border-amber-200/90 dark:border-amber-950/60 bg-white dark:bg-card p-4 sm:p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
              {isTransfer ? <Building2 className="h-6 w-6" /> : <Rocket className="h-6 w-6" />}
            </div>
            <p className="text-xs sm:text-[13.5px] font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {summaryText}
            </p>
          </div>

          {/* 2. ORTA BÖLÜM: 3 BÖLÜM SÜRECİ & ARANAN YETKİNLİKLER */}
          <div className="rounded-2xl border border-amber-200/90 dark:border-border bg-white dark:bg-card p-5 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            {/* Başlık Çubuğu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
                <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{isTransfer ? 'İŞLETME VARLIKLARI & KAPSAM' : 'GİRİŞİM KİLOMETRE TAŞLARI & VARLIKLAR'}</span>
              </div>
              <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/40 px-3 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                3 BÖLÜM
              </span>
            </div>

            {/* İki Kolonlu Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Sol Kolon (3 Bölümlü Renkli Kartlar) - %65 */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                {/* 01. BÖLÜM - Konum / Proje */}
                <div className="rounded-2xl border border-amber-200/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-amber-300 transition-colors">
                  {/* Sol Renkli Sütun */}
                  <div className="w-16 sm:w-20 bg-[#d97706] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">01</span>
                    {isTransfer ? <Building2 className="h-6 w-6 stroke-[1.75]" /> : <Rocket className="h-6 w-6 stroke-[1.75]" />}
                  </div>
                  {/* Sağ İçerik */}
                  <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                    <div>
                      <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                        {isTransfer ? 'Faal İşletme & Sektörel Konum' : 'Proje Durumu & Çözülen Problem'}
                      </h4>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                        {displaySector} · {displayLocation}
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>{problemText}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>{solutionText}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 02. BÖLÜM - Finansal Performans */}
                <div className="rounded-2xl border border-amber-200/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-amber-300 transition-colors">
                  {/* Sol Renkli Sütun */}
                  <div className="w-16 sm:w-20 bg-[#b45309] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">02</span>
                    <BarChart3 className="h-6 w-6 stroke-[1.75]" />
                  </div>
                  {/* Sağ İçerik */}
                  <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                    <div>
                      <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                        Gelir Modeli & Finansal Performans
                      </h4>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                        {p.monthlyRevenue ? `Aylık Ciro / Gelir: ${toDisplay(p.monthlyRevenue)} ₺` : 'Kârlı ve Sürdürülebilir Yapı'}
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>
                          {p.equityOffered
                            ? `Sunulan Ortaklık Hissesi: %${toDisplay(p.equityOffered)}`
                            : p.transferPrice
                              ? `Talep Edilen Devir Bedeli: ${toDisplay(p.transferPrice)} ₺`
                              : 'Esnek ve şeffaf sermaye / hisse paylaşımı.'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>
                          {p.investmentAmount
                            ? `Hedeflenen Yatırım / Sermaye: ${toDisplay(p.investmentAmount)} ₺`
                            : 'Düzenli nakit akışı ve büyüme potansiyeline sahip iş modeli.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 03. BÖLÜM - Kapsam & Varlıklar */}
                <div className="rounded-2xl border border-amber-200/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-amber-300 transition-colors">
                  {/* Sol Renkli Sütun */}
                  <div className="w-16 sm:w-20 bg-[#78350f] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">03</span>
                    <ShieldCheck className="h-6 w-6 stroke-[1.75]" />
                  </div>
                  {/* Sağ İçerik */}
                  <div className="p-4 sm:p-4.5 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                    <div>
                      <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                        {isTransfer ? 'Devir Kapsamı & Demirbaşlar' : 'Ortaklık Yapısı & Beklentiler'}
                      </h4>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                        {p.transferScope
                          ? toDisplay(p.transferScope)
                          : p.commitment
                            ? `Taahhüt: ${toDisplay(p.commitment)}`
                            : 'Tam Yetki & Şeffaf Süreç'}
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>
                          {isTransfer
                            ? 'Tüm ekipman, tedarikçi bağlantıları ve müşteri portföyü devredilecektir.'
                            : 'Fikri mülkiyet, marka hakları ve teknoloji altyapısı mevcuttur.'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
                        <span>Hukuki olarak hazırlanmış sözleşme ile güvence altına alınır.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Kolon (Aranan Uzmanlıklar Kartı) - %35 */}
              <div className="lg:col-span-5 xl:col-span-4 rounded-2xl border border-amber-200/90 dark:border-border bg-white dark:bg-card/50 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-amber-200/80 dark:border-border">
                    <Sliders className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
                      ARANAN UZMANLIKLAR
                    </span>
                  </div>

                  <div className="space-y-2 pt-3">
                    {displaySkillsList.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50/40 dark:bg-muted/30 border border-amber-200/70 dark:border-border hover:bg-amber-50/80 dark:hover:bg-muted/60 transition-colors group cursor-default"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {skill}
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ALT 4'LÜ AVANTAJ / DESTEK ŞERİDİ */}
          <div className="rounded-2xl border border-amber-200/90 dark:border-border bg-white dark:bg-card p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-border/60">
              {/* 1. Sütun */}
              <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-2 first:pl-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-900/40">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Doğrulanmış Model
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Kanıtlanmış büyüme ve pazar potansiyeli
                  </p>
                </div>
              </div>

              {/* 2. Sütun */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-900/40">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Hukuki Güvence
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Resmi ortaklık ve devir protokolü
                  </p>
                </div>
              </div>

              {/* 3. Sütun */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-900/40">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Eksiksiz Devir
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Müşteri portföyü ve altyapı teslimi
                  </p>
                </div>
              </div>

              {/* 4. Sütun */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-3 last:pr-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-900/40">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-foreground truncate">
                    Sürekli Destek
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                    Geçiş sürecinde aktif mentörlük ve operasyon
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
