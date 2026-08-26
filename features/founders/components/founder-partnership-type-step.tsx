'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  PARTNERSHIP_TYPE_CATEGORIES,
  CANONICAL_PARTNER_EXPERTISE_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { SmartCustomSelector } from '@/features/shared/components/smart-custom-selector';
import { normalizeTurkishSearch } from '@/features/shared/services/set-matching.service';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, X, Check } from 'lucide-react';

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

interface StandardMultiSelectFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  popularOptions?: readonly string[];
  options: readonly string[];
  selectedSet: Set<string>;
  onToggle: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function StandardMultiSelectField({
  label,
  description,
  required = false,
  popularOptions,
  options,
  selectedSet,
  onToggle,
  onRemove,
  placeholder = 'Ortaklık türü seçin',
  disabled = false,
}: StandardMultiSelectFieldProps) {
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

  const normalizedQuery = normalizeTurkishSearch(searchQuery);

  const filteredPopularOptions = useMemo(() => {
    if (!popularOptions) return [];
    if (!normalizedQuery) return popularOptions;
    return popularOptions.filter((opt) =>
      normalizeTurkishSearch(opt).includes(normalizedQuery)
    );
  }, [popularOptions, normalizedQuery]);

  const filteredAllOptions = useMemo(() => {
    if (popularOptions && popularOptions.length > 0) {
      const popularSet = new Set(popularOptions);
      const nonPopular = options.filter((opt) => !popularSet.has(opt));
      if (!normalizedQuery) return nonPopular;
      return nonPopular.filter((opt) =>
        normalizeTurkishSearch(opt).includes(normalizedQuery)
      );
    }
    if (!normalizedQuery) return options;
    return options.filter((opt) =>
      normalizeTurkishSearch(opt).includes(normalizedQuery)
    );
  }, [options, popularOptions, normalizedQuery]);

  const selectedInField = useMemo(() => {
    return options.filter((opt) => selectedSet.has(opt));
  }, [options, selectedSet]);

  const hasSelections = selectedInField.length > 0;

  return (
    <div ref={dropdownRef} className="space-y-1.5">
      {/* Standard Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-semibold text-foreground">
            {label}
            {required && <span className="text-rose-500 font-bold ml-1">*</span>}
          </Label>
          {hasSelections && (
            <Badge className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[11px] font-semibold px-2 py-0.2">
              {selectedInField.length} seçili
            </Badge>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground leading-normal line-clamp-1">
          {description}
        </p>
      )}

      {/* Standard Select Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex h-11 min-h-[42px] w-full items-center justify-between rounded-xl border border-input bg-card px-3.5 py-2 text-sm font-medium ring-offset-background transition-all text-left select-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500',
            isOpen && 'border-amber-500 ring-2 ring-amber-500/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className={cn('truncate', !hasSelections && 'text-muted-foreground font-normal')}>
            {hasSelections
              ? `${selectedInField.length} seçenek seçildi`
              : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-50 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180 opacity-100 text-amber-600'
            )}
          />
        </button>

        {/* Standard Select Dropdown Content */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 w-full min-w-[260px] overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg backdrop-blur-md dark:border-border dark:bg-card animate-in fade-in-0 zoom-in-95">
            {/* Quick Search Header */}
            <div className="p-2 border-b border-border/60 bg-muted/20 sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Seçenek ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full pl-8 pr-7 text-xs rounded-lg border border-input bg-background px-3 py-1 outline-none focus:ring-1 focus:ring-amber-500"
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

            {/* Select Options List */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
              {/* Popular Options Section */}
              {filteredPopularOptions.length > 0 && (
                <div className="space-y-0.5 pb-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    En Popüler Seçenekler
                  </div>
                  {filteredPopularOptions.map((option) => {
                    const isChecked = selectedSet.has(option);
                    return (
                      <div
                        key={option}
                        onClick={() => onToggle(option)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors select-none',
                          isChecked
                            ? 'bg-amber-500/10 text-amber-950 dark:text-amber-200 font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        <span className="leading-snug">{option}</span>
                        {isChecked && (
                          <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* All / A-Z Options Section */}
              {filteredAllOptions.length > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-border/40">
                  {popularOptions && popularOptions.length > 0 && (
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tüm Seçenekler (A-Z)
                    </div>
                  )}
                  {filteredAllOptions.map((option) => {
                    const isChecked = selectedSet.has(option);
                    return (
                      <div
                        key={option}
                        onClick={() => onToggle(option)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors select-none',
                          isChecked
                            ? 'bg-amber-500/10 text-amber-950 dark:text-amber-200 font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        <span className="leading-snug">{option}</span>
                        {isChecked && (
                          <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredPopularOptions.length === 0 && filteredAllOptions.length === 0 && (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  &ldquo;{searchQuery}&rdquo; bulunamadı.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Chips */}
      {hasSelections && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedInField.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-2xs transition-all"
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

  function removeExpertise(item: string) {
    if (disabled) return;
    const next = expertise.filter((e) => e !== item);
    onChange({
      partnershipTypes,
      partnershipType: partnershipTypes.join(', '),
      partnershipTypesOther,
      expertise: next,
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
    <div className="space-y-6">
      {/* 1. BÖLÜM: ORTAKLIK TÜRLERİ (Standart 2-Kolon Form Grid Yapısı) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Ortaklık Türleri
              </h3>
              <span className="text-rose-500 font-bold">*</span>
              {totalPartnershipSelectedCount > 0 && (
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2 py-0.5">
                  {totalPartnershipSelectedCount} seçili
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nasıl bir ortak aradığınızı ilgili alanlardan seçin (birden fazla tür seçebilirsiniz).
            </p>
          </div>
        </div>

        {/* Standart 2-Kolonlu Form Alanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {PARTNERSHIP_TYPE_CATEGORIES.map((category) => (
            <StandardMultiSelectField
              key={category.id}
              label={category.title}
              description={category.description}
              popularOptions={category.popularOptions}
              options={category.options}
              selectedSet={selectedPartnershipSet}
              onToggle={togglePartnershipType}
              onRemove={removePartnershipType}
              placeholder="Ortaklık türü seçin"
              disabled={disabled}
            />
          ))}
        </div>

        {/* Özel Ortaklık Türü Ekleme (Smart Custom Selector) */}
        <div className="pt-1">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-border dark:bg-card/50 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-partnership-type-selector" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-foreground">
                Özel / Farklı Ortaklık Türü Ekle (İsteğe Bağlı)
              </Label>
            </div>
            <SmartCustomSelector
              id="custom-partnership-type-selector"
              domain="partnership-types"
              themeColor="amber"
              mode="multi"
              value={customPartnershipChips}
              onChange={handleCustomPartnershipChange}
              placeholder="Örn: E-Ticaret Ortağı, Fabrika Ortağı, Yatırımcı..."
              searchPlaceholder="Ortaklık türü ara veya kendin yaz..."
              helperText="Kategorilerde bulamadığınız özel ortaklık modelinizi yazıp Enter'a basarak ekleyebilirsiniz."
              disabled={disabled}
            />
          </div>
        </div>

        {errors?.partnershipTypes && (
          <p className="text-xs font-semibold text-rose-500 pt-1">
            {errors.partnershipTypes}
          </p>
        )}
      </div>

      {/* 2. BÖLÜM: ARANAN UZMANLIKLAR (Standart 2-Kolon Form Yapısı) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Aranan Uzmanlıklar
              </h3>
              {totalExpertiseSelectedCount > 0 && (
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2 py-0.5">
                  {totalExpertiseSelectedCount} seçili
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ortakta aradığınız temel yetkinlik ve uzmanlık alanlarını belirleyin (isteğe bağlı).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <StandardMultiSelectField
            label="Uzmanlık ve Yetkinlik Alanları"
            description="Teknik, operasyonel, pazarlama veya yönetsel uzmanlıklar"
            options={CANONICAL_PARTNER_EXPERTISE_OPTIONS}
            selectedSet={selectedExpertiseSet}
            onToggle={toggleExpertise}
            onRemove={removeExpertise}
            placeholder="Uzmanlık alanı seçin"
            disabled={disabled}
          />

          <div className="space-y-1.5">
            <Label htmlFor="custom-expertise-selector" className="text-sm font-semibold text-foreground">
              Özel Uzmanlık / Yetkinlik Belirtin
            </Label>
            <p className="text-xs text-muted-foreground leading-normal line-clamp-1">
              Listede olmayan özel bir uzmanlık alanı yazıp ekleyin
            </p>
            <SmartCustomSelector
              id="custom-expertise-selector"
              domain="partner-expertise"
              themeColor="amber"
              mode="multi"
              value={customExpertiseChips}
              onChange={handleCustomExpertiseChange}
              placeholder="Örn: LLM Mimarisi, Biyoteknoloji..."
              searchPlaceholder="Uzmanlık ara veya kendin yaz..."
              disabled={disabled}
            />
          </div>
        </div>

        {errors?.expertise && (
          <p className="text-xs font-semibold text-rose-500 pt-1">{errors.expertise}</p>
        )}
      </div>
    </div>
  );
}
