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
  ExternalLink,
  ShoppingBag,
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
  { id: 1, label: 'Sektör & İlçe', sub: 'İşletme türü ve konumu', icon: Building2 },
  { id: 2, label: 'Mekan & Kira', sub: 'm², kira ve tadilat', icon: Store },
  { id: 3, label: 'Demirbaş & Donanım', sub: 'Zorunlu ve konfor donanımı', icon: Wrench },
  { id: 4, label: 'İlk Stok & Emtia', sub: 'İlk mal ve ilaç/ürün alımı', icon: PackageCheck },
  { id: 5, label: 'Ekip, Ruhsat & ERP', sub: 'Bordro, harç ve sermaye', icon: FileText },
  { id: 6, label: 'Fizibilite Özeti', sub: 'Yatırım ve başabaş planı', icon: Calculator },
];

export function HomeBusinessSetupAssistantSection() {
  // Başlangıç Karşılama Sayfası Durumu (Kapak ekranı)
  const [isStarted, setIsStarted] = useState<boolean>(false);

  // 1. Sektör Grubu & Şablon State
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('Finans & Hizmet');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('sigorta-acentesi');
  const [sectorSearchQuery, setSectorSearchQuery] = useState<string>('');
  
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kadıköy');

  // Active step (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Current Template
  const activeTemplate = useMemo(() => {
    return getBusinessTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

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
  }, [activeTemplate]);

  // m² değiştiğinde yangın tüpü, klima ve masa adetlerini dinamik olarak güncelle
  useEffect(() => {
    setEquipmentList((prev) =>
      prev.map((item) => {
        if (!item.scalesWithM2 || !item.m2Ratio) return item;
        const dynamic = calculateDynamicEquipmentQty(item, m2);
        const newQty = Math.max(dynamic.minQty, item.qty, dynamic.defaultQty);
        return {
          ...item,
          minQty: dynamic.minQty,
          qty: newQty,
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

  // Ana Sektör Grubu Seçip 1. Adıma Geçme
  const handleStartWithGroup = (groupName: string) => {
    setSelectedCategoryGroup(groupName);
    const firstInGroup = getTemplatesByCategoryGroup(groupName)[0];
    if (firstInGroup) {
      setSelectedTemplateId(firstInGroup.id);
    }
    setActiveStep(1);
    setIsStarted(true);
  };

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* ========================================================================= */}
      {/* ANA ASİSTAN KOKPİT ÇERÇEVESİ                                              */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 p-5 sm:p-7 lg:p-8 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        
        {/* ----------------------------------------------------------------------- */}
        {/* KAPAK / BAŞLANGIÇ EKRANI (SEKTÖR GRUPLARI & LOKASYON SEÇİCİ)             */}
        {/* ----------------------------------------------------------------------- */}
        {!isStarted ? (
          <div className="space-y-6 sm:space-y-8">
            
            {/* 1. Üst Başlık & Açıklama */}
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                İş Kurma <span className="text-amber-500">Asistanı</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                Türkiye&apos;nin 81 ilinde ve tüm sektörlerde; mekan, demirbaş, ilk mal stoku, resmi harç, personel ve ERP yazılım bütçenizi saniyeler içinde simüle edin.
              </p>
            </div>

            {/* 2. 4 Temel Avantaj / Yetenek Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">81 İl Kira Endeksi</h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Seçtiğiniz il ve ilçenin güncel m² rayiciyle anlık 2x kira peşinatı ve kira hesabı.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Mevzuat & Demirbaş</h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  m²&apos;ye göre dinamik yangın tüpü, klima ve zengin konfor donanımları.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">İlk Mal & İlaç Stoku</h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Açılış günü için gereken ecza deposu, toptancı ve reyon başlangıç bütçesi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">2026 Mevzuat & ERP</h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Güncel asgari sermaye şartları, yazılım lisansı ve resmi harçlar.
                </p>
              </div>
            </div>

            {/* 3. ANA SEKTÖRLERDEN SEÇİM YAPMA ALANI */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-50 to-slate-100/60 dark:from-amber-500/10 dark:via-zinc-800/40 dark:to-zinc-800/20 border border-amber-500/25 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                    1. Adım: Faaliyet Göstereceğiniz Ana Sektörü ve Şehri Seçin
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Sektör grubunu seçtiğinizde altındaki tüm meslek ve işletme modelleri yüklenecektir.
                  </span>
                </div>

                {/* Hızlı İl / İlçe Seçimi */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
                    className="h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5 Ana Sektör Grubu Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {[
                  { name: 'Finans & Hizmet', emoji: '🛡️', count: 'Sigorta, Emlak, SMMM, Hukuk, Yazılım' },
                  { name: 'Yeme - İçme', emoji: '☕', count: 'Kafe, Restoran, Dönerci, Çiğköfte, Fırın' },
                  { name: 'Kişisel Bakım & Sağlık', emoji: '💊', count: 'Eczane, Kuaför, Diş Kliniği, Optik, Pilates' },
                  { name: 'Perakende & Mağazacılık', emoji: '🛒', count: 'Market, Butik, Petshop, Kırtasiye, Çiçekçi, Telefon' },
                  { name: 'Otomotiv & Sanayi', emoji: '🔍', count: 'Oto Ekspertiz, Yıkama, Lastik, Kuru Temizleme' },
                ].map((grp) => (
                  <button
                    key={grp.name}
                    type="button"
                    onClick={() => handleStartWithGroup(grp.name)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 hover:border-amber-400 hover:shadow-md hover:scale-[1.01] transition-all text-left flex items-start gap-3 group"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-zinc-700 group-hover:scale-110 transition-transform">
                      {grp.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                        {grp.name}
                      </h4>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
                        {grp.count}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all mt-1" />
                  </button>
                ))}
              </div>

              {/* Ana Başlat Butonu */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/60 dark:border-zinc-700/60">
                <span className="text-xs text-muted-foreground">
                  💡 18 ticari meslek ve işletme modeli için 2026 mevzuat şartları ve güncel kira verileri hazırdır.
                </span>

                <Button
                  type="button"
                  size="lg"
                  onClick={() => {
                    setActiveStep(1);
                    setIsStarted(true);
                  }}
                  className="w-full sm:w-auto h-11 px-6 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Akıllı Kurulum Planını Başlat</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

            </div>

          </div>
        ) : (
          /* --------------------------------------------------------------------- */
          /* ÇOK ADIMLI ASİSTAN KOKPİTİ (1 - 6 ADIMLAR)                            */
          /* --------------------------------------------------------------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* =================================================================== */}
            {/* A. SOL SÜTUN: ADIM STEPPER (lg:col-span-3)                           */}
            {/* =================================================================== */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-zinc-800/80 pb-5 lg:pb-0 lg:pr-5">
              <div>
                
                {/* Kapak Ekranına Dönüş Linki */}
                <button
                  type="button"
                  onClick={() => setIsStarted(false)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-amber-600 mb-3 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Başlangıç Ekranına Dön</span>
                </button>

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

            {/* =================================================================== */}
            {/* B. SAĞ / GENİŞ ÇALIŞMA ALANI (lg:col-span-9)                       */}
            {/* =================================================================== */}
            <div className="lg:col-span-9 flex flex-col justify-between min-h-[520px]">
              
              {/* ----------------------------------------------------------------- */}
              {/* ADIM 1: SEKTÖR & İLÇE (Meslek Listesi)                            */}
              {/* ----------------------------------------------------------------- */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        <span>01. Sektör & Meslek / Faaliyet Türü</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedCategoryGroup} altındaki işletme modelleri ve Türkiye geneli 81 il lokasyonu.
                      </p>
                    </div>

                    {/* Konum Seçiciler */}
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
                        placeholder="Meslek veya dükkan türü ara..."
                        value={sectorSearchQuery}
                        onChange={(e) => setSectorSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  </div>

                  {/* Sektör Altındaki Meslekler (3 Sütunlu Izgara) */}
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

              {/* ----------------------------------------------------------------- */}
              {/* ADIM 2: MEKAN & KİRA (m² ve Rayiç Peşinatı)                       */}
              {/* ----------------------------------------------------------------- */}
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
                      max={400}
                      step={5}
                      value={m2}
                      onChange={(e) => setM2(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* 3'lü Detay Kutuları */}
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
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        Giriş Peşinatı ({1 + depositMonths}x Kira)
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-zinc-100 mt-1 block">
                        {formatCurrency(calculationResult.leaseInitialTotal)}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground mt-0.5 block">
                        1 Peşin + {depositMonths} Depozito
                      </span>
                    </div>
                  </div>

                  {/* Manuel Kira Giriş Alanı */}
                  {isCustomRent && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block">Özel Aylık Kira Tutarı</span>
                        <span className="text-[11px] text-blue-800 dark:text-blue-300">Tuttuğunuz dükkanın net kira bedeli:</span>
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

              {/* ----------------------------------------------------------------- */}
              {/* ADIM 3: DEMİRBAŞ & DONANIM                                        */}
              {/* ----------------------------------------------------------------- */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500" />
                        <span>03. Demirbaş, Ekipman & Donanım Parkuru</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m2} m² işletme alanına göre yangın tüpü ve klima adetleri mevzuata uygun hesaplanmıştır.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsAddingCustomEq(!isAddingCustomEq)}
                      className="h-8 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm gap-1.5 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Akıllı Demirbaş Ekle</span>
                    </Button>
                  </div>

                  {/* AKILLI DEMİRBAŞ ARAMA & EKLEME MOTORU */}
                  {isAddingCustomEq && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Akıllı Demirbaş & Donanım Tanımla</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingCustomEq(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 relative">
                        {/* Arama Inputu */}
                        <div className="sm:col-span-6 relative">
                          <input
                            type="text"
                            placeholder="Ekipman ara veya yaz (Örn: masa, klima, tartı, kasa, TV)..."
                            value={customEqName}
                            onChange={(e) => {
                              setCustomEqName(e.target.value);
                              setIsSmartSuggestionsOpen(true);
                            }}
                            onFocus={() => setIsSmartSuggestionsOpen(true)}
                            className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />

                          {/* Akıllı Otomatik Öneri Açılır Listesi */}
                          {isSmartSuggestionsOpen && smartSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-700/60">
                              {smartSuggestions.map((s) => (
                                <button
                                  key={s.name}
                                  type="button"
                                  onClick={() => handleSelectSmartPreset(s)}
                                  className="w-full p-2.5 text-left hover:bg-amber-500/10 transition-colors flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{s.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{s.description}</p>
                                  </div>
                                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
                                    {formatCurrency(s.suggestedUnitCost)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            placeholder="Birim Maliyet (₺)..."
                            value={customEqCost}
                            onChange={(e) => setCustomEqCost(e.target.value ? Number(e.target.value) : '')}
                            className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddCustomEquipment}
                            className="w-full h-9 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          >
                            Listeye Ekle
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1. BÖLÜM: YASAL ZORUNLU DONANIMLAR */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                        1. Mevzuat Gereği Yasal Zorunlu Donanımlar ({mandatoryEquipments.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {mandatoryEquipments.map((eq) => (
                        <div
                          key={eq.id}
                          className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between gap-2 shadow-sm"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                              <Lock className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug whitespace-normal break-words">
                                {eq.name}
                              </h4>
                              {eq.regulatoryNote && (
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 leading-snug font-medium whitespace-normal break-words">
                                  ⚖️ {eq.regulatoryNote}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              Birim: {formatCurrency(eq.unitCost)} / {eq.unitLabel}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, -1)}
                                disabled={eq.qty <= eq.minQty}
                                title={eq.qty <= eq.minQty ? 'Mevzuat gereği asgari adedin altına inilemez' : ''}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-zinc-100">
                                {eq.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, 1)}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>

                              <span className="w-20 text-right text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                                {formatCurrency(eq.unitCost * eq.qty)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. BÖLÜM: ZENGİN KONFOR & OPERASYONEL DONANIMLAR */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                          2. Konfor, Müşteri Ağırlama & Operasyonel Donanımlar ({comfortEquipments.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        İhtiyacınıza göre seçip çıkartabilirsiniz.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                      {comfortEquipments.map((eq) => (
                        <div
                          key={eq.id}
                          className={cn(
                            'p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-sm',
                            eq.selected
                              ? 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                              : 'bg-slate-50/50 dark:bg-zinc-900/40 border-dashed border-slate-200 dark:border-zinc-800 opacity-60'
                          )}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={eq.selected}
                              onChange={() => handleToggleEquipment(eq.id)}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer shrink-0 mt-0.5"
                            />

                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug whitespace-normal break-words">
                                {eq.name}
                              </h4>
                              {eq.description && (
                                <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug whitespace-normal break-words">
                                  {eq.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              Birim: {formatCurrency(eq.unitCost)} / {eq.unitLabel}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, -1)}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-zinc-100">
                                {eq.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateEquipmentQty(eq.id, 1)}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>

                              <span className="w-20 text-right text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                                {formatCurrency(eq.selected ? eq.unitCost * eq.qty : 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200">Toplam Demirbaş & Ekipman Bedeli:</span>
                    <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                      {formatCurrency(calculationResult.equipmentTotal)}
                    </span>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* ADIM 4: İLK STOK & EMTİA ALIMI                                    */}
              {/* ----------------------------------------------------------------- */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <PackageCheck className="w-4 h-4 text-amber-500" />
                      <span>04. Başlangıç Stok & Emtia / İlaç Alım Bütçesi</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      İşletmenin kapılarını açtığında reyonları dolduracak veya üretime başlayacak ilk mal ve hammadde alım maliyetidir.
                    </p>
                  </div>

                  {/* Stok Açıklama ve Ana Kart */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-50 to-slate-100/50 dark:from-amber-500/10 dark:via-zinc-800/40 dark:to-zinc-800/20 border border-amber-500/20 space-y-4 shadow-sm">
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{activeTemplate.emoji}</span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            {activeTemplate.name} — İlk Mal / Emtia Tedarik Paketi
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeTemplate.initialInventoryDescription}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-muted-foreground block">Önerilen Stok Bütçesi</span>
                        <span className="text-xl font-black text-amber-600 dark:text-amber-400 block mt-0.5">
                          {formatCurrency(calculationResult.initialInventoryTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Stok Dahil Et / Hariç Tut & Manuel Bütçe Girişi */}
                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeInventory}
                          onChange={(e) => setIncludeInventory(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                        />
                        <span>İlk Stok Alımı Kurulum Bütçesine Dahil Edilsin</span>
                      </label>

                      {includeInventory && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsCustomInventory(!isCustomInventory)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {isCustomInventory ? '✓ Önerilen Tutara Dön' : '✏️ Özel Bütçe Belirle'}
                          </button>

                          {isCustomInventory && (
                            <input
                              type="number"
                              placeholder="Örn: 500000"
                              value={customInventoryCost}
                              onChange={(e) => setCustomInventoryCost(e.target.value ? Number(e.target.value) : '')}
                              className="w-36 h-8 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-zinc-800 px-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sektörel Bilgilendirme Notu */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 flex items-start gap-3 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Sektörel Tedarik Bilgisi:</strong> {activeTemplate.name} açılışında ana toptancılar veya ecza depoları ilk siparişlerde peşin ödeme veya teminat talep eder.
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* ADIM 5: EKİP, RUHSAT & ERP (2026 SERMAYE ŞARTI)                   */}
              {/* ----------------------------------------------------------------- */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>05. Ekip Bordrosu, ERP Yazılım Lisansı & Resmi Harçlar</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Personel SGK maliyetleri, sektörel otomasyon lisansları ve 2026 yasal sermaye yeterlilik şartları.
                    </p>
                  </div>

                  {/* 1. 2026 YASAL ASGARİ SERMAYE ŞARTI KARTI (Örn: Sigorta için 4.149.275 TL) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-amber-50/60 dark:from-blue-950/30 dark:via-zinc-800 dark:to-amber-950/20 border border-blue-200 dark:border-blue-800/40 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                          2026 Mevzuat & Sermaye Yeterliliği Şartı
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                        {activeTemplate.legalBasis}
                      </span>
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-600 dark:text-zinc-400">
                        {activeTemplate.name} kuruluşu için gereken yasal asgari sermaye / mal varlığı:
                      </span>
                      <span className="font-black text-blue-900 dark:text-blue-200 text-sm">
                        {formatCurrency(activeTemplate.statutoryCapital)}
                      </span>
                    </div>
                  </div>

                  {/* 2. SEKTÖREL ERP, POS & YAZILIM LİSANSI KARTI */}
                  {activeTemplate.softwareLicenseCost && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                              {activeTemplate.softwareLicenseCost.name}
                            </h4>
                            <p className="text-[11px] text-purple-900/80 dark:text-purple-300 mt-0.5">
                              Sektörel entegrasyon, faturalama ve bulut veri tabanı altyapısı.
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-purple-950 dark:text-purple-100 block">
                            Yıllık Lisans: {formatCurrency(activeTemplate.softwareLicenseCost.annual)}
                          </span>
                          <span className="text-[10px] text-purple-700 dark:text-purple-300 block">
                            Aylık Bakım: {formatCurrency(activeTemplate.softwareLicenseCost.monthlyMaintenance)} / Ay
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-purple-200/50 dark:border-purple-900/30 flex items-center justify-between text-xs">
                        <label className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeSoftwareLicense}
                            onChange={(e) => setIncludeSoftwareLicense(e.target.checked)}
                            className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                          <span>ERP / Yazılım Lisans Paketi Dahil Edilsin</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 3. Personel ve Harçlar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    
                    {/* Sol: Personel Kadrosu */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Önerilen Kadro & SGK Maliyeti
                      </span>

                      {staffList.map((st, idx) => {
                        const isSelfOwner = st.count === 0 && st.allowOwnerFulfillment;
                        return (
                          <div
                            key={st.role}
                            className={cn(
                              'p-3 rounded-2xl border transition-all space-y-2 shadow-sm',
                              isSelfOwner
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50'
                                : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug whitespace-normal break-words">
                                  {st.role}
                                </h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Net: {formatCurrency(st.avgSalary)} • Toplam İşveren: {formatCurrency(Math.round(st.avgSalary * 1.48))}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStaffCount(idx, -1)}
                                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold">{st.count}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStaffCount(idx, 1)}
                                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-200"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {st.allowOwnerFulfillment && (
                              <button
                                type="button"
                                onClick={() => handleToggleStaffOwner(idx)}
                                className={cn(
                                  'w-full p-1.5 rounded-lg text-[10.5px] font-semibold text-left transition-colors flex items-center gap-1.5',
                                  isSelfOwner
                                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-100 dark:bg-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                                )}
                              >
                                <CheckCircle2 className={cn('w-3 h-3 shrink-0', isSelfOwner ? 'text-emerald-600' : 'text-slate-400')} />
                                <span>{isSelfOwner ? '✓ Belge Sahibi Sizsiniz (Maaş: ₺0)' : 'Bu görevi kendim yürüteceğim'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Sağ: Resmi Harçlar */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Resmi Ruhsat & İzin Harçları
                      </span>

                      {legalFeesList.map((fee, idx) => (
                        <div
                          key={fee.name}
                          className={cn(
                            'p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 shadow-sm',
                            fee.selected
                              ? 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                              : 'bg-slate-50/50 dark:bg-zinc-900/40 border-dashed border-slate-200 opacity-60'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={fee.selected}
                              onChange={() => handleToggleLegalFee(idx)}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 whitespace-normal break-words">
                                {fee.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight whitespace-normal break-words">
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

                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* ADIM 6: FİZİBİLİTE ÖZETİ & BAŞABAŞ PROJEKSİYONU                   */}
              {/* ----------------------------------------------------------------- */}
              {activeStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-500" />
                      <span>06. Nihai Kurulum Bütçesi & Fizibilite Raporu</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeTemplate.name} için {selectedCity} / {selectedDistrict} lokasyonunda hesaplanan toplam başlangıç bütçesi ve başabaş projeksiyonu.
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
                            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> İlk Stok & Emtia Alımı:
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(calculationResult.initialInventoryTotal)}</span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Laptop className="w-3.5 h-3.5 text-purple-600" /> ERP & Yazılım Lisansı:
                          </span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">{formatCurrency(calculationResult.softwareLicenseInitial)}</span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-700/60">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-blue-500" /> Giriş Peşinatı ({1 + depositMonths}x Kira):
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
                            <FileText className="w-3.5 h-3.5 text-rose-500" /> Resmi Ruhsat & Harçlar:
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

                    {/* SAĞ KOLON: NİHAİ CANLI BÜTÇE PANELİ & BAŞABAŞ PROJEKSİYONU */}
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
                          Demirbaş, ilk stok, ERP lisansı, mekan peşinatı, harçlar ve {workingCapitalMonths} aylık güvence fonu dahil.
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-amber-400/30 grid grid-cols-3 gap-2 text-[11px] text-amber-100">
                          <div>Demirbaş: %{Math.round((calculationResult.equipmentTotal / (calculationResult.totalInitialInvestment || 1)) * 100)}</div>
                          <div>İlk Stok: %{Math.round((calculationResult.initialInventoryTotal / (calculationResult.totalInitialInvestment || 1)) * 100)}</div>
                          <div>Mekan: %{Math.round(((calculationResult.leaseInitialTotal + calculationResult.fitoutTotal) / (calculationResult.totalInitialInvestment || 1)) * 100)}</div>
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
                            <span className="text-muted-foreground block text-[10px]">Kira + %20 Stopaj</span>
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
                            <span className="text-muted-foreground block text-[10px]">Muhasebe & ERP Bakım</span>
                            <span className="font-bold text-slate-900 dark:text-zinc-100">
                              {formatCurrency(calculationResult.monthlyAccounting + calculationResult.monthlySoftware)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3. BAŞABAŞ SATIŞ / İŞLEM PROJEKSİYONU KARTI */}
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
                            {calculationResult.breakEvenMetric.unitLabel || 'Birim / Gün'}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900/80 dark:text-emerald-400/90 leading-tight">
                          {calculationResult.breakEvenMetric.label} bazında aylık sabit giderleri ({formatCurrency(calculationResult.monthlyOperatingCost)}) karşılamak için gereken asgari işlem hacmi.
                        </p>
                      </div>

                      {/* 4. AKSİYON BUTONLARI, PAZAR YERİ BAĞLANTILARI & YASAL UYARI */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => setIsPdfModalOpen(true)}
                            className="flex-1 h-10 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-md gap-2"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Kurulum Planını PDF İndir</span>
                          </Button>

                          <Button
                            asChild
                            variant="outline"
                            className="h-10 px-3 rounded-xl text-xs font-semibold border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 gap-1.5"
                          >
                            <Link href="/market" title="Girişimbee Pazar: Usta ve Demirbaş İlanları">
                              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                              <span>Pazarda Ekipman Bul</span>
                            </Link>
                          </Button>
                        </div>

                        <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 text-[10px] text-muted-foreground leading-relaxed">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>⚖️ Yasal Sorumluluk Reddi:</strong> Bu rapordaki veriler bölgesel göstergeler ve 2026 sektörel mevzuat standartları baz alınarak simüle edilmiştir; resmi yatırım tavsiyesi niteliği taşımaz.
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
                      onClick={() => setIsPdfModalOpen(true)}
                      className="h-8 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-sm gap-1.5"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Planı İndir / Yazdır</span>
                    </Button>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. YÜKSEK ÇÖZÜNÜRLÜKLÜ RESMİ KURULUM PLANI PDF / PRINT MODAL               */}
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
                    {activeTemplate.name} — Kurulum ve Fizibilite Raporu
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCity} • {selectedDistrict} | Girişimbee Akıllı Kurulum Robotu
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
                  <span className="text-muted-foreground block">Akıllı Kurulum & Fizibilite Planı</span>
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
                  <span className="text-[10.5px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">Başabaş Noktası</span>
                  <span className="text-lg font-black text-emerald-900 dark:text-emerald-100 mt-1 block">
                    {calculationResult.dailyBreakEvenCount} {calculationResult.breakEvenMetric.unitLabel || 'İşlem'}
                  </span>
                </div>
              </div>

              {/* Yasal Asgari Sermaye & Mevzuat Şartı */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                  ⚖️ 2026 Yasal Mevzuat & Sermaye Şartı: {activeTemplate.legalBasis}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 block pt-1">
                  Yasal Asgari Sermaye / Mal Varlığı Şartı: {formatCurrency(activeTemplate.statutoryCapital)}
                </span>
              </div>

              {/* İlk Stok & ERP Lisans Bilgisi */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">İlk Stok & Emtia:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(calculationResult.initialInventoryTotal)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{activeTemplate.initialInventoryDescription}</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 dark:text-purple-200">ERP & Yazılım Lisansı:</span>
                    <span className="font-black text-purple-700 dark:text-purple-300">{formatCurrency(calculationResult.softwareLicenseInitial)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{activeTemplate.softwareLicenseCost?.name}</p>
                </div>
              </div>

              {/* 1. TABLO: Demirbaş ve Donanım Parkuru */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  1. Demirbaş, Ekipman & Donanım Listesi
                </h4>
                <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-zinc-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      <th className="p-2 border border-slate-200 dark:border-zinc-700">Ekipman</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-center">Adet</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-right">Birim Fiyat</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-right">Toplam Tutar</th>
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

              {/* 2. TABLO: Personel ve Bordro SGK */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  2. Personel Kadrosu & Aylık SGK İşveren Maliyeti
                </h4>
                <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-zinc-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      <th className="p-2 border border-slate-200 dark:border-zinc-700">Pozisyon</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-center">Kişi</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-right">Net Maaş</th>
                      <th className="p-2 border border-slate-200 dark:border-zinc-700 text-right">SGK İşveren Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.filter((s) => s.count > 0).map((st) => (
                      <tr key={st.role} className="border-b border-slate-100 dark:border-zinc-800">
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 font-medium">{st.role}</td>
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 text-center">{st.count}</td>
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 text-right">{formatCurrency(st.avgSalary)}</td>
                        <td className="p-2 border border-slate-200 dark:border-zinc-700 text-right font-bold">{formatCurrency(Math.round(st.avgSalary * 1.48 * st.count))}</td>
                      </tr>
                    ))}
                    {staffList.every((s) => s.count === 0) && (
                      <tr>
                        <td colSpan={4} className="p-2 border border-slate-200 dark:border-zinc-700 text-muted-foreground text-center">
                          İşletme sahibi bizzat yürütecektir (Ek personel maliyeti ₺0).
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 dark:bg-zinc-800 font-bold">
                      <td colSpan={3} className="p-2 border border-slate-200 dark:border-zinc-700">Aylık Toplam Bordro & SGK Maliyeti</td>
                      <td className="p-2 border border-slate-200 dark:border-zinc-700 text-right text-rose-600">{formatCurrency(calculationResult.monthlyStaffCost)} / Ay</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Özet Maliyetler Dökümü */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-1.5">
                  <span className="font-bold block text-slate-800 dark:text-zinc-200">Mekan & Başlangıç Masrafları</span>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aylık Kira:</span>
                    <span className="font-semibold">{formatCurrency(calculationResult.monthlyRent)} / Ay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giriş Peşinatı (2x Kira):</span>
                    <span className="font-semibold">{formatCurrency(calculationResult.leaseInitialTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tadilat & Dekorasyon:</span>
                    <span className="font-semibold">{formatCurrency(calculationResult.fitoutTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resmi Ruhsat & Harçlar:</span>
                    <span className="font-semibold">{formatCurrency(calculationResult.legalFeesTotal)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-1.5">
                  <span className="font-bold block text-slate-800 dark:text-zinc-200">Aylık Sabit İşletme Giderleri</span>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kira + %20 Stopaj:</span>
                    <span className="font-semibold">{formatCurrency(Math.round(calculationResult.monthlyRent * 1.2))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Personel (SGK Dahil):</span>
                    <span className="font-semibold">{formatCurrency(calculationResult.monthlyStaffCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fatura & Aidat:</span>
                    <span className="font-semibold">{formatCurrency(calculationResult.monthlyUtilities)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Muhasebe & ERP/Yazılım:</span>
                    <span className="font-semibold">{formatCurrency(calculationResult.monthlyAccounting + calculationResult.monthlySoftware)}</span>
                  </div>
                </div>
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
