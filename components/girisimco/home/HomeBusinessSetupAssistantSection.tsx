'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Printer,
  ChevronRight,
  Search,
  RotateCcw,
  ShieldCheck,
  Store,
  DollarSign,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
  ChevronDown
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
  calculateLeaseInitialCost,
} from '@/features/business-setup/data/district-rental-rates';
import {
  calculateBusinessSetupBudget,
} from '@/features/business-setup/services/business-setup-calculator.service';
import type {
  BusinessTemplate,
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

  // Active step
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

      {/* 2. ANA ASİSTAN KOKPİTİ (3 ENTEGRE SÜTUNLU YAPI) */}
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
                  const Icon = step.icon;
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
                  Seçili İşletme Modeli
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
                      {activeTemplate.categoryGroup}
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
                className="flex-1 h-9 rounded-xl text-xs font-medium"
              >
                Geri
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                className="flex-1 h-9 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20"
              >
                {activeStep === 6 ? 'Başa Dön' : 'Devam Et'}
              </Button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. ORTA SÜTUN: DİNAMİK ADIM ÇALIŞMA ALANI & ETKİLEŞİM (lg:col-span-5)     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-zinc-800/80 pb-5 lg:pb-0 lg:pr-5 min-h-[500px]">
            
            {/* ADIM 1: SEKTÖR & İL/İLÇE */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span>01. Sektör & Faaliyet Lokasyonu</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kurmayı planladığınız iş türünü ve şehri seçin; demirbaş ve maliyetler otomatik dolacaktır.
                  </p>
                </div>

                {/* Konum Seçimi (İl ve İlçe) */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      İl (81 İl Endeksi)
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      {cityOptions.map((c) => (
                        <option key={c} value={c}>
                          {c} ({TURKEY_CITY_RENTAL_RATES[c]?.plate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      İlçe / Bölge
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      {districtOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sektör Kategorileri Tab Bar */}
                <div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {['Tümü', ...getAllCategoryGroups()].map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setSelectedCategoryGroup(grp)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors',
                          selectedCategoryGroup === grp
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        )}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>

                  {/* Sektör Arama Input */}
                  <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Sektör veya meslek ara (örn: kafe, oto yıkama, sigorta)..."
                      value={sectorSearchQuery}
                      onChange={(e) => setSectorSearchQuery(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                {/* Sektör Kartları Seçim Izgarası */}
                <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = tpl.id === selectedTemplateId;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={cn(
                          'w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all',
                          isSelected
                            ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500/60 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{tpl.emoji}</span>
                          <div className="min-w-0">
                            <p className={cn('text-xs font-bold truncate', isSelected ? 'text-amber-900 dark:text-amber-200' : 'text-slate-800 dark:text-zinc-200')}>
                              {tpl.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {tpl.categoryGroup} • Ort. {tpl.defaultM2} m²
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
                            Seç
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ADIM 2: MEKAN & KİRA */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>02. Mekan Alanı, Kira & Tadilat Planı</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCity} / {selectedDistrict} bölgesi ticari m² kira endeksine göre anlık hesaplanır.
                  </p>
                </div>

                {/* m² Ayar Kartı */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                        İşletme Alanı (Metrekare)
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Sektör standardı: {activeTemplate.defaultM2} m²
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
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
                    max={300}
                    step={5}
                    value={m2}
                    onChange={(e) => setM2(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Kira ve Taşınma Peşinatı Detayı */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Bölgesel Kira Çarpanı:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {getDistrictRentalRate(selectedCity, selectedDistrict)} ₺ / m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Aylık Tahmini Kira:</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">
                      {formatCurrency(calculationResult.monthlyRent)} / Ay
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">İlk Giriş Peşinatı (1 Kira + 2 Depozito + 1 Emlak):</span>
                    <span className="font-extrabold text-slate-900 dark:text-zinc-100">
                      {formatCurrency(calculationResult.leaseInitialTotal)}
                    </span>
                  </div>

                  {/* Manuel Kira Girişi Toggle */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/60">
                    <button
                      type="button"
                      onClick={() => setIsCustomRent(!isCustomRent)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isCustomRent ? '✓ Bölgesel Kira Endeksine Dön' : '✏️ Kendi Kira Tutarımı Gireceğim'}
                    </button>

                    {isCustomRent && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Aylık kira tutarı (₺)..."
                          value={customMonthlyRent}
                          onChange={(e) => setCustomMonthlyRent(e.target.value ? Number(e.target.value) : '')}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tadilat & Dekorasyon */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeFitout}
                        onChange={(e) => setIncludeFitout(e.target.checked)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>Tadilat & İç Mimari Dekorasyon</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground block ml-5">
                      Birim: {formatCurrency(customFitoutRate)} / m²
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                    {formatCurrency(calculationResult.fitoutTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* ADIM 3: EKİP & PERSONEL */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>03. Ekip, Personel & SGK Bordro Maliyeti</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    İşletme için önerilen kadro ve aylık işveren maliyeti hesaplanır.
                  </p>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {staffList.map((st, idx) => (
                    <div
                      key={st.role}
                      className="p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3"
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
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Net Maaş: {formatCurrency(st.avgSalary)} / Ay • SGK Dahil: {formatCurrency(Math.round(st.avgSalary * 1.225))}
                        </p>
                      </div>

                      {/* Sayı Arttır / Azalt */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateStaffCount(idx, -1)}
                          disabled={st.isMandatory && st.count <= 1}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {st.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStaffCount(idx, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Aylık Toplam Personel Gideri:</span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400">
                    {formatCurrency(calculationResult.monthlyStaffCost)} / Ay
                  </span>
                </div>
              </div>
            )}

            {/* ADIM 4: DEMİRBAŞ & CİHAZ */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-500" />
                      <span>04. Demirbaş, Ekipman & Makine Parkuru</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sektöre özel mevzuat ve operasyonel ekipman listesi.
                    </p>
                  </div>
                </div>

                {/* Ekipman Listesi */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {equipmentList.map((eq) => (
                    <div
                      key={eq.id}
                      className={cn(
                        'p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3',
                        eq.selected
                          ? 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                          : 'bg-slate-50/50 dark:bg-zinc-900/40 border-dashed border-slate-200 dark:border-zinc-800 opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {eq.isLocked ? (
                          <div title="Mevzuat gereği zorunlu demirbaş" className="p-1 rounded bg-amber-500/10 text-amber-600">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={eq.selected}
                            onChange={() => handleToggleEquipment(eq.id)}
                            className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {eq.name}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground">
                            Birim: {formatCurrency(eq.unitCost)} / {eq.unitLabel}
                          </p>
                        </div>
                      </div>

                      {/* Adet Sayacı */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateEquipmentQty(eq.id, -1)}
                          disabled={eq.isLocked && eq.qty <= eq.minQty}
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {eq.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateEquipmentQty(eq.id, 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="w-20 text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                          {formatCurrency(eq.selected ? eq.unitCost * eq.qty : 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Toplam Demirbaş Bedeli:</span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400">
                    {formatCurrency(calculationResult.equipmentTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* ADIM 5: RUHSAT & RESMİ HARÇLAR */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>05. Resmi Ruhsat, Tescil & İzin Harçları</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Belediye, itfaiye ve meslek odası yasal zorunlu açılış giderleri.
                  </p>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {legalFeesList.map((fee, idx) => (
                    <div
                      key={fee.name}
                      className={cn(
                        'p-3 rounded-2xl border transition-all flex items-center justify-between gap-3',
                        fee.selected
                          ? 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                          : 'bg-slate-50/50 dark:bg-zinc-900/40 border-dashed border-slate-200 dark:border-zinc-800 opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={fee.selected}
                          onChange={() => handleToggleLegalFee(idx)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {fee.name}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground truncate">
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

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Toplam Resmi Ruhsat & Harçlar:</span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400">
                    {formatCurrency(calculationResult.legalFeesTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* ADIM 6: FİZİBİLİTE & BÜTÇE PLANI */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>06. Fizibilite & Bütçe Yönetimi</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    İşletme sermayesi güvence fonu ve genel maliyet dağılımı.
                  </p>
                </div>

                {/* Güvence Fonu Ayarı */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      İşletme Sermayesi Güvence Fonu
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      {workingCapitalMonths} Aylık Sabit Gider ({formatCurrency(calculationResult.workingCapitalReserve)})
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    İlk aylarda gelir düzensizliğine karşı kasanızda tutmanız önerilen nakit tamponu.
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
                            : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                        )}
                      >
                        {m} Ay
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bütçe Pasta Dağılım Listesi */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                    <span className="text-muted-foreground">🔧 Demirbaş & Ekipman:</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.equipmentTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                    <span className="text-muted-foreground">🏢 Taşınma & Kira Peşinatı:</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.leaseInitialTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                    <span className="text-muted-foreground">🎨 Tadilat & Dekorasyon:</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.fitoutTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                    <span className="text-muted-foreground">📜 Resmi Ruhsat & Harçlar:</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(calculationResult.legalFeesTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">🛡️ {workingCapitalMonths} Aylık Güvence Fonu:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(calculationResult.workingCapitalReserve)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* C. SAĞ SÜTUN: CANLI BÜTÇE & GİRİŞİMBEE ENTEGRASYONU (lg:col-span-4)         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              
              {/* 1. TOPLAM İLK KURULUM MALİYETİ KARTI */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Calculator className="w-24 h-24 text-white" />
                </div>

                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100 block mb-1">
                  Toplam İlk Kurulum Maliyeti
                </span>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {formatCurrency(calculationResult.totalInitialInvestment)}
                </div>
                <p className="text-[11px] text-amber-100/90 mt-1">
                  Mekan, demirbaş, harçlar ve {workingCapitalMonths} aylık güvence fonu dahil.
                </p>

                {/* Mini Dağılım Çubuğu */}
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
                    Aylık Sabit İşletme Gideri
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

              {/* 3. BAŞABAŞ NOKTASI (BREAK-EVEN) KARTI */}
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

            </div>

            {/* 4. AKSİYON BUTONLARI & YASAL UYARI */}
            <div className="space-y-3 pt-2">
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

              {/* Yasal Uyarı Metni */}
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
    </section>
  );
}
