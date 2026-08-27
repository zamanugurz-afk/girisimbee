'use client';

import { useMemo } from 'react';
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
import { JobFlowFilters } from '@/components/girisimco/marketplace/job-flow-filters';
import { PartnershipFlowFilters } from '@/components/girisimco/marketplace/partnership-flow-filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

function getAvailablePositions(sector?: string): string[] {
  const raw = sector ? getPositionsForSector(sector) : getAllTaxonomyPositions();
  return raw
    .filter((p) => !p.includes('Diğer') && !p.includes('Kendim'))
    .sort((a, b) => a.localeCompare(b, 'tr-TR'));
}

const CAREER_SECTORS = [...JOB_SECTOR_OPTIONS]
  .filter((s) => !s.includes('Diğer'))
  .sort((a, b) => a.localeCompare(b, 'tr-TR'));

const CAREER_SEEK_LEVELS = [
  'Başlangıç Seviyesi (0-1 Yıl)',
  'Direktör / Üst Düzey Yönetici',
  'Giriş Seviyesi',
  'Junior (1-2 Yıl)',
  'Kıdemli / Senior (5+ Yıl)',
  'Mid (2-4 Yıl)',
  'Orta Düzey Yönetici',
  'Stajyer',
  'Takım Lideri',
  'Uzman (3-5 Yıl)',
  'Yeni Mezun',
  'Yönetici',
].sort((a, b) => a.localeCompare(b, 'tr-TR'));

const CAREER_HIRE_WORK_MODES = [
  'Dönemsel / Proje Bazlı',
  'Hibrit',
  'Stajyer',
  'Tam Zamanlı',
  'Uzaktan (Remote)',
  'Yarı Zamanlı',
].sort((a, b) => a.localeCompare(b, 'tr-TR'));

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

interface ListingFiltersProps {
  items?: ContentItem[];
  filters: MarketplaceFilterState;
  onChange: (patch: Partial<MarketplaceFilterState>) => void;
  /** Hide category picker when on a category page */
  hideCategory?: boolean;
  /** Show İşe Alıyorum / İş Arıyorum chips (unified /is feed). */
  showJobFlowFilters?: boolean;
  /** Show Ortak Arıyorum / Ortak Olmak İstiyorum / İşletme Devri chips. */
  showVentureFlowFilters?: boolean;
  className?: string;
}

export function ListingFilters({
  items = [],
  filters,
  onChange,
  hideCategory = false,
  showJobFlowFilters = false,
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
  const isDigital = filters.categorySlug === 'dijital-ai';

  const isSeek = filters.jobFlow === 'seek' || filters.categorySlug === 'is-ariyorum' || filters.categorySlug === 'is-bul';
  const themeColor = isCareer
    ? isSeek
      ? 'sky'
      : 'emerald'
    : isPartnership || isBusinessTransfer
      ? 'amber'
      : isFranchise
        ? 'pink'
        : isDigital
          ? 'purple'
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

  // Dijital & AI: Çözüm Türü & Hedef Kitle
  const availableSolutionTypes = useMemo(() => {
    if (!isDigital) return [];
    return getOptionsByCount(items, (item) => item.solutionType || item.sector);
  }, [items, isDigital]);

  const availableTargetAudiences = useMemo(() => {
    if (!isDigital) return [];
    const filteredItems = filters.solutionType
      ? items.filter((item) => (item.solutionType || item.sector)?.toLowerCase() === filters.solutionType?.toLowerCase())
      : items;

    return getOptionsByCount(filteredItems, (item) => item.targetAudience);
  }, [items, filters.solutionType, isDigital]);

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

    return getOptionsByCount(filteredItems, (item) => item.city || item.location?.split(',')[0]?.trim());
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

  return (
    <div className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {showJobFlowFilters ? (
        <JobFlowFilters
          value={filters.jobFlow}
          onChange={(jobFlow) => onChange({ jobFlow })}
        />
      ) : null}

      {/* 1. Kariyer Sayfası Filtreleri */}
      {isCareer ? (
        <>
          {/* Sektör */}
          <div className="w-[180px] sm:w-[210px]">
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
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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
          <div className="w-[180px] sm:w-[210px]">
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
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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

          {/* Deneyim Seviyesi */}
          <div className="w-[180px] sm:w-[210px]">
            <Select
              value={filters.careerLevel ?? ALL_VALUE}
              onValueChange={(val) =>
                onChange({
                  careerLevel: val === ALL_VALUE ? undefined : val,
                  city: undefined,
                })
              }
            >
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                <SelectValue placeholder={isSeek ? 'Deneyim seviyesi seçin' : 'Çalışma şekli seçin'} />
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

      {/* 2. Ortaklık Sayfası Filtreleri (Sektör + Ortaklık Aşaması + Aranan Ortak Tipi) */}
      {isPartnership ? (
        <>
          {/* Sektör */}
          <div className="w-[180px] sm:w-[210px]">
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
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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
            <div className="w-[180px] sm:w-[210px]">
              <Select
                value={filters.stage ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    stage: val === ALL_VALUE ? undefined : val,
                    partnerType: undefined,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Ortaklık aşaması seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Ortaklık aşaması seçin</SelectItem>
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
            <div className="w-[180px] sm:w-[210px]">
              <Select
                value={filters.partnerType ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    partnerType: val === ALL_VALUE ? undefined : val,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Aranan ortak tipi seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Aranan ortak tipi seçin</SelectItem>
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

      {/* 3. İşletme Devri Sayfası Filtreleri (Sektör + İşletme Türü) */}
      {isBusinessTransfer ? (
        <>
          {/* Sektör */}
          <div className="w-[180px] sm:w-[210px]">
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
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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
            <div className="w-[180px] sm:w-[210px]">
              <Select
                value={filters.businessType ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    businessType: val === ALL_VALUE ? undefined : val,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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

      {/* 4. Franchise ve Bayilik Sayfası Filtreleri (Sektör + Konsept Türü) */}
      {isFranchise ? (
        <>
          {/* Sektör */}
          <div className="w-[180px] sm:w-[210px]">
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
              <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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
            <div className="w-[180px] sm:w-[210px]">
              <Select
                value={filters.conceptType ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    conceptType: val === ALL_VALUE ? undefined : val,
                    city: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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

      {/* 5. Dijital ve Startup Çözümler Sayfası Filtreleri (Çözüm Türü + Hedef Kitle) */}
      {isDigital ? (
        <>
          {/* Çözüm Türü */}
          {availableSolutionTypes.length > 0 ? (
            <div className="w-[180px] sm:w-[210px]">
              <Select
                value={filters.solutionType ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    solutionType: val === ALL_VALUE ? undefined : val,
                    targetAudience: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Çözüm türü seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Çözüm türü seçin</SelectItem>
                  {availableSolutionTypes.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      {st.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Hedef Kitle */}
          {availableTargetAudiences.length > 0 ? (
            <div className="w-[180px] sm:w-[210px]">
              <Select
                value={filters.targetAudience ?? ALL_VALUE}
                onValueChange={(val) => {
                  onChange({
                    targetAudience: val === ALL_VALUE ? undefined : val,
                  });
                }}
              >
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Hedef kitle seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Hedef kitle seçin</SelectItem>
                  {availableTargetAudiences.map((ta) => (
                    <SelectItem key={ta.value} value={ta.value}>
                      {ta.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </>
      ) : null}

      {/* 6. Diğer Genel / Keşfet Sayfaları */}
      {!isCareer && !isPartnership && !isBusinessTransfer && !isFranchise && !isDigital ? (
        <>
          {!hideCategory && (
            <div className="w-[180px] sm:w-[210px]">
              <Select
                value={filters.categorySlug ?? ALL_VALUE}
                onValueChange={(val) => onChange({ categorySlug: val === ALL_VALUE ? undefined : val })}
              >
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent themeColor={themeColor}>
                  <SelectItem value={ALL_VALUE}>Kategori seçin</SelectItem>
                  {getUserDiscoverableCategorySlugs().map((slug) => {
                    const meta = resolveCategorySlug(slug);
                    return (
                      <SelectItem key={slug} value={slug}>
                        {meta?.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableSectors.length > 0 ? (
            <div className="w-[180px] sm:w-[210px]">
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
                <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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
          ) : null}
        </>
      ) : null}

      {/* Şehir (Dijital hariç, sadece ilanı olan şehirler) */}
      {!isDigital && availableCities.length > 0 ? (
        <div className="w-[150px] sm:w-[170px]">
          <Select
            value={filters.city ?? ALL_VALUE}
            onValueChange={(val) => onChange({ city: val === ALL_VALUE ? undefined : val })}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
              <SelectValue placeholder="Şehir seçin" />
            </SelectTrigger>
            <SelectContent themeColor={themeColor}>
              <SelectItem value={ALL_VALUE}>Şehir seçin</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* Sıralama */}
      <div className="w-[150px] sm:w-[170px]">
        <Select
          value={filters.sortBy ?? 'newest'}
          onValueChange={(val) => onChange({ sortBy: val as MarketplaceFilterState['sortBy'] })}
        >
          <SelectTrigger className="h-11 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-sm font-normal">
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
    </div>
  );
}
