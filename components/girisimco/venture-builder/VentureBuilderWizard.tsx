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
  Check,
  Shield,
  User,
  Zap,
  Truck,
  Bike,
  Store,
} from 'lucide-react';
import { useVentureBuilderStore } from '@/lib/stores/venture-builder-store';
import {
  VentureCategory,
  WorkspaceType,
  VehicleType,
} from '@/lib/types/venture-builder';
import { TURKEY_CITY_RENTAL_RATES } from '@/features/business-setup/data/district-rental-rates';
import { VentureIdeaPreviewCard } from './VentureIdeaPreviewCard';
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
    desc: 'Evde/atölyede üretim, kargo ve online satış',
    icon: Package,
    colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    badgeText: 'Üretim & E-Ticaret',
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'mobile_service',
    title: 'Mobil & Yerinde Servis',
    desc: 'Şahsi araçla müşterinin adresinde yerinde hizmet',
    icon: Car,
    colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    badgeText: 'Adreste Hizmet',
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'subscription_box',
    title: 'Abonelik & Kutu',
    desc: 'Düzenli periyodik teslimat & paket modeli',
    icon: RefreshCw,
    colorClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    badgeText: 'Tekrarlayan Gelir',
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'experience_event',
    title: 'Deneyim & Pop-Up',
    desc: 'Kişiye özel mekan kurulumu, kutlama & etkinlik',
    icon: Sparkles,
    colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    badgeText: 'Etkinlik & Deneyim',
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'light_commercial' as VehicleType,
  },
  {
    id: 'digital_hybrid',
    title: 'Dijital & Hibrit',
    desc: 'Yazılım, tasarım, içerik veya uzaktan danışmanlık',
    icon: Calculator,
    colorClass: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    badgeText: 'Sıfır Sabit Maliyet',
    defaultWorkspace: 'virtual_mobile' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'custom_niche',
    title: 'Özel Çözüm & Niş',
    desc: 'Sektöre veya ihtiyaca özel yenilikçi iş fikri',
    icon: Wrench,
    colorClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    badgeText: 'Özgün İnovasyon',
    defaultWorkspace: 'garage_workshop' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
];

const WORKSPACES = [
  {
    id: 'home' as WorkspaceType,
    label: 'Kendi Evim / Mutfak',
    desc: 'Kira masrafı ₺0 (Mutfak, hobi odası veya çalışma masası)',
    badge: '₺0 Kira Maliyeti',
    icon: Home,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'garage_workshop' as WorkspaceType,
    label: 'Garaj / Özel Atölye',
    desc: 'Müstakil alan, garaj veya hobi atölyesi (₺0 Kira)',
    badge: 'Müstakil Alan',
    icon: Building,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'client_location' as WorkspaceType,
    label: 'Müşteri Sahası / Yerinde',
    desc: 'Müşterinin evinde, bahçesinde, plazada veya etkinlik alanında',
    badge: 'Mekansız Model',
    icon: Sparkles,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'virtual_mobile' as WorkspaceType,
    label: 'Tamamen Dijital / Sanal',
    desc: 'Sadece bilgisayar, tablet ve internet altyapısıyla yönetim',
    badge: 'Bulut Altyapı',
    icon: Calculator,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'rented_shop' as WorkspaceType,
    label: 'Kiralık Dükkan / Butik',
    desc: 'Fiziksel vitrin, mağaza ve müşteri kabul showroomu',
    badge: 'Fiziksel Mağaza',
    icon: Store,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
];

const VEHICLES = [
  {
    id: 'personal_car' as VehicleType,
    label: 'Şahsi Binek Aracım',
    desc: 'Bagaj ve arka koltuk yerinde teslimat için hazır',
    badge: 'Binek Taşıt',
    icon: Car,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'light_commercial' as VehicleType,
    label: 'Hafif Ticari / Panelvan',
    desc: 'Doblo, Caddy, Courier, Transit vb. geniş yük kapasitesi',
    badge: 'Yüksek Hacim',
    icon: Truck,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'motorcycle' as VehicleType,
    label: 'Motosiklet / Kurye',
    desc: 'Hızlı şehir içi teslimat ve esnek ekspres servis',
    badge: 'Hızlı Kurye',
    icon: Bike,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'none' as VehicleType,
    label: 'Taşıtsız (Kargo / Dijital)',
    desc: 'Anlaşmalı kargo firmaları veya internet üzerinden teslim',
    badge: 'Online Teslimat',
    icon: Package,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
  },
];

const STEPS = [
  {
    num: 1,
    formattedNum: '01',
    title: 'Genel Bilgiler & Fikir',
    desc: 'Model türü, sektör, lokasyon ve konsept',
    icon: Lightbulb,
    formTitle: 'Genel Bilgiler & Fikir',
    formSubtitle: 'İş fikrinizin temelini ve operasyon modelini oluşturalım.',
  },
  {
    num: 2,
    formattedNum: '02',
    title: 'Masaya Koyduklarım',
    desc: 'Şahsi araç, çalışma mekanı ve haftalık emek',
    icon: Car,
    formTitle: 'Masaya Koyduklarım (Özkaynaklar)',
    formSubtitle: 'Sermaye olmasa da işi yürütecek araç, mekan ve emeğinizi tanımlayın.',
  },
  {
    num: 3,
    formattedNum: '03',
    title: 'Aranan Bütçe',
    desc: 'Ekipman, stok ve reklam fonu ihtiyacı',
    icon: DollarSign,
    formTitle: 'Aranan Bütçe İhtiyacı',
    formSubtitle: 'İşi ayağa kaldırmak için yatırımcıdan talep edilecek sermaye kalemleri.',
  },
  {
    num: 4,
    formattedNum: '04',
    title: 'Gelir & Kâr Payı',
    desc: 'Ciro, net kâr ve yatırımcı kâr ortaklığı',
    icon: TrendingUp,
    formTitle: 'Finansal Öngörü & Kâr Payı',
    formSubtitle: 'Aylık net kâr tahmini ve yatırımcıya teklif ettiğiniz ortaklık oranı.',
  },
  {
    num: 5,
    formattedNum: '05',
    title: 'Önizleme & İzinler',
    desc: 'İlan kartı, AI skoru ve onay',
    icon: Award,
    formTitle: 'Önizleme & İletişim',
    formSubtitle: 'Oluşturulan vitrin kartınızı kontrol edip ilanı moderasyon onayına gönderin.',
  },
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

  const currentStepDef = STEPS[currentStep - 1] || STEPS[0];
  const StepIcon = currentStepDef.icon;

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
      <div className="max-w-2xl mx-auto rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white dark:bg-card p-8 sm:p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Fizibilite İncelemeye Alındı
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground">
          &quot;{draft.title || 'Özgün Girişim Fikri'}&quot; İlanı Oluşturuldu!
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
          Özgün fizibilite ve kâr projeksiyonu verileriniz Girişimbee moderasyon ekibine iletildi. Onaylandıktan hemen sonra{' '}
          <strong className="text-slate-900 dark:text-white">Girişimbee Yatırımcı & Ortaklık Vitrininde</strong> yayına
          alınacaktır.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="w-full sm:w-auto bg-[#0088D1] hover:bg-[#0077B6] text-white font-bold rounded-2xl h-12 px-7 shadow-sm">
            <Link href="/girisim-ortaklik">Yatırım & Ortaklık Havuzunu İncele</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-2xl h-12 px-7 border-slate-200">
            <Link href="/trend-fikirler">Trend Fikirlere Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] flex flex-col lg:flex-row items-start gap-6 sm:gap-8">
      
      {/* ========================================================================= */}
      {/* A. SOL SÜTUN: İLAN ADIMLARI (ÇERÇEVELİ & ŞIK KART YAPISI)                 */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-80 shrink-0 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              İLAN ADIMLARI
            </h2>
            <span className="text-xs font-bold text-[#0088D1] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900">
              {currentStep} / 5
            </span>
          </div>

          <div className="space-y-1.5">
            {STEPS.map((st) => {
              const isActive = currentStep === st.num;
              const isPassed = currentStep > st.num;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setCurrentStep(st.num)}
                  className={cn(
                    'w-full text-left transition-all duration-200 cursor-pointer rounded-2xl p-3.5 flex items-start gap-3',
                    isActive
                      ? 'bg-[#E8F4FD] dark:bg-sky-950/50 border-l-4 border-l-[#0088D1] shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-400'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-bold shrink-0 mt-0.5 w-6 text-center',
                      isActive
                        ? 'text-[#0088D1] dark:text-sky-400 font-black'
                        : isPassed
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-300 dark:text-zinc-600'
                    )}
                  >
                    {isPassed ? '✓' : st.formattedNum}
                  </span>

                  <div className="min-w-0">
                    <span
                      className={cn(
                        'block text-[13px] font-bold leading-tight',
                        isActive
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-zinc-300'
                      )}
                    >
                      {st.title}
                    </span>
                    <span
                      className={cn(
                        'block text-[11px] leading-snug mt-1 line-clamp-2',
                        isActive
                          ? 'text-slate-600 dark:text-zinc-300'
                          : 'text-slate-400 dark:text-zinc-500'
                      )}
                    >
                      {st.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sol Alt KVKK Bilgilendirme Kutusu (Renkli Kalkan Kutusu) */}
        <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex items-start gap-2.5 text-slate-700 dark:text-zinc-300">
          <Shield className="w-4 h-4 text-[#0088D1] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white block">
              Bilgileriniz KVKK&apos;ya uygun olarak korunur.
            </span>
            <span className="text-slate-500 dark:text-zinc-400">
              Kişisel verileriniz ve özgün fikriniz güvende.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* B. SAĞ FORM KARTI: AKTİF ADIM İÇERİĞİ                                    */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[580px]">
        
        <div>
          {/* Üst Başlık Barı (İkon + Başlık + Adım Rozeti) */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F4FD] dark:bg-sky-950/60 text-[#0088D1] dark:text-sky-400 flex items-center justify-center shadow-2xs">
                <StepIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {currentStepDef.formTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                  {currentStepDef.formSubtitle}
                </p>
              </div>
            </div>

            {/* Adım Rozeti: 1 / 5 */}
            <span className="px-3.5 py-1 rounded-full bg-[#E8F4FD] dark:bg-sky-950/60 text-[#0088D1] dark:text-sky-400 font-bold text-xs border border-sky-100 dark:border-sky-900">
              {currentStep} / 5
            </span>
          </div>

          {/* ===================================================================== */}
          {/* ADIM 1: GENEL BİLGİLER & FİKİR (FERAH, SADE & DÜZENLİ GRUPLAMA)       */}
          {/* ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 1. İşletme / Model Türü Seçimi (Renkli ve Ferah Kartlar) */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-2.5">
                  1. İş Fikrinin Operasyon & Gelir Modeli *
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BUSINESS_MODELS.map((model) => {
                    const isSelected = selectedModelType === model.id;
                    const Icon = model.icon;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelectBusinessModel(model)}
                        className={cn(
                          'p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[5.75rem]',
                          isSelected
                            ? 'border-[#0088D1] bg-[#E8F4FD]/70 dark:bg-sky-950/50 ring-2 ring-[#0088D1]/30 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={cn('p-2 rounded-xl border flex items-center justify-center', model.colorClass)}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-zinc-700">
                            {model.badgeText}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {model.title}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1 leading-snug">
                            {model.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Fikir Başlığı & Sektör & Lokasyon (Net 3 Sütun) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                      Fikir / Proje Başlığı (Marka Taslağı) *
                    </Label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {draft.title.length}/100
                    </span>
                  </div>
                  <Input
                    placeholder="Örn: Butik Kahve & Çekirdek Aboneliği"
                    maxLength={100}
                    value={draft.title}
                    onChange={(e) => updateBasicInfo({ title: e.target.value })}
                    className="h-12 rounded-2xl border-slate-200 dark:border-zinc-700 text-sm font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Sektör / Kategori *
                  </Label>
                  <select
                    value={draft.category}
                    onChange={(e) => updateBasicInfo({ category: e.target.value as VentureCategory })}
                    className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088D1]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Kurulum Lokasyonu (İl) *
                  </Label>
                  <select
                    value={draft.authorCity || 'İstanbul'}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088D1]"
                  >
                    {cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c} ({TURKEY_CITY_RENTAL_RATES[c]?.plate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Tek Cümlelik Değer Önerisi & Pazar Fırsatı */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Tek Cümlelik Çarpıcı Konsept (Müşteriye Ne Sunuyorsun?) *
                  </Label>
                  <Input
                    placeholder="Örn: Plazalara ve ev ofislere haftalık taze kavrulmuş nitelikli çekirdek kahve ve demleme seti teslimatı."
                    value={draft.oneLiner}
                    onChange={(e) => updateBasicInfo({ oneLiner: e.target.value })}
                    className="h-12 rounded-2xl border-slate-200 dark:border-zinc-700 text-sm font-medium"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Pazardaki Açık / Bu Fikir Neden Tutar? (Fırsat Analizi) *
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="Örn: İnsanlar kaliteli kahveye ulaşmak istiyor fakat zincir kafelerde yüksek fiyatlar ödüyor. Düzenli abonelik modeliyle sabit ve öngörülebilir nakit akışı sağlar..."
                    value={draft.whyItWorks}
                    onChange={(e) => updateBasicInfo({ whyItWorks: e.target.value })}
                    className="rounded-2xl border-slate-200 dark:border-zinc-700 text-sm font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 2: MASAYA KOYDUKLARIM (RENKLİ GÖRSEL KARTLAR)                    */}
          {/* ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Mekan Seçimi (Renkli Görsel Kartlar) */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2.5 block">
                  1. Çalışma & Üretim Alanı (Mekan Seçimi) *
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {WORKSPACES.map((ws) => {
                    const isSelected = draft.collateral.workspaceType === ws.id;
                    const Icon = ws.icon;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => updateCollateral({ workspaceType: ws.id })}
                        className={cn(
                          'p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[6.5rem]',
                          isSelected
                            ? 'border-[#0088D1] bg-[#E8F4FD]/70 dark:bg-sky-950/50 ring-2 ring-[#0088D1]/30 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={cn('p-2 rounded-xl border flex items-center justify-center', ws.bg)}>
                            <Icon className={cn('w-4 h-4', ws.color)} />
                          </span>
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700">
                            {ws.badge}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {ws.label}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2">
                            {ws.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Taşıt Seçimi (Renkli Görsel Kartlar) */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2.5 block">
                  2. Lojistik & Taşıt İmkânı *
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {VEHICLES.map((vh) => {
                    const isSelected = draft.collateral.vehicleType === vh.id;
                    const Icon = vh.icon;
                    return (
                      <button
                        key={vh.id}
                        type="button"
                        onClick={() => updateCollateral({ vehicleType: vh.id })}
                        className={cn(
                          'p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[6.5rem]',
                          isSelected
                            ? 'border-[#0088D1] bg-[#E8F4FD]/70 dark:bg-sky-950/50 ring-2 ring-[#0088D1]/30 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={cn('p-2 rounded-xl border flex items-center justify-center', vh.bg)}>
                            <Icon className={cn('w-4 h-4', vh.color)} />
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                            {vh.badge}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {vh.label}
                          </span>
                          <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                            {vh.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emek Saati */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                    3. Haftalık Ayırabileceğin Çalışma Saati (Bizzat Emek) *
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Tam zamanlı operasyonel emek için haftalık 40-50 saat önerilir.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={80}
                    value={draft.collateral.hoursPerWeek}
                    onChange={(e) => updateCollateral({ hoursPerWeek: Number(e.target.value) || 40 })}
                    className="w-28 h-11 rounded-xl font-black text-sm bg-white dark:bg-zinc-800 text-center"
                  />
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    Saat / Hafta
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 3: ARANAN BÜTÇE İHTİYACI                                         */}
          {/* ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Ekipman & Cihaz Bütçesi (₺) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="35000"
                    value={draft.budget.equipmentCost || ''}
                    onChange={(e) => updateBudget({ equipmentCost: Number(e.target.value) || 0 })}
                    className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    İlk 3 Aylık Hammadde / Stok (₺) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={draft.budget.initialStockCost || ''}
                    onChange={(e) => updateBudget({ initialStockCost: Number(e.target.value) || 0 })}
                    className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Başlangıç Reklam & Tanıtım (₺) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={draft.budget.marketingCost || ''}
                    onChange={(e) => updateBudget({ marketingCost: Number(e.target.value) || 0 })}
                    className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Tampon & İşletme Bütçesi (₺)
                  </Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={draft.budget.operatingBufferCost || ''}
                    onChange={(e) => updateBudget({ operatingBufferCost: Number(e.target.value) || 0 })}
                    className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 block">
                    Toplam Aranan Yatırım Bütçesi:
                  </span>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                    Yatırımcıdan talep edilecek net başlangıç sermayesi
                  </p>
                </div>
                <span className="font-display text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  ₺{draft.budget.totalRequiredCapital.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 4: GELİR & KÂR PAYI ORTAKLIĞI                                    */}
          {/* ===================================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Tahmini Aylık Ciro (₺) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="85000"
                    value={draft.financials.estimatedMonthlyRevenue || ''}
                    onChange={(e) => updateFinancials({ estimatedMonthlyRevenue: Number(e.target.value) || 0 })}
                    className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Tahmini Aylık Net Kâr (₺) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="55000"
                    value={draft.financials.estimatedMonthlyNetProfit || ''}
                    onChange={(e) => updateFinancials({ estimatedMonthlyNetProfit: Number(e.target.value) || 0 })}
                    className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-2.5">
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Yatırımcıya Önerilen Net Kâr Payı Oranı (%) *
                  </Label>
                  <span className="font-display text-base font-extrabold text-[#0088D1] dark:text-sky-400">
                    %{draft.financials.offeredInvestorSharePercent} Net Kâr
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={draft.financials.offeredInvestorSharePercent}
                  onChange={(e) => updateFinancials({ offeredInvestorSharePercent: Number(e.target.value) })}
                  className="w-full accent-[#0088D1] cursor-pointer h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                  <span>%10 (Küçük Katkı)</span>
                  <span>%30 - %35 (Dengeli Ortaklık)</span>
                  <span>%50 (Yarı Yarıya)</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 block">
                    Yatırımcının Parasını Çıkarma Hızı (Amortisman):
                  </span>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                    Aylık {formatCurrency(monthlyInvestorReturn)} kâr payı ile geri ödeme hızı
                  </p>
                </div>
                <span className="font-display text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ~{draft.financials.calculatedPaybackMonths} Ay
                </span>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 5: ÖNİZLEME & İLETİŞİM (RENKLİ GÖRSELLERLE ZENGİNLEŞTİRİLMİŞ)    */}
          {/* ===================================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Yatırımcı Vitrin Kartı Canlı Önizlemesi:
                  </span>
                  <VentureIdeaPreviewCard draft={draft} />
                </div>

                <div className="lg:col-span-5 space-y-3.5">
                  <div className="rounded-3xl border border-sky-100 dark:border-zinc-800 bg-gradient-to-br from-[#E8F4FD] to-sky-50 dark:from-sky-950/50 dark:to-zinc-900 p-5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#0088D1] dark:text-sky-400 inline-flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 fill-current" />
                        AI YATIRIM SKORU
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-500/30">
                        Yüksek Verimlilik
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl font-black text-slate-900 dark:text-white">9.4</span>
                      <span className="text-sm font-bold text-slate-400">/ 10</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-zinc-300">
                        <span>Özkaynak Güç Endeksi</span>
                        <span className="text-emerald-600 font-black">%92</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug pt-1">
                      Mekan ve araç maliyeti sıfırlandığı için yatırımcı sermaye riski minimumdur.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 p-4 space-y-2.5 text-xs shadow-xs">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-300 font-medium">
                      <span>Aranan Sermaye:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {formatCurrency(draft.budget.totalRequiredCapital)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-300 font-medium">
                      <span>Önerilen Net Kâr Payı:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        %{draft.financials.offeredInvestorSharePercent} Net Kâr
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-zinc-700 font-bold text-slate-900 dark:text-white">
                      <span>Tahmini Amortisman Süresi:</span>
                      <span className="text-emerald-600 text-sm">~{draft.financials.calculatedPaybackMonths} Ay</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Girişimci İletişim Bilgileri (Yatırımcı Görüşmeleri İçin)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                      Adınız & Soyadınız *
                    </Label>
                    <Input
                      placeholder="Örn: Uğur Zaman"
                      value={draft.authorName}
                      onChange={(e) => updateBasicInfo({ authorName: e.target.value })}
                      className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                      Telefon Numaranız *
                    </Label>
                    <Input
                      placeholder="05XX XXX XX XX"
                      value={draft.authorPhone || ''}
                      onChange={(e) => updateBasicInfo({ authorPhone: e.target.value })}
                      className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                    E-Posta Adresiniz *
                  </Label>
                  <Input
                    type="email"
                    placeholder="girisimci@ornek.com"
                    value={draft.authorEmail || ''}
                    onChange={(e) => updateBasicInfo({ authorEmail: e.target.value })}
                    className="mt-1.5 h-12 rounded-2xl text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* ALT AKSİYON ÇUBUĞU                                                      */}
        {/* ======================================================================= */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Sol Alt KVKK Bilgisi */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Shield className="w-4 h-4 text-[#0088D1] shrink-0" />
            <span>
              Bilgileriniz KVKK&apos;ya uygun olarak korunur. Kişisel verileriniz güvenle saklanır.
            </span>
          </div>

          {/* Sağ Aksiyon Butonları */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="h-12 rounded-2xl px-6 text-sm font-bold text-slate-700 dark:text-zinc-300 border-slate-200 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Geri
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-12 rounded-2xl px-8 text-sm font-bold bg-[#0088D1] hover:bg-[#0077B6] text-white shadow-sm"
              >
                Devam Et
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="h-12 rounded-2xl px-8 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Admin Onayına Gönder & İlanı Başlat
              </Button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
