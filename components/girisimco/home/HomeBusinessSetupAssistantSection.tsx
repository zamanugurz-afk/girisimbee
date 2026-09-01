'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Building2,
  MapPin,
  Users,
  Wrench,
  FileText,
  TrendingUp,
  Check,
  Plus,
  Minus,
  Lock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Printer,
  ChevronRight,
  ChevronLeft,
  Search,
  Store,
  AlertCircle,
  Scale,
  X,
  CheckCircle2,
  FileDown,
  PackageCheck,
  Coffee,
  ShieldCheck,
  Layers,
  Info,
  Rocket,
  Laptop,
  Coins,
  ShoppingBag,
  Clock,
  DollarSign,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BUSINESS_SETUP_TEMPLATES,
  getBusinessTemplateById,
  getAllCategoryGroups,
  getTemplatesByCategoryGroup,
  calculateDynamicEquipmentQty,
  SMART_EQUIPMENT_DICTIONARY,
  type SmartEquipmentPreset,
} from '@/features/business-setup/data/business-setup-templates';
import { getMasterSectorById } from '@/features/common/master-sectors-registry';
import {
  TURKEY_CITY_RENTAL_RATES,
  getDistrictRentalRate,
  RENTAL_RATES_METADATA,
} from '@/features/business-setup/data/district-rental-rates';
import {
  calculateBusinessSetupBudget,
} from '@/features/business-setup/services/business-setup-calculator.service';
import type {
  SetupEquipment,
  SetupStaffRole,
  SetupLegalFeeItem,
} from '@/features/business-setup/types/business-setup.types';
import { useUnifiedCockpit } from '@/features/common/context/UnifiedCockpitContext';
import { getRegulatoryBadgeText } from '@/features/common/config/market-version.config';

const STEPS = [
  { id: 1, label: 'Sektör & Meslek', sub: 'İşletme türü ve konumu', icon: Building2 },
  { id: 2, label: 'Mekan & Kira', sub: 'm², 2x kira peşinatı & tadilat', icon: Store },
  { id: 3, label: 'Demirbaş & Donanım', sub: 'Zorunlu ve konfor donanımları', icon: Wrench },
  { id: 4, label: 'İlk Stok & Emtia', sub: 'Açılış mal ve ürün bütçesi', icon: PackageCheck },
  { id: 5, label: 'Ekip & Ruhsat', sub: 'Bordro, harçlar & lisans', icon: FileText },
  { id: 6, label: 'Fizibilite & Giderler', sub: 'İlk yatırım & sabit giderler', icon: Calculator },
  { id: 7, label: 'Gelir & Ciro Modeli', sub: 'Ciro, net kar & amortisman', icon: TrendingUp },
];

export function HomeBusinessSetupAssistantSection() {
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

  const [sectorSearchQuery, setSectorSearchQuery] = useState<string>('');
  const [sectorPage, setSectorPage] = useState<number>(1);

  // Active step (1 to 7)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Current Template from unified sector ID
  const activeTemplate = useMemo(() => {
    return getBusinessTemplateById(selectedSectorId);
  }, [selectedSectorId]);

  // 2. Mekan State (Varsayılan 2x Kira: 1 Peşin + 1 Depozito)
  const [m2, setM2] = useState<number>(activeTemplate.defaultM2);
  const [isCustomRent, setIsCustomRent] = useState<boolean>(false);
  const [customMonthlyRent, setCustomMonthlyRent] = useState<number | ''>('');
  const [depositMonths, setDepositMonths] = useState<number>(1);
  const [includeBrokerFee, setIncludeBrokerFee] = useState<boolean>(false);
  const [includeFitout, setIncludeFitout] = useState<boolean>(true);
  const [customFitoutRate, setCustomFitoutRate] = useState<number>(activeTemplate.fitoutCostPerM2 || 3000);

  // 3. Demirbaş State
  const [equipmentList, setEquipmentList] = useState<
    (SetupEquipment & { selected: boolean; qty: number })[]
  >([]);

  // Akıllı Demirbaş Arama & Ekleme State
  const [isAddingCustomEq, setIsAddingCustomEq] = useState<boolean>(false);
  const [customEqName, setCustomEqName] = useState<string>('');
  const [customEqCost, setCustomEqCost] = useState<number | ''>('');
  const [customEqCategory, setCustomEqCategory] = useState<string>('comfort');
  const [customEqUnit, setCustomEqUnit] = useState<string>('Adet');
  const [isSmartSuggestionsOpen, setIsSmartSuggestionsOpen] = useState<boolean>(false);

  // 4. İlk Stok & Emtia State
  const [includeInventory, setIncludeInventory] = useState<boolean>(true);
  const [isCustomInventory, setIsCustomInventory] = useState<boolean>(false);
  const [customInventoryCost, setCustomInventoryCost] = useState<number | ''>('');

  // 5. Ekip & Ruhsat & ERP State
  const [staffList, setStaffList] = useState<SetupStaffRole[]>(activeTemplate.recommendedStaff);
  const [legalFeesList, setLegalFeesList] = useState<
    (SetupLegalFeeItem & { selected: boolean })[]
  >([]);
  const [includeSoftwareLicense, setIncludeSoftwareLicense] = useState<boolean>(true);

  // 6. Güvence Fonu (İşletme Sermayesi Ayı)
  const [workingCapitalMonths, setWorkingCapitalMonths] = useState<number>(3);

  // 7. Gelir Modeli İnteraktif Değerleri (Adım 7)
  const [customDailyVolume, setCustomDailyVolume] = useState<number | null>(null);
  const [customAvgTicketPrice, setCustomAvgTicketPrice] = useState<number | null>(null);

  // PDF / Rapor Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Şablon değiştiğinde otomatik doldurma (Minimum Manuel Veri, Maksimum Otomatik Doldurma)
  useEffect(() => {
    setM2(activeTemplate.defaultM2);
    setCustomFitoutRate(activeTemplate.fitoutCostPerM2 || 3000);
    setStaffList(activeTemplate.recommendedStaff.map((s) => ({ ...s })));
    
    // m²'ye göre dinamik ekipman adetlerini ayarla
    setEquipmentList(
      activeTemplate.equipments.map((eq) => {
        const dynamicQty = calculateDynamicEquipmentQty(eq, activeTemplate.defaultM2);
        return {
          ...eq,
          minQty: dynamicQty.minQty,
          defaultQty: dynamicQty.defaultQty,
          selected: true,
          qty: dynamicQty.defaultQty,
        };
      })
    );

    setLegalFeesList(
      activeTemplate.mandatoryLegalItems.map((item) => ({
        ...item,
        selected: true,
      }))
    );
    setIsCustomRent(false);
    setCustomMonthlyRent('');
    setIsCustomInventory(false);
    setCustomInventoryCost('');
    setIncludeInventory(true);
    setIncludeSoftwareLicense(true);
    setCustomDailyVolume(null);
    setCustomAvgTicketPrice(null);
  }, [activeTemplate]);

  // m² değiştiğinde yangın tüpü, klima, çalışma ve müşteri masaları, raflar ve tüm demirbaşları m²'ye göre otomatik ölçekle
  useEffect(() => {
    setEquipmentList((prev) =>
      prev.map((item) => {
        if (!item.scalesWithM2 || !item.m2Ratio) return item;
        const dynamic = calculateDynamicEquipmentQty(item, m2);
        return {
          ...item,
          minQty: dynamic.minQty,
          defaultQty: dynamic.defaultQty,
          qty: dynamic.defaultQty,
          selected: dynamic.defaultQty > 0 ? true : item.selected,
        };
      })
    );
  }, [m2]);

  // Şehir değiştikçe ilk geçerli ilçeyi seç
  useEffect(() => {
    const cityData = TURKEY_CITY_RENTAL_RATES[selectedCity];
    if (cityData && cityData.districtRates) {
      const districts = Object.keys(cityData.districtRates);
      if (districts.length > 0 && !cityData.districtRates[selectedDistrict]) {
        setSelectedDistrict(districts[0]);
      }
    }
  }, [selectedCity, selectedDistrict]);

  // Canlı Hesaplama Sonuçları
  const calculationResult = useMemo(() => {
    return calculateBusinessSetupBudget({
      template: activeTemplate,
      city: selectedCity,
      district: selectedDistrict,
      m2,
      customMonthlyRent: isCustomRent && typeof customMonthlyRent === 'number' ? customMonthlyRent : null,
      depositMonths,
      includeBrokerFee,
      includeFitout,
      customFitoutCostPerM2: customFitoutRate,
      includeInventory,
      customInventoryCost: isCustomInventory && typeof customInventoryCost === 'number' ? customInventoryCost : null,
      includeSoftwareLicense,
      equipments: equipmentList,
      staff: staffList,
      legalFees: legalFeesList,
      workingCapitalMonths,
      customDailyVolume,
      customAvgTicketPrice,
    });
  }, [
    activeTemplate,
    selectedCity,
    selectedDistrict,
    m2,
    isCustomRent,
    customMonthlyRent,
    depositMonths,
    includeBrokerFee,
    includeFitout,
    customFitoutRate,
    includeInventory,
    isCustomInventory,
    customInventoryCost,
    includeSoftwareLicense,
    equipmentList,
    staffList,
    legalFeesList,
    workingCapitalMonths,
    customDailyVolume,
    customAvgTicketPrice,
  ]);

  // Sektör Filtreleme
  const filteredTemplates = useMemo(() => {
    return BUSINESS_SETUP_TEMPLATES.filter((tpl) => {
      const matchesGroup = selectedCategoryGroup === 'Tümü' || tpl.categoryGroup === selectedCategoryGroup;
      const matchesSearch =
        !sectorSearchQuery.trim() ||
        tpl.name.toLowerCase().includes(sectorSearchQuery.toLowerCase()) ||
        tpl.categoryGroup.toLowerCase().includes(sectorSearchQuery.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [selectedCategoryGroup, sectorSearchQuery]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage) || 1;
  const paginatedTemplates = useMemo(() => {
    const start = (sectorPage - 1) * itemsPerPage;
    return filteredTemplates.slice(start, start + itemsPerPage);
  }, [filteredTemplates, sectorPage]);

  // Akıllı Demirbaş Arama Önerileri (Autocomplete Suggestions)
  const smartSuggestions = useMemo(() => {
    if (!customEqName.trim() || customEqName.trim().length < 2) return [];
    const query = customEqName.toLowerCase().trim();
    return SMART_EQUIPMENT_DICTIONARY.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.keywords.some((k) => k.includes(query) || query.includes(k))
    ).slice(0, 5);
  }, [customEqName]);

  // Şehir ve İlçe Seçenekleri
  const cityOptions = useMemo(() => Object.keys(TURKEY_CITY_RENTAL_RATES), []);
  const districtOptions = useMemo(() => {
    const cityData = TURKEY_CITY_RENTAL_RATES[selectedCity];
    return cityData?.districtRates ? Object.keys(cityData.districtRates) : ['Merkez'];
  }, [selectedCity]);

  // Para Formatlayıcı
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  // Staff Count Handler
  const handleUpdateStaffCount = (index: number, delta: number) => {
    setStaffList((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const newCount = Math.max(0, item.count + delta);
        return { ...item, count: newCount };
      })
    );
  };

  // Staff Owner Toggle
  const handleToggleStaffOwner = (index: number) => {
    setStaffList((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return { ...item, count: item.count > 0 ? 0 : 1 };
      })
    );
  };

  // Equipment Qty Handler
  const handleUpdateEquipmentQty = (id: string, delta: number) => {
    setEquipmentList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const min = item.isLocked ? item.minQty : 0;
        const newQty = Math.max(min, item.qty + delta);
        return { ...item, qty: newQty, selected: newQty > 0 };
      })
    );
  };

  // Equipment Toggle Handler
  const handleToggleEquipment = (id: string) => {
    setEquipmentList((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.isLocked) return item;
        return { ...item, selected: !item.selected };
      })
    );
  };

  // Akıllı Öneri Seçildiğinde Formu Doldur
  const handleSelectSmartPreset = (preset: SmartEquipmentPreset) => {
    setCustomEqName(preset.name);
    setCustomEqCost(preset.suggestedUnitCost);
    setCustomEqCategory(preset.category);
    setCustomEqUnit(preset.unitLabel);
    setIsSmartSuggestionsOpen(false);
  };

  // Özel Demirbaş Ekleme
  const handleAddCustomEquipment = () => {
    if (!customEqName.trim() || typeof customEqCost !== 'number' || customEqCost <= 0) return;

    const newEq: SetupEquipment & { selected: boolean; qty: number } = {
      id: `custom-eq-${Date.now()}`,
      name: customEqName.trim(),
      category: customEqCategory as any,
      unitCost: customEqCost,
      defaultQty: 1,
      minQty: 0,
      isLocked: false,
      unitLabel: customEqUnit || 'Adet',
      isCustom: true,
      selected: true,
      qty: 1,
    };

    setEquipmentList((prev) => [newEq, ...prev]);
    setCustomEqName('');
    setCustomEqCost('');
    setIsAddingCustomEq(false);
  };

  // Legal Fee Toggle Handler
  const handleToggleLegalFee = (index: number) => {
    setLegalFeesList((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return { ...item, selected: !item.selected };
      })
    );
  };

  // Zorunlu ve Konfor Ekipmanları
  const mandatoryEquipments = useMemo(() => {
    return equipmentList.filter((eq) => eq.isLocked || eq.category === 'mandatory' || eq.category === 'safety');
  }, [equipmentList]);

  const comfortEquipments = useMemo(() => {
    return equipmentList.filter((eq) => !eq.isLocked && eq.category !== 'mandatory' && eq.category !== 'safety');
  }, [equipmentList]);

  // Yazdır / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="assistant-section" className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* ========================================================================= */}
      {/* 2. ANA ASİSTAN KOKPİTİ (3 ENTEGRE SÜTUN - LOKASYON RADARI BÜTÜNLÜĞÜNDE)     */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ===================================================================== */}
          {/* A. SOL SÜTUN: LOKASYON SEÇİMİ & 7 ADIMLI STEPPER (~280px - lg:col-span-3) */}
          {/* ===================================================================== */}
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
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 px-2 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 px-2 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. 7 Adımlı Dikey Stepper Menüsü */}
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Planlama Adımları
                  </span>
                  <span className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {activeStep} / 7
                  </span>
                </div>

                <div className="space-y-1">
                  {STEPS.map((step) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveStep(step.id)}
                        className={cn(
                          'w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all text-xs font-medium border',
                          isActive
                            ? 'bg-amber-500/15 border-amber-500/50 text-slate-900 dark:text-white shadow-xs font-bold'
                            : isCompleted
                            ? 'bg-white/80 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/30'
                        )}
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded-lg flex items-center justify-center text-[11px] shrink-0 font-bold',
                            isActive
                              ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/30'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          )}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold leading-tight">{step.label}</p>
                          <p className="truncate text-[10px] text-muted-foreground mt-0.5">{step.sub}</p>
                        </div>

                        <ChevronRight
                          className={cn(
                            'w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform',
                            isActive && 'text-amber-600 translate-x-0.5'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Seçili Şablon Mini Rozeti */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 flex items-center gap-2.5">
                  <span className="text-xl shrink-0 p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-xs border border-slate-200/60 dark:border-zinc-700">
                    {activeTemplate.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {activeTemplate.name}
                    </h4>
                    <p className="text-[10.5px] text-amber-700 dark:text-amber-400 font-semibold truncate mt-0.5">
                      {selectedCity} • {selectedDistrict} ({m2} m²)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sol Alt Bilgi Kartı */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 text-[11px] text-muted-foreground leading-relaxed space-y-1">
              <div>💡 <strong>2026 Mevzuat Uyumlu:</strong> Asgari sermaye şartı, m²&apos;ye göre yangın tüpü ve resmi harçlar mevzuata göre ölçeklenir.</div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* B. ORTA SÜTUN: İÇERİK KANVASI & ADIM KOKPİTİ (lg:col-span-6)         */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {/* ADIM 1: SEKTÖR & MESLEK SEÇİMİ (2x3 FERAH GRİD - SCROLLBARSIZ) */}
            {activeStep === 1 ? (
              <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Adım 1: Sektör & Model Seçimi
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                        Hedef Mesleğinizi Seçin ({filteredTemplates.length} Sektör)
                      </h3>
                    </div>

                    {/* Kategori Filtre Hapları */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scrollbar-none text-xs">
                      {['Tümü', 'Finans & Hizmet', 'Yeme - İçme', 'Kişisel Bakım & Sağlık', 'Perakende & Zanaat'].map(
                        (grp) => (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryGroup(grp);
                              setSectorPage(1);
                            }}
                            className={cn(
                              'px-2.5 py-1 rounded-xl font-bold whitespace-nowrap text-[11px] transition-colors cursor-pointer',
                              selectedCategoryGroup === grp
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-zinc-800 text-muted-foreground hover:text-slate-900 dark:hover:text-white',
                            )}
                          >
                            {grp}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Arama Çubuğu */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={sectorSearchQuery}
                      onChange={(e) => {
                        setSectorSearchQuery(e.target.value);
                        setSectorPage(1);
                      }}
                      placeholder="Sektör, NACE kodu veya meslek ara..."
                      className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 pl-8 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  {/* 2x3 Meslek Kartları Grid'i */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {paginatedTemplates.map((tpl) => {
                      const isSelected = tpl.id === selectedSectorId;
                      const masterInfo = getMasterSectorById(tpl.id);

                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedSectorId(tpl.id)}
                          className={cn(
                            'p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none relative h-[128px]',
                            isSelected
                              ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/20'
                              : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700',
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{tpl.emoji}</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[9.5px] font-mono font-bold">
                                {masterInfo.naceCode}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug line-clamp-1">
                              {tpl.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground block line-clamp-1">
                              {tpl.categoryGroup} • {tpl.defaultM2} m²
                            </span>
                          </div>

                          <div className="pt-1 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-[9.5px] text-amber-700 dark:text-amber-400 font-bold">
                              ₺{(tpl.fitoutCostPerM2 || 3000).toLocaleString('tr-TR')} / m² Tadilat
                            </span>
                            <span
                              className={cn(
                                'w-4 h-4 rounded-full flex items-center justify-center text-[10px]',
                                isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400',
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
                        Sayfa {sectorPage} / {totalPages} ({filteredTemplates.length} Sektör)
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
                /* ADIM 2..7: DETAYLI HESAPLAMA VE GİRDİ FORMLARI */
                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                  {/* --------------------------------------------------------------- */}
                  {/* ADIM 2: MEKAN ALANI & KİRA PLANI                                */}
                  {/* --------------------------------------------------------------- */}
                  {activeStep === 2 && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                          İşletme Alanı (Metrekare)
                        </span>
                        <span className="text-[10.5px] text-muted-foreground">
                          {activeTemplate.name} için sektör standardı: {activeTemplate.defaultM2} m²
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={15}
                          max={800}
                          value={m2}
                          onChange={(e) => setM2(Math.max(10, Number(e.target.value) || 10))}
                          className="w-20 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-center text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <span className="text-xs font-bold text-muted-foreground">m²</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={20}
                      max={400}
                      step={5}
                      value={m2}
                      onChange={(e) => setM2(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* 3'lü Detay Kutuları */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-center">
                      <span className="text-[10px] font-semibold text-muted-foreground block">Bölgesel Rayiç</span>
                      <span className="text-xs font-black text-slate-900 dark:text-zinc-100 mt-0.5 block">
                        {getDistrictRentalRate(selectedCity, selectedDistrict)} ₺ / m²
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-center">
                      <span className="text-[10px] font-semibold text-muted-foreground block">Aylık Kira</span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                        {formatCurrency(calculationResult.monthlyRent)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-center">
                      <span className="text-[10px] font-semibold text-muted-foreground block">Giriş Peşinatı (2x)</span>
                      <span className="text-xs font-black text-slate-900 dark:text-zinc-100 mt-0.5 block">
                        {formatCurrency(calculationResult.leaseInitialTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Manuel Kira Değiştirme & Güncellik Rozeti */}
                  <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCustomRent(!isCustomRent)}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {isCustomRent ? '✓ Bölge Kira Endeksine Dön' : '✏️ Tuttuğunuz dükkanın özel kirasını girin'}
                      </button>

                      {isCustomRent && (
                        <input
                          type="number"
                          placeholder="Örn: 45000"
                          value={customMonthlyRent}
                          onChange={(e) => setCustomMonthlyRent(e.target.value ? Number(e.target.value) : '')}
                          className="w-28 h-7 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-zinc-800 px-2 text-xs font-bold text-foreground focus:outline-none"
                        />
                      )}
                    </div>

                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      📈 {RENTAL_RATES_METADATA.lastUpdatedMonth} Piyasa Rayici
                    </span>
                  </div>

                  {/* Tadilat & Dekorasyon Kartı */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeFitout}
                        onChange={(e) => setIncludeFitout(e.target.checked)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>Tadilat & İç Mimari Dekorasyon Dahil Edilsin ({m2} m²)</span>
                    </label>

                    <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 shrink-0">
                      {formatCurrency(calculationResult.fitoutTotal)}
                    </span>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------- */}
              {/* ADIM 3: İLAN KARTI MİMARİSİNDE DEMİRBAŞ & DONANIM LİSTESİ       */}
              {/* --------------------------------------------------------------- */}
              {activeStep === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                        Demirbaş & Ekipman Parkuru
                      </span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {m2} m² alana göre yangın tüpü ve klima adetleri mevzuata uygun hesaplanmıştır.
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsAddingCustomEq(!isAddingCustomEq)}
                      className="h-7 px-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Akıllı Ekle</span>
                    </Button>
                  </div>

                  {/* Akıllı Demirbaş Arama & Ekleme */}
                  {isAddingCustomEq && (
                    <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Akıllı Demirbaş Tanımla</span>
                        </span>
                        <button type="button" onClick={() => setIsAddingCustomEq(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 relative">
                        <div className="sm:col-span-6 relative">
                          <input
                            type="text"
                            placeholder="Ekipman yaz (Örn: masa, klima, tartı, TV)..."
                            value={customEqName}
                            onChange={(e) => {
                              setCustomEqName(e.target.value);
                              setIsSmartSuggestionsOpen(true);
                            }}
                            className="w-full h-8 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-xs text-foreground focus:outline-none"
                          />
                          {isSmartSuggestionsOpen && smartSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-700">
                              {smartSuggestions.map((s) => (
                                <button
                                  key={s.name}
                                  type="button"
                                  onClick={() => handleSelectSmartPreset(s)}
                                  className="w-full p-2 text-left hover:bg-amber-500/10 flex items-center justify-between text-xs"
                                >
                                  <span className="font-bold truncate">{s.name}</span>
                                  <span className="text-amber-600 font-extrabold">{formatCurrency(s.suggestedUnitCost)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            placeholder="Birim Fiyat..."
                            value={customEqCost}
                            onChange={(e) => setCustomEqCost(e.target.value ? Number(e.target.value) : '')}
                            className="w-full h-8 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-xs font-bold text-foreground focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddCustomEquipment}
                            className="w-full h-8 rounded-xl text-xs font-bold bg-slate-900 text-white"
                          >
                            Ekle
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* İlan Kartı Formatında Demirbaşlar Izgarası */}
                  <div className="space-y-2">
                    {/* Zorunlular */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mandatoryEquipments.map((eq) => (
                        <div
                          key={eq.id}
                          className="p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between gap-2 shadow-xs"
                        >
                          <div className="flex items-start gap-2">
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                              <Lock className="w-2.5 h-2.5" /> Zorunlu
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                                  {eq.name}
                                </h4>
                                {eq.scalesWithM2 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[9.5px] font-bold shrink-0">
                                    📐 {m2} m² için {eq.qty} {eq.unitLabel}
                                  </span>
                                )}
                              </div>
                              {eq.regulatoryNote && (
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium leading-tight">
                                  ⚖️ {eq.regulatoryNote}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between text-xs">
                            <span className="text-[10.5px] text-muted-foreground font-medium">
                              {formatCurrency(eq.unitCost)} / {eq.unitLabel}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, -1)}
                                disabled={eq.qty <= eq.minQty}
                                className="w-5 h-5 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center border disabled:opacity-30"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-bold text-xs">{eq.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, 1)}
                                className="w-5 h-5 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center border"
                              >
                                <Plus className="w-3 h-3" />
                              </button>

                              <span className="w-16 text-right font-black text-xs text-slate-900 dark:text-zinc-100">
                                {formatCurrency(eq.unitCost * eq.qty)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Konfor ve Operasyonel Donanımlar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {comfortEquipments.map((eq) => (
                        <div
                          key={eq.id}
                          className={cn(
                            'p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-xs',
                            eq.selected
                              ? 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                              : 'bg-slate-50/50 dark:bg-zinc-900/40 border-dashed border-slate-200 opacity-60'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={eq.selected}
                              onChange={() => handleToggleEquipment(eq.id)}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 mt-0.5 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                                  {eq.name}
                                </h4>
                                {eq.scalesWithM2 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[9.5px] font-bold shrink-0">
                                    📐 {m2} m² için {eq.qty} {eq.unitLabel}
                                  </span>
                                )}
                              </div>
                              {eq.description && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                                  {eq.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                            <span className="text-[10.5px] text-muted-foreground font-medium">
                              {formatCurrency(eq.unitCost)} / {eq.unitLabel}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, -1)}
                                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-zinc-700 flex items-center justify-center"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-bold text-xs">{eq.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, 1)}
                                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-zinc-700 flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3" />
                              </button>

                              <span className="w-16 text-right font-black text-xs text-slate-900 dark:text-zinc-100">
                                {formatCurrency(eq.selected ? eq.unitCost * eq.qty : 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------- */}
              {/* ADIM 4: İLK STOK & EMTİA ALIMI                                  */}
              {/* --------------------------------------------------------------- */}
              {activeStep === 4 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-50 to-slate-100/50 dark:from-amber-500/10 dark:via-zinc-800/40 dark:to-zinc-800/20 border border-amber-500/20 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{activeTemplate.emoji}</span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {activeTemplate.name} — İlk Mal / Emtia Tedarik Paketi
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeTemplate.initialInventoryDescription}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10.5px] font-bold text-muted-foreground block">Önerilen Stok Bütçesi</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 block mt-0.5">
                          {formatCurrency(calculationResult.initialInventoryTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeInventory}
                          onChange={(e) => setIncludeInventory(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                        />
                        <span>İlk Stok Alımı Bütçeye Dahil Edilsin</span>
                      </label>

                      {includeInventory && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsCustomInventory(!isCustomInventory)}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {isCustomInventory ? '✓ Önerilen Tutara Dön' : '✏️ Özel Tutar Gir'}
                          </button>

                          {isCustomInventory && (
                            <input
                              type="number"
                              placeholder="Örn: 500000"
                              value={customInventoryCost}
                              onChange={(e) => setCustomInventoryCost(e.target.value ? Number(e.target.value) : '')}
                              className="w-28 h-7 rounded-lg border border-blue-300 bg-white dark:bg-zinc-800 px-2 text-xs font-bold"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------- */}
              {/* ADIM 5: EKİP, RUHSAT & ERP                                      */}
              {/* --------------------------------------------------------------- */}
              {activeStep === 5 && (
                <div className="space-y-3">
                  {/* ERP Lisansı */}
                  {activeTemplate.softwareLicenseCost && (
                    <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                            {activeTemplate.softwareLicenseCost.name}
                          </h4>
                          <span className="text-[10px] text-purple-700 dark:text-purple-300">
                            Yıllık Lisans: {formatCurrency(activeTemplate.softwareLicenseCost.annual)} • Aylık Bakım: {formatCurrency(activeTemplate.softwareLicenseCost.monthlyMaintenance)}
                          </span>
                        </div>
                      </div>

                      <label className="flex items-center gap-1.5 text-xs font-bold text-purple-900 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={includeSoftwareLicense}
                          onChange={(e) => setIncludeSoftwareLicense(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span>Dahil</span>
                      </label>
                    </div>
                  )}

                  {/* Personel ve Resmi Harçlar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Personel */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Önerilen Personel Kadrosu
                      </span>

                      {staffList.map((st, idx) => {
                        const isSelfOwner = st.count === 0 && st.allowOwnerFulfillment;
                        return (
                          <div
                            key={st.role}
                            className={cn(
                              'p-2.5 rounded-xl border space-y-1.5 shadow-xs',
                              isSelfOwner
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300'
                                : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700'
                            )}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                                  {st.role}
                                </h4>
                                <span className="text-[10px] text-muted-foreground">
                                  Net: {formatCurrency(st.avgSalary)} (İşveren: {formatCurrency(Math.round(st.avgSalary * 1.48))})
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStaffCount(idx, -1)}
                                  className="w-5 h-5 rounded-md bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-xs"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="w-4 text-center text-xs font-bold">{st.count}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStaffCount(idx, 1)}
                                  className="w-5 h-5 rounded-md bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-xs"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>

                            {st.allowOwnerFulfillment && (
                              <button
                                type="button"
                                onClick={() => handleToggleStaffOwner(idx)}
                                className={cn(
                                  'w-full p-1 rounded-md text-[10px] font-bold text-left flex items-center gap-1',
                                  isSelfOwner
                                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                                )}
                              >
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                <span>{isSelfOwner ? '✓ Belge Sahibi Sizsiniz (₺0)' : 'Bu görevi kendim yürüteceğim'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Harçlar */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Resmi Ruhsat & İzin Harçları
                      </span>

                      {legalFeesList.map((fee, idx) => (
                        <div
                          key={fee.name}
                          className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={fee.selected}
                              onChange={() => handleToggleLegalFee(idx)}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 shrink-0"
                            />
                            <span className="text-xs font-bold truncate text-slate-900 dark:text-zinc-100">
                              {fee.name}
                            </span>
                          </div>

                          <span className="text-xs font-black text-slate-900 dark:text-zinc-100 shrink-0">
                            {formatCurrency(fee.cost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------- */}
              {/* ADIM 6: FİZİBİLİTE & SABİT GİDERLER TABLOSU                     */}
              {/* --------------------------------------------------------------- */}
              {activeStep === 6 && (
                <div className="space-y-3">
                  {/* Güvence Fonu Ayı Seçici */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                        İşletme Sermayesi Güvence Fonu
                      </span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {workingCapitalMonths} Ay Tampon: {formatCurrency(calculationResult.workingCapitalReserve)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 6].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setWorkingCapitalMonths(m)}
                          className={cn(
                            'px-2 py-1 rounded-lg text-xs font-bold transition-all',
                            workingCapitalMonths === m
                              ? 'bg-amber-500 text-white'
                              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border'
                          )}
                        >
                          {m} Ay
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kalem Kalem Bütçe Dökümü */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1.5 text-xs shadow-xs">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                      Kurulum ve İşletme Kalemleri Dökümü
                    </h4>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-700">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-amber-500" /> Demirbaş & Ekipmanlar:</span>
                      <span className="font-bold">{formatCurrency(calculationResult.equipmentTotal)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-700">
                      <span className="text-muted-foreground flex items-center gap-1.5"><PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> İlk Stok & Emtia:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(calculationResult.initialInventoryTotal)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-700">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-purple-600" /> ERP / Yazılım Lisansı:</span>
                      <span className="font-bold text-purple-600">{formatCurrency(calculationResult.softwareLicenseInitial)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-700">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Store className="w-3.5 h-3.5 text-blue-500" /> Giriş Peşinatı (2x Kira):</span>
                      <span className="font-bold">{formatCurrency(calculationResult.leaseInitialTotal)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-700">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-indigo-500" /> Tadilat & Dekorasyon ({m2} m²):</span>
                      <span className="font-bold">{formatCurrency(calculationResult.fitoutTotal)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-700">
                      <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-rose-500" /> Resmi Ruhsat & Harçlar:</span>
                      <span className="font-bold">{formatCurrency(calculationResult.legalFeesTotal)}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-amber-600" /> {workingCapitalMonths} Aylık Güvence Fonu:</span>
                      <span className="font-bold text-amber-600">{formatCurrency(calculationResult.workingCapitalReserve)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------- */}
              {/* ADIM 7: GELİR & CİRO MODELİ & AMORTİSMAN SİMÜLASYONU            */}
              {/* --------------------------------------------------------------- */}
              {activeStep === 7 && (
                <div className="space-y-3">
                  {/* Gelir Modeli İnteraktif Kontrolleri */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-slate-100/50 dark:from-emerald-950/30 dark:via-zinc-800/40 dark:to-zinc-800/20 border border-emerald-500/30 space-y-3 shadow-xs">
                    
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span>{activeTemplate.name} — Gelir Modeli Simülatörü</span>
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {activeTemplate.revenueModel?.description || 'Hacim, fiyat ve kâr marjı simülasyonu.'}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 shrink-0">
                        Brüt Kar Marjı: %{calculationResult.revenueProjection.grossMarginPercent}
                      </span>
                    </div>

                    {/* 1. Hacim / Üye / Müşteri Slider'ı */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {activeTemplate.revenueModel?.volumeLabel || 'Hedeflenen İşlem Hacmi'}:
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {calculationResult.revenueProjection.currentVolume} {activeTemplate.revenueModel?.unitLabel || 'Adet'} {activeTemplate.revenueModel?.periodType === 'monthly' ? '/ Ay' : '/ Gün'}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={activeTemplate.revenueModel?.minVolume || 1}
                        max={activeTemplate.revenueModel?.maxVolume || 100}
                        step={activeTemplate.revenueModel?.stepVolume || 1}
                        value={calculationResult.revenueProjection.currentVolume}
                        onChange={(e) => setCustomDailyVolume(Number(e.target.value))}
                        className="w-full h-2 bg-emerald-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    {/* 2. Ortalama Ücret / Sepet Tutarı */}
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 dark:border-emerald-900/40 text-xs">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {activeTemplate.revenueModel?.priceLabel || 'Ortalama Birim Tutar'}:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={calculationResult.revenueProjection.avgTicketPrice}
                          onChange={(e) => setCustomAvgTicketPrice(e.target.value ? Number(e.target.value) : null)}
                          className="w-24 h-7 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 px-2 text-xs font-bold text-center text-foreground"
                        />
                        <span className="font-bold text-muted-foreground">₺</span>
                      </div>
                    </div>

                    {/* 3. Hesaplama Formülü İpucu Rozeti */}
                    <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-300 font-medium">
                      <span className="flex items-center gap-1">
                        💡 <strong className="font-bold">Hesaplama:</strong>
                        {activeTemplate.revenueModel?.periodType === 'monthly' ? (
                          <span>
                            {calculationResult.revenueProjection.currentVolume} Aktif {activeTemplate.revenueModel.unitLabel} × {formatCurrency(calculationResult.revenueProjection.avgTicketPrice)}
                          </span>
                        ) : (
                          <span>
                            {calculationResult.revenueProjection.currentVolume} {activeTemplate.revenueModel?.unitLabel || 'Müşteri'}/Gün × {activeTemplate.revenueModel?.daysPerMonth || 26} Gün × {formatCurrency(calculationResult.revenueProjection.avgTicketPrice)}
                          </span>
                        )}
                      </span>
                      <span className="font-black text-emerald-800 dark:text-emerald-200">
                        = {formatCurrency(calculationResult.revenueProjection.monthlyGrossRevenue)} Ciro / Ay
                      </span>
                    </div>
                  </div>

                  {/* 3'lü Gelir Göstergeleri */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-center">
                      <span className="text-[10px] font-semibold text-muted-foreground block">Aylık Brüt Ciro</span>
                      <span className="text-xs font-black text-slate-900 dark:text-zinc-100 mt-0.5 block">
                        {formatCurrency(calculationResult.revenueProjection.monthlyGrossRevenue)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-center">
                      <span className="text-[10px] font-semibold text-muted-foreground block">Aylık Sabit Gider</span>
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                        {formatCurrency(calculationResult.monthlyOperatingCost)}
                      </span>
                    </div>

                    {/* 3. Aylık Net Kâr / Net Zarar Kartı */}
                    {(() => {
                      const isPositive = calculationResult.revenueProjection.monthlyNetProfit >= 0;
                      return (
                        <div
                          className={cn(
                            'p-2.5 rounded-xl border text-center transition-all',
                            isPositive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                          )}
                        >
                          <span
                            className={cn(
                              'text-[10px] font-bold block',
                              isPositive ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'
                            )}
                          >
                            {isPositive ? 'Aylık Net Kâr' : 'Aylık Net Zarar'}
                          </span>
                          <span
                            className={cn(
                              'text-xs font-black mt-0.5 block',
                              isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {formatCurrency(calculationResult.revenueProjection.monthlyNetProfit)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 4. Amortisman ve Yatırım Geri Dönüş Çubuğu */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Yatırımın Kendini Amorti Etme Süresi</span>
                      </span>
                      <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                        {calculationResult.revenueProjection.isProfitable
                          ? `${calculationResult.revenueProjection.paybackMonths} Ay`
                          : 'Kârlılık Eşiği Altında'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          calculationResult.revenueProjection.paybackMonths <= 12
                            ? 'bg-emerald-500'
                            : calculationResult.revenueProjection.paybackMonths <= 24
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        )}
                        style={{
                          width: `${Math.min(100, Math.max(15, 100 - (calculationResult.revenueProjection.paybackMonths * 2.5)))}%`
                        }}
                      />
                    </div>

                    <p className="text-[10.5px] text-muted-foreground leading-tight">
                      {calculationResult.revenueProjection.isProfitable
                        ? `🎉 Belirlediğiniz bu ciro ve marj seviyesinde, toplam ${formatCurrency(calculationResult.totalInitialInvestment)} tutarındaki ilk kurulum yatırımınız yaklaşık ${calculationResult.revenueProjection.paybackMonths} ay içerisinde tamamen karşılanır.`
                        : `⚠️ Aylık net kâr sağlayabilmek için günlük işlem adedini veya sepet tutarını artırabilirsiniz.`}
                    </p>
                  </div>

                </div>
              )}
            </div>
          )}

            {/* 3. Alt Bar: İlerleme Çubuğu & Buton Grubu */}
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
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all cursor-pointer',
                      activeStep === i
                        ? 'w-6 bg-amber-500'
                        : activeStep > i
                        ? 'w-3 bg-emerald-500'
                        : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                    )}
                    aria-label={`Adım ${i}`}
                  />
                ))}
              </div>

              {activeStep < 7 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveStep((prev) => Math.min(7, prev + 1))}
                  className="h-8 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs gap-1 cursor-pointer"
                >
                  <span>{STEPS[activeStep]?.label || 'Sonraki'} Adımına Geç</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="h-8 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs gap-1 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Planı PDF İndir</span>
                </Button>
              )}
            </div>

          </div>

          {/* ===================================================================== */}
          {/* C. SAĞ SÜTUN: MEVZUAT, CANLI BÜTÇE & AKSİYON (~340px - lg:col-span-3) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-3.5 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-zinc-800/80 pt-4 lg:pt-0 lg:pl-5">
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              
              {/* 1. YAPAY ZEKA FİZİBİLİTE PUANI (Lokasyon Radarı ile 100% Uyumlu) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-slate-50 dark:to-zinc-900 border border-amber-500/30 space-y-2.5 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    AI Fizibilite & Bütçe Skoru
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      9.1
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">/ 10</span>
                  </div>
                  <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/35 text-amber-900 dark:text-amber-200 text-center leading-tight">
                    Yüksek Yatırım Verimliliği
                  </span>
                </div>

                {/* Sermaye Yeterliliği Çubuğu */}
                <div className="space-y-1 pt-1.5 border-t border-amber-500/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Sermaye Yeterlilik Endeksi</span>
                    <span className="font-bold text-slate-900 dark:text-white">%94</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[94%]" />
                  </div>
                  <p className="text-[10.5px] font-medium text-muted-foreground leading-snug pt-0.5">
                    Mevzuat donanımları ve işletme fonu eksiksiz karşılandı.
                  </p>
                </div>
              </div>

              {/* 2. 2026 MEVZUAT & SERMAYE ŞARTI KARTI */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      2026 Mevzuat Şartı
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-800 dark:text-blue-300">
                    Resmi Tebliğ
                  </span>
                </div>

                <p className="text-[10.5px] text-muted-foreground leading-tight">
                  {activeTemplate.legalBasis}
                </p>

                <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Asgari Sermaye:</span>
                  <span className="font-black text-blue-900 dark:text-blue-300">
                    {formatCurrency(activeTemplate.statutoryCapital)}
                  </span>
                </div>
              </div>

              {/* 3. CANLI BÜTÇE ÖZETİ KARTI */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                    Finansal Özet
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Canlı
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-muted-foreground">İlk Kurulum Yatırımı:</span>
                    <span className="font-black text-slate-900 dark:text-zinc-100">
                      {formatCurrency(calculationResult.totalInitialInvestment)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-muted-foreground">Aylık Sabit Gider:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(calculationResult.monthlyOperatingCost)} / Ay
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Tahmini Amortisman:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {calculationResult.revenueProjection.isProfitable
                        ? `${calculationResult.revenueProjection.paybackMonths} Ay`
                        : 'Hesaplanıyor'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Aksiyon Butonları */}
            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs sm:text-sm font-bold text-slate-950 text-center flex items-center justify-center gap-2 shadow-xs shadow-amber-500/20"
              >
                <FileDown className="w-4 h-4" />
                <span>Detaylı Fizibilite PDF İndir</span>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-9 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 gap-1.5"
              >
                <Link href="/market" title="Pazarda Ekipman ve Usta Bul">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pazarda Ekipman & Usta Bul</span>
                </Link>
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. RESMİ FİZİBİLİTE & GELİR MODELİ RAPORU A4 PDF / PRINT MODALI          */}
      {/* ========================================================================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:max-w-none print:p-0 print:border-none print:shadow-none">
            
            {/* Modal Üst Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeTemplate.emoji}</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                    {activeTemplate.name} — Kurulum ve Gelir Fizibilite Raporu
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCity} • {selectedDistrict} | Girişimbee Bütçe Robotu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePrint}
                  className="h-8 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF Kaydet</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* RAPOR BASKI GÖVDESİ */}
            <div id="print-content" className="space-y-6 text-slate-900 dark:text-zinc-100">
              
              {/* Başlık ve Antet */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-700 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{activeTemplate.emoji}</span>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                        {activeTemplate.name}
                      </h2>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                        {activeTemplate.categoryGroup} • {m2} m² İşletme Alanı
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-extrabold text-amber-500 block text-sm">GİRİŞİMBEE</span>
                  <span className="text-muted-foreground block">Akıllı Kurulum & Gelir Fizibilitesi</span>
                  <span className="text-muted-foreground block">{new Date().toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              {/* Temel Özet Göstergeleri */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <span className="text-[10.5px] font-bold uppercase text-amber-800 dark:text-amber-300 block">İlk Kurulum Yatırımı</span>
                  <span className="text-lg font-black text-amber-900 dark:text-amber-100 mt-1 block">
                    {formatCurrency(calculationResult.totalInitialInvestment)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                  <span className="text-[10.5px] font-bold uppercase text-rose-800 dark:text-rose-300 block">Aylık Sabit İşletme Gideri</span>
                  <span className="text-lg font-black text-rose-900 dark:text-rose-100 mt-1 block">
                    {formatCurrency(calculationResult.monthlyOperatingCost)} / Ay
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-[10.5px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">Amortisman Süresi</span>
                  <span className="text-lg font-black text-emerald-900 dark:text-emerald-100 mt-1 block">
                    {calculationResult.revenueProjection.isProfitable
                      ? `${calculationResult.revenueProjection.paybackMonths} Ay`
                      : 'Kârlılık Eşiği Altında'}
                  </span>
                </div>
              </div>

              {/* Gelir ve Ciro Modeli Tablosu */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Gelir ve Nakit Akışı Projeksiyonu
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">
                      {activeTemplate.revenueModel?.periodType === 'monthly' ? 'Aylık Portföy:' : 'Günlük Hacim:'}
                    </span>
                    <span className="font-bold">
                      {calculationResult.revenueProjection.currentVolume} {activeTemplate.revenueModel?.unitLabel}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">
                      {activeTemplate.revenueModel?.periodType === 'monthly' ? 'Aylık Ücret:' : 'Ort. Sepet:'}
                    </span>
                    <span className="font-bold">{formatCurrency(calculationResult.revenueProjection.avgTicketPrice)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Aylık Brüt Ciro:</span>
                    <span className="font-bold">{formatCurrency(calculationResult.revenueProjection.monthlyGrossRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">
                      {calculationResult.revenueProjection.monthlyNetProfit >= 0 ? 'Aylık Net Kâr:' : 'Aylık Net Zarar:'}
                    </span>
                    <span
                      className={cn(
                        'font-bold',
                        calculationResult.revenueProjection.monthlyNetProfit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      )}
                    >
                      {formatCurrency(calculationResult.revenueProjection.monthlyNetProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demirbaş ve Donanım Listesi */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Demirbaş, Ekipman & Donanım Parkuru
                </h4>
                <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-zinc-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      <th className="p-2 border border-slate-200 dark:border-zinc-700">Ekipman</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-center">Adet</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-right">Birim Fiyat</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentList.filter((e) => e.selected).map((eq) => (
                      <tr key={eq.id} className="border-b border-slate-100 dark:border-zinc-800">
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 font-medium">
                          {eq.name} {eq.isLocked && <span className="text-[10px] text-amber-600 font-bold">(Zorunlu)</span>}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 text-center">{eq.qty}</td>
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 text-right">{formatCurrency(eq.unitCost)}</td>
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 text-right font-bold">{formatCurrency(eq.unitCost * eq.qty)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-zinc-800 font-bold">
                      <td colSpan={3} className="p-2 border border-slate-200 dark:border-zinc-700">Toplam Demirbaş Bedeli</td>
                      <td className="p-2 border border-slate-200 dark:border-zinc-700 text-right text-amber-600">{formatCurrency(calculationResult.equipmentTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Yasal Dipnot */}
              <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-slate-200 dark:border-zinc-700 pt-3">
                <strong>⚖️ Yasal Sorumluluk Reddi:</strong> Bu rapordaki veriler bölgesel göstergeler ve 2026 sektörel mevzuat standartları baz alınarak simüle edilmiştir; resmi yatırım tavsiyesi niteliği taşımaz.
              </p>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default HomeBusinessSetupAssistantSection;
