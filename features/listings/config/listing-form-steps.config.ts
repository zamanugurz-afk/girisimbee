/**
 * Per-category step definitions for listing create/edit wizards.
 */
import type { CategoryId } from '@/lib/domain/ids';
import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';

export type CoreFieldKey = keyof CoreListingFieldsInput;
export type MetaFieldKey = 'tags' | 'images';

export interface ListingFormStepDef {
  id: string;
  title: string;
  description?: string;
  coreFields?: CoreFieldKey[];
  /** Subset of custom field keys, or 'all' for the category schema */
  customFieldKeys?: 'all' | string[];
  meta?: MetaFieldKey[];
}

const STEP_BASICS: ListingFormStepDef = {
  id: 'basics',
  title: 'Temel Bilgiler',
  description: 'İlanınızı tanıtan başlık ve kısa özet',
  coreFields: ['title', 'shortDescription'],
};

const STEP_DETAILS: ListingFormStepDef = {
  id: 'details',
  title: 'Detaylı Açıklama',
  description: 'Vizyonunuzu ve beklentilerinizi anlatın',
  coreFields: ['longDescription', 'city'],
};

const STEP_WORK_MODEL: ListingFormStepDef = {
  id: 'work-model',
  title: 'Çalışma Modeli',
  description: 'Konum ve çalışma tercihleriniz',
  coreFields: ['remotePolicy'],
};

const STEP_MEDIA: ListingFormStepDef = {
  id: 'media',
  title: 'Etiketler & Görseller',
  description: 'İsteğe bağlı — ilanınızı daha keşfedilebilir yapın',
  meta: ['tags', 'images'],
};

/** Category-specific wizard steps keyed by category ID */
export const LISTING_FORM_STEPS: Record<string, ListingFormStepDef[]> = {
  [CATEGORY_IDS.yatirimBul]: [
    STEP_BASICS,
    STEP_DETAILS,
    {
      id: 'investment-seeking',
      title: 'Yatırım Detayları',
      description: 'Aradığınız yatırım tutarı, aşama ve hisse bilgileri',
      customFieldKeys: 'all',
    },
    STEP_MEDIA,
  ],
  [CATEGORY_IDS.yatirimYap]: [
    STEP_BASICS,
    STEP_DETAILS,
    {
      id: 'investment-offering',
      title: 'Yatırım Profiliniz',
      description: 'Bilet boyutu, tercih ettiğiniz aşamalar ve sektörler',
      customFieldKeys: 'all',
    },
    STEP_MEDIA,
  ],
  [CATEGORY_IDS.ortakBul]: [
    STEP_BASICS,
    STEP_DETAILS,
    {
      id: 'partnership',
      title: 'Ortaklık Detayları',
      description: 'Aradığınız ortak tipi ve taahhüt beklentileri',
      customFieldKeys: 'all',
    },
    STEP_MEDIA,
  ],
  [CATEGORY_IDS.isBul]: [
    STEP_BASICS,
    STEP_DETAILS,
    STEP_WORK_MODEL,
    {
      id: 'career',
      title: 'Kariyer Bilgileri',
      description: 'Deneyim, rol beklentisi ve maaş tercihleriniz',
      customFieldKeys: 'all',
    },
    STEP_MEDIA,
  ],
  [CATEGORY_IDS.iseAl]: [
    STEP_BASICS,
    STEP_DETAILS,
    STEP_WORK_MODEL,
    {
      id: 'hiring',
      title: 'Pozisyon Detayları',
      description: 'Açık rol, maaş aralığı ve deneyim beklentisi',
      customFieldKeys: 'all',
    },
    STEP_MEDIA,
  ],
};

export function getListingFormSteps(categoryId: CategoryId): ListingFormStepDef[] {
  return LISTING_FORM_STEPS[categoryId] ?? [
    STEP_BASICS,
    STEP_DETAILS,
    { id: 'custom', title: 'Ek Bilgiler', customFieldKeys: 'all' },
    STEP_MEDIA,
  ];
}

export function resolveStepCustomFields(
  step: ListingFormStepDef,
  allFieldKeys: string[],
): string[] {
  if (!step.customFieldKeys) return [];
  if (step.customFieldKeys === 'all') return allFieldKeys;
  return step.customFieldKeys.filter((k) => allFieldKeys.includes(k));
}
