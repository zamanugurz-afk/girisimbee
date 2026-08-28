import type { ListingAggregate } from '@/features/listings/types/listing-engine.types';
import type { ListingDetail, ListingPublisher, PartnershipCardData, FranchiseCardData } from '@/features/listings/types/listing.types';
import type { DigitalAiCapability } from '@/features/listings/config/digital-ai-capabilities';
import { resolveDigitalAiCapabilities } from '@/features/listings/config/digital-ai-capabilities';
import type { CategoryIntentId } from '@/features/categories/types/category.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { Company } from '@/features/companies/types/company.types';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  CATEGORY_EMOJI,
  CATEGORY_PAGE_CONFIG,
  INTENT_TO_CATEGORY_SLUG,
} from '@/features/listings/config/marketplace.config';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import { hasAnyTrustBadge, trustFromCompany, trustFromProfile } from '@/features/authentication/types/trust.types';
import { isEmptyDisplayValue, toDisplayValue } from '@/features/listings/utils/display-value';
import {
  INVESTOR_FIELD_SCHEMA,
  HIRING_FIELD_SCHEMA,
  JOB_SEEKER_FIELD_SCHEMA,
  PARTNER_FIELD_SCHEMA,
  SEEKING_INVESTMENT_FIELD_SCHEMA,
  FRANCHISE_GIVE_FIELD_SCHEMA,
  GENERAL_LISTING_FIELD_SCHEMA,
  DIGITAL_AI_FIELD_SCHEMA,
  BUSINESS_TRANSFER_SELL_FIELD_SCHEMA,
  BUSINESS_TRANSFER_BUY_FIELD_SCHEMA,
  HIZMET_FIELD_SCHEMA,
} from '@/features/listings/config/listing-type-config';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ServiceCardData } from '@/features/listings/types/listing.types';
import { LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';
import type { ModuleKey } from '@/lib/domain/modules';
import {
  resolveCareerCoverRole,
  resolveCoverSectorHint,
  resolveListingCoverUrl,
  resolveSmartListingCover,
} from '@/features/listings/config/listing-cover.config';
import { polishCareerSummary } from '@/features/candidates/lib/career-summary';
import {
  ageFromBirthDate,
  maskDisplaySurname,
  publicGenderLabel,
} from '@/features/candidates/lib/career-public-identity';
import { getPartnerFormSchema } from '@/features/founders/partnership-form';
import {
  partnershipDetailHeadline,
  partnershipIntentLabel,
  resolvePartnershipIntent,
} from '@/features/founders/partnership-intent';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import { formatListingNumber } from '@/features/listings/utils/listing-number';
import {
  ANONYMOUS_PROFILE_LABEL,
  redactCareerExperiencePublicFields,
  type ContactDisclosureDecision,
} from '@/features/contact-requests/lib/contact-disclosure';
import { parseCareerExperiences } from '@/features/candidates/config/career-profile-fields';
import { getExperienceLevelLabel } from '@/features/candidates/taxonomy/career-taxonomy';
import { buildInvestmentContext } from '@/features/investments/lib/investment-context';
import { buildInvestmentCardData } from '@/features/investments/lib/investment-card';
import { buildInvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';
import { buildInvestorCardData } from '@/features/investors/lib/investor-card';
import { isCustomInvestmentAmount } from '@/features/investments/taxonomy/investment-catalog';
import { detectCareerProgression } from '@/features/candidates/ai/career-progression';
import { pickHighlightedSkills } from '@/features/candidates/ai/skill-relevance';

const SLUG_TO_INTENT: Record<string, CategoryIntentId> = {
  ...Object.fromEntries(
    Object.entries(INTENT_TO_CATEGORY_SLUG).map(([intent, slug]) => [slug, intent]),
  ),
  'is-bul': 'find-job',
  'is-ariyorum': 'find-job',
  'ise-al': 'hire',
  'ise-aliyorum': 'hire',
  'ortak-bul': 'find-partner',
  'ortak-ariyorum': 'find-partner',
  'ortaklik': 'find-partner',
  'devir': 'find-partner',
  'isletme-devri': 'find-partner',
  'isletme-devret': 'find-partner',
  'isletme-devral': 'find-partner',
  'business-transfer': 'find-partner',
  'franchise': 'franchise',
  'bayilik-al': 'franchise',
  'bayilik-ver': 'franchise',
  'franchise-ver': 'franchise',
  'bayilik': 'franchise',
  'dijital-ai': 'digital-ai',
  'yatirim-bul': 'find-investment',
  'yatirim-yap': 'invest',
};

/** Fields shown in the company/brand block — omit from flat customFacts to avoid duplicates. */
const COMPANY_BLOCK_CUSTOM_KEYS = new Set([
  'companyName',
  'establishmentYear',
  'website',
  'sector',
  'branchCount',
  'employeeCount',
]);

/** Investment block keys for seeking/offering — omit from customFacts when investment section is shown. */
const INVESTMENT_BLOCK_CUSTOM_KEYS = new Set([
  'investmentAmount',
  'investmentAmountCustom',
  'equityOffered',
  'valuation',
  'stage',
  'investmentStage',
  'preferredStages',
  'sector',
  'sectors',
  'ticketSizeMin',
  'useOfFunds',
  'useOfFundsDetail',
  'productStatus',
  'productName',
  'foundedYear',
  'businessModel',
  'targetCustomer',
  'problem',
  'solution',
  'differentiation',
  'revenueStatus',
  'tractionStatus',
  'monthlyRevenue',
  'mrr',
  'arr',
  'activeCustomers',
  'totalCustomers',
  'users',
  'growthRate',
  'gmv',
  'founderCount',
  'teamSize',
  'founderExpertise',
  'investmentAiAnalysis',
  'investorType',
  'preferredProductStatuses',
  'preferredBusinessModels',
  'preferredTargetCustomers',
  'revenueExpectation',
  'tractionExpectation',
  'preferredGeographies',
  'equityPreference',
  'valuationApproach',
  'preferredUseOfFunds',
  'investmentThesis',
  'mustHaveSignals',
  'dealBreakers',
  'ticketMin',
  'ticketMax',
  'minimumInvestment',
  'maximumInvestment',
  'investorAiAnalysis',
]);

/** Shown as feature cards on Digital & AI detail — omit from flat fact rows. */
const DIGITAL_AI_CAPABILITY_FACT_KEYS = new Set(['capabilities']);

/** Never surface intent flags or direct contact channels on public facts. */
const PRIVATE_CUSTOM_FACT_KEYS = new Set([
  'partnershipIntent',
  'phone',
  'email',
  'whatsapp',
  'contactPhone',
  'contactEmail',
  'contactWhatsapp',
  'contactWebsite',
  'phoneNumber',
  'mobile',
]);

/** Form schema key → possible stored aliases after module publish remap. */
const CUSTOM_FIELD_ALIASES: Record<string, string[]> = {
  stage: ['stage', 'investmentStage'],
  workType: ['workType', 'employmentType'],
  partnershipType: ['partnershipType', 'founderType'],
  expertise: ['expertise', 'requiredSkills'],
  preferredStages: ['preferredStages', 'investmentStage'],
};

function readCf(customFields: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = customFields[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function readCfDisplay(customFields: Record<string, unknown>, ...keys: string[]): string {
  return toDisplayValue(readCf(customFields, ...keys));
}

const CATEGORY_FIELD_SCHEMAS: Record<string, ListingFieldSchema> = {
  'yatirim-bul': SEEKING_INVESTMENT_FIELD_SCHEMA,
  'yatirim-yap': INVESTOR_FIELD_SCHEMA,
  'is-bul': JOB_SEEKER_FIELD_SCHEMA,
  'ise-al': HIRING_FIELD_SCHEMA,
  'ortak-bul': PARTNER_FIELD_SCHEMA,
  'bayilik-al': FRANCHISE_GIVE_FIELD_SCHEMA,
  franchise: FRANCHISE_GIVE_FIELD_SCHEMA,
  ilan: GENERAL_LISTING_FIELD_SCHEMA,
  hizmetler: HIZMET_FIELD_SCHEMA,
  'hizmet-ver': HIZMET_FIELD_SCHEMA,
  'dijital-ai': DIGITAL_AI_FIELD_SCHEMA,
  'isletme-devri': BUSINESS_TRANSFER_SELL_FIELD_SCHEMA,
  'isletme-devret': BUSINESS_TRANSFER_SELL_FIELD_SCHEMA,
  'isletme-devral': BUSINESS_TRANSFER_BUY_FIELD_SCHEMA,
};

const LISTING_TYPE_ID_TO_BROWSE_SLUG: Record<string, string> = {
  [LISTING_TYPE_IDS.yatirimBulDefault]: 'yatirim-bul',
  [LISTING_TYPE_IDS.yatirimYapDefault]: 'yatirim-yap',
  [LISTING_TYPE_IDS.isBulDefault]: 'is-bul',
  [LISTING_TYPE_IDS.iseAlDefault]: 'ise-al',
  [LISTING_TYPE_IDS.ortakBulDefault]: 'ortak-bul',
  [LISTING_TYPE_IDS.franchiseGiveDefault]: 'bayilik-al',
  [LISTING_TYPE_IDS.franchiseBuyDefault]: 'bayilik-al',
  [LISTING_TYPE_IDS.businessTransferSellDefault]: 'isletme-devri',
  [LISTING_TYPE_IDS.businessTransferBuyDefault]: 'isletme-devri',
  [LISTING_TYPE_IDS.hizmetVeriyorumDefault]: 'hizmetler',
  [LISTING_TYPE_IDS.genelIlanDefault]: 'ilan',
  [LISTING_TYPE_IDS.dijitalAiDefault]: 'dijital-ai',
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum]: 'yatirim-bul',
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum]: 'yatirim-yap',
  [MARKETPLACE_LISTING_TYPE_IDS.isAriyorum]: 'is-bul',
  [MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum]: 'ise-al',
  [MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum]: 'ortak-bul',
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikAl]: 'bayilik-al',
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikVer]: 'bayilik-al',
  [MARKETPLACE_LISTING_TYPE_IDS.businessTransferSell]: 'isletme-devri',
  [MARKETPLACE_LISTING_TYPE_IDS.businessTransferBuy]: 'isletme-devri',
};

const MODULE_KEY_TO_BROWSE_SLUG: Record<ModuleKey, string> = {
  entrepreneurs: 'yatirim-bul',
  investors: 'yatirim-yap',
  candidates: 'is-bul',
  employers: 'ise-al',
  founders: 'ortak-bul',
  franchise: 'bayilik-al',
};

const LISTING_TYPE_SLUG_TO_BROWSE_SLUG: Record<string, string> = {
  'yatirim-ariyorum': 'yatirim-bul',
  'yatirim-yapiyorum': 'yatirim-yap',
  'is-ariyorum': 'is-bul',
  'ise-aliyorum': 'ise-al',
  'ise-al': 'ise-al',
  'is-bul': 'is-bul',
  'ortak-ariyorum': 'ortak-bul',
  'franchise-ilan-ver': 'bayilik-al',
  'bayilik-al': 'bayilik-al',
  'bayilik-ver': 'bayilik-al',
  'hizmet-ver': 'hizmetler',
  hizmetler: 'hizmetler',
  esnaf: 'hizmetler',
  'genel-ilan': 'ilan',
  'dijital-ai-cozum': 'dijital-ai',
  'isletme-devri': 'isletme-devri',
  'isletme-devret': 'isletme-devri',
  'isletme-devral': 'isletme-devri',
  'business-transfer': 'isletme-devri',
};

function resolveDetailCategorySlug(listing: Listing): string {
  const byTypeId = LISTING_TYPE_ID_TO_BROWSE_SLUG[listing.listingTypeId];
  if (byTypeId) return byTypeId;

  if (listing.moduleKey && MODULE_KEY_TO_BROWSE_SLUG[listing.moduleKey]) {
    return MODULE_KEY_TO_BROWSE_SLUG[listing.moduleKey];
  }

  const listingType = categoryRegistry.getListingType(listing.listingTypeId);
  if (listingType?.slug && LISTING_TYPE_SLUG_TO_BROWSE_SLUG[listingType.slug]) {
    return LISTING_TYPE_SLUG_TO_BROWSE_SLUG[listingType.slug];
  }

  const category = categoryRegistry.getCategory(listing.categoryId);
  if (category?.slug && CATEGORY_FIELD_SCHEMAS[category.slug]) {
    return category.slug;
  }
  if (category?.slug && LISTING_TYPE_SLUG_TO_BROWSE_SLUG[category.slug]) {
    return LISTING_TYPE_SLUG_TO_BROWSE_SLUG[category.slug];
  }

  // Fallbacks based on fields
  const cf = (listing.customFields ?? {}) as Record<string, unknown>;
  if (cf.craftsmanTitle || cf.serviceCategory || cf.servicesList || cf.serviceDistricts || cf.emergency247 !== undefined) {
    return 'hizmetler';
  }
  if (cf.companyName && (cf.salaryRange || cf.workplacePreference || cf.desiredRole)) {
    return 'ise-al';
  }
  if (cf.desiredRole || cf.experienceLevel || cf.salaryExpectation) {
    return 'is-bul';
  }
  if (cf.franchiseFee || cf.totalInvestment || cf.branchCount) {
    return 'bayilik-al';
  }
  if (cf.transferPrice || cf.monthlyRevenue || cf.transferScope) {
    return 'isletme-devri';
  }
  if (cf.equityOffered || cf.commitment || cf.seekingRole) {
    return 'ortak-bul';
  }

  return 'ise-al';
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildCustomFacts(
  categorySlug: string,
  customFields: Record<string, unknown>,
  schemaOverride?: ListingFieldSchema,
): { label: string; value: string }[] {
  const schema = schemaOverride ?? CATEGORY_FIELD_SCHEMAS[categorySlug];
  if (!schema) return [];

  const hideInvestmentKeys =
    categorySlug === 'yatirim-bul' || categorySlug === 'yatirim-yap';

  const facts = schema.fields
    .filter((field) => categorySlug === 'ortak-bul' || !COMPANY_BLOCK_CUSTOM_KEYS.has(field.key))
    .filter((field) => !PRIVATE_CUSTOM_FACT_KEYS.has(field.key))
    .filter((field) => !(hideInvestmentKeys && INVESTMENT_BLOCK_CUSTOM_KEYS.has(field.key)))
    .filter((field) => !(categorySlug === 'dijital-ai' && DIGITAL_AI_CAPABILITY_FACT_KEYS.has(field.key)))
    .map((field) => {
      const aliases = CUSTOM_FIELD_ALIASES[field.key] ?? [field.key];
      let value = readCfDisplay(customFields, ...aliases);
      if (field.key === 'experienceLevel' && value) {
        value = getExperienceLevelLabel(value);
      }
      if (
        field.key === 'desiredRole'
        && (value === 'Diğer' || value === 'Diğer / Kendim gireceğim')
      ) {
        value = readCfDisplay(customFields, 'desiredRoleOther') || value;
      }
      return {
        label: field.label,
        value,
      };
    })
    .filter((row) => row.value.length > 0);

  // Employer language tags are stored as languageTags (not in hiring schema).
  if (categorySlug === 'ise-al') {
    const languages = readCfDisplay(customFields, 'languageTags');
    if (languages) {
      facts.push({ label: 'Dil gereksinimleri', value: languages });
    }
  }

  return facts;
}

export type ListingDetailMapContext = {
  profile?: Profile | null;
  company?: Company | null;
  /** When omitted, identity is not redacted (legacy callers / non-gated). */
  disclosure?: ContactDisclosureDecision | null;
  /**
   * Career-card name source when marketplace_profiles is unpublished (typical
   * for seekers) or the viewer cannot SELECT the owner's profile row.
   * Mapper still masks unless canRevealOwnerIdentity.
   */
  ownerDisplayName?: string | null;
};

/** Map engine aggregate → UI ListingDetail (existing detail view). */
export function aggregateToListingDetail(
  aggregate: ListingAggregate,
  context?: ListingDetailMapContext,
): ListingDetail {
  const { listing, tags, images, activityHistory } = aggregate;
  const category = categoryRegistry.getCategory(listing.categoryId);
  const categorySlug = resolveDetailCategorySlug(listing);
  const meta = CATEGORY_PAGE_CONFIG[categorySlug];
  const redactIdentity =
    Boolean(context?.disclosure?.identityGated)
    && !context?.disclosure?.canRevealOwnerIdentity;
  const revealCareerPersonal = Boolean(context?.disclosure?.canRevealOwnerIdentity);

  const sourceCf = listing.customFields ?? {};
  const cf: Record<string, unknown> = { ...sourceCf };
  const partnershipIntent =
    categorySlug === 'ortak-bul' ? resolvePartnershipIntent(listing) : undefined;
  if (categorySlug === 'dijital-ai') {
    delete cf.partnershipIntent;
    delete cf.phone;
    delete cf.email;
    delete cf.whatsapp;
    delete cf.contactPhone;
    delete cf.contactEmail;
    delete cf.contactWhatsapp;
    delete cf.contactWebsite;
    delete cf.phoneNumber;
    delete cf.mobile;
  }
  if (redactIdentity || categorySlug === 'is-bul') {
    // Career public card: never surface employer/company-shaped fields.
    delete cf.companyName;
    delete cf.website;
    delete cf.cvUrl;
    delete cf.profileGender;
    if (!revealCareerPersonal) {
      delete cf.birthDate;
      delete cf.residenceCity;
      delete cf.residenceDistrict;
    }
    if (cf.experiences !== undefined) {
      cf.experiences = redactCareerExperiencePublicFields(cf.experiences);
    }
  }

  const locationParts = [listing.city, listing.country === 'TR' ? 'Türkiye' : listing.country]
    .filter((part) => !isEmptyDisplayValue(part));
  const location = locationParts.join(', ') || toDisplayValue(listing.location);

  const publisher = redactIdentity
    ? buildAnonymousPublisher()
    : buildPublisher(listing.companyId, listing.ownerId, context);
  const customFacts = buildCustomFacts(
    categorySlug,
    cf,
    categorySlug === 'ortak-bul'
      ? getPartnerFormSchema(partnershipIntent ?? 'seeking')
      : undefined,
  );
  const capabilityModules: DigitalAiCapability[] =
    categorySlug === 'dijital-ai' ? resolveDigitalAiCapabilities(cf.capabilities) : [];

  const equityRaw = readCf(cf, 'equityOffered');
  const equityDisplay = equityRaw != null && equityRaw !== ''
    ? `${toDisplayValue(equityRaw)}%`
    : '';

  const uploadedGallery = images
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .filter((img) => !isEmptyDisplayValue(img.url))
    .map((img, i) => ({
      id: img.id,
      label: img.alt ?? `Görsel ${i + 1}`,
      emoji: '🖼️',
      imageUrl: img.url,
    }));

  // Cards always show a type/cover fallback; detail must match so photos aren't empty.
  const cardDisplay = resolveListingCardDisplay(listing);
  const listingTypeSlug =
    categorySlug === 'is-bul'
      ? 'is-ariyorum'
      : categorySlug === 'ise-al'
        ? 'ise-aliyorum'
        : (categoryRegistry.getListingType(listing.listingTypeId)?.slug ?? null);
  const smartCoverUrl = resolveSmartListingCover({
    uploadedUrl: uploadedGallery[0]?.imageUrl ?? null,
    listingTypeSlug,
    group: cardDisplay.group,
    title: listing.title,
    sector: resolveCoverSectorHint({
      customFields: sourceCf,
      industry: listing.industry,
    }),
    industry: listing.industry,
    businessType: (cf.businessType ?? cf.businessTypeOther ?? null) as string | null,
    businessName: (cf.businessName ?? cf.companyName ?? null) as string | null,
    companyName: (cf.companyName ?? null) as string | null,
    franchiseModel: (cf.franchiseModel ?? cf.businessCategory ?? null) as string | null,
    role: resolveCareerCoverRole(
      toDisplayValue(sourceCf.desiredRole)
        || toDisplayValue(sourceCf.positionTitle),
      toDisplayValue(sourceCf.desiredRoleOther)
        || toDisplayValue(sourceCf.positionTitleOther),
    ),
    gender: (categorySlug === 'is-bul' || categorySlug === 'is-ariyorum' || listing.moduleKey === 'candidates') ? toDisplayValue(sourceCf.profileGender) : null,
    description: listing.longDescription || listing.shortDescription,
  });
  const careerCoverUrl = smartCoverUrl;
  const galleryItems =
    categorySlug !== 'is-bul' && categorySlug !== 'is-ariyorum' && listing.moduleKey !== 'candidates' && uploadedGallery.length > 0
      ? uploadedGallery
      : [
          {
            id: 'cover-fallback',
            label: listing.title,
            emoji: cardDisplay.typeEmoji,
            imageUrl: smartCoverUrl,
          },
        ];

  const cvRef = redactIdentity ? '' : toDisplayValue(cf.cvUrl);
  const attachments = cvRef
    ? [{
        id: 'cv',
        name: 'Özgeçmiş',
        type: 'pdf' as const,
        meta: 'CV',
        url: /^https?:\/\//i.test(cvRef) ? cvRef : undefined,
      }]
    : [];

  const companyName = redactIdentity
    ? ''
    : context?.company?.name
      || toDisplayValue(cf.companyName)
      || '';
  const companySummary = redactIdentity ? '' : (context?.company?.description ?? '');
  const companyCity = redactIdentity ? '' : toDisplayValue(context?.company?.city);
  const companyWebsite = redactIdentity
    ? ''
    : toDisplayValue(context?.company?.website) || toDisplayValue(cf.website);
  const companyFounded = redactIdentity
    ? ''
    : context?.company?.foundedYear
      ? String(context.company.foundedYear)
      : toDisplayValue(cf.establishmentYear);
  const companyEmployees = redactIdentity
    ? ''
    : toDisplayValue(context?.company?.employeeCount) || toDisplayValue(cf.employeeCount);
  const companySector = redactIdentity || categorySlug === 'ortak-bul'
    ? ''
    : toDisplayValue(cf.sector) || toDisplayValue(listing.industry);
  const companyBranchCount = redactIdentity ? '' : toDisplayValue(cf.branchCount);

  const resolvedIntent: CategoryIntentId =
    SLUG_TO_INTENT[categorySlug]
    ?? (categorySlug === 'is-bul'
      ? 'find-job'
      : categorySlug === 'bayilik-al' || categorySlug === 'franchise'
        ? 'franchise'
        : 'find-investment');

  const metaLabel =
    categorySlug === 'ortak-bul' && partnershipIntent
      ? partnershipIntentLabel(partnershipIntent)
      : CATEGORY_PAGE_CONFIG[categorySlug]?.label
        ?? (categorySlug === 'is-bul' ? 'İş Arıyorum' : undefined);

  const languageTags = Array.isArray(cf.languageTags)
    ? (cf.languageTags as unknown[]).map((t) => String(t).trim()).filter(Boolean)
    : typeof cf.languageTags === 'string' && cf.languageTags.trim()
      ? String(cf.languageTags).split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  const displayTags = [
    ...tags.map((t) => t.name),
    ...languageTags.filter((tag) => !tags.some((t) => t.name === tag)),
  ];

  return {
    id: listing.slug,
    listingId: listing.id,
    listingNumber: formatListingNumber(listing.id),
    // Omit owner/company ids when identity-gated so clients cannot enumerate /uye/{id}.
    ownerUserId: redactIdentity || categorySlug === 'dijital-ai' ? undefined : listing.ownerId,
    // Public detail never exposes direct contact channels — contact-request flow only.
    contactPhone: null,
    contactWhatsapp: null,
    contactEmail: null,
    companyId: redactIdentity ? null : listing.companyId,
    category: {
      id: resolvedIntent,
      label: metaLabel ?? meta?.label ?? category?.name ?? 'İlan',
      accent: meta?.accent ?? category?.accentColor ?? '#6366F1',
    },
    title: listing.title,
    shortDescription: listing.shortDescription,
    longDescription:
      categorySlug === 'is-bul' || categorySlug === 'ise-al'
        ? polishCareerSummary(listing.longDescription) || listing.shortDescription
        : listing.longDescription || listing.shortDescription,
    location,
    publishedAt: formatDate(listing.publishedAt),
    updatedAt: formatDate(listing.updatedAt),
    views: listing.viewCount,
    interestedCount: listing.interestedCount,
    verified: listing.isVerified || hasAnyTrustBadge(publisher.trust),
    emoji: CATEGORY_EMOJI[categorySlug] ?? '📋',
    listingIconKey: cardDisplay.iconKey,
    tags: displayTags,
    investment: {
      requested: isCustomInvestmentAmount(readCf(cf, 'investmentAmount'))
        ? readCfDisplay(cf, 'investmentAmountCustom', 'investmentAmount')
        : readCfDisplay(cf, 'investmentAmount', 'ticketSizeMin'),
      equity: equityDisplay,
      stage: readCfDisplay(cf, 'stage', 'investmentStage', 'preferredStages'),
      industry: readCfDisplay(cf, 'sector', 'sectors') || toDisplayValue(listing.industry),
      useOfFunds: readCfDisplay(cf, 'useOfFunds'),
      companyAge: readCfDisplay(cf, 'foundedYear'),
      website: categorySlug === 'yatirim-yap' ? companyWebsite : '',
    },
    company: {
      name: companyName,
      emoji: '🏢',
      // Only real company HQ city — never fall back to listing.city (ilan konumu).
      city: companyCity,
      website: companyWebsite,
      employees: companyEmployees,
      founded: companyFounded,
      summary: companySummary,
      sector: companySector,
      branchCount: companyBranchCount,
    },
    attachments,
    gallery: galleryItems,
    timeline: [],
    owner: {
      name: publisher.name,
      role: redactIdentity
        ? 'Anonim kariyer profili'
        : publisher.subtitle ?? (publisher.type === 'company' ? 'Şirket' : 'Kişisel'),
      initials: publisher.initials,
      verified: redactIdentity ? false : publisher.verified,
      memberSince: redactIdentity ? '' : formatDate(listing.createdAt),
    },
    publisher,
    activity: activityHistory.slice(0, 5).map((a) => ({
      id: a.id,
      text: a.summary,
      time: formatDate(a.createdAt),
    })),
    similar: [],
    intentHeadline:
      categorySlug === 'ortak-bul' && partnershipIntent
        ? partnershipDetailHeadline(partnershipIntent)
        : undefined,
    customFacts:
      categorySlug === 'is-bul'
      || categorySlug === 'ise-al'
      || categorySlug === 'yatirim-bul'
      || categorySlug === 'yatirim-yap'
        ? []
        : customFacts,
    investmentCard:
      categorySlug === 'yatirim-bul'
        ? buildInvestmentCardData({
            context: buildInvestmentContext({
              title: listing.title,
              city: listing.city,
              customFields: cf,
            }),
            longDescription: listing.longDescription,
            shortDescription: listing.shortDescription,
            storedAnalysis: cf.investmentAiAnalysis,
          })
        : undefined,
    investorCard:
      categorySlug === 'yatirim-yap'
        ? buildInvestorCardData({
            context: buildInvestorCriteriaContext({
              title: listing.title,
              customFields: cf,
            }),
            longDescription: listing.longDescription,
            shortDescription: listing.shortDescription,
            storedAnalysis: cf.investorAiAnalysis,
          })
        : undefined,
    careerCard:
      categorySlug === 'is-bul' ||
      categorySlug === 'is-ariyorum' ||
      (categorySlug === 'is' && Boolean(sourceCf.desiredRole || sourceCf.experienceLevel || sourceCf.salaryExpectation)) ||
      (resolvedIntent as string) === 'candidate' ||
      resolvedIntent === 'find-job'
        ? buildCareerCard(cf, listing.longDescription, {
            variant: 'seeker',
            revealPersonal: revealCareerPersonal,
            birthDate: toDisplayValue(sourceCf.birthDate),
            gender: toDisplayValue(sourceCf.profileGender),
            displayName:
              context?.profile?.displayName
              || context?.ownerDisplayName
              || null,
            residenceCity: toDisplayValue(sourceCf.residenceCity),
            residenceDistrict: toDisplayValue(sourceCf.residenceDistrict),
            city: listing.city,
            coverUrl: careerCoverUrl,
            sourceExperiences: sourceCf.experiences,
          })
        : categorySlug === 'ise-al' ||
          categorySlug === 'ise-aliyorum' ||
          categorySlug === 'is' ||
          resolvedIntent === 'hire' ||
          (resolvedIntent as string) === 'employers'
          ? buildCareerCard(cf, listing.longDescription, {
              variant: 'hire',
              city: listing.city,
              coverUrl: careerCoverUrl,
            })
          : undefined,
    partnershipCard:
      categorySlug === 'ortak-bul' ||
      categorySlug === 'ortak-ariyorum' ||
      categorySlug === 'ortaklik' ||
      categorySlug === 'devir' ||
      categorySlug === 'isletme-devri' ||
      categorySlug === 'isletme-devret' ||
      categorySlug === 'isletme-devral' ||
      categorySlug === 'business-transfer' ||
      categorySlug === 'ortak-bul' ||
      resolvedIntent === 'find-partner'
        ? buildPartnershipCard(sourceCf, listing, listing.city, careerCoverUrl)
        : undefined,
    franchiseCard:
      categorySlug === 'franchise' ||
      categorySlug === 'bayilik-al' ||
      categorySlug === 'bayilik-ver' ||
      categorySlug === 'franchise-ver' ||
      categorySlug === 'bayilik' ||
      resolvedIntent === 'franchise'
        ? buildFranchiseCard(sourceCf, listing, listing.city, careerCoverUrl)
        : undefined,
    serviceCard:
      categorySlug === 'hizmetler' ||
      categorySlug === 'hizmet-ver' ||
      categorySlug === 'esnaf' ||
      categorySlug === 'usta' ||
      resolvedIntent === 'services'
        ? buildServiceCard(sourceCf, listing, listing.city, careerCoverUrl)
        : undefined,
    capabilityModules: capabilityModules.length > 0 ? capabilityModules : undefined,
    identityRedacted: redactIdentity,
  };
}

function buildServiceCard(
  cf: Record<string, unknown>,
  listing: Listing,
  city: string | null,
  coverUrl: string | null,
): ServiceCardData {
  const readList = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  return {
    craftsmanTitle: toDisplayValue(cf.craftsmanTitle) || listing.title,
    ownerName: toDisplayValue(cf.ownerName) || null,
    serviceCategory: toDisplayValue(cf.serviceCategory) || 'Ustalar ve Hizmetler',
    servicesList: readList(cf.servicesList),
    serviceDistricts: readList(cf.serviceDistricts),
    workingHours: toDisplayValue(cf.workingHours) || '7/24 Acil Servis ve Gece Açık (Haftanın 7 Günü)',
    emergency247: cf.emergency247 !== false && cf.emergency247 !== 'false',
    isVerifiedPro: true,
    experienceYears: toDisplayValue(cf.experienceYears) || '15 Yıl',
    warrantyDuration: toDisplayValue(cf.warrantyDuration) || '1 Yıl İşçilik Garantili',
    pricingType: toDisplayValue(cf.pricingType) || 'Ücretsiz Keşif',
    workshopAddress: toDisplayValue(cf.workshopAddress) || null,
    city: city || listing.city || 'İstanbul',
    district: toDisplayValue(cf.district) || null,
    coverUrl: coverUrl || null,
    longDescription: listing.longDescription || listing.shortDescription,
    contactPhone: toDisplayValue(cf.contactPhone) || toDisplayValue(cf.phone) || null,
    contactWhatsapp: toDisplayValue(cf.contactWhatsapp) || toDisplayValue(cf.whatsapp) || null,
  };
}

function buildPartnershipCard(
  cf: Record<string, unknown>,
  listing: Listing,
  city: string | null,
  coverUrl: string | null,
): PartnershipCardData {
  const readList = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const partnershipTypes = readList(cf.partnershipTypes ?? cf.partnershipType);
  const professionalSkills = readList(cf.professionalSkills);
  const technicalSkills = readList(cf.technicalSkills ?? cf.expertise ?? cf.requiredSkills);
  const tools = readList(cf.tools);
  const isTransfer = Boolean(cf.businessType || cf.transferScope || cf.monthlyRevenue);

  return {
    intent: isTransfer ? 'transfer' : ((cf.partnershipIntent as 'seeking' | 'joining') ?? 'seeking'),
    title: listing.title,
    companyName: (cf.companyName ?? cf.businessName ?? null) as string | null,
    businessName: (cf.businessName ?? null) as string | null,
    businessType: (cf.businessType ?? null) as string | null,
    businessTypeOther: (cf.businessTypeOther ?? null) as string | null,
    sector: (cf.sector ?? cf.primarySector ?? null) as string | null,
    stage: (cf.projectStage ?? cf.startupStage ?? cf.stage ?? null) as string | null,
    partnershipType: (cf.partnershipType ?? null) as string | null,
    partnershipTypes: partnershipTypes.length > 0 ? partnershipTypes : undefined,
    partnershipTypesOther: (cf.partnershipTypesOther ?? cf.partnershipTypeOther ?? null) as string | null,
    professionalSkills: professionalSkills.length > 0 ? professionalSkills : undefined,
    professionalSkillsOther: (cf.professionalSkillsOther ?? null) as string | null,
    technicalSkills: technicalSkills.length > 0 ? technicalSkills : undefined,
    technicalSkillsOther: (cf.technicalSkillsOther ?? cf.expertiseOther ?? null) as string | null,
    tools: tools.length > 0 ? tools : undefined,
    toolsOther: (cf.toolsOther ?? null) as string | null,
    commitment: (cf.commitment ?? null) as string | null,
    equityOffered: (cf.equityOffered ?? null) as number | string | null,
    monthlyRevenue: (cf.monthlyRevenue ?? null) as string | null,
    investmentAmount: (cf.investmentAmount ?? cf.investmentAmountCustom ?? null) as string | null,
    transferPrice: (cf.transferPrice ?? cf.investmentAmount ?? null) as string | null,
    transferScope: (cf.transferScope ?? null) as string | null,
    city: city ?? null,
    district: (cf.district ?? cf.residenceDistrict ?? null) as string | null,
    coverUrl: coverUrl ?? (cf.coverUrl as string | null) ?? null,
    longDescription: listing.longDescription || listing.shortDescription || null,
    problem: (cf.problem ?? null) as string | null,
    solution: (cf.solution ?? null) as string | null,
    businessModel: (cf.businessModel ?? null) as string | string[] | null,
    targetCustomer: (cf.targetCustomer ?? null) as string | string[] | null,
    contactPhone: (cf.contactPhone ?? cf.phone ?? cf.phoneNumber ?? (listing as any).contactPhone ?? null) as string | null,
    contactWhatsapp: (cf.contactWhatsapp ?? cf.whatsapp ?? cf.contactPhone ?? cf.phone ?? (listing as any).contactPhone ?? null) as string | null,
    contactEmail: (cf.contactEmail ?? cf.email ?? null) as string | null,
    contactName: (cf.contactName ?? cf.fullName ?? cf.authorizedPerson ?? (listing as any).contactName ?? null) as string | null,
  };
}

function buildFranchiseCard(
  cf: Record<string, unknown>,
  listing: Listing,
  city: string | null,
  coverUrl: string | null,
): FranchiseCardData {
  const readList = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  return {
    companyName: (cf.companyName ?? listing.title ?? null) as string | null,
    establishmentYear: (cf.establishmentYear ?? null) as number | string | null,
    franchiseModel: (cf.franchiseModel ?? cf.businessCategory ?? null) as string | null,
    sector: (cf.sector ?? null) as string | null,
    branchCount: (cf.branchCount ?? null) as number | string | null,
    website: (cf.website ?? null) as string | null,
    totalInvestment: (cf.totalInvestment ?? cf.budget ?? null) as number | string | null,
    franchiseFee: (cf.franchiseFee ?? cf.entryFee ?? null) as number | string | null,
    profitMargin: (cf.profitMargin ?? null) as number | string | null,
    advertisingFee: (cf.advertisingFee ?? null) as number | string | null,
    averageSetupDuration: (cf.averageSetupDuration ?? null) as string | null,
    returnPeriod: (cf.returnPeriod ?? null) as string | null,
    minCapitalRequirement: (cf.minCapitalRequirement ?? null) as number | string | null,
    royaltyFee: (cf.royaltyFee ?? null) as string | null,
    trainingSupport: Boolean(cf.trainingSupport),
    operationalSupport: Boolean(cf.operationalSupport),
    marketingSupport: Boolean(cf.marketingSupport),
    locationSupport: Boolean(cf.locationSupport),
    logisticsSupport: Boolean(cf.logisticsSupport),
    exclusiveTerritory: Boolean(cf.exclusiveTerritory),
    trademarkStatus: (cf.trademarkStatus ?? null) as string | null,
    contractProvided: (cf.contractProvided ?? null) as string | null,
    minSquareMeters: (cf.minSquareMeters ?? null) as number | string | null,
    storeLocationType: (cf.storeLocationType ?? null) as string | null,
    availableCities: readList(cf.availableCities),
    city: city ?? null,
    district: (cf.district ?? cf.districts ?? null) as string | null,
    coverUrl: coverUrl ?? (cf.coverUrl as string | null) ?? null,
    longDescription: listing.longDescription || listing.shortDescription || null,
    contactPhone: (cf.contactPhone ?? cf.phone ?? cf.phoneNumber ?? (listing as any).contactPhone ?? null) as string | null,
    contactWhatsapp: (cf.contactWhatsapp ?? cf.whatsapp ?? cf.contactPhone ?? cf.phone ?? (listing as any).contactPhone ?? null) as string | null,
    contactEmail: (cf.contactEmail ?? cf.email ?? null) as string | null,
    contactName: (cf.contactName ?? cf.fullName ?? cf.authorizedPerson ?? (listing as any).contactName ?? null) as string | null,
  };
}

function buildCareerCard(
  cf: Record<string, unknown>,
  longDescription: string | null | undefined,
  personal?: {
    variant?: 'seeker' | 'hire';
    revealPersonal?: boolean;
    birthDate?: string | null;
    gender?: string | null;
    displayName?: string | null;
    residenceCity?: string | null;
    residenceDistrict?: string | null;
    city?: string | null;
    coverUrl?: string | null;
    sourceExperiences?: unknown;
  },
): ListingDetail['careerCard'] {
  const variant = personal?.variant ?? 'seeker';
  const desiredRoleRaw =
    toDisplayValue(cf.desiredRole) || toDisplayValue(cf.positionTitle);
  const desiredRoleOther =
    toDisplayValue(cf.desiredRoleOther) || toDisplayValue(cf.positionTitleOther);
  const desiredRole =
    desiredRoleRaw === 'Diğer' || desiredRoleRaw === 'Diğer / Kendim gireceğim'
      ? desiredRoleOther || desiredRoleRaw
      : desiredRoleRaw;
  const sourceExperiences = parseCareerExperiences(
    personal?.sourceExperiences ?? cf.experiences,
  );
  const experiences = parseCareerExperiences(
    redactCareerExperiencePublicFields(cf.experiences),
  ).map((exp) => ({
    id: exp.id,
    sector: exp.sector,
    role: exp.role,
    duration: exp.duration,
    responsibilities: exp.responsibilities,
    achievements: exp.achievements,
    startMonth: exp.startMonth,
    startYear: exp.startYear,
    endMonth: exp.endMonth,
    endYear: exp.endYear,
    isCurrent: exp.isCurrent,
  }));

  return {
    variant,
    companyName: toDisplayValue(cf.companyName) || toDisplayValue(cf.company) || null,
    desiredRole,
    experienceLevel: getExperienceLevelLabel(toDisplayValue(cf.experienceLevel)),
    primarySector: toDisplayValue(cf.primarySector),
    workType: toDisplayValue(cf.workType) || toDisplayValue(cf.employmentType),
    preferredSectors: Array.isArray(cf.preferredSectors)
      ? cf.preferredSectors.map(String)
      : toDisplayValue(cf.preferredSectors),
    professionalSkills: toDisplayValue(cf.professionalSkills),
    technicalSkills: toDisplayValue(cf.technicalSkills),
    educationLevel: toDisplayValue(cf.educationLevel),
    educationField: toDisplayValue(cf.educationField),
    languages: toDisplayValue(cf.languages) || toDisplayValue(cf.languageTags),
    certificates: toDisplayValue(cf.certificates),
    preferredCity: toDisplayValue(cf.preferredCity) || toDisplayValue(personal?.city),
    workplacePreference: toDisplayValue(cf.workplacePreference),
    salaryExpectation: toDisplayValue(cf.salaryExpectation),
    salaryRange: toDisplayValue(cf.salaryRange),
    availability: toDisplayValue(cf.availability),
    requiredResponsibilities: toDisplayValue(cf.requiredResponsibilities),
    requiredAchievements: toDisplayValue(cf.requiredAchievements),
    longDescription: polishCareerSummary(longDescription) || null,
    coverUrl: personal?.coverUrl || null,
    experiences: variant === 'hire' ? [] : experiences,
    careerProgressions: variant === 'hire' ? [] : detectCareerProgression(sourceExperiences),
    highlightedSkills:
      variant === 'hire'
        ? undefined
        : pickHighlightedSkills({
            professionalSkills: toDisplayValue(cf.professionalSkills),
            technicalSkills: toDisplayValue(cf.technicalSkills),
            desiredRole,
            primarySector: toDisplayValue(cf.primarySector),
            experiences: sourceExperiences,
            limit: 7,
          }),
    displayName: personal?.revealPersonal ? personal.displayName || null : null,
    displayNameMasked:
      variant === 'hire' ? null : maskDisplaySurname(personal?.displayName),
    age: variant === 'hire' ? null : ageFromBirthDate(personal?.birthDate),
    gender: variant === 'hire' ? null : publicGenderLabel(personal?.gender),
    birthDate: personal?.revealPersonal ? personal.birthDate || null : null,
    residenceCity: personal?.revealPersonal ? personal.residenceCity || null : null,
    residenceDistrict: personal?.revealPersonal ? personal.residenceDistrict || null : null,
  };
}

function buildAnonymousPublisher(): ListingPublisher {
  return {
    type: 'user',
    name: ANONYMOUS_PROFILE_LABEL,
    avatarUrl: null,
    initials: 'A',
    verified: false,
    trust: { user: false, investor: false, company: false },
    href: '#',
    subtitle: 'Anonim kariyer profili',
  };
}

function buildPublisher(
  companyId: string | null,
  ownerUserId: string,
  context?: ListingDetailMapContext,
): ListingPublisher {
  const profileTrust = trustFromProfile(context?.profile);

  if (companyId && context?.company) {
    const company = context.company;
    const trust: TrustBadges = {
      user: profileTrust.user,
      investor: profileTrust.investor,
      company: trustFromCompany(company),
    };
    return {
      type: 'company',
      name: company.name,
      avatarUrl: company.logoUrl,
      initials: company.name.slice(0, 2).toUpperCase(),
      verified: hasAnyTrustBadge(trust),
      trust,
      href: `/company/${company.slug}`,
      subtitle: company.industry ?? 'Şirket',
    };
  }

  const profile = context?.profile;
  const trust: TrustBadges = {
    user: profileTrust.user,
    investor: profileTrust.investor,
    company: false,
  };
  return {
    type: 'user',
    name: profile?.displayName ?? context?.ownerDisplayName ?? 'Kullanıcı',
    avatarUrl: profile?.avatarUrl ?? null,
    initials: (profile?.displayName ?? context?.ownerDisplayName ?? 'K').slice(0, 2).toUpperCase(),
    verified: hasAnyTrustBadge(trust),
    trust,
    href: profile?.username
      ? `/profil/${profile.username}`
      : ownerUserId
        ? `/uye/${ownerUserId}`
        : '#',
    subtitle: profile?.headline ?? 'Kişisel ilan',
  };
}
