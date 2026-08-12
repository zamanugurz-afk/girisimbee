export const SUPPORT_INQUIRY_CHANNELS = ['support', 'info'] as const;
export type SupportInquiryChannel = (typeof SUPPORT_INQUIRY_CHANNELS)[number];

export const SUPPORT_INQUIRY_STATUSES = [
  'new',
  'reviewing',
  'resolved',
  'closed',
] as const;
export type SupportInquiryStatus = (typeof SUPPORT_INQUIRY_STATUSES)[number];

export const SUPPORT_INQUIRY_SUBJECTS = [
  'genel',
  'teknik',
  'hesap',
  'odeme',
  'diger',
] as const;
export type SupportInquirySubject = (typeof SUPPORT_INQUIRY_SUBJECTS)[number];

export type SupportInquiry = {
  id: string;
  channel: SupportInquiryChannel;
  status: SupportInquiryStatus;
  subject: SupportInquirySubject;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  adminNote: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupportInquiryInput = {
  channel?: SupportInquiryChannel;
  subject: SupportInquirySubject;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
};

export type UpdateSupportInquiryInput = {
  status?: SupportInquiryStatus;
  adminNote?: string | null;
};
