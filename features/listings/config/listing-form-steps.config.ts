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
  /** CV upload step (job seeker) */
  cv?: boolean;
  /** KVKK consent step (job seeker) */
  kvkk?: boolean;
  /** Final read-only review step */
  preview?: boolean;
  /** Final publish action step */
  publish?: boolean;
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
  coreFields: ['longDescription'],
};

const STEP_DETAILS_WITH_CITY: ListingFormStepDef = {
  id: 'details',
  title: 'Detaylı Açıklama',
  description: 'Vizyonunuzu, beklentilerinizi ve konum bilgisini girin',
  coreFields: ['longDescription', 'city'],
};

const STEP_LOCATION: ListingFormStepDef = {
  id: 'location',
  title: 'Konum',
  description: 'Çalışmak istediğiniz şehri seçin',
  coreFields: ['city'],
};

const STEP_IMAGES: ListingFormStepDef = {
  id: 'images',
  title: 'Görseller',
  description: 'İsteğe bağlı — ilanınızı görselle destekleyin',
  meta: ['images'],
};

const STEP_LANGUAGE_TAGS: ListingFormStepDef = {
  id: 'language',
  title: 'Dil',
  description: 'Pozisyon için gerekli dil tercihlerini seçin',
  meta: ['tags'],
};

const STEP_CV: ListingFormStepDef = {
  id: 'cv',
  title: 'Özgeçmiş',
  description: 'PDF veya DOCX formatında özgeçmişinizi yükleyin',
  cv: true,
};

const STEP_KVKK: ListingFormStepDef = {
  id: 'kvkk',
  title: 'KVKK Onayları',
  description: 'Kişisel verilerinizin işlenmesi için gerekli onaylar',
  kvkk: true,
};

const STEP_PREVIEW: ListingFormStepDef = {
  id: 'preview',
  title: 'Önizleme',
  description: 'İlanınızın yayınlanmadan önce son hali.',
  preview: true,
};

const STEP_PUBLISH: ListingFormStepDef = {
  id: 'publish',
  title: 'Yayınla',
  description: 'İlanınızı yayınlamaya hazırsınız.',
  publish: true,
};

/** Category-specific wizard steps keyed by category ID */
export const LISTING_FORM_STEPS: Record<string, ListingFormStepDef[]> = {
  [CATEGORY_IDS.yatirimBul]: [
    STEP_BASICS,
    STEP_DETAILS,
    {
      id: 'investment-seeking',
      title: 'Yatırım Detayları',
      description: 'Aradığınız yatırım tutarı, aşama ve kullanım alanları',
      customFieldKeys: 'all',
    },
    STEP_IMAGES,
    STEP_PREVIEW,
    STEP_PUBLISH,
  ],
  [CATEGORY_IDS.yatirimYap]: [
    STEP_BASICS,
    STEP_DETAILS,
    {
      id: 'investment-offering',
      title: 'Yatırım Profiliniz',
      description: 'Yatırım tutarı, tercih ettiğiniz aşamalar ve sektörler',
      customFieldKeys: 'all',
    },
    STEP_IMAGES,
    STEP_PREVIEW,
    STEP_PUBLISH,
  ],
  [CATEGORY_IDS.ortakBul]: [
    STEP_BASICS,
    STEP_DETAILS,
    {
      id: 'partnership',
      title: 'Ortaklık Detayları',
      description: 'Aradığınız ortak tipi, uzmanlık ve taahhüt beklentileri',
      customFieldKeys: 'all',
    },
    STEP_IMAGES,
    STEP_PREVIEW,
    STEP_PUBLISH,
  ],
  [CATEGORY_IDS.isBul]: [
    STEP_BASICS,
    STEP_DETAILS,
    STEP_LOCATION,
    {
      id: 'career',
      title: 'Kariyer Bilgileri',
      description: 'Pozisyon, deneyim seviyesi ve çalışma tercihleriniz',
      customFieldKeys: 'all',
    },
    STEP_CV,
    STEP_IMAGES,
    STEP_KVKK,
    STEP_PREVIEW,
    STEP_PUBLISH,
  ],
  [CATEGORY_IDS.iseAl]: [
    STEP_BASICS,
    STEP_DETAILS_WITH_CITY,
    {
      id: 'hiring',
      title: 'Pozisyon Detayları',
      description: 'Açık rol, maaş aralığı ve çalışma tipi',
      customFieldKeys: 'all',
    },
    STEP_LANGUAGE_TAGS,
    STEP_IMAGES,
    STEP_PREVIEW,
    STEP_PUBLISH,
  ],
};

export function getListingFormSteps(categoryId: CategoryId): ListingFormStepDef[] {
  return LISTING_FORM_STEPS[categoryId] ?? [
    STEP_BASICS,
    STEP_DETAILS,
    { id: 'custom', title: 'Ek Bilgiler', customFieldKeys: 'all' },
    STEP_IMAGES,
    STEP_PREVIEW,
    STEP_PUBLISH,
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

/** Field paths rendered in the wizard (excludes hidden/system-only fields). */
export function collectWizardVisibleFieldPaths(
  steps: ListingFormStepDef[],
  allFieldKeys: string[],
): Set<string> {
  const paths = new Set<string>();

  for (const step of steps) {
    if (step.preview || step.publish || step.kvkk || step.cv) continue;

    step.coreFields?.forEach((key) => {
      paths.add(`core.${key}`);
      paths.add(key);
    });

    resolveStepCustomFields(step, allFieldKeys).forEach((key) => {
      paths.add(`customFields.${key}`);
      paths.add(key);
    });

    step.meta?.forEach((key) => paths.add(key));
  }

  return paths;
}
