import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';

/** Career create types — still selected via existing onSelect(categoryId). */
export const CREATE_LISTING_CAREER_CATEGORY_IDS = [
  CATEGORY_IDS.isBul,
  CATEGORY_IDS.iseAl,
] as const;

/**
 * Flat-grid order on /ilan/olustur (career hub is a separate parent card).
 * Deferred types (yatirimYap, genelIlan) stay out — restore via CREATE_LISTING_DEFERRED_CATEGORY_IDS.
 */
export const CREATE_LISTING_PICKER_ORDER: CategoryId[] = [
  CATEGORY_IDS.yatirimBul,
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
  CATEGORY_IDS.dijitalAi,
];

export const CREATE_LISTING_CAREER_HUB = {
  title: 'Kariyer ve İş Fırsatları',
  description: 'İş arayanlar ve işverenler için doğru fırsatı bulun.',
  audience: 'İşveren / iş arayan',
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
        'Profilinizi oluşturun; uygun fırsatlara gizliliğinizi koruyarak ulaşın.',
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
        'Pozisyonunuzu tanımlayın; doğru yeteneklere güvenli iletişimle ulaşın.',
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
