import { ForbiddenError } from '@/lib/domain/errors';
import type { UserId, CompanyId, ListingId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { MarketplaceSettingsRepository } from '@/features/monetization/repositories/marketplace-settings.repository';
import type { ListingPackageRepository } from '@/features/monetization/repositories/listing-package.repository';
import type {
  MarketplaceSettings,
  UserListingPackage,
  ListingPackageCatalogItem,
  GrantPackageInput,
  PublishEntitlementResult,
  UserPackageFilter,
} from '@/features/monetization/types/listing-package.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface IListingPackageService {
  getSettings(): Promise<MarketplaceSettings>;
  updateFreeListingLimit(limit: number): Promise<MarketplaceSettings>;
  listCatalog(): Promise<ListingPackageCatalogItem[]>;
  listActivePackages(filter?: UserPackageFilter): Promise<UserListingPackage[]>;
  paginateUserPackages(filter: UserPackageFilter, pagination?: PaginationParams): Promise<PaginatedResult<UserListingPackage>>;
  grantPackage(input: GrantPackageInput): Promise<UserListingPackage>;
  checkPublishEntitlement(userId: UserId, listing: Listing): Promise<PublishEntitlementResult>;
  assertCanPublish(userId: UserId, listing: Listing): Promise<PublishEntitlementResult>;
  onListingPublished(userId: UserId, listing: Listing, entitlement: PublishEntitlementResult): Promise<void>;
}

function isFirstPublish(listing: Listing): boolean {
  return listing.publishedAt === null;
}

export class ListingPackageService implements IListingPackageService {
  constructor(
    private settingsRepo: MarketplaceSettingsRepository,
    private packageRepo: ListingPackageRepository,
  ) {}

  getSettings() {
    return this.settingsRepo.get();
  }

  updateFreeListingLimit(limit: number) {
    if (limit < 0) throw new ForbiddenError('Ücretsiz ilan limiti negatif olamaz.');
    return this.settingsRepo.updateFreeListingLimit(limit);
  }

  listCatalog() {
    return this.packageRepo.listCatalog();
  }

  listActivePackages(filter: UserPackageFilter = {}) {
    return this.packageRepo.findActiveByUser(filter);
  }

  paginateUserPackages(filter: UserPackageFilter, pagination?: PaginationParams) {
    return this.packageRepo.paginateUserPackages(filter, pagination);
  }

  grantPackage(input: GrantPackageInput) {
    if (input.packageSlug === 'free') {
      throw new ForbiddenError('Ücretsiz paket manuel olarak atanamaz.');
    }
    return this.packageRepo.grant(input);
  }

  async checkPublishEntitlement(userId: UserId, listing: Listing): Promise<PublishEntitlementResult> {
    if (!isFirstPublish(listing)) {
      return { allowed: true, source: 'global_free' };
    }

    const settings = await this.settingsRepo.get();
    if (settings.currentPublishedCount < settings.freeListingLimit) {
      return { allowed: true, source: 'global_free' };
    }

    const active = await this.packageRepo.findActiveByUser({ userId });

    if (listing.companyId) {
      const companyPkg = active.find(
        (p) => p.packageSlug === 'company_package' && p.companyId === listing.companyId,
      );
      if (companyPkg) return { allowed: true, source: 'company_package' };
    }

    const monthly = active.find((p) => p.packageSlug === 'monthly_unlimited');
    if (monthly) return { allowed: true, source: 'monthly_unlimited' };

    const single = active.find(
      (p) => p.packageSlug === 'single_listing' && (p.creditsRemaining ?? 0) > 0,
    );
    if (single) return { allowed: true, source: 'single_listing' };

    return {
      allowed: false,
      reason: 'Ücretsiz ilan kotası doldu. Yayınlamak için bir paket satın almalı veya yönetici tarafından paket atanmalısınız.',
    };
  }

  async assertCanPublish(userId: UserId, listing: Listing): Promise<PublishEntitlementResult> {
    const result = await this.checkPublishEntitlement(userId, listing);
    if (!result.allowed) {
      throw new ForbiddenError(result.reason ?? 'İlan yayınlama hakkınız bulunmuyor.');
    }
    return result;
  }

  async onListingPublished(userId: UserId, listing: Listing, entitlement: PublishEntitlementResult): Promise<void> {
    if (!isFirstPublish(listing)) return;

    await this.settingsRepo.incrementPublishedCount();

    if (entitlement.source === 'single_listing') {
      const active = await this.packageRepo.findActiveByUser({ userId, packageSlug: 'single_listing' });
      const single = active.find((p) => (p.creditsRemaining ?? 0) > 0);
      if (single) {
        await this.packageRepo.consumeCredit(single.id, listing.id);
      }
    }
  }
}
