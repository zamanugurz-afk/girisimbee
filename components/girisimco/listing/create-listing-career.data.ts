import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';

/** Career create types — still selected via existing onSelect(categoryId). */
export const CREATE_LISTING_CAREER_CATEGORY_IDS = [
  CATEGORY_IDS.isBul,
  CATEGORY_IDS.iseAl,
] as const;

/**
 * Root /ilan/olustur shows hub cards only (Kariyer / Ortaklık ve Devir).
 * Leaf types stay in CREATE_LISTING_TYPE_CONFIGS for deep-links and forms.
 */
export const CREATE_LISTING_PICKER_ORDER: CategoryId[] = [];

/** Kept in configs/forms; not shown as root picker cards. */
export const CREATE_LISTING_ROOT_HIDDEN_CATEGORY_IDS = [
  CATEGORY_IDS.yatirimBul,
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
  CATEGORY_IDS.dijitalAi,
] as const;

export const CREATE_LISTING_CAREER_HUB = {
  title: 'Kariyer ve İş Fırsatları',
  description: 'Kariyer profili yayınlayın veya açık pozisyon ilanı oluşturun.',
  audience: 'İşveren / iş arayan',
  benefits: [
    {
      title: 'İş Arıyorum',
      text: 'Kariyer profilinizi yayınlayın; uygun iş ilanlarına ulaşın.',
    },
    {
      title: 'İşe Alıyorum',
      text: 'Açık pozisyonu yayınlayın; uygun aday profillerine ulaşın.',
    },
    {
      title: 'Güvenli iletişim kurun',
      text: 'İletişim bilgileriniz paylaşılmadan talep üzerinden ilerleyin.',
    },
  ],
} as const;

export const CREATE_LISTING_VENTURE_HUB = {
  title: 'Ortaklık ve Devir',
  description: 'Ortak arayın, bir girişime katılın veya franchise fırsatı yayınlayın.',
  audience: 'Kurucu / ortak / franchise / işletme devri',
  benefits: [
    {
      title: 'Ortaklık',
      text: 'Ortak arayın veya bir girişime ortak olarak katılın.',
    },
    {
      title: 'Franchise',
      text: 'Franchise verin veya markaların franchise fırsatlarını alın.',
    },
    {
      title: 'İşletme Devri',
      text: 'Faal işletmenizi devredin veya hazır işletme devralın.',
    },
  ],
} as const;

export const CREATE_LISTING_VENTURE_CATEGORY_IDS = [
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
] as const;

export const CREATE_LISTING_ALL_VENTURE_CATEGORY_IDS = [
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
  CATEGORY_IDS.isletmeDevri,
] as const;

export const CREATE_LISTING_VENTURE_CATEGORIES_COPY = {
  title: 'Hangi girişim alanında ilan vermek istiyorsunuz?',
  description: 'Ortaklık, franchise veya işletme devri kategorilerinden size uygun olanı seçin.',
  trust: 'İletişim bilgileriniz gizli kalır. Bağlantı, güvenli talep üzerinden kurulur.',
  categories: [
    {
      id: 'partnership',
      label: 'Ortaklık',
      description: 'Kurucu ortak arayın veya uzmanlığınızla bir girişime ortak olun.',
      benefits: [
        {
          title: 'Ortak Arıyorum',
          text: 'Aradığınız uzmanlığı ve hisse/model beklentisini tanımlayın.',
        },
        {
          title: 'Ortak Olmak İstiyorum',
          text: 'Deneyiminizi ve sermaye/zaman katkınızı sunun.',
        },
        {
          title: 'Tamamlayıcı Eşleşme',
          text: 'Teknik, finans, satış ve operasyon profilleriyle eşleşin.',
        },
      ],
    },
    {
      id: 'business_transfer',
      label: 'İşletme Devri',
      description: 'Faal işletmenizi devredin veya kurulu bir işletmeyi devralın.',
      benefits: [
        {
          title: 'İşletmemi Devretmek İstiyorum',
          text: 'Demirbaş, ciro, kira ve faaliyet detaylarıyla ilanınızı açın.',
        },
        {
          title: 'İşletme Devralmak İstiyorum',
          text: 'Bütçeniz ve hedef sektörünüzle hazır işletmelere ulaşın.',
        },
        {
          title: 'Hızlı & Güvenli Devir',
          text: 'Kira, lokasyon ve bütçe kriterlerine göre nokta eşleşin.',
        },
      ],
    },
    {
      id: 'franchise',
      label: 'Franchise',
      description: 'Markanız için franchise veya bayilik fırsatınızı yayınlayın.',
      benefits: [
        {
          title: 'Markanızı Tanıtın',
          text: 'Şube sayısı, sektör ve kurumsal bilgilerinizi paylaşın.',
        },
        {
          title: 'Yatırım ve Şartlar',
          text: 'Giriş bedeli, royalty ve minimum sermaye gereksinimlerini belirtin.',
        },
        {
          title: 'Lokasyon Hedefleri',
          text: 'Büyümek istediğiniz şehir ve bölgelerdeki yatırımcılara ulaşın.',
        },
      ],
    },
  ],
} as const;

export const CREATE_LISTING_VENTURE_SUB_OPTIONS = {
  partnership: [
    {
      id: 'ortak-ariyorum',
      categoryId: CATEGORY_IDS.ortakBul,
      intent: 'seeking' as const,
      label: 'Ortak Arıyorum',
      description: 'Aradığınız uzmanlığı tanımlayın ve ortaklık ilanınızı yayınlayın.',
      benefits: [
        {
          title: 'İhtiyacınız olan uzmanlığı tanımlayın',
          text: 'Aradığınız yetkinliği ve ortaklık beklentisini netleştirin.',
        },
        {
          title: 'Size uygun ortakları keşfedin',
          text: 'İlanınız doğru yetkinlikteki kişilere ulaşsın.',
        },
        {
          title: 'Güvenli iletişim',
          text: 'İletişim bilgileriniz paylaşılmadan talep üzerinden ilerleyin.',
        },
      ],
    },
    {
      id: 'ortak-olmak',
      categoryId: CATEGORY_IDS.ortakBul,
      intent: 'joining' as const,
      label: 'Ortak Olmak İstiyorum',
      description: 'Uzmanlığınızı yayınlayın; size uygun girişimlerle buluşun.',
      benefits: [
        {
          title: 'Yetkinliklerinizi öne çıkarın',
          text: 'Deneyiminizi ve katkı modelinizi net gösterin.',
        },
        {
          title: 'Doğru girişimleri keşfedin',
          text: 'İlgi duyduğunuz sektörlerdeki fırsatlara ulaşın.',
        },
        {
          title: 'Güvenli iletişim',
          text: 'İletişim bilgileriniz paylaşılmadan talep üzerinden ilerleyin.',
        },
      ],
    },
  ],
  business_transfer: [
    {
      id: 'isletme-devret',
      categoryId: CATEGORY_IDS.isletmeDevri,
      intent: 'sell' as const,
      label: 'İşletmemi Devretmek İstiyorum',
      description: 'Faal veya hazır işletmenizi yeni sahibine güvenle devredin.',
      benefits: [
        {
          title: 'İşletme detaylarını paylaşın',
          text: 'Kira, çalışan sayısı ve demirbaş kapsamını ekleyin.',
        },
        {
          title: 'Devir bedelini belirleyin',
          text: 'Hedef devir tutarınızı ve koşullarınızı netleştirin.',
        },
        {
          title: 'Ciddi alıcılara ulaşın',
          text: 'Yatırım bütçesi hazır girişimcilerle eşleşin.',
        },
      ],
    },
    {
      id: 'isletme-devral',
      categoryId: CATEGORY_IDS.isletmeDevri,
      intent: 'buy' as const,
      label: 'İşletme Devralmak İstiyorum',
      description: 'Sıfırdan kurmak yerine hazır, kurulu bir işletmeyi devralın.',
      benefits: [
        {
          title: 'Bütçenizi ve sektörünüzü seçin',
          text: 'Aradığınız işletme türü ve lokasyonu tanımlayın.',
        },
        {
          title: 'Aktif işletmeleri inceleyin',
          text: 'Cirolu, faal veya fırsat işletmeleri değerlendirin.',
        },
        {
          title: 'Güvenli devir süreci',
          text: 'Detayları doğrudan işletme sahibiyle görüşün.',
        },
      ],
    },
  ],
} as const;

export const CREATE_LISTING_VENTURE_COPY = {
  title: 'Ne tür bir girişim veya iş fırsatı ilanı vermek istiyorsunuz?',
  description:
    'Ortaklık, franchise veya işletme devri alanında size uygun olan kategoriyi ve ilan yönünü seçin.',
  trust: 'İletişim bilgileriniz gizli kalır. Bağlantı, güvenli iletişim talebiyle kurulur.',
  options: [
    {
      id: 'ortak-ariyorum',
      categoryId: CATEGORY_IDS.ortakBul,
      intent: 'seeking' as const,
      label: 'Ortak Arıyorum',
      description: 'Aradığınız uzmanlığı tanımlayın ve ortaklık ilanınızı yayınlayın.',
      benefits: [
        {
          title: 'İhtiyacınız olan uzmanlığı tanımlayın',
          text: 'Aradığınız yetkinliği ve ortaklık beklentisini netleştirin.',
        },
        {
          title: 'Size uygun ortakları keşfedin',
          text: 'İlanınız doğru yetkinlikteki kişilere ulaşsın.',
        },
        {
          title: 'Güvenli iletişim talebi gönderin',
          text: 'İletişim bilgileriniz paylaşılmadan ilerleyin.',
        },
      ],
    },
    {
      id: 'ortak-olmak',
      categoryId: CATEGORY_IDS.ortakBul,
      intent: 'joining' as const,
      label: 'Ortak Olmak İstiyorum',
      description: 'Uzmanlığınızı yayınlayın; size uygun girişimlerle buluşun.',
      benefits: [
        {
          title: 'Yetkinliklerinizi öne çıkarın',
          text: 'Deneyiminizi ve katkı modelinizi net gösterin.',
        },
        {
          title: 'Doğru girişimleri keşfedin',
          text: 'İlgi duyduğunuz sektörlerdeki fırsatlara ulaşın.',
        },
        {
          title: 'Güvenli iletişim talebi gönderin',
          text: 'İletişim bilgileriniz paylaşılmadan ilerleyin.',
        },
      ],
    },
    {
      id: 'franchise',
      categoryId: CATEGORY_IDS.bayilikAl,
      label: 'Franchise Fırsatları',
      description: 'Markanızın franchise fırsatını yayınlayın.',
      benefits: [
        {
          title: 'Markanızı tanıtın',
          text: 'Franchise fırsatınızı yayınlayın.',
        },
        {
          title: 'Yatırım aralığını belirtin',
          text: 'Giriş bedeli ve franchise modelinizi açıklayın.',
        },
        {
          title: 'Lokasyonları belirtin',
          text: 'Faaliyet göstermek istediğiniz lokasyonları ekleyin.',
        },
      ],
    },
  ],
} as const;

export const CREATE_LISTING_CAREER_TRUST =
  'Güvenli, şeffaf ve doğru eşleşmeler için buradayız.';

/** /ilan/olustur cards — “Neden Girişimbee'de ilan oluşturmalıyım?” */
export const CREATE_LISTING_CAREER_COPY = {
  title: 'Ne tür bir kariyer ilanı vermek istiyorsunuz?',
  description:
    'İş arıyorsanız veya ekibinize yeni bir yetenek katmak istiyorsanız size uygun ilan türünü seçin.',
  options: [
    {
      id: 'seek' as const,
      categoryId: CATEGORY_IDS.isBul,
      label: 'İş Arıyorum',
      description:
        'Kariyer profilinizi yayınlayın; uygun iş ilanlarına iletişim talebiyle ulaşın.',
      benefits: [
        {
          title: 'Profilinizi oluşturun',
          text: 'Deneyim ve yetkinliklerinizi tek yerde öne çıkarın.',
        },
        {
          title: 'Size uygun fırsatları keşfedin',
          text: 'Profilinize uygun ilanlara daha kolay ulaşın.',
        },
        {
          title: 'Gizliliğinizi koruyun',
          text: 'İletişim bilgileriniz paylaşılmadan talep üzerinden ilerleyin.',
        },
      ],
    },
    {
      id: 'hire' as const,
      categoryId: CATEGORY_IDS.iseAl,
      label: 'İşe Alıyorum',
      description:
        'Açık pozisyonu yayınlayın; uygun aday profillerine iletişim talebiyle ulaşın.',
      benefits: [
        {
          title: 'Pozisyonunuzu tanımlayın',
          text: 'Aradığınız rolü ve beklentilerinizi netleştirin.',
        },
        {
          title: 'Doğru yeteneklere ulaşın',
          text: 'Aradığınız özellikleri taşıyan adayları keşfedin.',
        },
        {
          title: 'Güvenli iletişim kurun',
          text: 'İletişim talebiyle adaylarla kontrollü şekilde bağlantı kurun.',
        },
      ],
    },
  ],
} as const;
