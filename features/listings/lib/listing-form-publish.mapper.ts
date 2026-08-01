import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import type { CategoryId } from '@/lib/domain/ids';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import { getListingCategoryModule } from '@/features/listings/config/listing-category-module.config';
import { listingFormValuesToFranchiseGivePayload } from '@/features/listings/lib/franchise-listing-form.mapper';
import { normalizeCvStorageRef } from '@/features/listings/lib/normalize-cv-storage-ref';

function readString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function readStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return undefined;
}

function basePayload(values: ListingFormValues) {
  const { core } = values;
  return {
    title: core.title,
    shortDescription: core.shortDescription,
    longDescription: core.longDescription || undefined,
    city: core.city ?? null,
  };
}

/** Map wizard values → module REST publish body (without flow suffix). */
export function listingFormValuesToModulePayload(
  categoryId: CategoryId,
  values: ListingFormValues,
): Record<string, unknown> & { flow?: FranchiseFlow } {
  const config = getListingCategoryModule(categoryId);
  if (!config) {
    throw new Error('Bu kategori için modül yayın yapılandırması bulunamadı.');
  }

  const { customFields } = values;
  const base = basePayload(values);

  switch (config.moduleKey) {
    case 'entrepreneurs':
      return {
        ...base,
        investmentStage: readString(customFields.stage),
        investmentAmount: customFields.investmentAmount,
        equityOffered: customFields.equityOffered,
        useOfFunds: customFields.useOfFunds,
      };

    case 'investors':
      return {
        ...base,
        investmentStage: readString(customFields.preferredStages),
        preferredStages: readString(customFields.preferredStages),
        sectors: readStringArray(customFields.sectors) ?? (
          readString(customFields.sectors) ? [String(customFields.sectors)] : undefined
        ),
        investmentAmount: customFields.investmentAmount,
      };

    case 'candidates':
      return {
        ...base,
        desiredRole: readString(customFields.desiredRole),
        experienceLevel: readString(customFields.experienceLevel),
        salaryExpectation: readString(customFields.salaryExpectation),
        workType: readString(customFields.workType),
        cvUrl: normalizeCvStorageRef(values.cvUrl ?? readString(customFields.cvUrl)),
        kvkkConsents: values.kvkkConsents ?? customFields.kvkkConsents,
      };

    case 'employers':
      return {
        ...base,
        employmentType: readString(customFields.workType),
        salaryRange: readString(customFields.salaryRange),
        positionTitle: readString(customFields.positionTitle),
        languageTags: values.tags,
      };

    case 'founders':
      return {
        ...base,
        founderType: readString(customFields.partnershipType),
        startupStage: readString(customFields.projectStage),
        requiredSkills: readStringArray(customFields.expertise),
        equityOffered: customFields.equityOffered,
        commitment: readString(customFields.commitment),
      };

    case 'franchise':
      return { ...listingFormValuesToFranchiseGivePayload(values) } as Record<string, unknown> & { flow: 'give' };

    default:
      throw new Error(`Desteklenmeyen modül: ${config.moduleKey}`);
  }
}
