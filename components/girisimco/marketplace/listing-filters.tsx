'use client';

import { useMemo } from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { MarketplaceFilterState } from '@/features/listings/types/marketplace.types';
import {
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CITY_OPTIONS,
  getUserDiscoverableCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import {
  getAllTaxonomyPositions,
  getPositionsForSector,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { HIZMET_CATEGORY_OPTIONS } from '@/features/listings/config/listing-type-config';
import { JobFlowFilters } from '@/components/girisimco/marketplace/job-flow-filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

interface CountOption {
  value: string;
  count: number;
}

function getOptionsByCount(
  items: ContentItem[],
  extractor: (item: ContentItem) => string | undefined,
): CountOption[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const val = extractor(item)?.trim();
    if (val && !val.includes('Diğer') && !val.includes('Kendim') && val !== 'Türkiye') {
      map.set(val, (map.get(val) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'tr-TR'));
}

const CATEGORY_CUSTOM_LABELS: Record<string, string> = {
  'ise-al': 'Kariyer ve İş İlanları',
  'is-ariyorum': 'İş Arayanlar',
  'ortak-bul': 'Ortaklık ve Kurucu',
  'bayilik-al': 'Franchise ve Bayilik',
  'isletme-devri': 'İşletme Devri',
  hizmetler: 'Ustalar ve Hizmetler',
};

interface ListingFiltersProps {
  items?: ContentItem[];
  filters: MarketplaceFilterState;
  onChange: (patch: Partial<MarketplaceFilterState>) => void;
  /** Hide category picker when on a dedicated category page */
  hideCategory?: boolean;
  /** Show İşe Alıyorum / İş Arıyorum chips (unified /is feed). */
  showJobFlowFilters?: boolean;
  /** Show Ortak Arıyorum / Ortak Olmak İstiyorum / İşletme Devri chips. */
  showVentureFlowFilters?: boolean;
  searchSlot?: React.ReactNode;
  className?: string;
}

export function ListingFilters({
  items = [],
  filters,
  onChange,
  hideCategory = false,
  showJobFlowFilters = false,
  searchSlot,
  className,
}: ListingFiltersProps) {
  const isCareer = Boolean(
    filters.jobFlow ||
      filters.categorySlug === 'ise-al' ||
      filters.categorySlug === 'is-ariyorum' ||
      filters.categorySlug === 'is-bul',
  );
  const isPartnership = filters.categorySlug === 'ortak-bul' || filters.categorySlug === 'ortaklik';
  const isBusinessTransfer = filters.categorySlug === 'isletme-devri';
  const isFranchise = filters.categorySlug === 'bayilik-al' || filters.categorySlug === 'franchise';
  const isServices = filters.categorySlug === 'hizmetler' || filters.categorySlug === 'hizmet-ver' || filters.categorySlug === 'esnaf';

  const isSeek = filters.jobFlow === 'seek' || filters.categorySlug === 'is-ariyorum' || filters.categorySlug === 'is-bul';
  const themeColor = isCareer
    ? isSeek
      ? 'sky'
      : 'emerald'
    : isPartnership || isBusinessTransfer
      ? 'amber'
      : isFranchise
        ? 'pink'
        : isServices
          ? 'indigo'
          : 'blue';

  // 1. Sektörler: Var olan ilanlardaki sektörler, ilan sayısına göre azalan sırada
  const availableSectors = useMemo(() => {
    return getOptionsByCount(items, (item) => item.sector);
  }, [items]);

  // Kariyer: Pozisyonlar & Deneyim Seviyeleri
  const availablePositions = useMemo(() => {
    if (!isCareer) return [];
    const filteredItems = filters.sector
      ? items.filter((item) => item.sector?.toLowerCase() === filters.sector?.toLowerCase())
      : items;

    return getOptionsByCount(filteredItems, (item) => item.position || (isSeek ? item.title : undefined));
  }, [items, filters.sector, isCareer, isSeek]);

  const availableLevels = useMemo(() => {
    if (!isCareer) return [];
    const filteredItems = items.filter((item) => {
      if (filters.sector && item.sector?.toLowerCase() !== filters.sector.toLowerCase()) return false;
      if (filters.position && (item.position || item.title)?.toLowerCase() !== filters.position.toLowerCase()) return false;
      return true;
    });

    return getOptionsByCount(filteredItems, (item) => item.experienceLevel);
  }, [items, filters.sector, filters.position, isCareer]);

  // Ortaklık: Ortaklık Aşaması (stage) & Aranan Ortak Tipi (partnerType)
  const availableStages = useMemo(() => {
    if (!isPartnership) return [];
    const filteredItems = filters.sector
      ? items.filter((item) => item.sector?.toLowerCase() === filters.sector?.toLowerCase())
      : items;

    return getOptionsByCount(filteredItems, (item) => item.stage);
  }, [items, filters.sector, isPartnership]);

  const availablePartnerTypes = useMemo(() => {
    if (!isPartnership) return [];
    const filteredItems = items.filter((item) => {
      if (filters.sector && item.sector?.toLowerCase() !== filters.sector.toLowerCase()) return false;
      if (filters.stage && item.stage?.toLowerCase() !== filters.stage.toLowerCase()) return false;
      return true;
    });

    return getOptionsByCount(filteredItems, (item) => item.partnerType);
  }, [items, filters.sector, filters.stage, isPartnership]);

  // İşletme Devri: İşletme Türü (businessType)
  const availableBusinessTypes = useMemo(() => {
    if (!isBusinessTransfer) return [];
    const filteredItems = filters.sector
      ? items.filter((item) => item.sector?.toLowerCase() === filters.sector?.toLowerCase())
      : items;

    return getOptionsByCount(filteredItems, (item) => item.businessType);
  }, [items, filters.sector, isBusinessTransfer]);

  // Franchise: Konsept Türü (conceptType)
  const availableConceptTypes = useMemo(() => {
    if (!isFranchise) return [];
    const filteredItems = filters.sector
      ? items.filter((item) => item.sector?.toLowerCase() === filters.sector?.toLowerCase())
      : items;

    return getOptionsByCount(filteredItems, (item) => item.conceptType);
  }, [items, filters.sector, isFranchise]);

  // Şehirler (Tüm kategoriler için seçili filtrelere göre dinamik)
  const availableCities = useMemo(() => {
    const filteredItems = items.filter((item) => {
      if (filters.sector && item.sector?.toLowerCase() !== filters.sector.toLowerCase()) return false;
      if (filters.position && (item.position || item.title)?.toLowerCase() !== filters.position.toLowerCase()) return false;
      if (filters.careerLevel && item.experienceLevel?.toLowerCase() !== filters.careerLevel.toLowerCase()) return false;
      if (filters.stage && item.stage?.toLowerCase() !== filters.stage.toLowerCase()) return false;
      if (filters.partnerType && item.partnerType?.toLowerCase() !== filters.partnerType.toLowerCase()) return false;
      if (filters.businessType && item.businessType?.toLowerCase() !== filters.businessType.toLowerCase()) return false;
      if (filters.conceptType && item.conceptType?.toLowerCase() !== filters.conceptType.toLowerCase()) return false;
      return true;
    });

    const list = getOptionsByCount(filteredItems, (item) => item.city || item.location?.split(',')[0]?.trim());
    if (list.length > 0) return list;
    return MARKETPLACE_CITY_OPTIONS.filter((c) => c !== 'Diğer').map((city) => ({ value: city, count: 0 }));
  }, [
    items,
    filters.sector,
    filters.position,
    filters.careerLevel,
    filters.stage,
    filters.partnerType,
    filters.businessType,
    filters.conceptType,
  ]);

  const hasActiveFilters = Boolean(
    filters.categorySlug ||
      filters.sector ||
      filters.position ||
      filters.careerLevel ||
      filters.stage ||
      filters.partnerType ||
      filters.businessType ||
      filters.conceptType ||
      filters.city ||
      filters.jobFlow,
  );

  const handleCategoryChange = (val: string) => {
    const newCategorySlug = val === ALL_VALUE ? undefined : val;
    onChange({
      categorySlug: newCategorySlug,
      sector: undefined,
      position: undefined,
      careerLevel: undefined,
      jobFlow: undefined,
      stage: undefined,
      partnerType: undefined,
      businessType: undefined,
      conceptType: undefined,
      solutionType: undefined,
      targetAudience: undefined,
      city: undefined,
    });
  };

  const handleResetAll = () => {
    onChange({
      categorySlug: hideCategory ? filters.categorySlug : undefined,
      sector: undefined,
      position: undefined,
      careerLevel: undefined,
      jobFlow: undefined,
      stage: undefined,
      partnerType: undefined,
      businessType: undefined,
      conceptType: undefined,
      solutionType: undefined,
      targetAudience: undefined,
      city: undefined,
      query: undefined,
      sortBy: 'newest',
    });
  };

  return (
    <div className={cn('w-full flex flex-wrap items-center gap-2.5 sm:gap-3', className)}>
      {/* 0. ARAMA KUTUSU (Alttaki çerçeve ile en boyutunu eşitler) */}
      {searchSlot && (
        <div className="flex-1 min-w-[220px] lg:flex-[1.3]">
          {searchSlot}
        </div>
      )}
      
      {/* 1. KATEGORİ SEÇİCİ DROPDOWN (Her zaman en başta ve görünür) */}
      {!hideCategory && (
        <div className="flex-1 min-w-[170px] lg:min-w-[190px]">
          <Select
            value={filters.categorySlug ?? ALL_VALUE}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-card px-3.5 text-sm font-medium shadow-xs">
              <SelectValue placeholder="Tüm Kategoriler" />
            </SelectTrigger>
            <SelectContent themeColor={themeColor}>
              <SelectItem value={ALL_VALUE}>Tüm Kategoriler</SelectItem>
              {getUserDiscoverableCategorySlugs().map((slug) => {
                const meta = resolveCategorySlug(slug);
                const label = CATEGORY_CUSTOM_LABELS[slug] || meta?.label || slug;
                return (
                  <SelectItem key={slug} value={slug}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {showJobFlowFilters ? (
        <JobFlowFilters
          value={filters.jobFlow}
          onChange={(jobFlow) => onChange({ jobFlow })}
        />
      ) : null}

      {/* 2. KARİYER ALAN FİLTRELERİ */}
      {isCareer ? (
        <>
          {/* Sektör */}
          <div className="flex-1 min-w-[150px] lg:min-w-[170px]">
            <Select
              value={filters.sector ?? ALL_VALUE}
              onValueChange={(val) => {
                const newSector = val === ALL_VALUE ? undefined : val;
                const filteredForNewSector = newSector
                  ? items.filter((item) => item.sector?.toLowerCase() === newSector.toLowerCase())
                  : items;
                const validPositions = getOptionsByCount(
                  filteredForNewSector,
                  (item) => item.position || (isSeek ? item.title : undefined),
                );
                const isPosValid =
                  filters.position && validPositions.some((p) => p.value === filters.position);

                onChange({
                  sector: newSector,
                  position: isPosValid ? filters.position : undefined,
                  careerLevel: undefined,
                  city: undefined,
                });
              }}
            >
              <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Sektör seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Sektör seçin</SelectItem>
                {availableSectors.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value}>
                    {sec.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pozisyon */}
          <div className="flex-1 min-w-[150px] lg:min-w-[170px]">
            <Select
              value={filters.position ?? ALL_VALUE}
              onValueChange={(val) =>
                onChange({
                  position: val === ALL_VALUE ? undefined : val,
                  careerLevel: undefined,
                  city: undefined,
                })
              }
            >
              <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Pozisyon seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Pozisyon seçin</SelectItem>
                {availablePositions.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deneyim Seviyesi / Çalışma Şekli */}
          <div className="flex-1 min-w-[140px] lg:min-w-[160px]">
            <Select
              value={filters.careerLevel ?? ALL_VALUE}
              onValueChange={(val) =>
                onChange({
                  careerLevel: val === ALL_VALUE ? undefined : val,
                  city: undefined,
                })
              }
            >
              <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder={isSeek ? 'Deneyim seviyesi' : 'Çalışma şekli'} />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>
                  {isSeek ? 'Deneyim seviyesi seçin' : 'Çalışma şekli seçin'}
                </SelectItem>
                {availableLevels.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      {/* 3. ORTAKLIK ALAN FİLTRELERİ */}
      {isPartnership ? (
        <>
          {/* Sektör */}
          <div className="flex-1 min-w-[150px] lg:min-w-[170px]">
            <Select
              value={filters.sector ?? ALL_VALUE}
              onValueChange={(val) => {
                const newSector = val === ALL_VALUE ? undefined : val;
                onChange({
                  sector: newSector,
                  stage: undefined,
                  partnerType: undefined,
                  city: undefined,
                });
              }}
            >
              <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Sektör seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Sektör seçin</SelectItem>
                {availableSectors.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value}>
                    {sec.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ortaklık Aşaması */}
          {availableStages.length > 0 ? (
            <div className="flex-1 min-w-[140px] lg:min-w-[160px]">
              <Select
                value={filters.stage ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    stage: val === ALL_VALUE ? undefined : val,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Aşama seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Aşama seçin</SelectItem>
                  {availableStages.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      {st.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Aranan Ortak Tipi */}
          {availablePartnerTypes.length > 0 ? (
            <div className="flex-1 min-w-[140px] lg:min-w-[160px]">
              <Select
                value={filters.partnerType ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    partnerType: val === ALL_VALUE ? undefined : val,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Ortak tipi seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Ortak tipi seçin</SelectItem>
                  {availablePartnerTypes.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </>
      ) : null}

      {/* 4. İŞLETME DEVRİ FİLTRELERİ */}
      {isBusinessTransfer ? (
        <>
          {/* Sektör */}
          <div className="flex-1 min-w-[150px] lg:min-w-[170px]">
            <Select
              value={filters.sector ?? ALL_VALUE}
              onValueChange={(val) => {
                const newSector = val === ALL_VALUE ? undefined : val;
                onChange({
                  sector: newSector,
                  businessType: undefined,
                  city: undefined,
                });
              }}
            >
              <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Sektör seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Sektör seçin</SelectItem>
                {availableSectors.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value}>
                    {sec.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* İşletme Türü */}
          {availableBusinessTypes.length > 0 ? (
            <div className="flex-1 min-w-[140px] lg:min-w-[160px]">
              <Select
                value={filters.businessType ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    businessType: val === ALL_VALUE ? undefined : val,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="İşletme türü seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>İşletme türü seçin</SelectItem>
                  {availableBusinessTypes.map((bt) => (
                    <SelectItem key={bt.value} value={bt.value}>
                      {bt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </>
      ) : null}

      {/* 5. FRANCHISE FİLTRELERİ */}
      {isFranchise ? (
        <>
          {/* Sektör */}
          <div className="flex-1 min-w-[150px] lg:min-w-[170px]">
            <Select
              value={filters.sector ?? ALL_VALUE}
              onValueChange={(val) => {
                const newSector = val === ALL_VALUE ? undefined : val;
                onChange({
                  sector: newSector,
                  conceptType: undefined,
                  city: undefined,
                });
              }}
            >
              <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder="Sektör seçin" />
              </SelectTrigger>
              <SelectContent themeColor={themeColor}>
                <SelectItem value={ALL_VALUE}>Sektör seçin</SelectItem>
                {availableSectors.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value}>
                    {sec.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Konsept Türü */}
          {availableConceptTypes.length > 0 ? (
            <div className="flex-1 min-w-[140px] lg:min-w-[160px]">
              <Select
                value={filters.conceptType ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    conceptType: val === ALL_VALUE ? undefined : val,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Konsept türü seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Konsept türü seçin</SelectItem>
                  {availableConceptTypes.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </>
      ) : null}

      {/* 6. USTA VE HİZMETLER FİLTRELERİ */}
      {isServices ? (
        <div className="flex-1 min-w-[160px] lg:min-w-[190px]">
          <Select
            value={filters.sector ?? ALL_VALUE}
            onValueChange={(val) => {
              const newSector = val === ALL_VALUE ? undefined : val;
              onChange({
                sector: newSector,
                city: undefined,
              });
            }}
          >
            <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
              <SelectValue placeholder="Tüm Hizmet Alanları" />
            </SelectTrigger>
            <SelectContent themeColor={themeColor}>
              <SelectItem value={ALL_VALUE}>Tüm Hizmet Alanları</SelectItem>
              {availableSectors.length > 0
                ? availableSectors.map((sec) => (
                    <SelectItem key={sec.value} value={sec.value}>
                      {sec.value}
                    </SelectItem>
                  ))
                : HIZMET_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* 7. GENEL SEKTÖR FİLTRESİ (Hiçbir kategori seçili değilse) */}
      {!isCareer && !isPartnership && !isBusinessTransfer && !isFranchise && !isServices && availableSectors.length > 0 ? (
        <div className="flex-1 min-w-[150px] lg:min-w-[170px]">
          <Select
            value={filters.sector ?? ALL_VALUE}
            onValueChange={(val) => {
              const newSector = val === ALL_VALUE ? undefined : val;
              onChange({
                sector: newSector,
                city: undefined,
              });
            }}
          >
            <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
              <SelectValue placeholder="Sektör seçin" />
            </SelectTrigger>
            <SelectContent themeColor={themeColor}>
              <SelectItem value={ALL_VALUE}>Tüm Sektörler</SelectItem>
              {availableSectors.map((sec) => (
                <SelectItem key={sec.value} value={sec.value}>
                  {sec.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* 8. ŞEHİR FİLTRESİ */}
      {availableCities.length > 0 ? (
        <div className="flex-1 min-w-[140px] lg:min-w-[160px]">
          <Select
            value={filters.city ?? ALL_VALUE}
            onValueChange={(val) => onChange({ city: val === ALL_VALUE ? undefined : val })}
          >
            <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
              <SelectValue placeholder="Şehir seçin" />
            </SelectTrigger>
            <SelectContent themeColor={themeColor}>
              <SelectItem value={ALL_VALUE}>Tüm Şehirler</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* 9. SIRALAMA FİLTRESİ */}
      <div className="flex-1 min-w-[130px] lg:min-w-[150px]">
        <Select
          value={filters.sortBy ?? 'newest'}
          onValueChange={(val) => onChange({ sortBy: val as MarketplaceFilterState['sortBy'] })}
        >
          <SelectTrigger className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
            <SelectValue placeholder="Sıralama seçin" />
          </SelectTrigger>
          <SelectContent themeColor={themeColor}>
            {LISTING_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 10. FİLTRELERİ TEMİZLE BUTONU */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResetAll}
          className="h-11 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          title="Tüm filtreleri sıfırla"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Filtreleri Temizle</span>
        </Button>
      )}

    </div>
  );
}
