'use client';

import React from 'react';
import {
  MapPin,
  Banknote,
  Bookmark,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListingType } from '@/features/listings/types/listing-type.types';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';

export interface ListingLiveCardPreviewProps {
  categoryId: string;
  values: {
    core: Record<string, any>;
    customFields?: Record<string, any>;
    tags?: string[];
    images?: any[];
  };
  listingType: ListingType;
  partnershipIntent?: string;
  userName?: string;
  userAvatar?: string;
  compact?: boolean;
}

export function ListingLiveCardPreview({
  categoryId,
  values,
  listingType,
  partnershipIntent,
  userName = 'İlan Sahibi',
  userAvatar,
  compact = false,
}: ListingLiveCardPreviewProps) {
  const { core, customFields = {} } = values;

  // 1. Resolve Category Tag
  const isJobSeeker = categoryId === CATEGORY_IDS.isBul;
  const isJobHire = categoryId === CATEGORY_IDS.iseAl;
  const isPartner = categoryId === CATEGORY_IDS.ortakBul;

  const categoryLabel = isJobSeeker
    ? 'İŞ ARIYORUM'
    : isJobHire
      ? 'İŞE ALIYORUM'
      : isPartner
        ? 'ORTAK ARIYORUM'
        : (listingType?.name || 'İLAN').toUpperCase();

  const categoryTagClass = isJobSeeker
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    : isJobHire
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : isPartner
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';

  // 2. Resolve Title
  const title =
    (customFields.desiredRole as string) ||
    core.title ||
    (isJobSeeker ? 'Pozisyon Belirtilmedi' : isJobHire ? 'Açık Pozisyon' : 'Girişim Başlığı');

  // 3. Resolve Display Name / Company
  const displayName =
    (customFields.profileFullName as string) ||
    (customFields.publicName as string) ||
    (customFields.companyName as string) ||
    (core.companyName as string) ||
    userName;

  // 4. Resolve Location
  const city = (core.city as string) || (customFields.city as string) || 'İstanbul';
  const district = (core.district as string) || (customFields.district as string) || 'Maltepe';
  const locationText = district ? `${city} / ${district}` : city;

  // 5. Resolve Salary / Equity / Price
  let priceText: string | null = null;
  if (customFields.salaryRange) {
    priceText = `${customFields.salaryRange} TL`;
  } else if (customFields.salaryExpectation) {
    priceText = `${customFields.salaryExpectation} TL`;
  } else if (customFields.minSalary || customFields.maxSalary) {
    const min = customFields.minSalary ? `${Number(customFields.minSalary).toLocaleString('tr-TR')}` : '';
    const max = customFields.maxSalary ? `${Number(customFields.maxSalary).toLocaleString('tr-TR')}` : '';
    priceText = min && max ? `${min} - ${max} TL` : `${min || max} TL`;
  } else if (customFields.equityOffered) {
    priceText = `%${customFields.equityOffered} Hisse`;
  } else if (core.price) {
    priceText = `${Number(core.price).toLocaleString('tr-TR')} TL`;
  } else if (isJobSeeker) {
    priceText = '25.000 - 35.000 TL';
  }

  // 6. Resolve Work Mode / Tags
  const workType = (customFields.workPreference as string) || (customFields.workType as string) || 'Tam Zamanlı';
  const workModel = (customFields.workModel as string) || (customFields.remotePolicy as string) || 'Hibrit';
  const availability = (customFields.availability as string) || (customFields.startDate as string) || 'Hemen';
  const metaLine = `${workType} · ${workModel} · ${availability}`;

  // 7. Resolve Chips
  const chips: string[] = [];
  if (customFields.careerLevel) {
    const levelStr = String(customFields.careerLevel);
    chips.push(levelStr.includes('yıl') || levelStr.includes('+') ? levelStr : `${levelStr} Seviye`);
  } else if (isJobSeeker) {
    chips.push('10+ Yıl Deneyim');
  }

  if (customFields.primarySector || customFields.sector) {
    chips.push(String(customFields.primarySector || customFields.sector));
  } else if (isJobSeeker) {
    chips.push('Finans / Bankacılık');
  }

  chips.push(locationText);

  // 8. Resolve Summary / Description
  const summaryTitle = isJobSeeker ? 'Kariyer Özeti' : isJobHire ? 'Pozisyon Özeti' : 'Girişim Özeti';
  const summaryContent =
    core.shortDescription ||
    (customFields.summary as string) ||
    core.description ||
    (isJobSeeker
      ? '10 yılı aşkın süredir çağrı merkezi ve müşteri hizmetleri alanında çalışıyorum. Ekip yönetimi, operasyonel süreçlerin iyileştirilmesi ve satış odaklı hizmet konusunda deneyimliyim.'
      : isJobHire
        ? 'Bilişim alanında kıdemli full-stack geliştirici arıyoruz. Rolde yazılım özelliklerinin geliştirilmesi ve API tasarımı sorumlulukları bekleniyor.'
        : 'Pazara çıkmış mobil ürünümüz için yazılım ve ürün yönetimi deneyimli teknik kurucu ortak arıyoruz; equity konuşulur.');

  // Initial for avatar
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'GB';

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 shadow-xs flex flex-col justify-between text-left">
      <div>
        {/* Category Pill */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
              categoryTagClass,
            )}
          >
            {categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>Güvenli İlan</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white line-clamp-2">
          {title}
        </h3>

        {/* User / Company Row */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 overflow-hidden border border-slate-200">
            {userAvatar ? (
              <img src={userAvatar} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 truncate">
            {displayName}
          </span>
        </div>

        {/* Location & Price */}
        <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
          {priceText && (
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
              <Banknote className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{priceText}</span>
            </div>
          )}
        </div>

        {/* Meta Line */}
        <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
          {metaLine}
        </div>

        {/* Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-zinc-300"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{summaryTitle}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400 line-clamp-2">
            {summaryContent}
          </p>
        </div>
      </div>

      {/* Footer / Bookmark */}
      <div className="mt-3 flex items-center justify-end pt-1.5 border-t border-slate-100/60 dark:border-zinc-800/60">
        <button
          type="button"
          tabIndex={-1}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
          aria-label="Kaydet"
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
