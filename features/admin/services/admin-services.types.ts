import type { AdminDashboardService } from '@/features/admin/services/admin-dashboard.service';
import type { AdminProfilesService } from '@/features/admin/services/admin-profiles.service';
import type { AdminApplicationsService } from '@/features/admin/services/admin-applications.service';
import type { AdminPaymentsService } from '@/features/admin/services/admin-payments.service';
import type { AdminPackagesService } from '@/features/admin/services/admin-packages.service';
import type { AdminCouponsService, AdminReportService, AdminSettingsService } from '@/features/admin/services/admin-coupons.service';
import type { IAdminService } from '@/features/admin/services/admin.service.interface';

export interface AdminServices {
  core: IAdminService;
  dashboard: AdminDashboardService;
  profiles: AdminProfilesService;
  applications: AdminApplicationsService;
  payments: AdminPaymentsService;
  packages: AdminPackagesService;
  coupons: AdminCouponsService;
  reports: AdminReportService;
  settings: AdminSettingsService;
}
