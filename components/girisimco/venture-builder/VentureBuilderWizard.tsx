'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useVentureBuilderStore } from '@/lib/stores/venture-builder-store';
import {
  VentureCategory,
  WorkspaceType,
  VehicleType,
  TimeCommitment,
} from '@/lib/types/venture-builder';
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

const WORKSPACES: { id: WorkspaceType; label: string; desc: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Kendi Evim / Odam', desc: 'Kira masrafı ₺0 (Mutfak, oda veya masa)', icon: Home },
  { id: 'garage_workshop', label: 'Garaj / Özel Atölye', desc: 'Müstakil alan veya hobi atölyesi', icon: Building },
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

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    submitDraftForReview();
    setIsSubmitted(true);
  };

  const steps = [
    { num: 1, title: 'Fikir & Konsept' },
    { num: 2, title: 'Masaya Koydukların' },
    { num: 3, title: 'Bütçe İhtiyacı' },
    { num: 4, title: 'Yatırımcı Teklifi' },
    { num: 5, title: 'Önizleme & Onay' },
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground">
          Fikriniz Başarıyla Modellendi ve İncelemeye Alındı!
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
          Girişimbee moderasyon ekibi fizibilite verilerinizi inceledikten sonra projeniz onaylanacak ve{' '}
          <strong className="text-slate-900 dark:text-white">Girişimbee Ortaklık & Yatırımcı Vitrininde</strong> yayına
          alınacaktır.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl h-11 px-6">
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* SOL ALAN: ÇOK ADIMLI FORM SİHİRBAZI */}
      <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        {/* İlerleme Çubuğu & Adım Başlıkları */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Adım 0{currentStep} / 05
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {steps[currentStep - 1]?.title}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
            {steps.map((s) => (
              <div
                key={s.num}
                className={cn(
                  'h-full transition-all duration-300 rounded-full',
                  currentStep >= s.num ? 'bg-amber-500' : 'bg-transparent'
                )}
              />
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ADIM 1: FİKİR & KONSEPT                                                   */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-foreground">
                1. Fikrinin Adı & Niş Konsepti
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-zinc-400 mt-1">
                Yatırımcının ilk göreceği dikkat çekici başlığı ve kategoriyi belirleyin.
              </p>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Fikir / Proje Başlığı *
              </Label>
              <Input
                placeholder="Örn: Evcil Hayvan Doğum Günü & Parti Kutusu (Pup-Party Box)"
                value={draft.title}
                onChange={(e) => updateBasicInfo({ title: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Sektör / Kategori *
                </Label>
                <select
                  value={draft.category}
                  onChange={(e) => updateBasicInfo({ category: e.target.value as VentureCategory })}
                  className="mt-1.5 w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Şehir / Lokasyon *
                </Label>
                <Input
                  placeholder="Örn: İstanbul / Türkiye Geneli"
                  value={draft.authorCity}
                  onChange={(e) => updateBasicInfo({ authorCity: e.target.value })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Tek Cümlelik Çarpıcı Özet (One-Liner) *
              </Label>
              <Input
                placeholder="Örn: Köpekler için şekersiz pasta, parti şapkası ve anı çerçevesinden oluşan kişiselleştirilmiş parti kutusu."
                value={draft.oneLiner}
                onChange={(e) => updateBasicInfo({ oneLiner: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Bu Fikir Neden Tutar / Çok Satar? (Pazar Açığı) *
              </Label>
              <Textarea
                rows={3}
                placeholder="Örn: Köpek sahipleri doğum günlerinde sosyal medyada paylaşmak için özel temalı kutlamalar yapıyor ve hazır kutu seti bulamıyor..."
                value={draft.whyItWorks}
                onChange={(e) => updateBasicInfo({ whyItWorks: e.target.value })}
                className="mt-1.5 rounded-xl resize-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADIM 2: MASAYA KOYDUKLARIN (ÖZKAYNAKLAR)                                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-foreground">
                2. Sen Masaya Ne Koyuyorsun? (Özkaynakların)
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-zinc-400 mt-1">
                Yatırımcıya bütçen olmasa bile işi yürütecek araç, mekan veya emeğinin hazır olduğunu gösterin.
              </p>
            </div>

            {/* Çalışma Alanı / Mekan Seçimi */}
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 block">
                Çalışma Alanı & Mekan Durumu
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WORKSPACES.map((ws) => {
                  const isSelected = draft.collateral.workspaceType === ws.id;
                  const Icon = ws.icon;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => updateCollateral({ workspaceType: ws.id })}
                      className={cn(
                        'flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                        isSelected
                          ? 'border-amber-500 bg-amber-500/5 text-slate-900 dark:text-white'
                          : 'border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-amber-600' : 'text-slate-400')} />
                      <div>
                        <span className="block text-xs font-bold">{ws.label}</span>
                        <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{ws.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Taşıt Durumu */}
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 block">
                Lojistik & Taşıt İmkânı
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {VEHICLES.map((vh) => {
                  const isSelected = draft.collateral.vehicleType === vh.id;
                  const Icon = vh.icon;
                  return (
                    <button
                      key={vh.id}
                      type="button"
                      onClick={() => updateCollateral({ vehicleType: vh.id })}
                      className={cn(
                        'flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                        isSelected
                          ? 'border-amber-500 bg-amber-500/5 text-slate-900 dark:text-white'
                          : 'border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', isSelected ? 'text-amber-600' : 'text-slate-400')} />
                      <div>
                        <span className="block text-xs font-bold">{vh.label}</span>
                        <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{vh.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emek & Zaman Taahhüdü */}
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 block">
                Haftalık Ayırabileceğin Çalışma Saati (Emek)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={5}
                  max={80}
                  value={draft.collateral.hoursPerWeek}
                  onChange={(e) => updateCollateral({ hoursPerWeek: Number(e.target.value) || 40 })}
                  className="w-28 h-11 rounded-xl font-bold"
                />
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Saat / Hafta (Örn: Tam zamanlı için 40-50 saat)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADIM 3: BÜTÇE İHTİYACI                                                    */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-foreground">
                3. Ne Kadar Bütçeye İhtiyacın Var?
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-zinc-400 mt-1">
                İşi sıfırdan ayağa kaldırmak için yatırımcıdan aradığınız net başlangıç maliyetlerini girin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Ekipman & Cihaz Maliyeti (₺)
                </Label>
                <Input
                  type="number"
                  placeholder="35000"
                  value={draft.budget.equipmentCost || ''}
                  onChange={(e) => updateBudget({ equipmentCost: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  İlk 2-3 Aylık Hammadde / Stok (₺)
                </Label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={draft.budget.initialStockCost || ''}
                  onChange={(e) => updateBudget({ initialStockCost: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Başlangıç Reklam & Tanıtım (₺)
                </Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={draft.budget.marketingCost || ''}
                  onChange={(e) => updateBudget({ marketingCost: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  İşletme & Tampon Bütçe (₺)
                </Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={draft.budget.operatingBufferCost || ''}
                  onChange={(e) => updateBudget({ operatingBufferCost: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Otomatik Toplam Kutu */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Toplam Aranan Yatırım Bütçesi:
                </span>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  Yatırımcıya sunulacak net sermaye talebi
                </p>
              </div>
              <span className="font-display text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                ₺{draft.budget.totalRequiredCapital.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADIM 4: PROJEKSİYON & YATIRIMCI TEKLİFİ                                   */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-foreground">
                4. Finansal Öngörü & Yatırımcıya Teklifin
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-zinc-400 mt-1">
                Aylık kâr tahmininizi ve yatırımcıya önerdiğiniz kâr ortaklığı oranını belirleyin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Tahmini Aylık Ciro / Gelir (₺) *
                </Label>
                <Input
                  type="number"
                  placeholder="85000"
                  value={draft.financials.estimatedMonthlyRevenue || ''}
                  onChange={(e) => updateFinancials({ estimatedMonthlyRevenue: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Tahmini Aylık Net Kâr (₺) *
                </Label>
                <Input
                  type="number"
                  placeholder="55000"
                  value={draft.financials.estimatedMonthlyNetProfit || ''}
                  onChange={(e) => updateFinancials({ estimatedMonthlyNetProfit: Number(e.target.value) || 0 })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Yatırımcıya Önerilen Net Kâr Payı Oranı (%) *
                </Label>
                <span className="font-display text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
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
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
                <span>%10 (Küçük Katkı)</span>
                <span>%30 - %40 (Dengeli Ortaklık)</span>
                <span>%50 (Yarı Yarıya)</span>
              </div>
            </div>

            {/* Otomatik Amortisman & Dönüş Kutusu */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Yatırımcının Parasını Çıkarma Süresi:
                </span>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  Aranan bütçenin kâr payıyla geri ödenme hızı
                </p>
              </div>
              <span className="font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ~{draft.financials.calculatedPaybackMonths} Ay
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADIM 5: ÖNİZLEME & ONAY                                                    */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-foreground">
                5. İletişim Bilgileriniz & Son Onay
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-zinc-400 mt-1">
                Yatırımcıların sizinle iletişime geçebilmesi için iletişim bilgilerinizi girin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Adınız & Soyadınız *
                </Label>
                <Input
                  placeholder="Örn: Burak Özdemir"
                  value={draft.authorName}
                  onChange={(e) => updateBasicInfo({ authorName: e.target.value })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Telefon Numaranız *
                </Label>
                <Input
                  placeholder="05XX XXX XX XX"
                  value={draft.authorPhone || ''}
                  onChange={(e) => updateBasicInfo({ authorPhone: e.target.value })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                E-Posta Adresiniz *
              </Label>
              <Input
                type="email"
                placeholder="girisimci@ornek.com"
                value={draft.authorEmail || ''}
                onChange={(e) => updateBasicInfo({ authorEmail: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1.5" />
              Modeliniz gönderildikten sonra Girişimbee moderatörleri tarafından incelenir ve onaylandığında{' '}
              <strong>Girişimbee Ortaklık & Yatırımcı Vitrininde</strong> canlıya alınır.
            </div>
          </div>
        )}

        {/* Alt Adım Butonları */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="rounded-xl h-11 px-5 font-semibold text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Geri
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-xl h-11 px-6 font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
            >
              Devam Et
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl h-11 px-6 font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Admin Onayına Gönder & Yatırım Çağrısı Aç
            </Button>
          )}
        </div>
      </div>

      {/* SAĞ ALAN: CANLI FİZİBİLİTE KARTI ÖNİZLEMESİ */}
      <div className="lg:col-span-5 sticky top-24 space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Canlı Yatırımcı Kartı Önizlemesi
          </p>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Otomatik Güncellenir
          </span>
        </div>

        <VentureIdeaPreviewCard draft={draft} />

        <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 text-[11.5px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          💡 Bu kart, modelinizi tamamladığınızda <strong>/girisim-ortaklik</strong> sayfasında yatırımcılara ve kurucu ortak adaylarına sergilenecektir.
        </div>
      </div>
    </div>
  );
}
