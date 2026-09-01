'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Percent,
  MapPin,
  Users,
  Rocket,
  Wrench,
  Store,
  UserCheck,
  ChevronRight,
  Zap,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Flame,
} from 'lucide-react';
import { MONTHLY_TREND_IDEAS } from '@/lib/data/monthly-trend-ideas';
import { cn } from '@/lib/utils';

export function HomeTrendBusinessIdeasSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(MONTHLY_TREND_IDEAS[0].id);

  const categories = ['Tümü', 'Otomotiv & Mobil', 'Evcil Hayvan', 'B2B & Kurumsal', 'Hizmet & Otomasyon'];

  const filteredIdeas = selectedCategory === 'Tümü'
    ? MONTHLY_TREND_IDEAS
    : MONTHLY_TREND_IDEAS.filter((item) => item.category === selectedCategory);

  const handleSimulateInCockpit = () => {
    window.location.hash = 'assistant-section';
    const el = document.getElementById('assistant-section') || document.getElementById('cockpit-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCheckGrants = () => {
    window.location.hash = 'grants-section';
    const el = document.getElementById('grants-section') || document.getElementById('cockpit-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="trend-ideas-section" className="w-full">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 sm:p-8 relative overflow-hidden">
          {/* Arka Plan Hafif Vurgu Efekti */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-40 dark:opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.08) 50%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* ========================================================================= */}
          {/* 1. ÜST BAŞLIK & BÜLTEN ROZETİ                                             */}
          {/* ========================================================================= */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                  Aylık Niş Konseptler
                </span>
                <span className="text-xs font-semibold text-muted-foreground hidden sm:inline-block">
                  • 2026 Fizibilite Veritabanı
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Trend & Yeni Nesil <span className="text-amber-500">İş Fikirleri</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-3xl leading-relaxed">
                Uçuk teoriler yerine; sermayesi, amortismanı, aylık net kârı ve operasyonel fizibilitesi hesaplanmış uygulanabilir niş modeller.
              </p>
            </div>

            {/* Sağ Üst Bülten Rozeti */}
            <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 shadow-xs">
                <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
                    Bülten Edisyonu
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    📅 Eylül 2026 Edisyonu
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. KATEGORİ FİLTRE HAPLARI                                                */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] py-4 relative z-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none',
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 3. İŞ FİKİRLERİ KARTLARI (2x2 RESPONSIVE IZGARA)                           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
            {filteredIdeas.map((idea) => {
              const isExpanded = expandedIdeaId === idea.id;

              return (
                <div
                  key={idea.id}
                  className={cn(
                    'rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden',
                    idea.isFeaturedThisMonth
                      ? 'border-amber-400/60 dark:border-amber-500/40 bg-gradient-to-b from-amber-500/[0.03] to-white dark:to-zinc-900/90 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs',
                  )}
                >
                  {/* Kart Başlık & Model Rozetleri */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {idea.isFeaturedThisMonth && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-black bg-amber-500 text-white shadow-xs">
                              <Sparkles className="w-3 h-3 fill-white" />
                              Ayın Öne Çıkanı
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
                            {idea.category}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                            {idea.businessModelBadge}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
                          {idea.title}
                        </h3>
                        <p className="text-xs sm:text-[13px] font-medium text-muted-foreground leading-relaxed">
                          {idea.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Finansal Matris (4 Ana Metrik) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-amber-500" />
                          Min. Sermaye
                        </div>
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                          ₺{idea.financials.minCapital.toLocaleString('tr-TR')}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                        <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Aylık Net Kâr
                        </div>
                        <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                          ₺{idea.financials.monthlyNetProfit.toLocaleString('tr-TR')}
                          <span className="text-[10px] font-normal text-muted-foreground block">
                            (₺{idea.financials.monthlyAvgRevenue.toLocaleString('tr-TR')} Ciro)
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          Amortisman
                        </div>
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {idea.financials.paybackPeriodMonths} Ay
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Percent className="w-3 h-3 text-sky-500" />
                          Kâr Marjı
                        </div>
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                          %{idea.financials.grossMarginPercent}
                        </div>
                      </div>
                    </div>

                    {/* Detay Alanı (Genişletilebilir Fizibilite & Operasyon) */}
                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedIdeaId(isExpanded ? null : idea.id)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 text-xs font-bold text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                          {isExpanded ? 'Fizibilite & Operasyon Detayını Kapat' : 'Fizibilite & Operasyon Detayını Gör'}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          {isExpanded ? 'Gizle ▲' : 'İncele ▼'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="space-y-3.5 pt-1 text-xs text-slate-700 dark:text-zinc-300 animate-in fade-in duration-200">
                          {/* Neden Tutar & Pazar Gerçeği */}
                          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 space-y-2">
                            <div className="flex items-start gap-2">
                              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">Neden Tutar?</span>
                                <p className="text-muted-foreground mt-0.5 leading-relaxed">{idea.marketReality.whyItWorks}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 border-t border-amber-200/40 dark:border-amber-900/20 text-[11.5px]">
                              <div className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span><strong className="text-slate-900 dark:text-white">İdeal Lokasyon:</strong> {idea.marketReality.idealLocationProfile}</span>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <Users className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <span><strong className="text-slate-900 dark:text-white">Hedef Kitle:</strong> {idea.marketReality.targetCustomer}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40 dark:border-amber-900/20 text-[11.5px]">
                              <Rocket className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span><strong className="text-slate-900 dark:text-white">1. Ay Büyüme Planı:</strong> {idea.marketReality.firstMonthTractionPlan}</span>
                            </div>
                          </div>

                          {/* Kurulum Profili */}
                          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-bold">
                              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                                <Store className="w-3.5 h-3.5 text-slate-500" />
                                Alan İhtiyacı: {idea.setupProfile.minimumSpaceM2 === 0 ? 'Dükkansız (Mobil / Seyyar)' : `${idea.setupProfile.minimumSpaceM2} m²`}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                                Personel: {idea.setupProfile.requiredStaffCount === 0 ? 'Personelsiz (Tam Otomat)' : `${idea.setupProfile.requiredStaffCount} Kişi`}
                              </span>
                            </div>

                            <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/50">
                              <div className="text-[10.5px] uppercase font-bold text-muted-foreground flex items-center gap-1 mb-1">
                                <Wrench className="w-3 h-3 text-slate-400" />
                                Temel Ekipman ve Demirbaşlar
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {idea.setupProfile.coreEquipments.map((eq) => (
                                  <span
                                    key={eq}
                                    className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700"
                                  >
                                    ✓ {eq}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aksiyon Alt Çubuğu */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Eylül 2026 Mevzuat & Maliyet Onaylı</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSimulateInCockpit}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <span>İş Kurma Asistanında Simüle Et</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* 4. ALT DİPNOT VE DİĞER MODÜLLERE HIZLI KÖPRÜ                              */}
          {/* ========================================================================= */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground relative z-10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                Her ay piyasa şartları, arz-talep boşlukları ve maliyet endekslerine göre 4 yeni niş konsept güncellenir.
              </span>
            </div>

            <div className="flex items-center gap-3 font-semibold">
              <button
                type="button"
                onClick={handleCheckGrants}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                🏛️ Hibe & Teşviklerini Sorgula →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeTrendBusinessIdeasSection;
