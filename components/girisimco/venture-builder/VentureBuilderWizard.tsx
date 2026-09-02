'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Car,
  Home,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building,
  HelpCircle,
  Percent,
  Calculator,
  Flame,
  ChevronRight,
  ChevronLeft,
  FileText,
  Share2,
  MapPin,
  Briefcase,
  Layers,
  Award,
  Package,
  Wrench,
  Palette,
  RefreshCw,
  Users,
  Target,
} from 'lucide-react';
import { useVentureBuilderStore } from '@/lib/stores/venture-builder-store';
import {
  VentureCategory,
  WorkspaceType,
  VehicleType,
} from '@/lib/types/venture-builder';
import { TURKEY_CITY_RENTAL_RATES } from '@/features/business-setup/data/district-rental-rates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CATEGORIES: VentureCategory[] = [
  'Evcil Hayvan & Yaşam',
  'Deneyim & Etkinlik',
  'Zanaat & Hatıra',
  'Tasarım & Hediyelik',
  'Kozmetik & Deneyim',
  'Yayıncılık & Çocuk',
  'Otomotiv & Mobil Enerji',
  'Otomotiv & Yerinde Servis',
  'Yiyecek & İçecek',
  'Teknoloji & Dijital Servis',
  'Hizmet & Temizlik',
  'Diğer Niş Girişim',
];

const BUSINESS_MODELS = [
  {
    id: 'product_craft',
    title: 'Ürün & Zanaat',
    desc: 'Evde/atölyede üretim, kargo/online satış',
    icon: Package,
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'mobile_service',
    title: 'Mobil Hizmet',
    desc: 'Araçla müşterinin adresinde yerinde servis',
    icon: Car,
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'subscription_box',
    title: 'Abonelik Kutusu',
    desc: 'Periyodik düzenli teslimat & paket modeli',
    icon: RefreshCw,
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'experience_event',
    title: 'Deneyim & Pop-Up',
    desc: 'Kişiye özel mekan kurulumu & organizasyon',
    icon: Sparkles,
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'light_commercial' as VehicleType,
  },
  {
    id: 'digital_hybrid',
    title: 'Dijital & Hibrit',
    desc: 'Yazılım, tasarım, içerik veya uzaktan danışmanlık',
    icon: Calculator,
    defaultWorkspace: 'virtual_mobile' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'custom_niche',
    title: 'Özel Çözüm',
    desc: 'Sektöre veya kişiye özel yenilikçi iş modeli',
    icon: Wrench,
    defaultWorkspace: 'garage_workshop' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
];

const WORKSPACES: { id: WorkspaceType; label: string; desc: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Kendi Evim / Odam', desc: 'Kira masrafı ₺0 (Mutfak, oda veya masa)', icon: Home },
  { id: 'garage_workshop', label: 'Garaj / Özel Atölye', desc: 'Müstakil alan veya hobi atölyesi (₺0 Kira)', icon: Building },
  { id: 'client_location', label: 'Müşteri Yerinde / Sahada', desc: 'Müşterinin bahçesinde, sitesinde veya plazada', icon: Sparkles },
  { id: 'virtual_mobile', label: 'Tamamen Sanal / Dijital', desc: 'Sadece bilgisayar ve internet altyapısı', icon: Calculator },
  { id: 'rented_shop', label: 'Kiralık Dükkan / Butik', desc: 'Fiziksel vitrin ve müşteri kabul alanı', icon: Building },
];

const VEHICLES: { id: VehicleType; label: string; desc: string; icon: typeof Car }[] = [
  { id: 'personal_car', label: 'Şahsi Binek Aracım', desc: 'Bagaj ve arka koltuk operasyon için hazır', icon: Car },
  { id: 'light_commercial', label: 'Hafif Ticari / Panelvan', desc: 'Doblo, Caddy, Transit vb. geniş yük hacmi', icon: Car },
  { id: 'motorcycle', label: 'Motosiklet / Kurye', desc: 'Hızlı şehir içi teslimat ve servis', icon: Flame },
  { id: 'none', label: 'Taşıtsız (Kargo / Online)', desc: 'Anlaşmalı kargo veya dijital teslimat', icon: Sparkles },
];

export function VentureBuilderWizard() {
  const {
    currentStep,
    draft,
    setCurrentStep,
    nextStep,
    prevStep,
    updateBasicInfo,
    updateCollateral,
    updateBudget,
    updateFinancials,
    submitDraftForReview,
  } = useVentureBuilderStore();

  const [selectedModelType, setSelectedModelType] = useState<string>('product_craft');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Şehir / İlçe listesi
  const cityOptions = useMemo(() => Object.keys(TURKEY_CITY_RENTAL_RATES), []);
  const currentCityKey = draft.authorCity || 'İstanbul';
  const districtOptions = useMemo(() => {
    return Object.keys(TURKEY_CITY_RENTAL_RATES[currentCityKey]?.districtRates || { Merkez: 1000 });
  }, [currentCityKey]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>(districtOptions[0] || 'Kadıköy');

  const handleCityChange = (city: string) => {
    updateBasicInfo({ authorCity: city });
    const newDistricts = Object.keys(TURKEY_CITY_RENTAL_RATES[city]?.districtRates || {});
    setSelectedDistrict(newDistricts[0] || 'Merkez');
  };

  const handleSelectBusinessModel = (model: (typeof BUSINESS_MODELS)[number]) => {
    setSelectedModelType(model.id);
    updateCollateral({
      workspaceType: model.defaultWorkspace,
      vehicleType: model.defaultVehicle,
    });
  };

  const handleSubmit = () => {
    submitDraftForReview();
    setIsSubmitted(true);
  };

  const stepsList = [
    { num: 1, title: 'Fikir & Özgün Konsept', desc: 'Model tipi, tanım & pazar açığı' },
    { num: 2, title: 'Masaya Koyduklarım', desc: 'Şahsi araç, mekan & emek' },
    { num: 3, title: 'Aranan Bütçe', desc: 'Ekipman, stok & reklam fonu' },
    { num: 4, title: 'Gelir & Kâr Payı', desc: 'Ciro, net kâr & amortisman' },
    { num: 5, title: 'Önizleme & Onay', desc: 'Fizibilite, AI skoru & gönderim' },
  ];

  // Yatırımcı Aylık Getirisi Hesabı
  const monthlyInvestorReturn = Math.round(
    (draft.financials.estimatedMonthlyNetProfit || 0) *
      ((draft.financials.offeredInvestorSharePercent || 35) / 100)
  );

  const formatCurrency = (val?: number) => {
    if (!val) return '₺0';
    return `₺${val.toLocaleString('tr-TR')}`;
  };

  const formatCurrencyShort = (val?: number) => {
    if (!val) return '₺0';
    if (val >= 1000000) return `₺${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₺${Math.round(val / 1000)}k`;
    return `₺${val}`;
  };

  if (isSubmitted) {
    return (
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 p-8 sm:p-12 shadow-xl backdrop-blur-md text-center max-w-3xl mx-auto my-6">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Fizibilite İncelemeye Alındı
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground">
          &quot;{draft.title || 'Özgün Girişim Fikri'}&quot; Başarıyla Modellendi!
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
          Özgün fizibilite ve kâr projeksiyonu verileriniz Girişimbee moderasyon ekibine iletildi. Onaylandıktan hemen sonra{' '}
          <strong className="text-slate-900 dark:text-white">Girişimbee Yatırımcı & Ortaklık Vitrininde</strong> yayına
          alınacaktır.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl h-11 px-6 shadow-sm">
            <Link href="/girisim-ortaklik">Yatırım & Ortaklık Havuzunu İncele</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl h-11 px-6">
            <Link href="/trend-fikirler">Trend Fikirlere Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isFinalStep = currentStep === 5;

  return (
    <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ===================================================================== */}
        {/* A. SOL SÜTUN: LOKASYON & 5 ADIMLI STEPPER (lg:col-span-3)             */}
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
                  value={draft.authorCity || 'İstanbul'}
                  onChange={(e) => handleCityChange(e.target.value)}
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

            {/* 2. 5 Adımlı Dikey Stepper Menüsü */}
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-1 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Modelleme Adımları
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {currentStep} / 5
                </span>
              </div>

              {stepsList.map((st) => {
                const isActive = currentStep === st.num;
                const isPassed = currentStep > st.num;
                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => setCurrentStep(st.num)}
                    className={cn(
                      'w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-white dark:bg-zinc-800/90 shadow-sm border border-slate-200/90 dark:border-zinc-700/80 ring-1 ring-amber-500/20'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-400'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                        )}
                      >
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.num}
                      </span>
                      <div className="min-w-0">
                        <span
                          className={cn(
                            'block text-xs font-bold truncate leading-tight',
                            isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'
                          )}
                        >
                          {st.title}
                        </span>
                        <span className="block text-[10.5px] text-muted-foreground truncate mt-0.5">
                          {st.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-3.5 h-3.5 shrink-0 transition-transform',
                        isActive ? 'text-amber-500 translate-x-0.5' : 'text-slate-300 dark:text-zinc-600'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sol Alt: Girişimci Özkaynak Özeti */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Girişimcinin Özkaynakları:
              </span>
              <div className="space-y-1 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {draft.collateral.vehicleType === 'personal_car'
                      ? 'Şahsi Binek Araç Hazır'
                      : draft.collateral.vehicleType === 'light_commercial'
                      ? 'Hafif Ticari Araç Hazır'
                      : draft.collateral.vehicleType === 'motorcycle'
                      ? 'Motosiklet / Kurye Hazır'
                      : 'Taşıtsız Model'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Home className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">
                    {draft.collateral.workspaceType === 'home'
                      ? 'Ev / Mutfak (₺0 Kira)'
                      : draft.collateral.workspaceType === 'garage_workshop'
                      ? 'Özel Atölye / Garaj (₺0 Kira)'
                      : draft.collateral.workspaceType === 'virtual_mobile'
                      ? 'Sanal / Dijital Altyapı'
                      : 'Müşteri Sahası'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-purple-600 shrink-0" />
                  <span>{draft.collateral.hoursPerWeek} Saat / Hafta Emek</span>
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>2026 Güvencesi:</strong> Özgün fikriniz korunur, sadece doğrulanmış yatırımcılarla eşleştirilir.
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* B. ORTA SÜTUN: ÖZGÜN FİKİR MODELLEME ÇALIŞMA ALANI                   */}
        {/* ===================================================================== */}
        <div
          className={cn(
            'flex flex-col justify-between space-y-4',
            isFinalStep ? 'lg:col-span-5' : 'lg:col-span-9'
          )}
        >
          <div>
            {/* Üst Başlık & Dinamik Bilgilendirme */}
            <div className="mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 inline-flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Özgün İş Fikri Modelleme Stüdyosu
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Adım {currentStep} / 5
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {stepsList[currentStep - 1]?.title}
              </h3>
            </div>

            {/* =============================================================== */}
            {/* ADIM 1: FİKİR & ÖZGÜN KONSEPT (SADELEŞTİRİLMİŞ & GÖRÜNÜR DİZAYN) */}
            {/* =============================================================== */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* 1. İşletme / Model Türü Seçimi (Daha Sade, Yüksek Kontrastlı ve Geniş) */}
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-2.5">
                    1. Aklındaki İş Fikrinin Türünü Seç:
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {BUSINESS_MODELS.map((model) => {
                      const isSelected = selectedModelType === model.id;
                      const Icon = model.icon;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => handleSelectBusinessModel(model)}
                          className={cn(
                            'p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[5.25rem]',
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-2 ring-amber-500/40 text-slate-950 dark:text-white'
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-slate-300 text-slate-700 dark:text-zinc-200'
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-xl transition-colors',
                                isSelected
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            )}
                          </div>
                          <div className="mt-2">
                            <span className="block text-xs sm:text-sm font-bold leading-tight">
                              {model.title}
                            </span>
                            <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                              {model.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Fikir Başlığı & Kategori (Daha Görünür & Yüksek Hiyerarşi) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
                  <div className="sm:col-span-8">
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1">
                      Fikir / Proje Başlığı (Marka Taslağı) *
                    </Label>
                    <Input
                      placeholder="Örn: Butik Kahve & Çekirdek Aboneliği"
                      value={draft.title}
                      onChange={(e) => updateBasicInfo({ title: e.target.value })}
                      className="h-11 rounded-xl text-sm font-medium border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1">
                      Sektör / Kategori *
                    </Label>
                    <select
                      value={draft.category}
                      onChange={(e) => updateBasicInfo({ category: e.target.value as VentureCategory })}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Tek Cümlelik Değer Önerisi */}
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1">
                    Tek Cümlelik Çarpıcı Konsept (Müşteriye Ne Sunacaksın?) *
                  </Label>
                  <Input
                    placeholder="Örn: Plazalara ve ev ofislere haftalık taze kavrulmuş nitelikli çekirdek kahve ve demleme seti teslimatı."
                    value={draft.oneLiner}
                    onChange={(e) => updateBasicInfo({ oneLiner: e.target.value })}
                    className="h-11 rounded-xl text-sm font-medium border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                {/* 4. Pazardaki Açık & Fırsat Analizi */}
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1">
                    Pazardaki Açık / Bu Fikir Neden Tutar? (Fırsat Analizi) *
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="Örn: İnsanlar kaliteli kahveye ulaşmak istiyor fakat zincir kafelerde yüksek fiyatlar ödüyor. Düzenli abonelik modeliyle sabit ve öngörülebilir nakit akışı sağlar..."
                    value={draft.whyItWorks}
                    onChange={(e) => updateBasicInfo({ whyItWorks: e.target.value })}
                    className="rounded-xl text-sm font-medium border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 resize-none"
                  />
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* ADIM 2: MASAYA KOYDUKLARIN (MEKAN & TAŞIT & EMEK)               */}
            {/* =============================================================== */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 block">
                    1. Çalışma & Üretim Alanı (Mekan Seçimi)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {WORKSPACES.map((ws) => {
                      const isSelected = draft.collateral.workspaceType === ws.id;
                      const Icon = ws.icon;
                      return (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => updateCollateral({ workspaceType: ws.id })}
                          className={cn(
                            'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5',
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-slate-300 text-slate-700 dark:text-zinc-200'
                          )}
                        >
                          <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-amber-600' : 'text-slate-400')} />
                          <div>
                            <span className="block text-xs sm:text-sm font-bold leading-tight">
                              {ws.label}
                            </span>
                            <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                              {ws.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 block">
                    2. Lojistik & Taşıt İmkânı
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {VEHICLES.map((vh) => {
                      const isSelected = draft.collateral.vehicleType === vh.id;
                      const Icon = vh.icon;
                      return (
                        <button
                          key={vh.id}
                          type="button"
                          onClick={() => updateCollateral({ vehicleType: vh.id })}
                          className={cn(
                            'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5',
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-slate-300 text-slate-700 dark:text-zinc-200'
                          )}
                        >
                          <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-amber-600' : 'text-slate-400')} />
                          <div>
                            <span className="block text-xs sm:text-sm font-bold leading-tight">
                              {vh.label}
                            </span>
                            <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                              {vh.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5 block">
                    3. Haftalık Ayırabileceğin Çalışma Saati (Bizzat Emek)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={5}
                      max={80}
                      value={draft.collateral.hoursPerWeek}
                      onChange={(e) => updateCollateral({ hoursPerWeek: Number(e.target.value) || 40 })}
                      className="w-28 h-11 rounded-xl font-bold text-sm"
                    />
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300">
                      Saat / Hafta (Tam zamanlı operasyonel emek: 40-50 saat)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* ADIM 3: ARANAN BÜTÇE İHTİYACI                                   */}
            {/* =============================================================== */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Ekipman & Cihaz Bütçesi (₺)
                    </Label>
                    <Input
                      type="number"
                      placeholder="35000"
                      value={draft.budget.equipmentCost || ''}
                      onChange={(e) => updateBudget({ equipmentCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      İlk 3 Aylık Hammadde / Stok (₺)
                    </Label>
                    <Input
                      type="number"
                      placeholder="15000"
                      value={draft.budget.initialStockCost || ''}
                      onChange={(e) => updateBudget({ initialStockCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Başlangıç Reklam & Tanıtım (₺)
                    </Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={draft.budget.marketingCost || ''}
                      onChange={(e) => updateBudget({ marketingCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Tampon & İşletme Bütçesi (₺)
                    </Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={draft.budget.operatingBufferCost || ''}
                      onChange={(e) => updateBudget({ operatingBufferCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
                      Toplam Aranan Yatırım Bütçesi:
                    </span>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                      Yatırımcıdan talep edilecek net sermaye tutarı
                    </p>
                  </div>
                  <span className="font-display text-2xl font-black text-amber-600 dark:text-amber-400">
                    ₺{draft.budget.totalRequiredCapital.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* ADIM 4: GELİR & KÂR PAYI ORTAKLIĞI                              */}
            {/* =============================================================== */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Tahmini Aylık Ciro (₺)
                    </Label>
                    <Input
                      type="number"
                      placeholder="85000"
                      value={draft.financials.estimatedMonthlyRevenue || ''}
                      onChange={(e) => updateFinancials({ estimatedMonthlyRevenue: Number(e.target.value) || 0 })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Tahmini Aylık Net Kâr (₺)
                    </Label>
                    <Input
                      type="number"
                      placeholder="55000"
                      value={draft.financials.estimatedMonthlyNetProfit || ''}
                      onChange={(e) => updateFinancials({ estimatedMonthlyNetProfit: Number(e.target.value) || 0 })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Yatırımcıya Önerilen Net Kâr Payı Oranı (%)
                    </Label>
                    <span className="font-display text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      %{draft.financials.offeredInvestorSharePercent}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={draft.financials.offeredInvestorSharePercent}
                    onChange={(e) => updateFinancials({ offeredInvestorSharePercent: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-semibold">
                    <span>%10</span>
                    <span>%30 - %35 (Dengeli Teklif)</span>
                    <span>%50</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Yatırımcının Parasını Çıkarma Hızı (Amortisman):
                    </span>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Aylık {formatCurrency(monthlyInvestorReturn)} kâr payı ile geri dönüş
                    </p>
                  </div>
                  <span className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ~{draft.financials.calculatedPaybackMonths} Ay
                  </span>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* ADIM 5: İLETİŞİM & SON ONAY (SON SAYFA)                          */}
            {/* =============================================================== */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block mb-1">📋 Fikir Fizibiliteniz Hazırlandı!</span>
                  Sağ taraftaki AI Yatırım Skoru ve Finansal Özetinizi kontrol ettikten sonra bilgilerinizi girerek moderasyon onayına gönderebilirsiniz.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Adınız & Soyadınız *
                    </Label>
                    <Input
                      placeholder="Örn: Uğur Zaman"
                      value={draft.authorName}
                      onChange={(e) => updateBasicInfo({ authorName: e.target.value })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Telefon Numaranız *
                    </Label>
                    <Input
                      placeholder="05XX XXX XX XX"
                      value={draft.authorPhone || ''}
                      onChange={(e) => updateBasicInfo({ authorPhone: e.target.value })}
                      className="mt-1 h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    E-Posta Adresiniz *
                  </Label>
                  <Input
                    type="email"
                    placeholder="girisimci@ornek.com"
                    value={draft.authorEmail || ''}
                    onChange={(e) => updateBasicInfo({ authorEmail: e.target.value })}
                    className="mt-1 h-11 rounded-xl text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1" />
                  Özgün modeliniz moderasyon onayından geçtikten sonra <strong>Girişimbee Yatırım & Ortaklık Havuzunda</strong> doğrulanmış olarak canlıya alınacaktır.
                </div>
              </div>
            )}
          </div>

          {/* Alt Stepper Navigasyon Çubuğu */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="h-11 rounded-xl px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 border-slate-200"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Önceki Adım
              </Button>
            ) : (
              <div />
            )}

            {/* Adım İlerleme Noktaları */}
            <div className="flex items-center gap-1.5">
              {stepsList.map((st) => (
                <span
                  key={st.num}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    currentStep === st.num
                      ? 'w-6 bg-amber-500'
                      : currentStep > st.num
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-200 dark:bg-zinc-700'
                  )}
                />
              ))}
            </div>

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-11 rounded-xl px-6 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
              >
                Sonraki Adım
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="h-11 rounded-xl px-6 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Admin Onayına Gönder
              </Button>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* C. SAĞ SÜTUN: SADECE SON SAYFADA GÖSTERİLEN FİZİBİLİTE & YATIRIM KOKPİTİ */}
        {/* ===================================================================== */}
        {isFinalStep && (
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3.5 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-zinc-800/80 pt-5 lg:pt-0 lg:pl-5 animate-in fade-in duration-300">
            <div className="space-y-3">
              {/* 1. AI Yatırımcı Çekicilik Skoru */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    AI Yatırım Skoru
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    Yüksek Verimlilik
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black text-slate-900 dark:text-white">9.4</span>
                  <span className="text-xs font-bold text-slate-400">/ 10</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-zinc-300">
                    <span>Özkaynak Güç Endeksi</span>
                    <span className="text-emerald-600 font-black">%92</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight pt-1">
                    Mekan ve araç maliyeti sıfırlandığı için yatırımcı riski minimumdur.
                  </p>
                </div>
              </div>

              {/* 2. Ortaklık & Yatırım Şartı */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 p-3.5 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    Ortaklık Modeli
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    Doğrulanmış
                  </span>
                </div>

                <div className="pt-1 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aranan Sermaye:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrencyShort(draft.budget.totalRequiredCapital)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yatırımcı Payı:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      %{draft.financials.offeredInvestorSharePercent} Net Kâr
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Canlı Finansal Özet */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 p-3.5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Finansal Özet (Canlı)
                </span>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                    <span className="text-muted-foreground">Aylık Net Kâr:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(draft.financials.estimatedMonthlyNetProfit)} / Ay
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                    <span className="text-muted-foreground">Yatırımcı Getirisi:</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(monthlyInvestorReturn)} / Ay
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-700 text-slate-900 dark:text-white font-bold">
                    <span>Tahmini Amortisman:</span>
                    <span className="text-emerald-600">~{draft.financials.calculatedPaybackMonths} Ay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Alt Aksiyon Butonları */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Yatırım Çağrısını Başlat
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="w-full h-10 rounded-xl text-xs font-semibold border-slate-200 dark:border-zinc-700"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Fizibilite Özeti Yazdır
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* D. ALT BİLGİ ŞERİDİ (FOOTER STRIP)                                       */}
      {/* ========================================================================= */}
      <div className="mt-5 pt-3.5 border-t border-slate-200/70 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Şahsi araç, ev atölyesi ve tam zamanlı emek ile sıfır riskli niş girişim modelleme motoru</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            1 Eylül 2026 Güncel
          </span>
          <span>•</span>
          <span>Doğrulanmış Melek Yatırımcı & Kurucu Ortak Ağı</span>
        </div>
      </div>
    </div>
  );
}
