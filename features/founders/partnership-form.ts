import {
  INVESTOR_SECTOR_OPTIONS,
  PARTNER_EXPERTISE_OPTIONS,
  STARTUP_STAGES,
} from '@/features/listings/config/listing-field-options';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';

export const PARTNER_EXPERIENCE_OPTIONS = [
  '0-1 yıl',
  '1-3 yıl',
  '3-5 yıl',
  '5-10 yıl',
  '10+ yıl',
] as const;

const SEEKING_FIELDS: ListingFieldSchema['fields'] = [
  {
    key: 'sector',
    label: 'Sektör',
    type: 'enum',
    required: true,
    options: [...INVESTOR_SECTOR_OPTIONS],
  },
  {
    key: 'projectStage',
    label: 'Ortaklık Aşaması',
    type: 'enum',
    required: true,
    options: [...STARTUP_STAGES],
  },
  {
    key: 'partnershipType',
    label: 'Aranan ortak tipi',
    type: 'enum',
    required: true,
    options: ['Teknik Ortak', 'İş Ortağı', 'Kurucu Ortak', 'Danışman'],
  },
  {
    key: 'expertise',
    label: 'Aranan uzmanlıklar',
    type: 'multi-enum',
    required: true,
    options: [...PARTNER_EXPERTISE_OPTIONS],
  },
  {
    key: 'expertiseOther',
    label: 'Özel Uzmanlık Belirtin',
    type: 'string',
    required: false,
  },
  {
    key: 'commitment',
    label: 'Taahhüt',
    type: 'enum',
    required: true,
    options: ['Tam zamanlı', 'Yarı zamanlı', 'Danışmanlık'],
  },
  {
    key: 'equityOffered',
    label: 'Sunulan hisse (%)',
    type: 'percentage',
    min: 0,
    max: 100,
  },
];

const JOINING_FIELDS: ListingFieldSchema['fields'] = [
  {
    key: 'expertise',
    label: 'Uzmanlık alanları',
    type: 'multi-enum',
    required: true,
    options: [...PARTNER_EXPERTISE_OPTIONS],
  },
  {
    key: 'expertiseOther',
    label: 'Özel Uzmanlık Belirtin',
    type: 'string',
    required: false,
  },
  {
    key: 'offeredSkills',
    label: 'Sunduğum yetkinlikler',
    type: 'multi-enum',
    required: true,
    options: [...PARTNER_EXPERTISE_OPTIONS],
  },
  {
    key: 'offeredSkillsOther',
    label: 'Özel Yetkinlik Belirtin',
    type: 'string',
    required: false,
  },
  {
    key: 'sectors',
    label: 'İlgilendiğim sektörler',
    type: 'multi-enum',
    required: true,
    options: [...INVESTOR_SECTOR_OPTIONS],
  },
  {
    key: 'partnershipType',
    label: 'İlgilendiğim girişim / proje tipi',
    type: 'enum',
    required: true,
    options: ['Teknik Ortak', 'İş Ortağı', 'Kurucu Ortak', 'Danışman'],
  },
  {
    key: 'projectStage',
    label: 'İlgilendiğim girişim aşaması',
    type: 'enum',
    options: [...STARTUP_STAGES],
  },
  {
    key: 'commitment',
    label: 'Ayırabileceğim zaman',
    type: 'enum',
    required: true,
    options: ['Tam zamanlı', 'Yarı zamanlı', 'Danışmanlık'],
  },
  {
    key: 'experience',
    label: 'Deneyim',
    type: 'enum',
    required: true,
    options: [...PARTNER_EXPERIENCE_OPTIONS],
  },
  {
    key: 'equityOffered',
    label: 'Hisse beklentisi (%)',
    type: 'percentage',
    min: 0,
    max: 100,
  },
];

export function getPartnerFormSchema(intent: PartnershipIntent): ListingFieldSchema {
  return { fields: intent === 'joining' ? JOINING_FIELDS : SEEKING_FIELDS };
}

export function getPartnerFormFieldKeys(intent: PartnershipIntent): string[] {
  return getPartnerFormSchema(intent).fields.map((field) => field.key);
}

export function partnerCoreFieldLabels(intent: PartnershipIntent) {
  if (intent === 'joining') {
    return {
      title: 'Profil Başlığı',
      shortDescription: 'Kısa Tanıtım',
      longDescription: 'Kendinizi Tanıtın',
      city: 'Lokasyon',
    };
  }
  return {
    title: 'Ortaklık Başlığı',
    shortDescription: 'Kısa Açıklama',
    longDescription: 'Proje ve Ortaklık Beklentisi',
    city: 'Lokasyon',
  };
}

export function partnerCoreFieldUi(intent: PartnershipIntent) {
  if (intent === 'joining') {
    return {
      title: {
        placeholder: 'Örn: Teknik Kurucu Ortak Olarak Katılmak İstiyorum',
        helperText: 'Uzmanlığınızı başlığa yansıtın. Her kelimenin ilk harfi büyük.',
        maxLength: 200,
      },
      shortDescription: {
        placeholder:
          'Örn: Yazılım ve ürün yönetimi deneyimimi erken aşama girişimlere sunuyorum; equity konuşulur.',
        helperText: 'Ortaklık kartlarında görünür. En az 30 karakter; iletişim bilgisi yazmayın.',
        maxLength: 500,
      },
      longDescription: {
        placeholder:
          'Örn: B2B SaaS ürünlerinde teknik liderlik yaptım. Erken aşama ekiplere mimari, ürün ve ekip kurma konusunda katkı vermek istiyorum. Haftalık düzenli zaman ayırabilirim. Tercihen İstanbul veya güçlü uzaktan çalışma disiplinine sahip ekipler.',
        helperText: 'Detay sayfasında gösterilir. En az 100 karakter. Telefon veya e-posta yazmayın.',
        maxLength: 10000,
      },
      city: {
        placeholder: 'Şehir seçin',
        helperText: 'Çalışabileceğiniz şehir (uzaktan ise yine belirtin).',
      },
    };
  }
  return undefined;
}
