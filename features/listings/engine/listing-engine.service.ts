/**
 * Listing Engine — core orchestrator for all listing lifecycle operations.
 */
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/domain/errors';
import type { ListingId, UserId } from '@/lib/domain/ids';
import type { Listing, ListingFilter, ListingStatus } from '@/features/listings/types/listing.entity.types';
import type {
  CreateListingPayload,
  UpdateListingPayload,
  ListingAggregate,
  ListingEngineContext,
} from '@/features/listings/types/listing-engine.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  validateCreateListingForm,
  validateDraftListingForm,
  validateUpdateListingForm,
} from '@/features/listings/form/build-dynamic-schema';
import { buildListingEntity } from '@/features/listings/engine/listing-store';
import { ZodError } from 'zod';
import { coerceCompanyId } from '@/lib/persistence/supabase-payload';
import type { IListingEngineService } from '@/features/listings/services/listing-engine.service.interface';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { TagRepository } from '@/features/listings/repositories/tag.repository';
import type { ListingImageRepository } from '@/features/listings/repository/listing-image.repository';
import type { ActivityRepository } from '@/features/shared/repositories/activity.repository';
import type { IListingPackageService } from '@/features/monetization/services/listing-package.service';
import type { PublishEntitlementResult } from '@/features/monetization/types/listing-package.types';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';

function zodToValidationError(error: ZodError): ValidationError {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return new ValidationError('Doğrulama hatası', fieldErrors);
}

function isMockListingRepo(repo: ListingRepository): repo is MockListingRepository {
  return repo instanceof MockListingRepository;
}

export class ListingEngine implements IListingEngineService {
  constructor(
    private listingRepo: ListingRepository,
    private tagRepo: TagRepository,
    private imageRepo: ListingImageRepository,
    private activityRepo: ActivityRepository,
    private packageService?: IListingPackageService,
  ) {}

  async createListing(payload: CreateListingPayload, ctx: ListingEngineContext): Promise<ListingAggregate> {
    const listingType = categoryRegistry.getListingType(payload.listingTypeId);
    if (!listingType) throw new NotFoundError('ListingType', payload.listingTypeId);

    const formInput = {
      categoryId: payload.categoryId,
      listingTypeId: payload.listingTypeId,
      core: payload.core,
      customFields: payload.customFields,
      tags: payload.tags ?? [],
      images: payload.images ?? [],
    };

    try {
      if (payload.asDraft) {
        validateDraftListingForm(listingType.fieldSchema, formInput);
      } else {
        validateCreateListingForm(listingType.fieldSchema, formInput);
      }
    } catch (e) {
      if (e instanceof ZodError) throw zodToValidationError(e);
      throw e;
    }

    const sanitizedCompanyId = coerceCompanyId(payload.core.companyId);
    const createInput = {
      ownerId: payload.ownerId,
      categoryId: payload.categoryId,
      listingTypeId: payload.listingTypeId,
      title: payload.core.title,
      shortDescription: payload.core.shortDescription,
      longDescription: payload.core.longDescription,
      location: payload.core.location,
      city: payload.core.city,
      country: payload.core.country,
      remotePolicy: payload.core.remotePolicy,
      companyId: sanitizedCompanyId,
      customFields: payload.customFields,
    };

    if (process.env.DEBUG_LISTINGS === '1' || process.env.NEXT_PUBLIC_DEBUG_LISTINGS === '1') {
      console.log('[ListingEngine] createListing payload', JSON.stringify({
        ...payload,
        core: { ...payload.core, companyId: sanitizedCompanyId },
      }, null, 2));
    }

    let listing: Listing;

    if (isMockListingRepo(this.listingRepo)) {
      listing = buildListingEntity({
        ownerId: createInput.ownerId,
        categoryId: createInput.categoryId,
        listingTypeId: createInput.listingTypeId,
        title: createInput.title,
        shortDescription: createInput.shortDescription,
        longDescription: createInput.longDescription,
        location: createInput.location,
        city: createInput.city,
        country: createInput.country,
        remotePolicy: createInput.remotePolicy,
        companyId: createInput.companyId,
        customFields: createInput.customFields,
      });
      this.listingRepo.save(listing);
    } else {
      listing = await this.listingRepo.create(createInput);
    }

    if (payload.tags?.length) {
      await this.tagRepo.setTagsForListing(listing.id, payload.tags);
    }
    if (payload.images?.length) {
      await this.imageRepo.setForListing(listing.id, payload.images);
    }

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: listing.id,
      summary: `"${listing.title}" ilanı oluşturuldu`,
      metadata: { categoryId: payload.categoryId, listingTypeId: payload.listingTypeId },
    });

    return this.toAggregate(listing.id);
  }

  async updateListing(
    id: ListingId,
    payload: UpdateListingPayload,
    ctx: ListingEngineContext,
  ): Promise<ListingAggregate> {
    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    const listingType = categoryRegistry.getListingType(existing.listingTypeId);
    if (!listingType) throw new NotFoundError('ListingType', existing.listingTypeId);

    if (payload.core || payload.customFields) {
      const formInput = {
        categoryId: existing.categoryId,
        listingTypeId: existing.listingTypeId,
        core: {
          title: payload.core?.title ?? existing.title,
          shortDescription: payload.core?.shortDescription ?? existing.shortDescription,
          longDescription: payload.core?.longDescription ?? existing.longDescription,
          location: payload.core?.location ?? existing.location,
          city: payload.core?.city ?? existing.city,
          country: payload.core?.country ?? existing.country,
          remotePolicy: payload.core?.remotePolicy ?? existing.remotePolicy,
          companyId: payload.core?.companyId ?? existing.companyId,
        },
        customFields: payload.customFields ?? existing.customFields,
        tags: payload.tags,
        images: payload.images,
      };

      try {
        if (payload.asDraft) {
          validateDraftListingForm(listingType.fieldSchema, formInput);
        } else if (payload.core || payload.customFields) {
          validateUpdateListingForm(listingType.fieldSchema, payload);
        }
      } catch (e) {
        if (e instanceof ZodError) throw zodToValidationError(e);
        throw e;
      }
    }

    if (process.env.DEBUG_LISTINGS === '1' || process.env.NEXT_PUBLIC_DEBUG_LISTINGS === '1') {
      console.log('[ListingEngine] updateListing payload', JSON.stringify({ listingId: id, ...payload }, null, 2));
    }

    await this.listingRepo.update(id, {
      ...(payload.core?.title !== undefined && { title: payload.core.title }),
      ...(payload.core?.shortDescription !== undefined && { shortDescription: payload.core.shortDescription }),
      ...(payload.core?.longDescription !== undefined && { longDescription: payload.core.longDescription }),
      ...(payload.core?.location !== undefined && { location: payload.core.location }),
      ...(payload.core?.city !== undefined && { city: payload.core.city }),
      ...(payload.core?.country !== undefined && { country: payload.core.country }),
      ...(payload.core?.remotePolicy !== undefined && { remotePolicy: payload.core.remotePolicy }),
      ...(payload.core?.companyId !== undefined && {
        companyId: coerceCompanyId(payload.core.companyId),
      }),
      ...(payload.customFields !== undefined && { customFields: payload.customFields }),
    });

    if (payload.tags) await this.tagRepo.setTagsForListing(id, payload.tags);
    if (payload.images) await this.imageRepo.setForListing(id, payload.images);

    const updated = (await this.listingRepo.findById(id))!;

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: `"${updated.title}" ilanı güncellendi`,
      metadata: { operation: 'update' },
      isPublic: false,
    });

    return this.toAggregate(id);
  }

  async publishListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate> {
    if (process.env.DEBUG_LISTINGS === '1' || process.env.NEXT_PUBLIC_DEBUG_LISTINGS === '1') {
      console.log('[ListingEngine] publishListing payload', JSON.stringify({
        listingId: id,
        actorId: ctx.actorId,
      }, null, 2));
    }

    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    const listingType = categoryRegistry.getListingType(existing.listingTypeId);
    if (!listingType) throw new NotFoundError('ListingType', existing.listingTypeId);

    const tags = await this.tagRepo.findByListingId(id);

    try {
      validateCreateListingForm(listingType.fieldSchema, {
        categoryId: existing.categoryId,
        listingTypeId: existing.listingTypeId,
        core: {
          title: existing.title,
          shortDescription: existing.shortDescription,
          longDescription: existing.longDescription,
          location: existing.location,
          city: existing.city,
          country: existing.country,
          remotePolicy: existing.remotePolicy,
          companyId: existing.companyId,
        },
        customFields: existing.customFields,
        tags: tags.map((t) => t.name),
        images: await this.imageRepo.findByListingId(id),
      });
    } catch (e) {
      if (e instanceof ZodError) throw zodToValidationError(e);
      throw e;
    }

    const targetStatus: ListingStatus = 'pending_review';

    const isFirstPublish = existing.publishedAt === null;
    const requiresEntitlementCheck =
      isFirstPublish && (targetStatus === 'published' || targetStatus === 'pending_review');

    let entitlement: PublishEntitlementResult | null = null;
    if (requiresEntitlementCheck && this.packageService) {
      entitlement = await this.packageService.assertCanPublish(ctx.actorId, existing);
    }

    const listing = await this.listingRepo.transitionStatus(id, targetStatus);

    if (isFirstPublish && this.packageService && entitlement) {
      try {
        await this.packageService.onListingPublished(ctx.actorId, existing, entitlement);
      } catch (error) {
        console.error('[ListingEngine] post-publish statistics update failed — continuing', error);
      }
    }

    const successMessage =
      listing.status === 'pending_review'
        ? `"${listing.title}" incelemeye gönderildi`
        : `"${listing.title}" yayınlandı`;

    await this.activityRepo.create({
      verb: 'listing.published',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: successMessage,
      isPublic: listing.status === 'published',
    });

    return this.toAggregate(id);
  }

  async renewListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate> {
    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    if (existing.status !== 'expired' && existing.status !== 'archived') {
      throw new ValidationError('Yalnızca süresi dolmuş veya arşivlenmiş ilanlar yenilenebilir.', {});
    }

    const listingType = categoryRegistry.getListingType(existing.listingTypeId);
    if (!listingType) throw new NotFoundError('ListingType', existing.listingTypeId);

    const tags = await this.tagRepo.findByListingId(id);

    try {
      validateCreateListingForm(listingType.fieldSchema, {
        categoryId: existing.categoryId,
        listingTypeId: existing.listingTypeId,
        core: {
          title: existing.title,
          shortDescription: existing.shortDescription,
          longDescription: existing.longDescription,
          location: existing.location,
          city: existing.city,
          country: existing.country,
          remotePolicy: existing.remotePolicy,
          companyId: existing.companyId,
        },
        customFields: existing.customFields,
        tags: tags.map((t) => t.name),
        images: await this.imageRepo.findByListingId(id),
      });
    } catch (e) {
      if (e instanceof ZodError) throw zodToValidationError(e);
      throw e;
    }

    await this.listingRepo.transitionStatus(id, 'published');

    await this.activityRepo.create({
      verb: 'listing.published',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: `"${existing.title}" yenilendi`,
      metadata: { operation: 'renew' },
      isPublic: true,
    });

    return this.toAggregate(id);
  }

  async markListingSold(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate> {
    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    if (existing.status !== 'published') {
      throw new ValidationError('Yalnızca yayındaki ilanlar satıldı olarak işaretlenebilir.', {});
    }

    await this.listingRepo.transitionStatus(id, 'sold');

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: `"${existing.title}" satıldı olarak işaretlendi`,
      metadata: { operation: 'mark_sold' },
      isPublic: true,
    });

    return this.toAggregate(id);
  }

  async pauseListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate> {
    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    await this.listingRepo.transitionStatus(id, 'paused');

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: `"${existing.title}" duraklatıldı`,
      metadata: { operation: 'pause' },
      isPublic: false,
    });

    return this.toAggregate(id);
  }

  async archiveListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate> {
    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    await this.listingRepo.transitionStatus(id, 'archived');

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: `"${existing.title}" arşivlendi`,
      metadata: { operation: 'archive' },
    });

    return this.toAggregate(id);
  }

  async softDeleteListing(id: ListingId, ctx: ListingEngineContext): Promise<void> {
    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    await this.listingRepo.softDelete(id);

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: `"${existing.title}" silindi`,
      metadata: { operation: 'soft_delete' },
    });
  }

  async restoreListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate> {
    const existing = await this.listingRepo.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    await this.listingRepo.restore(id);

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: id,
      summary: `"${existing.title}" geri yüklendi`,
      metadata: { operation: 'restore' },
    });

    return this.toAggregate(id);
  }

  async duplicateListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate> {
    const existing = await this.listingRepo.findById(id);
    if (!existing) throw new NotFoundError('Listing', id);
    this.assertOwner(existing, ctx.actorId);

    let copy: Listing;

    if (isMockListingRepo(this.listingRepo)) {
      copy = buildListingEntity({
        ownerId: existing.ownerId,
        categoryId: existing.categoryId,
        listingTypeId: existing.listingTypeId,
        title: `${existing.title} (Kopya)`,
        shortDescription: existing.shortDescription,
        longDescription: existing.longDescription,
        location: existing.location,
        city: existing.city,
        country: existing.country,
        remotePolicy: existing.remotePolicy,
        companyId: existing.companyId,
        customFields: { ...existing.customFields },
      });
      this.listingRepo.save(copy);
    } else {
      copy = await this.listingRepo.create({
        ownerId: existing.ownerId,
        categoryId: existing.categoryId,
        listingTypeId: existing.listingTypeId,
        title: `${existing.title} (Kopya)`,
        shortDescription: existing.shortDescription,
        longDescription: existing.longDescription,
        location: existing.location,
        city: existing.city,
        country: existing.country,
        companyId: existing.companyId,
        customFields: { ...existing.customFields },
      });
    }

    const tags = await this.tagRepo.findByListingId(id);
    if (tags.length) await this.tagRepo.setTagsForListing(copy.id, tags.map((t) => t.name));

    const images = await this.imageRepo.findByListingId(id);
    if (images.length) {
      await this.imageRepo.setForListing(
        copy.id,
        images.map(({ url, alt, sortOrder }) => ({ url, alt, sortOrder })),
      );
    }

    await this.activityRepo.create({
      verb: 'listing.created',
      actorId: ctx.actorId,
      entityType: 'listing',
      entityId: copy.id,
      summary: `"${copy.title}" oluşturuldu (${existing.title} kopyası)`,
      metadata: { operation: 'duplicate', sourceId: id },
    });

    return this.toAggregate(copy.id);
  }

  async getListing(id: ListingId): Promise<ListingAggregate | null> {
    const listing = await this.listingRepo.findById(id);
    if (!listing) return null;
    return this.toAggregate(listing, { includeActivity: false });
  }

  async getListingBySlug(slug: string): Promise<ListingAggregate | null> {
    const listing = await this.listingRepo.findBySlug(slug);
    if (!listing) return null;
    return this.toAggregate(listing, { includeActivity: false });
  }

  async searchListings(
    filter: ListingFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Listing>> {
    return this.listingRepo.search(filter, pagination);
  }

  async getActivityHistory(id: ListingId): Promise<import('@/features/shared/types/activity.types').Activity[]> {
    const { data } = await this.activityRepo.findMany({ entityType: 'listing', entityId: id }, { page: 1, limit: 100 });
    return data;
  }

  private async toAggregate(
    listingOrId: Listing | ListingId,
    options?: { includeActivity?: boolean },
  ): Promise<ListingAggregate> {
    const includeActivity = options?.includeActivity ?? true;
    const listing =
      typeof listingOrId === 'string'
        ? (await this.listingRepo.findById(listingOrId as ListingId, { includeDeleted: true }))!
        : listingOrId;
    const id = listing.id;

    const [tags, images, activityResult] = await Promise.all([
      this.tagRepo.findByListingId(id),
      this.imageRepo.findByListingId(id),
      includeActivity
        ? this.activityRepo.findMany(
            { entityType: 'listing', entityId: id },
            { page: 1, limit: 5 },
          )
        : Promise.resolve({ data: [] as import('@/features/shared/types/activity.types').Activity[] }),
    ]);

    return {
      listing,
      tags,
      images,
      attachments: [],
      activityHistory: activityResult.data,
    };
  }

  private assertOwner(listing: Listing, actorId: UserId): void {
    if (listing.ownerId !== actorId) {
      throw new ForbiddenError('Bu ilan üzerinde işlem yapma yetkiniz yok.');
    }
  }
}
