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
  Search,
  Store,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BUSINESS_SETUP_TEMPLATES,
  getBusinessTemplateById,
  getAllCategoryGroups,
} from '@/features/business-setup/data/business-setup-templates';
import {
  TURKEY_CITY_RENTAL_RATES,
  getDistrictRentalRate,
} from '@/features/business-setup/data/district-rental-rates';
import {
  calculateBusinessSetupBudget,
} from '@/features/business-setup/services/business-setup-calculator.service';
import type {
  SetupEquipment,
  SetupStaffRole,
  SetupLegalFeeItem,
} from '@/features/business-setup/types/business-setup.types';

const STEPS = [
  { id: 1, label: 'Sektör & İl', sub: 'İşletme türü ve konumu', icon: Building2 },
  { id: 2, label: 'Mekan & Kira', sub: 'm², kira ve tadilat', icon: Store },
  { id: 3, label: 'Ekip & Personel', sub: 'Maaş ve SGK bütçesi', icon: Users },
  { id: 4, label: 'Demirbaş & Cihaz', sub: 'Zorunlu ve ek ekipmanlar', icon: Wrench },
  { id: 5, label: 'Ruhsat & Harçlar', sub: 'Resmi izin ve tesciller', icon: FileText },
  { id: 6, label: 'Fizibilite Özeti', sub: 'Başabaş ve bütçe planı', icon: TrendingUp },
];

export function HomeBusinessSetupAssistantSection() {
  // 1. Sektör & Konum State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('kafe_kahveci');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('Tümü');
  const [sectorSearchQuery, setSectorSearchQuery] = useState<string>('');
  
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kadıköy');

  // Active step (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Current Template
  const activeTemplate = useMemo(() => {
    return getBusinessTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

  // 2. Mekan State
  const [m2, setM2] = useState<number>(activeTemplate.defaultM2);
  const [isCustomRent, setIsCustomRent] = useState<boolean>(false);
  const [customMonthlyRent, setCustomMonthlyRent] = useState<number | ''>('');
  const [includeFitout, setIncludeFitout] = useState<boolean>(true);
  const [customFitoutRate, setCustomFitoutRate] = useState<number>(activeTemplate.fitoutCostPerM2);

  // 3. Ekip State
  const [staffList, setStaffList] = useState<SetupStaffRole[]>(activeTemplate.recommendedStaff);

  // 4. Demirbaş State
  const [equipmentList, setEquipmentList] = useState<
    (SetupEquipment & { selected: boolean; qty: number })[]
  >([]);

  // 5. Ruhsat State
  const [legalFeesList, setLegalFeesList] = useState<
    (SetupLegalFeeItem & { selected: boolean })[]
  >([]);

  // 6. Güvence Fonu (İşletme Sermayesi Ayı)
  const [workingCapitalMonths, setWorkingCapitalMonths] = useState<number>(3);

  // Equipment category filter in step 4
  const [eqCategoryFilter, setEqCategoryFilter] = useState<string>('all');

  // Şablon değiştiğinde otomatik doldurma (Minimum Manuel Veri, Maksimum Otomatik Doldurma)
  useEffect(() => {
    setM2(activeTemplate.defaultM2);
    setCustomFitoutRate(activeTemplate.fitoutCostPerM2);
    setStaffList(activeTemplate.recommendedStaff.map((s) => ({ ...s })));
    setEquipmentList(
      activeTemplate.equipments.map((eq) => ({
        ...eq,
        selected: true,
        qty: eq.defaultQty,
      }))
    );
    setLegalFeesList(
      activeTemplate.mandatoryLegalItems.map((item) => ({
        ...item,
        selected: true,
      }))
    );
    setIsCustomRent(false);
    setCustomMonthlyRent('');
  }, [activeTemplate]);

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
      includeFitout,
      customFitoutCostPerM2: customFitoutRate,
      equipments: equipmentList,
      staff: staffList,
      legalFees: legalFeesList,
      workingCapitalMonths,
    });
  }, [
    activeTemplate,
    selectedCity,
    selectedDistrict,
    m2,
    isCustomRent,
    customMonthlyRent,
    includeFitout,
    customFitoutRate,
    equipmentList,
    staffList,
    legalFeesList,
    workingCapitalMonths,
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
        const min = item.isMandatory ? 1 : 0;
        const newCount = Math.max(min, item.count + delta);
        return { ...item, count: newCount };
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

  // Legal Fee Toggle Handler
  const handleToggleLegalFee = (index: number) => {
    setLegalFeesList((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return { ...item, selected: !item.selected };
      })
    );
  };

  // Yazdır / PDF İndir
  const handlePrintReport = () => {
    window.print();
  };

  // Filtrelenmiş Ekipmanlar
  const filteredEquipments = useMemo(() => {
    if (eqCategoryFilter === 'all') return equipmentList;
    return equipmentList.filter((eq) => eq.category === eqCategoryFilter);
  }, [equipmentList, eqCategoryFilter]);

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* 1. ÜST BAŞLIK & ROZETLER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span>Akıllı Kurulum, Demirbaş & Bütçe Robotu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            İş Kurma <span className="text-amber-500">Asistanı</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Türkiye&apos;nin 81 ilinde ve tüm sektörlerde; mekan, demirbaş, resmi harç, personel ve başabaş fizibilite bütçenizi saniyeler içinde simüle edin.
          </p>
        </div>

        {/* Hızlı Bilgi Rozeti */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 text-xs font-medium text-slate-700 dark:text-zinc-300">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>{BUSINESS_SETUP_TEMPLATES.length}+ Sektör Şablonu</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 text-xs font-medium text-slate-700 dark:text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>81 İl Kira Endeksi</span>
          </div>
        </div>
      </div>

      {/* 2. ANA ASİSTAN KOKPİTİ */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ========================================================================= */}
          {/* A. SOL SÜTUN: ADIM STEPPER & SEKTÖR/İL SEÇİMİ (lg:col-span-3)             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-zinc-800/80 pb-5 lg:pb-0 lg:pr-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kurulum Adımları
                </span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Adım {activeStep} / 6
                </span>
              </div>

              {/* Dikey Adım Stepper */}
              <div className="space-y-1.5">
                {STEPS.map((step) => {
                  const isActive = activeStep === step.id;
                  const isCompleted = activeStep > step.id;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all text-xs font-medium',
                        isActive
                          ? 'bg-amber-500/15 text-amber-900 dark:text-amber-100 border border-amber-500/30 font-semibold shadow-sm'
                          : isCompleted
                          ? 'bg-slate-50 dark:bg-zinc-800/40 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 transition-colors',
                          isActive
                            ? 'bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/30'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        )}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold leading-tight">{step.label}</p>
                        <p className="truncate text-[10.5px] text-muted-foreground mt-0.5">{step.sub}</p>
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

              {/* Hızlı Sektör Değiştirici Mini Kart */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Seçili İşletme & Konum
                </label>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-50 to-slate-100/50 dark:from-amber-500/10 dark:via-zinc-800/40 dark:to-zinc-800/20 border border-amber-500/20 flex items-center gap-3">
                  <span className="text-2xl shrink-0 p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-slate-200/60 dark:border-zinc-700">
                    {activeTemplate.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {activeTemplate.name}
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate mt-0.5">
                      {selectedCity} • {selectedDistrict} ({m2} m²)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* İlerleme Butonları (Sol Alt) */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                className="flex-1 h-9 rounded-xl text-xs font-medium gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Geri</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setActiveStep((prev) => (prev === 6 ? 1 : prev + 1))}
                className="flex-1 h-9 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 gap-1"
              >
                <span>{activeStep === 6 ? 'Başa Dön' : 'Devam Et'}</span>
                {activeStep !== 6 && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. SAĞ / GENİŞ ÇALIŞMA ALANI (lg:col-span-9)                             */}
          {/* Adım 1-5 arasında form FERAH ve GENİŞ; Adım 6'da Bütçe Özeti görünür    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-9 flex flex-col justify-between min-h-[520px]">
            
            {/* --------------------------------------------------------------------- */}
            {/* ADIM 1: SEKTÖR & İL/İLÇE                                              */}
            {/* --------------------------------------------------------------------- */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" />
                      <span>01. Sektör & Faaliyet Lokasyonu</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kurmayı planladığınız iş türünü ve şehri seçin; demirbaş, personel ve maliyetler otomatik dolacaktır.
                    </p>
                  </div>

                  {/* Konum Seçiciler (İl ve İlçe) */}
                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="h-8 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
                      className="h-8 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      {districtOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sektör Kategori Sekmeleri & Arama */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {['Tümü', ...getAllCategoryGroups()].map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setSelectedCategoryGroup(grp)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors',
                          selectedCategoryGroup === grp
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        )}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>

                  <div className="relative sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Sektör veya meslek ara..."
                      value={sectorSearchQuery}
                      onChange={(e) => setSectorSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                {/* Ferah Sektör Kartları Izgarası (3 Sütunlu) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = tpl.id === selectedTemplateId;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={cn(
                          'p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 group',
                          isSelected
                            ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500/80 shadow-md ring-2 ring-amber-500/20'
                            : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-amber-400/60 dark:hover:border-zinc-700 hover:shadow-sm'
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:scale-105 transition-transform">
                            {tpl.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-xs font-bold truncate', isSelected ? 'text-amber-900 dark:text-amber-200' : 'text-slate-900 dark:text-zinc-100')}>
                              {tpl.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {tpl.categoryGroup}
                            </p>
                            <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10.5px] font-semibold text-slate-600 dark:text-zinc-400">
                              Ort. {tpl.defaultM2} m²
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* ADIM 2: MEKAN & KİRA                                                  */}
            {/* --------------------------------------------------------------------- */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>02. Mekan Alanı, Kira & Tadilat Planı</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCity} / {selectedDistrict} bölgesi ticari m² kira endeksine göre anlık hesaplanır.
                  </p>
                </div>

                {/* m² Ayar Kartı */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                        İşletme Alanı (Metrekare)
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {activeTemplate.name} için sektör standardı: {activeTemplate.defaultM2} m²
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={15}
                        max={800}
                        value={m2}
                        onChange={(e) => setM2(Math.max(10, Number(e.target.value) || 10))}
                        className="w-24 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-center text-sm font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                      <span className="text-sm font-bold text-muted-foreground">m²</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={20}
                    max={300}
                    step={5}
                    value={m2}
                    onChange={(e) => setM2(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 3'lü Detay Kutuları (Kira Çarpanı, Aylık Kira, Taşınma Peşinatı) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[11px] font-semibold text-muted-foreground block">Bölgesel Kira Çarpanı</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-zinc-100 mt-1 block">
                      {getDistrictRentalRate(selectedCity, selectedDistrict)} ₺ / m²
                    </span>
                    <span className="text-[10.5px] text-muted-foreground mt-0.5 block">
                      {selectedCity} • {selectedDistrict}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[11px] font-semibold text-muted-foreground block">Aylık Tahmini Kira</span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                      {formatCurrency(calculationResult.monthlyRent)} / Ay
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomRent(!isCustomRent)}
                      className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5 block"
                    >
                      {isCustomRent ? '✓ Bölge Endeksine Dön' : '✏️ Manuel Kira Gir'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[11px] font-semibold text-muted-foreground block">Giriş Peşinatı (4x Kira)</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-zinc-100 mt-1 block">
                      {formatCurrency(calculationResult.leaseInitialTotal)}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground mt-0.5 block">
                      1 Peşin + 2 Depozito + 1 Emlak
                    </span>
                  </div>
                </div>

                {/* Manuel Kira Giriş Alanı */}
                {isCustomRent && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block">Özel Aylık Kira Tutarı</span>
                      <span className="text-[11px] text-blue-800 dark:text-blue-300">Tuttuğunuz veya anlaştığınız dükkanın net kira bedeli:</span>
                    </div>
                    <input
                      type="number"
                      placeholder="Örn: 45000"
                      value={customMonthlyRent}
                      onChange={(e) => setCustomMonthlyRent(e.target.value ? Number(e.target.value) : '')}
                      className="w-36 h-9 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-zinc-800 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                )}

                {/* Tadilat & Dekorasyon Kartı */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeFitout}
                        onChange={(e) => setIncludeFitout(e.target.checked)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>Tadilat, İklimlendirme & İç Mimari Dekorasyon Dahil Edilsin</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground block ml-6 mt-0.5">
                      Sektörel birim maliyet: {formatCurrency(customFitoutRate)} / m² ({m2} m² alan için)
                    </span>
                  </div>

                  <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 shrink-0">
                    {formatCurrency(calculationResult.fitoutTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* ADIM 3: EKİP & PERSONEL                                               */}
            {/* --------------------------------------------------------------------- */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>03. Ekip, Personel & SGK Bordro Maliyeti</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    İşletme için önerilen kadro ve aylık işveren maliyeti hesaplanır.
                  </p>
                </div>

                {/* Personel Kartları Izgarası (2 Sütunlu Geniş) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {staffList.map((st, idx) => (
                    <div
                      key={st.role}
                      className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {st.role}
                          </p>
                          {st.isMandatory && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <Lock className="w-2.5 h-2.5" /> Zorunlu
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Net: {formatCurrency(st.avgSalary)} • Toplam İşveren: {formatCurrency(Math.round(st.avgSalary * 1.225))}
                        </p>
                      </div>

                      {/* Sayı Arttır / Azalt */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateStaffCount(idx, -1)}
                          disabled={st.isMandatory && st.count <= 1}
                          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                          {st.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStaffCount(idx, 1)}
                          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Aylık Toplam Personel Gideri (SGK Dahil):</span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                    {formatCurrency(calculationResult.monthlyStaffCost)} / Ay
                  </span>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* ADIM 4: DEMİRBAŞ & CİHAZ                                              */}
            {/* --------------------------------------------------------------------- */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-500" />
                      <span>04. Demirbaş, Ekipman & Makine Parkuru</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sektöre özel mevzuat ve operasyonel ekipman listesi.
                    </p>
                  </div>

                  {/* Kategori Filtre Butonları */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'all', label: 'Tümü' },
                      { id: 'safety', label: 'Güvenlik & Zorunlu' },
                      { id: 'machinery', label: 'Makine & Donanım' },
                      { id: 'core_tech', label: 'Teknoloji & Kasa' },
                      { id: 'furniture', label: 'Mobilya' },
                      { id: 'appliances', label: 'Cihazlar' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setEqCategoryFilter(f.id)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors',
                          eqCategoryFilter === f.id
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2 Sütunlu Geniş Ekipman Listesi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredEquipments.map((eq) => (
                    <div
                      key={eq.id}
                      className={cn(
                        'p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm',
                        eq.selected
                          ? 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                          : 'bg-slate-50/50 dark:bg-zinc-900/40 border-dashed border-slate-200 dark:border-zinc-800 opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {eq.isLocked ? (
                          <div title="Mevzuat gereği zorunlu demirbaş" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={eq.selected}
                            onChange={() => handleToggleEquipment(eq.id)}
                            className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer shrink-0"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {eq.name}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">
                            Birim: {formatCurrency(eq.unitCost)} / {eq.unitLabel}
                          </p>
                        </div>
                      </div>

                      {/* Adet Sayacı & Tutar */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateEquipmentQty(eq.id, -1)}
                          disabled={eq.isLocked && eq.qty <= eq.minQty}
                          className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {eq.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateEquipmentQty(eq.id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <span className="w-20 text-right text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                          {formatCurrency(eq.selected ? eq.unitCost * eq.qty : 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Toplam Demirbaş Bedeli:</span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                    {formatCurrency(calculationResult.equipmentTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* ADIM 5: RUHSAT & RESMİ HARÇLAR                                        */}
            {/* --------------------------------------------------------------------- */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>05. Resmi Ruhsat, Tescil & İzin Harçları</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Belediye, itfaiye ve meslek odası yasal zorunlu açılış giderleri.
                  </p>
                </div>

                {/* 2 Sütunlu Geniş Harçlar Listesi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {legalFeesList.map((fee, idx) => (
                    <div
                      key={fee.name}
                      className={cn(
                        'p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm',
                        fee.selected
                          ? 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                          : 'bg-slate-50/50 dark:bg-zinc-900/40 border-dashed border-slate-200 dark:border-zinc-800 opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={fee.selected}
                          onChange={() => handleToggleLegalFee(idx)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {fee.name}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
                            {fee.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 shrink-0">
                        {formatCurrency(fee.cost)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Toplam Resmi Ruhsat & Harçlar:</span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                    {formatCurrency(calculationResult.legalFeesTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* ADIM 6: FİZİBİLİTE ÖZETİ & BÜTÇE PLANI (KULLANICININ İSTEDİĞİ ALAN)   */}
            {/* --------------------------------------------------------------------- */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>06. Nihai Kurulum Bütçesi & Fizibilite Raporu</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeTemplate.name} için {selectedCity} / {selectedDistrict} lokasyonunda hesaplanan canlı yatırım özeti.
                  </p>
                </div>

                {/* 2 Sütunlu Geniş Özet Ekranı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  
                  {/* SOL KOLON: Güvence Fonu & Kalem Dağılımı */}
                  <div className="space-y-3.5">
                    {/* Güvence Fonu Seçici */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          İşletme Sermayesi Güvence Fonu
                        </span>
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          {workingCapitalMonths} Ay ({formatCurrency(calculationResult.workingCapitalReserve)})
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        İlk aylarda nakit akışını güvenceye almak için kasada tutulan tampon.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {[1, 2, 3, 6].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setWorkingCapitalMonths(m)}
                            className={cn(
                              'flex-1 py-1.5 rounded-xl text-xs font-bold transition-all',
                              workingCapitalMonths === m
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                            )}
                          >
                            {m} Ay
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bütçe Kalemleri Dağılım Tablosu */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2.5 text-xs shadow-sm">
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider text-muted-foreground">
                        Yatırım Kalemleri Dökümü
                      </h4>
                      
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-amber-500" /> Demirbaş & Cihazlar:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.equipmentTotal)}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-blue-500" /> Giriş Peşinatı (4x Kira):
                        </span>
                        <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.leaseInitialTotal)}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Tadilat & Dekorasyon ({m2} m²):
                        </span>
                        <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.fitoutTotal)}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-500" /> Resmi Ruhsat & Harçlar:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.legalFeesTotal)}</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> {workingCapitalMonths} Aylık Güvence Fonu:
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(calculationResult.workingCapitalReserve)}</span>
                      </div>
                    </div>
                  </div>

                  {/* SAĞ KOLON: KULLANICININ EKRAN GÖRÜNTÜSÜNDEKİ CANLI BÜTÇE PANELİ */}
                  <div className="space-y-3.5">
                    
                    {/* 1. TOPLAM İLK KURULUM MALİYETİ KARTI */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Calculator className="w-24 h-24 text-white" />
                      </div>

                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100 block mb-1">
                        TOPLAM İLK KURULUM MALİYETİ
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        {formatCurrency(calculationResult.totalInitialInvestment)}
                      </div>
                      <p className="text-[11px] text-amber-100/90 mt-1">
                        Mekan, demirbaş, harçlar ve {workingCapitalMonths} aylık güvence fonu dahil.
                      </p>

                      <div className="mt-3.5 pt-3 border-t border-amber-400/30 flex items-center justify-between text-[11px] text-amber-100">
                        <span>Demirbaş: {Math.round((calculationResult.equipmentTotal / (calculationResult.totalInitialInvestment || 1)) * 100)}%</span>
                        <span>Mekan: {Math.round(((calculationResult.leaseInitialTotal + calculationResult.fitoutTotal) / (calculationResult.totalInitialInvestment || 1)) * 100)}%</span>
                        <span>Fon: {Math.round((calculationResult.workingCapitalReserve / (calculationResult.totalInitialInvestment || 1)) * 100)}%</span>
                      </div>
                    </div>

                    {/* 2. AYLIK SABİT İŞLETME GİDERİ KARTI */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          AYLIK SABİT İŞLETME GİDERİ
                        </span>
                        <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          {formatCurrency(calculationResult.monthlyOperatingCost)} / Ay
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-zinc-300">
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-muted-foreground block text-[10px]">Kira + Stopaj</span>
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {formatCurrency(Math.round(calculationResult.monthlyRent * 1.2))}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-muted-foreground block text-[10px]">Personel (SGK Dahil)</span>
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {formatCurrency(calculationResult.monthlyStaffCost)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-muted-foreground block text-[10px]">Fatura & Aidat</span>
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {formatCurrency(calculationResult.monthlyUtilities)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-muted-foreground block text-[10px]">Muhasebe & Yazılım</span>
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {formatCurrency(calculationResult.monthlyAccounting + calculationResult.monthlySoftware)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. BAŞABAŞ NOKTASI HEDEFİ KARTI */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Başabaş Noktası Hedefi</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                          {calculationResult.dailyBreakEvenCount}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          {calculationResult.breakEvenMetric.unitLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900/80 dark:text-emerald-400/90 leading-tight">
                        {calculationResult.breakEvenMetric.label} bazında aylık sabit giderleri karşılamak için gereken asgari işlem hacmi.
                      </p>
                    </div>

                    {/* 4. AKSİYON BUTONLARI & YASAL UYARI */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={handlePrintReport}
                          className="flex-1 h-10 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-md gap-2"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Kurulum Planını PDF İndir</span>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="h-10 px-3 rounded-xl text-xs font-semibold border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                          <Link href="/kategori/hizmetler" title="Pazar Yerinde Usta & Hizmet Bul">
                            <Wrench className="w-3.5 h-3.5 text-amber-500" />
                          </Link>
                        </Button>
                      </div>

                      <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 text-[10px] text-muted-foreground leading-relaxed">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Yasal Not:</strong> Bu veriler bölgesel ticari göstergeler ve sektörel standartlar baz alınarak üretilen simülasyondur; resmi yatırım tavsiyesi değildir.
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* Alt İlerleme Çubuğu & Adım Geçiş Butonları */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      activeStep === i
                        ? 'w-8 bg-amber-500'
                        : activeStep > i
                        ? 'w-4 bg-emerald-500'
                        : 'w-2 bg-slate-200 dark:bg-zinc-700'
                    )}
                    aria-label={`Adım ${i}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {activeStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    className="h-8 px-3 rounded-xl text-xs font-semibold"
                  >
                    Önceki Adım
                  </Button>
                )}

                {activeStep < 6 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveStep((prev) => prev + 1)}
                    className="h-8 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 gap-1.5"
                  >
                    <span>{STEPS[activeStep]?.label} Adımına Geç</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handlePrintReport}
                    className="h-8 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-sm gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Planı Yazdır / Kaydet</span>
                  </Button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
