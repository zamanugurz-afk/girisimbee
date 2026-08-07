/**
 * Dependency injection container — swaps mock vs Supabase repositories.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolvePersistenceDriver } from '@/lib/persistence/types';

import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { TagRepository } from '@/features/listings/repositories/tag.repository';
import type { ListingImageRepository } from '@/features/listings/repository/listing-image.repository';
import type { ActivityRepository } from '@/features/shared/repositories/activity.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { FollowRepository } from '@/features/profiles/repositories/follow.repository';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { CompanyMemberRepository, CompanyFollowRepository } from '@/features/companies/repositories/company-social.repository';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import type { NotificationRepository } from '@/features/notifications/repositories/notification.repository';
import type { ConversationRepository } from '@/features/messaging/repositories/conversation.repository';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';
import type { UserRepository } from '@/features/authentication/repositories/user.repository';
import type { ReportRepository } from '@/features/shared/repositories/report.repository';
import type { VerificationRepository } from '@/features/authentication/repositories/verification.repository';

import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockTagRepository } from '@/features/listings/repository/mock/tag.repository.mock';
import { MockListingImageRepository } from '@/features/listings/repository/mock/listing-image.repository.mock';
import { MockActivityRepository } from '@/features/shared/repository/mock/activity.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { MockFollowRepository } from '@/features/profiles/repository/mock/follow.repository.mock';
import { MockCompanyRepository } from '@/features/companies/repository/mock/company.repository.mock';
import {
  MockCompanyMemberRepository,
  MockCompanyFollowRepository,
} from '@/features/companies/repository/mock/company-social.repository.mock';
import { MockFavoriteRepository } from '@/features/favorites/repository/mock/favorite.repository.mock';
import { MockNotificationRepository } from '@/features/notifications/repository/mock/notification.repository.mock';
import { MockConversationRepository } from '@/features/messaging/repository/mock/conversation.repository.mock';
import { MockMessageRepository } from '@/features/messaging/repository/mock/message.repository.mock';
import { MockUserRepository } from '@/features/authentication/repository/mock/user.repository.mock';
import { MockReportRepository } from '@/features/shared/repository/mock/report.repository.mock';
import { MockVerificationRepository } from '@/features/authentication/repository/mock/verification.repository.mock';

import { SupabaseListingRepository } from '@/features/listings/repository/supabase/listing.repository.supabase';
import { EmployerListingRepository } from '@/features/employers/repository/supabase/employer-listing.repository.supabase';
import { SupabaseTagRepository } from '@/features/listings/repository/supabase/tag.repository.supabase';
import { SupabaseListingImageRepository } from '@/features/listings/repository/supabase/listing-image.repository.supabase';
import { SupabaseActivityRepository } from '@/features/shared/repository/supabase/activity.repository.supabase';
import { SupabaseProfileRepository } from '@/features/profiles/repository/supabase/profile.repository.supabase';
import { SupabaseFollowRepository } from '@/features/profiles/repository/supabase/follow.repository.supabase';
import { SupabaseCompanyRepository } from '@/features/companies/repository/supabase/company.repository.supabase';
import {
  SupabaseCompanyMemberRepository,
  SupabaseCompanyFollowRepository,
} from '@/features/companies/repository/supabase/company-social.repository.supabase';
import { SupabaseFavoriteRepository } from '@/features/favorites/repository/supabase/favorite.repository.supabase';
import { SupabaseNotificationRepository } from '@/features/notifications/repository/supabase/notification.repository.supabase';
import { SupabaseConversationRepository } from '@/features/messaging/repository/supabase/conversation.repository.supabase';
import { SupabaseMessageRepository } from '@/features/messaging/repository/supabase/message.repository.supabase';
import { SupabaseUserRepository } from '@/features/authentication/repository/supabase/user.repository.supabase';
import { SupabaseReportRepository } from '@/features/shared/repository/supabase/report.repository.supabase';
import { SupabaseVerificationRepository } from '@/features/authentication/repository/supabase/verification.repository.supabase';

import { ListingEngine } from '@/features/listings/engine/listing-engine.service';
import { ListingBrowseService } from '@/features/listings/services/listing-browse.service';
import { ProfileService } from '@/features/profiles/services/profile.service';
import { CompanyService } from '@/features/companies/services/company.service';
import { FavoriteService } from '@/features/favorites/services/favorite.service';
import { NotificationService } from '@/features/notifications/services/notification.service';
import { MessagingService } from '@/features/messaging/services/messaging.service';
import { AdminService } from '@/features/admin/services/admin.service';
import { AdminDashboardService } from '@/features/admin/services/admin-dashboard.service';
import { AdminProfilesService } from '@/features/admin/services/admin-profiles.service';
import { AdminApplicationsService } from '@/features/admin/services/admin-applications.service';
import { AdminPaymentsService } from '@/features/admin/services/admin-payments.service';
import { AdminPackagesService } from '@/features/admin/services/admin-packages.service';
import {
  AdminCouponsService,
  AdminReportService,
  AdminSettingsService,
} from '@/features/admin/services/admin-coupons.service';
import type { AdminServices } from '@/features/admin/services/admin-services.types';
import { ListingPackageService } from '@/features/monetization/services/listing-package.service';
import type { IListingPackageService } from '@/features/monetization/services/listing-package.service';
import type { IPaymentService } from '@/features/monetization/services/payment.service.interface';
import type { MarketplaceSettingsRepository } from '@/features/monetization/repositories/marketplace-settings.repository';
import type { ListingPackageRepository } from '@/features/monetization/repositories/listing-package.repository';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { MatchRepository } from '@/features/matching/repositories/match.repository';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { DocumentRepository } from '@/features/documents/repositories/document.repository';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { FranchisePackageRepository } from '@/features/franchise/repositories/franchise-package.repository';
import type { EmployerPackageRepository } from '@/features/employers/repositories/employer-package.repository';
import type { CandidatePackageRepository } from '@/features/candidates/repositories/candidate-package.repository';
import type { EntrepreneurPackageRepository } from '@/features/entrepreneurs/repositories/entrepreneur-package.repository';
import type { InvestorPackageRepository } from '@/features/investors/repositories/investor-package.repository';
import type { FounderPackageRepository } from '@/features/founders/repositories/founder-package.repository';
import { MockMarketplaceSettingsRepository } from '@/features/monetization/repository/mock/marketplace-settings.repository.mock';
import { MockListingPackageRepository } from '@/features/monetization/repository/mock/listing-package.repository.mock';
import { MockModuleProfileRepository } from '@/features/profiles/repository/mock/module-profile.repository.mock';
import { MockMatchRepository } from '@/features/matching/repository/mock/match.repository.mock';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';
import { MockDocumentRepository } from '@/features/documents/repository/mock/document.repository.mock';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';
import { MockFranchisePackageRepository } from '@/features/franchise/repository/mock/franchise-package.repository.mock';
import { MockEmployerPackageRepository } from '@/features/employers/repository/mock/employer-package.repository.mock';
import { MockCandidatePackageRepository } from '@/features/candidates/repository/mock/candidate-package.repository.mock';
import { MockEntrepreneurPackageRepository } from '@/features/entrepreneurs/repository/mock/entrepreneur-package.repository.mock';
import { MockInvestorPackageRepository } from '@/features/investors/repository/mock/investor-package.repository.mock';
import { MockFounderPackageRepository } from '@/features/founders/repository/mock/founder-package.repository.mock';
import { SupabaseMarketplaceSettingsRepository } from '@/features/monetization/repository/supabase/marketplace-settings.repository.supabase';
import { SupabaseListingPackageRepository } from '@/features/monetization/repository/supabase/listing-package.repository.supabase';
import { SupabaseModuleProfileRepository } from '@/features/profiles/repository/supabase/module-profile.repository.supabase';
import { SupabaseMatchRepository } from '@/features/matching/repository/supabase/match.repository.supabase';
import { SupabaseApplicationRepository } from '@/features/matching/repository/supabase/application.repository.supabase';
import { SupabaseDocumentRepository } from '@/features/documents/repository/supabase/document.repository.supabase';
import { SupabasePaymentRepository } from '@/features/monetization/repository/supabase/payment.repository.supabase';
import { SupabaseFranchisePackageRepository } from '@/features/franchise/repository/supabase/franchise-package.repository.supabase';
import { SupabaseEmployerPackageRepository } from '@/features/employers/repository/supabase/employer-package.repository.supabase';
import { SupabaseCandidatePackageRepository } from '@/features/candidates/repository/supabase/candidate-package.repository.supabase';
import { SupabaseEntrepreneurPackageRepository } from '@/features/entrepreneurs/repository/supabase/entrepreneur-package.repository.supabase';
import { SupabaseInvestorPackageRepository } from '@/features/investors/repository/supabase/investor-package.repository.supabase';
import { SupabaseFounderPackageRepository } from '@/features/founders/repository/supabase/founder-package.repository.supabase';
import { MockKvkkConsentRepository } from '@/features/kvkk/repository/mock/kvkk-consent.repository.mock';
import { SupabaseKvkkConsentRepository } from '@/features/kvkk/repository/supabase/kvkk-consent.repository.supabase';
import type { KvkkConsentRepository } from '@/features/kvkk/repositories/kvkk-consent.repository';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
import type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
import type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';
import { AccountService } from '@/features/account/services/account.service';
import { MockAccountProfileRepository } from '@/features/account/repository/mock/account-profile.repository.mock';
import { MockUserConsentRepository } from '@/features/account/repository/mock/user-consent.repository.mock';
import { MockUserSettingsRepository } from '@/features/account/repository/mock/user-settings.repository.mock';
import { MockUserSecurityLogRepository } from '@/features/account/repository/mock/user-security-log.repository.mock';
import { SupabaseAccountProfileRepository } from '@/features/account/repository/supabase/account-profile.repository.supabase';
import { SupabaseUserConsentRepository } from '@/features/account/repository/supabase/user-consent.repository.supabase';
import { SupabaseUserSettingsRepository } from '@/features/account/repository/supabase/user-settings.repository.supabase';
import { SupabaseUserSecurityLogRepository } from '@/features/account/repository/supabase/user-security-log.repository.supabase';
import type { FavoriteListingRepository } from '@/features/favorites/repositories/favorite-listing.repository';
import { FavoriteListingService } from '@/features/favorites/services/favorite-listing.service';
import { MockFavoriteListingRepository } from '@/features/favorites/repository/mock/favorite-listing.repository.mock';
import { SupabaseFavoriteListingRepository } from '@/features/favorites/repository/supabase/favorite-listing.repository.supabase';
import type { InboxNotificationRepository } from '@/features/notifications/repositories/inbox-notification.repository';
import { InboxNotificationService } from '@/features/notifications/services/inbox-notification.service';
import { MockInboxNotificationRepository } from '@/features/notifications/repository/mock/inbox-notification.repository.mock';
import { SupabaseInboxNotificationRepository } from '@/features/notifications/repository/supabase/inbox-notification.repository.supabase';
import type { ListingViewRepository } from '@/features/listings/repositories/listing-view.repository';
import { ListingViewService } from '@/features/listings/services/listing-view.service';
import { MockListingViewRepository } from '@/features/listings/repository/mock/listing-view.repository.mock';
import { SupabaseListingViewRepository } from '@/features/listings/repository/supabase/listing-view.repository.supabase';
import type { ListingPlacementRepository } from '@/features/monetization/repositories/listing-placement.repository';
import { ListingPlacementService } from '@/features/monetization/services/listing-placement.service';
import { MockListingPlacementRepository } from '@/features/monetization/repository/mock/listing-placement.repository.mock';
import { SupabaseListingPlacementRepository } from '@/features/monetization/repository/supabase/listing-placement.repository.supabase';

import { wireEcosystemServices, type EcosystemServices } from '@/lib/persistence/ecosystem-services';

import type { IProfileService } from '@/features/profiles/services/profile.service.interface';
import type { ICompanyService } from '@/features/companies/services/company.service.interface';
import type { IFavoriteService } from '@/features/favorites/services/favorite.service.interface';
import type { INotificationService } from '@/features/notifications/services/notification.service.interface';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { IAdminService } from '@/features/admin/services/admin.service.interface';
import type { IVerificationService } from '@/features/authentication/services/auth.service.interface';
import { VerificationService } from '@/features/authentication/services/verification.service';

export interface PersistenceContainer {
  listingRepository: ListingRepository;
  tagRepository: TagRepository;
  listingImageRepository: ListingImageRepository;
  activityRepository: ActivityRepository;
  profileRepository: ProfileRepository;
  followRepository: FollowRepository;
  companyRepository: CompanyRepository;
  favoriteRepository: FavoriteRepository;
  notificationRepository: NotificationRepository;
  conversationRepository: ConversationRepository;
  messageRepository: MessageRepository;
  userRepository: UserRepository;
  reportRepository: ReportRepository;
  verificationRepository: VerificationRepository;
  listingEngine: ListingEngine;
  listingBrowseService: ListingBrowseService;
  profileService: IProfileService;
  companyService: ICompanyService;
  favoriteService: IFavoriteService;
  notificationService: INotificationService;
  messagingService: IMessagingService;
  adminService: IAdminService;
  adminServices: AdminServices;
  listingPackageService: IListingPackageService;
  paymentService: IPaymentService;
  marketplaceSettingsRepository: MarketplaceSettingsRepository;
  listingPackageRepository: ListingPackageRepository;
  verificationService: IVerificationService;
  moduleProfileRepository: ModuleProfileRepository;
  matchRepository: MatchRepository;
  applicationRepository: ApplicationRepository;
  documentRepository: DocumentRepository;
  paymentRepository: PaymentRepository;
  franchisePackageRepository: FranchisePackageRepository;
  employerPackageRepository: EmployerPackageRepository;
  candidatePackageRepository: CandidatePackageRepository;
  entrepreneurPackageRepository: EntrepreneurPackageRepository;
  investorPackageRepository: InvestorPackageRepository;
  founderPackageRepository: FounderPackageRepository;
  kvkkConsentRepository: KvkkConsentRepository;
  accountProfileRepository: AccountProfileRepository;
  userConsentRepository: UserConsentRepository;
  userSettingsRepository: UserSettingsRepository;
  userSecurityLogRepository: UserSecurityLogRepository;
  accountService: AccountService;
  favoriteListingRepository: FavoriteListingRepository;
  favoriteListingService: FavoriteListingService;
  inboxNotificationRepository: InboxNotificationRepository;
  inboxNotificationService: InboxNotificationService;
  listingViewRepository: ListingViewRepository;
  listingViewService: ListingViewService;
  listingPlacementRepository: ListingPlacementRepository;
  listingPlacementService: ListingPlacementService;
  ecosystem: EcosystemServices;
}

export function createMemoryContainer(): PersistenceContainer {
  const listingRepository = new MockListingRepository();
  const tagRepository = new MockTagRepository();
  const listingImageRepository = new MockListingImageRepository();
  const activityRepository = new MockActivityRepository();
  const profileRepository = new MockProfileRepository();
  const followRepository = new MockFollowRepository();
  const companyRepository = new MockCompanyRepository();
  const companyMemberRepository = new MockCompanyMemberRepository();
  const companyFollowRepository = new MockCompanyFollowRepository();
  const favoriteRepository = new MockFavoriteRepository();
  const notificationRepository = new MockNotificationRepository();
  const messageRepository = new MockMessageRepository();
  const conversationRepository = new MockConversationRepository(messageRepository);
  const userRepository = new MockUserRepository();
  const reportRepository = new MockReportRepository();
  const verificationRepository = new MockVerificationRepository();
  const marketplaceSettingsRepository = new MockMarketplaceSettingsRepository();
  const listingPackageRepository = new MockListingPackageRepository();
  const moduleProfileRepository = new MockModuleProfileRepository();
  const matchRepository = new MockMatchRepository();
  const applicationRepository = new MockApplicationRepository();
  const documentRepository = new MockDocumentRepository();
  const paymentRepository = new MockPaymentRepository();
  const franchisePackageRepository = new MockFranchisePackageRepository();
  const employerPackageRepository = new MockEmployerPackageRepository();
  const candidatePackageRepository = new MockCandidatePackageRepository();
  const entrepreneurPackageRepository = new MockEntrepreneurPackageRepository();
  const investorPackageRepository = new MockInvestorPackageRepository();
  const founderPackageRepository = new MockFounderPackageRepository();
  const kvkkConsentRepository = new MockKvkkConsentRepository();
  const accountProfileRepository = new MockAccountProfileRepository();
  const userConsentRepository = new MockUserConsentRepository();
  const userSettingsRepository = new MockUserSettingsRepository();
  const userSecurityLogRepository = new MockUserSecurityLogRepository();
  const favoriteListingRepository = new MockFavoriteListingRepository();
  const inboxNotificationRepository = new MockInboxNotificationRepository();
  const listingViewRepository = new MockListingViewRepository();
  const listingPlacementRepository = new MockListingPlacementRepository();

  return wireContainer({
    listingRepository,
    tagRepository,
    listingImageRepository,
    activityRepository,
    profileRepository,
    followRepository,
    companyRepository,
    companyMemberRepository,
    companyFollowRepository,
    favoriteRepository,
    favoriteListingRepository,
    inboxNotificationRepository,
    listingViewRepository,
    listingPlacementRepository,
    notificationRepository,
    conversationRepository,
    messageRepository,
    userRepository,
    reportRepository,
    verificationRepository,
    marketplaceSettingsRepository,
    listingPackageRepository,
    moduleProfileRepository,
    matchRepository,
    applicationRepository,
    documentRepository,
    paymentRepository,
    franchisePackageRepository,
    employerPackageRepository,
    candidatePackageRepository,
    entrepreneurPackageRepository,
    investorPackageRepository,
    founderPackageRepository,
    kvkkConsentRepository,
    accountProfileRepository,
    userConsentRepository,
    userSettingsRepository,
    userSecurityLogRepository,
  });
}

export function createSupabaseContainer(supabase: SupabaseClient): PersistenceContainer {
  const listingRepository = new SupabaseListingRepository(supabase);
  const employerListingRepository = new EmployerListingRepository(supabase);
  const tagRepository = new SupabaseTagRepository(supabase);
  const listingImageRepository = new SupabaseListingImageRepository(supabase);
  const activityRepository = new SupabaseActivityRepository(supabase);
  const profileRepository = new SupabaseProfileRepository(supabase);
  const followRepository = new SupabaseFollowRepository(supabase);
  const companyRepository = new SupabaseCompanyRepository(supabase);
  const companyMemberRepository = new SupabaseCompanyMemberRepository(supabase);
  const companyFollowRepository = new SupabaseCompanyFollowRepository(supabase);
  const favoriteRepository = new SupabaseFavoriteRepository(supabase);
  const notificationRepository = new SupabaseNotificationRepository(supabase);
  const messageRepository = new SupabaseMessageRepository(supabase);
  const conversationRepository = new SupabaseConversationRepository(supabase, messageRepository);
  const userRepository = new SupabaseUserRepository(supabase);
  const reportRepository = new SupabaseReportRepository(supabase);
  const verificationRepository = new SupabaseVerificationRepository(supabase);
  const marketplaceSettingsRepository = new SupabaseMarketplaceSettingsRepository(supabase);
  const listingPackageRepository = new SupabaseListingPackageRepository(supabase);
  const moduleProfileRepository = new SupabaseModuleProfileRepository(supabase);
  const matchRepository = new SupabaseMatchRepository(supabase);
  const applicationRepository = new SupabaseApplicationRepository(supabase);
  const documentRepository = new SupabaseDocumentRepository(supabase);
  const paymentRepository = new SupabasePaymentRepository(supabase);
  const franchisePackageRepository = new SupabaseFranchisePackageRepository(supabase);
  const employerPackageRepository = new SupabaseEmployerPackageRepository(supabase);
  const candidatePackageRepository = new SupabaseCandidatePackageRepository(supabase);
  const entrepreneurPackageRepository = new SupabaseEntrepreneurPackageRepository(supabase);
  const investorPackageRepository = new SupabaseInvestorPackageRepository(supabase);
  const founderPackageRepository = new SupabaseFounderPackageRepository(supabase);
  const kvkkConsentRepository = new SupabaseKvkkConsentRepository(supabase);
  /** Account profile stack stays in-memory — avoids profiles/consents/settings DB dependency. */
  const accountProfileRepository = new MockAccountProfileRepository();
  const userConsentRepository = new MockUserConsentRepository();
  const userSettingsRepository = new MockUserSettingsRepository();
  const userSecurityLogRepository = new MockUserSecurityLogRepository();
  const favoriteListingRepository = new SupabaseFavoriteListingRepository(supabase);
  const inboxNotificationRepository = new SupabaseInboxNotificationRepository(supabase);
  const listingViewRepository = new SupabaseListingViewRepository(supabase);
  const listingPlacementRepository = new SupabaseListingPlacementRepository(supabase);

  return wireContainer({
    listingRepository,
    employerListingRepository,
    tagRepository,
    listingImageRepository,
    activityRepository,
    profileRepository,
    followRepository,
    companyRepository,
    companyMemberRepository,
    companyFollowRepository,
    favoriteRepository,
    favoriteListingRepository,
    inboxNotificationRepository,
    listingViewRepository,
    listingPlacementRepository,
    notificationRepository,
    conversationRepository,
    messageRepository,
    userRepository,
    reportRepository,
    verificationRepository,
    marketplaceSettingsRepository,
    listingPackageRepository,
    moduleProfileRepository,
    matchRepository,
    applicationRepository,
    documentRepository,
    paymentRepository,
    franchisePackageRepository,
    employerPackageRepository,
    candidatePackageRepository,
    entrepreneurPackageRepository,
    investorPackageRepository,
    founderPackageRepository,
    kvkkConsentRepository,
    accountProfileRepository,
    userConsentRepository,
    userSettingsRepository,
    userSecurityLogRepository,
  });
}

function wireContainer(repos: {
  listingRepository: ListingRepository;
  employerListingRepository?: ListingRepository;
  tagRepository: TagRepository;
  listingImageRepository: ListingImageRepository;
  activityRepository: ActivityRepository;
  profileRepository: ProfileRepository;
  followRepository: FollowRepository;
  companyRepository: CompanyRepository;
  companyMemberRepository: CompanyMemberRepository;
  companyFollowRepository: CompanyFollowRepository;
  favoriteRepository: FavoriteRepository;
  favoriteListingRepository: FavoriteListingRepository;
  inboxNotificationRepository: InboxNotificationRepository;
  listingViewRepository: ListingViewRepository;
  listingPlacementRepository: ListingPlacementRepository;
  notificationRepository: NotificationRepository;
  conversationRepository: ConversationRepository;
  messageRepository: MessageRepository;
  userRepository: UserRepository;
  reportRepository: ReportRepository;
  verificationRepository: VerificationRepository;
  marketplaceSettingsRepository: MarketplaceSettingsRepository;
  listingPackageRepository: ListingPackageRepository;
  moduleProfileRepository: ModuleProfileRepository;
  matchRepository: MatchRepository;
  applicationRepository: ApplicationRepository;
  documentRepository: DocumentRepository;
  paymentRepository: PaymentRepository;
  franchisePackageRepository: FranchisePackageRepository;
  employerPackageRepository: EmployerPackageRepository;
  candidatePackageRepository: CandidatePackageRepository;
  entrepreneurPackageRepository: EntrepreneurPackageRepository;
  investorPackageRepository: InvestorPackageRepository;
  founderPackageRepository: FounderPackageRepository;
  kvkkConsentRepository: KvkkConsentRepository;
  accountProfileRepository: AccountProfileRepository;
  userConsentRepository: UserConsentRepository;
  userSettingsRepository: UserSettingsRepository;
  userSecurityLogRepository: UserSecurityLogRepository;
}): PersistenceContainer {
  const listingPackageService = new ListingPackageService(
    repos.marketplaceSettingsRepository,
    repos.listingPackageRepository,
  );

  const accountService = new AccountService(
    repos.accountProfileRepository,
    repos.userConsentRepository,
    repos.userSettingsRepository,
    repos.userSecurityLogRepository,
  );

  const favoriteListingService = new FavoriteListingService(
    repos.favoriteListingRepository,
  );

  const inboxNotificationService = new InboxNotificationService(
    repos.inboxNotificationRepository,
  );

  const listingViewService = new ListingViewService(
    repos.listingViewRepository,
    repos.listingRepository,
  );

  const listingPlacementService = new ListingPlacementService(
    repos.listingPlacementRepository,
    repos.listingRepository,
  );

  const ecosystem = wireEcosystemServices({
    listingRepository: repos.listingRepository,
    employerListingRepository: repos.employerListingRepository,
    profileRepository: repos.profileRepository,
    moduleProfileRepository: repos.moduleProfileRepository,
    matchRepository: repos.matchRepository,
    applicationRepository: repos.applicationRepository,
    documentRepository: repos.documentRepository,
    paymentRepository: repos.paymentRepository,
    listingPackageRepository: repos.listingPackageRepository,
    franchisePackageRepository: repos.franchisePackageRepository,
    employerPackageRepository: repos.employerPackageRepository,
    candidatePackageRepository: repos.candidatePackageRepository,
    entrepreneurPackageRepository: repos.entrepreneurPackageRepository,
    investorPackageRepository: repos.investorPackageRepository,
    founderPackageRepository: repos.founderPackageRepository,
    favoriteRepository: repos.favoriteRepository,
    kvkkConsentRepository: repos.kvkkConsentRepository,
  });

  const paymentService = ecosystem.paymentService;

  const listingEngine = new ListingEngine(
    repos.listingRepository,
    repos.tagRepository,
    repos.listingImageRepository,
    repos.activityRepository,
    listingPackageService,
  );

  const listingBrowseService = new ListingBrowseService(
    repos.listingRepository,
    repos.favoriteRepository,
    repos.profileRepository,
    repos.companyRepository,
    repos.listingImageRepository,
  );

  const verificationService = new VerificationService(
    repos.verificationRepository,
    repos.profileRepository,
    repos.companyRepository,
  );

  const adminService = new AdminService(
    repos.userRepository,
    repos.profileRepository,
    repos.companyRepository,
    repos.listingRepository,
    repos.messageRepository,
    repos.reportRepository,
    repos.verificationRepository,
    listingPackageService,
    verificationService,
    repos.applicationRepository,
    repos.paymentRepository,
    repos.activityRepository,
  );

  const adminDashboardService = new AdminDashboardService(
    repos.userRepository,
    repos.companyRepository,
    repos.listingRepository,
    repos.messageRepository,
    repos.applicationRepository,
    repos.paymentRepository,
    repos.activityRepository,
  );

  const adminServices: AdminServices = {
    core: adminService,
    dashboard: adminDashboardService,
    profiles: new AdminProfilesService(repos.profileRepository, repos.moduleProfileRepository),
    applications: new AdminApplicationsService(repos.applicationRepository),
    payments: new AdminPaymentsService(repos.paymentRepository, paymentService, ecosystem),
    packages: new AdminPackagesService(listingPackageService, ecosystem),
    coupons: AdminCouponsService.fromPackageRepos(repos),
    reports: new AdminReportService(
      adminDashboardService,
      repos.userRepository,
      repos.listingRepository,
      repos.applicationRepository,
      repos.paymentRepository,
      repos.reportRepository,
    ),
    settings: new AdminSettingsService(repos.marketplaceSettingsRepository),
  };

  return {
    listingRepository: repos.listingRepository,
    tagRepository: repos.tagRepository,
    listingImageRepository: repos.listingImageRepository,
    activityRepository: repos.activityRepository,
    profileRepository: repos.profileRepository,
    followRepository: repos.followRepository,
    companyRepository: repos.companyRepository,
    favoriteRepository: repos.favoriteRepository,
    notificationRepository: repos.notificationRepository,
    conversationRepository: repos.conversationRepository,
    messageRepository: repos.messageRepository,
    userRepository: repos.userRepository,
    reportRepository: repos.reportRepository,
    verificationRepository: repos.verificationRepository,
    listingEngine,
    listingBrowseService,
    profileService: new ProfileService(
      repos.profileRepository,
      repos.followRepository,
      repos.listingRepository,
    ),
    companyService: new CompanyService(
      repos.companyRepository,
      repos.companyMemberRepository,
      repos.companyFollowRepository,
      repos.listingRepository,
      repos.profileRepository,
    ),
    favoriteService: new FavoriteService(repos.favoriteRepository),
    favoriteListingRepository: repos.favoriteListingRepository,
    favoriteListingService,
    inboxNotificationRepository: repos.inboxNotificationRepository,
    inboxNotificationService,
    listingViewRepository: repos.listingViewRepository,
    listingViewService,
    listingPlacementRepository: repos.listingPlacementRepository,
    listingPlacementService,
    notificationService: new NotificationService(repos.notificationRepository),
    messagingService: new MessagingService(
      repos.conversationRepository,
      repos.messageRepository,
      repos.listingRepository,
      repos.profileRepository,
      repos.companyRepository,
    ),
    adminService,
    adminServices,
    listingPackageService,
    paymentService,
    marketplaceSettingsRepository: repos.marketplaceSettingsRepository,
    listingPackageRepository: repos.listingPackageRepository,
    verificationService,
    moduleProfileRepository: repos.moduleProfileRepository,
    matchRepository: repos.matchRepository,
    applicationRepository: repos.applicationRepository,
    documentRepository: repos.documentRepository,
    paymentRepository: repos.paymentRepository,
    franchisePackageRepository: repos.franchisePackageRepository,
    employerPackageRepository: repos.employerPackageRepository,
    candidatePackageRepository: repos.candidatePackageRepository,
    entrepreneurPackageRepository: repos.entrepreneurPackageRepository,
    investorPackageRepository: repos.investorPackageRepository,
    founderPackageRepository: repos.founderPackageRepository,
    kvkkConsentRepository: repos.kvkkConsentRepository,
    accountProfileRepository: repos.accountProfileRepository,
    userConsentRepository: repos.userConsentRepository,
    userSettingsRepository: repos.userSettingsRepository,
    userSecurityLogRepository: repos.userSecurityLogRepository,
    accountService,
    ecosystem,
  };
}

let clientContainer: PersistenceContainer | null = null;

/** Client-side singleton — uses browser Supabase or memory fallback. */
export function getClientContainer(): PersistenceContainer {
  if (clientContainer) return clientContainer;

  // Never construct createBrowserClient during SSR / `next build` prerender.
  // Server and browser get separate module instances; browser still lazy-inits.
  if (typeof window === 'undefined') {
    clientContainer = createMemoryContainer();
    return clientContainer;
  }

  const driver = resolvePersistenceDriver();
  if (driver === 'supabase') {
    // Dynamic import avoids bundling server-only code on client
    const { createClient } = require('@/lib/supabase/client') as typeof import('@/lib/supabase/client');
    clientContainer = createSupabaseContainer(createClient());
  } else {
    clientContainer = createMemoryContainer();
  }
  return clientContainer;
}

/** Server-side factory — pass Supabase server client. */
export function getServerContainer(supabase: SupabaseClient): PersistenceContainer {
  const driver = resolvePersistenceDriver();
  return driver === 'supabase' ? createSupabaseContainer(supabase) : createMemoryContainer();
}

/** Reset container — for tests. */
export function resetClientContainer(): void {
  clientContainer = null;
}

export const listingEngine = new Proxy({} as ListingEngine, {
  get(_target, prop) {
    return Reflect.get(getClientContainer().listingEngine, prop);
  },
});

export function getListingEngine(): ListingEngine {
  return getClientContainer().listingEngine;
}

export function getProfileService(): IProfileService {
  return getClientContainer().profileService;
}

export function getAccountService(): AccountService {
  return getClientContainer().accountService;
}

export function getCompanyService(): ICompanyService {
  return getClientContainer().companyService;
}

export function getFavoriteService(): IFavoriteService {
  return getClientContainer().favoriteService;
}

export function getFavoriteListingService(): FavoriteListingService {
  return getClientContainer().favoriteListingService;
}

export function getListingBrowseService(): ListingBrowseService {
  return getClientContainer().listingBrowseService;
}

export function getNotificationService(): INotificationService {
  return getClientContainer().notificationService;
}

export function getInboxNotificationService(): InboxNotificationService {
  return getClientContainer().inboxNotificationService;
}

export function getListingViewService(): ListingViewService {
  return getClientContainer().listingViewService;
}

export function getListingPlacementService(): ListingPlacementService {
  return getClientContainer().listingPlacementService;
}

export function getMessagingService(): IMessagingService {
  return getClientContainer().messagingService;
}

export function getAdminService(): IAdminService {
  return getClientContainer().adminService;
}

export function getAdminServices(): AdminServices {
  return getClientContainer().adminServices;
}

export function getListingPackageService(): IListingPackageService {
  return getClientContainer().listingPackageService;
}

export function getPaymentService(): IPaymentService {
  return getClientContainer().paymentService;
}

export function getVerificationService(): IVerificationService {
  return getClientContainer().verificationService;
}

export function getEcosystemServices(): EcosystemServices {
  return getClientContainer().ecosystem;
}

export function getEntrepreneurService() {
  return getClientContainer().ecosystem.entrepreneurService;
}

export function getEntrepreneurListingService() {
  return getClientContainer().ecosystem.entrepreneurListingService;
}

export function getEntrepreneurApplicationService() {
  return getClientContainer().ecosystem.entrepreneurApplicationService;
}

export function getEntrepreneurMonetizationService() {
  return getClientContainer().ecosystem.entrepreneurMonetizationService;
}

export function getInvestorListingService() {
  return getClientContainer().ecosystem.investorListingService;
}

export function getInvestorService() {
  return getClientContainer().ecosystem.investorService;
}

export function getInvestorApplicationService() {
  return getClientContainer().ecosystem.investorApplicationService;
}

export function getInvestorMonetizationService() {
  return getClientContainer().ecosystem.investorMonetizationService;
}

export function getCandidateService() {
  return getClientContainer().ecosystem.candidateService;
}

export function getEmployerJobService() {
  return getClientContainer().ecosystem.employerJobService;
}

export function getEmployerService() {
  return getClientContainer().ecosystem.employerService;
}

export function getEmployerApplicationService() {
  return getClientContainer().ecosystem.employerApplicationService;
}

export function getEmployerMonetizationService() {
  return getClientContainer().ecosystem.employerMonetizationService;
}

export function getFounderService() {
  return getClientContainer().ecosystem.founderService;
}

export function getFounderApplicationService() {
  return getClientContainer().ecosystem.founderApplicationService;
}

export function getFounderMonetizationService() {
  return getClientContainer().ecosystem.founderMonetizationService;
}

export function getFranchiseService() {
  return getClientContainer().ecosystem.franchiseService;
}

export function getMatchService() {
  return getClientContainer().ecosystem.matchService;
}

export function getApplicationService() {
  return getClientContainer().ecosystem.applicationService;
}

export function getDocumentService() {
  return getClientContainer().ecosystem.documentService;
}
