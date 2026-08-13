import type { ListingAggregate } from '@/features/listings/types/listing-engine.types';
import type { ListingDetail, ListingPublisher } from '@/features/listings/types/listing.types';
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
} from '@/features/listings/config/listing-type-config';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';
import type { ModuleKey } from '@/lib/domain/modules';
import {
  resolveCareerCoverRole,
  resolveListingCoverUrl,
} from '@/features/listings/config/listing-cover.config';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import { formatListingNumber } from '@/features/listings/utils/listing-number';
import {
  ANONYMOUS_PROFILE_LABEL,
  redactCareerExperiencePublicFields,
  type ContactDisclosureDecision,
} from '@/features/contact-requests/lib/contact-disclosure';
import { parseCareerExperiences } from '@/features/candidates/config/career-profile-fields';
import { getExperienceLevelLabel } from '@/features/candidates/taxonomy/career-taxonomy';

const SLUG_TO_INTENT = Object.fromEntries(
  Object.entries(INTENT_TO_CATEGORY_SLUG).map(([intent, slug]) => [slug, intent]),
) as Record<string, CategoryIntentId>;

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
  'equityOffered',
  'stage',
  'investmentStage',
  'preferredStages',
  'sectors',
  'ticketSizeMin',
  'useOfFunds',
]);

/** Shown as feature cards on Digital & AI detail — omit from flat fact rows. */
const DIGITAL_AI_CAPABILITY_FACT_KEYS = new Set(['capabilities']);

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
  'dijital-ai': DIGITAL_AI_FIELD_SCHEMA,
};

const LISTING_TYPE_ID_TO_BROWSE_SLUG: Record<string, string> = {
  [LISTING_TYPE_IDS.yatirimBulDefault]: 'yatirim-bul',
  [LISTING_TYPE_IDS.yatirimYapDefault]: 'yatirim-yap',
  [LISTING_TYPE_IDS.isBulDefault]: 'is-bul',
  [LISTING_TYPE_IDS.iseAlDefault]: 'ise-al',
  [LISTING_TYPE_IDS.ortakBulDefault]: 'ortak-bul',
  [LISTING_TYPE_IDS.franchiseGiveDefault]: 'bayilik-al',
  [LISTING_TYPE_IDS.genelIlanDefault]: 'ilan',
  [LISTING_TYPE_IDS.dijitalAiDefault]: 'dijital-ai',
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum]: 'yatirim-bul',
  [MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum]: 'yatirim-yap',
  [MARKETPLACE_LISTING_TYPE_IDS.isAriyorum]: 'is-bul',
  [MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum]: 'ise-al',
  [MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum]: 'ortak-bul',
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikAl]: 'bayilik-al',
  [MARKETPLACE_LISTING_TYPE_IDS.bayilikVer]: 'bayilik-al',
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
  'ortak-ariyorum': 'ortak-bul',
  'franchise-ilan-ver': 'bayilik-al',
  'bayilik-al': 'bayilik-al',
  'bayilik-ver': 'bayilik-al',
  'genel-ilan': 'ilan',
  'dijital-ai-cozum': 'dijital-ai',
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

  return 'yatirim-bul';
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
): { label: string; value: string }[] {
  const schema = CATEGORY_FIELD_SCHEMAS[categorySlug];
  if (!schema) return [];

  const hideInvestmentKeys =
    categorySlug === 'yatirim-bul' || categorySlug === 'yatirim-yap';

  const facts = schema.fields
    .filter((field) => !COMPANY_BLOCK_CUSTOM_KEYS.has(field.key))
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

  const cf: Record<string, unknown> = { ...listing.customFields };
  if (redactIdentity || categorySlug === 'is-bul') {
    // Career public card: never surface employer/company-shaped fields.
    delete cf.companyName;
    delete cf.website;
    delete cf.cvUrl;
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
  const customFacts = buildCustomFacts(categorySlug, cf);
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
  const listingTypeSlug = categoryRegistry.getListingType(listing.listingTypeId)?.slug ?? null;
  const galleryItems =
    uploadedGallery.length > 0
      ? uploadedGallery
      : [
          {
            id: 'cover-fallback',
            label: listing.title,
            emoji: cardDisplay.typeEmoji,
            imageUrl: resolveListingCoverUrl({
              listingTypeSlug,
              group: cardDisplay.group,
              sector: toDisplayValue(cf.primarySector),
              role: resolveCareerCoverRole(
                toDisplayValue(cf.desiredRole),
                toDisplayValue(cf.desiredRoleOther),
              ),
            }),
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
  const companySector = redactIdentity
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
    CATEGORY_PAGE_CONFIG[categorySlug]?.label
    ?? (categorySlug === 'is-bul' ? 'İş İlanı' : undefined);

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
    ownerUserId: redactIdentity ? undefined : listing.ownerId,
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
    longDescription: listing.longDescription || listing.shortDescription,
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
      requested: readCfDisplay(cf, 'investmentAmount', 'ticketSizeMin'),
      equity: equityDisplay,
      stage: readCfDisplay(cf, 'stage', 'investmentStage', 'preferredStages'),
      industry: readCfDisplay(cf, 'sectors'),
      useOfFunds: readCfDisplay(cf, 'useOfFunds'),
      companyAge: '',
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
    customFacts: categorySlug === 'is-bul' ? [] : customFacts,
    careerCard:
      categorySlug === 'is-bul'
        ? buildCareerCard(cf, listing.longDescription)
        : undefined,
    capabilityModules: capabilityModules.length > 0 ? capabilityModules : undefined,
    identityRedacted: redactIdentity,
  };
}

function buildCareerCard(
  cf: Record<string, unknown>,
  longDescription: string | null | undefined,
): ListingDetail['careerCard'] {
  const desiredRoleRaw = toDisplayValue(cf.desiredRole);
  const desiredRole =
    desiredRoleRaw === 'Diğer' || desiredRoleRaw === 'Diğer / Kendim gireceğim'
      ? toDisplayValue(cf.desiredRoleOther) || desiredRoleRaw
      : desiredRoleRaw;
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
    desiredRole,
    experienceLevel: getExperienceLevelLabel(toDisplayValue(cf.experienceLevel)),
    primarySector: toDisplayValue(cf.primarySector),
    workType: toDisplayValue(cf.workType),
    preferredSectors: Array.isArray(cf.preferredSectors)
      ? cf.preferredSectors.map(String)
      : toDisplayValue(cf.preferredSectors),
    professionalSkills: toDisplayValue(cf.professionalSkills),
    technicalSkills: toDisplayValue(cf.technicalSkills),
    educationLevel: toDisplayValue(cf.educationLevel),
    educationField: toDisplayValue(cf.educationField),
    languages: toDisplayValue(cf.languages),
    certificates: toDisplayValue(cf.certificates),
    preferredCity: toDisplayValue(cf.preferredCity),
    workplacePreference: toDisplayValue(cf.workplacePreference),
    salaryExpectation: toDisplayValue(cf.salaryExpectation),
    availability: toDisplayValue(cf.availability),
    longDescription: longDescription ?? null,
    experiences,
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
  context?: { profile?: Profile | null; company?: Company | null },
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
    name: profile?.displayName ?? 'Kullanıcı',
    avatarUrl: profile?.avatarUrl ?? null,
    initials: (profile?.displayName ?? 'K').slice(0, 2).toUpperCase(),
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
