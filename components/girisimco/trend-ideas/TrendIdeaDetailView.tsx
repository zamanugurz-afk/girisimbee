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
  Flame,
} from 'lucide-react';
import { PracticalBusinessIdea } from '@/lib/data/monthly-trend-ideas';
import { cn } from '@/lib/utils';

export function TrendIdeaDetailView({ item }: { item: PracticalBusinessIdea }) {
  const whatsappUrl = `https://wa.me/905321000000?text=${encodeURIComponent(
    `Merhaba, Girişimbee üzerinden "${item.title}" niş iş fikri ve fizibilite modeli hakkında detaylı bilgi ve danışmanlık almak istiyorum.`,
  )}`;

  return (
    <main className="gc-header-offset relative min-h-screen min-w-0 overflow-x-hidden bg-[#FAFBFC] dark:bg-zinc-950">
      <div className="relative mx-auto min-w-0 max-w-5xl px-5 py-6 lg:px-8 lg:py-10">
        
        {/* Üst Geri Dön Barı */}
        <div className="flex items-center justify-between">
          <Link
            href="/trend-fikirler"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 transition-colors hover:text-slate-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Girişimbee Trend Fikirler’e dön
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Seçili Çözüm & İş Birliği
          </span>
        </div>

        {/* Ana İlan Kartı */}
        <div className="mt-6 overflow-hidden rounded-[2.25rem] border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
          
          {/* Üst Büyük Görsel & Hero Banner */}
          <div className="relative w-full aspect-[16/8] sm:aspect-[21/9] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
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
                <Store className="h-14 w-14 opacity-40" aria-hidden />
              </div>
            )}
            
            {/* Karartma Gradyanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Banner Rozetleri */}
            <div className="absolute top-4 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wide shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                SEÇİLİ FIRSAT
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {item.monthEdition} Edisyonu
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Doğrulanmış Partner
                </span>
              </div>
            </div>

            {/* Banner İçi Başlık ve Model Kategorisi */}
            <div className="absolute bottom-5 left-5 sm:left-8 right-5 sm:right-8 text-white">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                {item.category.toUpperCase()} · {item.businessModelBadge.toUpperCase()}
              </span>
              <h1 className="mt-1 text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {item.title}
              </h1>
            </div>
          </div>

          {/* Gövde Detay Alanı */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* Özel Avantaj Banneri */}
            <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 p-5 sm:p-6 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 shadow-sm">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 dark:text-amber-300">
                  Girişimbee Üyelerine Özel Ayrıcalık
                </h3>
                <p className="mt-1 text-sm sm:text-[15px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {item.tagline} Bu modelde dükkan sabit gideri minimize edilmiş ve <strong>{item.financials.paybackPeriodMonths} ayda amortisman</strong> hedeflenmiştir.
                </p>
              </div>
            </div>

            {/* 4'lü Finansal Matris (KPI) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  Min. Sermaye
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  ₺{item.financials.minCapital.toLocaleString('tr-TR')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <div className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Aylık Net Kâr
                </div>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  ₺{item.financials.monthlyNetProfit.toLocaleString('tr-TR')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">₺{item.financials.monthlyAvgRevenue.toLocaleString('tr-TR')} Ciro</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Amortisman
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {item.financials.paybackPeriodMonths} Ay
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Percent className="w-4 h-4 text-sky-500" />
                  Brüt Kâr Marjı
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  %{item.financials.grossMarginPercent}
                </div>
              </div>
            </div>

            {/* Çözüm & Model Hakkında */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Model Hakkında & Pazar Dinamiği</h3>
              <p className="text-[15px] sm:text-base leading-relaxed text-slate-600 dark:text-zinc-400">
                {item.marketReality.whyItWorks}
              </p>
            </div>

            {/* Öne Çıkan Avantajlar Grid */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Öne Çıkan Parametreler</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">İdeal Lokasyon Profili</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-6">
                    {item.marketReality.idealLocationProfile}
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hedef Müşteri Kitlesi</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-6">
                    {item.marketReality.targetCustomer}
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-500 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alan İhtiyacı</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-6">
                    {item.setupProfile.minimumSpaceM2 === 0 ? 'Dükkansız (Mobil / Sahada Hizmet)' : `${item.setupProfile.minimumSpaceM2} m² Kapalı Alan`}
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Personel İhtiyacı</h4>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-6">
                    {item.setupProfile.requiredStaffCount === 0 ? 'Personelsiz (Tam Otomasyon / Otomat)' : `${item.setupProfile.requiredStaffCount} Kişilik Operasyon Ekibi`}
                  </p>
                </div>
              </div>
            </div>

            {/* Nasıl Başlarım? (Adımlar) */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nasıl Başlarım? / 1. Ay Büyüme Planı</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 relative overflow-hidden">
                  <span className="text-2xl font-black text-amber-500/40 dark:text-amber-400/20 absolute top-3 right-3">
                    01
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white relative z-10">Ekipman & Tedarik</h4>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10">
                    Temel demirbaşların temini ve operasyonel testlerin tamamlanması.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 relative overflow-hidden">
                  <span className="text-2xl font-black text-amber-500/40 dark:text-amber-400/20 absolute top-3 right-3">
                    02
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white relative z-10">Lokasyon & Anlaşmalar</h4>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10">
                    {item.marketReality.firstMonthTractionPlan}
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 relative overflow-hidden">
                  <span className="text-2xl font-black text-amber-500/40 dark:text-amber-400/20 absolute top-3 right-3">
                    03
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white relative z-10">Hizmet & Nakit Akışı</h4>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10">
                    İlk müşteri döngüsünün başlatılması ve aylık hedeflenen ciroya ulaşılması.
                  </p>
                </div>
              </div>
            </div>

            {/* Gerekli Temel Ekipmanlar */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 space-y-2.5">
              <div className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-slate-500" />
                Gerekli Temel Ekipman ve Demirbaşlar
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {item.setupProfile.coreEquipments.map((eq) => (
                  <span
                    key={eq}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-zinc-700 shadow-xs"
                  >
                    ✓ {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Alt Aksiyon Butonları */}
            <div className="border-t border-slate-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Doğrulanmış Fizibilite:</span> Eylül 2026 piyasa verileriyle hesaplanmıştır.
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
