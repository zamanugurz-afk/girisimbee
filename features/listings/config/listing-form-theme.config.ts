import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';

export interface ListingCategoryTheme {
  categoryId: string;
  name: string;
  colorHex: string;
  // Stepper active state:
  stepperActiveBorder: string;
  stepperActiveBg: string;
  stepperActiveText: string;
  stepperActiveNumberBg: string;
  stepperActiveNumberText: string;
  // Center form header & accents:
  stepBadgeBg: string;
  stepBadgeText: string;
  categoryLabelText: string;
  stepCounterBadge: string;
  dividerColor: string;
  // CTA Action buttons:
  ctaButtonBg: string;
  // Right progress status:
  progressBarBg: string;
  progressText: string;
  progressActiveBg: string;
  progressActiveDot: string;
  // Preview tag / badge:
  previewBadge: string;
  previewTagText: string;
}

export const LISTING_CATEGORY_THEMES: Record<string, ListingCategoryTheme> = {
  [CATEGORY_IDS.isBul]: {
    categoryId: CATEGORY_IDS.isBul,
    name: 'İş Arıyorum',
    colorHex: '#0EA5E9',
    stepperActiveBorder: 'border-sky-500',
    stepperActiveBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    stepperActiveText: 'text-sky-950 dark:text-sky-100 font-semibold',
    stepperActiveNumberBg: 'bg-sky-500 text-white shadow-2xs',
    stepperActiveNumberText: 'text-white',
    stepBadgeBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
    stepBadgeText: 'text-sky-600 dark:text-sky-400',
    categoryLabelText: 'text-sky-600 dark:text-sky-400',
    stepCounterBadge: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    dividerColor: 'bg-sky-500/40 dark:bg-sky-500/30',
    ctaButtonBg: 'bg-sky-600 hover:bg-sky-700 text-white',
    progressBarBg: 'bg-sky-500',
    progressText: 'text-sky-600 dark:text-sky-400',
    progressActiveBg: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
    progressActiveDot: 'bg-sky-500',
    previewBadge: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    previewTagText: 'text-sky-600',
  },
  [CATEGORY_IDS.iseAl]: {
    categoryId: CATEGORY_IDS.iseAl,
    name: 'İşe Alıyorum',
    colorHex: '#10B981',
    stepperActiveBorder: 'border-emerald-500',
    stepperActiveBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    stepperActiveText: 'text-emerald-950 dark:text-emerald-100 font-semibold',
    stepperActiveNumberBg: 'bg-emerald-500 text-white shadow-2xs',
    stepperActiveNumberText: 'text-white',
    stepBadgeBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    stepBadgeText: 'text-emerald-600 dark:text-emerald-400',
    categoryLabelText: 'text-emerald-600 dark:text-emerald-400',
    stepCounterBadge: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    dividerColor: 'bg-emerald-500/40 dark:bg-emerald-500/30',
    ctaButtonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    progressBarBg: 'bg-emerald-500',
    progressText: 'text-emerald-600 dark:text-emerald-400',
    progressActiveBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    progressActiveDot: 'bg-emerald-500',
    previewBadge: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    previewTagText: 'text-emerald-600',
  },
  [CATEGORY_IDS.ortakBul]: {
    categoryId: CATEGORY_IDS.ortakBul,
    name: 'Ortak Arıyorum',
    colorHex: '#F59E0B',
    stepperActiveBorder: 'border-amber-500',
    stepperActiveBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    stepperActiveText: 'text-amber-950 dark:text-amber-100 font-semibold',
    stepperActiveNumberBg: 'bg-amber-500 text-slate-950 shadow-2xs',
    stepperActiveNumberText: 'text-slate-950',
    stepBadgeBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    stepBadgeText: 'text-amber-600 dark:text-amber-400',
    categoryLabelText: 'text-amber-600 dark:text-amber-400',
    stepCounterBadge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    dividerColor: 'bg-amber-500/40 dark:bg-amber-500/30',
    ctaButtonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
    progressBarBg: 'bg-amber-500',
    progressText: 'text-amber-600 dark:text-amber-400',
    progressActiveBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    progressActiveDot: 'bg-amber-500',
    previewBadge: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    previewTagText: 'text-amber-600',
  },
  [CATEGORY_IDS.yatirimBul]: {
    categoryId: CATEGORY_IDS.yatirimBul,
    name: 'Yatırım Arıyorum',
    colorHex: '#3B82F6',
    stepperActiveBorder: 'border-blue-500',
    stepperActiveBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    stepperActiveText: 'text-blue-950 dark:text-blue-100 font-semibold',
    stepperActiveNumberBg: 'bg-blue-500 text-white shadow-2xs',
    stepperActiveNumberText: 'text-white',
    stepBadgeBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    stepBadgeText: 'text-blue-600 dark:text-blue-400',
    categoryLabelText: 'text-blue-600 dark:text-blue-400',
    stepCounterBadge: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    dividerColor: 'bg-blue-500/40 dark:bg-blue-500/30',
    ctaButtonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    progressBarBg: 'bg-blue-500',
    progressText: 'text-blue-600 dark:text-blue-400',
    progressActiveBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    progressActiveDot: 'bg-blue-500',
    previewBadge: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    previewTagText: 'text-blue-600',
  },
  [CATEGORY_IDS.yatirimYap]: {
    categoryId: CATEGORY_IDS.yatirimYap,
    name: 'Yatırım Yapıyorum',
    colorHex: '#6C63FF',
    stepperActiveBorder: 'border-indigo-500',
    stepperActiveBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    stepperActiveText: 'text-indigo-950 dark:text-indigo-100 font-semibold',
    stepperActiveNumberBg: 'bg-indigo-500 text-white shadow-2xs',
    stepperActiveNumberText: 'text-white',
    stepBadgeBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    stepBadgeText: 'text-indigo-600 dark:text-indigo-400',
    categoryLabelText: 'text-indigo-600 dark:text-indigo-400',
    stepCounterBadge: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    dividerColor: 'bg-indigo-500/40 dark:bg-indigo-500/30',
    ctaButtonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    progressBarBg: 'bg-indigo-500',
    progressText: 'text-indigo-600 dark:text-indigo-400',
    progressActiveBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    progressActiveDot: 'bg-indigo-500',
    previewBadge: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    previewTagText: 'text-indigo-600',
  },
  [CATEGORY_IDS.bayilikAl]: {
    categoryId: CATEGORY_IDS.bayilikAl,
    name: 'Franchise',
    colorHex: '#EC4899',
    stepperActiveBorder: 'border-pink-500',
    stepperActiveBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    stepperActiveText: 'text-pink-950 dark:text-pink-100 font-semibold',
    stepperActiveNumberBg: 'bg-pink-500 text-white shadow-2xs',
    stepperActiveNumberText: 'text-white',
    stepBadgeBg: 'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
    stepBadgeText: 'text-pink-600 dark:text-pink-400',
    categoryLabelText: 'text-pink-600 dark:text-pink-400',
    stepCounterBadge: 'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    dividerColor: 'bg-pink-500/40 dark:bg-pink-500/30',
    ctaButtonBg: 'bg-pink-600 hover:bg-pink-700 text-white',
    progressBarBg: 'bg-pink-500',
    progressText: 'text-pink-600 dark:text-pink-400',
    progressActiveBg: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
    progressActiveDot: 'bg-pink-500',
    previewBadge: 'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    previewTagText: 'text-pink-600',
  },
  [CATEGORY_IDS.dijitalAi]: {
    categoryId: CATEGORY_IDS.dijitalAi,
    name: 'Dijital & AI',
    colorHex: '#8B5CF6',
    stepperActiveBorder: 'border-purple-500',
    stepperActiveBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    stepperActiveText: 'text-purple-950 dark:text-purple-100 font-semibold',
    stepperActiveNumberBg: 'bg-purple-500 text-white shadow-2xs',
    stepperActiveNumberText: 'text-white',
    stepBadgeBg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    stepBadgeText: 'text-purple-600 dark:text-purple-400',
    categoryLabelText: 'text-purple-600 dark:text-purple-400',
    stepCounterBadge: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    dividerColor: 'bg-purple-500/40 dark:bg-purple-500/30',
    ctaButtonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    progressBarBg: 'bg-purple-500',
    progressText: 'text-purple-600 dark:text-purple-400',
    progressActiveBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    progressActiveDot: 'bg-purple-500',
    previewBadge: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    previewTagText: 'text-purple-600',
  },
};

const DEFAULT_THEME: ListingCategoryTheme = {
  categoryId: 'default',
  name: 'İlan',
  colorHex: '#5B5CF6',
  stepperActiveBorder: 'border-primary',
  stepperActiveBg: 'bg-primary/10 dark:bg-primary/20',
  stepperActiveText: 'text-foreground font-semibold',
  stepperActiveNumberBg: 'bg-primary text-primary-foreground shadow-2xs',
  stepperActiveNumberText: 'text-primary-foreground',
  stepBadgeBg: 'bg-primary/10 text-primary',
  stepBadgeText: 'text-primary',
  categoryLabelText: 'text-primary',
  stepCounterBadge: 'bg-primary/10 text-primary',
  dividerColor: 'bg-primary/40 dark:bg-primary/30',
  ctaButtonBg: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  progressBarBg: 'bg-primary',
  progressText: 'text-primary',
  progressActiveBg: 'bg-primary/20 text-primary',
  progressActiveDot: 'bg-primary',
  previewBadge: 'bg-primary/10 text-primary',
  previewTagText: 'text-primary',
};

export function getListingCategoryTheme(categoryId?: CategoryId | string | null): ListingCategoryTheme {
  if (!categoryId) return DEFAULT_THEME;
  return LISTING_CATEGORY_THEMES[categoryId] ?? DEFAULT_THEME;
}
