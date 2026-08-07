// Feature: shared — layout, config, premium gates, cross-cutting domain
export {
  ENABLE_PREMIUM,
  isPremiumEnabled,
  filterPremiumLabels,
  MVP_COPY,
} from '@/features/shared/config/features';

export {
  CONTACT_EMAILS,
  CONTACT_MAILTO,
  contactMailto,
} from '@/features/shared/constants/contact';
export type { ContactEmailKey } from '@/features/shared/constants/contact';

export { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';
export {
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_TAGLINE_HIGHLIGHT,
  BRAND_PAGE_TITLE,
  BRAND_COLORS,
} from '@/features/shared/constants/brand';

export { Header as SiteHeader } from '@/components/girisimco/header';
export { Footer as SiteFooter } from '@/components/girisimco/footer';
export { GirisimbeeLogo as SiteLogo, GirisimbeeLogo, GirisimcoLogo } from '@/components/girisimco/logo';

export * from '@/features/shared/premium';

// Domain: Report, Activity, Subscription
export type {
  Report,
  ReportReason,
  ReportEntityType,
  ReportStatus,
  CreateReportInput,
  UpdateReportInput,
  ReportFilter,
} from '@/features/shared/types/report.types';
export { REPORT_INDEXES, REPORT_LIFECYCLE, REPORT_VALIDATION } from '@/features/shared/types/report.types';

export type {
  Activity,
  ActivityVerb,
  ActivityEntityType,
  CreateActivityInput,
  ActivityFilter,
} from '@/features/shared/types/activity.types';
export { ACTIVITY_INDEXES, ACTIVITY_VALIDATION } from '@/features/shared/types/activity.types';

export type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionFilter,
} from '@/features/shared/types/subscription.types';
export { SUBSCRIPTION_INDEXES, SUBSCRIPTION_LIFECYCLE, SUBSCRIPTION_VALIDATION } from '@/features/shared/types/subscription.types';

export type { ReportRepository } from '@/features/shared/repositories/report.repository';
export type { ActivityRepository } from '@/features/shared/repositories/activity.repository';
export type { SubscriptionRepository } from '@/features/shared/repositories/subscription.repository';

export type {
  IReportService,
  IActivityService,
  ISubscriptionService,
} from '@/features/shared/services/moderation.service.interface';

export {
  reportSchema,
  createReportSchema,
  activitySchema,
  createActivitySchema,
  subscriptionSchema,
} from '@/features/shared/validation/moderation.schema';

export {
  createReport,
  createActivity,
  createSubscription,
  createReportInput,
  createActivityInput,
  createSubscriptionInput,
} from '@/features/shared/factories/moderation.factory';

export {
  generateMockReport,
  generateMockActivity,
  generateMockSubscription,
  generateMockActivities,
  generateMockReports,
} from '@/features/shared/mock/moderation.generator';
