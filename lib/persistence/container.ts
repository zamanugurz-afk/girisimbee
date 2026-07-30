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
import { ListingPackageService } from '@/features/monetization/services/listing-package.service';
import { UnimplementedPaymentService } from '@/features/monetization/services/payment.service.interface';
import type { IListingPackageService } from '@/features/monetization/services/listing-package.service';
import type { IPaymentService } from '@/features/monetization/services/payment.service.interface';
import type { MarketplaceSettingsRepository } from '@/features/monetization/repositories/marketplace-settings.repository';
import type { ListingPackageRepository } from '@/features/monetization/repositories/listing-package.repository';
import { MockMarketplaceSettingsRepository } from '@/features/monetization/repository/mock/marketplace-settings.repository.mock';
import { MockListingPackageRepository } from '@/features/monetization/repository/mock/listing-package.repository.mock';
import { SupabaseMarketplaceSettingsRepository } from '@/features/monetization/repository/supabase/marketplace-settings.repository.supabase';
import { SupabaseListingPackageRepository } from '@/features/monetization/repository/supabase/listing-package.repository.supabase';

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
  listingPackageService: IListingPackageService;
  paymentService: IPaymentService;
  marketplaceSettingsRepository: MarketplaceSettingsRepository;
  listingPackageRepository: ListingPackageRepository;
  verificationService: IVerificationService;
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
    notificationRepository,
    conversationRepository,
    messageRepository,
    userRepository,
    reportRepository,
    verificationRepository,
    marketplaceSettingsRepository,
    listingPackageRepository,
  });
}

export function createSupabaseContainer(supabase: SupabaseClient): PersistenceContainer {
  const listingRepository = new SupabaseListingRepository(supabase);
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
    notificationRepository,
    conversationRepository,
    messageRepository,
    userRepository,
    reportRepository,
    verificationRepository,
    marketplaceSettingsRepository,
    listingPackageRepository,
  });
}

function wireContainer(repos: {
  listingRepository: ListingRepository;
  tagRepository: TagRepository;
  listingImageRepository: ListingImageRepository;
  activityRepository: ActivityRepository;
  profileRepository: ProfileRepository;
  followRepository: FollowRepository;
  companyRepository: CompanyRepository;
  companyMemberRepository: CompanyMemberRepository;
  companyFollowRepository: CompanyFollowRepository;
  favoriteRepository: FavoriteRepository;
  notificationRepository: NotificationRepository;
  conversationRepository: ConversationRepository;
  messageRepository: MessageRepository;
  userRepository: UserRepository;
  reportRepository: ReportRepository;
  verificationRepository: VerificationRepository;
  marketplaceSettingsRepository: MarketplaceSettingsRepository;
  listingPackageRepository: ListingPackageRepository;
}): PersistenceContainer {
  const listingPackageService = new ListingPackageService(
    repos.marketplaceSettingsRepository,
    repos.listingPackageRepository,
  );
  const paymentService = new UnimplementedPaymentService();

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
  );

  const verificationService = new VerificationService(
    repos.verificationRepository,
    repos.profileRepository,
    repos.companyRepository,
  );

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
    notificationService: new NotificationService(repos.notificationRepository),
    messagingService: new MessagingService(
      repos.conversationRepository,
      repos.messageRepository,
      repos.listingRepository,
      repos.profileRepository,
      repos.companyRepository,
    ),
    adminService: new AdminService(
      repos.userRepository,
      repos.profileRepository,
      repos.companyRepository,
      repos.listingRepository,
      repos.messageRepository,
      repos.reportRepository,
      repos.verificationRepository,
      listingPackageService,
      verificationService,
    ),
    listingPackageService,
    paymentService,
    marketplaceSettingsRepository: repos.marketplaceSettingsRepository,
    listingPackageRepository: repos.listingPackageRepository,
    verificationService,
  };
}

let clientContainer: PersistenceContainer | null = null;

/** Client-side singleton — uses browser Supabase or memory fallback. */
export function getClientContainer(): PersistenceContainer {
  if (clientContainer) return clientContainer;

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

export function getCompanyService(): ICompanyService {
  return getClientContainer().companyService;
}

export function getFavoriteService(): IFavoriteService {
  return getClientContainer().favoriteService;
}

export function getListingBrowseService(): ListingBrowseService {
  return getClientContainer().listingBrowseService;
}

export function getNotificationService(): INotificationService {
  return getClientContainer().notificationService;
}

export function getMessagingService(): IMessagingService {
  return getClientContainer().messagingService;
}

export function getAdminService(): IAdminService {
  return getClientContainer().adminService;
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
