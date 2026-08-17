import type { Listing, ListingFilter, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type { ListingId, UserId } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { classifyCareerListingKind } from '@/features/matching-engine/adapters/career-listing-kinds';
import { calculateCareerProfileCompletion, valuesFromCareerSource } from '@/features/career-profile/completion';
import type { CareerProfileFormValues, CareerProfilePageData, CareerProfileRecord } from '@/features/career-profile/types';
import type { CareerListingKind } from '@/features/matching-engine/types';

const ALLOWED_CAREER_KEYS = [
  'desiredRole',
  'desiredRoleOther',
  'preferredRoles',
  'preferredRolesOther',
  'positionTitle',
  'primarySector',
  'preferredSectors',
  'experienceLevel',
  'professionalSkills',
  'professionalSkillsOther',
  'technicalSkills',
  'technicalSkillsOther',
  'workType',
  'employmentType',
  'workplacePreference',
  'preferredCity',
  'educationLevel',
  'languages',
  'availability',
  'requiredResponsibilities',
  'salary',
  'salaryMin',
  'salaryMax',
] as const;

export interface CareerProfileListingStore {
  search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  findById(id: ListingId): Promise<Listing | null>;
  update(id: ListingId, input: UpdateListingInput): Promise<Listing>;
}

function listingRecency(listing: Listing): number {
  const stamp = listing.publishedAt || listing.updatedAt || listing.createdAt;
  const time = stamp ? Date.parse(stamp) : 0;
  return Number.isFinite(time) ? time : 0;
}

function pickLatest(listings: Listing[]): Listing | null {
  if (!listings.length) return null;
  return [...listings].sort((a, b) => listingRecency(b) - listingRecency(a))[0] ?? null;
}

function toRecord(listing: Listing, kind: CareerListingKind): CareerProfileRecord {
  const source = { city: listing.city, location: listing.location, customFields: listing.customFields };
  return {
    kind,
    listingId: String(listing.id),
    title: listing.title,
    status: listing.status,
    editHref: `/ilanlarim/${listing.id}/duzenle`,
    values: valuesFromCareerSource(source),
    completion: calculateCareerProfileCompletion({
      kind,
      listingId: String(listing.id),
      source,
    }),
  };
}

export function formValuesToCustomFields(
  kind: CareerListingKind,
  values: CareerProfileFormValues,
): Record<string, unknown> {
  const roles = values.roles && values.roles.length > 0 ? values.roles : values.role ? [values.role] : [];
  const primaryRole = roles[0] || values.role || '';

  const sectors = values.sectors && values.sectors.length > 0 ? values.sectors : values.sector ? [values.sector] : [];
  const primarySector = sectors[0] || values.sector || '';

  const profSkills = values.professionalSkillsList && values.professionalSkillsList.length > 0
    ? values.professionalSkillsList.join(', ')
    : values.professionalSkills.trim();

  const techSkills = values.technicalSkillsList && values.technicalSkillsList.length > 0
    ? values.technicalSkillsList.join(', ')
    : values.technicalSkills.trim();

  const fields: Record<string, unknown> = {
    desiredRole: primaryRole,
    preferredRoles: roles.join(', '),
    primarySector: primarySector,
    preferredSectors: sectors.join(', '),
    experienceLevel: values.experienceLevel.trim(),
    professionalSkills: profSkills,
    technicalSkills: techSkills,
    workType: values.workType.trim(),
    workplacePreference: values.workplacePreference.trim(),
    preferredCity: values.city.trim(),
    educationLevel: values.educationLevel.trim(),
    languages: values.languages.trim(),
  };

  if (values.salaryMin || values.salaryMax) {
    fields.salaryMin = values.salaryMin;
    fields.salaryMax = values.salaryMax;
    if (values.salaryMin && values.salaryMax) {
      fields.salary = `${values.salaryMin.toLocaleString('tr-TR')} – ${values.salaryMax.toLocaleString('tr-TR')} TL`;
    } else if (values.salaryMin) {
      fields.salary = `${values.salaryMin.toLocaleString('tr-TR')} TL+`;
    } else if (values.salaryMax) {
      fields.salary = `${values.salaryMax.toLocaleString('tr-TR')} TL`;
    }
  }

  if (kind === 'hire') {
    fields.positionTitle = primaryRole;
    fields.employmentType = values.workType.trim();
    fields.requiredResponsibilities = values.candidateTraits.trim();
  } else {
    fields.availability = values.availability.trim();
  }
  return fields;
}

export class CareerProfileService {
  constructor(private readonly listings: CareerProfileListingStore) {}

  async getPageData(userId: UserId): Promise<CareerProfilePageData> {
    const owned = await this.listings.search(
      { ownerId: userId, status: ['published', 'draft', 'paused'] },
      { page: 1, limit: 100 },
    );

    const seek: Listing[] = [];
    const hire: Listing[] = [];
    for (const listing of owned.data) {
      const kind = classifyCareerListingKind(listing);
      if (kind === 'seek') seek.push(listing);
      if (kind === 'hire') hire.push(listing);
    }

    const seekListing = pickLatest(seek);
    const hireListing = pickLatest(hire);

    return {
      seek: seekListing ? toRecord(seekListing, 'seek') : null,
      hire: hireListing ? toRecord(hireListing, 'hire') : null,
    };
  }

  async saveProfile(
    userId: UserId,
    listingId: ListingId,
    values: CareerProfileFormValues,
  ): Promise<CareerProfileRecord> {
    const listing = await this.listings.findById(listingId);
    if (!listing || listing.ownerId !== userId) {
      throw new Error('Kariyer profili bulunamadı.');
    }
    const kind = classifyCareerListingKind(listing);
    if (!kind) {
      throw new Error('Bu ilan bir kariyer profili değil.');
    }

    const nextFields = { ...listing.customFields };
    const updates = formValuesToCustomFields(kind, values);
    for (const key of ALLOWED_CAREER_KEYS) {
      if (updates[key] !== undefined) {
        nextFields[key] = updates[key];
      }
    }

    const city = values.city.trim() || listing.city;
    const updated = await this.listings.update(listingId, {
      customFields: nextFields,
      city,
    });

    return toRecord(updated, kind);
  }
}
