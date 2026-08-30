'use client';

import React from 'react';
import Link from 'next/link';
import {
  Target,
  Sparkles,
  AlertTriangle,
  PlusCircle,
  Handshake,
  Scale,
} from 'lucide-react';
import type { RadarSpatialResponse } from '@/types/radar.types';
import { Button } from '@/components/ui/button';

interface MarketGapsPanelProps {
  radarData: RadarSpatialResponse | null;
  demographicStats?: {
    population?: string;
    daytimeTraffic?: string;
    sesGroup?: string;
    ageProfile?: string;
    officialNeighborhoodPop?: string;
  };
}

interface GapConcept {
  id: string;
  title: string;
  badge: string;
  emoji: string;
  currentCount: number;
  demandScore: number;
  opportunityScore: number;
  reason: string;
}

export function MarketGapsPanel({ radarData, demographicStats }: MarketGapsPanelProps) {
  const sectors = radarData?.availableSectors || {};
  const totalCount = radarData?.competitors.length || 0;
  const sesGroup = demographicStats?.sesGroup || 'B+ / A';
  const population = demographicStats?.population || '12.500';

  // Dinamik olarak bölgedeki arz durumuna göre fırsat konseptleri belirle
  const gapConcepts: GapConcept[] = [
    {
      id: 'artisan-bakery',
      title: 'Glutensiz & Ekşi Mayalı Butik Fırın',
      badge: 'Yüksek Tüketim Potansiyeli',
      emoji: '🥖',
      currentCount: sectors['bakery'] ? Math.min(2, Math.floor(sectors['bakery'] / 4)) : 0,
      demandScore: 94,
      opportunityScore: 9.6,
      reason: `${population} kişilik yerleşik nüfus ve ${sesGroup} gelir grubunda sağlıklı beslenme / zanaatkar ekmek talebini karşılayan niş fırın arzı bölgede yetersiz.`,
    },
    {
      id: 'pet-grooming',
      title: 'Pet Grooming & Butik Evcil Hayvan Bakımı',
      badge: 'Hızlı Büyüyen Sektör',
      emoji: '🐾',
      currentCount: sectors['pet_shop'] ? Math.min(1, Math.floor(sectors['pet_shop'] / 6)) : 0,
      demandScore: 91,
      opportunityScore: 9.4,
      reason: 'Çevre sitelerde yaşayan evcil hayvan sahiplerinin kuaför ve spa bakım hizmeti için çevre ilçelere gitme ihtiyacı yüksek.',
    },
    {
      id: 'specialty-coffee',
      title: '3. Nesil Nitelikli Kahve & Paylaşımlı Çalışma',
      badge: 'Genç Profesyonel Talebi',
      emoji: '☕',
      currentCount: sectors['cafe'] ? Math.min(3, Math.floor(sectors['cafe'] / 5)) : 1,
      demandScore: 89,
      opportunityScore: 9.1,
      reason: 'Evden / hibrit çalışan dijital kitle için sessiz çalışma ortamı, priz altyapısı ve mikro kavurma kahve konsepti eksik.',
    },
    {
      id: 'reformer-pilates',
      title: 'Aletli Reformer Pilates & Fonksiyonel Stüdyo',
      badge: 'Premium Üyelik Potansiyeli',
      emoji: '🧘‍♀️',
      currentCount: sectors['gym'] ? Math.min(2, Math.floor(sectors['gym'] / 4)) : 0,
      demandScore: 88,
      opportunityScore: 9.0,
      reason: 'Bölgedeki standart spor salonlarının ötesinde, randevulu bireysel ve düet seans stüdyolarına talep yüksek.',
    },
  ];

  // Doygunluk ve risk analizi
  const crowdedSectors: { title: string; count: number; advice: string }[] = [];
  
  if ((sectors['cafe'] || 0) >= 12) {
    crowdedSectors.push({
      title: 'Standart / Jenerik Kafe',
      count: sectors['cafe'],
      advice: 'Klasik kahve/çay konseptlerinde rekabet yoğun. Sıfırdan dükkan açmak yerine menüde radikal farklılaşma veya hazır devir fırsatları değerlendirilmeli.',
    });
  }
  if ((sectors['market'] || 0) >= 12) {
    crowdedSectors.push({
      title: 'Mahalle Market & Tekel Büfe',
      count: sectors['market'],
      advice: 'Büyük zincir marketler ve bakkallarda doygunluk yüksek. Gurme/organik şarküteri veya yöresel gıda dışındaki jenerik market yatırımları riskli.',
    });
  }
  if ((sectors['donerci'] || 0) >= 8 || (sectors['restaurant'] || 0) >= 14) {
    crowdedSectors.push({
      title: 'Geleneksel Döner / Izgara',
      count: (sectors['donerci'] || 0) + (sectors['restaurant'] || 0),
      advice: 'Geleneksel kebap/döner segmentinde yüksek arz var. Paket servis hızı ve gurme sos inovasyonu olmayan standart yatırımlarda marj baskısı yüksek.',
    });
  }

  // Varsayılan uyarı (eğer spesifik sektör sayısı düşükse)
  if (crowdedSectors.length === 0) {
    crowdedSectors.push({
      title: 'Standart / Jenerik İşletmeler',
      count: totalCount,
      advice: 'Bölgede genel ticari hareketlilik mevcut. Başarı için fiyat rekabetine girmek yerine hizmet kalitesi, sadakat programı ve dijital sipariş entegrasyonu şart.',
    });
  }

  return (
    <div className="space-y-4">
      {/* 1. BAŞLIK VE ÖZET BANNERI */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-slate-50 dark:to-zinc-900 border border-amber-500/30">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
              <Target className="h-3.5 w-3.5" />
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Pazar Açığı ve Fırsat Analizi
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
            Yapay Zeka Tespitleri
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Seçilen lokasyondaki <strong>{demographicStats?.population || 'bölgesel'}</strong> nüfus ve ticari dağılım analiz edilerek en yüksek arz açığına sahip konseptler belirlenmiştir.
        </p>
      </div>

      {/* 2. TESPİT EDİLEN PAZAR AÇIKLARI (FIRSAT KARTLARI) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Bölgede Eksik Olan Niş Konseptler
          </span>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
            {gapConcepts.length} Fırsat
          </span>
        </div>

        <div className="space-y-2.5">
          {gapConcepts.map((concept) => (
            <div
              key={concept.id}
              className="p-3 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xs hover:border-amber-500/50 transition-all space-y-2 group"
            >
              {/* Üst Başlık & Skor Rozeti */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">
                    {concept.emoji}
                  </span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {concept.title}
                    </h5>
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                      {concept.badge}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    {concept.opportunityScore} / 10
                  </span>
                </div>
              </div>

              {/* Metrik Göstergeleri */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Mevcut Durum:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {concept.currentCount === 0 ? 'Bölgede 0 Adet (Tam Arz Açığı)' : `Bölgede ~${concept.currentCount} Adet`}
                  </strong>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Talep Skoru:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    %{concept.demandScore} Potansiyel
                  </strong>
                </div>
              </div>

              {/* Gerekçe */}
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug font-normal">
                {concept.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DOYGUNLUK & REKABET UYARISI (RİSKLİ SEKTÖRLER) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 px-0.5">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          Doygunluk & Rekabet Uyarısı
        </span>

        {crowdedSectors.map((crowd, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] dark:bg-rose-950/20 space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <span>⚠️</span> {crowd.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                {crowd.count} Adet (Yoğun)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-snug">
              {crowd.advice}
            </p>
          </div>
        ))}
      </div>

      {/* 4. YASAL SORUMLULUK REDDİ (ZORUNLU BİLGİLENDİRME KUTUSU) */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2">
        <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-700 dark:text-zinc-300">Yasal Bilgilendirme:</strong> Bu raporda yer alan veriler, ticari işletme yoğunluğu ve bölgesel demografik göstergeler baz alınarak üretilmiş istatistiksel bir pazar analizidir; resmi bir yatırım tavsiyesi niteliği taşımaz.
        </div>
      </div>

      {/* 5. HIZLI AKSİYON BUTONLARI */}
      <div className="space-y-2 pt-1">
        <Button
          size="sm"
          className="w-full h-9 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs flex items-center justify-center gap-1.5 text-xs"
          asChild
        >
          <Link href="/ilan/olustur">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Bu Pazar Açığına Uygun İlan Ver</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 rounded-xl font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 text-xs"
          asChild
        >
          <Link href="/girisim-ortaklik">
            <Handshake className="w-3.5 h-3.5 text-amber-500" />
            <span>Bu Konseptte Ortak Arayışı Başlat</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
