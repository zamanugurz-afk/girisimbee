import type {
  AdminSupportCategory,
  AdminSupportPriority,
  AdminSupportSection,
  AdminSupportStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_SUPPORT_SECTIONS: readonly {
  id: AdminSupportSection;
  label: string;
}[] = [
  { id: 'tickets', label: 'Destek talepleri' },
  { id: 'live_chat', label: 'Canlı destek' },
  { id: 'email_inbox', label: 'E-posta kutusu' },
  { id: 'faq', label: 'SSS yönetimi' },
  { id: 'operators', label: 'Operatör yönetimi' },
  { id: 'auto_replies', label: 'Otomatik yanıtlar' },
] as const;

export const ADMIN_SUPPORT_CATEGORIES: readonly AdminSupportCategory[] = [
  'technical',
  'payment',
  'account',
  'listing',
  'investor_verification',
  'franchise_verification',
  'user_complaint',
  'other',
] as const;

export const ADMIN_SUPPORT_PRIORITIES: readonly AdminSupportPriority[] = [
  'low',
  'normal',
  'high',
  'critical',
] as const;

export const ADMIN_SUPPORT_STATUSES: readonly AdminSupportStatus[] = [
  'open',
  'waiting',
  'assigned',
  'resolved',
  'closed',
] as const;

export const ADMIN_SUPPORT_CATEGORY_LABELS: Record<AdminSupportCategory, string> = {
  technical: 'Teknik destek',
  payment: 'Ödeme sorunları',
  account: 'Hesap sorunları',
  listing: 'İlan sorunları',
  investor_verification: 'Yatırımcı doğrulaması',
  franchise_verification: 'Franchise doğrulaması',
  user_complaint: 'Kullanıcı şikâyetleri',
  other: 'Diğer',
};

export const ADMIN_SUPPORT_PRIORITY_LABELS: Record<AdminSupportPriority, string> = {
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek',
  critical: 'Kritik',
};

export const ADMIN_SUPPORT_STATUS_LABELS: Record<AdminSupportStatus, string> = {
  open: 'Açık',
  waiting: 'Bekliyor',
  assigned: 'Atandı',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
};

export const ADMIN_SUPPORT_OPERATORS = [
  { id: 'opr_01', name: 'Can Yılmaz' },
  { id: 'opr_02', name: 'Burak Şahin' },
  { id: 'opr_03', name: 'Uğur Admin' },
] as const;

export const ADMIN_SUPPORT_PAGE_SIZE = 5;
