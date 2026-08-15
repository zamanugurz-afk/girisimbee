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
  /** CV upload step (legacy — unused by anonymous career profile) */
  cv?: boolean;
  /** KVKK consent step (job seeker legacy) */
  kvkk?: boolean;
  /** Anonymous multi-experience editor (İş Arıyorum) */
  experienceEditor?: boolean;
  /** Taxonomy-driven skills picker (İş Arıyorum / İşe Alıyorum) */
  careerSkillsEditor?: boolean;
  /** Education field + languages + certificates editors */
  careerEducationEditor?: boolean;
  /** Experience-ranked preferred sector / role pickers (İş Arıyorum) */
  careerPreferenceEditor?: boolean;
  /** Hire: position-catalog responsibilities / expected achievements */
  hireRoleNeedsEditor?: boolean;
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
  description:
    'Standart yayın 30 gün ve kategori başına 1 ücretsizdir. Ek ilan / yenileme 99 TL. İsterseniz Vitrin veya Acil doping ekleyebilirsiniz.',
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
      id: 'identity',
      title: 'Girişim kimliği',
      description: 'Bu girişim kim? Ad, sektör, model, müşteri ve konum.',
      coreFields: ['title', 'city'],
      customFieldKeys: [
        'productName',
        'sector',
        'businessModel',
        'targetCustomer',
        'foundedYear',
      ],
    },
    {
      id: 'product-market',
      title: 'Ürün',
      description: 'Ne problemi nasıl çözüyorsunuz? Ürün şu anda hangi durumda?',
      customFieldKeys: [
        'problem',
        'solution',
        'differentiation',
        'productStatus',
      ],
    },
    {
      id: 'traction',
      title: 'Bugünkü durum',
      description: 'Bugün bunu destekleyen hangi kanıtlar var? Rakam yoksa boş bırakın.',
      customFieldKeys: [
        'revenueStatus',
        'tractionStatus',
        'monthlyRevenue',
        'mrr',
        'activeCustomers',
        'users',
        'growthRate',
        'gmv',
      ],
    },
    {
      id: 'funding',
      title: 'Yatırım talebi',
      description: 'Ne kadar yatırım arıyorsunuz ve karşılığında ne sunuyorsunuz?',
      customFieldKeys: [
        'stage',
        'investmentAmount',
        'investmentAmountCustom',
        'equityOffered',
        'valuation',
        'useOfFunds',
        'useOfFundsDetail',
      ],
    },
    {
      id: 'summary',
      title: 'Ekip ve yatırımcı özeti',
      description:
        'Kim yapıyor ve yatırımcı ne görmeli? Özet yapılandırılmış veriden üretilir; AI isteğe bağlıdır.',
      leadCustomFieldKeys: ['founderCount', 'teamSize', 'founderExpertise'],
      customFieldKeys: ['founderCount', 'teamSize', 'founderExpertise'],
      coreFields: ['shortDescription', 'longDescription'],
    },
    STEP_IMAGES,
  ),
  [CATEGORY_IDS.yatirimYap]: withPublishFlow(
    {
      id: 'identity',
      title: 'Yatırımcı kimliği',
      description: 'Profil başlığı, yatırımcı tipi ve coğrafya',
      coreFields: ['title'],
      customFieldKeys: ['investorType', 'preferredGeographies'],
    },
    {
      id: 'criteria',
      title: 'Yatırım kriterleri',
      description: 'Sektör, ürün, iş modeli, müşteri ve traction beklentisi',
      customFieldKeys: [
        'sectors',
        'preferredProductStatuses',
        'preferredBusinessModels',
        'preferredTargetCustomers',
        'revenueExpectation',
        'tractionExpectation',
      ],
    },
    {
      id: 'ticket',
      title: 'Bilet ve aşama',
      description: 'Yatırım bileti ve tercih ettiğiniz girişim aşamaları — birden fazla seçebilirsiniz',
      customFieldKeys: [
        'investmentAmount',
        'investmentAmountCustom',
        'ticketMin',
        'ticketMax',
        'preferredStages',
      ],
    },
    {
      id: 'thesis',
      title: 'Tez ve özet',
      description: 'Hisse / değerleme yaklaşımı, kısa tez ve yatırımcı özeti. AI isteğe bağlıdır.',
      customFieldKeys: [
        'equityPreference',
        'valuationApproach',
        'preferredUseOfFunds',
        'investmentThesis',
        'mustHaveSignals',
        'dealBreakers',
      ],
      coreFields: ['shortDescription', 'longDescription'],
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
      description: 'Vizyon, ekip, konum ve ortaklık beklentinizi anlatın',
      coreFields: ['longDescription', 'city'],
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
      description: 'Sektör, pozisyon, seviye ve kamuya kapalı kişisel bilgiler',
      customFieldKeys: [
        'primarySector',
        'desiredRole',
        'desiredRoleOther',
        'experienceLevel',
        'workType',
        'profileGender',
        'birthDate',
        'residenceCity',
        'residenceDistrict',
      ],
    },
    {
      id: 'experience',
      title: 'Deneyim',
      description: 'Sektör, pozisyon ve tarihlerle kariyer deneyimlerinizi ekleyin',
      experienceEditor: true,
    },
    {
      id: 'skills',
      title: 'Yetkinlikler',
      description: 'Mesleki ve teknik yetkinlikler, araçlar',
      // Rendered by CareerSkillsEditor (taxonomy multi-select)
      customFieldKeys: [],
      careerSkillsEditor: true,
    },
    {
      id: 'education',
      title: 'Eğitim & Dil',
      description: 'Eğitim seviyesi, dil ve sertifikalar — belge yükleme yok',
      customFieldKeys: [],
      careerEducationEditor: true,
    },
    {
      id: 'preferences',
      title: 'Kariyer Tercihleri',
      description: 'Deneyiminize göre ilgili sektör ve pozisyonlar — listede yoksa kendiniz yazın',
      customFieldKeys: [
        'preferredCity',
        'preferredDistrict',
        'preferredDistrictOther',
        'workplacePreference',
        'salaryExpectation',
        'availability',
      ],
      careerPreferenceEditor: true,
    },
    {
      id: 'summary',
      title: 'Kariyer Özeti',
      description:
        'Kendinizi profesyonelce anlatın. Telefon, e-posta, adres, firma adı veya sosyal medya yazmayın.',
      coreFields: ['longDescription'],
    },
  ),
  [CATEGORY_IDS.iseAl]: withPublishFlow(
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Sektör, açık pozisyon, aranan seviye ve çalışma tipi',
      customFieldKeys: [
        'primarySector',
        'desiredRole',
        'desiredRoleOther',
        'experienceLevel',
        'workType',
      ],
    },
    {
      id: 'role',
      title: 'İş Tanımı',
      description: 'Pozisyona göre sorumluluk ve başarı beklentisi — aday kartıyla aynı katalog',
      customFieldKeys: [],
      hireRoleNeedsEditor: true,
    },
    {
      id: 'skills',
      title: 'Aranan Yetkinlikler',
      description: 'Mesleki ve teknik yetkinlikler, araçlar',
      customFieldKeys: [],
      careerSkillsEditor: true,
    },
    {
      id: 'education',
      title: 'Eğitim & Dil',
      description: 'Aranan eğitim, dil ve sertifikalar',
      customFieldKeys: [],
      careerEducationEditor: true,
    },
    {
      id: 'offer',
      title: 'Teklif ve Konum',
      description: 'İl / ilçe, çalışma modeli, ücret ve başlama zamanı',
      customFieldKeys: [
        'preferredCity',
        'preferredDistrict',
        'preferredDistrictOther',
        'workplacePreference',
        'salaryRange',
        'availability',
      ],
    },
    {
      id: 'summary',
      title: 'Pozisyon Özeti',
      description:
        'İlan metni otomatik doldurulur; düzenleyebilirsiniz. Telefon, e-posta veya firma adı yazmayın.',
      coreFields: ['longDescription'],
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
      description: 'Yatırım bütçesi, giriş / isim hakkı bedeli ve geri dönüş beklentileri',
      customFieldKeys: [
        'totalInvestment',
        'entryFee',
        'franchiseFee',
        'profitMargin',
        'royaltyFee',
        'advertisingFee',
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
        'minPopulation',
        'storeSize',
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

    if (step.experienceEditor) {
      paths.add('customFields.experiences');
      paths.add('experiences');
    }

    if (step.hireRoleNeedsEditor) {
      for (const key of [
        'requiredResponsibilities',
        'requiredResponsibilitiesOther',
        'requiredAchievements',
        'requiredAchievementsOther',
      ]) {
        paths.add(`customFields.${key}`);
        paths.add(key);
      }
    }

    if (step.careerSkillsEditor) {
      for (const key of [
        'professionalSkills',
        'professionalSkillsOther',
        'technicalSkills',
        'technicalSkillsOther',
        'leadershipExperience',
        'tools',
        'toolsOther',
      ]) {
        paths.add(`customFields.${key}`);
        paths.add(key);
      }
    }

    if (step.careerEducationEditor) {
      for (const key of [
        'educationLevel',
        'educationField',
        'educationFieldOther',
        'languages',
        'certificates',
        'certificatesOther',
      ]) {
        paths.add(`customFields.${key}`);
        paths.add(key);
      }
    }

    if (step.careerPreferenceEditor) {
      for (const key of [
        'preferredSectors',
        'sectorOther',
        'preferredRoles',
        'preferredRolesOther',
      ]) {
        paths.add(`customFields.${key}`);
        paths.add(key);
      }
    }

    step.meta?.forEach((key) => paths.add(key));
  }

  return paths;
}
