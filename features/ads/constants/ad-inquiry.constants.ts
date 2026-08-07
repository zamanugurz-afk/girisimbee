import type {
  AdInquiryKind,
  AdInquiryStatus,
  PartnershipType,
} from '@/features/ads/types/ad-inquiry.types';

/** Fixed price for standard MARKET catalog ads (TL). */
export const MARKET_AD_PRICE_TL = 5000;

export const MARKET_AD_PRICE_LABEL = '5.000 TL';

export const AD_INQUIRY_KIND_LABELS: Record<AdInquiryKind, string> = {
  market_ad: 'MARKET reklamı',
  partnership: 'Özel işbirliği',
};

export const AD_INQUIRY_STATUS_LABELS: Record<AdInquiryStatus, string> = {
  new: 'Yeni',
  reviewing: 'İnceleniyor',
  accepted: 'Kabul',
  rejected: 'Red',
  closed: 'Kapatıldı',
};

export const PARTNERSHIP_TYPE_LABELS: Record<PartnershipType, string> = {
  sponsorship: 'Sponsorluk',
  content: 'İçerik / yayın',
  event: 'Etkinlik',
  media: 'Medya / PR',
  other: 'Diğer',
};

export const ADS_ROUTES = {
  public: '/reklam',
  admin: '/admin/reklam',
  market: '/market',
} as const;
