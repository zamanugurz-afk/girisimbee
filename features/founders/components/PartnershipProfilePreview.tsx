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
  MessageSquare,
  Mail,
  ExternalLink,
  ShieldCheck,
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
import type { PartnershipCardData } from '@/features/listings/types/listing.types';
import { cn } from '@/lib/utils';

interface PartnershipProfilePreviewProps {
  partnership: PartnershipCardData;
  listingId?: string;
  ownerUserId?: string;
  className?: string;
}

const theme = {
  cardBorder: 'border-sky-200/90 dark:border-sky-800/40',
  cardGlow: 'shadow-[0_2px_12px_-4px_rgba(56,189,248,0.12)]',
  headerText: 'text-sky-700 dark:text-sky-400',
  iconBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  numNode: 'bg-sky-500/10 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 font-bold',
  badgeBg: 'bg-sky-500/10 text-sky-700 border-sky-300/40 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700/40',
  ctaBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold',
};

export function PartnershipProfilePreview({
  partnership,
  listingId,
  ownerUserId,
  className,
}: PartnershipProfilePreviewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const isOwner = Boolean(user?.id && ownerUserId && user.id === ownerUserId);

  const {
    intent = 'seeking',
    title,
    companyName,
    businessName,
    businessType,
    sector,
    stage,
    partnershipTypes = [],
    partnershipTypesOther,
    professionalSkills = [],
    professionalSkillsOther,
    technicalSkills = [],
    technicalSkillsOther,
    tools = [],
    toolsOther,
    commitment,
    equityOffered,
    monthlyRevenue,
    investmentAmount,
    transferPrice,
    transferScope,
    city,
    district,
    coverUrl,
    longDescription,
    problem,
    solution,
    businessModel,
    targetCustomer,
    contactPhone,
    contactWhatsapp,
    contactEmail,
    contactName,
  } = partnership;

  const isTransfer = intent === 'transfer' || Boolean(businessType || transferPrice || transferScope);
  const displayTitle = title || companyName || businessName || (isTransfer ? 'İşletme Devri' : 'Girişim Ortaklığı');
  const displaySector = sector || 'Genel Sektör';
  const displayLocation = [city, district].filter(Boolean).join(' - ') || 'Türkiye Geneli';

  const allPartnershipTypes = [
    ...partnershipTypes,
    ...(partnershipTypesOther ? [partnershipTypesOther] : []),
  ];

  const allSkills = [
    ...professionalSkills,
    ...(professionalSkillsOther ? [professionalSkillsOther] : []),
    ...technicalSkills,
    ...(technicalSkillsOther ? [technicalSkillsOther] : []),
    ...tools,
    ...(toolsOther ? [toolsOther] : []),
  ];

  const displaySkillsList = allSkills.length > 0
    ? allSkills
    : isTransfer
      ? ['İşletme Yönetimi', 'Müşteri İlişkileri', 'Pazarlama & Satış', 'Nakit Akışı Yönetimi', 'Personel Yönetimi', 'Tedarik Ağı']
      : ['Satış & İş Geliştirme', 'Dijital Pazarlama', 'Ekip Liderliği', 'Finansal Modelleme', 'Yazılım / Teknoloji', 'CRM / ERP Sistemleri'];

  const summaryText = longDescription || (isTransfer
    ? `${displayTitle}, ${displayLocation} lokasyonunda ${displaySector} sektöründe faaliyet gösteren faal bir işletmedir. Devir kapsamında mevcut müşteri portföyü, demirbaşlar ve operasyonel altyapı eksiksiz olarak aktarılacaktır.`
    : `${displayTitle}, ${displaySector} alanında yenilikçi çözümler sunan ölçeklenebilir bir projedir. Güçlü bir vizyonla sektörel büyüme hedefleyen girişimimiz için tamamlayıcı yetkinliklere sahip vizyoner kurucu ortaklar aranmaktadır.`);

  const handleContactClick = () => {
    setContactDialogOpen(true);
  };

  const cleanPhoneForWhatsapp = (phoneStr?: string | null) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '90' + cleaned.slice(1);
    if (!cleaned.startsWith('90')) cleaned = '90' + cleaned;
    return cleaned;
  };

  const whatsappNumber = cleanPhoneForWhatsapp(contactWhatsapp || contactPhone);

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
        
        {/* SOL SÜTUN - AYRIK KARTLAR */}
        <aside className="space-y-3.5 sm:space-y-4">
          
          {/* 1. KART: Başlık, Görsel & Konum */}
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
                {displaySector} {businessType ? `· ${businessType}` : ''}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-muted-foreground flex items-center gap-1">
                <span>{displayLocation}</span>
              </p>
            </div>
          </div>

          {/* 2. KART: Girişim / İşletme Aşaması */}
          <div className={cn('rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5', theme.cardBorder, theme.cardGlow)}>
            <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
              <Rocket className="h-4 w-4" />
              <span>{isTransfer ? 'İŞLETME DURUMU' : 'GİRİŞİM AŞAMASI'}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                {stage || (isTransfer ? 'Faal & Cirolu İşletme' : 'MVP - Gelir Üreten')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                {commitment ? `Çalışma Modeli: ${commitment}` : (isTransfer ? 'Hazır Kurulu Düzen' : 'Büyüme Odaklı')}
              </p>
            </div>
          </div>

          {/* 3. KART: İş Modeli / Hedef Kitle */}
          <div className={cn('rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5', theme.cardBorder, theme.cardGlow)}>
            <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
              <Target className="h-4 w-4" />
              <span>İŞ MODELİ / HEDEF</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                {Array.isArray(businessModel) ? businessModel.join(', ') : (businessModel || (isTransfer ? (businessType || 'Fiziksel / Perakende') : 'B2B SaaS / Pazaryeri'))}
              </p>
              {targetCustomer ? (
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                  Hedef Kitle: {Array.isArray(targetCustomer) ? targetCustomer.join(', ') : targetCustomer}
                </p>
              ) : null}
            </div>
          </div>

          {/* 4. KART: Ortaklık / Devir Şartları */}
          <div className={cn('rounded-2xl border bg-white dark:bg-card p-4 sm:p-5 space-y-2.5', theme.cardBorder, theme.cardGlow)}>
            <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
              <Briefcase className="h-4 w-4" />
              <span>{isTransfer ? 'DEVİR ŞARTLARI' : 'ORTAKLIK ŞARTLARI'}</span>
            </div>
            <div className="space-y-2">
              {isTransfer ? (
                <>
                  {transferPrice ? (
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Devir Bedeli</p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">{transferPrice} ₺</p>
                      </div>
                    </div>
                  ) : null}

                  {monthlyRevenue ? (
                    <div className="flex items-start gap-2.5">
                      <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Aylık Ortalama Ciro</p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">{monthlyRevenue} ₺</p>
                      </div>
                    </div>
                  ) : null}

                  {transferScope ? (
                    <div className="flex items-start gap-2.5">
                      <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Devir Kapsamı</p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">{transferScope}</p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  {equityOffered !== undefined && equityOffered !== null ? (
                    <div className="flex items-start gap-2.5">
                      <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Sunulan Hisse Oranı</p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">%{equityOffered}</p>
                      </div>
                    </div>
                  ) : null}

                  {investmentAmount ? (
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Aranan Sermaye Katkısı</p>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">{investmentAmount} ₺</p>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {commitment ? (
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Çalışma / Taahhüt</p>
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground">{commitment}</p>
                  </div>
                </div>
              ) : null}

              {allPartnershipTypes.length > 0 ? (
                <div className="flex items-start gap-2.5">
                  <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Ortaklık Türü</p>
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
            className={cn('w-full rounded-2xl py-3 h-11 text-xs sm:text-sm font-bold flex items-center justify-center gap-2', theme.ctaBtn)}
          >
            <Phone className="h-4 w-4" />
            <span>İLAN SAHİBİYLE İLETİŞİME GEÇ</span>
          </Button>

        </aside>

        {/* Doğrudan İletişim Modalı */}
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader className="space-y-1.5 text-left">
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>İlan Sahibiyle İletişime Geç</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-muted-foreground">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{displayTitle}</span> ilanı için doğrudan iletişim kanalları:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {contactName && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-muted dark:border-border text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span>Yetkili / İlan Sahibi: <strong className="text-slate-900 dark:text-foreground">{contactName}</strong></span>
                </div>
              )}

              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs sm:text-sm transition-all group dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-blue-600" />
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
                    <span>WhatsApp&apos;tan Yaz ({contactWhatsapp || contactPhone})</span>
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
                    <span>E-posta: {contactEmail}</span>
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
            
            {/* Üst Kısım: Girişim / Ortaklık Özeti */}
            <div className="space-y-1.5">
              <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
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
                  <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
                    <Layers className="h-4 w-4" />
                    <span>{isTransfer ? 'İŞLETME VARLIKLARI & KAPSAM' : 'GİRİŞİM KİLOMETRE TAŞLARI & VARLIKLAR'}</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-muted dark:text-muted-foreground">
                    3 Bölüm
                  </span>
                </div>

                <div className="space-y-2.5">
                  
                  {/* Madde 1: Proje Durumu / Faaliyet Kapsamı */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs', theme.numNode)}>
                        1
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        {isTransfer ? 'İşletme' : 'Proje'}
                      </p>
                      <span className={cn('mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-semibold', theme.badgeBg)}>
                        {isTransfer ? 'Faaliyet' : 'Aşama'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        {isTransfer ? 'Faal İşletme & Sektörel Konum' : 'Proje Durumu & Çözülen Problem'}
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {displaySector} · {displayLocation}
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{problem || (isTransfer ? 'Yüksek yaya trafiğine ve oturmuş müşteri tabanına sahip lokasyon.' : 'Sektörel verimsizlikleri ortadan kaldıran yenilikçi çözüm modeli.')}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{solution || (isTransfer ? 'Eksiksiz ruhsat, kurumsal altyapı ve hazır personel kadrosu.' : 'Doğrulanmış ürün mimarisi ve ölçeklenebilir teknoloji altyapısı.')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Madde 2: Finansal Performans & Gelir Modeli */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs', theme.numNode)}>
                        2
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Finans
                      </p>
                      <span className={cn('mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-semibold', theme.badgeBg)}>
                        {monthlyRevenue ? 'Cirolu' : 'Büyüme'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        Gelir Modeli & Finansal Performans
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {monthlyRevenue ? `Aylık Gelir: ${monthlyRevenue} ₺` : 'Kârlı ve Sürdürülebilir Yapı'}
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{equityOffered ? `Sunulan Ortaklık Hissesi: %${equityOffered}` : (transferPrice ? `Talep Edilen Devir Bedeli: ${transferPrice} ₺` : 'Esnek ve şeffaf sermaye / hisse paylaşımı.')}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{investmentAmount ? `Hedeflenen Sermaye / Yatırım: ${investmentAmount} ₺` : 'Düzenli nakit akışı ve büyüme potansiyeline sahip iş modeli.'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Madde 3: Ortaklık Yapısı & Varlıklar */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5 relative flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs', theme.numNode)}>
                        3
                      </div>
                    </div>
                    <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                        Kapsam
                      </p>
                      <span className={cn('mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-semibold', theme.badgeBg)}>
                        {isTransfer ? 'Demirbaş' : 'Ortaklık'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                        {isTransfer ? 'Devir Kapsamı & Demirbaşlar' : 'Ortaklık Yapısı & Beklentiler'}
                      </h4>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                        {transferScope || (commitment ? `Taahhüt: ${commitment}` : 'Tam Yetki & Şeffaf Süreç')}
                      </p>
                      <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{isTransfer ? 'Tüm ekipman, tedarikçi bağlantıları ve müşteri portföyü devredilecektir.' : 'Fikri mülkiyet, marka hakları ve teknoloji altyapısı mevcuttur.'}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>Hukuki olarak hazırlanmış ortaklık / devir sözleşmesi ile güvence altına alınır.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

              {/* İç Sağ Kolon (%35 Genişlik): Aranan Uzmanlıklar & Programlar */}
              <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-slate-200/90 dark:lg:border-border/80 lg:pl-5 space-y-2.5 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border/60">
                <div className={cn('flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider', theme.headerText)}>
                  <Sliders className="h-4 w-4" />
                  <span>ARANAN UZMANLIKLAR & PROGRAMLAR</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {displaySkillsList.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 dark:bg-muted/40 dark:border-border text-xs text-slate-800 dark:text-slate-200 font-medium"
                    >
                      <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full', theme.iconBg)}>
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
