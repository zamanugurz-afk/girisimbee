// Feature: listings — UI view models + domain layer
export type {
  ListingDetail,
  ListingSummary,
  ListingSearchFilter,
  ListingAttachment,
  ListingGalleryItem,
  ListingTimelineEvent,
  ListingOwner,
  ListingSimilar,
} from '@/features/listings/types/listing.types';

export {
  getListingById,
  hasListing,
  getAllListingIds,
  listingHref,
  listingViewService,
  /** @deprecated */ listingService,
} from '@/features/listings/services/listing.service';

export { useListing } from '@/features/listings/hooks/use-listing';

export { ListingDetailView as ListingDetailPage } from '@/components/girisimco/listing/listing-detail-view';
export { ContentCard as ListingCard } from '@/components/girisimco/content-card';

// Domain entities
export type {
  Listing,
  ListingStatus,
  RemotePolicy,
  InvestmentDetails,
  JobDetails,
  PartnerDetails,
  CreateListingInput,
  UpdateListingInput,
  ListingFilter,
} from '@/features/listings/types/listing.entity.types';
export { LISTING_INDEXES, LISTING_LIFECYCLE, LISTING_VALIDATION } from '@/features/listings/types/listing.entity.types';

export type {
  ListingType,
  ListingTypeStatus,
  ListingFieldSchema,
  ListingFieldDefinition,
  CreateListingTypeInput,
  UpdateListingTypeInput,
  ListingTypeFilter,
} from '@/features/listings/types/listing-type.types';
export { LISTING_TYPE_INDEXES, LISTING_TYPE_LIFECYCLE, LISTING_TYPE_VALIDATION } from '@/features/listings/types/listing-type.types';

export type {
  Tag,
  TagStatus,
  ListingTag,
  CreateTagInput,
  UpdateTagInput,
  TagFilter,
} from '@/features/listings/types/tag.types';
export { TAG_INDEXES, TAG_LIFECYCLE, TAG_VALIDATION } from '@/features/listings/types/tag.types';

export type {
  Attachment,
  AttachmentType,
  AttachmentStatus,
  CreateAttachmentInput,
  UpdateAttachmentInput,
  AttachmentFilter,
} from '@/features/listings/types/attachment.types';
export { ATTACHMENT_INDEXES, ATTACHMENT_LIFECYCLE, ATTACHMENT_VALIDATION } from '@/features/listings/types/attachment.types';

export type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationFilter,
} from '@/features/listings/types/application.types';
export { APPLICATION_INDEXES, APPLICATION_LIFECYCLE, APPLICATION_VALIDATION } from '@/features/listings/types/application.types';

export type { ListingRepository } from '@/features/listings/repositories/listing.repository';
export type { ListingTypeRepository } from '@/features/listings/repositories/listing-type.repository';
export type { TagRepository } from '@/features/listings/repositories/tag.repository';
export type { AttachmentRepository } from '@/features/listings/repositories/attachment.repository';
export type { ApplicationRepository } from '@/features/listings/repositories/application.repository';

export type {
  IListingService,
  IApplicationService,
  ITagService,
  IAttachmentService,
} from '@/features/listings/services/listing.service.interface';

export {
  listingSchema,
  createListingSchema,
} from '@/features/listings/validation/listing.schema';
export {
  applicationSchema,
  createApplicationSchema,
} from '@/features/listings/validation/application.schema';
export {
  listingTypeSchema,
  tagSchema,
  attachmentSchema,
} from '@/features/listings/validation/listing-sub.schema';

export { createListing, createListingInput } from '@/features/listings/factories/listing.factory';
export { createListingType, createListingTypeInput } from '@/features/listings/factories/listing-type.factory';
export { createTag, createTagInput } from '@/features/listings/factories/tag.factory';
export { createAttachment, createAttachmentInput } from '@/features/listings/factories/attachment.factory';
export { createApplication, createApplicationInput } from '@/features/listings/factories/application.factory';

export { generateMockListing, generateMockListings } from '@/features/listings/mock/listing.generator';

// ── Listing Engine (Sprint 3) ──────────────────────────────────
export type {
  CoreListingFields,
  ListingImage,
  ListingImageInput,
  CreateListingPayload,
  UpdateListingPayload,
  ListingAggregate,
  ListingEngineContext,
  ListingEngineOperation,
} from '@/features/listings/types/listing-engine.types';

export {
  CATEGORY_IDS,
  LISTING_TYPE_IDS,
  LISTING_TYPE_CONFIGS,
  CREATE_LISTING_TYPE_CONFIGS,
  CREATE_LISTING_DEFERRED_CATEGORY_IDS,
  CATEGORY_SLUG_TO_ID,
  INVESTMENT_FIELD_SCHEMA,
  HIRING_FIELD_SCHEMA,
  PARTNER_FIELD_SCHEMA,
  JOB_SEEKER_FIELD_SCHEMA,
} from '@/features/listings/config/listing-type-config';

export { categoryRegistry, getCategoryRegistry } from '@/features/listings/config/category-registry';

export {
  buildDynamicFieldsSchema,
  buildCreateListingFormSchema,
  buildUpdateListingFormSchema,
  validateCustomFields,
  validateCreateListingForm,
  validateUpdateListingForm,
  getDynamicFieldDefaults,
  getCoreFieldDefaults,
  getListingFormDefaults,
  coreListingFieldsSchema,
  listingMetaSchema,
} from '@/features/listings/form/build-dynamic-schema';
export type { CoreListingFieldsInput, ListingMetaInput } from '@/features/listings/form/build-dynamic-schema';

export { DynamicField } from '@/features/listings/form/fields/dynamic-field';
export { CoreListingFields as CoreListingFieldsForm } from '@/features/listings/form/fields/core-fields';
export { ImagesInput } from '@/features/listings/form/fields/meta-fields';
export {
  StructuredTagsSelect,
  TagsInput,
} from '@/features/listings/form/fields/structured-tags-select';
export {
  getListingTagGroups,
  LISTING_TAG_MAX,
} from '@/features/listings/config/listing-tag-options.config';
export { DynamicListingForm, CategoryListingForm } from '@/features/listings/form/dynamic-listing-form';
export type { ListingFormValues, CategoryListingFormProps } from '@/features/listings/form/dynamic-listing-form';
export {
  LISTING_FORM_STEPS,
  getListingFormSteps,
  resolveStepCustomFields,
} from '@/features/listings/config/listing-form-steps.config';
export { validateListingFormStep } from '@/features/listings/form/build-dynamic-schema';

export { ListingEngine } from '@/features/listings/engine/listing-engine.service';
export { listingEngine, getListingEngine } from '@/lib/persistence/container';
export { listingStore, getListingStore } from '@/features/listings/engine/listing-store';
export type { IListingEngineService } from '@/features/listings/services/listing-engine.service.interface';
export * from '@/features/listings/repository';

export { useListingFormConfig, useListingFormDefaults } from '@/features/listings/hooks/use-listing-form';
export { useListingEngine } from '@/features/listings/hooks/use-listing-engine';
export { useMarketplaceBrowse } from '@/features/listings/hooks/use-marketplace-browse';
export { ListingBrowseService } from '@/features/listings/services/listing-browse.service';
export { getListingBrowseService } from '@/lib/persistence/container';
export { listingToContentItem, listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
export {
  CATEGORY_PAGE_CONFIG,
  LISTING_SORT_OPTIONS,
  getCategorySlugFromIntent,
  getCategoryRoutePath,
  getUserDiscoverableCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
export {
  resolveListingTypeIdsFromBrowseSlug,
  resolveBrowseCategory,
  getBrowseCategorySlugs,
  isBrowseCategoryDeferred,
  isUserDiscoverableListing,
  BROWSE_DEFERRED_CATEGORY_SLUGS,
  USER_DISCOVERY_HIDDEN_CATEGORY_SLUGS,
} from '@/features/listings/config/marketplace-category-map';
export type {
  JobFlowFilter,
  ListingSortBy,
  MarketplaceBrowseParams,
  MarketplaceFilterState,
} from '@/features/listings/types/marketplace.types';
