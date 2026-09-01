'use client';

import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Download,
  Printer,
  Copy,
  Check,
  X,
  FileText,
  Search,
  Building2,
  TrendingUp,
  UserCheck,
  FileBadge,
  Briefcase,
  Landmark,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { TURKEY_CITY_RENTAL_RATES } from '@/features/business-setup/data/district-rental-rates';
import {
  SECTOR_INCENTIVE_PROFILES,
  getCityIncentiveZone,
  getSectorIncentiveProfile,
} from '@/features/grants-incentives/data/grants-incentives-data';
import type {
  SectorIncentiveProfile,
  GrantSupportItem,
  EntrepreneurFilters,
} from '@/features/grants-incentives/types/grants-incentives.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GrantStepDef {
  id: number;
  title: string;
  subtitle: string;
}

const GRANT_STEPS: GrantStepDef[] = [
  { id: 1, title: 'Sektör & NACE Belirleme', subtitle: '25 sektör hibe ve NACE eşleşmesi' },
  { id: 2, title: 'KOSGEB Girişimcilik Hibesi', subtitle: 'Makine, yazılım ve kuruluş desteği' },
  { id: 3, title: 'Genç & Kadın Girişimci', subtitle: '3 Yıl Vergi + 1 Yıl Bağ-Kur desteği' },
  { id: 4, title: 'İŞKUR İstihdam Teşviki', subtitle: 'Personel başı SGK prim indirimi' },
  { id: 5, title: 'Bölgesel Yatırım & İhracat', subtitle: 'İl teşvik derecesi ve HİB destekleri' },
];

function downloadFile(filename: string, text: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([text], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function HomeGrantsIncentivesSection() {
  const [currentStepId, setCurrentStepId] = useState<number>(1);
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kadıköy');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('yazilim-ajans');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('Tümü');
  const [sectorPage, setSectorPage] = useState<number>(1);

  // Girişimci Profil Filtreleri
  const [filters, setFilters] = useState<EntrepreneurFilters>({
    isYoungEntrepreneur: true,
    isFemaleEntrepreneur: false,
    isPreEstablishment: true,
  });

  // Şart Kontrol Durumu (Adım 2 Checklist)
  const [checkedConditions, setCheckedConditions] = useState<Record<string, boolean>>({});

  // Modallar
  const [activeGrantDetail, setActiveGrantDetail] = useState<GrantSupportItem | null>(null);
  const [activeBusinessPlanDoc, setActiveBusinessPlanDoc] = useState<GrantSupportItem | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showConsultantModal, setShowConsultantModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [consultantFormSubmitted, setConsultantFormSubmitted] = useState<boolean>(false);

  // İl & İlçe Seçenekleri
  const cityOptions = useMemo(() => Object.keys(TURKEY_CITY_RENTAL_RATES), []);
  const districtOptions = useMemo(() => {
    const cityData = TURKEY_CITY_RENTAL_RATES[selectedCity];
    if (!cityData || !cityData.districtRates) return ['Merkez'];
    return Object.keys(cityData.districtRates);
  }, [selectedCity]);

  // Seçili İl Bölgesel Teşvik Derecesi
  const incentiveZone = useMemo(() => getCityIncentiveZone(selectedCity), [selectedCity]);

  // Seçili Sektör Teşvik Profili
  const currentProfile: SectorIncentiveProfile = useMemo(
    () => getSectorIncentiveProfile(selectedSectorId),
    [selectedSectorId],
  );

  // Tüm Sektörler ve Filtreleme
  const allSectors = useMemo(() => Object.values(SECTOR_INCENTIVE_PROFILES), []);
  const filteredSectors = useMemo(() => {
    return allSectors.filter((sec) => {
      const matchCat =
        selectedCategoryGroup === 'Tümü' || sec.categoryGroup === selectedCategoryGroup;
      const matchQuery =
        sec.sectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.naceCode.includes(searchQuery) ||
        sec.naceDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [allSectors, selectedCategoryGroup, searchQuery]);

  // 2x3 Sayfalama
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredSectors.length / itemsPerPage);
  const paginatedSectors = useMemo(() => {
    const start = (sectorPage - 1) * itemsPerPage;
    return filteredSectors.slice(start, start + itemsPerPage);
  }, [filteredSectors, sectorPage]);

  // Toplam Potansiyel Devlet Desteği ve Tasarruf Hesabı
  const totalCalculatedBenefits = useMemo(() => {
    let total = 0;

    // 1. KOSGEB ve diğer doğrudan hibe tutarları
    currentProfile.availableGrants.forEach((g) => {
      if (g.supportType === 'Hibe (Geri Ödemesiz)') {
        total += g.maxAmount;
      }
    });

    // Kadın Girişimci Ek Hibesi (+20.000 TL)
    if (filters.isFemaleEntrepreneur) {
      total += 20000;
    }

    // 2. Genç Girişimci Vergi Tasarrufu (3 Yıl x 82.500 TL = 247.500 TL)
    if (filters.isYoungEntrepreneur && currentProfile.taxExemptions.youngEntrepreneurTaxDiscount) {
      total += currentProfile.taxExemptions.annualEstimatedTaxSaving * 3;
    }

    // 3. Genç Girişimci 1 Yıllık Bağ-Kur Tasarrufu (84.000 TL)
    if (filters.isYoungEntrepreneur) {
      total += currentProfile.taxExemptions.annualBagkurSaving;
    }

    // 4. İŞKUR 1 Personel SGK İstihdam Teşviki (54.000 TL)
    total += 54000;

    return total;
  }, [currentProfile, filters]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Örnek KOSGEB İş Planı Taslağı Metni Üretici
  const generateBusinessPlanText = (grant: GrantSupportItem) => {
    return (
      `========================================================================\n` +
      `T.C. KÜÇÜK VE ORTA ÖLÇEKLİ İŞLETMELERİ GELİŞTİRME BAŞKANLIĞI (KOSGEB)\n` +
      `GİRİŞİMCİLİK DESTEK PROGRAMI - RESMİ İŞ PLANI VE BAŞVURU TASLAĞI\n` +
      `========================================================================\n\n` +
      `1. GİRİŞİMCİ VE İŞLETME KİMLİK BİLGİLERİ:\n` +
      `- Girişimci Adı & Unvanı: [Girişimci Ad Soyad] / [İşletme Unvanı]\n` +
      `- Hedef Sektör: ${currentProfile.sectorName} (${currentProfile.categoryGroup})\n` +
      `- NACE Kodu & Tanımı: ${currentProfile.naceCode} - ${currentProfile.naceDescription}\n` +
      `- Kurulum Lokasyonu: ${selectedDistrict} / ${selectedCity} (${incentiveZone.zoneName})\n` +
      `- KOSGEB Kategorisi: ${currentProfile.kosgebCategory}\n` +
      `- Başvurulan Destek Programı: ${grant.programName}\n` +
      `- Talep Edilen Destek Tutarı: ${formatCurrency(grant.maxAmount)} (${grant.coverageRatio})\n\n` +
      `2. İŞ FİKRİNİN ÖZETİ VE HEDEF PAZAR:\n` +
      `${grant.sampleBusinessPlan?.targetMarket || `${currentProfile.sectorName} alanında yenilikçi, kaliteli ve yasal standartlara tam uyumlu hizmet/üretim sunulması hedeflenmektedir.`}\n\n` +
      `3. MAKİNE, TEÇHİZAT VE YAZILIM İHTİYAÇLARI:\n` +
      `${grant.sampleBusinessPlan?.equipmentNeeds || `Faaliyetin yürütülmesi için gerekli sıfır demirbaş, teknik ekipman ve bilişim altyapısı temin edilecektir.`}\n\n` +
      `4. PROJE KİLOMETRE TAŞLARI:\n` +
      `${(grant.sampleBusinessPlan?.projectMilestones || [
        '1. Ay: Şirket kuruluşu, vergi açılışı ve KOSGEB sistem kaydı.',
        '3. Ay: Makine ve teçhizat faturalarının sisteme yüklenmesi ve hibe ödemesi.',
        '6. Ay: Tam kapasite faaliyete geçiş ve istihdam hedeflerinin sağlanması.',
      ])
        .map((m) => `* ${m}`)
        .join('\n')}\n\n` +
      `5. GİRİŞİMCİNİN HUKUKİ TAAHHÜTNAMESİ:\n` +
      `KOSGEB mevzuatı ve ilgili tebliğlerde belirtilen tüm şartları taşıdığımı, alımı yapılacak makine ve donanımların 3 yıl boyunca devredilmeyeceğini ve işletmenin aktif tutulacağını taahhüt ederim.\n\n` +
      `İmza: ........................................    Tarih: ${new Date().toLocaleDateString('tr-TR')}\n`
    );
  };

  // Tam Teşvik Raporu Metni Üretici
  const generateFullIncentiveReport = () => {
    return (
      `========================================================================\n` +
      `GİRİŞİMBEE - 2026 RESMİ HİBE, TEŞVİK VE DEVLET DESTEKLERİ RAPORU\n` +
      `Sektör: ${currentProfile.sectorName} | NACE Kodu: ${currentProfile.naceCode}\n` +
      `Lokasyon: ${selectedCity} / ${selectedDistrict} (${incentiveZone.zoneName})\n` +
      `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}\n` +
      `========================================================================\n\n` +
      `TOPLAM POTANSİYEL DEVLET DESTEĞİ & TASARRUF: ${formatCurrency(totalCalculatedBenefits)}\n\n` +
      `GİRİŞİMCİ PROFİLİ VE UYGULANAN TEŞVİKLER:\n` +
      `- Genç Girişimci (18-29 Yaş): ${filters.isYoungEntrepreneur ? 'EVET (3 Yıl Gelir Vergisi Muafiyeti + 1 Yıl Bağ-Kur Hazine Desteği)' : 'HAYIR'}\n` +
      `- Kadın Girişimci: ${filters.isFemaleEntrepreneur ? 'EVET (+20.000 TL KOSGEB İlave Kuruluş Hibesi)' : 'HAYIR'}\n` +
      `- Ön Başvuru Durumu: ${filters.isPreEstablishment ? 'Şirket Henüz Kurulmadı (KOSGEB Ön Kayıt Avantajı Aktif)' : 'Kurulmuş İşletme'}\n` +
      `- Yatırım Teşvik Bölgesi: ${incentiveZone.zoneName} (${incentiveZone.sgkEmployerShareSupportYears} Yıl SGK Desteği, ${incentiveZone.taxReductionRate} Vergi İndirimi)\n\n` +
      `HAK KAZANILABİLEN RESMİ DESTEK PROGRAMLARI:\n` +
      currentProfile.availableGrants
        .map((g) => {
          return (
            `------------------------------------------------------------------------\n` +
            `PROGRAM: ${g.programName}\n` +
            `Kurum: ${g.provider} | Destek Türü: ${g.supportType}\n` +
            `Azami Hibe Tutarı: ${formatCurrency(g.maxAmount)} (${g.coverageRatio})\n` +
            `Özet: ${g.summary}\n` +
            `Başvuru Şartları:\n${g.conditions.map((c) => `  * ${c}`).join('\n')}\n` +
            `e-Devlet Portalı: ${g.applicationUrl}\n`
          );
        })
        .join('\n\n') +
      `\n========================================================================\n` +
      `Bu rapor Girişimbee 2026 Mevzuat ve Teşvik Motoru tarafından resmi verilere dayalı olarak üretilmiştir.\n`
    );
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const primaryKosgebGrant = currentProfile.availableGrants[0];

  return (
    <section
      id="grants-section"
      className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
    >
      {/* 3 SÜTUNLU UYUMLANDIRILMIŞ FERAH KOKPİT */}
      <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md overflow-hidden ring-1 ring-slate-100 dark:ring-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* ========================================================================= */}
          {/* A. SOL SÜTUN: LOKASYON & 5 ADIMLI DİKEY STEPPER (col-span-3)             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-zinc-800/80 pb-5 lg:pb-0 lg:pr-5">
            <div className="space-y-4">
              {/* 1. Kurulum Lokasyonu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Kurulum Lokasyonu & Teşvik Bölgesi
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 px-2 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 px-2 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bölge Rozeti */}
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">
                    📍 {incentiveZone.zone}. Bölge Teşviki
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {incentiveZone.sgkEmployerShareSupportYears} Yıl SGK
                  </span>
                </div>
              </div>

              {/* 2. Dikey 5 Adımlı Teşvik Stepper */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Teşvik & Hibe Adımları
                </span>

                <div className="space-y-1">
                  {GRANT_STEPS.map((step) => {
                    const isActive = currentStepId === step.id;
                    const isCompleted = currentStepId > step.id;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setCurrentStepId(step.id)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer select-none',
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-500/40 shadow-xs'
                            : isCompleted
                              ? 'bg-slate-100/60 dark:bg-zinc-800/40 text-slate-700 dark:text-zinc-300 hover:bg-slate-100'
                              : 'hover:bg-slate-100 dark:hover:bg-zinc-800/40 text-muted-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 transition-colors',
                            isActive
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400',
                          )}
                        >
                          {isCompleted ? '✓' : step.id}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={cn(
                              'font-bold block truncate',
                              isActive
                                ? 'text-emerald-950 dark:text-emerald-200'
                                : 'text-slate-800 dark:text-zinc-200',
                            )}
                          >
                            {step.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {step.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sol Alt Seçili Sektör & NACE Özet Rozeti */}
            <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-zinc-100">
                <span>{currentProfile.emoji}</span>
                <span className="truncate">{currentProfile.sectorName}</span>
              </div>
              <div className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                NACE: {currentProfile.naceCode}
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                {currentProfile.naceDescription}
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. ORTA SÜTUN: İNTERAKTİF TEŞVİK ÇALIŞMA ALANI (col-span-6)               */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {/* ADIM 1: FERAH 2x3 MESLEK IZGARASI VE NACE EŞLEŞTİRİCİ */}
            {currentStepId === 1 && (
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Adım 1: Sektör & NACE Seçimi
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                      Hedef Mesleğinizi Seçin (25 Sektör)
                    </h3>
                  </div>

                  {/* Kategori Filtre Hapları */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
                    {['Tümü', 'Finans & Hizmet', 'Yeme - İçme', 'Kişisel Bakım & Sağlık', 'Perakende & Zanaat'].map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryGroup(cat);
                            setSectorPage(1);
                          }}
                          className={cn(
                            'px-2.5 py-1 rounded-xl font-bold whitespace-nowrap text-[11px] transition-colors cursor-pointer',
                            selectedCategoryGroup === cat
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-zinc-800 text-muted-foreground hover:text-slate-900 dark:hover:text-white',
                          )}
                        >
                          {cat}
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
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSectorPage(1);
                    }}
                    placeholder="Sektör, NACE kodu veya meslek ara..."
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 pl-8 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* 2x3 Meslek Kartları Grid'i */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {paginatedSectors.map((sec) => {
                    const isSelected = selectedSectorId === sec.sectorId;
                    const maxHibe = sec.availableGrants.reduce(
                      (acc, g) => (g.supportType === 'Hibe (Geri Ödemesiz)' ? acc + g.maxAmount : acc),
                      0,
                    );

                    return (
                      <div
                        key={sec.sectorId}
                        onClick={() => setSelectedSectorId(sec.sectorId)}
                        className={cn(
                          'p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none relative',
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700',
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{sec.emoji}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[9.5px] font-mono font-bold">
                              {sec.naceCode}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug line-clamp-1">
                            {sec.sectorName}
                          </h4>
                          <span className="text-[10px] text-muted-foreground block line-clamp-1">
                            {sec.kosgebCategory}
                          </span>
                        </div>

                        <div className="pt-1 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-bold">
                            {formatCurrency(maxHibe)} Hibe
                          </span>
                          <span
                            className={cn(
                              'w-4 h-4 rounded-full flex items-center justify-center text-[10px]',
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400',
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
                      Sayfa {sectorPage} / {totalPages} ({filteredSectors.length} Sektör)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={sectorPage === 1}
                        onClick={() => setSectorPage((p) => Math.max(1, p - 1))}
                        className="h-7 px-2 text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={sectorPage === totalPages}
                        onClick={() => setSectorPage((p) => Math.min(totalPages, p + 1))}
                        className="h-7 px-2 text-xs"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADIM 2: KOSGEB GİRİŞİMCİLİK HİBESİ VE İŞ PLANI DETAYI */}
            {currentStepId === 2 && primaryKosgebGrant && (
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10.5px] font-bold">
                        KOSGEB
                      </span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {currentProfile.kosgebCategory}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                      {primaryKosgebGrant.programName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground block">Azami Hibe</span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(primaryKosgebGrant.maxAmount)}
                    </span>
                  </div>
                </div>

                {/* 3'lü Özet Hapları */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">Destek Türü</span>
                    <span className="font-bold text-slate-900 dark:text-white">Geri Ödemesiz Hibe</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">Hibe Oranı</span>
                    <span className="font-bold text-emerald-600">{primaryKosgebGrant.coverageRatio}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">Başvuru Kanalı</span>
                    <span className="font-bold text-indigo-600">e-Devlet Portalı</span>
                  </div>
                </div>

                {/* Nereye & Nasıl Başvurulur? */}
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <span>🧭</span>
                    <span>KOSGEB Başvuru ve Kabul Süreci:</span>
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-slate-700 dark:text-zinc-300 pl-4 list-disc">
                    <li>KOSGEB e-Akademi üzerinden online Girişimcilik Sertifikası tamamlanır.</li>
                    <li>Şirket kuruluşu ve Ticaret/Esnaf Sicil tescili gerçekleştirilir.</li>
                    <li>e-Devlet KOSGEB sistemine giriş yapılarak KOBİ Beyannamesi onaylanır.</li>
                    <li>İş planı ve makine/teçhizat proforma faturaları kurula sunulur.</li>
                  </ul>
                </div>

                {/* Başvuru Şartları Checklist */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                    📋 Başvuru Kriterleri Kontrol Listesi:
                  </span>
                  <div className="space-y-1 text-xs">
                    {primaryKosgebGrant.conditions.map((c, idx) => {
                      const isChecked = !!checkedConditions[c];
                      return (
                        <label
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setCheckedConditions((prev) => ({ ...prev, [c]: e.target.checked }))
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                          />
                          <span
                            className={cn(
                              'text-[11.5px] font-medium',
                              isChecked ? 'line-through text-muted-foreground' : 'text-slate-800 dark:text-zinc-200',
                            )}
                          >
                            {c}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Kritik Püf Noktası */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200">
                  <strong>💡 Kritik Hibe Püf Noktası:</strong> Alımı yapılacak makine ve bilgisayar donanımlarının mutlaka sıfır (kullanılmamış) olması ve faturasının şirket adına kesilmesi şarttır. Yerli malı belgeli makinelerde hibe oranı ilave %15 artırılır.
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveBusinessPlanDoc(primaryKosgebGrant)}
                    className="h-8.5 rounded-xl text-xs font-bold gap-1 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Örnek İş Planı Taslağını Al (.doc)</span>
                  </Button>

                  <a
                    href={primaryKosgebGrant.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 h-8.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>KOSGEB Portalı ile Başvur</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* ADIM 3: GENÇ & KADIN GİRİŞİMCİ VERGİ VE BAĞ-KUR MUAFİYETİ */}
            {currentStepId === 3 && (
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[10.5px] font-bold">
                      Gelir İdaresi (GİB) & SGK
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                      Genç Girişimci Vergi İstisnası ve Bağ-Kur Prim Teşviki
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground block">Toplam Tasarruf</span>
                    <span className="text-lg font-black text-sky-700 dark:text-sky-400">
                      ~₺331.500
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 space-y-1">
                    <span className="font-bold text-sky-900 dark:text-sky-300 block">
                      3 Yıl Gelir Vergisi Muafiyeti
                    </span>
                    <div className="text-sm font-black text-sky-700 dark:text-sky-400">
                      Yıllık 330.000 TL
                    </div>
                    <p className="text-[10.5px] text-muted-foreground leading-tight">
                      18-29 yaş arası girişimcilerin ilk 3 vergilendirme dönemindeki ticari kazançlarının 330.000 TL\'lik kısmı gelir vergisinden tamamen istisnadır.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                      1 Yıl (365 Gün) Bağ-Kur Desteği
                    </span>
                    <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₺84.000 Hazine Karşılar
                    </div>
                    <p className="text-[10.5px] text-muted-foreground leading-tight">
                      Şirket kuruluş tarihinden itibaren 1 yıl boyunca aylık 4/b Bağ-Kur primlerinin tamamı Hazine ve Maliye Bakanlığı tarafından ödenir.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    🧭 Genç Girişimci İstisna Belgesi Nasıl Alınır?
                  </span>
                  <ol className="space-y-1 text-[11px] text-slate-700 dark:text-zinc-300 pl-4 list-decimal">
                    <li>İnteraktif Vergi Dairesi (İVD) üzerinden "Genç Girişimci Kazanç İstisnası Dilekçesi" verilir.</li>
                    <li>Vergi dairesinden onaylı "Genç Girişimci İstisna Yazısı" temin edilir.</li>
                    <li>Alınan resmi yazı e-Devlet üzerinden SGK İl Müdürlüğü'ne iletilerek 1 yıllık Bağ-Kur prim muafiyeti aktif edilir.</li>
                  </ol>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200">
                  <strong>💡 Genç Girişimci Püf Noktası:</strong> İstisnadan faydalanabilmek için daha önce adınıza herhangi bir şahıs işletmesi veya adi ortaklık kurulmamış olması şarttır. Limited şirket ortaklıklarında vergi istisnası uygulanmaz.
                </div>
              </div>
            )}

            {/* ADIM 4: İŞKUR İSTİHDAM PRİM İNDİRİMİ */}
            {currentStepId === 4 && (
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10.5px] font-bold">
                      İŞKUR & SGK
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                      Yeni İstihdam Başına SGK İşveren Payı Prim Teşviki
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground block">Personel Başı</span>
                    <span className="text-lg font-black text-purple-700 dark:text-purple-400">
                      ₺54.000
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs space-y-1.5">
                  <span className="font-bold text-purple-900 dark:text-purple-300">
                    5510 Sayılı Kanun & 6111 Sayılı Genç İstihdam Teşviki
                  </span>
                  <p className="text-[11.5px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                    İşletmenizde yeni işe alacağınız ve son 3 aydır İŞKUR'a kayıtlı işsiz statüsündeki personeller için 6 ila 24 ay boyunca asgari ücret üzerinden SGK işveren hissesi devlet tarafından karşılanır.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    🧭 İŞKUR İstihdam Teşviki Başvuru Adımları:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-700 dark:text-zinc-300 pl-4 list-disc">
                    <li>İşletme e-Bildirge portalı üzerinden "4447 Geçici 10. Madde Teşvik Tanımlama" ekranına girilir.</li>
                    <li>İşe alınacak personelin T.C. kimlik numarası ile teşvik uygunluğu sorgulanır.</li>
                    <li>Aylık SGK prim bildirgeleri verilirken teşvik kodu seçilerek otomatik prim indirimi uygulanır.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200">
                  <strong>💡 İstihdam Teşviki Püf Noktası:</strong> İşe alınan personelin kadın veya 18-29 yaş arası genç olması durumunda teşvik süresi 6 aydan 24 aya kadar uzatılmaktadır.
                </div>
              </div>
            )}

            {/* ADIM 5: BÖLGESEL YATIRIM & İHRACAT TEŞVİKLERİ */}
            {currentStepId === 5 && (
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-teal-600 text-white text-[10.5px] font-bold">
                      Sanayi Bakanlığı & Ticaret Bakanlığı
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                      {selectedCity} {incentiveZone.zoneName} Teşvikleri
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground block">Teşvik Bölgesi</span>
                    <span className="text-lg font-black text-teal-700 dark:text-teal-400">
                      {incentiveZone.zone}. Bölge
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">SGK İşveren Desteği</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {incentiveZone.sgkEmployerShareSupportYears} Yıl
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">Vergi İndirim Oranı</span>
                    <span className="font-bold text-teal-600">{incentiveZone.taxReductionRate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                    <span className="text-[10px] text-muted-foreground block">Faiz Desteği</span>
                    <span className="font-bold text-indigo-600">{incentiveZone.interestSupportPoints} Puan</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 text-xs space-y-1">
                  <span className="font-bold text-teal-900 dark:text-teal-300">
                    Bölgesel Yatırım Teşvik Belgesi Avantajları:
                  </span>
                  <p className="text-[11.5px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {selectedCity} ilinde yapacağınız sabit yatırımlarda KDV istisnası, Gümrük Vergisi muafiyeti ve yatırım yeri tahsisi imkanlarından yararlanabilirsiniz.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    🌐 E-İhracat ve Hizmet İhracatı Teşvikleri (HİB):
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                    Yurtdışına yönelik dijital reklamlar, Google/Meta pazarlama harcamaları ve yabancı dilde hazırlanan web sitesi giderlerinin %60'ı Ticaret Bakanlığı tarafından geri ödemesiz karşılanır.
                  </p>
                </div>
              </div>
            )}

            {/* ORTA ALT ADIM GEZİNME BUTONLARI */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentStepId === 1}
                onClick={() => setCurrentStepId((s) => Math.max(1, s - 1))}
                className="h-8 text-xs font-bold gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Önceki Aşama</span>
              </Button>

              {currentStepId < 5 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStepId((s) => Math.min(5, s + 1))}
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1 cursor-pointer"
                >
                  <span>Sonraki Teşvik Adımı</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tüm Teşvik Raporunu İndir</span>
                </Button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* C. SAĞ SÜTUN: TOPLAM DEVLET DESTEĞİ & GİRİŞİMCİ FİLTRELERİ (col-span-3)   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-zinc-800/80 pt-5 lg:pt-0 lg:pl-5">
            <div className="space-y-3.5">
              {/* 1. Toplam Potansiyel Devlet Desteği Kartı */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Toplam Devlet Desteği
                  </span>
                  <Landmark className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(totalCalculatedBenefits)}
                </div>

                <p className="text-[10px] text-muted-foreground leading-tight">
                  Seçili profilinizle kazanılabilecek hibe, 3 yıllık vergi muafiyeti ve Bağ-Kur tasarruflarının canlı toplamıdır.
                </p>
              </div>

              {/* 2. Girişimci Profil Filtreleri */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Girişimci Profil Filtreleri
                </span>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-xs font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.isYoungEntrepreneur}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, isYoungEntrepreneur: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <div className="min-w-0">
                      <span className="text-slate-900 dark:text-zinc-100 block text-[11px] truncate">
                        18-29 Yaş (Genç Girişimci)
                      </span>
                      <span className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                        3 Yıl Vergi + 1 Yıl Bağ-Kur
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-xs font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.isFemaleEntrepreneur}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isFemaleEntrepreneur: e.target.checked,
                        }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <div className="min-w-0">
                      <span className="text-slate-900 dark:text-zinc-100 block text-[11px] truncate">
                        Kadın Girişimci
                      </span>
                      <span className="text-[9.5px] text-pink-700 dark:text-pink-400 font-semibold block">
                        +20.000 TL Ek Hibe Desteği
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-xs font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.isPreEstablishment}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isPreEstablishment: e.target.checked,
                        }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <div className="min-w-0">
                      <span className="text-slate-900 dark:text-zinc-100 block text-[11px] truncate">
                        Şirket Henüz Kurulmadı
                      </span>
                      <span className="text-[9.5px] text-sky-700 dark:text-sky-400 font-semibold block">
                        Ön Başvuru Avantajı
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Teşvik Uygunluk Karnesi */}
              <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">KOSGEB NACE:</span>
                  <span className="font-bold text-emerald-600">✓ Destek Kapsamında</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bölgesel Derece:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{incentiveZone.zone}. Bölge</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Genç Girişimci:</span>
                  <span className="font-bold text-sky-600">
                    {filters.isYoungEntrepreneur ? '%100 Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sağ Alt Aksiyon Butonları */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="w-full h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Teşvik & Hibe Raporunu İndir</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConsultantModal(true);
                  setConsultantFormSubmitted(false);
                }}
                className="w-full h-10 rounded-2xl border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>KOSGEB Danışmanı ile Görüş</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HİBE ŞARTLARI & BAŞVURU DETAY MODALI                                    */}
      {/* ========================================================================= */}
      {activeGrantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  🏛️
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeGrantDetail.programName}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    {activeGrantDetail.provider} • {activeGrantDetail.supportType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveGrantDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <span className="text-[10.5px] font-bold text-emerald-900 dark:text-emerald-300 block">
                  Azami Destek Limiti & Oranı
                </span>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(activeGrantDetail.maxAmount)} ({activeGrantDetail.coverageRatio})
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Başvuru Koşulları:</h4>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-700 dark:text-zinc-300 text-[11.5px]">
                  {activeGrantDetail.conditions.map((cond, idx) => (
                    <li key={idx} className="leading-snug">
                      {cond}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 text-slate-600 dark:text-zinc-400 text-[11px]">
                <strong>Yasal Dayanak:</strong> {activeGrantDetail.officialReference}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 bg-white dark:bg-zinc-900">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveGrantDetail(null)}
                className="h-9 text-xs font-bold"
              >
                Kapat
              </Button>
              <a
                href={activeGrantDetail.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>e-Devlet Portalı ile Başvur</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ÖRNEK KOSGEB İŞ PLANI MODALI                                            */}
      {/* ========================================================================= */}
      {activeBusinessPlanDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="printable-document-modal"
            className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <FileBadge className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {currentProfile.sectorName} - Örnek KOSGEB İş Planı
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    NACE: {currentProfile.naceCode} • 2026 Destek Başvuru Taslağı
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveBusinessPlanDoc(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-muted-foreground transition-colors cursor-pointer no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono leading-relaxed bg-slate-50/40 dark:bg-zinc-950/40">
              <div className="text-center pb-3 border-b-2 border-slate-300 dark:border-zinc-700 space-y-1">
                <span className="text-[10px] tracking-widest text-emerald-700 dark:text-emerald-400 font-bold block">
                  ★ T.C. KOSGEB GİRİŞİMCİLİK DESTEK PROGRAMI ★
                </span>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                  {currentProfile.sectorName} Resmi İş Planı ve Başvuru Taslağı
                </h2>
                <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-sans">
                  RESMİ KOSGEB BAŞVURU ŞABLONU - 2026 GİRİŞİMBEE
                </div>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    1. Girişimci & İşletme Künyesi
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    Sektör: {currentProfile.sectorName} | NACE: {currentProfile.naceCode} -{' '}
                    {currentProfile.naceDescription} | Lokasyon: {selectedCity} / {selectedDistrict}{' '}
                    ({incentiveZone.zoneName})
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    2. Hedef Pazar ve İş Modeli
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {activeBusinessPlanDoc.sampleBusinessPlan?.targetMarket ||
                      `${currentProfile.sectorName} sektöründe yerel rekabet analizi yapılmış olup, yüksek müşteri memnuniyeti ve sürdürülebilir nakit akışı hedeflenmektedir.`}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    3. Makine, Teçhizat ve Altyapı Talepleri
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {activeBusinessPlanDoc.sampleBusinessPlan?.equipmentNeeds ||
                      `İşletmenin faaliyete geçebilmesi için asgari gerekli demirbaş, yazılım ve çalışma istasyonu harcamaları KOSGEB hibe kapsamına alınacaktır.`}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 font-sans grid grid-cols-2 gap-2 text-center text-[10.5px]">
                <div className="p-2 border border-dashed rounded-lg text-slate-600 dark:text-zinc-400">
                  Girişimci / Başvuru Sahibi (İmza)
                </div>
                <div className="p-2 border border-dashed rounded-lg text-slate-600 dark:text-zinc-400">
                  KOSGEB Hizmet Merkezi Onayı
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-900 no-print">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyText(generateBusinessPlanText(activeBusinessPlanDoc))}
                  className="h-9 text-xs font-bold gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const txt = generateBusinessPlanText(activeBusinessPlanDoc);
                    downloadFile(`${currentProfile.sectorId}_kosgeb_is_plani.doc`, txt);
                  }}
                  className="h-9 text-xs font-bold gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İş Planını İndir (.doc)</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveBusinessPlanDoc(null)}
                  className="h-9 text-xs font-bold"
                >
                  Kapat
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF Kaydet</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TEŞVİK & HİBE TAM RAPOR YAZDIRMA / İNDİRME MODALI                      */}
      {/* ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="printable-roadmap-modal"
            className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentProfile.emoji}</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {currentProfile.sectorName} - 2026 Hibe & Teşvik Raporu
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    NACE: {currentProfile.naceCode} • {selectedCity} / {selectedDistrict}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-muted-foreground transition-colors cursor-pointer no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30">
                  <span className="text-[10px] text-muted-foreground block">Toplam Devlet Desteği</span>
                  <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totalCalculatedBenefits)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <span className="text-[10px] text-muted-foreground block">Bölgesel Teşvik</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {incentiveZone.zone}. Bölge ({selectedCity})
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <span className="text-[10px] text-muted-foreground block">KOSGEB Kategorisi</span>
                  <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                    {currentProfile.kosgebCategory}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Hak Kazanılan Destek ve Tasarruf Kalemleri
                </h4>
                {currentProfile.availableGrants.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{g.programName}</span>
                      <span className="text-emerald-600">{formatCurrency(g.maxAmount)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Kurum: {g.provider} • Tür: {g.supportType} • Oran: {g.coverageRatio}
                    </p>
                    <div className="text-[11px] text-slate-700 dark:text-zinc-300">
                      <strong>Şartlar:</strong> {g.conditions.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-900 no-print">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const report = generateFullIncentiveReport();
                  downloadFile(`${currentProfile.sectorId}_tesvik_ve_hibe_raporu.doc`, report);
                }}
                className="h-9 text-xs font-bold gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Raporu İndir (.doc)</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                  className="h-9 text-xs font-bold"
                >
                  Kapat
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Raporu Yazdır / PDF İndir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. KOSGEB PROJE DANIŞMANI İLE GÖRÜŞ MODALI                                */}
      {/* ========================================================================= */}
      {showConsultantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🤝
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    KOSGEB & Teşvik Danışmanı
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    {currentProfile.sectorName} Başvuru Desteği
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConsultantModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {consultantFormSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-center space-y-2">
                <div className="text-2xl">✅</div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Talebiniz Başarıyla Alındı!
                </h4>
                <p className="text-[11.5px] text-muted-foreground">
                  KOSGEB akredite proje danışmanımız en geç 2 iş saati içerisinde kayıtlı telefon ve e-posta adresinizden sizinle iletişime geçecektir.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowConsultantModal(false)}
                  className="w-full mt-2 bg-emerald-600 text-white text-xs font-bold"
                >
                  Tamam
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConsultantFormSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-[11.5px] text-muted-foreground">
                  <strong>{currentProfile.sectorName}</strong> için azami{' '}
                  <strong>{formatCurrency(totalCalculatedBenefits)}</strong> hibe ve teşvik dosyanızın KOSGEB onayına sunulması için danışman talep formu oluşturun:
                </p>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-muted-foreground">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-muted-foreground">Telefon Numarası</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConsultantModal(false)}
                    className="h-9 text-xs font-bold"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                  >
                    Danışman Talebi Gönder →
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default HomeGrantsIncentivesSection;
