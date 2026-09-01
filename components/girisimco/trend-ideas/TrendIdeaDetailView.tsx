'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
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
  Layers,
} from 'lucide-react';
import { PracticalBusinessIdea } from '@/lib/data/monthly-trend-ideas';
import { cn } from '@/lib/utils';

export function TrendIdeaDetailView({ item }: { item: PracticalBusinessIdea }) {
  const whatsappUrl = `https://wa.me/905321000000?text=${encodeURIComponent(
    `Merhaba, Girişimbee üzerinden "${item.title}" niş iş modeli hakkında detaylı fizibilite ve danışmanlık almak istiyorum.`,
  )}`;

  return (
    <main className="gc-header-offset relative min-h-screen min-w-0 overflow-x-hidden bg-[#FAFBFC] dark:bg-zinc-950 py-4 sm:py-6">
      <div className="relative mx-auto min-w-0 max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* ÜST BREADCRUMB & GERİ DÖN NAVİGASYONU                                    */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <Link
            href="/trend-fikirler"
            className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Girişimbee Trend Fikirler’e dön</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
              <Sparkles className="w-3 h-3 fill-current" />
              Doğrulanmış Niş Konsept
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px] font-semibold border border-slate-200 dark:border-zinc-700">
              <Calendar className="w-3 h-3 text-amber-500" />
              {item.monthEdition}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ANA KART (TEK SAYFA GÖRÜNÜRLÜĞÜ & 2 SÜTUNLU DİKEY AYRIM ÇİZGİLİ MİMARİ) */}
        {/* ========================================================================= */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
          
          {/* 1. KOMPAKT HERO GÖRSEL BANNER */}
          <div className="relative w-full h-[150px] sm:h-[185px] bg-slate-950 overflow-hidden">
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
                <Store className="h-10 w-10 opacity-30" />
              </div>
            )}
            
            {/* Güçlü Karartma Gradyanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/35 pointer-events-none" />

            {/* Üst Banner Rozetleri */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black tracking-wide shadow-md">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                SEÇİLİ NİŞ FIRSAT
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Doğrulanmış Model
              </span>
            </div>

            {/* Banner İçi Başlık (BEYAZ METİN & YÜKSEK KONTRAST) */}
            <div className="absolute bottom-3.5 left-4 sm:left-6 right-4 sm:right-6 text-white z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  {item.category}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {item.businessModelBadge}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight truncate">
                {item.title}
              </h1>
            </div>
          </div>

          {/* 2. ÖZEL AYRICALIK BANNERİ (KOMPAKT) */}
          <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shrink-0 shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug">
                <strong className="text-slate-900 dark:text-amber-300 font-bold">Girişimbee Ayrıcalığı:</strong> {item.tagline} Sabit dükkan gideri minimize edilmiş olup, <strong>{item.financials.paybackPeriodMonths} ayda amortisman</strong> ve <strong>%{item.financials.grossMarginPercent} kâr marjı</strong> hedeflenmiştir.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. DİKEY AYRIM ÇİZGİLİ 2 SÜTUNLU GÖVDE (SOL VE SAĞ BİLGİ DÜZENİ)           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800 p-4 sm:p-6 gap-y-6 lg:gap-y-0">
            
            {/* ----------------------------------------------------------------------- */}
            {/* SOL SÜTUN: 1. & 2. FİNANSAL METRİK + MODEL HAKKINDA + PARAMETRELER     */}
            {/* ----------------------------------------------------------------------- */}
            <div className="lg:pr-6 space-y-5">
              
              {/* Sol 2 Finansal Hücre (Min. Sermaye & Aylık Net Kâr) */}
              <div className="grid grid-cols-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden shadow-2xs">
                {/* 1. Min. Sermaye */}
                <div className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    Min. Sermaye
                  </span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    ₺{item.financials.minCapital.toLocaleString('tr-TR')}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Demirbaş & ilk operasyon</span>
                </div>

                {/* 2. Aylık Net Kâr */}
                <div className="p-3.5 flex flex-col justify-between bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Aylık Net Kâr
                  </span>
                  <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    ₺{item.financials.monthlyNetProfit.toLocaleString('tr-TR')}
                  </div>
                  <span className="text-[10px] text-muted-foreground">₺{item.financials.monthlyAvgRevenue.toLocaleString('tr-TR')} Ciro</span>
                </div>
              </div>

              {/* Sol Bölüm 1: Model Hakkında & Pazar Dinamiği */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Model Hakkında & Neden Tutar?
                  </h3>
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-zinc-300 pl-3 border-l-2 border-amber-400">
                  {item.marketReality.whyItWorks}
                </p>
              </div>

              {/* Sol Bölüm 2: Operasyonel Parametreler */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Operasyonel Parametreler</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* İdeal Lokasyon */}
                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>İdeal Lokasyon</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-snug">
                      {item.marketReality.idealLocationProfile}
                    </p>
                  </div>

                  {/* Hedef Müşteri */}
                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>Hedef Müşteri</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-snug">
                      {item.marketReality.targetCustomer}
                    </p>
                  </div>

                  {/* Alan */}
                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Store className="w-3.5 h-3.5 text-amber-500" />
                      <span>Alan İhtiyacı</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-snug">
                      {item.setupProfile.minimumSpaceM2 === 0 ? 'Dükkansız (Mobil / Seyyar)' : `${item.setupProfile.minimumSpaceM2} m² Alan`}
                    </p>
                  </div>

                  {/* Personel */}
                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Personel</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-snug">
                      {item.setupProfile.requiredStaffCount === 0 ? 'Personelsiz (Otomat)' : `${item.setupProfile.requiredStaffCount} Kişi`}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ----------------------------------------------------------------------- */}
            {/* SAĞ SÜTUN: 3. & 4. FİNANSAL METRİK + YOL HARİTASI + DEMİRBAŞLAR        */}
            {/* ----------------------------------------------------------------------- */}
            <div className="lg:pl-6 space-y-5">
              
              {/* Sağ 2 Finansal Hücre (Amortisman & Brüt Kâr Marjı) */}
              <div className="grid grid-cols-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden shadow-2xs">
                {/* 3. Amortisman */}
                <div className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Amortisman
                  </span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    {item.financials.paybackPeriodMonths} Ay
                  </div>
                  <span className="text-[10px] text-muted-foreground">Yatırım geri dönüş hızı</span>
                </div>

                {/* 4. Kâr Marjı */}
                <div className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-sky-500" />
                    Brüt Kâr Marjı
                  </span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    %{item.financials.grossMarginPercent}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Hizmet brüt kârlılığı</span>
                </div>
              </div>

              {/* Sağ Bölüm 1: 1. Ay Büyüme ve Uygulama Adımları */}
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Ay Büyüme & Uygulama Planı</span>
                </h3>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex items-start gap-2.5">
                    <span className="text-xs font-black text-amber-500 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">01</span>
                    <div className="text-[11.5px] leading-snug">
                      <strong className="text-slate-900 dark:text-white">Ekipman & Tedarik:</strong> Temel demirbaşların temini, montaj ve ilk saha testleri.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex items-start gap-2.5">
                    <span className="text-xs font-black text-amber-500 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">02</span>
                    <div className="text-[11.5px] leading-snug">
                      <strong className="text-slate-900 dark:text-white">Lokasyon & Anlaşmalar:</strong> {item.marketReality.firstMonthTractionPlan}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex items-start gap-2.5">
                    <span className="text-xs font-black text-amber-500 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">03</span>
                    <div className="text-[11.5px] leading-snug">
                      <strong className="text-slate-900 dark:text-white">Hizmet & Nakit Akışı:</strong> İlk müşteri döngüsü ve aylık hedeflenen ciroya ulaşılması.
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Bölüm 2: Gerekli Temel Ekipman ve Demirbaşlar */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  Gerekli Temel Ekipman ve Demirbaşlar
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.setupProfile.coreEquipments.map((eq) => (
                    <span
                      key={eq}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-[11px] font-semibold border border-slate-200 dark:border-zinc-700"
                    >
                      ✓ {eq}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* 4. ALT AKSİYON VE ONAY ÇUBUĞU                                            */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-200/90 dark:border-zinc-800 p-4 sm:p-5 bg-slate-50/60 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong className="text-slate-800 dark:text-zinc-200">Doğrulanmış Model:</strong> Eylül 2026 piyasa maliyet verileriyle hesaplanmıştır.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp ile Bilgi Al</span>
              </a>

              <Link
                href="/#assistant-section"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <BarChart3 className="w-4 h-4" />
                <span>İş Kurma Asistanında Simüle Et</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

export default TrendIdeaDetailView;
