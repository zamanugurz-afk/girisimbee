export const AD_INQUIRY_KINDS = ['market_ad', 'partnership'] as const;
export type AdInquiryKind = (typeof AD_INQUIRY_KINDS)[number];

export const AD_INQUIRY_STATUSES = [
  'new',
  'reviewing',
  'accepted',
  'rejected',
  'closed',
] as const;
export type AdInquiryStatus = (typeof AD_INQUIRY_STATUSES)[number];

export const PARTNERSHIP_TYPES = [
  'sponsorship',
  'content',
  'event',
  'media',
  'other',
] as const;
export type PartnershipType = (typeof PARTNERSHIP_TYPES)[number];

export type AdInquiry = {
  id: string;
  kind: AdInquiryKind;
  status: AdInquiryStatus;
  fullName: string;
  email: string;
  phone: string | null;
  company: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  ctaLabel: string | null;
  priceTl: number | null;
  partnershipType: string | null;
  message: string | null;
  adminNote: string | null;
  paymentId: string | null;
  paymentSessionId: string | null;
  marketItemId: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMarketAdInquiryInput = {
  kind: 'market_ad';
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  ctaLabel?: string;
};

export type CreatePartnershipInquiryInput = {
  kind: 'partnership';
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  partnershipType: PartnershipType | string;
  message: string;
};

export type CreateAdInquiryInput =
  | CreateMarketAdInquiryInput
  | CreatePartnershipInquiryInput;

export type UpdateAdInquiryInput = {
  status?: AdInquiryStatus;
  adminNote?: string | null;
  paymentId?: string | null;
  paymentSessionId?: string | null;
  marketItemId?: string | null;
};
