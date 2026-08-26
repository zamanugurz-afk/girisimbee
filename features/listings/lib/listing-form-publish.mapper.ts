import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import type { CategoryId } from '@/lib/domain/ids';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import { getListingCategoryModule } from '@/features/listings/config/listing-category-module.config';
import { listingFormValuesToFranchiseGivePayload } from '@/features/listings/lib/franchise-listing-form.mapper';
import { acceptedCareerAiAnalysisOrNull } from '@/features/candidates/ai/career-ai-persist';
import { acceptedInvestmentAiAnalysisOrNull } from '@/features/investments/ai/investment-ai-persist';
import { acceptedInvestorAiAnalysisOrNull } from '@/features/investors/ai/investor-ai-persist';
import { INVESTMENT_PUBLISH_CUSTOM_KEYS } from '@/features/investments/taxonomy/investment-catalog';
import { INVESTOR_PUBLISH_CUSTOM_KEYS } from '@/features/investors/lib/investor-criteria';
import { ALL_STARTUP_STAGES_OPTION } from '@/features/listings/config/listing-field-options';
import { resolveInvestorTicket } from '@/features/investors/lib/investor-ticket';
import { resolvePartnershipIntent } from '@/features/founders/partnership-intent';

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
    contactPhone: values.contactPhone?.trim() || null,
    publishConsents: values.publishConsents ?? null,
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
    case 'entrepreneurs': {
      const investmentFields: Record<string, unknown> = {};
      for (const key of INVESTMENT_PUBLISH_CUSTOM_KEYS) {
        if (key === 'investmentAiAnalysis') {
          investmentFields[key] = acceptedInvestmentAiAnalysisOrNull(customFields[key]);
          continue;
        }
        if (customFields[key] !== undefined) {
          investmentFields[key] = customFields[key];
        }
      }
      return {
        ...base,
        sector: readString(customFields.sector),
        ...investmentFields,
        stage: readString(customFields.stage),
        investmentStage: readString(customFields.stage),
      };
    }

    case 'investors': {
      const investorFields: Record<string, unknown> = {};
      for (const key of INVESTOR_PUBLISH_CUSTOM_KEYS) {
        if (key === 'investorAiAnalysis') {
          investorFields[key] = acceptedInvestorAiAnalysisOrNull(customFields[key]);
          continue;
        }
        if (customFields[key] !== undefined) {
          investorFields[key] = customFields[key];
        }
      }
      const stages = readStringArray(customFields.preferredStages) ?? [];
      const allStages = stages.includes(ALL_STARTUP_STAGES_OPTION);
      const ticket = resolveInvestorTicket(customFields);
      return {
        ...base,
        ...investorFields,
        investmentStage: allStages ? ALL_STARTUP_STAGES_OPTION : (stages[0] ?? null),
        preferredStages: stages,
        sectors: readStringArray(customFields.sectors) ?? (
          readString(customFields.sectors) ? [String(customFields.sectors)] : undefined
        ),
        investmentAmount: customFields.investmentAmount,
        minimumInvestment: ticket.min,
        maximumInvestment: ticket.max,
        ticketMin: ticket.min,
        ticketMax: ticket.max,
      };
    }

    case 'candidates': {
      const role = readString(customFields.desiredRole);
      const level = readString(customFields.experienceLevel);
      const title = base.title?.trim() || role || 'Kariyer profili';
      const shortDescription =
        base.shortDescription?.trim()
        || [role, level].filter(Boolean).join(' · ')
        || 'Anonim kariyer özeti';
      return {
        ...base,
        title,
        shortDescription,
        city: readString(customFields.preferredCity) ?? base.city,
        primarySector: readString(customFields.primarySector),
        desiredRole: role,
        desiredRoleOther: readString(customFields.desiredRoleOther),
        experienceLevel: level,
        salaryExpectation: readString(customFields.salaryExpectation),
        workType: readString(customFields.workType),
        professionalSkills: readString(customFields.professionalSkills),
        technicalSkills: readString(customFields.technicalSkills),
        leadershipExperience: readString(customFields.leadershipExperience),
        tools: readString(customFields.tools),
        toolsOther: readString(customFields.toolsOther),
        educationLevel: readString(customFields.educationLevel),
        educationField: readString(customFields.educationField),
        languages: readString(customFields.languages),
        certificates: readString(customFields.certificates),
        preferredSectors: readStringArray(customFields.preferredSectors) ?? null,
        preferredRoles: readStringArray(customFields.preferredRoles) ?? null,
        preferredRolesOther: readString(customFields.preferredRolesOther),
        sectorOther: readString(customFields.sectorOther),
        preferredCity: readString(customFields.preferredCity),
        preferredDistrict: readString(customFields.preferredDistrict),
        workplacePreference: readString(customFields.workplacePreference),
        availability: readString(customFields.availability),
        experiences: Array.isArray(customFields.experiences)
          ? customFields.experiences
          : [],
        profileGender: readString(customFields.profileGender),
        birthDate: readString(customFields.birthDate),
        residenceCity: readString(customFields.residenceCity),
        residenceDistrict: readString(customFields.residenceDistrict),
        careerAiAnalysis: acceptedCareerAiAnalysisOrNull(customFields.careerAiAnalysis),
        contactPhone: base.contactPhone,
        publishConsents: values.publishConsents ?? null,
      };
    }

    case 'employers': {
      const role =
        readString(customFields.desiredRole)
        || readString(customFields.positionTitle);
      const level = readString(customFields.experienceLevel);
      const title = base.title?.trim() || role || 'Açık pozisyon';
      const shortDescription =
        base.shortDescription?.trim()
        || [role, level].filter(Boolean).join(' · ')
        || 'Açık pozisyon ilanı';
      const city = readString(customFields.preferredCity) ?? base.city;
      const district =
        readString(customFields.preferredDistrict)
        || readString(customFields.district);
      return {
        ...base,
        title,
        shortDescription,
        city,
        district,
        sector: readString(customFields.primarySector),
        primarySector: readString(customFields.primarySector),
        desiredRole: role,
        desiredRoleOther: readString(customFields.desiredRoleOther),
        experienceLevel: level,
        employmentType: readString(customFields.workType),
        workType: readString(customFields.workType),
        requiredResponsibilities: readString(customFields.requiredResponsibilities),
        requiredResponsibilitiesOther: readString(customFields.requiredResponsibilitiesOther),
        requiredAchievements: readString(customFields.requiredAchievements),
        requiredAchievementsOther: readString(customFields.requiredAchievementsOther),
        professionalSkills: readString(customFields.professionalSkills),
        professionalSkillsOther: readString(customFields.professionalSkillsOther),
        technicalSkills: readString(customFields.technicalSkills),
        technicalSkillsOther: readString(customFields.technicalSkillsOther),
        leadershipExperience: readString(customFields.leadershipExperience),
        tools: readString(customFields.tools),
        toolsOther: readString(customFields.toolsOther),
        educationLevel: readString(customFields.educationLevel),
        educationField: readString(customFields.educationField),
        educationFieldOther: readString(customFields.educationFieldOther),
        languages: readString(customFields.languages),
        languageEntries: customFields.languageEntries ?? null,
        certificates: readString(customFields.certificates),
        certificatesOther: readString(customFields.certificatesOther),
        preferredCity: city,
        preferredDistrict: district,
        workplacePreference: readString(customFields.workplacePreference),
        salaryRange: readString(customFields.salaryRange),
        availability: readString(customFields.availability),
        positionTitle: role,
        positionTitleOther: readString(customFields.desiredRoleOther)
          || readString(customFields.positionTitleOther),
        languageTags: values.tags,
      };
    }

    case 'founders': {
      const sectors = readStringArray(customFields.sectors);
      const sector = readString(customFields.sector) ?? sectors?.[0] ?? null;
      const partnershipTypes = readStringArray(customFields.partnershipTypes);
      const partnershipType =
        readString(customFields.partnershipType)
        ?? (partnershipTypes && partnershipTypes.length > 0 ? partnershipTypes.join(', ') : null);
      return {
        ...base,
        sector,
        founderType: partnershipType,
        partnershipType,
        partnershipTypes,
        partnershipTypesOther:
          readString(customFields.partnershipTypesOther)
          || readString(customFields.partnershipTypeOther),
        partnershipTypeOther:
          readString(customFields.partnershipTypeOther)
          || readString(customFields.partnershipTypesOther),
        partnershipIntent: resolvePartnershipIntent({ customFields }),
        startupStage: readString(customFields.projectStage),
        projectStage: readString(customFields.projectStage),
        requiredSkills: readStringArray(customFields.expertise),
        expertise: readStringArray(customFields.expertise),
        expertiseOther: readString(customFields.expertiseOther),
        offeredSkills: readStringArray(customFields.offeredSkills),
        professionalSkills:
          readStringArray(customFields.professionalSkills)
          ?? readString(customFields.professionalSkills),
        professionalSkillsOther: readString(customFields.professionalSkillsOther),
        technicalSkills:
          readStringArray(customFields.technicalSkills)
          ?? readString(customFields.technicalSkills),
        technicalSkillsOther: readString(customFields.technicalSkillsOther),
        tools: readStringArray(customFields.tools) ?? readString(customFields.tools),
        toolsOther: readString(customFields.toolsOther),
        sectors,
        experience: readString(customFields.experience),
        equityOffered: customFields.equityOffered,
        commitment: readString(customFields.commitment),
      };
    }

    case 'franchise':
      return { ...listingFormValuesToFranchiseGivePayload(values) } as Record<string, unknown> & { flow: 'give' };

    default:
      throw new Error(`Desteklenmeyen modül: ${config.moduleKey}`);
  }
}
