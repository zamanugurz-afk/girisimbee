'use client';

import React, { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  PARTNERSHIP_TYPE_CATEGORIES,
  CANONICAL_PARTNER_EXPERTISE_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { SmartCustomSelector } from '@/features/shared/components/smart-custom-selector';
import { cn } from '@/lib/utils';
import { Briefcase, Cpu, Landmark, Building2 } from 'lucide-react';

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
      {/* 1. BÖLÜM: ORTAKLIK TÜRLERİ */}
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
              Nasıl bir ortak aradığınızı seçin.
            </p>
          </div>
        </div>

        {/* 4 Kategori Listesi */}
        <div className="space-y-6">
          {PARTNERSHIP_TYPE_CATEGORIES.map((category) => (
            <div key={category.id} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {CATEGORY_ICONS[category.id] ?? <Briefcase className="h-3.5 w-3.5 text-amber-600" />}
                <span>{category.title}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {category.options.map((option) => {
                  const isChecked = selectedPartnershipSet.has(option);
                  const optionId = `partnership-type-${category.id}-${option.replace(/\s+/g, '-').toLowerCase()}`;
                  return (
                    <label
                      key={option}
                      htmlFor={optionId}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 sm:p-3.5 transition-all duration-150 cursor-pointer select-none text-left min-h-[48px]',
                        isChecked
                          ? 'border-amber-500/80 bg-amber-500/[0.04] ring-1 ring-amber-500/30 dark:border-amber-500/60 dark:bg-amber-500/[0.08] shadow-2xs'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-border dark:bg-card dark:hover:border-slate-700'
                      )}
                    >
                      <Checkbox
                        id={optionId}
                        checked={isChecked}
                        onCheckedChange={() => togglePartnershipType(option)}
                        disabled={disabled}
                        className="shrink-0 rounded-md data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-foreground leading-snug">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Diğer / Kendim Gireceğim - Ortaklık Tipi */}
          <div className="pt-1">
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
                  (Aradığınız ortaklık türü yukarıda yoksa yazarak ekleyin)
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
                  placeholder="Örn: Fabrika Ortağı, E-ticaret Ortağı, Yatırımcı..."
                  searchPlaceholder="Seçenek ara veya kendin yaz..."
                  helperText="Listeden eşleşen seçenekleri tıklayarak ekleyebilir veya kendi ifadenizi yazıp Enter'a basabilirsiniz."
                  disabled={disabled}
                />
              </div>
            )}
          </div>
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
