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
    placeholder: 'İlanınızı 2-3 cümleyle sade ve anlaşılır şekilde özetleyin…',
    maxLength: 500,
  },
  longDescription: {
    placeholder: 'Detaylı açıklama, kapsam ve ek bilgileri yazın…',
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
  [CATEGORY_IDS.iseAl]: {
    title: {
      placeholder: 'Örn: Kadıköy Mağazamız İçin Deneyimli Satış Elemanı Aranıyor',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Hafta içi vardiyalı çalışacak, güler yüzlü ve müşteri iletişimi güçlü satış personeli arıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Mağazamızda reyon düzeni, ürün tanıtımı ve müşteri memnuniyeti sağlayacak takım arkadaşları arıyoruz. Yemek ve yol ücreti karşılanmaktadır.',
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
      placeholder: 'Örn: Deneyimli Satış Danışmanı ve Mağaza Görevlisi — Kadıköy / İstanbul',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: 5 yıllık mağazacılık ve perakende satış deneyimimle yeni bir iş arıyorum. Müşteri ilişkileri ve stok takibinde tecrübeliyim.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Daha önce zincir mağazalarda satış danışmanlığı ve kasiyerlik yaptım. Güler yüzlü, sorumluluk sahibi ve vardiyalı çalışmaya uygunum. Anadolu yakasındaki iş fırsatlarını değerlendirmek istiyorum.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Yaşadığınız ili seçin',
    },
  },
  [CATEGORY_IDS.ortakBul]: {
    title: {
      placeholder: 'Örn: Açılacak Restoran Projemiz İçin İşletmeci ve Sermaye Ortağı Arıyoruz',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Kadıköy merkezde kiraladığımız dükkan için mutfak ve salon işletmesini birlikte yürüteceğimiz ortak arıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Mekan tutuldu ve tadilat aşamasına gelindi. Mutfak ve menü hazırlıklarını ben yürütüyorum. Finans, tedarik ve işletme yönetiminde sorumluluk alacak güvenilir bir ortakla büyümek istiyoruz.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.isletmeDevri]: {
    title: {
      placeholder: 'Örn: Kadıköy Çarşıda Yüksek Cirolu, Ruhsatlı ve Hazır Müşterili Kafe Devri',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: 4 yıllık oturmuş müşterisi olan, tüm ekipmanları ve aktif ruhsatıyla hemen işletmeye hazır kafe devredilmektedir.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: İşletmemiz faal durumda olup aylık cirosu ve kârı düzenlidir. İçeride espresso makinesi, fırın, soğutucu dolaplar ve masa sandalye takımları eksiksizdir. Şehir değişikliği nedeniyle devredilmektedir.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.bayilikAl]: {
    title: {
      placeholder: 'Örn: Türkiye Genelinde Dürüm ve Çiğ Köfte Bayilik Fırsatı',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Düşük sermaye ve yüksek kâr marjıyla kendi işinizin sahibi olun. Anahtar teslim dükkan kurulumu ve personel eğitimi sağlıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Markamız 30 şubesiyle hizmet vermektedir. Bayilerimize dükkan seçiminden açılış gününe kadar birebir destek veriyoruz. Günlük taze sevkiyat ve kurumsal reklam desteğiyle hemen kazanmaya başlayın.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.hizmetler]: {
    title: {
      placeholder: 'Örn: Uzman Su Tesisatı ve Elektrik Tamir Hizmetleri / Mehmet Usta',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: 15 yıllık tecrübemizle ev ve iş yerlerinde su kaçağı tespiti, tıkanıklık açma ve elektrik tamiratı yapıyoruz.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: 15 yıllık tecrübemizle ev ve iş yerlerinizde su kaçağı tespiti, tıkanıklık açma, petek temizliği ve elektrik arıza tamiri yapıyoruz. Temiz işçilik, uygun fiyat ve garantili hizmet sunuyoruz.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Hizmet verilen ili seçin',
    },
  },
  [CATEGORY_IDS.dijitalAi]: {
    title: {
      placeholder: 'Örn: E-Ticaret Siteleri İçin Otomatik Ürün Açıklaması ve Görsel Aracı',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Ürün fotoğraflarını netleştiren ve saniyeler içinde satış odaklı ürün açıklamaları yazan yazılım çözümü.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: E-ticaret platformlarıyla tam uyumlu çalışır. Toplu ürün yükleme, arka plan temizleme ve 10 dilde içerik üretme desteği sunar. 14 gün ücretsiz deneme imkanı bulunmaktadır.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
    },
  },
  [CATEGORY_IDS.genelIlan]: {
    title: {
      placeholder: 'Örn: Çok Az Kullanılmış Ofis Masaları ve Çalışma Koltukları Takımı',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Taşınma sebebiyle temiz durumda, sağlam ve kullanıma hazır ofis mobilyaları toplu devredilecektir.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: 1 yıl önce alınmış olup hiçbir kırığı veya çiziği yoktur. 4 adet çalışma masası ve 4 adet ergonomik koltuk dahildir. İstanbul içi teslimatta yardımcı olunur.',
      maxLength: 10000,
    },
  },
};

export const CORE_FIELD_LABELS_BY_CATEGORY: Partial<
  Record<CategoryId, Partial<Record<keyof CoreListingFieldsInput, string>>>
> = {
  [CATEGORY_IDS.isBul]: {
    longDescription: 'Kendinizi Tanıtın',
  },
  [CATEGORY_IDS.bayilikAl]: {
    shortDescription: 'Firma ve Fırsat Özeti',
  },
  [CATEGORY_IDS.dijitalAi]: {
    title: 'Ürün ve Çözüm Adı',
    shortDescription: 'Kısa Tanıtım',
    longDescription: 'Detaylı Kapsam',
  },
  [CATEGORY_IDS.iseAl]: {
    longDescription: 'Pozisyon Detayları ve Şartlar',
  },
  [CATEGORY_IDS.ortakBul]: {
    title: 'Ortaklık Başlığı',
    shortDescription: 'Kısa Açıklama',
  },
  [CATEGORY_IDS.hizmetler]: {
    title: 'İlan Başlığı',
    longDescription: 'Detaylı Hizmet Tanıtımı',
  },
};

export const CUSTOM_FIELD_UI: Record<string, FieldUiMeta> = {
  // Esnaf & Usta
  craftsmanTitle: {
    placeholder: 'Örn: Mehmet Usta Tesisat ve Elektrik Hizmetleri',
    maxLength: 150,
  },
  serviceCategory: {
    placeholder: 'Hizmet alanı seçin',
  },
  servicesList: {
    placeholder: 'Verdiğiniz hizmet kalemlerini seçin veya ekleyin',
  },
  serviceDistricts: {
    placeholder: 'Hizmet verdiğiniz il ve ilçeleri seçin',
  },
  experienceYears: {
    placeholder: 'Mesleki deneyim süresi seçin',
  },
  pricingType: {
    placeholder: 'Fiyatlandırma modeli seçin',
  },

  // Kariyer & Aday
  fullName: {
    placeholder: 'Örn: Ahmet Yılmaz',
    maxLength: 100,
  },
  desiredRole: {
    placeholder: 'Hedeflenen pozisyonu seçin',
  },
  primarySector: {
    placeholder: 'Sektör seçin',
  },
  desiredRoleOther: {
    placeholder: 'Örn: Satış ve Pazarlama Danışmanı',
    maxLength: 200,
  },
  experienceLevel: {
    placeholder: 'Deneyim seviyenizi seçin',
  },
  salaryRange: {
    placeholder: 'Maaş aralığı seçin',
  },
  experience: {
    placeholder: 'Deneyim süresini seçin',
  },
  salaryExpectation: {
    placeholder: 'Maaş beklentisi aralığı seçin',
  },
  workType: {
    placeholder: 'Çalışma şekli seçin',
  },
  profileGender: {
    placeholder: 'Cinsiyet seçin',
  },
  birthDate: {
    placeholder: 'Doğum tarihi seçin',
  },
  residenceCity: {
    placeholder: 'Yaşadığınız ili seçin',
  },
  residenceDistrict: {
    placeholder: 'Yaşadığınız ilçeyi seçin',
  },
  remotePreference: {
    placeholder: 'Çalışma yeri tercihi seçin',
  },
  workplacePreference: {
    placeholder: 'Çalışma modeli seçin',
  },
  positionTitle: {
    placeholder: 'Pozisyon seçin',
  },
  positionTitleOther: {
    placeholder: 'Örn: Mağaza Satış Sorumlusu',
    maxLength: 200,
  },
  preferredCity: {
    placeholder: 'İl seçin',
  },
  preferredDistrict: {
    placeholder: 'İlçe seçin',
  },
  preferredDistrictOther: {
    placeholder: 'Örn: Moda, Bostancı, Kızılay',
    maxLength: 120,
  },
  district: {
    placeholder: 'İlçe seçin',
  },
  districtOther: {
    placeholder: 'Örn: Mahalle veya semt adı',
    maxLength: 120,
  },
  professionalSkills: {
    placeholder: 'Uzmanlık ve yetkinlikleri seçin',
    maxLength: 1000,
  },
  technicalSkills: {
    placeholder: 'Örn: Bilgisayar Kullanımı, MS Office, Kasa ve Barkod Sistemleri',
    maxLength: 1000,
  },
  leadershipExperience: {
    placeholder: 'Örn: 5 kişilik mağaza ve satış ekibini yönettim, vardiya düzenini sağladım.',
    maxLength: 1000,
  },
  tools: {
    placeholder: 'Kullandığınız program ve araçları seçin',
    maxLength: 1500,
  },
  educationField: {
    placeholder: 'Örn: İşletme, İktisat, Makine veya Lise',
    maxLength: 200,
  },
  languages: {
    placeholder: 'Örn: İngilizce (İyi), Almanca (Başlangıç)',
    maxLength: 500,
  },
  certificates: {
    placeholder: 'Örn: Hijyen Belgesi, SRC Belgesi, Ustalık Belgesi, Ehliyet',
    maxLength: 500,
  },
  preferredRolesOther: {
    placeholder: 'Örn: Mağaza Müdürü / Satış Danışmanı',
    maxLength: 200,
  },
  sectorOther: {
    placeholder: 'Örn: Gıda ve Unlu Mamuller',
    maxLength: 200,
  },

  // Ortaklık
  partnershipType: {
    placeholder: 'Ortaklık türü seçin',
  },
  commitment: {
    placeholder: 'Çalışma biçimini seçin',
  },
  projectStage: {
    placeholder: 'Girişimin mevcut aşamasını seçin',
  },
  equityOffered: {
    placeholder: 'Örn: 25',
  },
  investmentAmountCustom: {
    placeholder: 'Örn: 500.000 TL',
    maxLength: 60,
  },
  contactName: {
    placeholder: 'Örn: Mustafa Bey',
    maxLength: 100,
  },
  contactPhone: {
    placeholder: 'Örn: 0532 123 45 67',
    maxLength: 30,
  },
  expertiseOther: {
    placeholder: 'Örn: Müşteri İlişkileri, Satış ve Pazarlama, Kasa Yönetimi',
    maxLength: 120,
    helperText: 'Aramak istediğiniz özel uzmanlığı yazabilir veya listeden önerilenleri seçebilirsiniz.',
  },
  offeredSkillsOther: {
    placeholder: 'Örn: İşletme Yönetimi, Finans ve Muhasebe, Personel Yönetimi',
    maxLength: 120,
    helperText: 'Sunduğunuz özel yetkinliği yazabilir veya listeden önerilenleri seçebilirsiniz.',
  },

  // Franchise
  companyName: {
    placeholder: 'Örn: Çıtır Dürüm ve Çiğ Köfte Ltd. Şti.',
    maxLength: 120,
  },
  establishmentYear: {
    placeholder: 'Örn: 2018',
  },
  branchCount: {
    placeholder: 'Örn: 35',
  },
  website: {
    placeholder: 'https://ornekfirma.com',
    maxLength: 500,
  },
  entryFee: {
    placeholder: 'Örn: 100.000 TL',
  },
  franchiseFee: {
    placeholder: 'Örn: 150.000 TL',
  },
  totalInvestment: {
    placeholder: 'Örn: 450.000 TL',
  },
  profitMargin: {
    placeholder: 'Örn: 35',
  },
  royaltyFee: {
    placeholder: 'Aylık pay oranını seçin',
  },
  advertisingFee: {
    placeholder: 'Örn: 2',
  },
  returnPeriod: {
    placeholder: 'Yatırım geri dönüş süresi seçin',
  },
  averageSetupDuration: {
    placeholder: 'Anahtar teslim kurulum süresi seçin',
  },
  minSquareMeters: {
    placeholder: 'Örn: 60',
  },
  districts: {
    placeholder: 'Örn: Kadıköy, Üsküdar, Çankaya, Nilüfer, Muratpaşa',
    maxLength: 500,
  },
  minPopulation: {
    placeholder: 'Örn: 100.000',
  },
  storeSize: {
    placeholder: 'Mağaza metrekare aralığı seçin',
  },
  businessCategory: {
    placeholder: 'Sektör ve kategori seçin',
  },
  workingHours: {
    placeholder: 'Örn: 08:30 – 22:00',
    maxLength: 200,
  },
  guaranteeRequirement: {
    placeholder: 'Örn: 100.000 TL teminat veya kefalet mektubu.',
    maxLength: 500,
  },
  introductionVideoUrl: {
    placeholder: 'https://youtube.com/watch?v=...',
    maxLength: 500,
  },
  presentationPdfUrl: {
    placeholder: 'https://ornek.com/sunum.pdf',
    maxLength: 500,
  },
  sampleContractUrl: {
    placeholder: 'https://ornek.com/sozlesme.pdf',
    maxLength: 500,
  },

  // İşletme Devri
  businessName: {
    placeholder: 'Örn: Moda Kafe ve Fırın',
    maxLength: 150,
  },
  businessType: {
    placeholder: 'İşletme türünü seçin',
  },
  businessTypeOther: {
    placeholder: 'Örn: Fırın ve Pastane',
    maxLength: 150,
  },
  preferredBusinessTypesOther: {
    placeholder: 'Örn: Şarküteri ve Doğal Ürünler',
    maxLength: 150,
  },
  transferPrice: {
    placeholder: 'Örn: 850.000 TL',
  },
  budgetMax: {
    placeholder: 'Örn: 1.000.000 TL',
  },
  monthlyRent: {
    placeholder: 'Örn: 30.000 TL',
  },
  monthlyRevenue: {
    placeholder: 'Örn: 180.000 TL',
    maxLength: 40,
  },
  businessAge: {
    placeholder: 'Örn: 4',
  },
  employeeCount: {
    placeholder: 'Örn: 4',
  },
  operationalStatus: {
    placeholder: 'İşletmenin çalışma durumunu seçin',
  },
  preferredStatus: {
    placeholder: 'Tercih edilen devir durumunu seçin',
  },
  operationalPreference: {
    placeholder: 'İşletme yönetim biçimini seçin',
  },
  reasonForTransfer: {
    placeholder: 'Devretme nedenini seçin',
  },
  postTransferSupport: {
    placeholder: 'Örn: 1 ay boyunca tedarikçiler, personel eğitimi ve geçiş sürecinde dükkanda birebir destek verilecektir.',
    maxLength: 300,
  },
  financialSummary: {
    placeholder: 'Örn: Aylık ortalama 200.000 TL ciro, %35 net kâr, hazır ve oturmuş müşteri kitlesi.',
    maxLength: 500,
  },
  relevantExperience: {
    placeholder: 'Örn: 8 yıl kafe ve restoran işletmeciliği, kasa ve personel yönetimi tecrübesi.',
    maxLength: 500,
  },

  // Dijital & AI
  solutionType: {
    placeholder: 'Çözüm türünü seçin',
  },
  deliveryModel: {
    placeholder: 'Kullanım modelini seçin',
  },
  targetAudience: {
    placeholder: 'Hedef kitleyi seçin',
  },
  priceRange: {
    placeholder: 'Fiyat ve paket aralığı seçin',
  },
  demoUrl: {
    placeholder: 'https://demo.ornek.com',
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
