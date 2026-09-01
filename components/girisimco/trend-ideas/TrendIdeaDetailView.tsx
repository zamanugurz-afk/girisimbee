'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Store,
  MapPin,
  Users,
  Rocket,
  Wrench,
  UserCheck,
  DollarSign,
  TrendingUp,
  Clock,
  Percent,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  FileCheck,
  Building2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { PracticalBusinessIdea } from '@/lib/data/monthly-trend-ideas';
import { cn } from '@/lib/utils';

export function TrendIdeaDetailView({ item }: { item: PracticalBusinessIdea }) {
  const whatsappUrl = `https://wa.me/905321000000?text=${encodeURIComponent(
    `Merhaba, Girişimbee üzerinden "${item.title}" niş iş modeli hakkında detaylı fizibilite ve danışmanlık almak istiyorum.`,
  )}`;

  return (
    <main className="gc-header-offset relative min-h-screen min-w-0 overflow-x-hidden bg-[#FAFBFC] dark:bg-zinc-950 pb-20">
      <div className="relative mx-auto min-w-0 max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* ========================================================================= */}
        {/* ÜST BREADCRUMB & GERİ DÖN NAVİGASYONU                                    */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/trend-fikirler"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Girişimbee Trend Fikirler’e dön</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Doğrulanmış Niş Konsept
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {item.monthEdition}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ANA İLAN KARTI (PROFESYONEL AYRIM ÇİZGİLERİ VE KART DÜZENİ)              */}
        {/* ========================================================================= */}
        <div className="overflow-hidden rounded-[2.25rem] border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
          
          {/* 1. ÜST HERO GÖRSEL BANNER (YÜKSEK KONTRASTLI METİN DÜZENİ) */}
          <div className="relative w-full aspect-[16/8] sm:aspect-[21/9] bg-slate-950 overflow-hidden">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover object-center"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Store className="h-14 w-14 opacity-30" />
              </div>
            )}
            
            {/* Güçlü Karartma Gradyanı (Metinlerin Daima Net Okunmasını Sağlar) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30 pointer-events-none" />

            {/* Üst Banner Rozetleri */}
            <div className="absolute top-4 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wide shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                SEÇİLİ NİŞ FIRSAT
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Doğrulanmış Model
                </span>
              </div>
            </div>

            {/* Banner İçi Başlık Başlığı (BEYAZ METİN & GÖLGE) */}
            <div className="absolute bottom-5 left-5 sm:left-8 right-5 sm:right-8 text-white z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  {item.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {item.businessModelBadge}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
                {item.title}
              </h1>
            </div>
          </div>

          {/* 2. GÖVDE ALANI (AYRIM ÇİZGİLERİYLE YAPILANDIRILMIŞ BLOKLAR) */}
          <div className="p-5 sm:p-8 lg:p-10 space-y-8">
            
            {/* Özel Ayrıcalık & Değer Önerisi Kartı */}
            <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 p-5 sm:p-6 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 shadow-sm mt-0.5">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 dark:text-amber-300">
                  Girişimbee Üyelerine Özel Ayrıcalık & Fizibilite
                </h3>
                <p className="text-sm sm:text-[14.5px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {item.tagline} Bu iş modelinde sabit dükkan maliyeti minimize edilmiş olup, ortalama <strong>{item.financials.paybackPeriodMonths} ayda sermaye amortismanı</strong> ve <strong>%{item.financials.grossMarginPercent} brüt kâr marjı</strong> hedeflenmiştir.
                </p>
              </div>
            </div>

            {/* 3. BÖLÜM: 4'LÜ FİNANSAL HÜCRESEL MATRİS (AYRIM ÇİZGİLİ TABLO) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  Finansal Fizibilite Matrisi
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Eylül 2026 Pazar Endeksi
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 divide-y sm:divide-y-0 divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden shadow-xs">
                {/* 1. Min. Sermaye */}
                <div className="p-4 sm:p-5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Min. Sermaye
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    ₺{item.financials.minCapital.toLocaleString('tr-TR')}
                  </div>
                  <span className="text-[10.5px] text-muted-foreground mt-1">Başlangıç demirbaş & operasyon</span>
                </div>

                {/* 2. Aylık Net Kâr */}
                <div className="p-4 sm:p-5 flex flex-col justify-between bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Aylık Net Kâr
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    ₺{item.financials.monthlyNetProfit.toLocaleString('tr-TR')}
                  </div>
                  <span className="text-[10.5px] text-muted-foreground mt-1">₺{item.financials.monthlyAvgRevenue.toLocaleString('tr-TR')} Ciro</span>
                </div>

                {/* 3. Amortisman */}
                <div className="p-4 sm:p-5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Amortisman
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {item.financials.paybackPeriodMonths} Ay
                  </div>
                  <span className="text-[10.5px] text-muted-foreground mt-1">Yatırım geri dönüş süresi</span>
                </div>

                {/* 4. Kâr Marjı */}
                <div className="p-4 sm:p-5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-sky-500" />
                    Brüt Kâr Marjı
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    %{item.financials.grossMarginPercent}
                  </div>
                  <span className="text-[10.5px] text-muted-foreground mt-1">Hizmet brüt kârlılığı</span>
                </div>
              </div>
            </div>

            {/* 4. BÖLÜM: MODEL HAKKINDA & PAZAR DİNAMİĞİ (AYRIM ÇİZGİLİ) */}
            <div className="pt-6 border-t border-slate-200/90 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Model Hakkında & Pazar Dinamiği (Neden Tutar?)
                </h3>
              </div>
              <p className="text-[14.5px] sm:text-[15.5px] leading-relaxed text-slate-700 dark:text-zinc-300 pl-4 border-l-2 border-amber-400">
                {item.marketReality.whyItWorks}
              </p>
            </div>

            {/* 5. BÖLÜM: ÖNE ÇIKAN PARAMETRELER (4'LÜ ÇERÇEVELİ İLAN KARTLARI) */}
            <div className="pt-6 border-t border-slate-200/90 dark:border-zinc-800 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Öne Çıkan Operasyonel Parametreler</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. İdeal Lokasyon */}
                <div className="p-4.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">İdeal Lokasyon Profili</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-1">
                    {item.marketReality.idealLocationProfile}
                  </p>
                </div>

                {/* 2. Hedef Müşteri */}
                <div className="p-4.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hedef Müşteri Kitlesi</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-1">
                    {item.marketReality.targetCustomer}
                  </p>
                </div>

                {/* 3. Alan İhtiyacı */}
                <div className="p-4.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alan İhtiyacı & Konsept</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-1">
                    {item.setupProfile.minimumSpaceM2 === 0 ? 'Dükkansız (Mobil / Sahada Hizmet)' : `${item.setupProfile.minimumSpaceM2} m² Kapalı / Yarı Açık Alan`}
                  </p>
                </div>

                {/* 4. Personel */}
                <div className="p-4.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Personel & İş Gücü</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-1">
                    {item.setupProfile.requiredStaffCount === 0 ? 'Personelsiz (Tam Otomasyon / Jetonlu Sistem)' : `${item.setupProfile.requiredStaffCount} Kişilik Operasyon Kadrosu`}
                  </p>
                </div>
              </div>
            </div>

            {/* 6. BÖLÜM: 1. AY BÜYÜME VE UYGULAMA ADIMLARI (01, 02, 03) */}
            <div className="pt-6 border-t border-slate-200/90 dark:border-zinc-800 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-500" />
                <span>Nasıl Başlarım? / 1. Ay Büyüme Yol Haritası</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 01 */}
                <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 relative overflow-hidden shadow-xs">
                  <span className="text-2xl font-black text-amber-500/30 dark:text-amber-400/20 absolute top-3 right-3 select-none">
                    01
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white relative z-10">Ekipman & Tedarik</h4>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10">
                    Temel demirbaşların temini, montaj ve ilk saha testlerinin tamamlanması.
                  </p>
                </div>

                {/* 02 */}
                <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 relative overflow-hidden shadow-xs">
                  <span className="text-2xl font-black text-amber-500/30 dark:text-amber-400/20 absolute top-3 right-3 select-none">
                    02
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white relative z-10">Lokasyon & Anlaşmalar</h4>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10">
                    {item.marketReality.firstMonthTractionPlan}
                  </p>
                </div>

                {/* 03 */}
                <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 relative overflow-hidden shadow-xs">
                  <span className="text-2xl font-black text-amber-500/30 dark:text-amber-400/20 absolute top-3 right-3 select-none">
                    03
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white relative z-10">Hizmet & Nakit Akışı</h4>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10">
                    İlk müşteri döngüsünün başlatılması, randevu/ciro sisteminin devreye alınması.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. BÖLÜM: GEREKLİ DEMİRBAŞ VE EKİPMANLAR */}
            <div className="pt-6 border-t border-slate-200/90 dark:border-zinc-800 space-y-3">
              <div className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-slate-500" />
                Gerekli Temel Ekipman ve Demirbaşlar
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {item.setupProfile.coreEquipments.map((eq) => (
                  <span
                    key={eq}
                    className="px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-xs"
                  >
                    ✓ {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* 8. BÖLÜM: ALT AKSİYON VE İLETİŞİM ÇUBUĞU */}
            <div className="border-t border-slate-200/90 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong className="text-slate-700 dark:text-zinc-300">Doğrulanmış Fizibilite:</strong> Eylül 2026 piyasa maliyet verileriyle hesaplanmıştır.</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-3 shadow-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp ile Bilgi Al</span>
                </a>

                <Link
                  href="/#assistant-section"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-sm px-5 py-3 shadow-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>İş Kurma Asistanında Simüle Et</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

export default TrendIdeaDetailView;
