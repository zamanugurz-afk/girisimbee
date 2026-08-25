/** UI metadata for listing form fields — helpers, placeholders, limits, tooltips. */
import type { CategoryId } from '@/lib/domain/ids';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';

export interface FieldUiMeta {
  helperText?: string;
  placeholder?: string;
  maxLength?: number;
}

/** Neutral defaults — prefer category overrides via getCoreFieldUiForCategory. */
export const CORE_FIELD_UI: Record<string, FieldUiMeta> = {
  title: {
    placeholder: 'Örn: İlan başlığınızı yazın',
    maxLength: 200,
  },
  shortDescription: {
    placeholder: 'İlanınızı 2-3 cümlede özetleyin…',
    maxLength: 500,
  },
  longDescription: {
    placeholder: 'Detaylı açıklama, kapsam ve ek bilgiler…',
    maxLength: 10000,
  },
  city: {
    placeholder: 'Şehir seçin',
  },
  remotePolicy: {
    placeholder: 'Çalışma modeli seçin',
  },
};

type CoreFieldUiMap = Partial<Record<keyof CoreListingFieldsInput, FieldUiMeta>>;

/** Category-specific placeholders & limits for core listing fields (cards + form). */
export const CORE_FIELD_UI_BY_CATEGORY: Partial<Record<CategoryId, CoreFieldUiMap>> = {
  [CATEGORY_IDS.yatirimBul]: {
    title: {
      placeholder: 'Örn: PulseAI — Otonom Müşteri Destek Platformu',
      maxLength: 80,
    },
    shortDescription: {
      placeholder:
        'Örn: E-ticaret markaları için 7/24 otonom destek sağlayan LLM tabanlı AI platformu. 140.000 TL MRR ile tohum öncesi yatırım arıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: MVP tamamlandı, 15+ kurumsal müşteri aktif kullanıyor. Hedefimiz 12 ay içinde MENA ve Avrupa pazarına açılmak. Alınacak yatırım büyüme ve mühendislik ekibine ayrılacaktır.',
      maxLength: 2000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.yatirimYap]: {
    title: {
      placeholder: 'Örn: Erken Aşama B2B SaaS ve Yapay Zeka Yatırımcısı',
      maxLength: 80,
    },
    shortDescription: {
      placeholder:
        'Örn: Tohum öncesi ve tohum aşamasındaki AI, Fintech ve B2B SaaS girişimlerine 500K - 3M TL aralığında yatırım ve büyüme mentörlüğü sağlıyorum.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: 10+ yıllık girişimcilik ve melek yatırımcılık tecrübemle; doğrulanmış ürün-pazar uyumu (PMF) yakalayan, ölçeklenebilir ve global vizyona sahip kurucu ekipleri destekliyorum.',
      maxLength: 2000,
    },
  },
  [CATEGORY_IDS.iseAl]: {
    title: {
      placeholder: 'Örn: Kıdemli Full-Stack Geliştirici (React & Node.js) — Hibrit İstanbul',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Hızlı büyüyen fintech ekibimize mikroservis mimarisi ve modern web teknolojilerinde deneyimli Kıdemli Yazılım Geliştirici arıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Yüksek trafikli finansal ürünlerimizin geliştirilmesinde mimari kararlara yön verecek, temiz kod ve test odaklı çalışan takım arkadaşı arıyoruz. Hibrit çalışma modeli ve rekabetçi yan haklar sunulmaktadır.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'İl seçin',
    },
    remotePolicy: {
      placeholder: 'Çalışma modeli seçin',
    },
  },
  [CATEGORY_IDS.isBul]: {
    title: {
      placeholder: 'Örn: Kıdemli Frontend & Mobil Geliştirici — Uzaktan / Hibrit',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: 6+ yıl React, Next.js ve React Native deneyimimle ölçeklenebilir dijital ürünler geliştirdim. Uzaktan veya İstanbul içi hibrit fırsatlara açığım.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: SaaS ve e-ticaret alanında uçtan uca kullanıcı deneyimi ve performans optimizasyonu projeleri yönettim. Modern JavaScript ekosistemine, TypeScript ve tasarım sistemlerine hakimim. Ürün odaklı ekiplerde liderlik veya kıdemli geliştirici rollerini hedefliyorum.',
      maxLength: 10000,
    },
  },
  [CATEGORY_IDS.ortakBul]: {
    title: {
      placeholder: 'Örn: B2B Yapay Zeka SaaS Girişimimize Teknik Kurucu Ortak (CTO)',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: MVP aşamasını tamamladığımız yapay zeka tabanlı B2B SaaS ürünümüz için teknik mimariyi yönetecek, hisse ortaklı CTO arıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Halihazırda 500+ aktif beta kullanıcımız ve doğrulanmış pazar talebimiz bulunmaktadır. İş geliştirme ve satış tarafı hazır olup, backend/AI altyapısını ölçekleyecek tam zamanlı teknik kurucu ortak arıyoruz. Equity payı ve yol haritası ilk görüşmede şeffafça paylaşılacaktır.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.bayilikAl]: {
    title: {
      placeholder: 'Örn: Yeni Nesil 3. Dalga Nitelikli Kahve Franchise Fırsatı',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: 8 ilde 25+ şubesiyle hızla büyüyen zincirimizde anahtar teslim kurulum, barista eğitimi ve yüksek kâr marjıyla yeni franchise ortakları arıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Markamız premium kahve ve taze atıştırmalık segmentinde hizmet vermektedir. Franchise paketine lokasyon analizi, mimari projelendirme, merkezi tedarik, dijital POS ve sürekli operasyonel eğitim dahildir. Ortalama geri dönüş süresi 12-18 aydır.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.dijitalAi]: {
    title: {
      placeholder: 'Örn: E-Ticaret Ekipleri İçin Yapay Zeka Görsel & Metin Üretim Aracı',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Ürün fotoğraflarını saniyeler içinde stüdyo kalitesinde görsellere dönüştüren ve SEO uyumlu açıklamalar yazan AI platformu; aylık SaaS modeli.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Shopify, Ticimax ve WooCommerce ile tam entegre çalışır. Otomatik arka plan temizleme, manken giydirme ve 10+ dilde ürün açıklaması oluşturma özelliklerine sahiptir. 14 gün ücretsiz deneme ve kurumsal API desteği sunulmaktadır.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.genelIlan]: {
    title: {
      placeholder: 'Örn: Tam Donanımlı Ofis Mobilyaları & Çalışma İstasyonları Seti',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Çok az kullanılmış, ergonomik çalışma masaları ve yönetici koltukları seti; faturalı ve toplu alıma uygundur.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Ürünler birinci sınıf malzemeden üretilmiş olup taşınma nedeniyle devredilmektedir. Toplu alımda özel indirim sağlanır. İstanbul içi nakliye ve montaj konusunda yardımcı olunur.',
      maxLength: 10000,
    },
  },
};

export const CORE_FIELD_LABELS_BY_CATEGORY: Partial<
  Record<CategoryId, Partial<Record<keyof CoreListingFieldsInput, string>>>
> = {
  [CATEGORY_IDS.isBul]: {
    longDescription: 'Kariyer özeti önerisi',
  },
  [CATEGORY_IDS.bayilikAl]: {
    shortDescription: 'Firma Hakkında',
  },
  [CATEGORY_IDS.dijitalAi]: {
    title: 'Ürün / çözüm adı',
    shortDescription: 'Kısa tanıtım',
    longDescription: 'Detaylı kapsam',
  },
  [CATEGORY_IDS.iseAl]: {
    longDescription: 'Pozisyon özeti',
  },
  [CATEGORY_IDS.yatirimBul]: {
    title: 'Girişim adı',
    shortDescription: 'Kısa yatırımcı özeti',
    longDescription: 'Yatırımcı özeti',
  },
  [CATEGORY_IDS.yatirimYap]: {
    title: 'Yatırımcı kimliği',
    shortDescription: 'Kısa yatırımcı özeti',
    longDescription: 'Yatırımcı özeti',
  },
  [CATEGORY_IDS.ortakBul]: {
    title: 'Ortaklık Başlığı',
    shortDescription: 'Kısa Açıklama',
  },
};

export const CUSTOM_FIELD_UI: Record<string, FieldUiMeta> = {
  investmentAmount: {
    placeholder: 'Yatırım tutarı aralığı seçin',
  },
  investmentAmountCustom: {
    placeholder: 'Örn: 2.500.000 TL',
    maxLength: 60,
  },
  equityOffered: {
    placeholder: 'Örn: 15',
  },
  valuation: {
    placeholder: 'Örn: 25.000.000 TL',
    maxLength: 60,
  },
  stage: {
    placeholder: 'Gelişim aşamasını seçin',
  },
  sector: {
    placeholder: 'Sektör seçin',
  },
  productStatus: {
    placeholder: 'Ürün durumunu seçin',
  },
  productName: {
    placeholder: 'Örn: PulseAI',
    maxLength: 80,
  },
  foundedYear: {
    placeholder: 'Örn: 2024',
    maxLength: 4,
  },
  businessModel: {},
  targetCustomer: {},
  problem: {
    placeholder: 'Örn: KOBİ ve e-ticaret markaları müşteri destek maliyetlerini ve gece taleplerini yönetemiyor.',
    maxLength: 280,
  },
  solution: {
    placeholder: 'Örn: Çok dilli, CRM entegre LLM tabanlı otonom destek asistanı ile taleplerin %70\'ini anında çözüyoruz.',
    maxLength: 280,
  },
  differentiation: {
    placeholder: 'Örn: 5 dakikada tek tıkla e-ticaret altyapılarına kurulur, geçmiş konuşmalardan kendi kendine öğrenir.',
    maxLength: 280,
  },
  revenueStatus: {
    placeholder: 'Gelir durumunu seçin',
  },
  tractionStatus: {
    placeholder: 'Mevcut pazar durumunu seçin',
  },
  monthlyRevenue: {
    placeholder: 'Örn: 150.000 TL',
    maxLength: 40,
  },
  mrr: {
    placeholder: 'Örn: 150.000 TL',
    maxLength: 40,
  },
  arr: {
    placeholder: 'Örn: 1.800.000 TL',
    maxLength: 40,
  },
  activeCustomers: {
    placeholder: 'Örn: 35',
    maxLength: 40,
  },
  totalCustomers: {
    placeholder: 'Örn: 75',
    maxLength: 40,
  },
  users: {
    placeholder: 'Örn: 5.000',
    maxLength: 40,
  },
  growthRate: {
    placeholder: 'Örn: 20',
    maxLength: 40,
  },
  gmv: {
    placeholder: 'Örn: 1.200.000 TL',
    maxLength: 40,
  },
  founderCount: {
    placeholder: 'Kurucu sayısı',
  },
  teamSize: {
    placeholder: 'Ekip büyüklüğü',
  },
  founderExpertise: {},
  useOfFundsDetail: {
    placeholder: 'Örn: %50 Yazılım ve AI mühendisliği, %30 Büyüme ve pazarlama, %20 Operasyon.',
    maxLength: 280,
  },
  minInvestment: {
    placeholder: 'Minimum yatırım aralığı seçin',
  },
  maxInvestment: {
    placeholder: 'Maksimum yatırım aralığı seçin',
  },
  useOfFunds: {},
  currency: {
    placeholder: 'Para birimi seçin',
  },
  ticketSizeMin: {
    placeholder: 'Minimum bilet aralığı seçin',
  },
  ticketSizeMax: {
    placeholder: 'Maksimum bilet aralığı seçin',
  },
  preferredStages: {
    placeholder: 'Aşama seçin',
  },
  sectors: {},
  investorType: {
    placeholder: 'Yatırımcı tipi seçin',
  },
  preferredProductStatuses: {},
  preferredBusinessModels: {},
  preferredTargetCustomers: {},
  revenueExpectation: {
    placeholder: 'Gelir beklentisi',
  },
  tractionExpectation: {
    placeholder: 'Traction beklentisi',
  },
  preferredGeographies: {},
  equityPreference: {
    placeholder: 'Hisse yaklaşımı',
  },
  valuationApproach: {
    placeholder: 'Değerleme yaklaşımı',
  },
  preferredUseOfFunds: {},
  investmentThesis: {
    placeholder: 'Örn: Yüksek büyüme potansiyeline sahip tohum öncesi B2B SaaS ve yapay zeka girişimlerine odaklanıyoruz.',
    maxLength: 280,
  },
  mustHaveSignals: {},
  dealBreakers: {},
  ticketMin: {
    placeholder: 'Örn: 500.000 TL',
  },
  ticketMax: {
    placeholder: 'Örn: 3.000.000 TL',
  },
  investmentFocus: {
    placeholder: 'Örn: Erken aşama B2B SaaS, yapay zeka ve fintech odaklı tohum yatırımları.',
    maxLength: 500,
  },
  desiredRole: {
    placeholder: 'Pozisyon seçin',
  },
  primarySector: {
    placeholder: 'Sektör seçin',
  },
  desiredRoleOther: {
    placeholder: 'Örn: Yapay Zeka Mühendisi / Prompt Engineer',
    maxLength: 200,
  },
  experienceLevel: {
    placeholder: 'Deneyim seviyesi seçin',
  },
  salaryRange: {
    placeholder: 'Maaş aralığı seçin',
  },
  expertise: {},
  offeredSkills: {},
  experience: {
    placeholder: 'Deneyim süresini seçin',
  },
  salaryExpectation: {
    placeholder: 'Maaş beklentisi aralığı seçin',
  },
  workType: {
    placeholder: 'Çalışma tipi seçin',
  },
  profileGender: {
    placeholder: 'Cinsiyet seçin',
  },
  birthDate: {
    placeholder: 'Doğum tarihi',
  },
  residenceCity: {
    placeholder: 'Yaşadığınız ili seçin',
  },
  fullName: {
    placeholder: 'Örn: Caner Yılmaz',
  },
  residenceDistrict: {
    placeholder: 'Yaşadığınız ilçeyi seçin',
  },
  remotePreference: {
    placeholder: 'Uzaktan çalışma tercihi seçin',
  },
  workplacePreference: {
    placeholder: 'Çalışma modeli seçin',
  },
  positionTitle: {
    placeholder: 'Pozisyon seçin',
  },
  positionTitleOther: {
    placeholder: 'Örn: Büyüme ve Performans Pazarlama Lideri',
    maxLength: 200,
  },
  preferredCity: {
    placeholder: 'İl seçin',
  },
  preferredDistrict: {
    placeholder: 'İlçe seçin',
  },
  preferredDistrictOther: {
    placeholder: 'Örn: Mahalle / Semt adı',
    maxLength: 120,
  },
  district: {
    placeholder: 'İlçe seçin',
  },
  districtOther: {
    placeholder: 'Örn: Mahalle / Semt adı',
    maxLength: 120,
  },
  professionalSkills: {
    placeholder: 'Listeden seçin',
    maxLength: 1000,
  },
  technicalSkills: {
    placeholder: 'Örn: React, Next.js, TypeScript, TailwindCSS, Node.js, PostgreSQL, Docker',
    maxLength: 1000,
  },
  leadershipExperience: {
    placeholder: 'Örn: 6 kişilik frontend ve mobil mühendislik ekibine teknik liderlik ve sprint yönetimi yaptım.',
    maxLength: 1000,
  },
  tools: {
    placeholder: 'Listeden seçin',
    maxLength: 1500,
  },
  educationField: {
    placeholder: 'Örn: Bilgisayar Mühendisliği / Yazılım Mühendisliği',
    maxLength: 200,
  },
  languages: {
    placeholder: 'Örn: İngilizce (İleri Düzey), Almanca (Orta Seviye)',
    maxLength: 500,
  },
  certificates: {
    placeholder: 'Örn: AWS Certified Solutions Architect, Google Cloud Professional, PMP',
    maxLength: 500,
  },
  preferredSectors: {},
  preferredRoles: {},
  preferredRolesOther: {
    placeholder: 'Örn: Teknik Ürün Yöneticisi (Technical Product Manager)',
    maxLength: 200,
  },
  sectorOther: {
    placeholder: 'Örn: Yapay Zeka ve Otonom Araç Sistemleri',
    maxLength: 200,
  },
  partnershipType: {
    placeholder: 'Ortaklık tipi seçin',
  },
  commitment: {
    placeholder: 'Çalışma biçimini seçin',
  },
  projectStage: {
    placeholder: 'Ortaklık aşamasını seçin',
  },
  companyName: {
    placeholder: 'Örn: Novatech Yazılım Teknolojileri A.Ş.',
    maxLength: 120,
  },
  establishmentYear: {
    placeholder: 'Örn: 2018',
  },
  branchCount: {
    placeholder: 'Örn: 28',
  },
  website: {
    placeholder: 'https://ornek.com',
    maxLength: 500,
  },
  entryFee: {
    placeholder: '0 TL',
  },
  franchiseFee: {
    placeholder: '0 TL',
  },
  totalInvestment: {
    placeholder: '0 TL',
  },
  profitMargin: {
    placeholder: 'Örn: 35',
  },
  royaltyFee: {
    placeholder: 'Örn: 4',
  },
  advertisingFee: {
    placeholder: 'Örn: 2',
  },
  returnPeriod: {
    placeholder: 'Geri dönüş süresi seçin',
  },
  averageSetupDuration: {
    placeholder: 'Kurulum süresi seçin',
  },
  minSquareMeters: {
    placeholder: 'Örn: 90',
  },
  availableCities: {},
  districts: {
    placeholder: 'Örn: Kadıköy, Beşiktaş, Çankaya, Nilüfer',
    maxLength: 500,
  },
  minPopulation: {
    placeholder: 'Örn: 150.000',
  },
  storeSize: {
    placeholder: 'Mağaza büyüklüğü seçin',
  },
  businessCategory: {
    placeholder: 'İş kategorisi seçin',
  },
  workingHours: {
    placeholder: 'Örn: 08:30 – 22:30',
    maxLength: 200,
  },
  guaranteeRequirement: {
    placeholder: 'Örn: 150.000 TL teminat mektubu veya eşdeğer kefalet.',
    maxLength: 500,
  },
  introductionVideoUrl: {
    placeholder: 'https://youtube.com/watch?v=...',
    maxLength: 500,
  },
  presentationPdfUrl: {
    placeholder: 'https://...',
    maxLength: 500,
  },
  sampleContractUrl: {
    placeholder: 'https://...',
    maxLength: 500,
  },
  solutionType: {
    placeholder: 'Çözüm türünü seçin',
  },
  deliveryModel: {
    placeholder: 'Teslim modelini seçin',
  },
  targetAudience: {
    placeholder: 'Hedef kitleyi seçin',
  },
  priceRange: {
    placeholder: 'Fiyat / bütçe aralığı seçin',
  },
  demoUrl: {
    placeholder: 'https://app.ornek.com/demo',
    maxLength: 500,
  },
  capabilities: {},
  supportedLanguages: {},
  businessName: {
    placeholder: 'Örn: Moda Coffee & Artisan Bakery',
    maxLength: 150,
  },
  businessType: {
    placeholder: 'İşletme türü seçin',
  },
  businessTypeOther: {
    placeholder: 'Örn: Butik Kahve Evi & Çalışma Alanı',
    maxLength: 150,
  },
  preferredBusinessTypes: {},
  preferredBusinessTypesOther: {
    placeholder: 'Örn: Gurme Şarküteri & Doğal Ürün Mağazası',
    maxLength: 150,
  },
  transferPrice: {
    placeholder: '0 TL',
  },
  budgetMax: {
    placeholder: '0 TL',
  },
  monthlyRent: {
    placeholder: '0 TL',
  },
  businessAge: {
    placeholder: 'Örn: 4',
  },
  employeeCount: {
    placeholder: 'Örn: 5',
  },
  operationalStatus: {
    placeholder: 'Faaliyet durumu seçin',
  },
  preferredStatus: {
    placeholder: 'Tercih edilen faaliyet durumu seçin',
  },
  operationalPreference: {
    placeholder: 'Yönetim biçimi seçin',
  },
  transferScope: {},
  reasonForTransfer: {
    placeholder: 'Devir nedeni seçin',
  },
  postTransferSupport: {
    placeholder: 'Örn: 1 ay boyunca tedarikçi zinciri, personel eğitimi ve geçiş süreci desteği sağlanacaktır.',
    maxLength: 300,
  },
  financialSummary: {
    placeholder: 'Örn: Aylık ortalama 380.000 TL ciro, %35 net kâr marjı, hazır müşteri kitlesi.',
    maxLength: 500,
  },
  relevantExperience: {
    placeholder: 'Örn: 6 yıl kafe ve restoran işletmeciliği, ekip yönetimi ve mali süreç tecrübesi.',
    maxLength: 500,
  },
};

export const META_FIELD_UI: Record<string, FieldUiMeta> = {
  tags: {},
  images: {},
};

export function getCoreFieldUi(key: string): FieldUiMeta {
  return CORE_FIELD_UI[key] ?? {};
}

export function getCoreFieldUiForCategory(
  categoryId: CategoryId | null | undefined,
  key: keyof CoreListingFieldsInput | string,
): FieldUiMeta {
  const base = getCoreFieldUi(key);
  if (!categoryId) return base;
  const override = CORE_FIELD_UI_BY_CATEGORY[categoryId]?.[key as keyof CoreListingFieldsInput];
  return override ? { ...base, ...override } : base;
}

export function getCoreFieldLabelsForCategory(
  categoryId: CategoryId | null | undefined,
): Partial<Record<keyof CoreListingFieldsInput, string>> | undefined {
  if (!categoryId) return undefined;
  return CORE_FIELD_LABELS_BY_CATEGORY[categoryId];
}

/** Build fieldUi prop for CoreListingFields from category overrides. */
export function getCoreFieldUiOverridesForCategory(
  categoryId: CategoryId | null | undefined,
): Partial<Record<keyof CoreListingFieldsInput, FieldUiMeta>> | undefined {
  if (!categoryId) return undefined;
  return CORE_FIELD_UI_BY_CATEGORY[categoryId];
}

export function getCustomFieldUi(key: string): FieldUiMeta {
  return CUSTOM_FIELD_UI[key] ?? {};
}
