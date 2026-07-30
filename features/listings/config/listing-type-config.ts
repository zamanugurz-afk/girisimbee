/**
 * Deterministic seed IDs for categories and listing types.
 * Stable across environments for config-driven form engine.
 */
import { ids } from '@/lib/domain/ids';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import {
  CURRENCY_OPTIONS,
  EXPERIENCE_LEVELS,
  INVESTMENT_AMOUNT_RANGES,
  SALARY_RANGES,
  STARTUP_STAGES,
  STARTUP_STAGES_WITH_ALL,
} from '@/features/listings/config/listing-field-options';

export const CATEGORY_IDS = {
  yatirimBul: ids.category('e1000001-0001-4000-8000-000000000001'),
  yatirimYap: ids.category('e1000001-0001-4000-8000-000000000002'),
  isBul: ids.category('e1000001-0001-4000-8000-000000000003'),
  iseAl: ids.category('e1000001-0001-4000-8000-000000000004'),
  ortakBul: ids.category('e1000001-0001-4000-8000-000000000005'),
} as const satisfies Record<string, CategoryId>;

export const LISTING_TYPE_IDS = {
  yatirimBulDefault: ids.listingType('e1000001-0001-4000-8000-000000000001'),
  yatirimYapDefault: ids.listingType('e1000001-0001-4000-8000-000000000002'),
  isBulDefault: ids.listingType('e1000001-0001-4000-8000-000000000003'),
  iseAlDefault: ids.listingType('e1000001-0001-4000-8000-000000000004'),
  ortakBulDefault: ids.listingType('e1000001-0001-4000-8000-000000000005'),
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
      key: 'minInvestment',
      label: 'Minimum Yatırımcı Katkısı',
      type: 'enum',
      options: [...INVESTMENT_AMOUNT_RANGES],
    },
    {
      key: 'maxInvestment',
      label: 'Maksimum Yatırımcı Katkısı',
      type: 'enum',
      options: [...INVESTMENT_AMOUNT_RANGES],
    },
    { key: 'useOfFunds', label: 'Yatırımın Kullanım Alanı', type: 'string' },
    { key: 'currency', label: 'Para Birimi', type: 'enum', required: true, options: [...CURRENCY_OPTIONS] },
  ],
};

/** Yatırım Yapacağım — yatırımcı profili */
export const INVESTOR_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'ticketSizeMin',
      label: 'Minimum Bilet Boyutu',
      type: 'enum',
      required: true,
      options: [...INVESTMENT_AMOUNT_RANGES],
    },
    {
      key: 'ticketSizeMax',
      label: 'Maksimum Bilet Boyutu',
      type: 'enum',
      options: [...INVESTMENT_AMOUNT_RANGES],
    },
    {
      key: 'preferredStages',
      label: 'Tercih Edilen Aşama',
      type: 'enum',
      required: true,
      options: [...STARTUP_STAGES_WITH_ALL],
    },
    { key: 'sectors', label: 'İlgi Alanları / Sektörler', type: 'string', required: true },
    { key: 'investmentFocus', label: 'Yatırım Odağı', type: 'string' },
    { key: 'currency', label: 'Para Birimi', type: 'enum', required: true, options: [...CURRENCY_OPTIONS] },
  ],
};

/** İş Arıyorum — iş arayan profili */
export const JOB_SEEKER_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    { key: 'desiredRole', label: 'Aranan Pozisyon', type: 'string', required: true },
    { key: 'experienceYears', label: 'Deneyim (Yıl)', type: 'number', required: true, min: 0, max: 50 },
    { key: 'skills', label: 'Yetenekler', type: 'string' },
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
    {
      key: 'remotePreference',
      label: 'Uzaktan Çalışma Tercihi',
      type: 'enum',
      options: ['Ofis', 'Hibrit', 'Uzaktan'],
    },
  ],
};

/** İşe Alıyorum — işveren ilanı */
export const HIRING_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    { key: 'positionTitle', label: 'Pozisyon Adı', type: 'string', required: true },
    {
      key: 'salaryMin',
      label: 'Minimum Maaş',
      type: 'enum',
      options: [...SALARY_RANGES],
    },
    {
      key: 'salaryMax',
      label: 'Maksimum Maaş',
      type: 'enum',
      options: [...SALARY_RANGES],
    },
    {
      key: 'workType',
      label: 'Çalışma Tipi',
      type: 'enum',
      required: true,
      options: ['Tam zamanlı', 'Yarı zamanlı', 'Sözleşmeli', 'Staj'],
    },
    {
      key: 'experienceLevel',
      label: 'Deneyim Seviyesi',
      type: 'enum',
      options: [...EXPERIENCE_LEVELS],
    },
    { key: 'requiredSkills', label: 'Aranan Yetenekler', type: 'string' },
    { key: 'currency', label: 'Para Birimi', type: 'enum', required: true, options: [...CURRENCY_OPTIONS] },
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
    { key: 'requiredSkills', label: 'Aranan Yetenekler', type: 'string', required: true },
    { key: 'projectStage', label: 'Proje Aşaması', type: 'enum', options: [...STARTUP_STAGES] },
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
    slug: 'yatirim-yapacagim',
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
];

/** Map category slug → category ID */
export const CATEGORY_SLUG_TO_ID: Record<string, CategoryId> = {
  'yatirim-bul': CATEGORY_IDS.yatirimBul,
  'yatirim-yap': CATEGORY_IDS.yatirimYap,
  'is-bul': CATEGORY_IDS.isBul,
  'ise-al': CATEGORY_IDS.iseAl,
  'ortak-bul': CATEGORY_IDS.ortakBul,
};
