'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Scale,
  Building2,
  FileText,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertTriangle,
  Clock,
  Coins,
  ShieldCheck,
  Search,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import {
  LEGAL_APPLICATION_ROADMAPS,
  getSectorLegalRoadmap,
} from '@/features/legal-assistant/data/legal-application-roadmap';
import type {
  SectorLegalRoadmap,
  ApplicationStep,
  RequiredDocumentItem,
} from '@/features/legal-assistant/types/legal-assistant.types';
import { TURKEY_POPULAR_DISTRICTS } from '@/features/radar/config/radar.config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HomeLegalAssistantSection() {
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul (34)');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kadıköy');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('sigorta-acentesi');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedDocs, setCompletedDocs] = useState<Record<string, boolean>>({});

  const availableRoadmaps = useMemo(() => {
    return Object.values(LEGAL_APPLICATION_ROADMAPS);
  }, []);

  const filteredSectors = useMemo(() => {
    let list = availableRoadmaps;
    if (selectedCategoryGroup !== 'Tümü') {
      list = list.filter((item) => item.categoryGroup === selectedCategoryGroup);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.sectorName.toLowerCase().includes(q) ||
          item.categoryGroup.toLowerCase().includes(q) ||
          item.statutoryCapitalRequirement.legalRef.toLowerCase().includes(q),
      );
    }
    return list;
  }, [availableRoadmaps, selectedCategoryGroup, searchQuery]);

  const currentRoadmap: SectorLegalRoadmap = useMemo(() => {
    return getSectorLegalRoadmap(selectedSectorId);
  }, [selectedSectorId]);

  const currentStep: ApplicationStep =
    currentRoadmap.steps[activeStepIndex] || currentRoadmap.steps[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toggleDoc = (docName: string) => {
    setCompletedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  const handleDownloadTemplate = (doc: RequiredDocumentItem) => {
    alert(`📄 "${doc.name}" için 2026 resmi başvuru taslağı hazırlandı ve indiriliyor.`);
  };

  const handlePrintRoadmap = () => {
    window.print();
  };

  return (
    <section
      id="legal-section"
      className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
    >
      {/* 2. ANA HUKUK KOKPİTİ (3 ENTEGRE SÜTUN) */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* ========================================================================= */}
          {/* A. SOL PANEL (SEKTÖR & LOKASYON SEÇİMİ - 3 SÜTUN)                          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-zinc-800 lg:pr-5">
            <div className="space-y-3.5">
              {/* Lokasyon Seçimi */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Kurulum Lokasyonu
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="İstanbul (34)">İstanbul (34)</option>
                    <option value="Ankara (06)">Ankara (06)</option>
                    <option value="İzmir (35)">İzmir (35)</option>
                    <option value="Bursa (16)">Bursa (16)</option>
                    <option value="Antalya (07)">Antalya (07)</option>
                  </select>

                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {TURKEY_POPULAR_DISTRICTS.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sektör Arama & Kategori Sekmeleri */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sektör veya mevzuat ara..."
                    className="w-full h-8 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Kategori Hapları */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10.5px]">
                  {['Tümü', 'Finans & Hizmet', 'Yeme - İçme', 'Kişisel Bakım & Sağlık'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategoryGroup(cat)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer',
                          selectedCategoryGroup === cat
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-zinc-700',
                        )}
                      >
                        {cat}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Sektör Seçim Kartları Listesi */}
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredSectors.map((sector) => {
                  const isSelected = sector.sectorId === selectedSectorId;
                  return (
                    <button
                      key={sector.sectorId}
                      type="button"
                      onClick={() => {
                        setSelectedSectorId(sector.sectorId);
                        setActiveStepIndex(0);
                      }}
                      className={cn(
                        'w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer',
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500/50 shadow-xs'
                          : 'bg-white dark:bg-zinc-800/60 border-slate-200/80 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800',
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{sector.emoji}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block truncate">
                            {sector.sectorName}
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {sector.steps.length} Resmi Adım • {sector.estimatedTotalDays}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 transition-transform',
                          isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400',
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sol Alt Bilgilendirme Kartı */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-[11px] text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>2026 Mevzuat Güvencesi</span>
              </div>
              Tüm kurum harçları, tebliğler ve asgari sermaye şartları Resmi Gazete verileriyle güncel tutulmaktadır.
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. ORTA PANEL (KRONOLOJİK ADIMLAR & GENİŞ REHBER DETAYI - 6 SÜTUN)         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Başlık & Sektör Etiketi */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentRoadmap.emoji}</span>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                      {currentRoadmap.sectorName}
                    </h3>
                    <span className="text-[11px] text-muted-foreground">
                      {selectedCity} - {selectedDistrict} Resmi Başvuru Yol Haritası
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 text-[10.5px] font-bold">
                  {currentRoadmap.categoryGroup}
                </span>
              </div>

              {/* 1. Yatay Kronolojik Adımlar Çubuğu (Tabs) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-zinc-800 no-scrollbar">
                {currentRoadmap.steps.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  return (
                    <button
                      key={step.stepNumber}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700',
                      )}
                    >
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-300 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300',
                        )}
                      >
                        {step.stepNumber}
                      </span>
                      <span className="truncate max-w-[140px]">{step.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* 2. Seçili Adımın Geniş Detay Kartı */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-4">
                {/* Üst Bilgi Rozetleri & Portal Butonu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-zinc-700/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-800 dark:text-blue-300 text-[10.5px] font-bold">
                        🏛️ {currentStep.institution}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[10.5px] font-bold">
                        ⚡ {currentStep.applicationChannel}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[10.5px] font-bold">
                        ⏳ {currentStep.durationDays}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {currentStep.stepNumber}. Adım: {currentStep.title}
                    </h4>
                  </div>

                  {currentStep.portalUrl && (
                    <a
                      href={currentStep.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
                    >
                      <span>Resmi Portala Git</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Hukuki Dayanak */}
                <div className="text-xs flex items-start gap-1.5 text-muted-foreground bg-white dark:bg-zinc-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                  <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mevzuat Dayanağı:</strong> {currentStep.legalBasis}
                  </span>
                </div>

                {/* Gerekli Evraklar (Checklist) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>📋 Gerekli Evraklar & Başvuru Belgeleri</span>
                    <span className="text-[10px] text-muted-foreground">
                      Hazırladıkça işaretleyin
                    </span>
                  </span>

                  <div className="space-y-1.5">
                    {currentStep.requiredDocuments.map((doc, idx) => {
                      const isDone = !!completedDocs[doc.name];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleDoc(doc.name)}
                          className={cn(
                            'p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer select-none',
                            isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                              : 'bg-white dark:bg-zinc-800/90 border-slate-200/80 dark:border-zinc-700',
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                'w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors',
                                isDone
                                  ? 'bg-emerald-500 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-900',
                              )}
                            >
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </span>
                            <span
                              className={cn(
                                'font-medium truncate',
                                isDone
                                  ? 'line-through text-muted-foreground'
                                  : 'text-slate-900 dark:text-zinc-100',
                              )}
                            >
                              {doc.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-bold">
                              {doc.format}
                            </span>
                            {doc.isDownloadableTemplate && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadTemplate(doc);
                                }}
                                className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors text-[10px] font-bold flex items-center gap-1"
                                title="Taslak Şablonu İndir"
                              >
                                <Download className="w-3 h-3" />
                                <span>Şablon</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Süreç Kılavuzu */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                    📌 Adım Adım Nasıl Yapılır?
                  </span>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {currentStep.processGuide.map((guide, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold shrink-0">•</span>
                        <span>{guide}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro-Tips Box */}
                {currentStep.proTips && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <strong className="block font-bold mb-0.5">Kritik Püf Noktası:</strong>
                      {currentStep.proTips}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Orta Panel Alt Adım İlerlemesi */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="h-8 rounded-xl text-xs font-bold"
              >
                ← Önceki Adım
              </Button>

              <span className="text-muted-foreground font-semibold text-[11px]">
                Adım {activeStepIndex + 1} / {currentRoadmap.steps.length}
              </span>

              <Button
                type="button"
                size="sm"
                disabled={activeStepIndex === currentRoadmap.steps.length - 1}
                onClick={() =>
                  setActiveStepIndex((prev) =>
                    Math.min(currentRoadmap.steps.length - 1, prev + 1),
                  )
                }
                className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Sonraki Adım →
              </Button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* C. SAĞ PANEL (MEVZUAT, HARÇ BÜTÇESİ & RESMİ AKSİYON - 3 SÜTUN)             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-zinc-800 lg:pl-5">
            <div className="space-y-3.5">
              {/* 2026 Mevzuat & Asgari Sermaye Kartı */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" /> 2026 Mevzuat Şartı
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold">
                    Resmi Tebliğ
                  </span>
                </div>

                <div>
                  <span className="text-[10.5px] text-muted-foreground block">
                    Asgari Ödenmiş Sermaye / Mal Varlığı
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                    {currentRoadmap.statutoryCapitalRequirement.amount > 0
                      ? formatCurrency(currentRoadmap.statutoryCapitalRequirement.amount)
                      : 'Sermaye Şartı Yok'}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-snug bg-white/80 dark:bg-zinc-800/80 p-2 rounded-xl border border-indigo-500/10">
                  {currentRoadmap.statutoryCapitalRequirement.description}
                </p>
              </div>

              {/* Finansal Harç Özeti & Süre */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] font-semibold text-muted-foreground block">
                    Toplam Resmi Harç
                  </span>
                  <span className="font-black text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">
                    {formatCurrency(currentRoadmap.totalEstimatedLegalCost)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                  <span className="text-[10px] font-semibold text-muted-foreground block">
                    Tahmini Süre
                  </span>
                  <span className="font-black text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">
                    {currentRoadmap.estimatedTotalDays}
                  </span>
                </div>
              </div>

              {/* Adım Bazlı Harç Dökümü Tablosu */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Adım Bazlı Harç Dökümü
                </span>
                <div className="space-y-1 text-xs max-h-[140px] overflow-y-auto pr-1">
                  {currentRoadmap.steps.map((s) => (
                    <div
                      key={s.stepNumber}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {s.stepNumber}. {s.title}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {formatCurrency(s.estimatedCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sağ Panel Alt Aksiyon Butonları */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                type="button"
                onClick={handlePrintRoadmap}
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Yol Haritasını PDF İndir</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  alert(
                    `📄 "${currentRoadmap.sectorName}" için 2026 Ana Sözleşme, Kira Damga Vergisi ve Belediye Ruhsat Şablon Paketi hazırlandı.`,
                  )
                }
                className="w-full h-9 rounded-xl border-slate-200 dark:border-zinc-700 text-xs font-bold text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <span>Hazır Sözleşme Paketini Al</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeLegalAssistantSection;
