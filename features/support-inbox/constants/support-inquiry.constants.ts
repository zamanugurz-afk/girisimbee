import type {
  SupportInquiryChannel,
  SupportInquiryStatus,
  SupportInquirySubject,
} from '@/features/support-inbox/types/support-inquiry.types';

export const SUPPORT_INQUIRY_STATUS_LABELS: Record<SupportInquiryStatus, string> = {
  new: 'Yeni',
  reviewing: 'İnceleniyor',
  resolved: 'Çözüldü',
  closed: 'Kapandı',
};

export const SUPPORT_INQUIRY_SUBJECT_LABELS: Record<SupportInquirySubject, string> = {
  genel: 'Genel',
  teknik: 'Teknik sorun',
  hesap: 'Hesap / giriş',
  odeme: 'Ödeme',
  diger: 'Diğer',
};

export const SUPPORT_INQUIRY_CHANNEL_LABELS: Record<SupportInquiryChannel, string> = {
  support: 'Destek',
  info: 'Bilgi',
};

export const SUPPORT_ROUTES = {
  public: '/destek',
  admin: '/admin/destek',
} as const;
