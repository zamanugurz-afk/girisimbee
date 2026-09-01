'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  FileCheck2,
  Printer,
  Copy,
  Check,
  X,
  PartyPopper,
  FileBadge,
} from 'lucide-react';
import {
  ALL_LEGAL_ROADMAPS,
  LEGAL_APPLICATION_ROADMAPS,
  getSectorLegalRoadmap,
} from '@/features/legal-assistant/data/legal-application-roadmap';
import { getMasterSectorById } from '@/features/common/master-sectors-registry';
import type {
  SectorLegalRoadmap,
  ApplicationStep,
  RequiredDocumentItem,
  DocumentTemplateContent,
} from '@/features/legal-assistant/types/legal-assistant.types';
import { TURKEY_CITY_RENTAL_RATES } from '@/features/business-setup/data/district-rental-rates';
import { useUnifiedCockpit } from '@/features/common/context/UnifiedCockpitContext';
import { getRegulatoryBadgeText } from '@/features/common/config/market-version.config';
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

function downloadTextFile(filename: string, text: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([text], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildDetailedTemplate(
  doc: RequiredDocumentItem,
  roadmap: SectorLegalRoadmap,
  city: string,
  district: string,
): DocumentTemplateContent {
  if (doc.templateContent) {
    return doc.templateContent;
  }

  const docName = doc.name;
  return {
    title: `T.C. RESMİ ${docName.toUpperCase()} TASLAĞI`,
    authority: `${city.toUpperCase()} / ${district.toUpperCase()} YETKİLİ RESMİ MERCİİ`,
    docType: docName,
    summary: `${roadmap.sectorName} faaliyeti kapsamında 2026 mevzuatı gereği sunulması zorunlu resmi "${docName}" format örneği ve başvuru metnidir.`,
    sections: [
      {
        heading: 'Madde 1 - Başvuru Sahibi ve İşletme Bilgileri',
        body: `İşletme Unvanı: [İŞLETME UNVANI] | Sektör: ${roadmap.sectorName} | Lokasyon: ${district} / ${city} | NACE Kodu: İlgili Mesleki Faaliyet`,
      },
      {
        heading: 'Madde 2 - Yasal Dayanak ve İlgili Mevzuat',
        body: `İşbu belge, 6102 sayılı Türk Ticaret Kanunu, 5362 sayılı Esnaf Kanunu ve ${roadmap.statutoryCapitalRequirement.legalRef || 'ilgili mesleki mevzuat'} hükümlerine istinaden düzenlenmiştir.`,
      },
      {
        heading: 'Madde 3 - Standartlar ve Yasal Taahhütler',
        body: `İşletme bünyesinde 2026 yılı resmi yangın güvenliği, hijyen şartları, çevre/atıksu izinleri ve mesleki yeterlilik kriterlerinin eksiksiz sağlandığı, yapılacak denetimlerde aksi tespit edilmediği sürece sorumluluğun işletme yetkilisine ait olduğu taahhüt olunur.`,
      },
      {
        heading: 'Madde 4 - Hüküm ve İbraz',
        body: `İşbu evrak ${city} ili yetkili kurum ve kuruluşları nezdinde yürütülecek resmi işlemlerde geçerli olmak üzere tanzim ve imza edilmiştir.`,
      },
    ],
    signers: [
      'İşletme Yetkilisi / Şirket Müdürü (İmza - Kaşe)',
      `${district} Ruhsat & Sicil Onay Yetkilisi (Mühür)`,
    ],
    legalDisclaimer: 'İşbu belge Girişimbee 2026 Mevzuat Kılavuzu tarafından üretilmiş resmi örnek taslaktır. İlgili kuruma sunulmadan önce fiili işletme ve kimlik bilgileri doldurulmalıdır.',
  };
}

export function HomeLegalAssistantSection() {
  const {
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    selectedSectorId,
    setSelectedSectorId,
    selectedCategoryGroup,
    setSelectedCategoryGroup,
  } = useUnifiedCockpit();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sectorPage, setSectorPage] = useState<number>(1);
  const [completedDocs, setCompletedDocs] = useState<Record<string, boolean>>({});
  const [focusedDocId, setFocusedDocId] = useState<string | null>(null);

  // Modallar
  const [activeTemplateDoc, setActiveTemplateDoc] = useState<RequiredDocumentItem | null>(null);
  const [showRoadmapPrintModal, setShowRoadmapPrintModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const cityOptions = useMemo(() => Object.keys(TURKEY_CITY_RENTAL_RATES), []);
  const districtOptions = useMemo(() => {
    const cityData = TURKEY_CITY_RENTAL_RATES[selectedCity];
    if (cityData?.districtRates) {
      return Object.keys(cityData.districtRates);
    }
    return ['Merkez', 'Kadıköy', 'Beşiktaş', 'Maltepe', 'Çankaya'];
  }, [selectedCity]);

  const availableRoadmaps = useMemo(() => {
    return ALL_LEGAL_ROADMAPS;
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

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredSectors.length / itemsPerPage) || 1;
  const paginatedSectors = useMemo(() => {
    const start = (sectorPage - 1) * itemsPerPage;
    return filteredSectors.slice(start, start + itemsPerPage);
  }, [filteredSectors, sectorPage]);

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

  // Adım değiştiğinde odaklanan dökümanı sıfırla veya ilk dökümana odakla
  useEffect(() => {
    if (currentStep?.requiredDocuments?.length > 0) {
      setFocusedDocId(currentStep.requiredDocuments[0].id);
    }
  }, [activeStep, selectedSectorId, currentStep?.requiredDocuments]);

  // Aktif odaklanan döküman
  const activeFocusedDoc = useMemo(() => {
    if (!currentStep?.requiredDocuments) return null;
    return (
      currentStep.requiredDocuments.find((d) => d.id === focusedDocId) ||
      currentStep.requiredDocuments[0] ||
      null
    );
  }, [currentStep, focusedDocId]);

  // Tüm evraklar işaretli mi?
  const isCurrentStepAllChecked = useMemo(() => {
    if (!currentStep?.requiredDocuments || currentStep.requiredDocuments.length === 0) return false;
    return currentStep.requiredDocuments.every(
      (d) => completedDocs[d.id] || completedDocs[d.name],
    );
  }, [currentStep, completedDocs]);

  // Tüm yol haritasındaki evraklar tamamlandı mı?
  const isTotalRoadmapCompleted = useMemo(() => {
    const allDocs = currentRoadmap.steps.flatMap((s) => s.requiredDocuments);
    if (allDocs.length === 0) return false;
    return allDocs.every((d) => completedDocs[d.id] || completedDocs[d.name]);
  }, [currentRoadmap, completedDocs]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toggleDoc = (doc: RequiredDocumentItem) => {
    setFocusedDocId(doc.id);
    setCompletedDocs((prev) => {
      const nextState = !prev[doc.id];
      return {
        ...prev,
        [doc.id]: nextState,
        [doc.name]: nextState,
      };
    });
  };

  const handleOpenTemplateModal = (doc: RequiredDocumentItem) => {
    const templ = buildDetailedTemplate(doc, currentRoadmap, selectedCity, selectedDistrict);
    setActiveTemplateDoc({
      ...doc,
      templateContent: templ,
    });
  };

  const handleCopyTemplateText = (content: DocumentTemplateContent) => {
    const fullText = `${content.title}\n${content.authority}\n\n${content.summary}\n\n` +
      content.sections.map((s) => `${s.heading}\n${s.body}`).join('\n\n') +
      `\n\nİmzalayanlar: ${content.signers.join(', ')}\n\n${content.legalDisclaimer}`;

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadDocFile = (doc: RequiredDocumentItem) => {
    const content = doc.templateContent || buildDetailedTemplate(doc, currentRoadmap, selectedCity, selectedDistrict);
    const fullText = `========================================================================\n` +
      `${content.authority}\n` +
      `${content.title}\n` +
      `RESMI ORNEK TASLAK - 2026 GIRISIMBEE\n` +
      `========================================================================\n\n` +
      `OZET:\n${content.summary}\n\n` +
      `MADDELER VE HUKUKI DETAYLAR:\n` +
      content.sections.map((s) => `[${s.heading}]\n${s.body}`).join('\n\n') +
      `\n\nIMZA VE TASDIK YETKILILERI:\n` +
      content.signers.map((sig) => `* ${sig}`).join('\n') +
      `\n\nYASAL UYARI:\n${content.legalDisclaimer}\n`;

    const sanitizedName = doc.name.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
    downloadTextFile(`${sanitizedName}_resmi_taslak.doc`, fullText);
  };

  const handleDownloadRoadmapReport = () => {
    const reportText = `========================================================================\n` +
      `GIRISIMBEE - 2026 RESMI BASVURU VE HUKUK YOL HARITASI RAPORU\n` +
      `Sektor: ${currentRoadmap.sectorName} (${currentRoadmap.categoryGroup})\n` +
      `Lokasyon: ${selectedCity} / ${selectedDistrict}\n` +
      `Tarih: ${new Date().toLocaleDateString('tr-TR')}\n` +
      `========================================================================\n\n` +
      `OZET METRIKLER:\n` +
      `- Toplam Tahmini Harc: ${formatCurrency(currentRoadmap.totalEstimatedLegalCost)}\n` +
      `- Tahmini Islem Suresi: ${currentRoadmap.estimatedTotalDays}\n` +
      `- Asgari Sermaye Tabani: ${currentRoadmap.statutoryCapitalRequirement.amount > 0 ? formatCurrency(currentRoadmap.statutoryCapitalRequirement.amount) : 'Sermaye Sarti Yok'}\n` +
      `- Yasal Dayanak: ${currentRoadmap.statutoryCapitalRequirement.legalRef}\n\n` +
      `RESMI BASVURU ASAMALARI:\n` +
      currentRoadmap.steps.map((s) => {
        return `------------------------------------------------------------------------\n` +
          `ASAMA ${s.stepNumber}: ${s.title.toUpperCase()}\n` +
          `Yetkili Kurum: ${s.institution}\n` +
          `Basvuru Kanali: ${s.applicationChannel}\n` +
          `Tahmini Harc: ${formatCurrency(s.estimatedCost)} | Sure: ${s.durationDays}\n` +
          `Mevzuat Dayanak: ${s.legalBasis}\n` +
          `Nereye & Nasil Basvurulur:\n${(s.processGuide || []).map((g) => `  * ${g}`).join('\n')}\n` +
          `Gerekli Evraklar:\n${s.requiredDocuments.map((d) => `  [ ] ${d.name} (${d.format}) - Not: ${d.proTip}`).join('\n')}\n` +
          `Kritik Puf Noktasi: ${s.proTips}\n`;
      }).join('\n\n') +
      `\n========================================================================\n` +
      `Bu rapor 2026 resmi mevzuatina tam uyumlu olarak Girisimbee tarafindan uretilmistir.\n`;

    const sanitizedSector = currentRoadmap.sectorName.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
    downloadTextFile(`${sanitizedSector}_${selectedCity.toLowerCase()}_yol_haritasi_raporu.doc`, reportText);
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
            {/* ADIM 1: SEKTÖR & MESLEK SEÇİM IZGARASI (2x3 FERAH GRİD) */}
            {activeStep === 1 ? (
              <div className="space-y-3.5">
                {/* Kategori Filtre Hapları */}
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
                  {['Tümü', 'Finans & Hizmet', 'Yeme - İçme', 'Kişisel Bakım & Sağlık', 'Perakende & Zanaat'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryGroup(cat);
                          setSectorPage(1);
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs transition-colors cursor-pointer',
                          selectedCategoryGroup === cat
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-muted-foreground hover:text-slate-900 dark:hover:text-white',
                        )}
                      >
                        {cat}
                      </button>
                    ),
                  )}
                </div>

                {/* Arama Çubuğu */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSectorPage(1);
                    }}
                    placeholder="Sektör, NACE kodu veya meslek ara..."
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 pl-8 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                {/* 2x3 Meslek Kartları Grid'i */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paginatedSectors.map((sector) => {
                    const isSelected = sector.sectorId === selectedSectorId;
                    const masterInfo = getMasterSectorById(sector.sectorId);

                    return (
                      <div
                        key={sector.sectorId}
                        onClick={() => setSelectedSectorId(sector.sectorId)}
                        className={cn(
                          'p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none relative min-h-[148px]',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                            : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700',
                        )}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl sm:text-3xl">{sector.emoji}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10.5px] font-mono font-bold">
                              {masterInfo.naceCode}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug line-clamp-1">
                              {sector.sectorName}
                            </h4>
                            <span className="text-[11px] text-muted-foreground block line-clamp-1 mt-0.5">
                              {sector.categoryGroup} • {sector.estimatedTotalDays}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-[11px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-extrabold">
                            {formatCurrency(sector.totalEstimatedLegalCost)} Harç
                          </span>
                          <span
                            className={cn(
                              'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400',
                            )}
                          >
                            ✓
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sayfalama Kontrolleri */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Sayfa {sectorPage} / {totalPages} ({filteredSectors.length} Sektör)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={sectorPage === 1}
                        onClick={() => setSectorPage((p) => Math.max(1, p - 1))}
                        className="h-7 px-2 text-xs cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={sectorPage === totalPages}
                        onClick={() => setSectorPage((p) => Math.min(totalPages, p + 1))}
                        className="h-7 px-2 text-xs cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ADIM 2..6: SEÇİLİ BÜROKRASİ ADIMI DETAY KARTI (DİNAMİK PRO-TIP VE AKTİF ŞABLONLAR) */
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
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
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
                    <span className="text-[10px] text-muted-foreground block font-medium">Yetkili Kurum</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block mt-0.5">
                      {currentStep.institution}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
                    <span className="text-[10px] text-muted-foreground block font-medium">Başvuru Kanalı</span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate block mt-0.5">
                      ⚡ {currentStep.applicationChannel}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700">
                    <span className="text-[10px] text-muted-foreground block font-medium">Tahmini Süre</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block mt-0.5">
                      ⏳ {currentStep.durationDays}
                    </span>
                  </div>
                </div>

                {/* Nereye & Nasıl Başvurulur Süreç Kılavuzu */}
                {currentStep.processGuide && currentStep.processGuide.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
                      <span>🧭</span>
                      <span>Nereye & Nasıl Başvurulur?</span>
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-slate-700 dark:text-zinc-300 pl-4 list-disc">
                      {currentStep.processGuide.map((guide, idx) => (
                        <li key={idx} className="leading-snug">
                          {guide}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gerekli Evraklar (Checklist) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>📋 Gerekli Başvuru Evrakları</span>
                    <span className="text-[10px] text-muted-foreground">İşaretledikçe alt detay güncellenir</span>
                  </span>

                  <div className="space-y-1.5">
                    {currentStep.requiredDocuments.map((doc) => {
                      const isDone = !!(completedDocs[doc.id] || completedDocs[doc.name]);
                      const isFocused = activeFocusedDoc?.id === doc.id;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => toggleDoc(doc)}
                          className={cn(
                            'p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer select-none',
                            isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs'
                              : isFocused
                                ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-400'
                                : 'bg-white dark:bg-zinc-800/90 border-slate-200/80 dark:border-zinc-700 hover:border-slate-300',
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
                                isDone ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-900 dark:text-zinc-100',
                              )}
                            >
                              {doc.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-bold">
                              {doc.format}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTemplateModal(doc);
                              }}
                              className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Resmi Örnek Şablon / Taslak İncele & İndir"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Şablon</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DİNAMİK PÜF NOKTASI VE DENETİM DETAYI (SEÇİLEN EVRAKA GÖRE DEĞİŞİR) */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200 transition-all">
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0 mt-0.5">💡</span>
                    <div className="space-y-0.5 min-w-0">
                      <strong className="block font-bold text-amber-900 dark:text-amber-300">
                        {activeFocusedDoc
                          ? `${activeFocusedDoc.name} İçin Püf Noktası:`
                          : 'Kritik Püf Noktası:'}
                      </strong>
                      <p className="leading-relaxed text-[11.5px]">
                        {activeFocusedDoc?.proTip || currentStep.proTips}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alt Adım Değiştirme ve İlerleme Çubuğu */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                className="h-8 px-3 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Önceki Adım
              </Button>

              <div className="flex items-center gap-1">
                {LEGAL_STEPS.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      'h-1.5 rounded-full transition-all cursor-pointer',
                      activeStep === step.id
                        ? 'w-6 bg-indigo-600'
                        : activeStep > step.id
                          ? 'w-3 bg-indigo-400'
                          : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                    )}
                    aria-label={`Aşama ${step.id}`}
                  />
                ))}
              </div>

              {activeStep === 6 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowRoadmapPrintModal(true)}
                  className="h-8 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Raporu PDF İndir</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                  className="h-8 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs gap-1 cursor-pointer"
                >
                  <span>{LEGAL_STEPS[activeStep]?.title || 'Sonraki'} Adımına Geç</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
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
                onClick={() => setShowRoadmapPrintModal(true)}
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Yol Haritasını PDF İndir</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const firstTemplateDoc = currentRoadmap.steps
                    .flatMap((s) => s.requiredDocuments)
                    .find((d) => d.isDownloadableTemplate);
                  if (firstTemplateDoc) {
                    setActiveTemplateDoc(firstTemplateDoc);
                  } else {
                    setShowRoadmapPrintModal(true);
                  }
                }}
                className="w-full h-9 rounded-xl border-slate-200 dark:border-zinc-700 text-xs font-bold text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <span>Hazır Sözleşme Paketini Al</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RESMİ ÖRNEK BELGE & ŞABLON MODALI                                       */}
      {/* ========================================================================= */}
      {activeTemplateDoc && activeTemplateDoc.templateContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="printable-document-modal"
            className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <FileBadge className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {activeTemplateDoc.name}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    2026 Resmi Mevzuat Örnek Şablonu
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTemplateDoc(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Resmi Belge Görünümü */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono leading-relaxed bg-slate-50/40 dark:bg-zinc-950/40">
              {/* Belge Başlığı & Filigran */}
              <div className="text-center pb-3 border-b-2 border-slate-300 dark:border-zinc-700 space-y-1">
                <span className="text-[10px] tracking-widest text-indigo-600 dark:text-indigo-400 font-bold block">
                  ★ {activeTemplateDoc.templateContent.authority} ★
                </span>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                  {activeTemplateDoc.templateContent.title}
                </h2>
                <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-bold font-sans">
                  RESMİ ÖRNEK TASLAK - 2026 GİRİŞİMBEE
                </div>
              </div>

              {/* Özet */}
              <p className="text-slate-600 dark:text-zinc-400 font-sans italic bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11.5px]">
                {activeTemplateDoc.templateContent.summary}
              </p>

              {/* Maddeler */}
              <div className="space-y-3 font-sans">
                {activeTemplateDoc.templateContent.sections.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {sec.heading}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-normal">
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* İmza Alanı */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 font-sans">
                <span className="text-[10.5px] font-bold text-muted-foreground block mb-2">
                  İmza & Tasdik Yetkilileri:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeTemplateDoc.templateContent.signers.map((sig, idx) => (
                    <div key={idx} className="p-2 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700 text-center text-[10.5px] text-slate-600 dark:text-zinc-400">
                      {sig}
                    </div>
                  ))}
                </div>
              </div>

              {/* Yasal Not */}
              <p className="text-[10px] text-muted-foreground font-sans border-t border-slate-200 dark:border-zinc-800 pt-2">
                ⚖️ {activeTemplateDoc.templateContent.legalDisclaimer}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-900 no-print">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyTemplateText(activeTemplateDoc.templateContent!)}
                  className="h-9 text-xs font-bold gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadDocFile(activeTemplateDoc)}
                  className="h-9 text-xs font-bold gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Taslağı İndir (.doc)</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTemplateDoc(null)}
                  className="h-9 text-xs font-bold"
                >
                  Kapat
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF Kaydet</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. YOL HARİTASI TAM RAPOR YAZDIRMA / PDF MODALI                             */}
      {/* ========================================================================= */}
      {showRoadmapPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="printable-roadmap-modal"
            className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentRoadmap.emoji}</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {currentRoadmap.sectorName} - 2026 Resmi Başvuru Yol Haritası
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedCity} / {selectedDistrict} Kurulum Raporu
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoadmapPrintModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-muted-foreground transition-colors cursor-pointer no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <span className="text-[10px] text-muted-foreground block">Toplam Harç</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {formatCurrency(currentRoadmap.totalEstimatedLegalCost)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <span className="text-[10px] text-muted-foreground block">Tahmini Süre</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {currentRoadmap.estimatedTotalDays}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <span className="text-[10px] text-muted-foreground block">Asgari Sermaye</span>
                  <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                    {currentRoadmap.statutoryCapitalRequirement.amount > 0
                      ? formatCurrency(currentRoadmap.statutoryCapitalRequirement.amount)
                      : 'Şart Yok'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Resmi Başvuru Adımları ve Evrak Dökümü
                </h4>
                {currentRoadmap.steps.map((s) => (
                  <div key={s.stepNumber} className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span>{s.stepNumber}. {s.title}</span>
                      <span className="text-indigo-600">{formatCurrency(s.estimatedCost)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Kurum: {s.institution} • Kanal: {s.applicationChannel} • Süre: {s.durationDays}</p>
                    <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                      <strong>Evraklar:</strong> {s.requiredDocuments.map((d) => d.name).join(', ')}
                    </div>
                    <div className="text-[10.5px] text-amber-900 dark:text-amber-300 font-medium">
                      💡 Püf Noktası: {s.proTips}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-900 no-print">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadRoadmapReport}
                className="h-9 text-xs font-bold gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Raporu İndir (.doc)</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoadmapPrintModal(false)}
                  className="h-9 text-xs font-bold"
                >
                  Kapat
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Raporu Yazdır / PDF İndir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Stili: Modal açıkken sadece temiz resmi belge/rapor yazdırılır */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-document-modal, #printable-document-modal *,
          #printable-roadmap-modal, #printable-roadmap-modal * {
            visibility: visible !important;
          }
          #printable-document-modal, #printable-roadmap-modal {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: auto !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
            overflow: visible !important;
            max-height: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default HomeLegalAssistantSection;
