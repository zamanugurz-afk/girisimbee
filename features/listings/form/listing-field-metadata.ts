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
    helperText:
      'Her kelimenin ilk harfi büyük. Alanı terk edince yazım otomatik düzeltilir. E-posta/telefon/küfür yasak.',
    maxLength: 200,
  },
  shortDescription: {
    placeholder: 'İlanınızı 2-3 cümlede özetleyin…',
    helperText:
      'Kartlarda ve arama sonuçlarında görünür. Alanı terk edince yazım düzeltilir. E-posta, telefon veya dış link yok. En az 30 karakter.',
    maxLength: 500,
  },
  longDescription: {
    placeholder: 'Detaylı açıklama, kapsam ve ek bilgiler…',
    helperText:
      'Detay sayfasında gösterilir. Alanı terk edince yazım düzeltilir. İletişim telefon ile yapılır. En az 100 karakter.',
    maxLength: 10000,
  },
  city: {
    placeholder: 'Şehir seçin',
    helperText: 'Faaliyet gösterdiğiniz veya ilanla ilişkili şehir.',
  },
  remotePolicy: {
    placeholder: 'Çalışma modeli seçin',
    helperText: 'Ofis, hibrit veya tam uzaktan çalışma tercihiniz.',
  },
};

type CoreFieldUiMap = Partial<Record<keyof CoreListingFieldsInput, FieldUiMeta>>;

/** Category-specific placeholders & helpers for core listing fields (cards + form). */
export const CORE_FIELD_UI_BY_CATEGORY: Partial<Record<CategoryId, CoreFieldUiMap>> = {
  [CATEGORY_IDS.yatirimBul]: {
    title: {
      placeholder: 'Örn: B2B SaaS Girişimine Seed Yatırım Arıyoruz',
      helperText:
        'Yatırım arayışınızı net yazın. Her kelimenin ilk harfi büyük; e-posta/telefon/küfür yasak.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Girişiminizi, aşamasını ve aradığınız yatırım tutarını 2-3 cümlede özetleyin…',
      helperText:
        'Kartlarda görünür. En az 30 karakter; iletişim bilgisi veya dış link yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Ürünü, pazarı, ekibi, kullanım alanını ve yatırımcıdan beklentilerinizi detaylı anlatın…',
      helperText:
        'Detay sayfasında gösterilir. En az 100 karakter; iletişim telefon ile yapılır.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
      helperText: 'Girişiminizin merkezi veya faaliyet şehri.',
    },
  },
  [CATEGORY_IDS.yatirimYap]: {
    title: {
      placeholder: 'Örn: Erken Aşama Fintech Yatırımlarına Odaklıyım',
      helperText:
        'Yatırımcı profilinizi özetleyen bir başlık yazın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Bilet büyüklüğünüzü, tercih ettiğiniz aşama ve sektörleri 2-3 cümlede yazın…',
      helperText: 'Kartlarda görünür. En az 30 karakter; iletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Yatırım stratejinizi, geçmiş deneyiminizi ve kuruculara sunduğunuz değeri anlatın…',
      helperText: 'Detay sayfasında gösterilir. En az 100 karakter.',
      maxLength: 10000,
    },
  },
  [CATEGORY_IDS.iseAl]: {
    title: {
      placeholder: 'Örn: Senior Frontend Developer — Tam Zamanlı',
      helperText:
        'Pozisyon adını net yazın. Her kelimenin ilk harfi büyük; e-posta/telefon yasak.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Rolü, çalışma modelini ve kısa beklentileri 2-3 cümlede özetleyin…',
      helperText:
        'İş ilanı kartlarında görünür. En az 30 karakter; iletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Sorumluluklar, aranan nitelikler, yan haklar ve süreç hakkında detay yazın…',
      helperText:
        'Detay sayfasında gösterilir. Adaylar telefon ile ulaşır. En az 100 karakter.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
      helperText: 'Pozisyonun lokasyonu veya ofis şehri.',
    },
    remotePolicy: {
      placeholder: 'Çalışma modeli seçin',
      helperText: 'Ofis, hibrit veya uzaktan çalışma modeli.',
    },
  },
  [CATEGORY_IDS.isBul]: {
    title: {
      placeholder: 'Örn: Full-stack Geliştirici — Uzaktan Çalışmaya Açık',
      helperText:
        'Hedeflediğiniz rolü yazın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Deneyiminizi, uzmanlığınızı ve aradığınız rolü 2-3 cümlede özetleyin…',
      helperText: 'Profil kartında görünür. En az 30 karakter.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Kariyer özetinizi, öne çıkan projelerinizi ve hedeflerinizi anlatın…',
      helperText: 'Detay sayfasında gösterilir. En az 100 karakter.',
      maxLength: 10000,
    },
  },
  [CATEGORY_IDS.ortakBul]: {
    title: {
      placeholder: 'Örn: Teknik Kurucu Ortak Arıyoruz — SaaS',
      helperText:
        'Aradığınız ortaklık tipini başlığa yansıtın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Projenizi, aradığınız uzmanlığı ve ortaklık modelini 2-3 cümlede yazın…',
      helperText:
        'Ortaklık kartlarında görünür. En az 30 karakter; iletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Vizyonu, mevcut ekibi, equity/taahhüt beklentisini ve neden ortak aradığınızı anlatın…',
      helperText: 'Detay sayfasında gösterilir. En az 100 karakter.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
      helperText: 'Ortaklığın yürütüleceği şehir veya uzaktan çalışma notu için konum.',
    },
  },
  [CATEGORY_IDS.bayilikAl]: {
    title: {
      placeholder: 'Örn: Premium Kahve Markası Franchise Fırsatı',
      helperText:
        'Marka ve fırsat türünü net yazın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Firmanızın kısa tarihçesini, ne zaman kurulduğunu ve bugüne nasıl geldiğini 2-3 cümlede anlatın…',
      helperText:
        'Kısa bir firma tarihçesi yazın. Kartlarda görünür; en az 30 karakter.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Marka hikayesini, destek paketini, yatırım aralığını ve franchise modelini detaylı anlatın…',
      helperText: 'Detay sayfasında gösterilir. En az 100 karakter.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
      helperText: 'Markanın merkezi veya öncelikli franchise şehri.',
    },
  },
  [CATEGORY_IDS.dijitalAi]: {
    title: {
      placeholder: 'Örn: Kobi Satışları İçin AI Chatbot',
      helperText:
        'Ürün veya çözüm adını yazın — kart başlığında görünür. Her kelimenin ilk harfi büyük; e-posta/telefon yasak.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Çözümün ne yaptığını, kime hitap ettiğini ve temel faydasını 2-3 cümlede yazın…',
      helperText:
        'Dijital & AI kartlarında bu metin görünür. En az 30 karakter; link veya iletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Kapsamı, kullanım senaryolarını, entegrasyonları ve teslim modelini detaylı anlatın…',
      helperText:
        'Detay sayfasında “ilan içeriği” olarak gösterilir. En az 100 karakter; iletişim telefon ile yapılır.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
      helperText: 'Ekibinizin veya şirketinizin şehri (uzaktan çözümlerde de belirtilebilir).',
    },
  },
  [CATEGORY_IDS.genelIlan]: {
    title: {
      placeholder: 'Örn: Ofis Mobilyası Seti — Teklif Alınır',
      helperText: 'İlan konusunu net yazın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder: 'Ürün veya hizmeti 2-3 cümlede özetleyin…',
      helperText: 'Kartlarda görünür. En az 30 karakter.',
      maxLength: 500,
    },
    longDescription: {
      placeholder: 'Durum, teslimat, fiyat ve ek koşulları detaylı yazın…',
      helperText: 'Detay sayfasında gösterilir. En az 100 karakter.',
      maxLength: 10000,
    },
  },
};

export const CORE_FIELD_LABELS_BY_CATEGORY: Partial<
  Record<CategoryId, Partial<Record<keyof CoreListingFieldsInput, string>>>
> = {
  [CATEGORY_IDS.isBul]: {
    longDescription: 'Kariyer özetim',
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
    title: 'Pozisyon başlığı',
    shortDescription: 'Kısa ilan özeti',
  },
  [CATEGORY_IDS.yatirimBul]: {
    title: 'Yatırım ilanı başlığı',
    shortDescription: 'Kısa özet',
  },
  [CATEGORY_IDS.ortakBul]: {
    title: 'Ortaklık ilanı başlığı',
    shortDescription: 'Kısa özet',
  },
};

export const CUSTOM_FIELD_UI: Record<string, FieldUiMeta> = {
  investmentAmount: {
    placeholder: 'Yatırım tutarı aralığı seçin',
    helperText: 'Ayırmayı planladığınız veya aradığınız yatırım miktarını belirtin.',
  },
  equityOffered: {
    placeholder: 'Örn. 10',
    helperText: 'Yatırımcılara sunmayı planladığınız hisse oranı (%).',
  },
  stage: {
    placeholder: 'Girişim aşaması seçin',
    helperText: 'Mevcut gelişim seviyeniz yatırımcı eşleşmesini iyileştirir.',
  },
  minInvestment: {
    placeholder: 'Minimum katkı aralığı seçin',
    helperText: 'Tek bir yatırımcıdan kabul edeceğiniz minimum tutar.',
  },
  maxInvestment: {
    placeholder: 'Maksimum katkı aralığı seçin',
    helperText: 'Tek bir yatırımcıdan kabul edeceğiniz maksimum tutar.',
  },
  useOfFunds: {
    helperText: 'Yatırımın kullanılacağı alanları seçin. Birden fazla seçebilirsiniz.',
  },
  currency: {
    placeholder: 'Para birimi seçin',
    helperText: 'Tutarların gösterileceği para birimi.',
  },
  ticketSizeMin: {
    placeholder: 'Minimum bilet aralığı seçin',
    helperText: 'Tek bir yatırımda ayırmayı planladığınız minimum tutar.',
  },
  ticketSizeMax: {
    placeholder: 'Maksimum bilet aralığı seçin',
    helperText: 'Tek bir yatırımda ayırmayı planladığınız maksimum tutar.',
  },
  preferredStages: {
    placeholder: 'Tercih edilen aşama seçin',
    helperText: 'Yatırım yapmayı tercih ettiğiniz girişim aşamaları.',
  },
  sectors: {
    helperText: 'İlgilendiğiniz sektörleri seçin (birden fazla seçebilirsiniz).',
  },
  investmentFocus: {
    placeholder: 'Örn. B2B SaaS, erken aşama, Türkiye odaklı…',
    helperText: 'Yatırım stratejinizi ve odağınızı kısaca tanımlayın.',
    maxLength: 500,
  },
  desiredRole: {
    placeholder: 'Pozisyon seçin',
    helperText: 'Aradığınız veya hedeflediğiniz pozisyon.',
  },
  experienceLevel: {
    placeholder: 'Deneyim seviyesi seçin',
    helperText: 'İlgili alandaki deneyim seviyeniz.',
  },
  salaryRange: {
    placeholder: 'Maaş aralığı seçin',
    helperText: 'Sunmayı planladığınız maaş aralığı.',
  },
  expertise: {
    helperText: 'Aradığınız ortağın uzmanlık alanlarını seçin.',
  },
  salaryExpectation: {
    placeholder: 'Maaş beklentisi aralığı seçin',
    helperText: 'Net veya brüt maaş beklentinizi aralık olarak belirtin.',
  },
  workType: {
    placeholder: 'Çalışma tipi seçin',
    helperText: 'Tam zamanlı, yarı zamanlı veya proje bazlı tercihiniz.',
  },
  remotePreference: {
    placeholder: 'Uzaktan çalışma tercihi seçin',
    helperText: 'Ofis, hibrit veya tam uzaktan çalışma tercihiniz.',
  },
  positionTitle: {
    placeholder: 'Pozisyon seçin',
    helperText: 'Açtığınız pozisyonu listeden seçin.',
  },
  partnershipType: {
    placeholder: 'Ortaklık tipi seçin',
    helperText: 'Aradığınız ortaklık türünü seçin.',
  },
  commitment: {
    placeholder: 'Taahhüt seviyesi seçin',
    helperText: 'Ortaktan beklediğiniz zaman taahhüdü.',
  },
  projectStage: {
    placeholder: 'Proje aşaması seçin',
    helperText: 'Projenizin mevcut gelişim aşaması.',
  },
  companyName: {
    placeholder: 'Örn. Abc Gıda A.Ş.',
    helperText: 'Franchise veren şirketin resmi unvanı. Her kelimenin ilk harfi büyük.',
    maxLength: 200,
  },
  establishmentYear: {
    placeholder: 'Örn. 2010',
    helperText: 'Markanın veya şirketin kuruluş yılı.',
  },
  branchCount: {
    placeholder: 'Örn. 25',
    helperText: 'Mevcut şube veya lokasyon sayısı.',
  },
  website: {
    placeholder: 'https://marka.com',
    helperText: 'Marka veya şirket web sitesi.',
    maxLength: 500,
  },
  entryFee: {
    placeholder: '0 TL',
    helperText: 'Franchise sistemine giriş için talep edilen bedel.',
  },
  franchiseFee: {
    placeholder: '0 TL',
    helperText: 'Marka / isim hakkı kullanım bedeli.',
  },
  totalInvestment: {
    placeholder: '0 TL',
    helperText: 'Açılış dahil toplam yatırım bütçesi.',
  },
  profitMargin: {
    placeholder: 'Örn. 25',
    helperText: 'Beklenen ortalama kar marjı (%).',
  },
  royaltyFee: {
    placeholder: 'Örn. 5',
    helperText: 'Ciro üzerinden alınan pay oranı (%).',
  },
  advertisingFee: {
    placeholder: 'Örn. 2',
    helperText: 'Reklam ve pazarlama fonu katkı oranı (%).',
  },
  returnPeriod: {
    placeholder: 'Geri dönüş süresi seçin',
    helperText: 'Yatırımın geri kazanılması için tahmini süre.',
  },
  averageSetupDuration: {
    placeholder: 'Kurulum süresi seçin',
    helperText: 'Şube açılışına kadar ortalama kurulum süresi.',
  },
  minSquareMeters: {
    placeholder: 'Örn. 80',
    helperText: 'Franchise noktasında aranan minimum alan (m²).',
  },
  availableCities: {
    helperText: 'Franchise verilebilecek şehirleri seçin.',
  },
  districts: {
    placeholder: 'Örn. Kadıköy, Beşiktaş',
    helperText: 'Tercih edilen ilçeler (virgülle ayırın).',
    maxLength: 500,
  },
  minPopulation: {
    placeholder: 'Örn. 100000',
    helperText: 'Lokasyonda aranan minimum nüfus.',
  },
  storeSize: {
    placeholder: 'Mağaza büyüklüğü seçin',
    helperText: 'Hedef mağaza alanı aralığı.',
  },
  businessCategory: {
    placeholder: 'İş kategorisi seçin',
    helperText: 'Franchise işletme modeli.',
  },
  workingHours: {
    placeholder: 'Örn. 09:00 – 22:00',
    helperText: 'Günlük çalışma saatleri.',
    maxLength: 200,
  },
  guaranteeRequirement: {
    placeholder: 'Örn. 100.000 TL teminat mektubu',
    helperText: 'Teminat veya kefalet gereksinimleri.',
    maxLength: 500,
  },
  introductionVideoUrl: {
    placeholder: 'https://youtube.com/...',
    helperText: 'YouTube veya Vimeo tanıtım videosu bağlantısı.',
    maxLength: 500,
  },
  presentationPdfUrl: {
    placeholder: 'https://...',
    helperText: 'Franchise sunum PDF bağlantısı (dosya yükleme desteklenmiyorsa URL).',
    maxLength: 500,
  },
  sampleContractUrl: {
    placeholder: 'https://...',
    helperText: 'Örnek franchise sözleşmesi bağlantısı.',
    maxLength: 500,
  },
  solutionType: {
    placeholder: 'Çözüm türünü seçin',
    helperText: 'Ürününüzün ana kategorisi — kart ve filtrelerde görünür.',
  },
  deliveryModel: {
    placeholder: 'Teslim modelini seçin',
    helperText: 'Nasıl satıldığını / teslim edildiğini belirtin.',
  },
  targetAudience: {
    placeholder: 'Hedef kitleyi seçin',
    helperText: 'Çözümünüzün öncelikli müşteri profili.',
  },
  priceRange: {
    placeholder: 'Fiyat / bütçe aralığı seçin',
    helperText: 'Kartlarda ve detayda gösterilir.',
  },
  demoUrl: {
    placeholder: 'https://demo.ornek.com',
    helperText: 'Canlı demo, landing veya ürün sayfası bağlantısı.',
    maxLength: 500,
  },
  capabilities: {
    helperText: 'Çözümünüzün sunduğu yetenekleri seçin. Her kart detayda aynı şekilde listelenir.',
  },
  supportedLanguages: {
    helperText: 'Ürün veya destek dilini seçin (birden fazla olabilir).',
  },
};

export const META_FIELD_UI: Record<string, FieldUiMeta> = {
  tags: {
    helperText: 'Kategorinize uygun etiketleri seçin. En fazla 10 etiket.',
  },
  images: {
    helperText:
      'Sürükleyerek sıralayın. İlk görsel kapak olur. En az 640×360 px; en fazla 10 görsel.',
  },
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
