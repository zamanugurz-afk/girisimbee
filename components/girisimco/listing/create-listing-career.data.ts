import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { CategoryId } from '@/lib/domain/ids';

/** Career create types — still selected via existing onSelect(categoryId). */
export const CREATE_LISTING_CAREER_CATEGORY_IDS = [
  CATEGORY_IDS.isBul,
  CATEGORY_IDS.iseAl,
] as const;

/**
 * Flat-grid order on /ilan/olustur (career types render in the career group).
 * Deferred types (yatirimYap, genelIlan) stay out — restore via CREATE_LISTING_DEFERRED_CATEGORY_IDS.
 */
export const CREATE_LISTING_PICKER_ORDER: CategoryId[] = [
  CATEGORY_IDS.yatirimBul,
  CATEGORY_IDS.ortakBul,
  CATEGORY_IDS.bayilikAl,
  CATEGORY_IDS.dijitalAi,
];

export const CREATE_LISTING_CAREER_COPY = {
  title: 'Kariyer ve İş Fırsatları',
  description:
    'İş arıyorsanız veya ekibinize yeni bir yetenek katmak istiyorsanız, ilan türünü seçin.',
  options: [
    {
      id: 'seek' as const,
      categoryId: CATEGORY_IDS.isBul,
      label: 'İş Arıyorum',
      description: 'Kariyerinizi ve deneyimlerinizi öne çıkarın.',
      benefits: [
        {
          title: 'Profilinizi oluşturun',
          text: 'Deneyim ve yetkinliklerinizi öne çıkarın.',
        },
        {
          title: 'Size uygun fırsatları keşfedin',
          text: 'Profiliniz üzerinden kariyer fırsatlarına ulaşın.',
        },
      ],
    },
    {
      id: 'hire' as const,
      categoryId: CATEGORY_IDS.iseAl,
      label: 'İşe Alıyorum',
      description: 'Aradığınız pozisyonu tanımlayın ve doğru yeteneği bulun.',
      benefits: [
        {
          title: 'Pozisyonunuzu tanımlayın',
          text: 'Aradığınız rol ve sorumlulukları belirleyin.',
        },
        {
          title: 'Yetkinlikleri belirleyin',
          text: 'Mesleki ve teknik beklentilerinizi tanımlayın.',
        },
        {
          title: 'Uygun adayları keşfedin',
          text: 'İhtiyacınıza uygun adaylarla iletişime geçin.',
        },
      ],
    },
  ],
} as const;
