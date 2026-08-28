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

        {/* SAĞ GENİŞ KOLON - ANA İÇERİK KARTI */}
        <main
          className={cn(
            'rounded-2xl border bg-white dark:bg-card p-5 sm:p-6 lg:p-6 pb-4 gap-5 sm:gap-6 flex flex-col justify-between',
            theme.cardBorder,
            theme.cardGlow,
          )}
        >
          <div className="space-y-4 sm:space-y-5">
            {/* Üst Kısım: Girişim / Ortaklık Özeti */}
            <div className="space-y-1.5">
              <div
                className={cn(
                  'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                  theme.headerText,
                )}
              >
                <Building2 className="h-4 w-4" />
                <span>{isTransfer ? 'İŞLETME DEVİR ÖZETİ' : 'ORTAKLIK & GİRİŞİM ÖZETİ'}</span>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 dark:border-border dark:bg-card/50 p-4 sm:p-4.5">
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                  {summaryText}
                </p>
              </div>
            </div>

            {/* İç İki Kolon: Kilometre Taşları & Aranan Uzmanlıklar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-5 lg:gap-7">
              {/* İç Sol Kolon (%65 Genişlik): Kilometre Taşları & Varlıklar */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                      theme.headerText,
                    )}
                  >
                    <Layers className="h-4 w-4" />
                    <span>
                      {isTransfer
                        ? 'İŞLETME VARLIKLARI & KAPSAM'
                        : 'GİRİŞİM KİLOMETRE TAŞLARI & VARLIKLAR'}
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-muted dark:text-muted-foreground">
                    3 Bölüm
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Madde 1: Proje Durumu / Faaliyet Kapsamı */}
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
                        {isTransfer ? 'İşletme' : 'Proje'}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        {isTransfer
                          ? 'Faal İşletme & Sektörel Konum'
                          : 'Proje Durumu & Çözülen Problem'}
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {displaySector} · {displayLocation}
                      </p>
                      <div className="mt-2 space-y-1 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>{problemText}</p>
                        <p>{solutionText}</p>
                      </div>
                    </div>
                  </div>

                  {/* Madde 2: Finansal Performans & Gelir Modeli */}
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
                        Finans
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Gelir Modeli & Finansal Performans
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {p.monthlyRevenue
                          ? `Aylık Gelir: ${toDisplay(p.monthlyRevenue)} ₺`
                          : 'Kârlı ve Sürdürülebilir Yapı'}
                      </p>
                      <div className="mt-2 space-y-1 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>
                          {p.equityOffered
                            ? `Sunulan Ortaklık Hissesi: %${toDisplay(p.equityOffered)}`
                            : p.transferPrice
                              ? `Talep Edilen Devir Bedeli: ${toDisplay(p.transferPrice)} ₺`
                              : 'Esnek ve şeffaf sermaye / hisse paylaşımı.'}
                        </p>
                        <p>
                          {p.investmentAmount
                            ? `Hedeflenen Sermaye / Yatırım: ${toDisplay(p.investmentAmount)} ₺`
                            : 'Düzenli nakit akışı ve büyüme potansiyeline sahip iş modeli.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Madde 3: Ortaklık Yapısı & Varlıklar */}
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
                        Kapsam
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        {isTransfer
                          ? 'Devir Kapsamı & Demirbaşlar'
                          : 'Ortaklık Yapısı & Beklentiler'}
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {p.transferScope
                          ? toDisplay(p.transferScope)
                          : p.commitment
                            ? `Taahhüt: ${toDisplay(p.commitment)}`
                            : 'Tam Yetki & Şeffaf Süreç'}
                      </p>
                      <div className="mt-2 space-y-1 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>
                          {isTransfer
                            ? 'Tüm ekipman, tedarikçi bağlantıları ve müşteri portföyü devredilecektir.'
                            : 'Fikri mülkiyet, marka hakları ve teknoloji altyapısı mevcuttur.'}
                        </p>
                        <p>
                          Hukuki olarak hazırlanmış ortaklık / devir sözleşmesi ile güvence altına
                          alınır.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* İç Sağ Kolon (%35 Genişlik): Aranan Uzmanlıklar & Programlar */}
              <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-slate-200/90 dark:lg:border-border/80 lg:pl-6 space-y-3 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border/60 lg:self-center lg:my-auto">
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                    theme.headerText,
                  )}
                >
                  <Sliders className="h-4 w-4" />
                  <span>ARANAN UZMANLIKLAR & PROGRAMLAR</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {displaySkillsList.map((skill, idx) => (
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
                      <span className="truncate">{skill}</span>
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
