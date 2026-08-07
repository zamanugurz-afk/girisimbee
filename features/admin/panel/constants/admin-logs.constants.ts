import type {
  AdminLogCategory,
  AdminLogStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_LOG_CATEGORIES: readonly AdminLogCategory[] = [
  'authentication',
  'listing',
  'payment',
  'moderation',
  'security',
  'system',
] as const;

export const ADMIN_LOG_STATUSES: readonly AdminLogStatus[] = [
  'success',
  'warning',
  'error',
] as const;

export const ADMIN_LOG_CATEGORY_LABELS: Record<AdminLogCategory, string> = {
  authentication: 'Authentication',
  listing: 'Listing',
  payment: 'Payment',
  moderation: 'Moderation',
  security: 'Security',
  system: 'System',
};

export const ADMIN_LOG_STATUS_LABELS: Record<AdminLogStatus, string> = {
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

export type AdminLogSortField = 'created_at' | 'status' | 'event_type' | 'actor';
export type AdminLogSortDir = 'asc' | 'desc';

export const ADMIN_LOGS_PAGE_SIZE = 8;
