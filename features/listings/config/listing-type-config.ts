/**
 * Deterministic seed IDs for categories and listing types.
 * Stable across environments for config-driven form engine.
 */
import { ids } from '@/lib/domain/ids';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import {
  EXPERIENCE_LEVELS,
  CAREER_PROFILE_GENDER_OPTIONS,
  CAREER_WORK_TYPE_OPTIONS,
  CAREER_WORKPLACE_OPTIONS,
  CAREER_EDUCATION_LEVELS,
  CAREER_AVAILABILITY_OPTIONS,
  FRANCHISE_BUSINESS_CATEGORY_OPTIONS,
  FRANCHISE_CITY_OPTIONS,
  FRANCHISE_EDUCATION_OPTIONS,
  FRANCHISE_EXPERIENCE_OPTIONS,
  FRANCHISE_RETURN_PERIOD_OPTIONS,
  FRANCHISE_SECTOR_OPTIONS,
  FRANCHISE_SETUP_DURATION_OPTIONS,
  FRANCHISE_STORE_SIZE_OPTIONS,
  HIRING_SALARY_RANGES,
  HIRING_WORK_TYPE_OPTIONS,
  INVESTMENT_AMOUNT_RANGES,
  INVESTOR_SECTOR_OPTIONS,
  JOB_POSITION_OPTIONS,
  JOB_SECTOR_OPTIONS,
  PARTNER_EXPERTISE_OPTIONS,
  SALARY_RANGES,
  STARTUP_STAGES,
  STARTUP_STAGES_WITH_ALL,
  USE_OF_FUNDS_OPTIONS,
  GENERAL_LISTING_TYPE_OPTIONS,
  GENERAL_LISTING_CONDITION_OPTIONS,
  GENERAL_LISTING_PRICE_OPTIONS,
  DIGITAL_AI_SOLUTION_TYPE_OPTIONS,
  DIGITAL_AI_DELIVERY_OPTIONS,
  DIGITAL_AI_AUDIENCE_OPTIONS,
  DIGITAL_AI_CAPABILITY_OPTIONS,
  DIGITAL_AI_LANGUAGE_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import {
  getAllTaxonomyPositions,
} from '@/features/candidates/taxonomy/career-taxonomy';

export const CATEGORY_IDS = {
  yatirimBul: ids.category('c1000001-0001-4000-8000-000000000001'),
  yatirimYap: ids.category('c1000001-0001-4000-8000-000000000002'),
  isBul: ids.category('c1000001-0001-4000-8000-000000000003'),
  iseAl: ids.category('c1000001-0001-4000-8000-000000000004'),
  ortakBul: ids.category('c1000001-0001-4000-8000-000000000005'),
  bayilikAl: ids.category('c1000001-0001-4000-8000-000000000006'),
  genelIlan: ids.category('c1000001-0001-4000-8000-000000000007'),
  dijitalAi: ids.category('c1000001-0001-4000-8000-000000000008'),
} as const satisfies Record<string, CategoryId>;

export const LISTING_TYPE_IDS = {
  yatirimBulDefault: ids.listingType('lt000001-0001-4000-8000-000000000001'),
  yatirimYapDefault: ids.listingType('lt000001-0001-4000-8000-000000000002'),
  isBulDefault: ids.listingType('lt000001-0001-4000-8000-000000000003'),
  iseAlDefault: ids.listingType('lt000001-0001-4000-8000-000000000004'),
  ortakBulDefault: ids.listingType('lt000001-0001-4000-8000-000000000005'),
  franchiseGiveDefault: FRANCHISE_LISTING_TYPE_IDS.give,
  genelIlanDefault: ids.listingType('lt000001-0001-4000-8000-000000000007'),
  dijitalAiDefault: ids.listingType('d1000001-0001-4000-8000-000000000008'),
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

/** İş Arıyorum — anonim kariyer özeti (CV / firma adı yok). */
export const JOB_SEEKER_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'primarySector',
      label: 'Uzmanlık Sektörü',
      type: 'enum',
      required: true,
      options: [...JOB_SECTOR_OPTIONS],
    },
    {
      key: 'desiredRole',
      label: 'Aranan Pozisyon',
      type: 'enum',
      required: true,
      options: getAllTaxonomyPositions(),
    },
    {
      key: 'experienceLevel',
      label: 'Kariyer Seviyesi',
      type: 'enum',
      required: true,
      options: [...EXPERIENCE_LEVELS],
    },
    {
      key: 'workType',
      label: 'Çalışma Tercihi',
      type: 'enum',
      required: true,
      options: [...CAREER_WORK_TYPE_OPTIONS],
    },
    {
      key: 'profileGender',
      label: 'Cinsiyet',
      type: 'enum',
      required: true,
      options: [...CAREER_PROFILE_GENDER_OPTIONS],
    },
    {
      key: 'birthDate',
      label: 'Doğum tarihi',
      type: 'string',
      required: false,
      max: 10,
    },
    {
      key: 'residenceCity',
      label: 'Yaşadığı il',
      type: 'string',
      required: false,
      max: 100,
    },
    {
      key: 'residenceDistrict',
      label: 'Yaşadığı ilçe',
      type: 'string',
      required: false,
      max: 100,
    },
    {
      key: 'professionalSkills',
      label: 'Mesleki Yetkinlikler',
      type: 'string',
      required: true,
      min: 3,
      max: 1000,
    },
    {
      key: 'professionalSkillsOther',
      label: 'Mesleki Yetkinlik (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'technicalSkills',
      label: 'Teknik Yetkinlikler',
      type: 'string',
      required: false,
      max: 1000,
    },
    {
      key: 'technicalSkillsOther',
      label: 'Teknik Yetkinlik (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'leadershipExperience',
      label: 'Yönetim / Liderlik Deneyimi',
      type: 'string',
      required: false,
      max: 1000,
    },
    {
      key: 'tools',
      label: 'Kullanılan Araçlar / Programlar',
      type: 'string',
      required: false,
      max: 1500,
    },
    {
      key: 'toolsOther',
      label: 'Araç (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'educationLevel',
      label: 'Eğitim Seviyesi',
      type: 'enum',
      required: true,
      options: [...CAREER_EDUCATION_LEVELS],
    },
    {
      key: 'educationField',
      label: 'Bölüm / Alan',
      type: 'string',
      required: false,
      max: 200,
    },
    {
      key: 'educationFieldOther',
      label: 'Bölüm / Alan (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'languages',
      label: 'Yabancı Dil',
      type: 'string',
      required: false,
      max: 500,
    },
    {
      key: 'certificates',
      label: 'Sertifikalar',
      type: 'string',
      required: false,
      max: 500,
    },
    {
      key: 'certificatesOther',
      label: 'Sertifika (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'desiredRoleOther',
      label: 'Pozisyon Açıklaması',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'preferredSectors',
      label: 'İlgilenilen Sektörler',
      type: 'multi-enum',
      required: true,
      options: [...JOB_SECTOR_OPTIONS],
    },
    {
      key: 'sectorOther',
      label: 'Sektör Açıklaması',
      type: 'string',
      required: false,
      min: 30,
      max: 200,
    },
    {
      key: 'preferredRoles',
      label: 'Açık Olduğum Pozisyonlar',
      type: 'multi-enum',
      required: false,
      options: [...JOB_POSITION_OPTIONS],
    },
    {
      key: 'preferredCity',
      label: 'Tercih Edilen İl',
      type: 'string',
      required: true,
      max: 100,
    },
    {
      key: 'preferredDistrict',
      label: 'Tercih Edilen İlçe',
      type: 'string',
      required: false,
      max: 100,
    },
    {
      key: 'preferredDistrictOther',
      label: 'İlçe Açıklaması',
      type: 'string',
      required: false,
      max: 120,
    },
    {
      key: 'workplacePreference',
      label: 'Uzaktan / Hibrit / Ofis',
      type: 'enum',
      required: true,
      options: [...CAREER_WORKPLACE_OPTIONS],
    },
    {
      key: 'salaryExpectation',
      label: 'Ücret Beklentisi',
      type: 'enum',
      required: false,
      options: [...SALARY_RANGES],
    },
    {
      key: 'availability',
      label: 'İşe Başlama Uygunluğu',
      type: 'enum',
      required: true,
      options: [...CAREER_AVAILABILITY_OPTIONS],
    },
  ],
};

/** İş İlanları — işveren açık pozisyon ilanı (İş Arıyorum ile aynı taksonomi / eşleşme anahtarları). */
export const HIRING_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'primarySector',
      label: 'Sektör',
      type: 'enum',
      required: true,
      options: [...JOB_SECTOR_OPTIONS],
    },
    {
      key: 'desiredRole',
      label: 'Açık Pozisyon',
      type: 'enum',
      required: true,
      options: getAllTaxonomyPositions(),
    },
    {
      key: 'desiredRoleOther',
      label: 'Pozisyon Açıklaması',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'experienceLevel',
      label: 'Aranan Seviye',
      type: 'enum',
      required: true,
      options: [...EXPERIENCE_LEVELS],
    },
    {
      key: 'workType',
      label: 'Çalışma Tipi',
      type: 'enum',
      required: true,
      options: [...HIRING_WORK_TYPE_OPTIONS],
    },
    {
      key: 'requiredResponsibilities',
      label: 'Temel Sorumluluklar',
      type: 'string',
      required: true,
      min: 3,
      max: 2000,
    },
    {
      key: 'requiredResponsibilitiesOther',
      label: 'Sorumluluk (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 400,
    },
    {
      key: 'requiredAchievements',
      label: 'Başarı Beklentisi',
      type: 'string',
      required: false,
      max: 2000,
    },
    {
      key: 'requiredAchievementsOther',
      label: 'Başarı Beklentisi (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 400,
    },
    {
      key: 'professionalSkills',
      label: 'Aranan Mesleki Yetkinlikler',
      type: 'string',
      required: true,
      min: 3,
      max: 1000,
    },
    {
      key: 'professionalSkillsOther',
      label: 'Mesleki Yetkinlik (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'technicalSkills',
      label: 'Aranan Teknik Yetkinlikler',
      type: 'string',
      required: false,
      max: 1000,
    },
    {
      key: 'technicalSkillsOther',
      label: 'Teknik Yetkinlik (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'leadershipExperience',
      label: 'Yönetim Beklentisi',
      type: 'string',
      required: false,
      max: 1000,
    },
    {
      key: 'tools',
      label: 'Aranan Araçlar',
      type: 'string',
      required: false,
      max: 1500,
    },
    {
      key: 'toolsOther',
      label: 'Araç (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'educationLevel',
      label: 'Aranan Eğitim Seviyesi',
      type: 'enum',
      required: true,
      options: [...CAREER_EDUCATION_LEVELS],
    },
    {
      key: 'educationField',
      label: 'Tercih Edilen Bölüm',
      type: 'string',
      required: false,
      max: 200,
    },
    {
      key: 'educationFieldOther',
      label: 'Bölüm (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'languages',
      label: 'Aranan Dil',
      type: 'string',
      required: false,
      max: 500,
    },
    {
      key: 'certificates',
      label: 'Aranan Sertifikalar',
      type: 'string',
      required: false,
      max: 500,
    },
    {
      key: 'certificatesOther',
      label: 'Sertifika (Diğer)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'preferredCity',
      label: 'Çalışma İli',
      type: 'string',
      required: true,
      max: 100,
    },
    {
      key: 'preferredDistrict',
      label: 'Çalışma İlçesi',
      type: 'string',
      required: false,
      max: 100,
    },
    {
      key: 'preferredDistrictOther',
      label: 'İlçe Açıklaması',
      type: 'string',
      required: false,
      max: 120,
    },
    {
      key: 'workplacePreference',
      label: 'Çalışma Modeli',
      type: 'enum',
      required: true,
      options: [...CAREER_WORKPLACE_OPTIONS],
    },
    {
      key: 'salaryRange',
      label: 'Maaş Aralığı',
      type: 'enum',
      required: true,
      options: [...HIRING_SALARY_RANGES],
    },
    {
      key: 'availability',
      label: 'İşe Başlama',
      type: 'enum',
      required: true,
      options: [...CAREER_AVAILABILITY_OPTIONS],
    },
    {
      key: 'positionTitle',
      label: 'Pozisyon (eski)',
      type: 'enum',
      required: false,
      options: [...JOB_POSITION_OPTIONS],
    },
    {
      key: 'positionTitleOther',
      label: 'Pozisyon Açıklaması (eski)',
      type: 'string',
      required: false,
      min: 2,
      max: 200,
    },
    {
      key: 'district',
      label: 'İlçe (eski)',
      type: 'string',
      required: false,
      max: 100,
    },
    {
      key: 'districtOther',
      label: 'İlçe Açıklaması (eski)',
      type: 'string',
      required: false,
      max: 120,
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

/** Genel İlan — ürün, hizmet, duyuru ve fırsat ilanları */
export const GENERAL_LISTING_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'listingKind',
      label: 'İlan türü',
      type: 'enum',
      required: true,
      options: [...GENERAL_LISTING_TYPE_OPTIONS],
    },
    {
      key: 'condition',
      label: 'Durum',
      type: 'enum',
      required: true,
      options: [...GENERAL_LISTING_CONDITION_OPTIONS],
    },
    {
      key: 'priceRange',
      label: 'Fiyat / bütçe',
      type: 'enum',
      required: true,
      options: [...GENERAL_LISTING_PRICE_OPTIONS],
    },
    {
      key: 'sector',
      label: 'Sektör / alan',
      type: 'enum',
      required: false,
      options: [...INVESTOR_SECTOR_OPTIONS],
    },
  ],
};

/** Dijital & AI Çözümleri — yetenek kartları + ürün kimliği */
export const DIGITAL_AI_FIELD_SCHEMA: ListingFieldSchema = {
  fields: [
    {
      key: 'solutionType',
      label: 'Çözüm türü',
      type: 'enum',
      required: true,
      options: [...DIGITAL_AI_SOLUTION_TYPE_OPTIONS],
    },
    {
      key: 'deliveryModel',
      label: 'Teslim / iş modeli',
      type: 'enum',
      required: true,
      options: [...DIGITAL_AI_DELIVERY_OPTIONS],
    },
    {
      key: 'targetAudience',
      label: 'Hedef kitle',
      type: 'enum',
      required: true,
      options: [...DIGITAL_AI_AUDIENCE_OPTIONS],
    },
    {
      key: 'priceRange',
      label: 'Fiyat modeli / bütçe',
      type: 'enum',
      required: true,
      options: [...GENERAL_LISTING_PRICE_OPTIONS],
    },
    {
      key: 'demoUrl',
      label: 'Demo / ürün linki',
      type: 'string',
      required: false,
      max: 500,
    },
    {
      key: 'capabilities',
      label: 'Çözüm yetenekleri',
      type: 'multi-enum',
      required: true,
      options: [...DIGITAL_AI_CAPABILITY_OPTIONS],
    },
    {
      key: 'supportedLanguages',
      label: 'Desteklenen diller',
      type: 'multi-enum',
      required: false,
      options: [...DIGITAL_AI_LANGUAGE_OPTIONS],
    },
  ],
};

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
    description: 'Girişiminiz için yatırımcı bulun; tutar, aşama ve kullanım alanını paylaşın',
    fieldSchema: SEEKING_INVESTMENT_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.yatirimYapDefault,
    categoryId: CATEGORY_IDS.yatirimYap,
    slug: 'yatirim-yapiyorum',
    name: 'Yatırım Yapacağım',
    description: 'Yatırımcı profilinizi ve tercih ettiğiniz fırsatları yayınlayın',
    fieldSchema: INVESTOR_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.isBulDefault,
    categoryId: CATEGORY_IDS.isBul,
    slug: 'is-ariyorum',
    name: 'İş Arıyorum',
    description: 'Anonim kariyer özeti oluşturun; CV ve firma adı paylaşmadan işverenlere ulaşın',
    fieldSchema: JOB_SEEKER_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
    categoryId: CATEGORY_IDS.iseAl,
    slug: 'ise-aliyorum',
    name: 'İşe Alıyorum',
    description: 'Açık pozisyon yayınlayın; adaylar iletişim talebi gönderebilir',
    fieldSchema: HIRING_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    categoryId: CATEGORY_IDS.ortakBul,
    slug: 'ortak-ariyorum',
    name: 'Ortak Arıyorum',
    description: 'Kurucu veya iş ortağı arayın; uzmanlık ve taahhüt beklentinizi belirtin',
    fieldSchema: PARTNER_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
    categoryId: CATEGORY_IDS.bayilikAl,
    slug: 'franchise-ilan-ver',
    name: 'Franchise İlanları',
    description: 'Marka, yatırım ve lokasyon bilgileriyle franchise fırsatınızı yayınlayın',
    fieldSchema: FRANCHISE_GIVE_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
    categoryId: CATEGORY_IDS.dijitalAi,
    slug: 'dijital-ai-cozum',
    name: 'Dijital & AI Çözümleri',
    description: 'Ürün adını, kısa tanıtımı ve yetenek kartlarını ekleyerek çözümünüzü yayınlayın',
    fieldSchema: DIGITAL_AI_FIELD_SCHEMA,
    sortOrder: 1,
  },
  {
    listingTypeId: LISTING_TYPE_IDS.genelIlanDefault,
    categoryId: CATEGORY_IDS.genelIlan,
    slug: 'genel-ilan',
    name: 'Genel İlan',
    description: 'Ürün, hizmet, duyuru veya kampanya — diğer kategorilere uymayan ilanlar',
    fieldSchema: GENERAL_LISTING_FIELD_SCHEMA,
    sortOrder: 1,
  },
];

/**
 * Categories deferred from /ilan/olustur picker (schemas/configs kept for restore).
 * Restore by removing the id from this list (+ uncomment PICKER_ORDER entry).
 */
export const CREATE_LISTING_DEFERRED_CATEGORY_IDS: readonly CategoryId[] = [
  CATEGORY_IDS.yatirimYap,
  CATEGORY_IDS.genelIlan,
];

const CREATE_DEFERRED_SET = new Set<string>(CREATE_LISTING_DEFERRED_CATEGORY_IDS);

/** Categories selectable on /ilan/olustur (excludes deferred types). */
export const CREATE_LISTING_TYPE_CONFIGS: CategoryListingTypeConfig[] =
  LISTING_TYPE_CONFIGS.filter((config) => !CREATE_DEFERRED_SET.has(config.categoryId));

/** Map category slug → category ID */
export const CATEGORY_SLUG_TO_ID: Record<string, CategoryId> = {
  'yatirim-bul': CATEGORY_IDS.yatirimBul,
  'yatirim-yap': CATEGORY_IDS.yatirimYap,
  'is-bul': CATEGORY_IDS.isBul,
  'ise-al': CATEGORY_IDS.iseAl,
  'ortak-bul': CATEGORY_IDS.ortakBul,
  franchise: CATEGORY_IDS.bayilikAl,
  'bayilik-al': CATEGORY_IDS.bayilikAl,
  'dijital-ai': CATEGORY_IDS.dijitalAi,
  'genel-ilan': CATEGORY_IDS.genelIlan,
  ilan: CATEGORY_IDS.genelIlan,
};
