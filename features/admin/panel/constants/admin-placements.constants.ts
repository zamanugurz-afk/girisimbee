import type {
  AdminPlacementStatus,
  AdminPlacementType,
} from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_PLACEMENT_TYPES: readonly AdminPlacementType[] = [
  'vitrin',
  'acil_vitrin',
] as const;

export const ADMIN_PLACEMENT_STATUSES: readonly AdminPlacementStatus[] = [
  'active',
  'pending',
  'expired',
  'cancelled',
] as const;

export const ADMIN_PLACEMENT_TYPE_LABELS: Record<AdminPlacementType, string> = {
  vitrin: 'Vitrin',
  acil_vitrin: 'Acil Vitrin',
};

export const ADMIN_PLACEMENT_STATUS_LABELS: Record<AdminPlacementStatus, string> = {
  active: 'Aktif',
  pending: 'Beklemede',
  expired: 'Süresi dolmuş',
  cancelled: 'İptal',
};

export const ADMIN_PLACEMENTS_PAGE_SIZE = 5;
export const ADMIN_PLACEMENT_EXTEND_DAYS = 7;
