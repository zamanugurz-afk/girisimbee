'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Search,
  Coins,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Sparkles,
  ChevronRight,
  Zap,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import {
  TRENDING_BUSINESS_IDEAS,
  filterBusinessIdeas,
} from '@/features/business-ideas/data/trending-business-ideas';
import type {
  BusinessIdea,
  CapitalTier,
  WorkStyle,
} from '@/features/business-ideas/types/business-ideas.types';
import { BusinessIdeaDetailModal } from '@/components/girisimco/business-ideas/BusinessIdeaDetailModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HomeBusinessIdeasSection() {
  const [selectedCapitalTier, setSelectedCapitalTier] = useState<string>('all');
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'popular' | 'lowest_capital' | 'highest_earning' | 'fastest_income'
  >('popular');

  // Modal State
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filtrelenmiş Fikirler
  const filteredIdeas = useMemo(() => {
    return filterBusinessIdeas({
      capitalTier: selectedCapitalTier,
      workStyle: selectedWorkStyle,
      category: selectedCategory,
      searchQuery,
      sortBy,
    });
  }, [
    selectedCapitalTier,
    selectedWorkStyle,
    selectedCategory,
    searchQuery,
    sortBy,
  ]);

  const handleOpenDetail = (idea: BusinessIdea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 lg:px-8 py-8 sm:py-12">
      {/* ========================================================================= */}
      {/* 1. BÖLÜM BAŞLIĞI                                                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Yeni Nesil & Pratik İş Fikirleri</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Ek Gelir ve Yeni Girişim Fırsatları
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            Sıfır veya düşük sermayeyle hemen başlanabilecek; akşamları, hafta sonları ek gelir sağlayan veya tam zamanlı sıcak nakit üreten gerçekçi iş modelleri.
          </p>
        </div>

        <Link
          href="/yeni-is-fikirleri"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors group shrink-0"
        >
          <span>Tüm Fikirleri Keşfet ({TRENDING_BUSINESS_IDEAS.length})</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 2. İNTERAKTİF FİLTRELEME & ARAMA KONTROL PANELİ                             */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4 mb-8">
        {/* Üst Satır: Arama ve Sıralama */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İş fikri, alet veya sektör ara (Örn: koltuk yıkama, Google harita, 3D yazıcı...)"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-full sm:w-auto"
            >
              <option value="popular">🔥 En Çok İlgi Görenler</option>
              <option value="lowest_capital">💰 En Düşük Sermayeli</option>
              <option value="highest_earning">📈 En Yüksek Aylık Kazanç</option>
              <option value="fastest_income">⚡ En Hızlı İlk Gelir</option>
            </select>
          </div>
        </div>

        {/* Alt Satır: Sermaye ve Çalışma Şekli Hapları */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
          {/* Sermaye Filtresi */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Sermaye:
            </span>
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'micro', label: '0 - 15.000 ₺ (Sıfır / Mikro)' },
              { id: 'low', label: '15.000 - 60.000 ₺ (Düşük)' },
              { id: 'medium', label: '60.000 - 200.000 ₺ (Orta)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCapitalTier(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-bold transition-all text-xs',
                  selectedCapitalTier === tab.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Çalışma Şekli Filtresi */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Çalışma Şekli:
            </span>
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'after_hours', label: '🌙 Mesai Sonrası & Hafta Sonu' },
              { id: 'mobile', label: '🚗 Sahada & Mobil' },
              { id: 'home', label: '🏡 Evden / Atölyeden' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedWorkStyle(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-bold transition-all text-xs',
                  selectedWorkStyle === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FİKİR KARTLARI IZGARASI (BENTO GRID)                                    */}
      {/* ========================================================================= */}
      {filteredIdeas.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            Seçilen filtrelere uygun iş fikri bulunamadı
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Filtreleri sıfırlayarak tüm pratik iş fikirlerini görüntüleyebilirsiniz.
          </p>
          <Button
            type="button"
            onClick={() => {
              setSelectedCapitalTier('all');
              setSelectedWorkStyle('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-8 px-4"
          >
            Filtreleri Sıfırla
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => handleOpenDetail(idea)}
              className="group relative p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 hover:border-amber-500/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Kart Üst Kısım */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {idea.emoji}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10.5px] font-bold">
                      {idea.workStyleLabel}
                    </span>
                    {idea.trendBadge && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {idea.trendBadge}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {idea.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                  {idea.tagline}
                </p>
              </div>

              {/* Kart Alt Kısım / Metrikler ve Buton */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                    <span className="text-[10px] font-semibold text-muted-foreground block">
                      Gerekli Sermaye
                    </span>
                    <span className="font-black text-slate-900 dark:text-zinc-100 text-xs mt-0.5 block">
                      {idea.capitalRange.formatted}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30">
                    <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                      Aylık Potansiyel
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300 text-xs mt-0.5 block">
                      {idea.potentialMonthlyEarnings.formatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> İlk Gelir: {idea.timeToFirstIncome}
                  </span>

                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                    <span>Kılavuzu Gör</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ALT BİLGİLENDİRME BANNERI                                              */}
      {/* ========================================================================= */}
      <div className="mt-10 p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-blue-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-xs">
          <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
            💡
          </span>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
              Hangi iş fikrinin size en uygun olduğunu mu merak ediyorsunuz?
            </h4>
            <p className="text-muted-foreground mt-0.5">
              Yukarıdaki sermaye ve çalışma şekli filtrelerini kullanarak bütçenize göre hemen başlayabileceğiniz modelleri keşfedin.
            </p>
          </div>
        </div>

        <Link
          href="/yeni-is-fikirleri"
          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 px-5 flex items-center justify-center shrink-0 shadow-xs transition-colors"
        >
          Tüm 16+ Modeli İncele
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 5. DETAY BLUEPRINT MODALI                                                 */}
      {/* ========================================================================= */}
      <BusinessIdeaDetailModal
        idea={selectedIdea}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
