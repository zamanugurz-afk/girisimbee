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
} from 'lucide-react';
import { useVentureBuilderStore } from '@/lib/stores/venture-builder-store';
import {
  VentureCategory,
  WorkspaceType,
  VehicleType,
} from '@/lib/types/venture-builder';
import { TURKEY_CITY_RENTAL_RATES } from '@/features/business-setup/data/district-rental-rates';
import { FormStepIndicator } from '@/features/listings/form/form-step-indicator';
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
    title: 'Mobil & Yerinde Servis',
    desc: 'Şahsi araçla müşterinin adresinde yerinde hizmet',
    icon: Car,
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'subscription_box',
    title: 'Abonelik & Periyodik Kutu',
    desc: 'Düzenli periyodik teslimat & paket modeli',
    icon: RefreshCw,
    defaultWorkspace: 'home' as WorkspaceType,
    defaultVehicle: 'personal_car' as VehicleType,
  },
  {
    id: 'experience_event',
    title: 'Deneyim & Pop-Up',
    desc: 'Kişiye özel mekan kurulumu, kutlama & etkinlik',
    icon: Sparkles,
    defaultWorkspace: 'client_location' as WorkspaceType,
    defaultVehicle: 'light_commercial' as VehicleType,
  },
  {
    id: 'digital_hybrid',
    title: 'Dijital & Hibrit Servis',
    desc: 'Yazılım, tasarım, içerik veya uzaktan danışmanlık',
    icon: Calculator,
    defaultWorkspace: 'virtual_mobile' as WorkspaceType,
    defaultVehicle: 'none' as VehicleType,
  },
  {
    id: 'custom_niche',
    title: 'Özel Çözüm & Diğer',
    desc: 'Sektöre veya ihtiyaca özel yenilikçi iş fikri',
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

const STEPS = [
  { id: 'concept', title: 'Fikir & Konsept' },
  { id: 'collateral', title: 'Masaya Koyduklarım' },
  { id: 'budget', title: 'Aranan Bütçe' },
  { id: 'financials', title: 'Gelir & Kâr Payı' },
  { id: 'review', title: 'Önizleme & Onay' },
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
      <div className="max-w-2xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-card p-8 sm:p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-3">
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
          <Button asChild className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl h-11 px-6 shadow-xs">
            <Link href="/girisim-ortaklik">Yatırım & Ortaklık Havuzunu İncele</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl h-11 px-6">
            <Link href="/trend-fikirler">Trend Fikirlere Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ========================================================================= */}
      {/* GİRİŞİMBEE İLAN OLUŞTURMA STEPPER'I (FormStepIndicator)                   */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-card p-4 sm:p-6 shadow-xs">
        <FormStepIndicator steps={STEPS} currentIndex={currentStep - 1} />
      </div>

      {/* ========================================================================= */}
      {/* ANA FORM KARTI                                                            */}
      {/* ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-card p-6 sm:p-8 shadow-xs">
        
        {/* ======================================================================= */}
        {/* ADIM 1: FİKİR & ÖZGÜN KONSEPT                                           */}
        {/* ======================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                1. İş Fikrinin Türü & Temel Bilgileri
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Aklındaki iş fikrinin türünü seçin ve yatırımcıların ilk göreceği temel bilgileri tanımlayın.
              </p>
            </div>

            {/* İş Modeli Seçim Kartları */}
            <div>
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-2.5">
                İş Modeli / Hizmet Türü *
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
                        'p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3.5',
                        isSelected
                          ? 'border-amber-500 bg-amber-500/[0.06] dark:bg-amber-500/10 ring-2 ring-amber-500/30 text-slate-950 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-600'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-bold leading-tight truncate">
                          {model.title}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-snug">
                          {model.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fikir Başlığı & Kategori & Şehir */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
              <div className="sm:col-span-6">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1.5">
                  Fikir / Proje Başlığı (Marka Taslağı) *
                </Label>
                <Input
                  placeholder="Örn: Butik Kahve & Çekirdek Aboneliği"
                  value={draft.title}
                  onChange={(e) => updateBasicInfo({ title: e.target.value })}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1.5">
                  Sektör / Kategori *
                </Label>
                <select
                  value={draft.category}
                  onChange={(e) => updateBasicInfo({ category: e.target.value as VentureCategory })}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1.5">
                  Lokasyon (İl) *
                </Label>
                <select
                  value={draft.authorCity || 'İstanbul'}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tek Cümlelik Değer Önerisi */}
            <div>
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1.5">
                Tek Cümlelik Çarpıcı Konsept (Ne Sunuyorsun?) *
              </Label>
              <Input
                placeholder="Örn: Plazalara ve ev ofislere haftalık taze kavrulmuş nitelikli çekirdek kahve ve demleme seti teslimatı."
                value={draft.oneLiner}
                onChange={(e) => updateBasicInfo({ oneLiner: e.target.value })}
                className="h-11 rounded-xl text-sm"
              />
            </div>

            {/* Pazardaki Açık & Fırsat Analizi */}
            <div>
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mb-1.5">
                Pazardaki Açık / Bu Fikir Neden Tutar? (Fırsat Analizi) *
              </Label>
              <Textarea
                rows={3}
                placeholder="Örn: İnsanlar kaliteli kahveye ulaşmak istiyor fakat zincir kafelerde yüksek fiyatlar ödüyor. Düzenli abonelik modeliyle sabit ve öngörülebilir nakit akışı sağlar..."
                value={draft.whyItWorks}
                onChange={(e) => updateBasicInfo({ whyItWorks: e.target.value })}
                className="rounded-xl text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ADIM 2: MASAYA KOYDUKLARIN                                              */}
        {/* ======================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                2. Sen Masaya Ne Koyuyorsun? (Özkaynakların)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Yatırımcıya bütçen olmasa bile işi yürütecek araç, mekan ve emeğinin hazır olduğunu gösterin.
              </p>
            </div>

            {/* Mekan Seçimi */}
            <div>
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2.5 block">
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
                          ? 'border-amber-500 bg-amber-500/[0.06] dark:bg-amber-500/10 ring-2 ring-amber-500/30 text-slate-900 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-amber-600' : 'text-slate-400')} />
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
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2.5 block">
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
                          ? 'border-amber-500 bg-amber-500/[0.06] dark:bg-amber-500/10 ring-2 ring-amber-500/30 text-slate-900 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-amber-600' : 'text-slate-400')} />
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
            <div className="pt-2">
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 block">
                Haftalık Ayırabileceğin Çalışma Saati (Bizzat Emek) *
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
                  Saat / Hafta (Tam zamanlı operasyonel emek için 40-50 saat önerilir)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ADIM 3: ARANAN BÜTÇE İHTİYACI                                           */}
        {/* ======================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                3. Ne Kadar Bütçeye İhtiyacın Var? (Gider Kalemleri)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                İşi sıfırdan ayağa kaldırmak için yatırımcıdan aradığınız net başlangıç maliyetlerini girin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Ekipman & Cihaz Bütçesi (₺) *
                </Label>
                <Input
                  type="number"
                  placeholder="35000"
                  value={draft.budget.equipmentCost || ''}
                  onChange={(e) => updateBudget({ equipmentCost: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl text-sm"
                />
              </div>

              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  İlk 3 Aylık Hammadde / Stok (₺) *
                </Label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={draft.budget.initialStockCost || ''}
                  onChange={(e) => updateBudget({ initialStockCost: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl text-sm"
                />
              </div>

              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Başlangıç Reklam & Tanıtım (₺) *
                </Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={draft.budget.marketingCost || ''}
                  onChange={(e) => updateBudget({ marketingCost: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl text-sm"
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
                  className="mt-1.5 h-11 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 block">
                  Toplam Aranan Yatırım Bütçesi:
                </span>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  Yatırımcıya sunulacak net sermaye talebi
                </p>
              </div>
              <span className="font-display text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                ₺{draft.budget.totalRequiredCapital.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ADIM 4: GELİR & KÂR PAYI ORTAKLIĞI                                      */}
        {/* ======================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                4. Finansal Öngörü & Yatırımcıya Teklifin
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Aylık kâr tahmininizi ve yatırımcıya önerdiğiniz kâr ortaklığı oranını belirleyin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Tahmini Aylık Ciro (₺) *
                </Label>
                <Input
                  type="number"
                  placeholder="85000"
                  value={draft.financials.estimatedMonthlyRevenue || ''}
                  onChange={(e) => updateFinancials({ estimatedMonthlyRevenue: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl text-sm"
                />
              </div>

              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Tahmini Aylık Net Kâr (₺) *
                </Label>
                <Input
                  type="number"
                  placeholder="55000"
                  value={draft.financials.estimatedMonthlyNetProfit || ''}
                  onChange={(e) => updateFinancials({ estimatedMonthlyNetProfit: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2.5">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Yatırımcıya Önerilen Net Kâr Payı Oranı (%) *
                </Label>
                <span className="font-display text-base font-extrabold text-indigo-600 dark:text-indigo-400">
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
                className="w-full accent-amber-500 cursor-pointer h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                <span>%10 (Küçük Katkı)</span>
                <span>%30 - %35 (Dengeli Ortaklık)</span>
                <span>%50 (Yarı Yarıya)</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
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

        {/* ======================================================================= */}
        {/* ADIM 5: ÖNİZLEME, İLETİŞİM & ADMIN ONAYI (SON SAYFA)                    */}
        {/* ======================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
                5. İlan Önizlemesi & İletişim Bilgileri
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Oluşturulan fizibilite kartınızı inceleyin ve iletişim bilgilerinizi girerek ilanı onaya gönderin.
              </p>
            </div>

            {/* İlan Canlı Önizleme Kartı */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Yatırımcı Vitrin Kartı Önizlemesi:
                </span>
                <VentureIdeaPreviewCard draft={draft} />
              </div>

              {/* Sağ Özet & Metrikler */}
              <div className="lg:col-span-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
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
                    <span className="font-bold text-amber-600">{formatCurrency(draft.budget.totalRequiredCapital)}</span>
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
                  <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Adınız & Soyadınız *
                  </Label>
                  <Input
                    placeholder="Örn: Uğur Zaman"
                    value={draft.authorName}
                    onChange={(e) => updateBasicInfo({ authorName: e.target.value })}
                    className="mt-1.5 h-11 rounded-xl text-sm"
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
                    className="mt-1.5 h-11 rounded-xl text-sm"
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
                  className="mt-1.5 h-11 rounded-xl text-sm"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1.5" />
                İlanınız moderasyon onayından geçtikten sonra <strong>Girişimbee Yatırım & Ortaklık Havuzunda</strong> doğrulanmış girişimci rozetiyle canlıya alınacaktır.
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ALT AKSİYON / ADIM ÇUBUĞU                                               */}
        {/* ======================================================================= */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="h-11 rounded-xl px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Geri
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="h-11 rounded-xl px-6 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
            >
              Devam Et
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-xl px-6 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Admin Onayına Gönder & İlanı Başlat
            </Button>
          )}
        </div>

      </div>

      {/* Alt Güvence Metni */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-[11px] text-muted-foreground">
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
