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
      'Detay sayfasında gösterilir. Alanı terk edince yazım düzeltilir. En az 100 karakter.',
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
      placeholder: 'Örn: FaturaAI',
      helperText: 'Girişim adını yazın. Slogan veya uzun ilan başlığı yazmayın.',
      maxLength: 80,
    },
    shortDescription: {
      placeholder: 'Kısa özet önceki adımlardan otomatik oluşur; dilerseniz düzeltin.',
      helperText:
        'Kartlarda görünür. Sistem üretir; sıfırdan yazmak zorunda değilsiniz. Telefon veya link yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder: 'Yatırımcı özeti önceki adımlardan otomatik oluşur. AI yalnız butona basınca çalışır.',
      helperText:
        'Yatırımcının 10 saniyede okuyacağı özet. Sistem üretir; AI sonucu Kullan demeden yazılmaz.',
      maxLength: 2000,
    },
    city: {
      placeholder: 'Şehir seçin',
      helperText: 'Girişiminizin merkezi veya faaliyet şehri.',
    },
  },
  [CATEGORY_IDS.yatirimYap]: {
    title: {
      placeholder: 'Örn: Erken Aşama SaaS ve Fintech Yatırımcısı',
      helperText: 'Kısa bir yatırımcı kimliği yazın. Uzun slogan yazmayın.',
      maxLength: 80,
    },
    shortDescription: {
      placeholder: 'Yapılandırılmış kriterlerden kısa özet üretilir; düzenleyebilirsiniz.',
      helperText: 'Kartlarda görünür. En az 30 karakter. İletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder: 'Yatırımcı özeti kriterlerden üretilir; AI onayınız olmadan yazılmaz.',
      helperText: 'Kurucunun 10 saniyede okuyacağı profil. En az 100 karakter. Yeni kriter eklemeyin.',
      maxLength: 2000,
    },
  },
  [CATEGORY_IDS.iseAl]: {
    title: {
      placeholder: 'Örn: Kıdemli Yazılım Geliştirici — Hibrit İstanbul',
      helperText:
        'Pozisyon adını net yazın. Her kelimenin ilk harfi büyük; e-posta/telefon yasak.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Büyümekte olan ekibimize React ve Node deneyimli, takım çalışmasına yatkın kıdemli yazılım geliştirici arıyoruz; hibrit çalışma.',
      helperText:
        'İş ilanı kartlarında görünür. En az 30 karakter; iletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Ürün geliştirme ekibinde özellik tasarımı ve kod incelemesi bekleniyor. Arananlar: kıdemli seviye, TypeScript, takım içi iletişim. Hibrit İstanbul, 1 ay içinde başlama.',
      helperText:
        'Girdiğiniz bilgilere göre bir taslak doldurulur; kullanabilir veya kendiniz yazabilirsiniz. En az 100 karakter. Telefon, e-posta veya firma adı yazmayın.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'İl seçin',
      helperText: 'Pozisyonun ili — ardından ilçe seçebilirsiniz.',
    },
    remotePolicy: {
      placeholder: 'Çalışma modeli seçin',
      helperText: 'Ofis, hibrit veya uzaktan çalışma modeli.',
    },
  },
  [CATEGORY_IDS.isBul]: {
    title: {
      placeholder: 'Örn: Full-stack Geliştirici — Uzaktan veya Hibrit Çalışmaya Açık',
      helperText:
        'Hedeflediğiniz rolü yazın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Beş yıllık full-stack deneyimimle ürün ekiplerinde uçtan uca özellik geliştirdim; uzaktan veya hibrit rollere açığım.',
      helperText: 'Profil kartında görünür. En az 30 karakter.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Son yıllarda e-ticaret ve SaaS ürünlerinde frontend ile API geliştirme yaptım. Güçlü yanlarım TypeScript, takım içi kod kalitesi ve kullanıcı odaklı düşünmek. Kısa vadede ürün ekibinde kıdemli geliştirici veya teknik liderlik yolunda ilerlemek istiyorum.',
      helperText:
        'Bu bir kariyer özeti önerisidir. Taslağı olduğu gibi kullanabilir veya kendi özetinizi yazabilirsiniz. En az 100 karakter. Telefon, e-posta veya firma adı yazmayın.',
      maxLength: 10000,
    },
  },
  [CATEGORY_IDS.ortakBul]: {
    title: {
      placeholder: 'Örn: Ürün Odaklı Teknik Kurucu Ortak Arıyoruz',
      helperText:
        'Aradığınız ortaklık tipini başlığa yansıtın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Pazara çıkmış mobil ürünümüz için yazılım ve ürün yönetimi deneyimli teknik kurucu ortak arıyoruz; equity konuşulur.',
      helperText:
        'Ortaklık kartlarında görünür. En az 30 karakter; iletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Mevcut ekipte iş geliştirme ve tasarım var; teknik liderlik ve mimari eksik. Haftalık düzenli katkı ve uzun vadeli ortaklık bekliyoruz. Equity aralığı ve roller şeffaf konuşulacak. Tercihen İstanbul veya güçlü uzaktan çalışma disiplinine sahip bir ortak arıyoruz. İlk görüşmede ürün demosu ve yol haritası paylaşılır.',
      helperText: 'Detay sayfasında gösterilir. En az 100 karakter.',
      maxLength: 10000,
    },
    city: {
      placeholder: 'Şehir seçin',
      helperText: 'Ortaklığın yürütüleceği şehir (uzaktan ise yine belirtin).',
    },
  },
  [CATEGORY_IDS.bayilikAl]: {
    title: {
      placeholder: 'Örn: Ev Tipi Kahve ve Atıştırmalık Franchise Fırsatı',
      helperText:
        'Marka ve fırsat türünü net yazın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: 2016’dan beri büyüyen markamız; eğitim, lokasyon ve açılış desteğiyle yeni franchise ortakları arıyoruz.',
      helperText:
        'Kısa bir firma tarihçesi yazın. Kartlarda görünür; en az 30 karakter.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Markamız kahve ve atıştırmalık segmentinde hizmet veriyor. Franchise paketine eğitim, standart reçete, pazarlama kiti ve saha desteği dahildir. Yatırım aralığı şehre göre değişir; geri dönüş süresi lokasyona bağlıdır. Adaylardan işletme deneyimi veya güçlü operasyon disiplini bekleriz. Detaylı sunum ve örnek sözleşme görüşmede paylaşılır.',
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
      placeholder: 'Örn: KOBİ Satış Ekipleri İçin Yapay Zeka Asistanı',
      helperText:
        'Ürün veya çözüm adını yazın — kart başlığında görünür. Her kelimenin ilk harfi büyük; e-posta/telefon yasak.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Satış ekiplerinin teklif ve takip işlerini hızlandıran, Türkçe konuşan yapay zeka asistanı; abonelik modeliyle sunulur.',
      helperText:
        'Dijital & AI kartlarında bu metin görünür. En az 30 karakter; link veya iletişim bilgisi yazmayın.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Çözüm CRM ve e-posta araçlarıyla entegre çalışır. Kullanım senaryoları: lead nitelendirme, teklif taslağı ve hatırlatma. Kurulum birkaç gün sürer; eğitim ve destek dahildir. KOBİ ve orta ölçekli firmalara uygundur. Fiyat paketlere göre değişir; demo talebi sonrası ihtiyaç analizi yapılır. Veri güvenliği ve KVKK uyumu önceliğimizdir.',
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
      placeholder: 'Örn: Ofis Mobilyası Seti — Toplu Alıma Uygun',
      helperText: 'İlan konusunu net yazın. Her kelimenin ilk harfi büyük.',
      maxLength: 200,
    },
    shortDescription: {
      placeholder:
        'Örn: Az kullanılmış ofis masa ve sandalye seti; yerinde teslim veya nakliye seçenekleri mevcuttur.',
      helperText: 'Kartlarda görünür. En az 30 karakter.',
      maxLength: 500,
    },
    longDescription: {
      placeholder:
        'Örn: Ürünler iyi durumda, petekli ofis kullanımı için uygundur. Adet ve renk seçenekleri stok durumuna göre değişir. Fiyat pazarlığa açıktır; faturalı satış yapılabilir. Teslimat İstanbul içi planlanır, diğer şehirler için kargo maliyeti ayrıca konuşulur. Görüşme sonrası net teklif paylaşılır.',
      helperText: 'Detay sayfasında gösterilir. En az 100 karakter.',
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
    title: 'Ortaklık ilanı başlığı',
    shortDescription: 'Kısa özet',
  },
};

export const CUSTOM_FIELD_UI: Record<string, FieldUiMeta> = {
  investmentAmount: {
    placeholder: 'Yatırım tutarı aralığı seçin',
    helperText: 'Aradığınız tutarı aralıktan seçin. Listede yoksa Özel tutar’ı seçin.',
  },
  investmentAmountCustom: {
    placeholder: 'Örn. 3.200.000 TL',
    helperText: 'Yalnızca aralık dışında bir tutar arıyorsanız doldurun.',
    maxLength: 60,
  },
  equityOffered: {
    placeholder: 'Örn. 10',
    helperText: 'Yatırımcılara sunmayı planladığınız hisse oranı (%).',
  },
  valuation: {
    placeholder: 'Örn. 30.000.000 TL',
    helperText: 'Varsa mevcut veya hedef değerleme. Yoksa boş bırakın.',
    maxLength: 60,
  },
  stage: {
    placeholder: 'Gelişim aşamasını seçin',
    helperText:
      'Bu, yatırımcının girişiminizin gelişim/tur aşamasına göre yaptığı filtredir. Ürün durumu ve mevcut müşteri durumundan farklıdır.',
  },
  sector: {
    placeholder: 'Sektör seçin',
    helperText: 'Yatırımcının sektör filtresinde görünecek ana alan.',
  },
  productStatus: {
    placeholder: 'Ürün durumunu seçin',
    helperText: 'Ürün ne kadar hazır: fikir, MVP, beta veya canlı. Yatırım aşamasından ayrıdır.',
  },
  productName: {
    placeholder: 'Örn. FaturaAI',
    helperText: 'Yalnızca girişim adından farklı bir ürün veya marka varsa yazın.',
    maxLength: 80,
  },
  foundedYear: {
    placeholder: 'Örn. 2024',
    helperText: 'Şirketin veya girişimin kuruluş yılı.',
    maxLength: 4,
  },
  businessModel: {
    helperText:
      'Parayı nasıl kazanıyorsunuz? Birden fazla iş modeli seçebilirsiniz. Örneğin SaaS ve Abonelik birlikte kullanılabilir.',
  },
  targetCustomer: {
    helperText: 'Kim ödüyor veya kullanıyor? Birden fazla seçebilirsiniz.',
  },
  problem: {
    placeholder: 'Hangi problemi, kimin için çözüyorsunuz?',
    helperText: 'Müşterinin yaşadığı asıl sıkıntıyı bir cümlede yazın.',
    maxLength: 280,
  },
  solution: {
    placeholder: 'Çözümünüz ne yapıyor?',
    helperText: 'Bu problemi nasıl çözdüğünüzü kısa ve somut yazın.',
    maxLength: 280,
  },
  differentiation: {
    placeholder: 'Rakiplerden / alternatiflerden farkınız nedir?',
    helperText: 'Neden sizi tercih etsinler? Kanıtsız pazar liderliği yazmayın.',
    maxLength: 280,
  },
  revenueStatus: {
    placeholder: 'Gelir durumunu seçin',
    helperText: 'Bugün fatura kesiyor musunuz? Gelir yoksa bunu seçin; uydurmayın.',
  },
  tractionStatus: {
    placeholder: 'Bugünkü durumu seçin',
    helperText: 'Pazarda kanıt var mı: müşteri yok, pilot, ilk müşteriler veya ölçeklenen taban.',
  },
  monthlyRevenue: {
    placeholder: 'Örn. 120.000 TL',
    helperText: 'Son ayın gerçek geliri. MRR ile aynı şeyi tekrar yazmayın.',
    maxLength: 40,
  },
  mrr: {
    placeholder: 'Örn. 120.000 TL',
    helperText: 'Her ay düzenli gelen gelir. Yıllık tutar sizden istenmez.',
    maxLength: 40,
  },
  arr: {
    placeholder: 'Örn. 1.440.000 TL',
    helperText: 'Yıllık yinelenen gelir. Kullanıcıya sorulmaz.',
    maxLength: 40,
  },
  activeCustomers: {
    placeholder: 'Örn. 20',
    helperText: 'Şu anda aktif veya ödeyen müşteri sayısı.',
    maxLength: 40,
  },
  totalCustomers: {
    placeholder: 'Örn. 45',
    helperText: 'Toplam müşteri. Ayrı zorunlu alan değildir.',
    maxLength: 40,
  },
  users: {
    placeholder: 'Örn. 1.200',
    helperText: 'Tüketici veya kullanıcı tabanlı modeller için kayıtlı kullanıcı.',
    maxLength: 40,
  },
  growthRate: {
    placeholder: 'Örn. 12',
    helperText: 'Ölçtüğünüz büyüme oranı. Birim yüzde (%). Yoksa boş bırakın.',
    maxLength: 40,
  },
  gmv: {
    placeholder: 'Örn. 800.000 TL',
    helperText: 'Marketplace veya e-ticaret işlem hacmi varsa yazın.',
    maxLength: 40,
  },
  founderCount: {
    placeholder: 'Kurucu sayısı',
    helperText: 'Kaç kurucu var? Kişisel kimlik istemeyiz.',
  },
  teamSize: {
    placeholder: 'Ekip büyüklüğü',
    helperText: 'Kurucular dahil yaklaşık ekip büyüklüğü.',
  },
  founderExpertise: {
    helperText: 'Kurucu ve çekirdek ekibin uzmanlıkları. Birden fazla seçebilirsiniz.',
  },
  useOfFundsDetail: {
    placeholder: 'Örn. İlk 6 ay ürün ve 2 satış kişisi',
    helperText: 'İsteğe bağlı. Paranın nasıl dağılacağını kısaca yazın.',
    maxLength: 280,
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
    helperText: 'Bu turda paranın gideceği alanları seçin. Birden fazla seçebilirsiniz.',
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
    placeholder: 'Aşama seçin',
    helperText: 'Birden fazla aşama seçebilirsiniz. Tüm aşamalar tüm kanonik aşamaları kapsar.',
  },
  sectors: {
    helperText: 'Yatırım Arıyorum ile aynı sektör kataloğu. Birden fazla seçebilirsiniz.',
  },
  investorType: {
    placeholder: 'Yatırımcı tipi seçin',
    helperText: 'Melek, VC, kurumsal veya fon.',
  },
  preferredProductStatuses: {
    helperText: 'Yatırım Arıyorum ürün durumu ile aynı katalog.',
  },
  preferredBusinessModels: {
    helperText: 'Yatırım Arıyorum iş modeli ile aynı katalog.',
  },
  preferredTargetCustomers: {
    helperText: 'Yatırım Arıyorum hedef müşteri ile aynı katalog.',
  },
  revenueExpectation: {
    placeholder: 'Gelir beklentisi',
    helperText: '“Gelir yok” = gelir öncesi girişimler uygun. Seeking revenueStatus ile aynı değerler.',
  },
  tractionExpectation: {
    placeholder: 'Traction beklentisi',
    helperText: 'Seeking tractionStatus ile aynı kanonik değerler.',
  },
  preferredGeographies: {
    helperText: 'Türkiye geneli, yurt dışı veya iller. Seeking geography ile karşılaştırılır.',
  },
  equityPreference: {
    placeholder: 'Hisse yaklaşımı',
    helperText: 'Yatırım tavsiyesi değil; sizin kriteriniz.',
  },
  valuationApproach: {
    placeholder: 'Değerleme yaklaşımı',
    helperText: 'Yatırım tavsiyesi değil; sizin kriteriniz.',
  },
  preferredUseOfFunds: {
    helperText: 'Seeking useOfFunds ile aynı katalog. İsteğe bağlı.',
  },
  investmentThesis: {
    placeholder: 'Ne tür girişimlere yatırım yapmak istiyorsunuz?',
    helperText: 'Kısa tutun. AI yeni sektör veya tutar eklemez.',
    maxLength: 280,
  },
  mustHaveSignals: {
    helperText: 'Olmazsa olmaz kriterler. Yapılandırılmış seçim.',
  },
  dealBreakers: {
    helperText: 'Kesinlikle istemediğiniz durumlar.',
  },
  ticketMin: {
    placeholder: 'Örn. 750000',
    helperText: 'Özel tutar için minimum TL. Bant seçildiyse otomatik hesaplanır.',
  },
  ticketMax: {
    placeholder: 'Örn. 2000000',
    helperText: 'Özel tutar için maksimum TL.',
  },
  investmentFocus: {
    placeholder: 'Örn: Yapay zeka, erken aşama SaaS ve Türkiye odaklı yatırımlar',
    helperText: 'Yatırım stratejinizi ve odağınızı kısaca tanımlayın.',
    maxLength: 500,
  },
  desiredRole: {
    placeholder: 'Pozisyon seçin',
    helperText: 'Pozisyonu listeden seçin. Listede yoksa Diğer’i seçip açıklayın.',
  },
  primarySector: {
    placeholder: 'Sektör seçin',
    helperText: 'Sektörü seçin; pozisyon listesi buna göre dolar.',
  },
  desiredRoleOther: {
    placeholder: 'Örn: E-ticaret operasyon uzmanı',
    helperText: 'Listede yoksa pozisyonu kısaca yazın. Yalnızca boşluk kabul edilmez.',
    maxLength: 200,
  },
  experienceLevel: {
    placeholder: 'Deneyim seviyesi seçin',
    helperText: 'Pozisyonun deneyim seviyesini seçin.',
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
    helperText: 'Tam zamanlı, yarı zamanlı, proje bazlı, staj veya sözleşmeli.',
  },
  profileGender: {
    placeholder: 'Cinsiyet seçin',
    helperText:
      'Kartta yaş ve cinsiyet görünür. Kapak fotoğrafı da buna göre seçilir.',
  },
  birthDate: {
    placeholder: 'Doğum tarihi',
    helperText:
      'Kartta yalnızca yaş görünür. Tam doğum tarihi iletişim talebi kabul edilince işverene gösterilir.',
  },
  residenceCity: {
    placeholder: 'Yaşadığınız ili seçin',
    helperText:
      'Kamu kartında görünmez. İletişim talebi kabul edilince işverene gösterilir.',
  },
  residenceDistrict: {
    placeholder: 'Yaşadığınız ilçeyi seçin',
    helperText:
      'Kamu kartında görünmez. İletişim talebi kabul edilince işverene gösterilir. Önce ili seçin.',
  },
  remotePreference: {
    placeholder: 'Uzaktan çalışma tercihi seçin',
    helperText: 'Ofis, hibrit veya tam uzaktan çalışma tercihiniz.',
  },
  workplacePreference: {
    placeholder: 'Çalışma modeli seçin',
    helperText:
      'Ofis, saha, fabrika, vardiya, mağaza veya uzaktan — pozisyona uygun olanı seçin. İş Arıyorum ve İşe Alıyorum aynı listeyi kullanır.',
  },
  positionTitle: {
    placeholder: 'Pozisyon seçin',
    helperText: 'Açtığınız pozisyonu listeden seçin. Yoksa Diğer’i seçip açıklayın.',
  },
  positionTitleOther: {
    placeholder: 'Örn: Magento e-ticaret uzmanı — katalog ve kampanya yönetimi',
    helperText: 'Pozisyon listede yoksa en az 30 karakterle net yazın.',
    maxLength: 200,
  },
  preferredCity: {
    placeholder: 'İl seçin',
    helperText: 'İli seçin; ardından ilçe seçebilirsiniz.',
  },
  preferredDistrict: {
    placeholder: 'İlçe seçin',
    helperText: 'Tercih ettiğiniz ilçe. Listede yoksa Diğer’i seçip yazın.',
  },
  preferredDistrictOther: {
    placeholder: 'Örn: Yeni mahalle / belde adı',
    helperText: 'İlçe listede yoksa kısaca yazın.',
    maxLength: 120,
  },
  district: {
    placeholder: 'İlçe seçin',
    helperText: 'Pozisyonun ilçesi. Listede yoksa Diğer’i seçip yazın.',
  },
  districtOther: {
    placeholder: 'Örn: Yeni mahalle / belde adı',
    helperText: 'İlçe listede yoksa kısaca yazın.',
    maxLength: 120,
  },
  professionalSkills: {
    placeholder: 'Listeden seçin',
    helperText: 'Listeden en az bir mesleki yetkinlik seçin. Yoksa Diğer / Kendim gireceğim’i işaretleyip yazın.',
    maxLength: 1000,
  },
  technicalSkills: {
    placeholder: 'Örn: Excel ileri seviye, SAP temel, CRM kullanımı ve veri analizi',
    helperText: 'Teknik araç ve yöntemlerinizi yazın.',
    maxLength: 1000,
  },
  leadershipExperience: {
    placeholder: 'Örn: 8 kişilik saha ekibini yönettim; hedef ve performans takibi yaptım',
    helperText: 'Yönetim veya liderlik deneyiminiz varsa kısaca yazın.',
    maxLength: 1000,
  },
  tools: {
    placeholder: 'Listeden seçin',
    helperText: 'Günlük kullanılan araç ve programları listeden seçin. Yoksa Diğer’i işaretleyip yazın.',
    maxLength: 1500,
  },
  educationField: {
    placeholder: 'Örn: Bilgisayar Mühendisliği / İşletme',
    helperText: 'Mezun olduğunuz veya okuduğunuz bölüm.',
    maxLength: 200,
  },
  languages: {
    placeholder: 'Örn: İngilizce — İyi, Almanca — Temel',
    helperText: 'Dil ve seviyenizi yazın (belge yükleme yok).',
    maxLength: 500,
  },
  certificates: {
    placeholder: 'Örn: Google Analytics, PMP, Forklift operatör belgesi',
    helperText: 'Var ise sertifika adlarını yazın.',
    maxLength: 500,
  },
  preferredSectors: {
    helperText:
      'Deneyiminize göre ilgili sektörler önde gelir. Listede yoksa Diğer / Kendim gireceğim’i işaretleyip yazın.',
  },
  preferredRoles: {
    helperText:
      'Deneyiminizdeki pozisyona göre yönetim ve bağlantılı roller önde gelir. Listede yoksa kendiniz yazın.',
  },
  preferredRolesOther: {
    placeholder: 'Açık olduğunuz pozisyonu yazın',
    helperText: 'Pozisyon listede yoksa kısa ve net yazın.',
    maxLength: 200,
  },
  sectorOther: {
    placeholder: 'Örn: Dijital bankacılık / fintech şube operasyonu',
    helperText: 'Sektör listede yoksa kısa ve net yazın.',
    maxLength: 200,
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
    helperText: 'Pozisyon için gerekli dilleri seçin. En fazla 10 etiket.',
  },
  images: {
    helperText:
      'JPEG, PNG, WebP veya GIF. Sürükleyerek sıralayın; ilk görsel kapak olur. En az 640×360 px, en fazla 5 MB / görsel, en fazla 10 görsel.',
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
