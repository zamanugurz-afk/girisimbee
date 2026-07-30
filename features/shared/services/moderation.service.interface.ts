import type { ReportId, UserId } from '@/lib/domain/ids';
import type { Report, CreateReportInput, ReportFilter } from '@/features/shared/types/report.types';
import type { Activity, CreateActivityInput, ActivityFilter } from '@/features/shared/types/activity.types';
import type { Subscription, CreateSubscriptionInput } from '@/features/shared/types/subscription.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface IReportService {
  submit(input: CreateReportInput): Promise<Report>;
  getById(id: ReportId): Promise<Report | null>;
  listPending(pagination?: PaginationParams): Promise<PaginatedResult<Report>>;
  resolve(id: ReportId, reviewerId: UserId, resolution: string): Promise<Report>;
  dismiss(id: ReportId, reviewerId: UserId): Promise<Report>;
  listByEntity(entityType: Report['entityType'], entityId: string): Promise<Report[]>;
}

export interface IActivityService {
  record(input: CreateActivityInput): Promise<Activity>;
  getPublicFeed(pagination?: PaginationParams): Promise<PaginatedResult<Activity>>;
  getByEntity(entityType: Activity['entityType'], entityId: string, pagination?: PaginationParams): Promise<PaginatedResult<Activity>>;
  search(filter: ActivityFilter, pagination?: PaginationParams): Promise<PaginatedResult<Activity>>;
}

export interface ISubscriptionService {
  getByUserId(userId: UserId): Promise<Subscription | null>;
  create(input: CreateSubscriptionInput): Promise<Subscription>;
  cancel(userId: UserId): Promise<Subscription>;
  isPremium(userId: UserId): Promise<boolean>;
}
