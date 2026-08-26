/**
 * Per-category step definitions for listing create/edit wizards.
 */
import type { CategoryId } from '@/lib/domain/ids';
import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';
import { getPartnerFormFieldKeys } from '@/features/founders/partnership-form';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';
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

export const STEP_PACKAGE_AND_PERMISSIONS: ListingFormStepDef = {
  id: 'package',
  title: 'Paket ve İzinler',
  description: 'Yayın paketi seçimi, iletişim ve yasal onaylar',
  package: true,
  kvkk: true,
  publish: true,
};

export const STEP_PREVIEW_AND_PUBLISH: ListingFormStepDef = STEP_PACKAGE_AND_PERMISSIONS;

export const STEP_CAREER_PREVIEW_AND_PUBLISH: ListingFormStepDef = {
  id: 'package',
  title: 'Paket ve İzinler',
  description: 'Yayın paketi seçimi, iletişim ve yasal onaylar',
  careerPreferenceEditor: true,
  customFieldKeys: [
    'workType',
    'workplacePreference',
    'preferredCity',
    'preferredDistrict',
    'preferredDistrictOther',
    'salaryExpectation',
    'availability',
  ],
  package: true,
  kvkk: true,
  publish: true,
};

/** Terminal flow with 4-step consolidation (isBul, iseAl, ortakBul) */
function withConsolidatedPublishFlow(...steps: ListingFormStepDef[]): ListingFormStepDef[] {
  return [
    ...steps,
    STEP_PACKAGE_AND_PERMISSIONS,
  ];
}

/** Terminal flow shared by all categories: paket seçimi + yasal izinler + yayınlama */
function withPublishFlow(...steps: ListingFormStepDef[]): ListingFormStepDef[] {
  return [
    ...steps,
    STEP_PACKAGE_AND_PERMISSIONS,
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
      description: 'Finansal büyüklükler, gelir, büyüme ve ekip.',
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
      title: 'Yatırım hedefi',
      description: 'Ne kadar arıyorsunuz, ne teklif ediyorsunuz, fonu nerede kullanacaksınız?',
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
      title: 'Özet ve Hikaye',
      description: 'Yatırımcının okuyacağı detaylı açıklama. İsteğe bağlı AI metin asistanı.',
      coreFields: ['longDescription'],
      customFieldKeys: [
        'pitchDeckUrl',
        'demoUrl',
        'financialProjectionsSummary',
        'exitStrategy',
        'competitiveAdvantage',
      ],
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
  [CATEGORY_IDS.ortakBul]: withConsolidatedPublishFlow(
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Girişim başlığı, kısa özet ve sektör',
      coreFields: ['title', 'shortDescription', 'city'],
    },
    {
      id: 'partnership',
      title: 'Girişim ve Ortaklık Tipi',
      description: 'Aradığınız ortaklık tipi, uzmanlık ve iş birliği beklentilerinizi belirleyin.',
      customFieldKeys: getPartnerFormFieldKeys('seeking'),
    },
    {
      id: 'details',
      title: 'Koşullar ve Detay',
      description: 'Detaylı açıklama, vizyon, ekip ve ortaklık modeli',
      coreFields: ['longDescription'],
      meta: ['images'],
    },
  ),
  [CATEGORY_IDS.isBul]: [
    {
      id: 'basics',
      title: 'Genel Bilgiler',
      description: 'Pozisyon, sektör, lokasyon ve demografi',
      cv: true,
      customFieldKeys: [
        'fullName',
        'primarySector',
        'desiredRole',
        'desiredRoleOther',
        'experienceLevel',
        'profileGender',
        'birthDate',
        'residenceCity',
        'residenceDistrict',
      ],
    },
    {
      id: 'experiences',
      title: 'Deneyimlerin',
      description: 'İş tecrübeleri ve sorumluluklar',
      experienceEditor: true,
      customFieldKeys: [],
    },
    {
      id: 'education',
      title: 'Eğitim ve Gelişim',
      description: 'Eğitim geçmişi, yabancı dil ve sertifikalar',
      careerEducationEditor: true,
      customFieldKeys: [],
    },
    {
      id: 'skills',
      title: 'Uzmanlıkların',
      description: 'Mesleki yetkinlikler ve teknik araçlar',
      careerSkillsEditor: true,
      customFieldKeys: [],
    },
    {
      id: 'preferences',
      title: 'Çalışma Tercihleri',
      description: 'Çalışma modeli, şehir, maaş ve başlangıç zamanı',
      careerPreferenceEditor: true,
      customFieldKeys: [
        'workType',
        'workplacePreference',
        'preferredCity',
        'preferredDistrict',
        'preferredDistrictOther',
        'salaryExpectation',
        'availability',
      ],
    },
    {
      id: 'summary',
      title: 'Kariyer Özeti',
      description: 'Profil özeti ve kontrolü',
      coreFields: ['longDescription'],
      customFieldKeys: [],
    },
    {
      id: 'package',
      title: 'Paket ve İzinler',
      description: 'Yayın paketi seçimi, iletişim ve yasal onaylar',
      package: true,
      kvkk: true,
      publish: true,
    },
  ],
  [CATEGORY_IDS.iseAl]: [
    {
      id: 'basics',
      title: 'Temel Bilgiler',
      description: 'Şirket, pozisyon, sektör ve seviye',
      customFieldKeys: [
        'companyName',
        'primarySector',
        'desiredRole',
        'desiredRoleOther',
        'experienceLevel',
      ],
    },
    {
      id: 'profile',
      title: 'Pozisyon ve Yetkinlikler',
      description: 'İş tanımı, aranan sorumluluklar ve yetkinlikler',
      hireRoleNeedsEditor: true,
      careerSkillsEditor: true,
      customFieldKeys: [],
    },
    {
      id: 'education',
      title: 'Eğitim ve Gelişim',
      description: 'Aranan eğitim seviyesi, yabancı dil ve sertifikalar',
      careerEducationEditor: true,
      customFieldKeys: [],
    },
    {
      id: 'offer',
      title: 'İlan Tercihleri',
      description: 'Lokasyon, çalışma modeli ve ücret aralığı',
      customFieldKeys: [
        'workType',
        'workplacePreference',
        'preferredCity',
        'preferredDistrict',
        'preferredDistrictOther',
        'salaryRange',
        'availability',
      ],
    },
    {
      id: 'description',
      title: 'İlan Detayları',
      description: 'İş ilanı genel açıklaması ve ek bilgiler',
      coreFields: ['longDescription'],
      customFieldKeys: [],
    },
    {
      id: 'package',
      title: 'Paket ve İzinler',
      description: 'Yayın paketi seçimi, iletişim ve yasal onaylar',
      package: true,
      kvkk: true,
      publish: true,
    },
  ],
  [CATEGORY_IDS.bayilikAl]: withConsolidatedPublishFlow(
    {
      id: 'basics',
      title: 'Marka ve Sektör',
      description: 'Marka adı, sektör ve kurumsal bilgiler',
      coreFields: ['title', 'shortDescription'],
      customFieldKeys: [
        'companyName',
        'establishmentYear',
        'sector',
        'businessCategory',
        'branchCount',
        'website',
        'originCountry',
        'preferredSectors',
        'budget',
      ],
    },
    {
      id: 'investment',
      title: 'Yatırım ve Koşullar',
      description: 'Toplam yatırım, isim hakkı, kâr marjı ve aranan şartlar',
      customFieldKeys: [
        'totalInvestment',
        'entryFee',
        'franchiseFee',
        'profitMargin',
        'royaltyFee',
        'advertisingFee',
        'returnPeriod',
        'averageSetupDuration',
        'minCapitalRequirement',
        'experienceRequirement',
        'educationRequirement',
        'companyEstablishmentRequired',
        'guaranteeRequirement',
        'trainingSupport',
        'operationalSupport',
        'marketingSupport',
        'workingHours',
      ],
    },
    {
      id: 'details',
      title: 'Lokasyon ve Detaylar',
      description: 'Hedef lokasyonlar, mağaza tipi ve detaylı açıklama',
      coreFields: ['longDescription', 'city'],
      customFieldKeys: [
        'availableCities',
        'districts',
        'minPopulation',
        'storeSize',
        'minSquareMeters',
        'mallAvailable',
        'streetStoreAvailable',
        'targetCities',
        'preferredLocation',
        'experience',
        'introductionVideoUrl',
        'presentationPdfUrl',
        'sampleContractUrl',
      ],
      meta: ['images'],
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
  [CATEGORY_IDS.isletmeDevri]: withConsolidatedPublishFlow(
    {
      id: 'basics',
      title: 'İşletme Bilgileri',
      description: 'İşletme adı, türü ve ana sektör',
      coreFields: ['title', 'shortDescription'],
      customFieldKeys: [
        'businessName',
        'businessType',
        'businessTypeOther',
        'sector',
        'preferredBusinessTypes',
        'preferredBusinessTypesOther',
        'preferredSectors',
      ],
    },
    {
      id: 'financials',
      title: 'Devir ve Finansal Koşullar',
      description: 'Devir bedeli, bütçe, kira ve faaliyet durumu',
      customFieldKeys: [
        'transferPrice',
        'budgetMax',
        'monthlyRent',
        'businessAge',
        'employeeCount',
        'operationalStatus',
        'preferredStatus',
        'operationalPreference',
      ],
    },
    {
      id: 'details',
      title: 'Kapsam ve Lokasyon',
      description: 'Lokasyon, devir kapsamı ve detaylı açıklama',
      coreFields: ['longDescription', 'city'],
      customFieldKeys: [
        'district',
        'transferScope',
        'reasonForTransfer',
        'postTransferSupport',
        'relevantExperience',
        'financialSummary',
      ],
      meta: ['images'],
    },
  ),
};

export function getListingFormSteps(
  categoryId: CategoryId,
  options?: { partnershipIntent?: PartnershipIntent },
): ListingFormStepDef[] {
  if (categoryId === CATEGORY_IDS.ortakBul) {
    const intent = options?.partnershipIntent ?? 'seeking';
    const keys = getPartnerFormFieldKeys(intent);
    if (intent === 'joining') {
      const basicCustomKeys = [
        'sectors',
        'sectorOther',
        'partnershipType',
        'projectStage',
        'commitment',
        'experience',
        'equityOffered',
      ].filter((k) => keys.includes(k));
      const partnerCustomKeys = [
        'partnershipTypes',
        'partnershipTypesOther',
        'professionalSkills',
        'professionalSkillsOther',
        'technicalSkills',
        'technicalSkillsOther',
        'tools',
        'toolsOther',
        'expertise',
        'expertiseOther',
        'offeredSkills',
        'offeredSkillsOther',
      ].filter((k) => keys.includes(k));
      return withConsolidatedPublishFlow(
        {
          id: 'basics',
          title: 'Profiliniz',
          description: 'Kartlarda görünecek başlık ve kısa tanıtım',
          coreFields: ['title', 'shortDescription'],
          customFieldKeys: basicCustomKeys.length > 0 ? basicCustomKeys : keys,
        },
        {
          id: 'partnership',
          title: 'Sunduğum Değer ve Yetkinlikler',
          description: 'Ortaklık modeli, uzmanlık, yetkinlik ve kullanabildiğiniz araçları belirleyin.',
          customFieldKeys: partnerCustomKeys.length > 0 ? partnerCustomKeys : keys,
        },
        {
          id: 'details',
          title: 'Kendinizi Tanıtın',
          description: 'Kısa profil, lokasyon, deneyimler ve detaylı açıklama',
          coreFields: ['longDescription', 'city'],
          meta: ['images'],
        },
      );
    }
    const basicCustomKeys = ['sector', 'projectStage', 'partnershipType', 'commitment', 'equityOffered'].filter((k) => keys.includes(k));
    const partnerCustomKeys = ['expertise', 'expertiseOther'].filter((k) => keys.includes(k));
    return withConsolidatedPublishFlow(
      {
        id: 'basics',
        title: 'Temel Bilgiler',
        description: 'Girişim başlığı, kısa özet ve sektör',
        coreFields: ['title', 'shortDescription'],
        customFieldKeys: basicCustomKeys.length > 0 ? basicCustomKeys : keys,
      },
      {
        id: 'partnership',
        title: 'Girişim ve Ortaklık Tipi',
        description: 'Aradığınız ortaklık tipi, uzmanlık ve iş birliği beklentilerinizi belirleyin.',
        customFieldKeys: partnerCustomKeys.length > 0 ? partnerCustomKeys : keys,
      },
      {
        id: 'details',
        title: 'Koşullar ve Detay',
        description: 'Detaylı açıklama, vizyon, ekip, konum ve ortaklık modeli',
        coreFields: ['longDescription', 'city'],
        meta: ['images'],
      },
    );
  }

  return LISTING_FORM_STEPS[categoryId] ?? withConsolidatedPublishFlow(
    STEP_BASICS,
    STEP_DETAILS,
    { id: 'custom', title: 'Ek Bilgiler', customFieldKeys: 'all' },
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
    if (step.publish || step.package || (step.preview && !step.coreFields && !step.customFieldKeys) || (step.kvkk && !step.coreFields && !step.customFieldKeys) || (step.cv && !step.customFieldKeys && !step.coreFields)) continue;

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
