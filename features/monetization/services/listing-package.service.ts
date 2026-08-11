import { ForbiddenError } from '@/lib/domain/errors';
import type { UserId, ListingId, CategoryId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
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
import {
  STANDARD_PUBLISH_CONFIG,
  STANDARD_REPUBLISH_CONFIG,
} from '@/features/monetization/types/listing-placement.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { isPremiumLivePayments } from '@/features/shared/config/features';

/** Statuses that consume the one free slot in a category. */
const CATEGORY_SLOT_STATUSES = [
  'published',
  'pending_review',
  'expired',
  'archived',
] as const;

export interface IListingPackageService {
  getSettings(): Promise<MarketplaceSettings>;
  updateFreeListingLimit(limit: number): Promise<MarketplaceSettings>;
  listCatalog(): Promise<ListingPackageCatalogItem[]>;
  listActivePackages(filter?: UserPackageFilter): Promise<UserListingPackage[]>;
  paginateUserPackages(filter: UserPackageFilter, pagination?: PaginationParams): Promise<PaginatedResult<UserListingPackage>>;
  grantPackage(input: GrantPackageInput): Promise<UserListingPackage>;
  /** How many category free slots this user already used (0 or 1+). Excludes `excludeListingId`. */
  countCategoryFreeSlotUsage(
    userId: UserId,
    categoryId: CategoryId,
    excludeListingId?: ListingId,
  ): Promise<number>;
  /** True when this user still has the free first listing in the category. */
  hasCategoryFreeSlot(
    userId: UserId,
    categoryId: CategoryId,
    excludeListingId?: ListingId,
  ): Promise<boolean>;
  checkPublishEntitlement(userId: UserId, listing: Listing): Promise<PublishEntitlementResult>;
  assertCanPublish(userId: UserId, listing: Listing): Promise<PublishEntitlementResult>;
  /** Renew after expiry — always paid for standard (free) categories. */
  assertCanRenew(userId: UserId, listing: Listing): Promise<PublishEntitlementResult>;
  onListingPublished(userId: UserId, listing: Listing, entitlement: PublishEntitlementResult): Promise<void>;
}

function isFirstPublish(listing: Listing): boolean {
  return listing.publishedAt === null;
}

export class ListingPackageService implements IListingPackageService {
  constructor(
    private settingsRepo: MarketplaceSettingsRepository,
    private packageRepo: ListingPackageRepository,
    private listingRepo?: ListingRepository,
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
    if (input.packageSlug === 'vitrin' || input.packageSlug === 'hizli_erisim') {
      throw new ForbiddenError(
        'Vitrin ve Acil Vitrin paketleri yayın kotası olarak atanamaz; yerleşim akışını kullanın.',
      );
    }
    return this.packageRepo.grant(input);
  }

  async countCategoryFreeSlotUsage(
    userId: UserId,
    categoryId: CategoryId,
    excludeListingId?: ListingId,
  ): Promise<number> {
    if (!this.listingRepo) return 0;
    const total = await this.listingRepo.count({
      ownerId: userId,
      categoryId,
      status: [...CATEGORY_SLOT_STATUSES],
    });
    if (!excludeListingId) return total;
    const current = await this.listingRepo.findById(excludeListingId);
    if (
      current
      && current.ownerId === userId
      && current.categoryId === categoryId
      && (CATEGORY_SLOT_STATUSES as readonly string[]).includes(current.status)
    ) {
      return Math.max(0, total - 1);
    }
    return total;
  }

  async hasCategoryFreeSlot(
    userId: UserId,
    categoryId: CategoryId,
    excludeListingId?: ListingId,
  ): Promise<boolean> {
    const used = await this.countCategoryFreeSlotUsage(userId, categoryId, excludeListingId);
    return used < STANDARD_PUBLISH_CONFIG.freePerCategory;
  }

  private async checkPaidPackageEntitlement(
    userId: UserId,
    listing: Listing,
  ): Promise<PublishEntitlementResult> {
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

    // Test mode: form already collected simulated 99 TL payment.
    if (!isPremiumLivePayments()) {
      return { allowed: true, source: 'category_paid' };
    }

    return {
      allowed: false,
      reason: `Bu kategoride ücretsiz hakkınızı kullandınız. Ek ilan veya yenileme ${STANDARD_REPUBLISH_CONFIG.priceCents / 100} TL’dir.`,
    };
  }

  async checkPublishEntitlement(userId: UserId, listing: Listing): Promise<PublishEntitlementResult> {
    if (!isFirstPublish(listing)) {
      return this.checkPaidPackageEntitlement(userId, listing);
    }

    const hasFree = await this.hasCategoryFreeSlot(userId, listing.categoryId, listing.id);
    if (hasFree) {
      return { allowed: true, source: 'category_free' };
    }

    return this.checkPaidPackageEntitlement(userId, listing);
  }

  async assertCanPublish(userId: UserId, listing: Listing): Promise<PublishEntitlementResult> {
    const result = await this.checkPublishEntitlement(userId, listing);
    if (!result.allowed) {
      throw new ForbiddenError(result.reason ?? 'İlan yayınlama hakkınız bulunmuyor.');
    }
    return result;
  }

  async assertCanRenew(userId: UserId, listing: Listing): Promise<PublishEntitlementResult> {
    const result = await this.checkPaidPackageEntitlement(userId, listing);
    if (!result.allowed) {
      throw new ForbiddenError(
        result.reason
          ?? `Süre dolan ilanı yenilemek ${STANDARD_REPUBLISH_CONFIG.priceCents / 100} TL’dir.`,
      );
    }
    return result;
  }

  async onListingPublished(userId: UserId, listing: Listing, entitlement: PublishEntitlementResult): Promise<void> {
    if (!isFirstPublish(listing)) return;

    try {
      await this.settingsRepo.incrementPublishedCount();
    } catch (error) {
      console.error('[ListingPackageService] marketplace_settings increment failed — continuing publish', error);
    }

    if (entitlement.source === 'single_listing') {
      try {
        const active = await this.packageRepo.findActiveByUser({ userId, packageSlug: 'single_listing' });
        const single = active.find((p) => (p.creditsRemaining ?? 0) > 0);
        if (single) {
          await this.packageRepo.consumeCredit(single.id, listing.id);
        }
      } catch (error) {
        console.error('[ListingPackageService] marketplace_user_packages consumeCredit failed — continuing publish', error);
      }
    }
  }
}
