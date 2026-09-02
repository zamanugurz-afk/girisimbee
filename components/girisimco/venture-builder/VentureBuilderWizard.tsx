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
    desc: 'Evde/atölyede üretim ve online satış',
    icon: Package,
    colorClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    badgeText: 'Üretim & Satış',
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'mobile_service',
    title: 'Mobil & Yerinde Servis',
    desc: 'Şahsi araçla müşterinin adresinde yerinde hizmet',
    icon: Car,
    colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    badgeText: 'Adreste Hizmet',
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'subscription_box',
    title: 'Abonelik & Kutu',
    desc: 'Periyodik düzenli teslimat & paket modeli',
    icon: RefreshCw,
    colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
    badgeText: 'Düzenli Gelir',
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'experience_event',
    title: 'Deneyim & Pop-Up',
    desc: 'Kişiye özel mekan kurulumu, kutlama & etkinlik',
    icon: Sparkles,
    colorClass: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
    badgeText: 'Etkinlik Modeli',
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'light_commercial' as VehicleType,
  },
  {
    id: 'digital_hybrid',
    title: 'Dijital & Hibrit',
    desc: 'Yazılım, tasarım, içerik veya uzaktan danışmanlık',
    icon: Calculator,
    colorClass: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    badgeText: 'Sıfır Sabit Gider',
    defaultWorkspace: 'virtual_mobile' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'custom_niche',
    title: 'Özel Çözüm & Niş',
    desc: 'Sektöre veya ihtiyaca özel yenilikçi iş fikri',
    icon: Wrench,
    colorClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    badgeText: 'Özgün İnovasyon',
    defaultWorkspace: 'garage_workshop' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
];

const WORKSPACES = [
  {
    id: 'home' as WorkspaceType,
    label: 'Kendi Evim / Mutfak',
    desc: 'Kira masrafı ₺0 (Mutfak, oda veya masa)',
    badge: '₺0 Kira',
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
    desc: 'Müşterinin evinde, bahçesinde veya plazada',
    badge: 'Mekansız',
    icon: Sparkles,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'virtual_mobile' as WorkspaceType,
    label: 'Tamamen Dijital / Sanal',
    desc: 'Sadece bilgisayar ve internet altyapısıyla yönetim',
    badge: 'Bulut Altyapı',
    icon: Calculator,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'rented_shop' as WorkspaceType,
    label: 'Kiralık Dükkan / Butik',
    desc: 'Fiziksel vitrin ve müşteri kabul showroomu',
    badge: 'Mağaza',
    icon: Store,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
];

const VEHICLES = [
  {
    id: 'personal_car' as VehicleType,
    label: 'Şahsi Binek Aracım',
    desc: 'Bagaj ve arka koltuk operasyon için hazır',
    badge: 'Binek Taşıt',
    icon: Car,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'light_commercial' as VehicleType,
    label: 'Hafif Ticari / Panelvan',
    desc: 'Doblo, Caddy, Courier vb. geniş yük hacmi',
    badge: 'Yüksek Hacim',
    icon: Truck,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'motorcycle' as VehicleType,
    label: 'Motosiklet / Kurye',
    desc: 'Hızlı şehir içi teslimat ve ekspres servis',
    badge: 'Hızlı Kurye',
    icon: Bike,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'none' as VehicleType,
    label: 'Taşıtsız (Kargo / Dijital)',
    desc: 'Anlaşmalı kargo veya internet üzerinden teslim',
    badge: 'Online Teslim',
    icon: Package,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
  },
];

const STEPS = [
  {
    num: 1,
    formattedNum: '01',
    title: 'Temel Bilgiler & Fikir',
    desc: 'Model türü, sektör ve fırsat analizi',
    icon: User,
    formTitle: 'Temel Bilgiler',
    formSubtitle: 'İlanınızın temelini ve iş modelini oluşturalım.',
  },
  {
    num: 2,
    formattedNum: '02',
    title: 'Masaya Koyduklarım',
    desc: 'Şahsi araç ve çalışma mekanı',
    icon: Car,
    formTitle: 'Özkaynaklar & Mekan / Taşıt',
    formSubtitle: 'Sermaye olmasa da işi yürütecek araç ve mekan imkânınızı tanımlayın.',
  },
  {
    num: 3,
    formattedNum: '03',
    title: 'Aranan Bütçe',
    desc: 'Ekipman, stok ve reklam fonu ihtiyacı',
    icon: DollarSign,
    formTitle: 'Finansman & Bütçe Kalemleri',
    formSubtitle: 'İşi ayağa kaldırmak için yatırımcıdan talep edilecek sermaye kalemleri.',
  },
  {
    num: 4,
    formattedNum: '04',
    title: 'Gelir & Kâr Payı',
    desc: 'Ciro, net kâr ve yatırımcı kâr ortaklığı',
    icon: TrendingUp,
    formTitle: 'Gelir Modeli & Teklif',
    formSubtitle: 'Aylık net kâr tahmini ve yatırımcıya teklif ettiğiniz ortaklık oranı.',
  },
  {
    num: 5,
    formattedNum: '05',
    title: 'Önizleme & Onay',
    desc: 'Vitrin kartı, AI skoru ve ilan başlatma',
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

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-card p-6 sm:p-10 shadow-sm text-center">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Fizibilite İncelemeye Alındı
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground">
          &quot;{draft.title || 'Özgün Girişim Fikri'}&quot; İlanı Oluşturuldu!
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
          Özgün fizibilite verileriniz moderasyon ekibine iletildi. Onaylandıktan sonra{' '}
          <strong className="text-slate-900 dark:text-white">Girişimbee Yatırımcı & Ortaklık Vitrininde</strong> yayına
          alınacaktır.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button asChild className="w-full sm:w-auto bg-[#00A86B] hover:bg-[#00925D] text-white font-bold rounded-2xl h-11 px-7 text-xs sm:text-sm shadow-sm">
            <Link href="/girisim-ortaklik">Yatırım & Ortaklık Havuzunu İncele</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-2xl h-11 px-7 text-xs sm:text-sm border-slate-200">
            <Link href="/trend-fikirler">Trend Fikirlere Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] flex flex-col lg:flex-row items-stretch gap-4 sm:gap-6">
      
      {/* ========================================================================= */}
      {/* A. SOL SÜTUN: İLAN ADIMLARI (Ekteki Görselle Birebir Mimari & Renkler)     */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-72 shrink-0 rounded-3xl border border-emerald-200/80 dark:border-zinc-800 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
              İLAN ADIMLARI
            </h2>
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
                    'w-full text-left transition-all duration-150 cursor-pointer rounded-2xl p-3 flex items-start gap-3',
                    isActive
                      ? 'bg-[#E8F8F2] dark:bg-emerald-950/40 border-l-4 border-l-[#00A86B] shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-400'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-bold shrink-0 mt-0.5 w-6 text-center',
                      isActive
                        ? 'text-[#00A86B] dark:text-emerald-400 font-black'
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
                        'block text-[11px] leading-tight mt-0.5 line-clamp-2',
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

        {/* Sol Alt KVKK Bilgilendirme Kutusu (Görseldeki ile Birebir) */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-start gap-2.5 px-1 text-slate-700 dark:text-zinc-300">
          <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <span className="font-bold text-slate-900 dark:text-white block">
              Bilgileriniz KVKK&apos;ya uygun olarak korunur.
            </span>
            <span className="text-slate-500 dark:text-zinc-400">
              Kişisel verileriniz güvende.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* B. SAĞ FORM KARTI: DİK AYRIM ÇİZGİLİ 2 SÜTUNLU MİMARİ                     */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full rounded-3xl border border-emerald-200/80 dark:border-zinc-800 bg-white dark:bg-card p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        
        <div>
          {/* Üst Başlık Barı (Görseldeki gibi: Sol İkon + Başlık + Sağ 1/5 Rozeti) */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F8F2] dark:bg-emerald-950/60 text-[#00A86B] dark:text-emerald-400 flex items-center justify-center">
                <StepIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {currentStepDef.formTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {currentStepDef.formSubtitle}
                </p>
              </div>
            </div>

            {/* Adım Rozeti */}
            <span className="px-3.5 py-1 rounded-full bg-[#E8F8F2] dark:bg-emerald-950/60 text-[#00A86B] dark:text-emerald-400 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800">
              {currentStep} / 5
            </span>
          </div>

          {/* ===================================================================== */}
          {/* ADIM 1: TEMEL BİLGİLER & FİKİR (Ekteki 3. Görselle Birebir Mimari)     */}
          {/* ===================================================================== */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch animate-in fade-in duration-200">
              {/* SOL SÜTUN: İŞLETME / OPERASYON MODELİ (ALT ALTA KÜÇÜK KARTLAR) */}
              <div className="space-y-2 pr-0 md:pr-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 pb-4 md:pb-0">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1">
                  1. İşletme / Operasyon Modeli *
                </Label>
                <div className="space-y-1.5">
                  {BUSINESS_MODELS.map((model) => {
                    const isSelected = selectedModelType === model.id;
                    const Icon = model.icon;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelectBusinessModel(model)}
                        className={cn(
                          'w-full p-2.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between',
                          isSelected
                            ? 'border-[#00A86B] bg-[#E8F8F2]/80 dark:bg-emerald-950/50 ring-2 ring-[#00A86B]/30 shadow-2xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={cn('p-2 rounded-xl border flex items-center justify-center shrink-0', model.colorClass)}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {model.title}
                            </span>
                            <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                              {model.desc}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SAĞ SÜTUN: KART KONSEPTİNDE GİRİŞİM BİLGİLERİ */}
              <div className="space-y-2 pl-0 md:pl-2">
                {/* 1. Firma / Proje Adı Kartı */}
                <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
                        <Building className="w-3.5 h-3.5" />
                      </span>
                      <Label className="text-xs font-bold text-slate-900 dark:text-white">
                        Firma / Proje Adı *
                      </Label>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {draft.title.length}/100
                    </span>
                  </div>
                  <Input
                    placeholder="Firma veya proje adını giriniz"
                    maxLength={100}
                    value={draft.title}
                    onChange={(e) => updateBasicInfo({ title: e.target.value })}
                    className="h-9 rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                  />
                </div>

                {/* 2. Sektör / Kategori Kartı */}
                <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400">
                      <Briefcase className="w-3.5 h-3.5" />
                    </span>
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">
                      Sektör / Kategori *
                    </Label>
                  </div>
                  <select
                    value={draft.category}
                    onChange={(e) => updateBasicInfo({ category: e.target.value as VentureCategory })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Lokasyon & İlçe Kartı */}
                <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">
                      Kurulum Lokasyonu & Hedef İlçe *
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={draft.authorCity || 'İstanbul'}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]"
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
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]"
                    >
                      {districtOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Tek Cümlelik Konsept Kartı */}
                <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">
                      Tek Cümlelik Konsept (Ne Sunuyorsun?) *
                    </Label>
                  </div>
                  <Input
                    placeholder="Konseptinizi ve sunduğunuz değeri kısaca açıklayın"
                    value={draft.oneLiner}
                    onChange={(e) => updateBasicInfo({ oneLiner: e.target.value })}
                    className="h-9 rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                  />
                </div>

                {/* 5. Pazardaki Açık & Fırsat Analizi Kartı */}
                <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400">
                      <Target className="w-3.5 h-3.5" />
                    </span>
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">
                      Pazardaki Açık & Fırsat Analizi *
                    </Label>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Fikrinizin neden başarılı olacağını ve pazar fırsatını açıklayın"
                    value={draft.whyItWorks}
                    onChange={(e) => updateBasicInfo({ whyItWorks: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium resize-none min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 2: MASAYA KOYDUKLARIM (DİK AYRIM ÇİZGİLİ 2 SÜTUN)                 */}
          {/* ===================================================================== */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch animate-in fade-in duration-200">
              {/* SOL SÜTUN: MEKAN SEÇİMİ */}
              <div className="space-y-2.5 pr-0 md:pr-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 pb-4 md:pb-0">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1">
                  1. Çalışma & Üretim Alanı (Mekan Seçimi) *
                </Label>
                <div className="space-y-2">
                  {WORKSPACES.map((ws) => {
                    const isSelected = draft.collateral.workspaceType === ws.id;
                    const Icon = ws.icon;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => updateCollateral({ workspaceType: ws.id })}
                        className={cn(
                          'w-full p-2.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between',
                          isSelected
                            ? 'border-[#00A86B] bg-[#E8F8F2]/80 dark:bg-emerald-950/50 ring-2 ring-[#00A86B]/30 shadow-2xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={cn('p-2 rounded-xl border flex items-center justify-center shrink-0', ws.bg)}>
                            <Icon className={cn('w-4 h-4', ws.color)} />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {ws.label}
                            </span>
                            <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                              {ws.desc}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 shrink-0 ml-2">
                          {ws.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SAĞ SÜTUN: TAŞIT */}
              <div className="space-y-2.5 pl-0 md:pl-2">
                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1">
                    2. Lojistik & Taşıt İmkânı *
                  </Label>
                  <div className="space-y-2">
                    {VEHICLES.map((vh) => {
                      const isSelected = draft.collateral.vehicleType === vh.id;
                      const Icon = vh.icon;
                      return (
                        <button
                          key={vh.id}
                          type="button"
                          onClick={() => updateCollateral({ vehicleType: vh.id })}
                          className={cn(
                            'w-full p-2.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between',
                            isSelected
                              ? 'border-[#00A86B] bg-[#E8F8F2]/80 dark:bg-emerald-950/50 ring-2 ring-[#00A86B]/30 shadow-2xs'
                              : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={cn('p-2 rounded-xl border flex items-center justify-center shrink-0', vh.bg)}>
                              <Icon className={cn('w-4 h-4', vh.color)} />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                                {vh.label}
                              </span>
                              <span className="block text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                                {vh.desc}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 shrink-0 ml-2">
                            {vh.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 3: ARANAN BÜTÇE İHTİYACI (DİK AYRIM ÇİZGİLİ 2 SÜTUN)             */}
          {/* ===================================================================== */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch animate-in fade-in duration-200">
              {/* SOL SÜTUN: GİDER KALEMLERİ */}
              <div className="space-y-3 pr-0 md:pr-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 pb-4 md:pb-0">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Ekipman & Cihaz (₺) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="35000"
                      value={draft.budget.equipmentCost || ''}
                      onChange={(e) => updateBudget({ equipmentCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-10 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      3 Aylık Stok (₺) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="15000"
                      value={draft.budget.initialStockCost || ''}
                      onChange={(e) => updateBudget({ initialStockCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-10 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Reklam & Tanıtım (₺) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={draft.budget.marketingCost || ''}
                      onChange={(e) => updateBudget({ marketingCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-10 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Tampon Bütçe (₺)
                    </Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={draft.budget.operatingBufferCost || ''}
                      onChange={(e) => updateBudget({ operatingBufferCost: Number(e.target.value) || 0 })}
                      className="mt-1 h-10 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SAĞ SÜTUN: TOPLAM SERMAYE VİTRİNİ */}
              <div className="flex flex-col justify-between space-y-3 pl-0 md:pl-2">
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Toplam Aranan Sermaye:
                    </span>
                    <p className="text-[10.5px] text-amber-700/80 dark:text-amber-400/80">
                      Yatırımcıdan talep edilecek net başlangıç tutarı
                    </p>
                  </div>
                  <span className="font-display text-2xl font-black text-amber-600 dark:text-amber-400">
                    ₺{draft.budget.totalRequiredCapital.toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#E8F8F2]/70 dark:bg-emerald-950/30 border border-emerald-200/60 text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                  <span className="font-bold text-[#00A86B] block">
                    ✓ Özkaynak Avantajı
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Dükkan ve araç maliyeti sıfırlandığı için melek yatırımcı sadece operasyonel malzemeyi finanse eder.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 4: GELİR & KÂR PAYI (DİK AYRIM ÇİZGİLİ 2 SÜTUN)                  */}
          {/* ===================================================================== */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch animate-in fade-in duration-200">
              {/* SOL SÜTUN: FİNANSAL GİRDİLER */}
              <div className="space-y-3 pr-0 md:pr-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 pb-4 md:pb-0">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Aylık Ciro (₺) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="85000"
                      value={draft.financials.estimatedMonthlyRevenue || ''}
                      onChange={(e) => updateFinancials({ estimatedMonthlyRevenue: Number(e.target.value) || 0 })}
                      className="mt-1 h-10 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Aylık Net Kâr (₺) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="55000"
                      value={draft.financials.estimatedMonthlyNetProfit || ''}
                      onChange={(e) => updateFinancials({ estimatedMonthlyNetProfit: Number(e.target.value) || 0 })}
                      className="mt-1 h-10 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Önerilen Net Kâr Payı:
                    </Label>
                    <span className="font-display text-sm font-extrabold text-[#00A86B] dark:text-emerald-400">
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
                    className="w-full accent-[#00A86B] cursor-pointer h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>%10</span>
                    <span>%30 - %35 (Dengeli)</span>
                    <span>%50</span>
                  </div>
                </div>
              </div>

              {/* SAĞ SÜTUN: AMORTİSMAN & GERİ DÖNÜŞ */}
              <div className="flex flex-col justify-between space-y-3 pl-0 md:pl-2">
                <div className="p-4 rounded-2xl bg-[#E8F8F2] dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                      Tahmini Amortisman Süresi:
                    </span>
                    <p className="text-[10.5px] text-emerald-700/80 dark:text-emerald-400/80">
                      Aylık {formatCurrency(monthlyInvestorReturn)} getiri ile
                    </p>
                  </div>
                  <span className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ~{draft.financials.calculatedPaybackMonths} Ay
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-300">
                    <span>Yatırımcı Aylık Payı:</span>
                    <span className="font-bold text-[#00A86B]">{formatCurrency(monthlyInvestorReturn)} / Ay</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-zinc-300">
                    <span>Girişimci Aylık Net Kârı:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency((draft.financials.estimatedMonthlyNetProfit || 0) - monthlyInvestorReturn)} / Ay
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 5: ÖNİZLEME & İLETİŞİM (DİK AYRIM ÇİZGİLİ 2 SÜTUN)                */}
          {/* ===================================================================== */}
          {currentStep === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch animate-in fade-in duration-200">
              {/* SOL SÜTUN: VİTRİN KARTI ÖNİZLEMESİ */}
              <div className="pr-0 md:pr-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 pb-4 md:pb-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Yatırımcı Vitrin Kartı Önizlemesi:
                </span>
                <VentureIdeaPreviewCard draft={draft} />
              </div>

              {/* SAĞ SÜTUN: AI SKORU & GİRİŞİMCİ İLETİŞİM FORMU */}
              <div className="space-y-3.5 pl-0 md:pl-2 flex flex-col justify-between">
                {/* AI Yatırım Skoru */}
                <div className="rounded-2xl border border-emerald-200/80 dark:border-zinc-800 bg-[#E8F8F2]/70 dark:bg-emerald-950/40 p-3.5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#00A86B] dark:text-emerald-400 inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      AI YATIRIM SKORU
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                      Yüksek Verimlilik
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl font-black text-slate-900 dark:text-white">9.4</span>
                    <span className="text-xs font-bold text-slate-400">/ 10</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-zinc-300">
                      <span>Özkaynak Güç Endeksi</span>
                      <span className="text-emerald-600 font-black">%92</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Girişimci İletişim Bilgileri
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Adınız Soyadınız *
                      </Label>
                      <Input
                        placeholder="Adınız ve Soyadınız"
                        value={draft.authorName}
                        onChange={(e) => updateBasicInfo({ authorName: e.target.value })}
                        className="h-9 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Telefon *
                      </Label>
                      <Input
                        placeholder="05XX XXX XX XX"
                        value={draft.authorPhone || ''}
                        onChange={(e) => updateBasicInfo({ authorPhone: e.target.value })}
                        className="h-9 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      E-Posta Adresi *
                    </Label>
                    <Input
                      type="email"
                      placeholder="girisimci@ornek.com"
                      value={draft.authorEmail || ''}
                      onChange={(e) => updateBasicInfo({ authorEmail: e.target.value })}
                      className="h-9 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* ALT AKSİYON ÇUBUĞU (Görseldeki ile Birebir)                              */}
        {/* ======================================================================= */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Sol Alt KVKK Bilgisi */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              Bilgileriniz KVKK&apos;ya uygun olarak korunur. Kişisel verileriniz güvenle işlenir ve saklanır.
            </span>
          </div>

          {/* Sağ Aksiyon Butonları */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="h-11 rounded-2xl px-6 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 border-slate-200 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Geri
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-11 rounded-2xl px-8 text-xs sm:text-sm font-bold bg-[#00A86B] hover:bg-[#00925D] text-white shadow-sm"
              >
                Devam Et
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="h-11 rounded-2xl px-8 text-xs sm:text-sm font-bold bg-[#00A86B] hover:bg-[#00925D] text-white shadow-sm"
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
