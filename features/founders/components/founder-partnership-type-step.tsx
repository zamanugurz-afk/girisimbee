'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PARTNERSHIP_TYPE_CATEGORIES,
  CANONICAL_PARTNER_EXPERTISE_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { SmartCustomSelector } from '@/features/shared/components/smart-custom-selector';
import { normalizeTurkishSearch } from '@/features/shared/services/set-matching.service';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  Cpu,
  Landmark,
  Building2,
  ChevronDown,
  Search,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

export interface FounderPartnershipTypeStepProps {
  partnershipTypes: string[];
  partnershipTypesOther?: string;
  expertise: string[];
  expertiseOther?: string;
  onChange: (patch: {
    partnershipTypes: string[];
    partnershipTypesOther?: string;
    partnershipType?: string;
    expertise: string[];
    expertiseOther?: string;
  }) => void;
  disabled?: boolean;
  errors?: {
    partnershipTypes?: string;
    expertise?: string;
  };
  themeColor?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  management: <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
  technical: <Cpu className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
  investment: <Landmark className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
  physical: <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
};

interface CategoryComboboxProps {
  category: (typeof PARTNERSHIP_TYPE_CATEGORIES)[number];
  selectedSet: Set<string>;
  onToggle: (item: string) => void;
  onRemove: (item: string) => void;
  disabled?: boolean;
}

function CategoryMultiSelectCombobox({
  category,
  selectedSet,
  onToggle,
  onRemove,
  disabled = false,
}: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on Turkish normalized search
  const normalizedQuery = normalizeTurkishSearch(searchQuery);

  const filteredPopularOptions = useMemo(() => {
    if (!normalizedQuery) return category.popularOptions;
    return category.popularOptions.filter((opt) =>
      normalizeTurkishSearch(opt).includes(normalizedQuery)
    );
  }, [category.popularOptions, normalizedQuery]);

  const filteredAllOptions = useMemo(() => {
    const popularSet = new Set(category.popularOptions);
    const nonPopular = category.options.filter((opt) => !popularSet.has(opt as any));
    if (!normalizedQuery) return nonPopular;
    return nonPopular.filter((opt) =>
      normalizeTurkishSearch(opt).includes(normalizedQuery)
    );
  }, [category.options, category.popularOptions, normalizedQuery]);

  const selectedInCategory = useMemo(() => {
    return category.options.filter((opt) => selectedSet.has(opt));
  }, [category.options, selectedSet]);

  const hasSelections = selectedInCategory.length > 0;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'relative flex flex-col justify-between rounded-2xl border bg-white p-4 sm:p-5 shadow-xs dark:bg-card transition-all duration-200',
        hasSelections
          ? 'border-amber-500/50 bg-amber-500/[0.015] ring-1 ring-amber-500/20 dark:border-amber-500/40 dark:bg-amber-500/[0.03]'
          : 'border-slate-200/90 hover:border-slate-300 dark:border-border dark:hover:border-slate-700'
      )}
    >
      {/* Category Header */}
      <div className="space-y-1.5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shrink-0">
              {CATEGORY_ICONS[category.id] ?? <Briefcase className="h-4 w-4" />}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground leading-tight">
              {category.title}
            </h4>
          </div>
          {hasSelections && (
            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2 py-0.5 shrink-0">
              {selectedInCategory.length} seçili
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Combobox Trigger */}
      <div className="relative mt-auto pt-1">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background/60 px-3.5 text-xs sm:text-sm transition-all text-left select-none',
            isOpen
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-background'
              : 'hover:bg-accent/40 hover:border-slate-300 dark:hover:border-slate-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="flex items-center gap-2 text-muted-foreground truncate">
            <Search className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
            <span className="truncate">
              {hasSelections
                ? `${selectedInCategory.length} tür seçildi — Listeyi aç`
                : 'Ortaklık türü ara veya seçin...'}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground/70 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180 text-amber-600'
            )}
          />
        </button>

        {/* Combobox Dropdown Panel */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-72 w-full min-w-[280px] overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95">
            {/* Search Input */}
            <div className="p-2 border-b border-border/60 bg-muted/30 sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  autoFocus
                  type="text"
                  placeholder="Hızlı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-7 text-xs rounded-lg border-border/70 bg-background"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30">
              {/* Popular Options Group */}
              {filteredPopularOptions.length > 0 && (
                <div className="space-y-0.5 pt-0.5 pb-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>En Popüler Seçenekler</span>
                  </div>
                  {filteredPopularOptions.map((option) => {
                    const isChecked = selectedSet.has(option);
                    return (
                      <div
                        key={option}
                        onClick={() => onToggle(option)}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none',
                          isChecked
                            ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'hover:bg-accent hover:text-accent-foreground text-slate-700 dark:text-slate-300'
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => onToggle(option)}
                          className="h-3.5 w-3.5 rounded data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 pointer-events-none"
                        />
                        <span className="flex-1 leading-snug">{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* All / A-Z Options Group */}
              {filteredAllOptions.length > 0 && (
                <div className="space-y-0.5 pt-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tüm Seçenekler (A-Z)
                  </div>
                  {filteredAllOptions.map((option) => {
                    const isChecked = selectedSet.has(option);
                    return (
                      <div
                        key={option}
                        onClick={() => onToggle(option)}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none',
                          isChecked
                            ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'hover:bg-accent hover:text-accent-foreground text-slate-700 dark:text-slate-300'
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => onToggle(option)}
                          className="h-3.5 w-3.5 rounded data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 pointer-events-none"
                        />
                        <span className="flex-1 leading-snug">{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredPopularOptions.length === 0 && filteredAllOptions.length === 0 && (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  &ldquo;{searchQuery}&rdquo; ile eşleşen tür bulunamadı.
                </div>
              )}
            </div>

            {/* Dropdown Action Footer */}
            <div className="p-1.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground pl-1.5">
                {selectedInCategory.length} seçildi
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 text-xs px-2.5 text-amber-700 hover:text-amber-800 hover:bg-amber-500/10 font-semibold"
              >
                Tamam
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Chips */}
      {selectedInCategory.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-3">
          {selectedInCategory.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-2xs transition-all animate-in fade-in-0"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded-full hover:bg-rose-500/10 transition-colors"
                  aria-label={`${item} kaldır`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function FounderPartnershipTypeStep({
  partnershipTypes = [],
  partnershipTypesOther = '',
  expertise = [],
  expertiseOther = '',
  onChange,
  disabled = false,
  errors,
  themeColor = 'amber',
}: FounderPartnershipTypeStepProps) {
  const [showCustomPartnershipType, setShowCustomPartnershipType] = useState<boolean>(
    Boolean(partnershipTypesOther && partnershipTypesOther.trim().length > 0)
  );

  const [showCustomExpertise, setShowCustomExpertise] = useState<boolean>(
    Boolean(expertiseOther && expertiseOther.trim().length > 0)
  );

  const selectedPartnershipSet = useMemo(() => new Set(partnershipTypes), [partnershipTypes]);
  const selectedExpertiseSet = useMemo(() => new Set(expertise), [expertise]);

  // Parse manual chip list
  const customPartnershipChips = useMemo(() => {
    if (!partnershipTypesOther) return [];
    return partnershipTypesOther
      .split(' · ')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [partnershipTypesOther]);

  const customExpertiseChips = useMemo(() => {
    if (!expertiseOther) return [];
    return expertiseOther
      .split(' · ')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [expertiseOther]);

  const totalPartnershipSelectedCount =
    partnershipTypes.length + (customPartnershipChips.length > 0 ? customPartnershipChips.length : 0);

  const totalExpertiseSelectedCount =
    expertise.length + (customExpertiseChips.length > 0 ? customExpertiseChips.length : 0);

  function togglePartnershipType(type: string) {
    if (disabled) return;
    const next = new Set(partnershipTypes);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    const nextArr = Array.from(next);
    onChange({
      partnershipTypes: nextArr,
      partnershipType: nextArr.join(', '),
      partnershipTypesOther,
      expertise,
      expertiseOther,
    });
  }

  function removePartnershipType(type: string) {
    if (disabled) return;
    const next = partnershipTypes.filter((t) => t !== type);
    onChange({
      partnershipTypes: next,
      partnershipType: next.join(', '),
      partnershipTypesOther,
      expertise,
      expertiseOther,
    });
  }

  function handleCustomPartnershipChange(val: string[] | string) {
    const serialized = Array.isArray(val) ? val.join(' · ') : String(val ?? '');
    onChange({
      partnershipTypes,
      partnershipType: partnershipTypes.join(', '),
      partnershipTypesOther: serialized,
      expertise,
      expertiseOther,
    });
  }

  function toggleExpertise(item: string) {
    if (disabled) return;
    const next = new Set(expertise);
    if (next.has(item)) {
      next.delete(item);
    } else {
      next.add(item);
    }
    const nextArr = Array.from(next);
    onChange({
      partnershipTypes,
      partnershipType: partnershipTypes.join(', '),
      partnershipTypesOther,
      expertise: nextArr,
      expertiseOther,
    });
  }

  function handleCustomExpertiseChange(val: string[] | string) {
    const serialized = Array.isArray(val) ? val.join(' · ') : String(val ?? '');
    onChange({
      partnershipTypes,
      partnershipType: partnershipTypes.join(', '),
      partnershipTypesOther,
      expertise,
      expertiseOther: serialized,
    });
  }

  return (
    <div className="space-y-8">
      {/* 1. BÖLÜM: ORTAKLIK TÜRLERİ (2x2 COMBOBOX GRID) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-2.5 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground">
                Ortaklık türleri
              </h3>
              <span className="text-rose-500 font-bold">*</span>
              {totalPartnershipSelectedCount > 0 && (
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5">
                  {totalPartnershipSelectedCount} seçili
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Nasıl bir ortak aradığınızı kategorilerden seçin (birden fazla tür seçebilirsiniz).
            </p>
          </div>
        </div>

        {/* 2x2 Grid Yerleşimi: Üstte 2, Altta 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {PARTNERSHIP_TYPE_CATEGORIES.map((category) => (
            <CategoryMultiSelectCombobox
              key={category.id}
              category={category}
              selectedSet={selectedPartnershipSet}
              onToggle={togglePartnershipType}
              onRemove={removePartnershipType}
              disabled={disabled}
            />
          ))}
        </div>

        {/* Diğer / Kendim Gireceğim - Ortaklık Tipi */}
        <div className="pt-2">
          <label
            htmlFor="partnership-other-checkbox"
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 sm:p-3.5 transition-all duration-150 cursor-pointer select-none text-left',
              showCustomPartnershipType || customPartnershipChips.length > 0
                ? 'border-amber-500/80 bg-amber-500/[0.04] ring-1 ring-amber-500/30 dark:border-amber-500/60 dark:bg-amber-500/[0.08]'
                : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-border dark:bg-card'
            )}
          >
            <Checkbox
              id="partnership-other-checkbox"
              checked={showCustomPartnershipType || customPartnershipChips.length > 0}
              onCheckedChange={(checked) => {
                setShowCustomPartnershipType(checked === true);
                if (checked !== true) {
                  handleCustomPartnershipChange([]);
                }
              }}
              disabled={disabled}
              className="shrink-0 rounded-md data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-foreground">
                Diğer / Kendim Gireceğim
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                (Aradığınız ortaklık türü kategorilerde yoksa yazarak ekleyin)
              </span>
            </div>
          </label>

          {(showCustomPartnershipType || customPartnershipChips.length > 0) && (
            <div className="mt-3 pl-2 sm:pl-4 border-l-2 border-amber-500/40">
              <SmartCustomSelector
                id="custom-partnership-type-selector"
                label="Özel Ortaklık Türü Belirtin"
                domain="partnership-types"
                themeColor="amber"
                mode="multi"
                value={customPartnershipChips}
                onChange={handleCustomPartnershipChange}
                placeholder="Örn: E-Ticaret Ortağı, Yatırımcı, Fabrika..."
                searchPlaceholder="Seçenek ara veya kendin yaz..."
                helperText="Listeden eşleşen seçenekleri tıklayarak ekleyebilir veya kendi ifadenizi yazıp Enter'a basabilirsiniz."
                disabled={disabled}
              />
            </div>
          )}
        </div>

        {errors?.partnershipTypes && (
          <p className="text-xs font-semibold text-rose-500 pt-1">
            {errors.partnershipTypes}
          </p>
        )}
      </div>

      {/* 2. BÖLÜM: ARANAN UZMANLIKLAR */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-2.5 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground">
                Aranan uzmanlıklar
              </h3>
              {totalExpertiseSelectedCount > 0 && (
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5">
                  {totalExpertiseSelectedCount} seçili
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Ortakta aradığınız temel yetkinlik ve uzmanlık alanlarını belirleyin (isteğe bağlı).
            </p>
          </div>
        </div>

        {/* 18 Uzmanlık Seçenekleri Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CANONICAL_PARTNER_EXPERTISE_OPTIONS.map((exp) => {
            const isChecked = selectedExpertiseSet.has(exp);
            const expId = `expertise-${exp.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <label
                key={exp}
                htmlFor={expId}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 sm:p-3.5 transition-all duration-150 cursor-pointer select-none text-left min-h-[48px]',
                  isChecked
                    ? 'border-amber-500/80 bg-amber-500/[0.04] ring-1 ring-amber-500/30 dark:border-amber-500/60 dark:bg-amber-500/[0.08] shadow-2xs'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-border dark:bg-card dark:hover:border-slate-700'
                )}
              >
                <Checkbox
                  id={expId}
                  checked={isChecked}
                  onCheckedChange={() => toggleExpertise(exp)}
                  disabled={disabled}
                  className="shrink-0 rounded-md data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-foreground leading-snug">
                  {exp}
                </span>
              </label>
            );
          })}
        </div>

        {/* Diğer / Kendim Gireceğim - Aranan Uzmanlıklar */}
        <div className="pt-1">
          <label
            htmlFor="expertise-other-checkbox"
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 sm:p-3.5 transition-all duration-150 cursor-pointer select-none text-left',
              showCustomExpertise || customExpertiseChips.length > 0
                ? 'border-amber-500/80 bg-amber-500/[0.04] ring-1 ring-amber-500/30 dark:border-amber-500/60 dark:bg-amber-500/[0.08]'
                : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-border dark:bg-card'
            )}
          >
            <Checkbox
              id="expertise-other-checkbox"
              checked={showCustomExpertise || customExpertiseChips.length > 0}
              onCheckedChange={(checked) => {
                setShowCustomExpertise(checked === true);
                if (checked !== true) {
                  handleCustomExpertiseChange([]);
                }
              }}
              disabled={disabled}
              className="shrink-0 rounded-md data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-foreground">
                Diğer / Kendim Gireceğim
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                (Özel uzmanlık veya teknik gereksinim belirtin)
              </span>
            </div>
          </label>

          {(showCustomExpertise || customExpertiseChips.length > 0) && (
            <div className="mt-3 pl-2 sm:pl-4 border-l-2 border-amber-500/40">
              <SmartCustomSelector
                id="custom-expertise-selector"
                label="Özel Uzmanlık / Yetkinlik Belirtin"
                domain="partner-expertise"
                themeColor="amber"
                mode="multi"
                value={customExpertiseChips}
                onChange={handleCustomExpertiseChange}
                placeholder="Örn: LLM Mimarisi, Solidity, Biyoteknoloji..."
                searchPlaceholder="Uzmanlık ara veya kendin yaz..."
                helperText="Listeden aradığınız uzmanlığı seçebilir veya yeni bir uzmanlık alanı yazıp ekleyebilirsiniz."
                disabled={disabled}
              />
            </div>
          )}
        </div>

        {errors?.expertise && (
          <p className="text-xs font-semibold text-rose-500 pt-1">{errors.expertise}</p>
        )}
      </div>
    </div>
  );
}
