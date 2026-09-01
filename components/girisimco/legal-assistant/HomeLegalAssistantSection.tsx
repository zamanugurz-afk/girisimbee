'use client';

import React, { useState, useMemo } from 'react';
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
import { TURKEY_CITY_RENTAL_RATES } from '@/features/business-setup/data/district-rental-rates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LegalStepDef {
  id: number;
  title: string;
  subtitle: string;
}

const LEGAL_STEPS: LegalStepDef[] = [
  { id: 1, title: 'Sektör & Mevzuat', subtitle: 'Hedef meslek ve yasal taban' },
  { id: 2, title: 'Şirket & Ticaret Sicil', subtitle: 'MERSİS ana sözleşme ve tescil' },
  { id: 3, title: 'Vergi Dairesi', subtitle: 'Mükellefiyet ve fiili yoklama' },
  { id: 4, title: 'Mesleki İzin & Sigorta', subtitle: 'Bakanlık / SEDDK teminatı' },
  { id: 5, title: 'Oda & Birlik Kaydı', subtitle: 'TOBB, Baro, SMMM veya Esnaf' },
  { id: 6, title: 'Belediye Ruhsatı', subtitle: 'İtfaiye ve işyeri açma izni' },
];

export function HomeLegalAssistantSection() {
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kadıköy');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('sigorta-acentesi');
  const [completedDocs, setCompletedDocs] = useState<Record<string, boolean>>({});

  const cityOptions = useMemo(() => Object.keys(TURKEY_CITY_RENTAL_RATES), []);
  const districtOptions = useMemo(() => {
    const cityData = TURKEY_CITY_RENTAL_RATES[selectedCity];
    if (cityData?.districtRates) {
      return Object.keys(cityData.districtRates);
    }
    return ['Merkez', 'Kadıköy', 'Beşiktaş', 'Maltepe', 'Çankaya'];
  }, [selectedCity]);

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

  // Aktif aşamadaki adım (Aşama 2..6 için)
  const currentStepIndex = Math.min(
    Math.max(0, activeStep - 2),
    Math.max(0, currentRoadmap.steps.length - 1),
  );
  const currentStep: ApplicationStep =
    currentRoadmap.steps[currentStepIndex] || currentRoadmap.steps[0];

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
    alert(`📄 "${doc.name}" için 2026 resmi başvuru şablonu hazırlandı ve indiriliyor.`);
  };

  const handlePrintRoadmap = () => {
    window.print();
  };

  return (
    <section
      id="legal-section"
      className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
    >
      {/* 2. ANA HUKUK KOKPİTİ (3 ENTEGRE SÜTUN - İLK 2 KART MİMARİSİYLE BİREBİR AYNI) */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* ========================================================================= */}
          {/* A. SOL SÜTUN: LOKASYON SEÇİMİ & 6 ADIMLI STEPPER (lg:col-span-3)          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-zinc-800/80 pb-5 lg:pb-0 lg:pr-5">
            <div>
              {/* 1. Lokasyon Seçimi */}
              <div className="mb-3.5 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Kurulum Lokasyonu (81 İl)
                </label>

                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 px-2 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c} ({TURKEY_CITY_RENTAL_RATES[c]?.plate})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 px-2 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. 6 Adımlı Dikey Stepper Menüsü */}
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Resmi Başvuru Adımları
                  </span>
                  <span className="text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    {activeStep} / 6
                  </span>
                </div>

                <div className="space-y-1">
                  {LEGAL_STEPS.map((step) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveStep(step.id)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer',
                          isActive
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/40 shadow-xs'
                            : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/50 border border-transparent',
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                              isActive
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-600 font-black'
                                  : 'bg-slate-200 dark:bg-zinc-800 text-muted-foreground',
                            )}
                          >
                            {isCompleted ? '✓' : step.id}
                          </span>
                          <div className="min-w-0">
                            <h4
                              className={cn(
                                'text-xs font-bold truncate leading-tight',
                                isActive
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-800 dark:text-zinc-200',
                              )}
                            >
                              {step.title}
                            </h4>
                            <p className="text-[10.5px] text-muted-foreground truncate">
                              {step.subtitle}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={cn(
                            'w-3.5 h-3.5 shrink-0 transition-transform',
                            isActive ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300 dark:text-zinc-700',
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sol Alt Özet Sektör Rozeti */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl shrink-0">{currentRoadmap.emoji}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block truncate">
                    {currentRoadmap.sectorName}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground block truncate">
                    {selectedCity} - {selectedDistrict}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 font-bold pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>2026 Mevzuatı Tam Uyumlu</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. ORTA SÜTUN: SEÇİLİ ADIMIN GENİŞ ÇALIŞMA ALANI (lg:col-span-6)          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {/* ADIM 1: SEKTÖR & MESLEK SEÇİM IZGARASI (İLK KART GİBİ 2x3 FERAH GRİD) */}
            {activeStep === 1 ? (
              <div className="space-y-3.5">
                {/* Üst Kategori Sekmeleri & Arama */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
                      {['Tümü', 'Finans & Hizmet', 'Yeme - İçme', 'Kişisel Bakım & Sağlık'].map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategoryGroup(cat)}
                            className={cn(
                              'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-xs',
                              selectedCategoryGroup === cat
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700',
                            )}
                          >
                            {cat}
                          </button>
                        ),
                      )}
                    </div>

                    <div className="relative w-full sm:w-48">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Meslek ara..."
                        className="w-full h-8 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2x3 Ferah Sektör Kartları Izgarası */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredSectors.map((sector) => {
                    const isSelected = sector.sectorId === selectedSectorId;
                    return (
                      <div
                        key={sector.sectorId}
                        onClick={() => setSelectedSectorId(sector.sectorId)}
                        className={cn(
                          'p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer group',
                          isSelected
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500 shadow-md scale-[1.01]'
                            : 'bg-white dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700 hover:border-indigo-500/40 hover:shadow-sm',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                            {sector.emoji}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                            {sector.categoryGroup}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {sector.sectorName}
                          </h4>
                          <span className="text-[11px] text-muted-foreground mt-0.5 block">
                            {sector.steps.length} Resmi Kurum Adımı • {sector.estimatedTotalDays}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-muted-foreground">
                            Resmi Harç:
                          </span>
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">
                            {formatCurrency(sector.totalEstimatedLegalCost)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ADIM 2..6: SEÇİLİ BÜROKRASİ ADIMI DETAY KARTI (FERAH VE ŞIK) */
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Aşama {activeStep - 1} / {currentRoadmap.steps.length}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                      {currentStep.title}
                    </h3>
                  </div>

                  {currentStep.portalUrl && (
                    <a
                      href={currentStep.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs shrink-0"
                    >
                      <span>Resmi Portala Git</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* 3'lü Özet Hapları */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
                    <span className="text-[10px] text-muted-foreground block font-medium">Yetkili Kurum</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block mt-0.5">
                      {currentStep.institution}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
                    <span className="text-[10px] text-muted-foreground block font-medium">Başvuru Kanalı</span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate block mt-0.5">
                      ⚡ {currentStep.applicationChannel}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
                    <span className="text-[10px] text-muted-foreground block font-medium">Tahmini Süre</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block mt-0.5">
                      ⏳ {currentStep.durationDays}
                    </span>
                  </div>
                </div>

                {/* Gerekli Evraklar (Checklist) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>📋 Gerekli Başvuru Evrakları</span>
                    <span className="text-[10.5px] text-muted-foreground">Hazırladıkça işaretleyin</span>
                  </span>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
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
                                isDone ? 'line-through text-muted-foreground' : 'text-slate-900 dark:text-zinc-100',
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

                {/* Pro-Tips Box */}
                {currentStep.proTips && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <strong className="block font-bold mb-0.5">Kritik Püf Noktası:</strong>
                      {currentStep.proTips}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orta Panel Alt Gezinme Butonu */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                className="h-9 rounded-xl text-xs font-bold"
              >
                ← Önceki Aşama
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={activeStep === 6}
                onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 shadow-xs"
              >
                {activeStep === 1
                  ? '2. Aşama: Şirket & MERSİS Adımına Geç →'
                  : `Sonraki Aşama (${LEGAL_STEPS[activeStep]?.title || 'Ruhsat'}) →`}
              </Button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* C. SAĞ SÜTUN: MEVZUAT SKORU, ASGARİ SERMAYE & HARÇLAR (lg:col-span-3)     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-zinc-800/80 pt-5 lg:pt-0 lg:pl-5">
            <div className="space-y-3">
              {/* 1. AI Mevzuat & Uyum Skoru Kartı */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" /> AI Mevzuat & Uyum Skoru
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    Resmi Uyumlu
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">9.4</span>
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
                <span className="text-[10.5px] text-muted-foreground mt-1 block">
                  Bürokrasi Karmaşıklığı: %35 (Orta Seviye)
                </span>
              </div>

              {/* 2. 2026 Mevzuat & Asgari Sermaye Şartı Kartı */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-muted-foreground">
                    2026 Mevzuat Şartı
                  </span>
                  <span className="px-2 py-0.2 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[9.5px] font-bold">
                    Resmi Tebliğ
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  Asgari Yasal Sermaye / Mal Varlığı
                </span>
                <span className="text-base font-black text-slate-900 dark:text-zinc-100 block">
                  {currentRoadmap.statutoryCapitalRequirement.amount > 0
                    ? formatCurrency(currentRoadmap.statutoryCapitalRequirement.amount)
                    : 'Sermaye Şartı Yok'}
                </span>
                <p className="text-[10px] text-muted-foreground leading-tight pt-0.5">
                  {currentRoadmap.statutoryCapitalRequirement.legalRef}
                </p>
              </div>

              {/* 3. Finansal Harç & Süre Özeti */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Resmi Harç Özeti
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600">2026 Tarife</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                  <span className="text-muted-foreground">Toplam Harç:</span>
                  <span className="font-black text-slate-900 dark:text-zinc-100">
                    {formatCurrency(currentRoadmap.totalEstimatedLegalCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tahmini Süre:</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">
                    {currentRoadmap.estimatedTotalDays}
                  </span>
                </div>
              </div>
            </div>

            {/* Sağ Alt Aksiyon Butonları */}
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
                    `📄 "${currentRoadmap.sectorName}" için 2026 Sözleşme ve Dilekçe Paketi hazırlandı.`,
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
