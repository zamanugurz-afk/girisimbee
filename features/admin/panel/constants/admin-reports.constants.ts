import type { AdminReportPeriod } from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_REPORT_PERIODS: readonly AdminReportPeriod[] = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;

export const ADMIN_REPORT_PERIOD_LABELS: Record<AdminReportPeriod, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  yearly: 'Yıllık',
};
