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
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'mobile_service',
    title: 'Mobil Hizmet',
    desc: 'Şahsi araçla müşterinin adresinde yerinde servis',
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
    desc: 'Kişiye özel mekan kurulumu & etkinlik',
    icon: Sparkles,
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'light_commercial' as VehicleType,
  },
  {
    id: 'digital_hybrid',
    title: 'Dijital & Hibrit',
    desc: 'Yazılım, tasarım veya uzaktan danışmanlık',
    icon: Calculator,
    defaultWorkspace: 'virtual_mobile' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'custom_niche',
    title: 'Özel Çözüm',
    desc: 'Sektöre özel yenilikçi iş modeli',
    icon: Wrench,
    defaultWorkspace: 'garage_workshop' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
];

const WORKSPACES: { id: WorkspaceType; label: string; desc: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Kendi Evim / Mutfak', desc: 'Kira masrafı ₺0 (Mutfak, oda veya masa)', icon: Home },
  { id: 'garage_workshop', label: 'Garaj / Özel Atölye', desc: 'Müstakil alan veya hobi atölyesi (₺0 Kira)', icon: Building },
  { id: 'client_location', label: 'Müşteri Sahası / Yerinde', desc: 'Müşterinin bahçesinde, sitesinde veya plazada', icon: Sparkles },
  { id: 'virtual_mobile', label: 'Tamamen Sanal / Dijital', desc: 'Sadece bilgisayar ve internet altyapısı', icon: Calculator },
  { id: 'rented_shop', label: 'Kiralık Dükkan / Butik', desc: 'Fiziksel vitrin ve müşteri kabul alanı', icon: Building },
];

const VEHICLES: { id: VehicleType; label: string; desc: string; icon: typeof Car }[] = [
  { id: 'personal_car', label: 'Şahsi Binek Aracım', desc: 'Bagaj ve arka koltuk operasyon için hazır', icon: Car },
  { id: 'light_commercial', label: 'Hafif Ticari / Panelvan', desc: 'Doblo, Caddy, Transit vb. geniş yük hacmi', icon: Car },
  { id: 'motorcycle', label: 'Motosiklet / Kurye', desc: 'Hızlı şehir içi teslimat ve servis', icon: Flame },
  { id: 'none', label: 'Taşıtsız (Kargo / Dijital)', desc: 'Anlaşmalı kargo veya dijital teslimat', icon: Sparkles },
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
      {/* A. SOL SÜTUN: İLAN ADIMLARI (Image ile Birebir Aynı Mimari)               */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3.5 px-1">
            İLAN ADIMLARI
          </h2>

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
                    'w-full text-left transition-all duration-200 cursor-pointer rounded-2xl p-3 flex items-start gap-3',
                    isActive
                      ? 'bg-[#E8F4FD] dark:bg-sky-950/40 border-l-4 border-l-[#0088D1] shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-400'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-bold shrink-0 mt-0.5',
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
                        'block text-[11px] leading-snug mt-0.5 line-clamp-2',
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
        <div className="pt-4 border-t border-slate-200/70 dark:border-zinc-800 flex items-start gap-2.5 px-1 text-slate-600 dark:text-zinc-400">
          <Shield className="w-4 h-4 text-[#0088D1] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
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
      {/* B. SAĞ FORM KARTI: AKTİF ADIM İÇERİĞİ (Görseldeki Kart Tasarımı)         */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white dark:bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[580px]">
        
        <div>
          {/* Üst Başlık Barı (İkon + Başlık + Adım Rozeti) */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F4FD] dark:bg-sky-950/60 text-[#0088D1] dark:text-sky-400 flex items-center justify-center">
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

            {/* Adım Rozeti: 1 / 5 */}
            <span className="px-3.5 py-1 rounded-full bg-[#E8F4FD] dark:bg-sky-950/60 text-[#0088D1] dark:text-sky-400 font-bold text-xs border border-sky-100 dark:border-sky-900">
              {currentStep} / 5
            </span>
          </div>

          {/* ===================================================================== */}
          {/* ADIM 1: GENEL BİLGİLER & FİKİR                                       */}
          {/* ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* İş Modeli Seçimi */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-2">
                  İşletme / Hizmet Türü *
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
                          'p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3',
                          isSelected
                            ? 'border-[#0088D1] bg-[#E8F4FD]/60 dark:bg-sky-950/40 ring-1 ring-[#0088D1]/30 text-slate-950 dark:text-white shadow-2xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                            isSelected
                              ? 'bg-[#0088D1] text-white'
                              : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="block text-xs sm:text-sm font-bold leading-tight">
                            {model.title}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                            {model.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2 Sütunlu Form Alanları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
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
                    className="h-12 rounded-2xl border-slate-200 dark:border-zinc-700 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Sektör / Kategori *
                  </Label>
                  <select
                    value={draft.category}
                    onChange={(e) => updateBasicInfo({ category: e.target.value as VentureCategory })}
                    className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088D1]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Kurulum Lokasyonu (İl) *
                  </Label>
                  <select
                    value={draft.authorCity || 'İstanbul'}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088D1]"
                  >
                    {cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c} ({TURKEY_CITY_RENTAL_RATES[c]?.plate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Hedeflenen İlçe
                  </Label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088D1]"
                  >
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tek Cümlelik Değer Önerisi */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                  Tek Cümlelik Çarpıcı Konsept (Ne Sunuyorsun?) *
                </Label>
                <Input
                  placeholder="Örn: Plazalara ve ev ofislere haftalık taze kavrulmuş nitelikli çekirdek kahve ve demleme seti teslimatı."
                  value={draft.oneLiner}
                  onChange={(e) => updateBasicInfo({ oneLiner: e.target.value })}
                  className="h-12 rounded-2xl border-slate-200 dark:border-zinc-700 text-sm"
                />
              </div>

              {/* Pazardaki Açık */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                  Pazardaki Açık / Bu Fikir Neden Tutar? (Fırsat Analizi) *
                </Label>
                <Textarea
                  rows={3}
                  placeholder="Örn: İnsanlar kaliteli kahveye ulaşmak istiyor fakat zincir kafelerde yüksek fiyatlar ödüyor. Düzenli abonelik modeliyle sabit ve öngörülebilir nakit akışı sağlar..."
                  value={draft.whyItWorks}
                  onChange={(e) => updateBasicInfo({ whyItWorks: e.target.value })}
                  className="rounded-2xl border-slate-200 dark:border-zinc-700 text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* ADIM 2: MASAYA KOYDUKLARIM (ÖZKAYNAKLAR)                             */}
          {/* ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Mekan Seçimi */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2.5 block">
                  Çalışma & Üretim Alanı (Mekan Seçimi) *
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
                          'p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3',
                          isSelected
                            ? 'border-[#0088D1] bg-[#E8F4FD]/60 dark:bg-sky-950/40 ring-1 ring-[#0088D1]/30 text-slate-900 dark:text-white shadow-2xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                        )}
                      >
                        <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-[#0088D1]' : 'text-slate-400')} />
                        <div>
                          <span className="block text-xs sm:text-sm font-bold leading-tight">
                            {ws.label}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">
                            {ws.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Taşıt Seçimi */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2.5 block">
                  Lojistik & Taşıt İmkânı *
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
                          'p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3',
                          isSelected
                            ? 'border-[#0088D1] bg-[#E8F4FD]/60 dark:bg-sky-950/40 ring-1 ring-[#0088D1]/30 text-slate-900 dark:text-white shadow-2xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                        )}
                      >
                        <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-[#0088D1]' : 'text-slate-400')} />
                        <div>
                          <span className="block text-xs sm:text-sm font-bold leading-tight">
                            {vh.label}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">
                            {vh.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emek Saati */}
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2 block">
                  Haftalık Ayırabileceğin Çalışma Saati (Bizzat Emek) *
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={5}
                    max={80}
                    value={draft.collateral.hoursPerWeek}
                    onChange={(e) => updateCollateral({ hoursPerWeek: Number(e.target.value) || 40 })}
                    className="w-32 h-12 rounded-2xl font-bold text-sm"
                  />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300">
                    Saat / Hafta (Tam zamanlı operasyonel emek için 40-50 saat önerilir)
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
                    className="mt-1.5 h-12 rounded-2xl text-sm"
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
                    className="mt-1.5 h-12 rounded-2xl text-sm"
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
                    className="mt-1.5 h-12 rounded-2xl text-sm"
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
                    className="mt-1.5 h-12 rounded-2xl text-sm"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#E8F4FD] dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                    Toplam Aranan Yatırım Bütçesi:
                  </span>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Yatırımcıdan talep edilecek net başlangıç sermayesi
                  </p>
                </div>
                <span className="font-display text-2xl sm:text-3xl font-black text-[#0088D1] dark:text-sky-400">
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
                    className="mt-1.5 h-12 rounded-2xl text-sm"
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
                    className="mt-1.5 h-12 rounded-2xl text-sm"
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
          {/* ADIM 5: ÖNİZLEME & İLETİŞİM (SON SAYFA)                              */}
          {/* ===================================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Yatırımcı Vitrin Kartı Önizlemesi:
                  </span>
                  <VentureIdeaPreviewCard draft={draft} />
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <div className="rounded-2xl border border-sky-100 dark:border-zinc-800 bg-[#E8F4FD]/50 dark:bg-zinc-800/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#0088D1] dark:text-sky-400 inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        AI Yatırım Skoru
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        Yüksek Verimlilik
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-2xl font-black text-slate-900 dark:text-white">9.4</span>
                      <span className="text-xs font-bold text-slate-400">/ 10</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                      Mekan ve araç maliyeti sıfırlandığı için yatırımcı riski minimumdur.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-300">
                      <span>Aranan Sermaye:</span>
                      <span className="font-bold text-[#0088D1]">{formatCurrency(draft.budget.totalRequiredCapital)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-300">
                      <span>Önerilen Kâr Payı:</span>
                      <span className="font-bold text-indigo-600">%{draft.financials.offeredInvestorSharePercent}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-zinc-700 font-bold text-slate-900 dark:text-white">
                      <span>Tahmini Amortisman:</span>
                      <span className="text-emerald-600">~{draft.financials.calculatedPaybackMonths} Ay</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Girişimci İletişim Bilgileri
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
                      className="mt-1.5 h-12 rounded-2xl text-sm"
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
                      className="mt-1.5 h-12 rounded-2xl text-sm"
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
                    className="mt-1.5 h-12 rounded-2xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* ALT AKSİYON ÇUBUĞU (Görseldeki ile Birebir)                              */}
        {/* ======================================================================= */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Sol Alt KVKK Bilgisi (Görseldeki gibi) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Shield className="w-4 h-4 text-[#0088D1] shrink-0" />
            <span>
              Bilgileriniz KVKK&apos;ya uygun olarak korunur. Kişisel verileriniz güvenle işlenir ve saklanır.
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
