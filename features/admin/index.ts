export type { IAdminService, AdminDashboardStats, AdminUserView, AdminSearchResults } from '@/features/admin/services/admin.service.interface';
export type { AdminServices } from '@/features/admin/services/admin-services.types';
export type * from '@/features/admin/types/admin.types';
export { AdminService } from '@/features/admin/services/admin.service';
export { AdminDashboardService } from '@/features/admin/services/admin-dashboard.service';
export { requireAdminSession } from '@/features/admin/lib/require-admin';
export { adminApi } from '@/features/admin/lib/admin-api-client';
