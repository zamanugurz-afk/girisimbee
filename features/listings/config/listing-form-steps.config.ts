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
  /** Custom fields rendered above core fields (e.g. company name first) */
  leadCustomFieldKeys?: string[];
  meta?: MetaFieldKey[];
  /** CV upload step (job seeker) */
  cv?: boolean;
  /** KVKK consent step (job seeker) */
  kvkk?: boolean;
  /** Final read-only review step */
  preview?: boolean;
  /** Homepage placement package selection (before publish) */
  package?: boolean;
  /** Final publish action step */
  publish?: boolean;
}

const STEP_BASICS: ListingFormStepDef = {
  id: 'basics',
  title: 'Temel Bilgiler',
  description: 'Başlık ve kısa özet — kartlarda bu metinler görünür',
  coreFields: ['title', 'shortDescription'],
};

const STEP_DETAILS: ListingFormStepDef = {
  id: 'details',
  title: 'Detaylı Açıklama',
  description: 'Kapsamı ve beklentileri detaylı anlatın',
  coreFields: ['longDescription'],
};

const STEP_DETAILS_WITH_CITY: ListingFormStepDef = {
  id: 'details',
  title: 'Detaylı Açıklama',
  description: 'Kapsamı, beklentileri ve konum bilgisini girin',
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
  title: 'Yayın Onayları',
  description: 'Telefon paylaşımı ve KVKK onayları — iletişim yalnızca telefon ile yapılır',
  kvkk: true,
};

const STEP_PREVIEW: ListingFormStepDef = {
  id: 'preview',
  title: 'Önizleme',
  description: 'İlanınızın yayınlanmadan önce son hali.',
  preview: true,
};

const STEP_PACKAGE: ListingFormStepDef = {
  id: 'package',
  title: 'Paket Seç',
  description: 'Standart yayın ücretsizdir. İsterseniz ana sayfa paketlerini ekleyebilirsiniz.',
  package: true,
};

const STEP_PUBLISH: ListingFormStepDef = {
  id: 'publish',
  title: 'Yayınla',
  description: 'İlanınızı yayınlamaya hazırsınız.',
  publish: true,
};

/** Terminal flow shared by all categories: kvkk (if missing) → preview → package → publish */
function withPublishFlow(...steps: ListingFormStepDef[]): ListingFormStepDef[] {
  const hasKvkk = steps.some((step) => step.kvkk);
  return [
    ...steps,
    ...(hasKvkk ? [] : [STEP_KVKK]),
    STEP_PREVIEW,
    STEP_PACKAGE,
    STEP_PUBLISH,
  ];
}

/** Category-specific wizard steps keyed by category ID */
export const LISTING_FORM_STEPS: Record<string, ListingFormStepDef[]> = {
  [CATEGORY_IDS.yatirimBul]: withPublishFlow(
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Yatırım ilanı başlığı ve kısa özet — kartlarda görünür',
      coreFields: ['title', 'shortDescription'],
    },
    {
      id: 'details',
      title: 'Detaylı Açıklama',
      description: 'Ürün, pazar, ekip ve yatırımcıya vaadinizi anlatın',
      coreFields: ['longDescription'],
    },
    {
      id: 'investment-seeking',
      title: 'Yatırım Detayları',
      description: 'Aradığınız yatırım tutarı, aşama ve kullanım alanları',
      customFieldKeys: 'all',
    },
    STEP_IMAGES,
  ),
  [CATEGORY_IDS.yatirimYap]: withPublishFlow(
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Yatırımcı profil başlığı ve kısa özet — kartlarda görünür',
      coreFields: ['title', 'shortDescription'],
    },
    {
      id: 'details',
      title: 'Detaylı Açıklama',
      description: 'Stratejinizi ve kuruculara sunduğunuz değeri anlatın',
      coreFields: ['longDescription'],
    },
    {
      id: 'investment-offering',
      title: 'Yatırım Profiliniz',
      description: 'Yatırım tutarı, tercih ettiğiniz aşamalar ve sektörler',
      customFieldKeys: 'all',
    },
    STEP_IMAGES,
  ),
  [CATEGORY_IDS.ortakBul]: withPublishFlow(
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Ortaklık ilanı başlığı ve kısa özet — kartlarda görünür',
      coreFields: ['title', 'shortDescription'],
    },
    {
      id: 'details',
      title: 'Detaylı Açıklama',
      description: 'Vizyon, ekip ve ortaklık beklentinizi anlatın',
      coreFields: ['longDescription'],
    },
    {
      id: 'partnership',
      title: 'Ortaklık Detayları',
      description: 'Aradığınız ortak tipi, uzmanlık ve taahhüt beklentileri',
      customFieldKeys: 'all',
    },
    STEP_IMAGES,
  ),
  [CATEGORY_IDS.isBul]: withPublishFlow(
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Hedef rol başlığı ve kısa profil özeti',
      coreFields: ['title', 'shortDescription'],
    },
    {
      id: 'details',
      title: 'Kariyer özetim',
      description: 'Deneyiminizi, hedeflerinizi ve aradığınız rolü anlatın',
      coreFields: ['longDescription'],
    },
    STEP_LOCATION,
    {
      id: 'career',
      title: 'Kariyer Bilgileri',
      description: 'Pozisyon, deneyim seviyesi ve çalışma tercihleriniz',
      customFieldKeys: 'all',
    },
    STEP_CV,
    STEP_KVKK,
  ),
  [CATEGORY_IDS.iseAl]: withPublishFlow(
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Pozisyon başlığı ve kısa özet — iş ilanı kartlarında görünür',
      coreFields: ['title', 'shortDescription'],
    },
    {
      id: 'details',
      title: 'Detaylı Açıklama',
      description: 'Sorumluluklar, nitelikler ve süreç detaylarını yazın',
      coreFields: ['longDescription', 'city'],
    },
    {
      id: 'hiring',
      title: 'Pozisyon Detayları',
      description: 'Açık rol, maaş aralığı ve çalışma tipi',
      customFieldKeys: 'all',
    },
    STEP_LANGUAGE_TAGS,
    {
      id: 'images',
      title: 'Firma Görseli',
      description: 'İsteğe bağlı — firma görselinizi ekleyerek ilanınızı destekleyin',
      meta: ['images'],
    },
  ),
  [CATEGORY_IDS.bayilikAl]: withPublishFlow(
    {
      id: 'brand',
      title: 'Marka Bilgileri',
      description: 'Marka adı, kısa tarihçe ve şirket bilgileri — kartlarda özet görünür',
      leadCustomFieldKeys: ['companyName'],
      coreFields: ['title', 'shortDescription', 'longDescription'],
      customFieldKeys: ['companyName', 'establishmentYear', 'sector', 'branchCount', 'website'],
    },
    {
      id: 'investment',
      title: 'Yatırım Bilgileri',
      description: 'Yatırım bütçesi, isim hakkı ve geri dönüş beklentileri',
      customFieldKeys: [
        'totalInvestment',
        'franchiseFee',
        'profitMargin',
        'royaltyFee',
        'returnPeriod',
        'averageSetupDuration',
        'minSquareMeters',
      ],
    },
    {
      id: 'location',
      title: 'Lokasyon Bilgileri',
      description: 'Franchise açılabilecek şehirler ve mağaza gereksinimleri',
      customFieldKeys: [
        'availableCities',
        'districts',
        'mallAvailable',
        'streetStoreAvailable',
      ],
    },
    {
      id: 'business-model',
      title: 'İş Modeli',
      description: 'Operasyon modeli ve destek seçenekleri',
      customFieldKeys: [
        'businessCategory',
        'workingHours',
        'trainingSupport',
        'operationalSupport',
        'marketingSupport',
      ],
    },
    {
      id: 'requirements',
      title: 'Franchise Gereksinimleri',
      description: 'Yatırımcılardan beklenen sermaye ve deneyim şartları',
      customFieldKeys: [
        'minCapitalRequirement',
        'experienceRequirement',
        'educationRequirement',
        'companyEstablishmentRequired',
        'guaranteeRequirement',
      ],
    },
    {
      id: 'media',
      title: 'Medya ve Belgeler',
      description: 'Marka görselleri, tanıtım videosu ve sunum belgeleri',
      meta: ['images'],
      customFieldKeys: ['introductionVideoUrl', 'presentationPdfUrl', 'sampleContractUrl'],
    },
  ),
  [CATEGORY_IDS.genelIlan]: withPublishFlow(
    STEP_BASICS,
    STEP_DETAILS_WITH_CITY,
    {
      id: 'general-details',
      title: 'İlan Detayları',
      description: 'Tür, durum, fiyat ve sektör bilgileri',
      customFieldKeys: 'all',
    },
    STEP_IMAGES,
  ),
  [CATEGORY_IDS.dijitalAi]: withPublishFlow(
    {
      id: 'basics',
      title: 'Ürün özeti',
      description: 'Çözümünüzün adı ve kısa tanıtımı — kartlarda bu metin görünür',
      coreFields: ['title', 'shortDescription'],
    },
    {
      id: 'digital-ai-identity',
      title: 'Çözüm kimliği',
      description: 'Tür, teslim modeli, hedef kitle, fiyat ve demo bağlantısı',
      customFieldKeys: [
        'solutionType',
        'deliveryModel',
        'targetAudience',
        'priceRange',
        'demoUrl',
      ],
    },
    {
      id: 'digital-ai-capabilities',
      title: 'Yetenekler',
      description:
        'Örnekteki gibi: her yetenek ikon + başlık + açıklama kartıdır. En az birini seçin',
      customFieldKeys: ['capabilities'],
    },
    {
      id: 'digital-ai-scope',
      title: 'Kapsam ve dil',
      description: 'Detaylı açıklama, şehir ve desteklenen diller',
      coreFields: ['longDescription', 'city'],
      customFieldKeys: ['supportedLanguages'],
    },
    STEP_IMAGES,
  ),
};

export function getListingFormSteps(categoryId: CategoryId): ListingFormStepDef[] {
  return LISTING_FORM_STEPS[categoryId] ?? withPublishFlow(
    STEP_BASICS,
    STEP_DETAILS,
    { id: 'custom', title: 'Ek Bilgiler', customFieldKeys: 'all' },
    STEP_IMAGES,
  );
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
    if (step.preview || step.publish || step.package || step.kvkk || step.cv) continue;

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
