/**
 * Deterministic seed IDs for categories and listing types.
 * Stable across environments for config-driven form engine.
 */
import { ids } from '@/lib/domain/ids';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import {
  EXPERIENCE_LEVELS,
  FRANCHISE_BUSINESS_CATEGORY_OPTIONS,
  FRANCHISE_CITY_OPTIONS,
  FRANCHISE_EDUCATION_OPTIONS,
  FRANCHISE_EXPERIENCE_OPTIONS,
  FRANCHISE_RETURN_PERIOD_OPTIONS,
  FRANCHISE_SECTOR_OPTIONS,
  FRANCHISE_SETUP_DURATION_OPTIONS,
  FRANCHISE_STORE_SIZE_OPTIONS,
  HIRING_SALARY_RANGES,
  INVESTMENT_AMOUNT_RANGES,
  INVESTOR_SECTOR_OPTIONS,
  JOB_POSITION_OPTIONS,
  PARTNER_EXPERTISE_OPTIONS,
  SALARY_RANGES,
  STARTUP_STAGES,
  STARTUP_STAGES_WITH_ALL,
  USE_OF_FUNDS_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

export const CATEGORY_IDS = {
  yatirimBul: ids.category('c1000001-0001-4000-8000-000000000001'),
  yatirimYap: ids.category('c1000001-0001-4000-8000-000000000002'),
  isBul: ids.category('c1000001-0001-4000-8000-000000000003'),
  iseAl: ids.category('c1000001-0001-4000-8000-000000000004'),
  ortakBul: ids.category('c1000001-0001-4000-8000-000000000005'),
  bayilikAl: ids.category('c1000001-0001-4000-8000-000000000006'),
} as const satisfies Record<string, CategoryId>;

export const LISTING_TYPE_IDS = {
  yatirimBulDefault: ids.listingType('lt000001-0001-4000-8000-000000000001'),
  yatirimYapDefault: ids.listingType('lt000001-0001-4000-8000-000000000002'),
  isBulDefault: ids.listingType('lt000001-0001-4000-8000-000000000003'),
  iseAlDefault: ids.listingType('lt000001-0001-4000-8000-000000000004'),
  ortakBulDefault: ids.listingType('lt000001-0001-4000-8000-000000000005'),
  franchiseGiveDefault: FRANCHISE_LISTING_TYPE_IDS.give,
} as const satisfies Record<string, ListingTypeId>;

/** Yatırım Arıyorum — girişim yatırım ihtiyacı */
export const SEEKING_INVESTMENT_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'investmentAmount',
      label: 'Aranan Yatırım Tutarı',
      type: 'enum',
      required: true,
      options: [...INVESTMENT_AMOUNT_RANGES],
    },
    { key: 'equityOffered', label: 'Sunulan Hisse (%)', type: 'percentage', required: true, min: 0, max: 100 },
    {
      key: 'stage',
      label: 'Girişim Aşaması',
      type: 'enum',
      required: true,
      options: [...STARTUP_STAGES],
    },
    {
      key: 'useOfFunds',
      label: 'Yatırımın Kullanım Alanı',
      type: 'multi-enum',
      required: true,
      options: [...USE_OF_FUNDS_OPTIONS],
    },
  ],
};

/** Yatırım Yapacağım — yatırımcı profili */
export const INVESTOR_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'investmentAmount',
      label: 'Yatırım tutarı',
      type: 'enum',
      required: true,
      options: [...INVESTMENT_AMOUNT_RANGES],
    },
    {
      key: 'preferredStages',
      label: 'Tercih Edilen Aşama',
      type: 'enum',
      required: true,
      options: [...STARTUP_STAGES_WITH_ALL],
    },
    {
      key: 'sectors',
      label: 'İlgi Alanları / Sektörler',
      type: 'multi-enum',
      required: true,
      options: [...INVESTOR_SECTOR_OPTIONS],
    },
  ],
};

/** İş Arıyorum — iş arayan profili */
export const JOB_SEEKER_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'desiredRole',
      label: 'Aranan Pozisyon',
      type: 'enum',
      required: true,
      options: [...JOB_POSITION_OPTIONS],
    },
    {
      key: 'experienceLevel',
      label: 'Deneyim Seviyesi',
      type: 'enum',
      required: true,
      options: [...EXPERIENCE_LEVELS],
    },
    {
      key: 'salaryExpectation',
      label: 'Maaş Beklentisi',
      type: 'enum',
      options: [...SALARY_RANGES],
    },
    {
      key: 'workType',
      label: 'Çalışma Tipi',
      type: 'enum',
      required: true,
      options: ['Tam zamanlı', 'Yarı zamanlı', 'Proje bazlı', 'Staj'],
    },
  ],
};

/** İşe Alıyorum — işveren ilanı */
export const HIRING_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'positionTitle',
      label: 'Pozisyon',
      type: 'enum',
      required: true,
      options: [...JOB_POSITION_OPTIONS],
    },
    {
      key: 'salaryRange',
      label: 'Maaş Aralığı',
      type: 'enum',
      required: true,
      options: [...HIRING_SALARY_RANGES],
    },
    {
      key: 'workType',
      label: 'Çalışma Tipi',
      type: 'enum',
      required: true,
      options: ['Tam zamanlı', 'Yarı zamanlı', 'Sözleşmeli', 'Staj'],
    },
  ],
};

/** Franchise İlan Ver — franchise owner offering opportunity */
export const FRANCHISE_GIVE_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    { key: 'companyName', label: 'Şirket Adı', type: 'string', required: true, max: 200 },
    { key: 'establishmentYear', label: 'Kuruluş Yılı', type: 'number', required: true, min: 1900, max: 2030 },
    {
      key: 'sector',
      label: 'Sektör',
      type: 'enum',
      required: true,
      options: [...FRANCHISE_SECTOR_OPTIONS],
    },
    { key: 'branchCount', label: 'Şube Sayısı', type: 'number', required: true, min: 1 },
    { key: 'website', label: 'Web Sitesi', type: 'string', max: 500 },
    { key: 'entryFee', label: 'Giriş Bedeli (₺)', type: 'currency', min: 0 },
    {
      key: 'totalInvestment',
      label: 'Toplam Yatırım Bütçesi (₺)',
      type: 'currency',
      required: true,
      min: 0,
    },
    {
      key: 'franchiseFee',
      label: 'İsim Hakkı Bedeli (₺)',
      type: 'currency',
      required: true,
      min: 0,
    },
    {
      key: 'profitMargin',
      label: 'Kar Marjı (%)',
      type: 'percentage',
      required: true,
      min: 0,
      max: 100,
    },
    {
      key: 'royaltyFee',
      label: 'Cirodan Alınan Pay (%)',
      type: 'percentage',
      required: true,
      min: 0,
      max: 100,
    },
    {
      key: 'returnPeriod',
      label: 'Yatırımın Geri Dönüş Süresi',
      type: 'enum',
      required: true,
      options: [...FRANCHISE_RETURN_PERIOD_OPTIONS],
    },
    {
      key: 'averageSetupDuration',
      label: 'Ortalama Kurulum Süresi',
      type: 'enum',
      required: true,
      options: [...FRANCHISE_SETUP_DURATION_OPTIONS],
    },
    {
      key: 'minSquareMeters',
      label: 'Minimum M²',
      type: 'number',
      required: true,
      min: 1,
    },
    { key: 'advertisingFee', label: 'Reklam Katkı Payı (%)', type: 'percentage', min: 0, max: 100 },
    {
      key: 'availableCities',
      label: 'Uygun Şehirler',
      type: 'multi-enum',
      required: true,
      options: [...FRANCHISE_CITY_OPTIONS],
    },
    { key: 'districts', label: 'İlçeler', type: 'string', max: 500 },
    { key: 'minPopulation', label: 'Minimum Nüfus Şartı', type: 'number', min: 0 },
    {
      key: 'storeSize',
      label: 'Mağaza Büyüklüğü',
      type: 'enum',
      options: [...FRANCHISE_STORE_SIZE_OPTIONS],
    },
    { key: 'mallAvailable', label: 'AVM\'de Açılabilir', type: 'boolean' },
    { key: 'streetStoreAvailable', label: 'Cadde Mağazası Açılabilir', type: 'boolean' },
    {
      key: 'businessCategory',
      label: 'İş Kategorisi',
      type: 'enum',
      required: true,
      options: [...FRANCHISE_BUSINESS_CATEGORY_OPTIONS],
    },
    { key: 'employeeCount', label: 'Çalışan Sayısı', type: 'number', min: 0 },
    { key: 'dailyCustomerCapacity', label: 'Günlük Müşteri Kapasitesi', type: 'number', min: 0 },
    { key: 'workingHours', label: 'Çalışma Saatleri', type: 'string', max: 200 },
    { key: 'trainingSupport', label: 'Eğitim Desteği', type: 'boolean' },
    { key: 'operationalSupport', label: 'Operasyon Desteği', type: 'boolean' },
    { key: 'marketingSupport', label: 'Pazarlama Desteği', type: 'boolean' },
    { key: 'minCapitalRequirement', label: 'Minimum Sermaye Gereksinimi (₺)', type: 'currency', required: true, min: 0 },
    {
      key: 'experienceRequirement',
      label: 'Deneyim Gereksinimi',
      type: 'enum',
      options: [...FRANCHISE_EXPERIENCE_OPTIONS],
    },
    {
      key: 'educationRequirement',
      label: 'Eğitim Gereksinimi',
      type: 'enum',
      options: [...FRANCHISE_EDUCATION_OPTIONS],
    },
    { key: 'companyEstablishmentRequired', label: 'Şirket Kuruluş Gereksinimi', type: 'boolean' },
    { key: 'guaranteeRequirement', label: 'Teminat Gereksinimi', type: 'string', max: 500 },
    { key: 'introductionVideoUrl', label: 'Tanıtım Videosu (URL)', type: 'string', max: 500 },
    { key: 'presentationPdfUrl', label: 'Franchise Sunum PDF (URL)', type: 'string', max: 500 },
    { key: 'sampleContractUrl', label: 'Örnek Sözleşme (URL)', type: 'string', max: 500 },
  ],
};

/** Ortak Arıyorum — ortaklık ilanı */
export const PARTNER_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'partnershipType',
      label: 'Ortaklık Tipi',
      type: 'enum',
      required: true,
      options: ['Teknik Ortak', 'İş Ortağı', 'Kurucu Ortak', 'Danışman'],
    },
    { key: 'equityOffered', label: 'Sunulan Hisse (%)', type: 'percentage', min: 0, max: 100 },
    {
      key: 'commitment',
      label: 'Taahhüt',
      type: 'enum',
      options: ['Tam zamanlı', 'Yarı zamanlı', 'Danışmanlık'],
    },
    {
      key: 'expertise',
      label: 'Aranan Uzmanlık',
      type: 'multi-enum',
      required: true,
      options: [...PARTNER_EXPERTISE_OPTIONS],
    },
  ],
};

/** @deprecated Use category-specific schemas */
export const INVESTMENT_FIELD_SCHEMA = SEEKING_INVESTMENT_FIELD_SCHEMA;

export interface CategoryListingTypeConfig {
  listingTypeId: ListingTypeId;
  categoryId: CategoryId;
  slug: string;
  name: string;
  description: string;
  fieldSchema: ListingFieldSchema;
  sortOrder: number;
}

export const LISTING_TYPE_CONFIGS: CategoryListingTypeConfig[] = [
  {
    listingTypeId: LISTING_TYPE_IDS.yatirimBulDefault,
    categoryId: CATEGORY_IDS.yatirimBul,
    slug: 'yatirim-ariyorum',
    name: 'Yatırım Arıyorum',
    description: 'Girişiminiz için yatırımcı arayın',
    fieldSchema: SEEKING_INVESTMENT_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.yatirimYapDefault,
    categoryId: CATEGORY_IDS.yatirimYap,
    slug: 'yatirim-yapiyorum',
    name: 'Yatırım Yapacağım',
    description: 'Yatırım yapmak isteyen profil',
    fieldSchema: INVESTOR_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.isBulDefault,
    categoryId: CATEGORY_IDS.isBul,
    slug: 'is-ariyorum',
    name: 'İş Arıyorum',
    description: 'Kariyer fırsatı arayan profil',
    fieldSchema: JOB_SEEKER_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
    categoryId: CATEGORY_IDS.iseAl,
    slug: 'ise-aliyorum',
    name: 'İşe Alıyorum',
    description: 'Ekibinize yetenek arayın',
    fieldSchema: HIRING_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    categoryId: CATEGORY_IDS.ortakBul,
    slug: 'ortak-ariyorum',
    name: 'Ortak Arıyorum',
    description: 'Kurucu veya iş ortağı arayın',
    fieldSchema: PARTNER_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
    categoryId: CATEGORY_IDS.bayilikAl,
    slug: 'franchise-ilan-ver',
    name: 'Franchise İlan Ver',
    description: 'Markanızı büyütün ve yeni yatırımcılarla buluşun.',
    fieldSchema: FRANCHISE_GIVE_FIELD_SCHEMA,
    sortOrder: 1,
  },
];

/** Map category slug → category ID */
export const CATEGORY_SLUG_TO_ID: Record<string, CategoryId> = {
  'yatirim-bul': CATEGORY_IDS.yatirimBul,
  'yatirim-yap': CATEGORY_IDS.yatirimYap,
  'is-bul': CATEGORY_IDS.isBul,
  'ise-al': CATEGORY_IDS.iseAl,
  'ortak-bul': CATEGORY_IDS.ortakBul,
  franchise: CATEGORY_IDS.bayilikAl,
  'bayilik-al': CATEGORY_IDS.bayilikAl,
};
