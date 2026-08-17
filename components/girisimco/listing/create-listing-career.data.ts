import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';

/** Career create types — still selected via existing onSelect(categoryId). */
export const CREATE_LISTING_CAREER_CATEGORY_IDS = [
  CATEGORY_IDS.isBul,
  CATEGORY_IDS.iseAl,
] as const;

/**
 * Root /ilan/olustur shows hub cards only (Kariyer / Girişim ve Ortaklık).
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
  title: 'Girişim ve Ortaklık',
  description: 'Ortak arayın, bir girişime katılın veya franchise fırsatı yayınlayın.',
  audience: 'Kurucu / ortak / franchise',
  benefits: [
    {
      title: 'Ortak Arıyorum',
      text: 'Aradığınız uzmanlığı tanımlayın ve ortaklık ilanınızı yayınlayın.',
    },
    {
      title: 'Ortak Olmak İstiyorum',
      text: 'Uzmanlığınızı yayınlayın; size uygun girişimlerle buluşun.',
    },
    {
      title: 'Franchise Fırsatları',
      text: 'Markanızın franchise fırsatını yayınlayın.',
    },
  ],
} as const;

export const CREATE_LISTING_VENTURE_CATEGORY_IDS = [
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
] as const;

export const CREATE_LISTING_VENTURE_COPY = {
  title: 'Ne tür bir girişim veya ortaklık ilanı vermek istiyorsunuz?',
  description:
    'Ortak arıyorsanız, ortak olmak istiyorsanız veya franchise fırsatı yayınlıyorsanız size uygun türü seçin.',
  trust: 'İletişim bilgileriniz gizli kalır. Bağlantı, iletişim talebiyle kurulur.',
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
          text: 'İlanınız doğru kişilere ulaşsın.',
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
          title: 'İlgi alanlarını ve yetkinliklerinizi öne çıkarın',
          text: 'Deneyiminizi kısa ve net şekilde gösterin.',
        },
        {
          title: 'Size uygun girişimleri keşfedin',
          text: 'Doğru ortaklık fırsatlarına ulaşın.',
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
