import type { Repository } from '@/lib/domain/repository';
import type { ReportId } from '@/lib/domain/ids';
import type { Report, CreateReportInput, UpdateReportInput, ReportFilter } from '@/features/shared/types/report.types';

export interface ReportRepository
  extends Repository<Report, ReportId, CreateReportInput, UpdateReportInput, ReportFilter> {
  findByEntity(entityType: Report['entityType'], entityId: string): Promise<Report[]>;
  transitionStatus(id: ReportId, status: Report['status']): Promise<Report>;
}
