import type {
  AdminComplaintStatus,
  AdminComplaintType,
} from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_COMPLAINT_TYPES: readonly AdminComplaintType[] = [
  'user_complaint',
  'listing_complaint',
  'fraud',
  'spam',
  'inappropriate',
] as const;

export const ADMIN_COMPLAINT_STATUSES: readonly AdminComplaintStatus[] = [
  'pending',
  'reviewing',
  'approved',
  'rejected',
] as const;

export const ADMIN_COMPLAINT_TYPE_LABELS: Record<AdminComplaintType, string> = {
  user_complaint: 'Kullanıcı şikâyeti',
  listing_complaint: 'İlan şikâyeti',
  fraud: 'Dolandırıcılık',
  spam: 'Spam',
  inappropriate: 'Uygunsuz içerik',
};

export const ADMIN_COMPLAINT_STATUS_LABELS: Record<AdminComplaintStatus, string> = {
  pending: 'Beklemede',
  reviewing: 'İnceleniyor',
  approved: 'Onaylandı / Kapatıldı',
  rejected: 'Reddedildi',
};

export const ADMIN_COMPLAINT_SECTIONS: readonly {
  id: AdminComplaintType;
  label: string;
}[] = [
  { id: 'user_complaint', label: 'Kullanıcı şikâyetleri' },
  { id: 'listing_complaint', label: 'İlan şikâyetleri' },
  { id: 'fraud', label: 'Dolandırıcılık bildirimleri' },
  { id: 'spam', label: 'Spam bildirimleri' },
  { id: 'inappropriate', label: 'Uygunsuz içerik bildirimleri' },
] as const;

export const ADMIN_COMPLAINT_ASSIGNEES = [
  'Can Yılmaz',
  'Uğur Admin',
  'Burak Şahin',
] as const;

export const ADMIN_COMPLAINTS_PAGE_SIZE = 5;
