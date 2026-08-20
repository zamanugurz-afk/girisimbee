'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Cloud, Shield, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingLiveCardPreview } from '@/features/listings/components/listing-live-card-preview';
import { cn } from '@/lib/utils';
import type { ListingType } from '@/features/listings/types/listing-type.types';
import type { CategoryId, ListingId } from '@/lib/domain/ids';
import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';
import {
  getListingFormDefaults,
  mergeCustomFieldDefaults,
  resolveEnumOption,
  validateListingFormStep,
} from '@/features/listings/form/build-dynamic-schema';
import {
  getListingFormSteps,
  resolveStepCustomFields,
  type ListingFormStepDef,
} from '@/features/listings/config/listing-form-steps.config';
import { partnerCoreFieldLabels, partnerCoreFieldUi } from '@/features/founders/partnership-form';
import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { resolveListingCoverUrl } from '@/features/listings/config/listing-cover.config';
import {
  getCoreFieldLabelsForCategory,
  getCoreFieldUiOverridesForCategory,
} from '@/features/listings/form/listing-field-metadata';
import { DynamicField } from '@/features/listings/form/fields/dynamic-field';
import { CoreListingFields } from '@/features/listings/form/fields/core-fields';
import { ImagesInput } from '@/features/listings/form/fields/meta-fields';
import { StructuredTagsSelect } from '@/features/listings/form/fields/structured-tags-select';
import { CvUploadField } from '@/features/listings/form/fields/cv-upload-field';
import { CvUploadCard } from '@/features/listings/form/fields/cv-upload-card';
import { CvExtractionHud } from '@/features/listings/form/fields/cv-extraction-hud';
import {
  ListingQualityChecklist,
  ListingProgressStatus,
} from '@/features/listings/form/fields/listing-quality-checklist';
import { StickyActionBar } from '@/features/listings/form/fields/sticky-action-bar';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';
import {
  EMPTY_KVKK_CONSENTS,
  type KvkkConsentValues,
} from '@/features/listings/form/fields/kvkk-consent-fields';
import {
  EMPTY_PUBLISH_CONSENTS,
  PublishConsentFields,
  validatePublishConsents,
  type PublishConsentValues,
} from '@/features/listings/form/fields/publish-consent-fields';
import {
  resolvePublishContactPhone,
  syncMarketplaceProfilePhone,
} from '@/features/listings/lib/resolve-publish-contact-phone';
import { getListingPackageService } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import { FormStepIndicator } from '@/features/listings/form/form-step-indicator';
import { CareerExperienceEditor } from '@/features/candidates/components/CareerExperienceEditor';
import { CareerEducationExtras } from '@/features/candidates/components/CareerEducationExtras';
import { CareerLanguagesEditor } from '@/features/candidates/components/CareerLanguagesEditor';
import { CareerPreferenceEditor } from '@/features/candidates/components/CareerPreferenceEditor';
import { CareerProfilePreview } from '@/features/candidates/components/CareerProfilePreview';
import { maskDisplaySurname } from '@/features/candidates/lib/career-public-identity';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { CareerSkillsEditor } from '@/features/candidates/components/CareerSkillsEditor';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import { CareerAiAnalyzePanel } from '@/features/candidates/components/CareerAiAnalyzePanel';
import { acceptedCareerAiAnalysisOrNull } from '@/features/candidates/ai/career-ai-persist';
import { InvestmentAiAnalyzePanel } from '@/features/investments/components/InvestmentAiAnalyzePanel';
import { InvestmentProfilePreview } from '@/features/investments/components/InvestmentProfilePreview';
import { acceptedInvestmentAiAnalysisOrNull } from '@/features/investments/ai/investment-ai-persist';
import {
  buildInvestmentContext,
  validateInvestmentFundingFields,
} from '@/features/investments/lib/investment-context';
import { buildInvestmentCardData } from '@/features/investments/lib/investment-card';
import { buildInvestmentSummaryDraft } from '@/features/investments/lib/investment-summary';
import { polishInvestmentText } from '@/features/investments/lib/investment-text';
import {
  displaySeekingMetricValue,
  filterVisibleSeekingCustomFields,
  hasDistinctProductName,
  materializeSeekingInvestmentFields,
  seekingFieldChangeExtras,
} from '@/features/investments/lib/seeking-form-visibility';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { InvestorAiAnalyzePanel } from '@/features/investors/components/InvestorAiAnalyzePanel';
import { InvestorProfilePreview } from '@/features/investors/components/InvestorProfilePreview';
import { acceptedInvestorAiAnalysisOrNull } from '@/features/investors/ai/investor-ai-persist';
import {
  buildInvestorCriteriaContext,
} from '@/features/investors/lib/investor-criteria';
import { buildInvestorCardData } from '@/features/investors/lib/investor-card';
import { buildInvestorSummaryDraft } from '@/features/investors/lib/investor-summary';
import { validateInvestorTicketFields } from '@/features/investors/lib/investor-ticket';
import { HireRoleNeedsEditor } from '@/features/employers/components/HireRoleNeedsEditor';
import { buildHiringSummaryDraft } from '@/features/employers/lib/hire-summary';
import {
  parseCareerExperiences,
  validateCareerExperiences,
} from '@/features/candidates/config/career-profile-fields';
import { findCareerProfileContentViolation } from '@/features/candidates/lib/career-profile-content-policy';
import {
  buildCareerSummaryDraft,
  polishCareerSummary,
  stripCareerContactFluff,
} from '@/features/candidates/lib/career-summary';
import {
  materializeCareerEducationFields,
  materializeCareerSkillsFields,
  materializeHireRoleNeedsFields,
  validateCareerEducationStep,
  validateCareerManualOther,
  validateCareerPreferencesStep,
  validateCareerSkillsStep,
  validateHireRoleNeedsStep,
} from '@/features/candidates/lib/career-form-step-validation';
import {
  getExperienceLevelLabel,
  getPositionsForSector,
  getSectorsForPosition,
  isManualCareerOption,
  parseCareerLanguages,
  MANUAL_OPTION,
  MANUAL_OPTION_SHORT,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { getSampleListingValues } from '@/features/listings/form/sample-listing-values';
import {
  useListingFormAutosave,
  buildListingDraftStorageKey,
} from '@/features/listings/hooks/use-listing-form-autosave';
import {
  DEFAULT_PAID_PUBLISH_PACKAGE_SELECTION,
  DEFAULT_PACKAGE_SELECTION,
  ListingPackageSelectionStep,
  type ListingPackageSelectionValue,
} from '@/features/listings/form/listing-package-selection-step';
import { ListingPreviewDialog } from '@/features/listings/components/listing-preview-dialog';
import { ListingFormPreviewContent } from '@/features/listings/components/listing-form-preview-content';
import { ListingLivePreviewContainer } from '@/features/listings/components/listing-live-preview-container';
import { getListingCategoryTheme } from '@/features/listings/config/listing-form-theme.config';
import {
  DIGITAL_AI_PUBLISH_CONFIG,
  FRANCHISE_PUBLISH_CONFIG,
  JOB_PUBLISH_CONFIG,
  PLACEMENT_PACKAGE_CONFIG,
  STANDARD_PUBLISH_CONFIG,
  STANDARD_REPUBLISH_CONFIG,
  formatPlacementPriceTry,
} from '@/features/monetization/types/listing-placement.types';

function packageVariantForCategory(
  categoryId: CategoryId,
): 'placement' | 'franchise' | 'dijital_ai' | 'job' {
  if (categoryId === CATEGORY_IDS.bayilikAl) return 'franchise';
  if (categoryId === CATEGORY_IDS.dijitalAi) return 'dijital_ai';
  if (categoryId === CATEGORY_IDS.iseAl) return 'job';
  return 'placement';
}

function isPaidPublishCategory(categoryId: CategoryId): boolean {
  return packageVariantForCategory(categoryId) !== 'placement';
}

/** When “Diğer” / manual fallback is selected, require a free-text explanation. */
function collectOtherDetailErrors(
  customFields: Record<string, unknown>,
  stepKeys: string[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const keys = new Set(stepKeys);

  function requireOther(parentOk: boolean, otherKey: string, label: string) {
    if (!parentOk || !keys.has(otherKey)) return;
    const text = String(customFields[otherKey] ?? '').trim();
    if (text.length < 30) {
      errors[otherKey] = `${label} en az 30 karakter olmalıdır.`;
    }
  }

  if (keys.has('desiredRoleOther')) {
    const roleOtherError = validateCareerManualOther(
      customFields.desiredRole,
      customFields.desiredRoleOther,
      'Pozisyon açıklaması',
    );
    if (roleOtherError) errors.desiredRoleOther = roleOtherError;
  }

  requireOther(
    String(customFields.positionTitle ?? '') === 'Diğer',
    'positionTitleOther',
    'Pozisyon açıklaması',
  );
  requireOther(
    Array.isArray(customFields.preferredSectors)
      && customFields.preferredSectors.map(String).some((item) => isManualCareerOption(item)),
    'sectorOther',
    'Sektör açıklaması',
  );
  requireOther(
    Array.isArray(customFields.preferredRoles)
      && customFields.preferredRoles.map(String).some((item) => isManualCareerOption(item)),
    'preferredRolesOther',
    'Pozisyon açıklaması',
  );
  requireOther(
    String(customFields.preferredDistrict ?? '') === 'Diğer',
    'preferredDistrictOther',
    'İlçe açıklaması',
  );
  requireOther(
    String(customFields.district ?? '') === 'Diğer',
    'districtOther',
    'İlçe açıklaması',
  );

  return errors;
}

function defaultPackageSelectionFor(categoryId: CategoryId): ListingPackageSelectionValue {
  return isPaidPublishCategory(categoryId)
    ? { ...DEFAULT_PAID_PUBLISH_PACKAGE_SELECTION }
    : { ...DEFAULT_PACKAGE_SELECTION };
}

function publishConfigForCategory(categoryId: CategoryId) {
  const variant = packageVariantForCategory(categoryId);
  if (variant === 'franchise') return FRANCHISE_PUBLISH_CONFIG;
  if (variant === 'dijital_ai') return DIGITAL_AI_PUBLISH_CONFIG;
  if (variant === 'job') return JOB_PUBLISH_CONFIG;
  return null;
}

import {
  filterErrorsToCurrentStep,
  findStepIndexForErrors,
  logValidationErrors,
  resolvePublishErrorMessages,
  validateListingFormBeforePublish,
  parseZodErrors,
  resolveFieldError,
  scheduleScrollToFirstError,
  type ValidationFormSnapshot,
} from '@/features/listings/form/form-validation-utils';
import { ZodError } from 'zod';

export interface ListingFormValues {
  core: CoreListingFieldsInput;
  customFields: Record<string, unknown>;
  tags: string[];
  images: { url: string; alt?: string | null; sortOrder?: number }[];
  cvUrl?: string | null;
  kvkkConsents?: KvkkConsentValues;
  /** Phone-only contact V1 — publish consents for all categories */
  publishConsents?: PublishConsentValues;
  /** Copied from profile at publish — shown on listing detail */
  contactPhone?: string | null;
  /** Homepage placement selection — simulated payment only in Phase 2 */
  packageSelection?: ListingPackageSelectionValue;
}

export interface CategoryListingFormProps {
  listingType: ListingType;
  categoryId: CategoryId;
  listingId?: ListingId;
  initialValues?: Partial<ListingFormValues>;
  userId?: string;
  onSubmit?: (values: ListingFormValues) => Promise<void>;
  onSaveDraft?: (values: ListingFormValues) => Promise<void>;
  onPublish?: (values: ListingFormValues) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
  showDraftButton?: boolean;
  showPreviewButton?: boolean;
  showPublishButton?: boolean;
  /** Ortak-bul form variant — ignored for other categories. */
  partnershipIntent?: PartnershipIntent;
}

function stepValidationInput(
  step: ListingFormStepDef,
  fieldKeys: string[],
) {
  return {
    coreFields: step.coreFields,
    customFieldKeys: step.customFieldKeys ? fieldKeys : undefined,
    meta: step.meta,
  };
}

function formatAutosaveTime(date: Date): string {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function buildCareerCardPreviewData(
  categoryId: CategoryId,
  customFields: Record<string, unknown>,
  longDescription?: string | null,
  displayName?: string | null,
) {
  const isHire = categoryId === CATEGORY_IDS.iseAl;
  const role = isManualCareerOption(customFields.desiredRole)
    ? String(customFields.desiredRoleOther ?? '')
    : String(customFields.desiredRole ?? '');
  const name = isHire ? null : (displayName ?? null);
  return {
    variant: (isHire ? 'hire' : 'seeker') as 'hire' | 'seeker',
    desiredRole: role,
    experienceLevel: getExperienceLevelLabel(String(customFields.experienceLevel ?? '')),
    primarySector: String(customFields.primarySector ?? ''),
    workType: String(customFields.workType ?? ''),
    preferredSectors: customFields.preferredSectors as string[] | string,
    professionalSkills: String(customFields.professionalSkills ?? ''),
    technicalSkills: String(customFields.technicalSkills ?? ''),
    educationLevel: String(customFields.educationLevel ?? ''),
    educationField: String(customFields.educationField ?? ''),
    languages: String(customFields.languages ?? ''),
    certificates: String(customFields.certificates ?? ''),
    preferredCity: String(customFields.preferredCity ?? ''),
    workplacePreference: String(customFields.workplacePreference ?? ''),
    salaryExpectation: String(customFields.salaryExpectation ?? ''),
    salaryRange: String(customFields.salaryRange ?? ''),
    availability: String(customFields.availability ?? ''),
    requiredResponsibilities: String(customFields.requiredResponsibilities ?? ''),
    requiredAchievements: String(customFields.requiredAchievements ?? ''),
    longDescription,
    experiences: isHire ? [] : parseCareerExperiences(customFields.experiences),
    displayName: name,
    displayNameMasked: isHire ? null : maskDisplaySurname(name),
    birthDate: isHire ? '' : String(customFields.birthDate ?? ''),
    gender: isHire ? '' : String(customFields.profileGender ?? ''),
    residenceCity: isHire ? '' : String(customFields.residenceCity ?? ''),
    residenceDistrict: isHire ? '' : String(customFields.residenceDistrict ?? ''),
    personalInfoPreview: !isHire,
    coverUrl: resolveListingCoverUrl({
      listingTypeSlug: isHire ? 'ise-aliyorum' : 'is-ariyorum',
      sector: String(customFields.primarySector ?? ''),
      role,
      gender: isHire ? null : String(customFields.profileGender ?? ''),
    }),
  };
}

export function CategoryListingForm({
  listingType,
  categoryId,
  listingId,
  initialValues,
  userId,
  onSubmit,
  onSaveDraft,
  onPublish,
  submitLabel = 'Kaydet',
  disabled,
  showDraftButton = false,
  showPreviewButton = false,
  showPublishButton = false,
  partnershipIntent,
}: CategoryListingFormProps) {
  const { user } = useAuth();
  const steps = useMemo(
    () => getListingFormSteps(categoryId, { partnershipIntent }),
    [categoryId, partnershipIntent],
  );
  const coreFieldLabels =
    categoryId === CATEGORY_IDS.ortakBul && partnershipIntent
      ? partnerCoreFieldLabels(partnershipIntent)
      : getCoreFieldLabelsForCategory(categoryId);
  const coreFieldUi =
    categoryId === CATEGORY_IDS.ortakBul && partnershipIntent === 'joining'
      ? partnerCoreFieldUi('joining')
      : getCoreFieldUiOverridesForCategory(categoryId);
  const allFieldKeys = useMemo(
    () => listingType.fieldSchema.fields.map((f) => f.key),
    [listingType.fieldSchema],
  );
  const customFieldLabels = useMemo(
    () => new Map(listingType.fieldSchema.fields.map((field) => [field.key, field.label])),
    [listingType.fieldSchema],
  );
  const fieldByKey = useMemo(
    () => new Map(listingType.fieldSchema.fields.map((f) => [f.key, f])),
    [listingType.fieldSchema],
  );
  const theme = useMemo(() => getListingCategoryTheme(categoryId), [categoryId]);

  const defaults = useMemo(() => {
    const base = getListingFormDefaults(listingType.fieldSchema);
    return {
      core: { ...base.core, ...initialValues?.core },
      customFields: mergeCustomFieldDefaults(
        listingType.fieldSchema,
        initialValues?.customFields ?? base.customFields,
      ),
      tags: initialValues?.tags ?? base.tags,
      images: initialValues?.images ?? base.images,
      cvUrl: initialValues?.cvUrl ?? null,
      kvkkConsents: initialValues?.kvkkConsents ?? { ...EMPTY_KVKK_CONSENTS },
      publishConsents: initialValues?.publishConsents ?? { ...EMPTY_PUBLISH_CONSENTS },
      contactPhone: initialValues?.contactPhone ?? null,
      packageSelection:
        initialValues?.packageSelection ?? defaultPackageSelectionFor(categoryId),
    };
  }, [listingType.fieldSchema, initialValues, categoryId]);

  const storageKey = buildListingDraftStorageKey(categoryId, listingType.id, listingId);

  const [stepIndex, setStepIndex] = useState(0);
  const [core, setCore] = useState<CoreListingFieldsInput>(defaults.core);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>(defaults.customFields);
  const [tags, setTags] = useState<string[]>(defaults.tags);
  const [images, setImages] = useState(defaults.images);
  const [cvUrl, setCvUrl] = useState<string | null>(defaults.cvUrl ?? null);
  const [kvkkConsents, setKvkkConsents] = useState<KvkkConsentValues>(
    defaults.kvkkConsents ?? { ...EMPTY_KVKK_CONSENTS },
  );
  const [publishConsents, setPublishConsents] = useState<PublishConsentValues>(
    defaults.publishConsents ?? { ...EMPTY_PUBLISH_CONSENTS },
  );
  const [contactPhone, setContactPhone] = useState<string | null>(
    defaults.contactPhone ?? null,
  );
  const [packageSelection, setPackageSelection] = useState<ListingPackageSelectionValue>(
    defaults.packageSelection ?? defaultPackageSelectionFor(categoryId),
  );
  /** Free categories: first listing free; false → 99 TL. Default true until loaded. */
  const [categoryFreeAvailable, setCategoryFreeAvailable] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<'save' | 'draft' | 'publish' | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [showSampleFill, setShowSampleFill] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [showDistinctProductName, setShowDistinctProductName] = useState(() =>
    hasDistinctProductName(defaults.core.title, defaults.customFields.productName),
  );
  const [showUseOfFundsDetail, setShowUseOfFundsDetail] = useState(() =>
    Boolean(String(defaults.customFields.useOfFundsDetail ?? '').trim()),
  );
  const [editingInvestmentSummary, setEditingInvestmentSummary] = useState(false);
  const [isManualCvMode, setIsManualCvMode] = useState(false);
  const [cvFilledKeys, setCvFilledKeys] = useState<Set<string>>(new Set());
  const [pendingCvDraft, setPendingCvDraft] = useState<CvProfileDraftResult | null>(null);
  const [isCvApplied, setIsCvApplied] = useState(false);
  const [cvDraftInfo, setCvDraftInfo] = useState<{
    fileName?: string;
    experienceCount: number;
    educationCount: number;
    languageCount: number;
    skillCount: number;
    location?: string;
  } | null>(() => {
    const experiences = parseCareerExperiences(defaults.customFields.experiences);
    if (experiences.length > 0 && defaults.customFields.cvFileName) {
      return {
        fileName: String(defaults.customFields.cvFileName ?? ''),
        experienceCount: experiences.length,
        educationCount: defaults.customFields.educationLevel ? 1 : 0,
        languageCount: defaults.customFields.languages ? String(defaults.customFields.languages).split(',').length : 0,
        skillCount: String(defaults.customFields.professionalSkills ?? '').split(',').filter(Boolean).length,
        location: defaults.customFields.residenceCity ? String(defaults.customFields.residenceCity) : undefined,
      };
    }
    return null;
  });

  const currentStep = steps[stepIndex];
  const isPreviewStep = Boolean(currentStep.preview);
  const isPackageStep = Boolean(currentStep.package);
  const isPublishStep = Boolean(currentStep.publish);
  const isCvStep = Boolean(currentStep.cv);
  const isKvkkStep = Boolean(currentStep.kvkk);
  const isExperienceStep = Boolean(currentStep.experienceEditor);
  const isCareerSkillsStep = Boolean(currentStep.careerSkillsEditor);
  const isCareerEducationStep = Boolean(currentStep.careerEducationEditor);
  const isCareerPreferenceStep = Boolean(currentStep.careerPreferenceEditor);
  const isHireRoleNeedsStep = Boolean(currentStep.hireRoleNeedsEditor);
  const isCareerSummaryStep =
    (categoryId === CATEGORY_IDS.isBul || categoryId === CATEGORY_IDS.iseAl)
    && Boolean(currentStep.coreFields?.includes('longDescription'));
  const isInvestmentSummaryStep =
    categoryId === CATEGORY_IDS.yatirimBul
    && Boolean(currentStep.coreFields?.includes('longDescription'));
  const isInvestorSummaryStep =
    categoryId === CATEGORY_IDS.yatirimYap
    && Boolean(currentStep.coreFields?.includes('longDescription'));
  const isFormStep = !isPreviewStep && !isPackageStep && !isPublishStep;
  const usesExtendedCities =
    categoryId === CATEGORY_IDS.isBul
    || categoryId === CATEGORY_IDS.iseAl
    || categoryId === CATEGORY_IDS.bayilikAl
    || categoryId === CATEGORY_IDS.yatirimBul
    || categoryId === CATEGORY_IDS.yatirimYap
    || categoryId === CATEGORY_IDS.ortakBul;
  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;

  const mergedCustomFields = useMemo(
    () => mergeCustomFieldDefaults(listingType.fieldSchema, customFields),
    [listingType.fieldSchema, customFields],
  );

  const qualityChecklistItems = useMemo(() => {
    if (categoryId === CATEGORY_IDS.isBul) {
      const hasRole = Boolean(mergedCustomFields.desiredRole);
      const hasSector = Boolean(mergedCustomFields.primarySector);
      const exps = parseCareerExperiences(mergedCustomFields.experiences);
      const hasSkills = Boolean(
        mergedCustomFields.professionalSkills || mergedCustomFields.technicalSkills,
      );
      const hasWorkType = Boolean(
        mergedCustomFields.workType || mergedCustomFields.workplacePreference,
      );
      const hasLocation = Boolean(mergedCustomFields.preferredCity || core.city);

      return [
        {
          id: 'role-sector',
          label: 'Pozisyon ve Sektör',
          isComplete: hasRole && hasSector,
          isRequired: true,
          stepIndex: 0,
        },
        {
          id: 'experience',
          label: exps.length > 0 ? `${exps.length} Deneyim eklendi` : 'Deneyim geçmişi ekleyin',
          isComplete: exps.length > 0,
          isRequired: true,
          stepIndex: 1,
        },
        {
          id: 'skills',
          label: 'Yetkinlikler ve Eğitim',
          isComplete: hasSkills,
          isRequired: true,
          stepIndex: 1,
        },
        {
          id: 'preferences',
          label: 'Çalışma Modeli ve Tercihler',
          isComplete: hasWorkType,
          isRequired: false,
          stepIndex: 2,
        },
        {
          id: 'location',
          label: 'Hedef Lokasyon',
          isComplete: hasLocation,
          isRequired: true,
          stepIndex: 2,
        },
      ];
    }
    if (categoryId === CATEGORY_IDS.iseAl) {
      const hasRole = Boolean(mergedCustomFields.desiredRole);
      const hasSector = Boolean(mergedCustomFields.primarySector);
      const hasCompany = Boolean(mergedCustomFields.companyName);
      const hasSkills = Boolean(
        mergedCustomFields.professionalSkills || mergedCustomFields.technicalSkills,
      );
      const hasLocation = Boolean(mergedCustomFields.preferredCity || core.city);

      return [
        {
          id: 'role-company',
          label: 'Şirket ve Pozisyon',
          isComplete: hasRole && hasSector && hasCompany,
          isRequired: true,
          stepIndex: 0,
        },
        {
          id: 'needs',
          label: 'İş Tanımı ve Yetkinlikler',
          isComplete: hasSkills,
          isRequired: true,
          stepIndex: 1,
        },
        {
          id: 'offer',
          label: 'Teklif ve Lokasyon',
          isComplete: hasLocation,
          isRequired: true,
          stepIndex: 2,
        },
      ];
    }
    if (categoryId === CATEGORY_IDS.ortakBul) {
      const hasTitle = Boolean(core.title);
      const hasShort = Boolean(core.shortDescription);
      const hasDetails = Boolean(core.longDescription);

      return [
        {
          id: 'basics',
          label: 'Girişim Başlığı ve Özet',
          isComplete: hasTitle && hasShort,
          isRequired: true,
          stepIndex: 0,
        },
        {
          id: 'partnership',
          label: 'Ortaklık Kriterleri',
          isComplete: Boolean(mergedCustomFields.partnerType),
          isRequired: true,
          stepIndex: 1,
        },
        {
          id: 'details',
          label: 'Detaylı Açıklama',
          isComplete: hasDetails,
          isRequired: true,
          stepIndex: 2,
        },
      ];
    }
    return [];
  }, [categoryId, mergedCustomFields, core.title, core.shortDescription, core.longDescription, core.city]);
  const lastAutoCareerSummaryRef = useRef('');
  const lastAutoInvestmentSummaryRef = useRef('');
  const lastAutoInvestmentShortRef = useRef('');
  const lastAutoInvestorSummaryRef = useRef('');
  const lastAutoInvestorShortRef = useRef('');
  const careerSummaryDraft = useMemo(() => {
    if (categoryId === CATEGORY_IDS.iseAl) {
      return buildHiringSummaryDraft({
        desiredRole: isManualCareerOption(mergedCustomFields.desiredRole)
          ? String(mergedCustomFields.desiredRoleOther ?? '')
          : String(mergedCustomFields.desiredRole ?? ''),
        experienceLevel: String(mergedCustomFields.experienceLevel ?? ''),
        primarySector: String(mergedCustomFields.primarySector ?? ''),
        workType: String(mergedCustomFields.workType ?? ''),
        professionalSkills: String(mergedCustomFields.professionalSkills ?? ''),
        technicalSkills: String(mergedCustomFields.technicalSkills ?? ''),
        educationLevel: String(mergedCustomFields.educationLevel ?? ''),
        educationField: String(mergedCustomFields.educationField ?? ''),
        languages: String(mergedCustomFields.languages ?? ''),
        preferredCity: String(mergedCustomFields.preferredCity ?? ''),
        workplacePreference: String(mergedCustomFields.workplacePreference ?? ''),
        availability: String(mergedCustomFields.availability ?? ''),
        salaryRange: String(mergedCustomFields.salaryRange ?? ''),
        requiredResponsibilities: String(mergedCustomFields.requiredResponsibilities ?? ''),
        tools: String(mergedCustomFields.tools ?? ''),
        toolsOther: String(mergedCustomFields.toolsOther ?? ''),
        preferredDistrict: String(mergedCustomFields.preferredDistrict ?? ''),
      });
    }
    if (categoryId !== CATEGORY_IDS.isBul) return '';
    return buildCareerSummaryDraft({
      desiredRole: isManualCareerOption(mergedCustomFields.desiredRole)
        ? String(mergedCustomFields.desiredRoleOther ?? '')
        : String(mergedCustomFields.desiredRole ?? ''),
      experienceLevel: String(mergedCustomFields.experienceLevel ?? ''),
      primarySector: String(mergedCustomFields.primarySector ?? ''),
      workType: String(mergedCustomFields.workType ?? ''),
      preferredSectors: mergedCustomFields.preferredSectors as string[] | string,
      professionalSkills: String(mergedCustomFields.professionalSkills ?? ''),
      technicalSkills: String(mergedCustomFields.technicalSkills ?? ''),
      educationLevel: String(mergedCustomFields.educationLevel ?? ''),
      educationField: String(mergedCustomFields.educationField ?? ''),
      languages: String(mergedCustomFields.languages ?? ''),
      preferredCity: String(mergedCustomFields.preferredCity ?? ''),
      workplacePreference: String(mergedCustomFields.workplacePreference ?? ''),
      availability: String(mergedCustomFields.availability ?? ''),
      experiences: parseCareerExperiences(mergedCustomFields.experiences),
    });
  }, [categoryId, mergedCustomFields]);

  useEffect(() => {
    if (categoryId !== CATEGORY_IDS.isBul && categoryId !== CATEGORY_IDS.iseAl) return;
    const current = core.longDescription ?? '';
    const stripped = stripCareerContactFluff(current);
    if (stripped !== current) {
      setCore((prev) => {
        const next = stripCareerContactFluff(prev.longDescription);
        return next === prev.longDescription ? prev : { ...prev, longDescription: next };
      });
    }
  }, [categoryId, core.longDescription]);

  useEffect(() => {
    if (!isCareerSummaryStep || !careerSummaryDraft) return;
    const current = polishCareerSummary(core.longDescription);
    if (!current || current === lastAutoCareerSummaryRef.current) {
      lastAutoCareerSummaryRef.current = careerSummaryDraft;
      setCore((prev) => (
        prev.longDescription === careerSummaryDraft
          ? prev
          : { ...prev, longDescription: careerSummaryDraft }
      ));
    }
  }, [careerSummaryDraft, core.longDescription, isCareerSummaryStep]);

  const applyCareerSummaryDraft = useCallback(() => {
    if (!careerSummaryDraft) return;
    lastAutoCareerSummaryRef.current = careerSummaryDraft;
    setCore((prev) => ({ ...prev, longDescription: careerSummaryDraft }));
  }, [careerSummaryDraft]);

  const investmentSummaryDraft = useMemo(() => {
    if (categoryId !== CATEGORY_IDS.yatirimBul) return null;
    return buildInvestmentSummaryDraft(
      buildInvestmentContext({
        title: core.title,
        city: core.city,
        customFields: mergedCustomFields,
      }),
    );
  }, [categoryId, core.city, core.title, mergedCustomFields]);

  useEffect(() => {
    if (!isInvestmentSummaryStep || !investmentSummaryDraft) return;
    const currentLong = polishInvestmentText(core.longDescription);
    const currentShort = polishInvestmentText(core.shortDescription);
    const longUntouched =
      !currentLong || currentLong === lastAutoInvestmentSummaryRef.current;
    const shortUntouched =
      !currentShort || currentShort === lastAutoInvestmentShortRef.current;
    if (!longUntouched && !shortUntouched) return;
    lastAutoInvestmentSummaryRef.current = investmentSummaryDraft.longDescription;
    lastAutoInvestmentShortRef.current = investmentSummaryDraft.shortDescription;
    setCore((prev) => ({
      ...prev,
      longDescription: longUntouched
        ? investmentSummaryDraft.longDescription
        : prev.longDescription,
      shortDescription: shortUntouched
        ? investmentSummaryDraft.shortDescription
        : prev.shortDescription,
    }));
  }, [
    core.longDescription,
    core.shortDescription,
    investmentSummaryDraft,
    isInvestmentSummaryStep,
  ]);

  const investorSummaryDraft = useMemo(() => {
    if (categoryId !== CATEGORY_IDS.yatirimYap) return null;
    return buildInvestorSummaryDraft(
      buildInvestorCriteriaContext({
        title: core.title,
        customFields: mergedCustomFields,
      }),
    );
  }, [categoryId, core.title, mergedCustomFields]);

  useEffect(() => {
    if (!isInvestorSummaryStep || !investorSummaryDraft) return;
    const currentLong = polishInvestmentText(core.longDescription);
    const currentShort = polishInvestmentText(core.shortDescription);
    const longUntouched =
      !currentLong || currentLong === lastAutoInvestorSummaryRef.current;
    const shortUntouched =
      !currentShort || currentShort === lastAutoInvestorShortRef.current;
    if (!longUntouched && !shortUntouched) return;
    lastAutoInvestorSummaryRef.current = investorSummaryDraft.longDescription;
    lastAutoInvestorShortRef.current = investorSummaryDraft.shortDescription;
    setCore((prev) => ({
      ...prev,
      longDescription: longUntouched
        ? investorSummaryDraft.longDescription
        : prev.longDescription,
      shortDescription: shortUntouched
        ? investorSummaryDraft.shortDescription
        : prev.shortDescription,
    }));
  }, [
    core.longDescription,
    core.shortDescription,
    investorSummaryDraft,
    isInvestorSummaryStep,
  ]);

  const applyInvestorSummaryDraft = useCallback(() => {
    if (!investorSummaryDraft) return;
    lastAutoInvestorSummaryRef.current = investorSummaryDraft.longDescription;
    lastAutoInvestorShortRef.current = investorSummaryDraft.shortDescription;
    setCore((prev) => ({
      ...prev,
      longDescription: investorSummaryDraft.longDescription,
      shortDescription: investorSummaryDraft.shortDescription,
    }));
  }, [investorSummaryDraft]);

  const formValues = useMemo(
    (): ListingFormValues => ({
      core,
      customFields: mergedCustomFields,
      tags,
      images,
      cvUrl,
      kvkkConsents,
      publishConsents,
      contactPhone,
      packageSelection,
    }),
    [
      core,
      mergedCustomFields,
      tags,
      images,
      cvUrl,
      kvkkConsents,
      publishConsents,
      contactPhone,
      packageSelection,
    ],
  );

  const validationSnapshot = useMemo(
    (): ValidationFormSnapshot => ({
      core,
      customFields: mergedCustomFields,
      tags,
      images,
      cvUrl,
      kvkkConsents,
      publishConsents,
      contactPhone,
    }),
    [core, mergedCustomFields, tags, images, cvUrl, kvkkConsents, publishConsents, contactPhone],
  );

  const isCareerCardCategory =
    categoryId === CATEGORY_IDS.isBul || categoryId === CATEGORY_IDS.iseAl;
  const isInvestmentCardCategory = categoryId === CATEGORY_IDS.yatirimBul;
  const isInvestorCardCategory = categoryId === CATEGORY_IDS.yatirimYap;
  const investmentPreviewData = useMemo(
    () =>
      isInvestmentCardCategory
        ? buildInvestmentCardData({
            context: buildInvestmentContext({
              title: core.title,
              city: core.city,
              customFields: mergedCustomFields,
            }),
            longDescription: core.longDescription,
            shortDescription: core.shortDescription,
            storedAnalysis: mergedCustomFields.investmentAiAnalysis,
          })
        : null,
    [
      core.city,
      core.longDescription,
      core.shortDescription,
      core.title,
      isInvestmentCardCategory,
      mergedCustomFields,
    ],
  );
  const investorPreviewData = useMemo(
    () =>
      isInvestorCardCategory
        ? buildInvestorCardData({
            context: buildInvestorCriteriaContext({
              title: core.title,
              customFields: mergedCustomFields,
            }),
            longDescription: core.longDescription,
            shortDescription: core.shortDescription,
            storedAnalysis: mergedCustomFields.investorAiAnalysis,
          })
        : null,
    [
      core.longDescription,
      core.shortDescription,
      core.title,
      isInvestorCardCategory,
      mergedCustomFields,
    ],
  );
  const careerPreviewData = useMemo(
    () =>
      isCareerCardCategory
        ? buildCareerCardPreviewData(
            categoryId,
            mergedCustomFields,
            core.longDescription,
            user?.displayName,
          )
        : null,
    [categoryId, core.longDescription, isCareerCardCategory, mergedCustomFields, user?.displayName],
  );

  const stepCustomKeys = useMemo(
    () => resolveStepCustomFields(currentStep, allFieldKeys),
    [currentStep, allFieldKeys],
  );
  const visibleStepCustomKeys = useMemo(() => {
    if (categoryId !== CATEGORY_IDS.yatirimBul) return stepCustomKeys;
    return filterVisibleSeekingCustomFields(stepCustomKeys, {
      customFields: mergedCustomFields,
      title: core.title,
      revealProductName: showDistinctProductName,
      revealUseOfFundsDetail: showUseOfFundsDetail,
    });
  }, [
    categoryId,
    core.title,
    mergedCustomFields,
    showDistinctProductName,
    showUseOfFundsDetail,
    stepCustomKeys,
  ]);
  const leadCustomKeys = useMemo(() => {
    const lead = currentStep.leadCustomFieldKeys ?? [];
    return lead.filter((key) => visibleStepCustomKeys.includes(key));
  }, [currentStep.leadCustomFieldKeys, visibleStepCustomKeys]);
  const restCustomKeys = useMemo(
    () => visibleStepCustomKeys.filter((key) => !leadCustomKeys.includes(key)),
    [visibleStepCustomKeys, leadCustomKeys],
  );
  const isSeekingIdentityStep =
    categoryId === CATEGORY_IDS.yatirimBul && currentStep.id === 'identity';
  const isSeekingFundingStep =
    categoryId === CATEGORY_IDS.yatirimBul && currentStep.id === 'funding';

  const { clearDraft, restoreDraft, peekDraftMeta } = useListingFormAutosave({
    storageKey,
    values: formValues,
    enabled: !disabled,
    onSaved: setLastAutoSaved,
  });

  useEffect(() => {
    if (restoredDraft || initialValues || !listingId) return;

    const meta = peekDraftMeta();
    if (!meta) {
      setRestoredDraft(true);
      return;
    }

    const draft = restoreDraft();
    if (!draft) {
      setRestoredDraft(true);
      return;
    }
    setCore({
      ...defaults.core,
      ...draft.core,
      longDescription:
        categoryId === CATEGORY_IDS.isBul || categoryId === CATEGORY_IDS.iseAl
          ? stripCareerContactFluff(draft.core?.longDescription)
          : (draft.core?.longDescription ?? defaults.core.longDescription),
    });
    setCustomFields(
      mergeCustomFieldDefaults(listingType.fieldSchema, draft.customFields),
    );
    setShowDistinctProductName(
      hasDistinctProductName(draft.core?.title, draft.customFields?.productName),
    );
    setShowUseOfFundsDetail(Boolean(String(draft.customFields?.useOfFundsDetail ?? '').trim()));
    setTags(draft.tags);
    setImages(draft.images);
    setCvUrl(draft.cvUrl ?? null);
    setKvkkConsents(draft.kvkkConsents ?? { ...EMPTY_KVKK_CONSENTS });
    setPublishConsents(draft.publishConsents ?? { ...EMPTY_PUBLISH_CONSENTS });
    if (draft.contactPhone) setContactPhone(draft.contactPhone);
    setPackageSelection(
      draft.packageSelection ?? defaultPackageSelectionFor(categoryId),
    );
    setRestoredDraft(true);
    toast.message('Kaydedilmiş taslak geri yüklendi.');
  }, [
    initialValues,
    listingId,
    listingType.fieldSchema,
    restoreDraft,
    peekDraftMeta,
    clearDraft,
    restoredDraft,
    defaults.core,
    categoryId,
  ]);

  useEffect(() => {
    setCustomFields((prev) => mergeCustomFieldDefaults(listingType.fieldSchema, prev));
  }, [listingType.fieldSchema]);

  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get('demo') === '1';
    setShowSampleFill(process.env.NODE_ENV === 'development' || demo);
  }, []);

  /** Load phone from marketplace + account profile (Google users often only have account). */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      try {
        const phone = await resolvePublishContactPhone(userId as UserId);
        if (cancelled) return;
        setContactPhone(phone);
        if (phone) {
          void syncMarketplaceProfilePhone(userId as UserId, phone).catch(() => {
            /* best-effort sync for publish gate */
          });
        }
      } catch {
        /* profile optional during draft */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /** Load whether this category still has a free listing slot for the user. */
  useEffect(() => {
    if (!userId || isPaidPublishCategory(categoryId)) {
      setCategoryFreeAvailable(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const free = await getListingPackageService().hasCategoryFreeSlot(
          userId as UserId,
          categoryId,
          listingId,
        );
        if (cancelled) return;
        setCategoryFreeAvailable(free);
        if (!free) {
          setPackageSelection((prev) =>
            prev.simulationStatus === 'ready' && !prev.publishFeePaid && prev.placements.length === 0
              ? { ...DEFAULT_PAID_PUBLISH_PACKAGE_SELECTION, placements: prev.placements }
              : prev,
          );
        }
      } catch {
        if (!cancelled) setCategoryFreeAvailable(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, categoryId, listingId]);

  const setCustomField = useCallback((key: string, value: unknown) => {
    const field = fieldByKey.get(key);
    let nextValue = value;
    if (field?.type === 'enum' && field.options?.length && value != null && value !== '') {
      nextValue = resolveEnumOption(value, field.options) ?? value;
    }
    if (field?.type === 'multi-enum') {
      nextValue = Array.isArray(value) ? value : [];
    }

    setCustomFields((prev) => ({ ...prev, [key]: nextValue }));
    setFieldErrors((prev) => {
      if (!prev[key] && !prev[`customFields.${key}`]) return prev;
      const next = { ...prev };
      delete next[key];
      delete next[`customFields.${key}`];
      return next;
    });
  }, [fieldByKey]);

  const handleCustomFieldChange = useCallback(
    (key: string, value: unknown) => {
      setCustomField(key, value);
      if (key === 'preferredCity') {
        setCustomField('preferredDistrict', '');
        setCustomField('preferredDistrictOther', '');
      }
      if (key === 'residenceCity') {
        setCustomField('residenceDistrict', '');
      }
      if (key === 'preferredDistrict' && value !== 'Diğer') {
        setCustomField('preferredDistrictOther', '');
      }
      if (key === 'district' && value !== 'Diğer') {
        setCustomField('districtOther', '');
      }
      if (key === 'desiredRole') {
        if (!isManualCareerOption(value)) {
          setCustomField('desiredRoleOther', '');
          const valStr = String(value || '');
          if (valStr && !mergedCustomFields.primarySector) {
            const possibleSectors = getSectorsForPosition(valStr);
            if (possibleSectors && possibleSectors.length > 0) {
              setCustomField('primarySector', possibleSectors[0]);
            }
          }
        }
      }
      if (key === 'primarySector') {
        const newSector = String(value || '');
        const currentRole = String(mergedCustomFields.desiredRole || '');
        if (currentRole && !isManualCareerOption(currentRole)) {
          const allowedRoles = getPositionsForSector(newSector);
          if (!allowedRoles.includes(currentRole)) {
            setCustomField('desiredRole', '');
            setCustomField('desiredRoleOther', '');
          }
        }
      }
      if (key === 'positionTitle' && value !== 'Diğer') {
        setCustomField('positionTitleOther', '');
      }
      if (key === 'preferredSectors' && Array.isArray(value)
        && !value.map(String).some((item) => isManualCareerOption(item))) {
        setCustomField('sectorOther', '');
      }
      if (key === 'preferredRoles' && Array.isArray(value)
        && !value.map(String).some((item) => isManualCareerOption(item))) {
        setCustomField('preferredRolesOther', '');
      }
      if (categoryId === CATEGORY_IDS.yatirimBul) {
        const extras = seekingFieldChangeExtras(key, value);
        for (const [extraKey, extraValue] of Object.entries(extras)) {
          setCustomField(extraKey, extraValue);
        }
      }
    },
    [categoryId, setCustomField],
  );

  const handleApplyCvDraft = useCallback(
    (draft?: CvProfileDraftResult | null) => {
      const activeDraft = draft || pendingCvDraft;
      if (!activeDraft) return;
      const fv = activeDraft.formValues;

      // 0. Position & Sector & Experience Level (Step 1: Genel Bilgiler)
      const extractedRole = fv.desiredRole || fv.role || (fv.experiences && fv.experiences[0]?.role) || '';
      const extractedSector = fv.primarySector || fv.sector || (fv.experiences && fv.experiences[0]?.sector) || '';

      if (extractedSector) {
        setCustomField('primarySector', extractedSector);
      } else if (extractedRole) {
        const possibleSectors = getSectorsForPosition(extractedRole);
        if (possibleSectors && possibleSectors.length > 0) {
          setCustomField('primarySector', possibleSectors[0]);
        }
      }

      if (extractedRole) {
        const currentSector = extractedSector || (getSectorsForPosition(extractedRole)?.[0] ?? '');
        const allowedRoles = getPositionsForSector(currentSector);
        if (allowedRoles.includes(extractedRole)) {
          setCustomField('desiredRole', extractedRole);
          setCustomField('desiredRoleOther', '');
        } else {
          const matched = allowedRoles.find(
            (r) => r.toLocaleLowerCase('tr-TR') === extractedRole.toLocaleLowerCase('tr-TR'),
          );
          if (matched && matched !== MANUAL_OPTION && matched !== MANUAL_OPTION_SHORT) {
            setCustomField('desiredRole', matched);
            setCustomField('desiredRoleOther', '');
          } else {
            setCustomField('desiredRole', 'Diğer');
            setCustomField('desiredRoleOther', extractedRole);
          }
        }
      }

      if (fv.experienceLevel) {
        setCustomField('experienceLevel', fv.experienceLevel);
      }

      // 1. Work Experiences (Step 2: Kariyer Bilgileriniz)
      if (fv.experiences && fv.experiences.length > 0) {
        setCustomField('experiences', fv.experiences);
      }

      // 2. Skills & Tools (Step 2: Kariyer Bilgileriniz)
      if (fv.professionalSkillsList && fv.professionalSkillsList.length > 0) {
        setCustomField('professionalSkills', fv.professionalSkillsList.join(', '));
        setCustomField('professionalSkillsList', fv.professionalSkillsList);
      } else if (fv.professionalSkills) {
        setCustomField('professionalSkills', fv.professionalSkills);
      }
      if (fv.technicalSkillsList && fv.technicalSkillsList.length > 0) {
        setCustomField('technicalSkills', fv.technicalSkillsList.join(', '));
        setCustomField('technicalSkillsList', fv.technicalSkillsList);
      } else if (fv.technicalSkills) {
        setCustomField('technicalSkills', fv.technicalSkills);
      }
      if (fv.toolsList && fv.toolsList.length > 0) {
        setCustomField('tools', fv.toolsList.join(', '));
        setCustomField('toolsList', fv.toolsList);
      } else if (fv.tools) {
        setCustomField('tools', fv.tools);
      }

      // 3. Education, Languages & Certificates (Step 2: Kariyer Bilgileriniz)
      if (fv.educationLevel) {
        setCustomField('educationLevel', fv.educationLevel);
      }
      if (fv.educationField) {
        setCustomField('educationField', fv.educationField);
      }
      if (fv.educationHistory && fv.educationHistory.length > 0) {
        setCustomField('educationHistory', fv.educationHistory);
      }
      if (fv.languages) {
        setCustomField('languages', fv.languages);
      }
      if (fv.certificates) {
        setCustomField('certificates', fv.certificates);
      }

      // 4. Candidate Summary & Description (Step 2)
      if (fv.candidateTraits) {
        setCore((prev) => ({
          ...prev,
          longDescription: fv.candidateTraits || prev.longDescription,
          shortDescription: fv.candidateTraits ? fv.candidateTraits.slice(0, 160) : prev.shortDescription,
        }));
      }

      // 5. Demographics & Residence (Step 1: Genel Bilgiler)
      if (fv.profileGender) {
        setCustomField('profileGender', fv.profileGender);
      }
      if (fv.birthDate) {
        setCustomField('birthDate', fv.birthDate);
      }
      const cityName = fv.residenceCity || fv.city || '';
      const districtName = fv.residenceDistrict || '';
      if (cityName) {
        setCustomField('residenceCity', cityName);
        setCustomField('preferredCity', cityName);
        setCore((prev) => ({ ...prev, city: cityName || prev.city, location: cityName || prev.location }));
      }
      if (districtName) {
        setCustomField('residenceDistrict', districtName);
        setCustomField('preferredDistrict', districtName);
        setCustomField('district', districtName);
      }

      // 6. CV File Metadata
      if (fv.cvFileName) {
        setCustomField('cvFileName', fv.cvFileName);
      }
      if (fv.cvDocumentId) {
        setCustomField('cvDocumentId', fv.cvDocumentId);
      }
      if (fv.cvUploadedAt) {
        setCustomField('cvUploadedAt', fv.cvUploadedAt);
      }

      const appliedKeys = [
        'desiredRole',
        'primarySector',
        'experienceLevel',
        'experiences',
        'educationHistory',
        'educationLevel',
        'educationField',
        'languages',
        'certificates',
        'professionalSkills',
        'technicalSkills',
        'tools',
        'candidateTraits',
        'longDescription',
        ...(fv.profileGender ? ['profileGender'] : []),
        ...(fv.birthDate ? ['birthDate'] : []),
        ...(cityName ? ['residenceCity', 'city', 'preferredCity'] : []),
        ...(districtName ? ['residenceDistrict', 'district', 'preferredDistrict'] : []),
      ];
      setCvFilledKeys(new Set(appliedKeys));
      setIsCvApplied(true);
      setIsManualCvMode(false);
      toast.success('✨ CV bilgileri adımlara başarıyla aktarıldı.');
    },
    [pendingCvDraft, setCustomField],
  );

  const handleCvDraftAnalyzed = useCallback(
    (draft: CvProfileDraftResult) => {
      const fv = draft.formValues;
      const expCount = fv.experiences?.length ?? 0;
      const eduCount = (fv.educationHistory?.length ?? 0) || (fv.educationLevel ? 1 : 0);
      const langCount = fv.languages ? fv.languages.split(',').length : 0;
      const skillCount =
        (fv.professionalSkillsList?.length ?? 0) +
        (fv.technicalSkillsList?.length ?? 0) +
        (fv.toolsList?.length ?? 0);
      const loc = fv.residenceCity
        ? `${fv.residenceCity}${fv.residenceDistrict ? ` / ${fv.residenceDistrict}` : ''}`
        : undefined;

      setPendingCvDraft(draft);
      setIsCvApplied(true);
      setCvDraftInfo({
        fileName: fv.cvFileName,
        experienceCount: expCount,
        educationCount: eduCount,
        languageCount: langCount,
        skillCount,
        location: loc,
      });

      // Automatically apply draft directly to form state without requiring extra clicks!
      handleApplyCvDraft(draft);
    },
    [handleApplyCvDraft],
  );

  const handleRemoveCv = useCallback(() => {
    setCvDraftInfo(null);
    setPendingCvDraft(null);
    setIsCvApplied(false);
    setCustomField('cvFileName', '');
    setCustomField('cvDocumentId', '');
    setCustomField('cvUploadedAt', '');
    setCvFilledKeys(new Set());
    toast.info('CV kaldırıldı. Formu manuel doldurarak devam edebilirsiniz.');
  }, [setCustomField]);

  const handleCoreChange = useCallback((next: CoreListingFieldsInput) => {
    setCore(next);
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      for (const key of Object.keys(nextErrors)) {
        if (
          key.startsWith('core.')
          || ['title', 'shortDescription', 'longDescription', 'city', 'remotePolicy'].includes(key)
        ) {
          delete nextErrors[key];
        }
      }
      return nextErrors;
    });
  }, []);

  function goToStep(index: number, reason: string) {
    const currentStepIndex = stepIndex;
    const fromDef = steps[currentStepIndex];
    const clamped = Math.max(0, Math.min(index, steps.length - 1));

    if (fromDef?.preview) {
      const packageIndex = currentStepIndex + 1;
      const allowedForward =
        clamped === packageIndex
        && steps[packageIndex]?.package
        && reason === 'goNext:previewToPackage';
      const allowedBack = clamped === currentStepIndex - 1 && reason === 'goBack';
      const allowedValidationFix = reason.startsWith('validate') && clamped < currentStepIndex;
      if (!allowedForward && !allowedBack && !allowedValidationFix) {
        console.warn('[ListingForm] goToStep blocked from preview — only next package or goBack', {
          from: currentStepIndex,
          to: clamped,
          packageIndex,
          reason,
        });
        return;
      }
    }

    if (fromDef?.package) {
      const publishIndex = currentStepIndex + 1;
      const allowedForward =
        clamped === publishIndex
        && steps[publishIndex]?.publish
        && reason === 'goNext:packageToPublish';
      const allowedBack = clamped === currentStepIndex - 1 && reason === 'goBack';
      const allowedValidationFix = reason.startsWith('validate') && clamped < currentStepIndex;
      if (!allowedForward && !allowedBack && !allowedValidationFix) {
        console.warn('[ListingForm] goToStep blocked from package — only next publish or goBack', {
          from: currentStepIndex,
          to: clamped,
          publishIndex,
          reason,
        });
        return;
      }
    }

    if (fromDef?.publish) {
      if (reason !== 'goBack' && !reason.startsWith('validate')) {
        console.warn('[ListingForm] goToStep blocked from publish step', {
          from: currentStepIndex,
          to: clamped,
          reason,
        });
        return;
      }
    }

    if (clamped === currentStepIndex) {
      console.log('[ListingForm] step unchanged', {
        stepIndex: clamped,
        reason,
        stepId: steps[clamped]?.id,
      });
      return;
    }

    console.log('[ListingForm] step change', {
      from: currentStepIndex,
      to: clamped,
      reason,
      fromStepId: steps[currentStepIndex]?.id,
      toStepId: steps[clamped]?.id,
    });
    setStepIndex(clamped);
  }

  function validateCurrentStep(): boolean {
    if (isPreviewStep || isPublishStep) {
      console.log('[ListingForm] validateCurrentStep: skipped on preview/publish step', {
        stepIndex,
        stepId: currentStep?.id,
      });
      return true;
    }

    if (isPackageStep) {
      const paidPublish = isPaidPublishCategory(categoryId);
      const requiresStandardFee = !paidPublish && !categoryFreeAvailable;
      const publishPaid = Boolean(
        packageSelection.publishFeePaid || packageSelection.franchisePublishPaid,
      );
      if (packageSelection.simulationStatus !== 'ready') {
        setFieldErrors({
          packageSelection: paidPublish || requiresStandardFee
            ? 'Yayın paketi ödemesini tamamlayın.'
            : packageSelection.placements.length > 0
              ? 'Ücretli paket seçtiniz. Devam etmeden önce ödemeyi tamamlayın.'
              : 'Paket seçimini tamamlayın.',
        });
        toast.error(
          paidPublish || requiresStandardFee
            ? 'Devam etmeden önce yayın paketini tamamlayın.'
            : packageSelection.placements.length > 0
              ? 'Devam etmeden önce ödemeyi tamamlayın.'
              : 'Lütfen bir paket seçin.',
        );
        return false;
      }
      if ((paidPublish || requiresStandardFee) && !publishPaid) {
        setFieldErrors({
          packageSelection: requiresStandardFee
            ? `Bu kategoride ücretsiz hakkınız yok. Ek ilan ${STANDARD_REPUBLISH_CONFIG.priceCents / 100} TL.`
            : 'Yayın paketi ödemesini tamamlayın.',
        });
        toast.error(
          requiresStandardFee
            ? `Ek ilan için ${STANDARD_REPUBLISH_CONFIG.priceCents / 100} TL ödeme gerekli.`
            : 'Devam etmeden önce yayın paketi ödemesini tamamlayın.',
        );
        return false;
      }
      setFieldErrors({});
      return true;
    }

    if (isCvStep && categoryId !== CATEGORY_IDS.isBul) {
      if (!cvUrl) {
        setFieldErrors({ cvUrl: 'Özgeçmiş yüklemeniz gerekmektedir.' });
        toast.error('Lütfen özgeçmişinizi yükleyin.');
        return false;
      }
      setFieldErrors({});
      return true;
    }

    if (isExperienceStep) {
      const experiences = parseCareerExperiences(mergedCustomFields.experiences);
      const expError = validateCareerExperiences(experiences);
      if (expError) {
        setFieldErrors({ experiences: expError });
        toast.error(expError);
        return false;
      }
      setCustomField('experiences', experiences);
      setFieldErrors({});
      return true;
    }

    if (isHireRoleNeedsStep) {
      const hireErrors = validateHireRoleNeedsStep(mergedCustomFields);
      if (Object.keys(hireErrors).length > 0) {
        setFieldErrors(hireErrors);
        toast.error(Object.values(hireErrors)[0] ?? 'İş tanımı alanlarını kontrol edin.');
        return false;
      }
      const materialized = materializeHireRoleNeedsFields(mergedCustomFields);
      setCustomFields((prev) => ({ ...prev, ...materialized }));
      setFieldErrors({});
      return true;
    }

    if (isCareerSkillsStep) {
      const skillErrors = validateCareerSkillsStep(mergedCustomFields);
      if (Object.keys(skillErrors).length > 0) {
        setFieldErrors(skillErrors);
        toast.error(Object.values(skillErrors)[0] ?? 'Yetkinlik alanlarını kontrol edin.');
        return false;
      }
      const materialized = materializeCareerSkillsFields(mergedCustomFields);
      setCustomFields((prev) => ({ ...prev, ...materialized }));
      setFieldErrors({});
      return true;
    }

    if (isCareerEducationStep) {
      const educationErrors = validateCareerEducationStep(mergedCustomFields);
      if (!String(mergedCustomFields.educationLevel ?? '').trim()) {
        educationErrors.educationLevel = 'Eğitim seviyesi seçilmelidir.';
      }
      if (Object.keys(educationErrors).length > 0) {
        setFieldErrors(educationErrors);
        toast.error(Object.values(educationErrors)[0] ?? 'Eğitim / dil alanlarını kontrol edin.');
        return false;
      }
      const materialized = materializeCareerEducationFields(mergedCustomFields);
      setCustomFields((prev) => ({ ...prev, ...materialized }));
      setFieldErrors({});
      return true;
    }

    if (isCareerPreferenceStep) {
      const preferenceErrors = validateCareerPreferencesStep(mergedCustomFields);
      if (Object.keys(preferenceErrors).length > 0) {
        setFieldErrors(preferenceErrors);
        toast.error(Object.values(preferenceErrors)[0] ?? 'Kariyer tercihlerini kontrol edin.');
        return false;
      }
    }

    if (categoryId === CATEGORY_IDS.yatirimBul && currentStep.coreFields?.includes('city')) {
      if (!String(core.city ?? '').trim()) {
        setFieldErrors({ city: 'Girişiminizin şehrini seçin.' });
        toast.error('Girişiminizin şehrini seçin.');
        return false;
      }
    }

    if (categoryId === CATEGORY_IDS.yatirimBul && stepCustomKeys.includes('investmentAmount')) {
      const fundingErrors = validateInvestmentFundingFields(mergedCustomFields);
      if (Object.keys(fundingErrors).length > 0) {
        setFieldErrors(fundingErrors);
        toast.error(Object.values(fundingErrors)[0] ?? 'Yatırım tutarını kontrol edin.');
        return false;
      }
    }

    if (categoryId === CATEGORY_IDS.yatirimYap && stepCustomKeys.includes('investmentAmount')) {
      const ticketErrors = validateInvestorTicketFields(mergedCustomFields);
      if (Object.keys(ticketErrors).length > 0) {
        setFieldErrors(ticketErrors);
        toast.error(Object.values(ticketErrors)[0] ?? 'Yatırım biletini kontrol edin.');
        return false;
      }
    }

    if (isKvkkStep) {
      if (!validatePublishConsents(publishConsents)) {
        setFieldErrors({
          publishConsents: 'Tüm yayın onay kutularını işaretlemeniz gerekmektedir.',
        });
        toast.error('Lütfen tüm yayın onaylarını tamamlayın.');
        return false;
      }
      if (!contactPhone?.trim()) {
        setFieldErrors({
          contactPhone: 'Yayınlamak için telefon numarası gerekli. Aşağıdan ekleyin.',
        });
        toast.error('Telefon ekleyin — Google ile kayıt olsanız bile yayın için zorunlu.');
        return false;
      }
      setFieldErrors({});
      return true;
    }

    if (
      (categoryId === CATEGORY_IDS.isBul || categoryId === CATEGORY_IDS.iseAl)
      && currentStep.coreFields?.includes('longDescription')
    ) {
      const summary = String(core.longDescription ?? '');
      const violation = findCareerProfileContentViolation(summary);
      if (violation) {
        setFieldErrors({ longDescription: violation });
        toast.error(violation);
        return false;
      }
    }

    try {
      console.log('[ListingForm:stage] validateCurrentStep', {
        'payload.customFields.stage': mergedCustomFields.stage,
        stepIndex,
        stepId: currentStep.id,
      });

      validateListingFormStep(
        listingType.fieldSchema,
        stepValidationInput(currentStep, visibleStepCustomKeys),
        {
          core: formValues.core,
          customFields: mergedCustomFields,
          tags: formValues.tags,
          images: formValues.images,
        },
        'full',
      );

      const otherDetailErrors = collectOtherDetailErrors(mergedCustomFields, stepCustomKeys);
      if (Object.keys(otherDetailErrors).length > 0) {
        setFieldErrors(otherDetailErrors);
        scheduleScrollToFirstError(otherDetailErrors);
        toast.error('Lütfen “Diğer” seçimi için açıklama alanını doldurun.');
        return false;
      }

      console.log('[ListingForm] validateCurrentStep: passed', {
        stepIndex,
        stepId: currentStep.id,
      });
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = parseZodErrors(err);
        const currentStepOnlyErrors = filterErrorsToCurrentStep(
          errors,
          steps,
          allFieldKeys,
          stepIndex,
        );
        // If step mapping drops everything, still show raw errors on this step.
        const errorsToShow =
          Object.keys(currentStepOnlyErrors).length > 0 ? currentStepOnlyErrors : errors;
        logValidationErrors(
          errors,
          steps,
          allFieldKeys,
          stepIndex,
          listingType.name,
          validationSnapshot,
        );
        console.log('[ListingForm] validateCurrentStep: failed — staying on step', {
          stepIndex,
          stepId: currentStep.id,
          errors,
          currentStepOnlyErrors,
          errorsToShow,
        });
        setFieldErrors(errorsToShow);
        scheduleScrollToFirstError(errorsToShow);
        toast.error('Lütfen bu adımdaki zorunlu alanları doldurun.');
      }
      return false;
    }
  }

  function goNext() {
    console.log('[ListingForm] goNext requested', {
      stepIndex,
      stepId: currentStep?.id,
      isPreviewStep,
      isPackageStep,
      isPublishStep,
      isFormStep,
    });

    if (isPreviewStep) {
      const packageIndex = stepIndex + 1;
      if (packageIndex >= steps.length || !steps[packageIndex]?.package) {
        console.error('[ListingForm] goNext: package step must be immediately after preview', {
          stepIndex,
          packageIndex,
        });
        return;
      }
      setFieldErrors({});
      goToStep(packageIndex, 'goNext:previewToPackage');
      return;
    }

    if (isPackageStep) {
      if (!validateCurrentStep()) return;
      const publishIndex = stepIndex + 1;
      if (publishIndex >= steps.length || !steps[publishIndex]?.publish) {
        console.error('[ListingForm] goNext: publish step must be immediately after package', {
          stepIndex,
          publishIndex,
        });
        return;
      }
      setFieldErrors({});
      goToStep(publishIndex, 'goNext:packageToPublish');
      return;
    }

    if (isPublishStep) {
      console.log('[ListingForm] goNext ignored — already on final publish step');
      return;
    }

    const nextIndex = stepIndex + 1;
    if (nextIndex >= steps.length) {
      console.log('[ListingForm] goNext ignored — no next step');
      return;
    }

    if (isFormStep) {
      if (!validateCurrentStep()) return;
    }

    setFieldErrors({});
    goToStep(nextIndex, 'goNext');
  }

  function goBack() {
    setFieldErrors({});
    setPublishErrors([]);
    goToStep(Math.max(stepIndex - 1, 0), 'goBack');
  }

  function buildHandlerValues(): ListingFormValues {
    const role = isManualCareerOption(mergedCustomFields.desiredRole)
      ? String(mergedCustomFields.desiredRoleOther ?? '').trim()
      : String(mergedCustomFields.desiredRole ?? '').trim();
    const level = String(mergedCustomFields.experienceLevel ?? '').trim();
    const preferredCity = String(mergedCustomFields.preferredCity ?? '').trim();

    let customFieldsWithCv = cvUrl
      ? { ...mergedCustomFields, cvUrl, kvkkConsents }
      : { ...mergedCustomFields };

    if (categoryId === CATEGORY_IDS.isBul || categoryId === CATEGORY_IDS.iseAl) {
      customFieldsWithCv = {
        ...customFieldsWithCv,
        ...materializeCareerSkillsFields(customFieldsWithCv),
        ...materializeCareerEducationFields(customFieldsWithCv),
      };
    }
    if (categoryId === CATEGORY_IDS.iseAl) {
      customFieldsWithCv = materializeHireRoleNeedsFields(customFieldsWithCv);
    }
    if (categoryId === CATEGORY_IDS.yatirimBul) {
      customFieldsWithCv = materializeSeekingInvestmentFields({
        customFields: customFieldsWithCv,
        title: core.title,
      });
    }

    const derivedCore =
      categoryId === CATEGORY_IDS.isBul
        ? {
            ...core,
            title: core.title?.trim() || role || 'Kariyer profili',
            shortDescription:
              core.shortDescription?.trim()
              || [role, level].filter(Boolean).join(' · ')
              || 'Anonim kariyer özeti',
            city: core.city || preferredCity || null,
            longDescription: stripCareerContactFluff(core.longDescription),
          }
        : categoryId === CATEGORY_IDS.iseAl
          ? {
              ...core,
              title: core.title?.trim() || role || 'Açık pozisyon',
              shortDescription:
                core.shortDescription?.trim()
                || [role, level].filter(Boolean).join(' · ')
                || 'Açık pozisyon ilanı',
              city: core.city || preferredCity || null,
              longDescription: stripCareerContactFluff(core.longDescription),
            }
          : core;

    return {
      core: derivedCore,
      customFields: customFieldsWithCv,
      tags,
      images: [...images]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((img, index) => ({ ...img, sortOrder: index })),
      cvUrl: categoryId === CATEGORY_IDS.isBul ? null : cvUrl,
      kvkkConsents,
      publishConsents,
      contactPhone,
      packageSelection,
    };
  }

  /** Publish/draft from the final step — validates on publish, never reset wizard step. */
  async function runFinalStepAction(
    mode: 'draft' | 'publish' | 'save',
    handler?: (values: ListingFormValues) => Promise<void>,
  ) {
    if (!handler) return;

    let formData = buildHandlerValues();

    console.log('[ListingForm] runFinalStepAction start', {
      mode,
      stepIndex,
      stepId: currentStep.id,
    });

    if (mode === 'publish') {
      if (packageSelection.simulationStatus !== 'ready') {
        setPublishErrors(['Paket seçimi tamamlanmadı. Lütfen paket adımına dönün.']);
        return;
      }
      if (
        (isPaidPublishCategory(categoryId) || !categoryFreeAvailable) &&
        !(packageSelection.publishFeePaid || packageSelection.franchisePublishPaid)
      ) {
        setPublishErrors([
          !categoryFreeAvailable && !isPaidPublishCategory(categoryId)
            ? `Bu kategoride ücretsiz hakkınız yok. Ek ilan ${STANDARD_REPUBLISH_CONFIG.priceCents / 100} TL — paket adımına dönün.`
            : 'Yayın paketi ödemesi zorunludur. Lütfen paket adımına dönün.',
        ]);
        return;
      }

      const { errors: validationErrors, normalizedCore } = validateListingFormBeforePublish({
        categoryId,
        fieldSchema: listingType.fieldSchema,
        steps,
        allFieldKeys,
        snapshot: validationSnapshot,
        cvUrl,
        kvkkConsents,
        publishConsents,
        contactPhone,
      });

      if (!contactPhone?.trim()) {
        setPublishErrors([
          'Yayınlamak için telefon numarası gerekli. Yayın Onayları adımından ekleyin.',
        ]);
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        const messages = [...new Set(Object.values(validationErrors))];
        console.error('[ListingForm] publish blocked by validation', {
          validationErrors,
          messages,
        });
        setFieldErrors(validationErrors);
        setPublishErrors(messages);
        const targetStep = findStepIndexForErrors(validationErrors, steps, allFieldKeys);
        if (targetStep !== null && targetStep !== stepIndex) {
          setPublishErrors([]);
          goToStep(targetStep, 'validate:publishFix');
          scheduleScrollToFirstError(validationErrors);
          toast.error('Eksik veya hatalı alanlar var. İlgili adıma yönlendirildiniz.');
        } else {
          scheduleScrollToFirstError(validationErrors);
          toast.error('Lütfen zorunlu alanları kontrol edin.');
        }
        return;
      }

      const normalizedFormCore = {
        ...core,
        title: normalizedCore.title || core.title,
        shortDescription: normalizedCore.shortDescription || core.shortDescription,
        longDescription: normalizedCore.longDescription || core.longDescription,
      };
      if (
        normalizedFormCore.title !== core.title
        || normalizedFormCore.shortDescription !== core.shortDescription
        || normalizedFormCore.longDescription !== core.longDescription
      ) {
        setCore(normalizedFormCore);
      }
      formData = { ...formData, core: normalizedFormCore };
    }

    setPublishErrors([]);
    setSubmitting(mode);

    try {
      await handler(formData);
      console.log('[ListingForm] runFinalStepAction success', { mode });
      // Keep local draft after server "Taslak Kaydet" so the user can resume;
      // clear only when the listing is published or edited via save.
      if (mode !== 'draft') {
        clearDraft();
      }
    } catch (err) {
      console.log(formData);
      console.log(validationSnapshot);
      console.log(currentStep);
      console.log(categoryId);

      const publishErrorMessages = resolvePublishErrorMessages(
        err,
        steps,
        allFieldKeys,
        listingType.name,
        validationSnapshot,
        customFieldLabels,
      );

      console.error('[ListingForm] runFinalStepAction failed — staying on publish step', {
        mode,
        stepIndex,
        stepId: currentStep.id,
        error: err,
        publishErrors,
      });

      setPublishErrors(publishErrorMessages);
    } finally {
      setSubmitting(null);
    }
  }

  const isBusy = submitting !== null;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* LEFT COLUMN: Stepper Navigation (3 cols on desktop) */}
        <div className="hidden lg:block lg:col-span-3 h-full">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                İlan Adımları
              </p>
              <nav className="space-y-3">
                {steps.map((step, idx) => {
                  const isCurrent = idx === stepIndex;
                  const isPast = idx < stepIndex;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => goToStep(idx, 'sidebar-click')}
                      disabled={disabled || isBusy || (idx > stepIndex + 1 && !isPast)}
                      className={cn(
                        'flex w-full items-start gap-3.5 rounded-xl p-3.5 text-left transition-all relative',
                        isCurrent
                          ? `border-l-4 ${theme.stepperActiveBorder} ${theme.stepperActiveBg} ${theme.stepperActiveText}`
                          : isPast
                            ? 'text-slate-800 hover:bg-slate-50 dark:text-zinc-200'
                            : 'text-slate-400 opacity-60 cursor-not-allowed',
                      )}
                    >
                      <span
                        className={cn(
                          'font-display text-2xl font-bold tracking-tight shrink-0',
                          isCurrent
                            ? theme.categoryLabelText
                            : isPast
                              ? 'text-emerald-600'
                              : 'text-slate-300 dark:text-zinc-600',
                        )}
                      >
                        0{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className={cn('text-sm font-bold truncate', isCurrent ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-zinc-200')}>
                          {step.title}
                        </p>
                        {step.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-start gap-3 text-xs text-slate-500">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-zinc-100">
                  Bilgileriniz KVKK&apos;ya uygun olarak korunur.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kişisel verileriniz güvende.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Active Step Form (9 cols for isBul, 6 cols for others) */}
        <div className={cn('col-span-1 h-full', categoryId === CATEGORY_IDS.isBul ? 'lg:col-span-9' : 'lg:col-span-6')}>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 h-full flex flex-col justify-between">
            <div>
              <div className="border-b border-border/60 pb-4 mb-4 lg:hidden">
                <FormStepIndicator steps={steps} currentIndex={stepIndex} />
              </div>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', theme.stepBadgeBg)}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {currentStep.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {stepIndex === 0 ? 'İlanınızın temelini oluşturalım.' : currentStep.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isFormStep && !disabled && showSampleFill && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                      onClick={() => {
                        const sample = getSampleListingValues(categoryId, { partnershipIntent });
                        if (!sample) {
                          toast.message('Bu kategori için örnek veri yok.');
                          return;
                        }
                        if (sample.core) {
                          setCore((prev) => ({ ...prev, ...sample.core! }));
                        }
                        if (sample.customFields) {
                          setCustomFields((prev) =>
                            mergeCustomFieldDefaults(listingType.fieldSchema, {
                              ...prev,
                              ...sample.customFields,
                            }),
                          );
                          setShowDistinctProductName(
                            hasDistinctProductName(
                              sample.core?.title ?? core.title,
                              sample.customFields.productName,
                            ),
                          );
                          setShowUseOfFundsDetail(
                            Boolean(String(sample.customFields.useOfFundsDetail ?? '').trim()),
                          );
                        }
                        toast.success('Örnek içerik dolduruldu. Gözden geçirip düzenleyebilirsiniz.');
                      }}
                    >
                      Örnek doldur
                    </Button>
                  )}
                  <span className={cn('rounded-full px-3 py-1 text-xs font-bold', theme.stepCounterBadge)}>
                    {stepIndex + 1} / {steps.length}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
          {(isCvStep || (stepIndex === 0 && categoryId === CATEGORY_IDS.isBul)) && categoryId === CATEGORY_IDS.isBul && (
            <div className="mb-6">
              {cvDraftInfo ? (
                <CvExtractionHud
                  fileName={cvDraftInfo.fileName}
                  experienceCount={cvDraftInfo.experienceCount}
                  educationCount={cvDraftInfo.educationCount}
                  languageCount={cvDraftInfo.languageCount}
                  skillCount={cvDraftInfo.skillCount}
                  location={cvDraftInfo.location}
                  onApply={() => handleApplyCvDraft(pendingCvDraft)}
                  isApplied={isCvApplied}
                  onReupload={() => {
                    setCvDraftInfo(null);
                    setPendingCvDraft(null);
                    setIsCvApplied(false);
                  }}
                  onRemove={handleRemoveCv}
                />
              ) : (
                <CvUploadCard
                  onDraftReady={handleCvDraftAnalyzed}
                  onSkipManual={() => setIsManualCvMode(true)}
                  isManualMode={isManualCvMode}
                />
              )}
            </div>
          )}

          {isPreviewStep && careerPreviewData && (
            <CareerProfilePreview data={careerPreviewData} />
          )}

          {isPreviewStep && investmentPreviewData && (
            <InvestmentProfilePreview data={investmentPreviewData} />
          )}

          {isPreviewStep && investorPreviewData && (
            <InvestorProfilePreview data={investorPreviewData} />
          )}

          {isPreviewStep && !isCareerCardCategory && !isInvestmentCardCategory && !isInvestorCardCategory && (
            <ListingFormPreviewContent
              values={formValues}
              listingType={listingType}
              readOnly
            />
          )}

          {isHireRoleNeedsStep && (
            <HireRoleNeedsEditor
              value={{
                requiredResponsibilities: String(
                  mergedCustomFields.requiredResponsibilities ?? '',
                ),
                requiredResponsibilitiesOther: String(
                  mergedCustomFields.requiredResponsibilitiesOther ?? '',
                ),
                requiredAchievements: String(mergedCustomFields.requiredAchievements ?? ''),
                requiredAchievementsOther: String(
                  mergedCustomFields.requiredAchievementsOther ?? '',
                ),
              }}
              onChange={(patch) => {
                for (const [key, val] of Object.entries(patch)) {
                  setCustomField(key, val);
                }
              }}
              disabled={disabled || isBusy}
              sector={String(mergedCustomFields.primarySector ?? '')}
              role={
                isManualCareerOption(mergedCustomFields.desiredRole)
                  ? String(mergedCustomFields.desiredRoleOther ?? '')
                  : String(mergedCustomFields.desiredRole ?? '')
              }
              experienceLevel={String(mergedCustomFields.experienceLevel ?? '')}
              errors={{
                requiredResponsibilities: resolveFieldError(
                  fieldErrors,
                  'requiredResponsibilities',
                ),
                requiredResponsibilitiesOther: resolveFieldError(
                  fieldErrors,
                  'requiredResponsibilitiesOther',
                ),
                requiredAchievements: resolveFieldError(fieldErrors, 'requiredAchievements'),
                requiredAchievementsOther: resolveFieldError(
                  fieldErrors,
                  'requiredAchievementsOther',
                ),
              }}
            />
          )}

          {isExperienceStep && (
            <CareerExperienceEditor
              value={parseCareerExperiences(mergedCustomFields.experiences)}
              onChange={(next) => setCustomField('experiences', next)}
              error={resolveFieldError(fieldErrors, 'experiences')}
              disabled={disabled || isBusy}
              experienceLevel={String(mergedCustomFields.experienceLevel ?? '')}
            />
          )}

          {isCareerSkillsStep && (
            <CareerSkillsEditor
              value={{
                professionalSkills: String(mergedCustomFields.professionalSkills ?? ''),
                professionalSkillsOther: String(
                  mergedCustomFields.professionalSkillsOther ?? '',
                ),
                technicalSkills: String(mergedCustomFields.technicalSkills ?? ''),
                technicalSkillsOther: String(mergedCustomFields.technicalSkillsOther ?? ''),
                leadershipExperience: String(mergedCustomFields.leadershipExperience ?? ''),
                tools: String(mergedCustomFields.tools ?? ''),
                toolsOther: String(mergedCustomFields.toolsOther ?? ''),
              }}
              onChange={(patch) => {
                for (const [key, val] of Object.entries(patch)) {
                  setCustomField(key, val);
                }
              }}
              disabled={disabled || isBusy}
              audience={categoryId === CATEGORY_IDS.iseAl ? 'hire' : 'seeker'}
              sector={String(
                mergedCustomFields.primarySector
                  ?? parseCareerExperiences(mergedCustomFields.experiences)[0]?.sector
                  ?? '',
              )}
              role={
                isManualCareerOption(mergedCustomFields.desiredRole)
                  ? String(mergedCustomFields.desiredRoleOther ?? '')
                  : String(mergedCustomFields.desiredRole ?? '')
              }
              roleOther={String(mergedCustomFields.desiredRoleOther ?? '')}
              experienceLevel={String(mergedCustomFields.experienceLevel ?? '')}
              experienceRoles={
                categoryId === CATEGORY_IDS.isBul
                  ? parseCareerExperiences(mergedCustomFields.experiences).map((exp) =>
                      isManualCareerOption(exp.role) ? String(exp.roleOther ?? '') : exp.role,
                    )
                  : undefined
              }
              experiences={
                categoryId === CATEGORY_IDS.isBul
                  ? parseCareerExperiences(mergedCustomFields.experiences)
                  : undefined
              }
              errors={{
                professionalSkills: resolveFieldError(fieldErrors, 'professionalSkills'),
                technicalSkills: resolveFieldError(fieldErrors, 'technicalSkills'),
                leadershipExperience: resolveFieldError(fieldErrors, 'leadershipExperience'),
                tools: resolveFieldError(fieldErrors, 'tools'),
              }}
            />
          )}

          {isCareerEducationStep && (
            <div className="space-y-5">
              <CareerEducationExtras
                educationLevel={String(mergedCustomFields.educationLevel ?? '')}
                educationField={String(mergedCustomFields.educationField ?? '')}
                educationFieldOther={String(mergedCustomFields.educationFieldOther ?? '')}
                certificates={String(mergedCustomFields.certificates ?? '')}
                certificatesOther={String(mergedCustomFields.certificatesOther ?? '')}
                onChange={(patch) => {
                  for (const [key, val] of Object.entries(patch)) {
                    setCustomField(key, val);
                  }
                }}
                disabled={disabled || isBusy}
                audience={categoryId === CATEGORY_IDS.iseAl ? 'hire' : 'seeker'}
                sector={String(
                  mergedCustomFields.primarySector
                    ?? parseCareerExperiences(mergedCustomFields.experiences)[0]?.sector
                    ?? '',
                )}
                role={
                  isManualCareerOption(mergedCustomFields.desiredRole)
                    ? String(mergedCustomFields.desiredRoleOther ?? '')
                    : String(mergedCustomFields.desiredRole ?? '')
                }
                roleOther={String(mergedCustomFields.desiredRoleOther ?? '')}
                experienceLevel={String(mergedCustomFields.experienceLevel ?? '')}
                errors={{
                  educationLevel: resolveFieldError(fieldErrors, 'educationLevel'),
                  educationField: resolveFieldError(fieldErrors, 'educationField'),
                  certificates: resolveFieldError(fieldErrors, 'certificates'),
                }}
              />
              <CareerLanguagesEditor
                value={parseCareerLanguages(
                  mergedCustomFields.languageEntries ?? mergedCustomFields.languages,
                )}
                onChange={(next) => setCustomField('languageEntries', next)}
                disabled={disabled || isBusy}
                error={resolveFieldError(fieldErrors, 'languages')}
              />
            </div>
          )}

          {isCareerPreferenceStep && (
            <CareerPreferenceEditor
              experiences={parseCareerExperiences(mergedCustomFields.experiences)}
              primarySector={String(mergedCustomFields.primarySector ?? '')}
              desiredRole={
                isManualCareerOption(mergedCustomFields.desiredRole)
                  ? String(mergedCustomFields.desiredRoleOther ?? '')
                  : String(mergedCustomFields.desiredRole ?? '')
              }
              value={{
                preferredSectors: Array.isArray(mergedCustomFields.preferredSectors)
                  ? mergedCustomFields.preferredSectors.map(String)
                  : [],
                sectorOther: String(mergedCustomFields.sectorOther ?? ''),
                preferredRoles: Array.isArray(mergedCustomFields.preferredRoles)
                  ? mergedCustomFields.preferredRoles.map(String)
                  : [],
                preferredRolesOther: String(mergedCustomFields.preferredRolesOther ?? ''),
              }}
              onChange={(patch) => {
                for (const [key, val] of Object.entries(patch)) {
                  setCustomField(key, val);
                }
              }}
              disabled={disabled || isBusy}
              errors={{
                preferredSectors: resolveFieldError(fieldErrors, 'preferredSectors'),
                sectorOther: resolveFieldError(fieldErrors, 'sectorOther'),
                preferredRoles: resolveFieldError(fieldErrors, 'preferredRoles'),
                preferredRolesOther: resolveFieldError(fieldErrors, 'preferredRolesOther'),
              }}
            />
          )}

          {isPackageStep && (
            <ListingPackageSelectionStep
              value={packageSelection}
              onChange={setPackageSelection}
              disabled={disabled || isBusy}
              error={resolveFieldError(fieldErrors, 'packageSelection')}
              variant={packageVariantForCategory(categoryId)}
              categoryFreeAvailable={categoryFreeAvailable}
            />
          )}

          {isKvkkStep && (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">KVKK & Güvenli İletişim Güvencesi</p>
              <p className="mt-1">
                İş Arayan kariyer kartınızda soyadınız, telefon numaranız, e-posta adresiniz ve doğum tarihiniz asla açık olarak yayınlanmaz.
                İşverenlerle iletişim yalnızca karşılıklı onaylanan iletişim talepleri üzerinden güvenle sağlanır.
              </p>
            </div>
          )}

          {isPublishStep && (
            <div className="space-y-6">
              {categoryId === CATEGORY_IDS.isBul && (
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                    <div>
                      <h4 className="font-display text-sm font-bold text-foreground">
                        Canlı Kariyer Kartı ve İlan Önizlemesi
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        İlanınız yayına alındığında işverenler ve arama sonuçlarında bu şekilde görüntülenecektir.
                      </p>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', theme.previewBadge)}>
                      Yayına Hazır
                    </span>
                  </div>

                  <ListingLiveCardPreview
                    categoryId={categoryId}
                    values={formValues}
                    listingType={listingType}
                    partnershipIntent={partnershipIntent}
                    userName={user?.displayName || 'İlan Sahibi'}
                    userAvatar={user?.avatarUrl ?? undefined}
                  />
                </div>
              )}

              {/* Yayın Onayları & KVKK / Açık Rıza İzinleri */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                <PublishConsentFields
                  value={publishConsents}
                  onChange={setPublishConsents}
                  disabled={disabled || isBusy}
                  variant={categoryId === CATEGORY_IDS.isBul ? 'career' : 'default'}
                  error={
                    resolveFieldError(fieldErrors, 'publishConsents')
                    || resolveFieldError(fieldErrors, 'contactPhone')
                  }
                  phoneHint={contactPhone}
                  userId={userId}
                  onPhoneSaved={(phone) => {
                    setContactPhone(phone);
                    setFieldErrors((prev) => {
                      if (!prev.contactPhone && !prev.publishConsents) return prev;
                      const next = { ...prev };
                      delete next.contactPhone;
                      return next;
                    });
                  }}
                />
              </div>

              {categoryId !== CATEGORY_IDS.isBul && (
                <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3">
                  <p className="text-gc-xs font-semibold uppercase tracking-wide text-primary">
                    Seçilen paket
                  </p>
                  <p className="mt-1 text-gc-sm font-medium text-foreground">
                    {(() => {
                      const cfg = publishConfigForCategory(categoryId);
                      if (cfg) {
                        const extras = packageSelection.placements
                          .map((slug) => PLACEMENT_PACKAGE_CONFIG[slug].name)
                          .join(' + ');
                        return extras ? `${cfg.name} + ${extras}` : cfg.name;
                      }
                      return packageSelection.placements.length === 0
                        ? STANDARD_PUBLISH_CONFIG.name
                        : packageSelection.placements
                            .map((slug) => PLACEMENT_PACKAGE_CONFIG[slug].name)
                            .join(' + ');
                    })()}
                  </p>
                  {(isPaidPublishCategory(categoryId) ||
                    packageSelection.placements.length > 0) && (
                    <p className="mt-0.5 text-gc-xs text-muted-foreground">
                      Toplam:{' '}
                      {formatPlacementPriceTry(
                        (publishConfigForCategory(categoryId)?.priceCents ?? 0) +
                          packageSelection.placements.reduce(
                            (sum, slug) => sum + PLACEMENT_PACKAGE_CONFIG[slug].priceCents,
                            0,
                          ),
                      )}
                      {' · ödeme simülasyonu tamamlandı'}
                    </p>
                  )}
                </div>
              )}
              {publishErrors.length > 0 && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  <ul className="space-y-1">
                    {publishErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(() => {
                const acceptedAnalysis =
                  categoryId === CATEGORY_IDS.yatirimBul
                    ? acceptedInvestmentAiAnalysisOrNull(
                        mergedCustomFields.investmentAiAnalysis,
                      )
                    : categoryId === CATEGORY_IDS.yatirimYap
                      ? acceptedInvestorAiAnalysisOrNull(
                          mergedCustomFields.investorAiAnalysis,
                        )
                    : acceptedCareerAiAnalysisOrNull(mergedCustomFields.careerAiAnalysis);
                if (
                  (categoryId !== CATEGORY_IDS.isBul
                    && categoryId !== CATEGORY_IDS.yatirimBul
                    && categoryId !== CATEGORY_IDS.yatirimYap)
                  || !acceptedAnalysis
                  || acceptedAnalysis.profileGaps.length === 0
                ) {
                  return null;
                }
                return (
                <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">AI kalite notları (yayını engellemez)</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {acceptedAnalysis.profileGaps.map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                </div>
                );
              })()}
            </div>
          )}

          {isFormStep && (
            <>
              {leadCustomKeys.map((key) => {
                const field = fieldByKey.get(key);
                if (!field) return null;
                return (
                  <DynamicField
                    key={key}
                    field={field}
                    value={mergedCustomFields[key]}
                    onChange={(val) => handleCustomFieldChange(key, val)}
                    error={resolveFieldError(fieldErrors, key)}
                    disabled={disabled || isBusy}
                    context={{
                      values: mergedCustomFields,
                      coreCity: core.city ?? null,
                    }}
                  />
                );
              })}

              {isCareerSummaryStep || isInvestorSummaryStep ? (
                <div className="space-y-3">
                <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {categoryId === CATEGORY_IDS.iseAl
                      ? 'Açık pozisyon, yetkinlik ve teklif bilgilerinize göre bir taslak hazırladık. Kullanabilir veya kendiniz yazabilirsiniz.'
                      : categoryId === CATEGORY_IDS.yatirimYap
                        ? 'Yapılandırılmış kriterlerden bir yatırımcı profili hazırladık. Kullanabilir veya kendiniz yazabilirsiniz.'
                      : 'Girdiğiniz deneyim, yetkinlik ve tercihlere göre bir taslak hazırladık. Kullanabilir veya tamamen kendiniz yazabilirsiniz.'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={disabled || isBusy}
                    onClick={
                      isInvestorSummaryStep
                        ? applyInvestorSummaryDraft
                        : applyCareerSummaryDraft
                    }
                  >
                    Özeti yeniden oluştur
                  </Button>
                </div>
                {categoryId === CATEGORY_IDS.isBul ? (
                  <CareerAiAnalyzePanel
                    customFields={mergedCustomFields}
                    longDescription={core.longDescription ?? ''}
                    disabled={disabled || isBusy}
                    stored={acceptedCareerAiAnalysisOrNull(mergedCustomFields.careerAiAnalysis)}
                    onStore={(value) =>
                      setCustomField('careerAiAnalysis', acceptedCareerAiAnalysisOrNull(value))
                    }
                    onAcceptSummary={(summary) =>
                      setCore((prev) => ({ ...prev, longDescription: summary }))
                    }
                  />
                ) : null}
                {categoryId === CATEGORY_IDS.yatirimYap ? (
                  <InvestorAiAnalyzePanel
                    title={core.title ?? ''}
                    customFields={mergedCustomFields}
                    longDescription={core.longDescription ?? ''}
                    disabled={disabled || isBusy}
                    stored={acceptedInvestorAiAnalysisOrNull(
                      mergedCustomFields.investorAiAnalysis,
                    )}
                    onStore={(value) =>
                      setCustomField(
                        'investorAiAnalysis',
                        acceptedInvestorAiAnalysisOrNull(value),
                      )
                    }
                    onAcceptSummary={({ longDescription, shortDescription }) =>
                      setCore((prev) => ({
                        ...prev,
                        longDescription,
                        shortDescription: shortDescription || prev.shortDescription,
                      }))
                    }
                  />
                ) : null}
                </div>
              ) : null}

              {isInvestmentSummaryStep && !editingInvestmentSummary ? (
                <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">Yatırımcı özeti</p>
                  <p className="text-xs text-muted-foreground">
                    Önceki adımlardan otomatik oluştu. Dilerseniz düzenleyin. AI ayrı bir işlemdir.
                  </p>
                  {core.shortDescription ? (
                    <p className="text-sm text-muted-foreground">{core.shortDescription}</p>
                  ) : null}
                  {core.longDescription ? (
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {core.longDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Önceki adımları tamamlayınca özet burada görünür.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || isBusy}
                    onClick={() => setEditingInvestmentSummary(true)}
                  >
                    Düzenle
                  </Button>
                </div>
              ) : null}

              {currentStep.coreFields
                && currentStep.coreFields.length > 0
                && !isSeekingIdentityStep
                && !(isInvestmentSummaryStep && !editingInvestmentSummary) && (
                <CoreListingFields
                  values={core}
                  onChange={(next) => {
                    const cityChanged = next.city !== core.city;
                    handleCoreChange(next);
                    if (cityChanged) {
                      setCustomField('district', '');
                      setCustomField('districtOther', '');
                    }
                  }}
                  include={currentStep.coreFields}
                  extendedCities={usesExtendedCities && currentStep.coreFields.includes('city')}
                  labels={coreFieldLabels}
                  fieldUi={coreFieldUi}
                  errors={{
                    title: resolveFieldError(fieldErrors, 'title'),
                    shortDescription: resolveFieldError(fieldErrors, 'shortDescription'),
                    longDescription: resolveFieldError(fieldErrors, 'longDescription'),
                    city: resolveFieldError(fieldErrors, 'city'),
                    remotePolicy: resolveFieldError(fieldErrors, 'remotePolicy'),
                  }}
                  disabled={disabled || isBusy}
                />
              )}

              {isInvestmentSummaryStep && editingInvestmentSummary ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled || isBusy}
                    onClick={() => setEditingInvestmentSummary(false)}
                  >
                    Kaydet
                  </Button>
                </div>
              ) : null}

              {isInvestmentSummaryStep ? (
                <InvestmentAiAnalyzePanel
                  title={core.title ?? ''}
                  city={core.city}
                  customFields={mergedCustomFields}
                  longDescription={core.longDescription ?? ''}
                  disabled={disabled || isBusy}
                  stored={acceptedInvestmentAiAnalysisOrNull(
                    mergedCustomFields.investmentAiAnalysis,
                  )}
                  onStore={(value) =>
                    setCustomField(
                      'investmentAiAnalysis',
                      acceptedInvestmentAiAnalysisOrNull(value),
                    )
                  }
                  onAcceptSummary={({ longDescription, shortDescription }) => {
                    setCore((prev) => ({
                      ...prev,
                      longDescription,
                      shortDescription: shortDescription || prev.shortDescription,
                    }));
                    setEditingInvestmentSummary(false);
                  }}
                />
              ) : null}

              {isSeekingIdentityStep ? (
                <CoreListingFields
                  values={core}
                  onChange={handleCoreChange}
                  include={['title']}
                  labels={coreFieldLabels}
                  fieldUi={coreFieldUi}
                  errors={{
                    title: resolveFieldError(fieldErrors, 'title'),
                  }}
                  disabled={disabled || isBusy}
                />
              ) : null}

              {isSeekingIdentityStep ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="seeking-distinct-product-name"
                      checked={showDistinctProductName}
                      onCheckedChange={(checked) => {
                        const next = checked === true;
                        setShowDistinctProductName(next);
                        if (!next) setCustomField('productName', '');
                      }}
                      disabled={disabled || isBusy}
                    />
                    <Label
                      htmlFor="seeking-distinct-product-name"
                      className="text-sm font-normal leading-5"
                    >
                      Ürün veya marka adı girişim adından farklı
                    </Label>
                  </div>
                  {showDistinctProductName && fieldByKey.get('productName') ? (
                    <DynamicField
                      field={fieldByKey.get('productName')!}
                      value={mergedCustomFields.productName}
                      onChange={(val) => handleCustomFieldChange('productName', val)}
                      error={resolveFieldError(fieldErrors, 'productName')}
                      disabled={disabled || isBusy}
                      context={{
                        values: mergedCustomFields,
                        coreCity: core.city ?? null,
                      }}
                    />
                  ) : null}
                </div>
              ) : null}

              {isFormStep && stepIndex === 0 && (categoryId === CATEGORY_IDS.isBul || categoryId === CATEGORY_IDS.iseAl) ? (
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* Middle Vertical Divider */}
                  <div
                    aria-hidden="true"
                    className={cn('hidden md:block absolute left-1/2 top-0 bottom-0 -ml-px w-px', theme.dividerColor)}
                  />

                  {/* Left Column: Pozisyon, Lokasyon, Deneyim Seviyesi */}
                  <div className="space-y-4 md:pr-4">
                    {/* Pozisyon */}
                    {fieldByKey.get('desiredRole') ? (
                      <div className="space-y-2">
                        <DynamicField
                          field={fieldByKey.get('desiredRole')!}
                          value={mergedCustomFields.desiredRole}
                          onChange={(val) => {
                            handleCustomFieldChange('desiredRole', val);
                            if (cvFilledKeys.has('desiredRole')) {
                              setCvFilledKeys((prev) => {
                                const next = new Set(prev);
                                next.delete('desiredRole');
                                return next;
                              });
                            }
                          }}
                          isCvFilled={cvFilledKeys.has('desiredRole')}
                          error={resolveFieldError(fieldErrors, 'desiredRole')}
                          disabled={disabled || isBusy}
                          context={{
                            values: mergedCustomFields,
                            coreCity: core.city ?? null,
                          }}
                        />
                        {String(mergedCustomFields.desiredRoleOther ?? '').trim() ? (
                          <CareerManualAssist
                            kind="role"
                            text={String(mergedCustomFields.desiredRoleOther ?? '')}
                            catalog={getPositionsForSector(
                              String(mergedCustomFields.primarySector ?? ''),
                            )}
                            sector={String(mergedCustomFields.primarySector ?? '')}
                            experienceLevel={String(mergedCustomFields.experienceLevel ?? '')}
                            disabled={disabled || isBusy}
                            onAcceptCatalog={(items) => {
                              const first = items[0];
                              if (!first) return;
                              setCustomField('desiredRole', first);
                              setCustomField('desiredRoleOther', '');
                            }}
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {/* Lokasyon (İl & İlçe) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fieldByKey.get('residenceCity') ? (
                        <DynamicField
                          field={fieldByKey.get('residenceCity')!}
                          value={mergedCustomFields.residenceCity}
                          onChange={(val) => {
                            handleCustomFieldChange('residenceCity', val);
                            if (cvFilledKeys.has('residenceCity')) {
                              setCvFilledKeys((prev) => {
                                const next = new Set(prev);
                                next.delete('residenceCity');
                                return next;
                              });
                            }
                          }}
                          isCvFilled={cvFilledKeys.has('residenceCity')}
                          error={resolveFieldError(fieldErrors, 'residenceCity')}
                          disabled={disabled || isBusy}
                          context={{
                            values: mergedCustomFields,
                            coreCity: core.city ?? null,
                          }}
                        />
                      ) : null}

                      {fieldByKey.get('residenceDistrict') ? (
                        <DynamicField
                          field={fieldByKey.get('residenceDistrict')!}
                          value={mergedCustomFields.residenceDistrict}
                          onChange={(val) => {
                            handleCustomFieldChange('residenceDistrict', val);
                            if (cvFilledKeys.has('residenceDistrict')) {
                              setCvFilledKeys((prev) => {
                                const next = new Set(prev);
                                next.delete('residenceDistrict');
                                return next;
                              });
                            }
                          }}
                          isCvFilled={cvFilledKeys.has('residenceDistrict')}
                          error={resolveFieldError(fieldErrors, 'residenceDistrict')}
                          disabled={disabled || isBusy}
                          context={{
                            values: mergedCustomFields,
                            coreCity: core.city ?? null,
                          }}
                        />
                      ) : null}
                    </div>

                    {/* Deneyim Seviyesi */}
                    {fieldByKey.get('experienceLevel') ? (
                      <DynamicField
                        field={fieldByKey.get('experienceLevel')!}
                        value={mergedCustomFields.experienceLevel}
                        onChange={(val) => {
                          handleCustomFieldChange('experienceLevel', val);
                          if (cvFilledKeys.has('experienceLevel')) {
                            setCvFilledKeys((prev) => {
                              const next = new Set(prev);
                              next.delete('experienceLevel');
                              return next;
                            });
                          }
                        }}
                        isCvFilled={cvFilledKeys.has('experienceLevel')}
                        error={resolveFieldError(fieldErrors, 'experienceLevel')}
                        disabled={disabled || isBusy}
                        context={{
                          values: mergedCustomFields,
                          coreCity: core.city ?? null,
                        }}
                      />
                    ) : null}
                  </div>

                  {/* Right Column: Sektör, Demografi */}
                  <div className="space-y-4 md:pl-4">
                    {/* Sektör */}
                    {fieldByKey.get('primarySector') ? (
                      <div className="space-y-2">
                        <DynamicField
                          field={fieldByKey.get('primarySector')!}
                          value={mergedCustomFields.primarySector}
                          onChange={(val) => {
                            handleCustomFieldChange('primarySector', val);
                            if (cvFilledKeys.has('primarySector')) {
                              setCvFilledKeys((prev) => {
                                const next = new Set(prev);
                                next.delete('primarySector');
                                return next;
                              });
                            }
                          }}
                          isCvFilled={cvFilledKeys.has('primarySector')}
                          error={resolveFieldError(fieldErrors, 'primarySector')}
                          disabled={disabled || isBusy}
                          context={{
                            values: mergedCustomFields,
                            coreCity: core.city ?? null,
                          }}
                        />
                      </div>
                    ) : null}

                    {/* Demografi & Ek alanlar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fieldByKey.get('profileGender') ? (
                        <DynamicField
                          field={fieldByKey.get('profileGender')!}
                          value={mergedCustomFields.profileGender}
                          onChange={(val) => {
                            handleCustomFieldChange('profileGender', val);
                            if (cvFilledKeys.has('profileGender')) {
                              setCvFilledKeys((prev) => {
                                const next = new Set(prev);
                                next.delete('profileGender');
                                return next;
                              });
                            }
                          }}
                          isCvFilled={cvFilledKeys.has('profileGender')}
                          error={resolveFieldError(fieldErrors, 'profileGender')}
                          disabled={disabled || isBusy}
                          context={{
                            values: mergedCustomFields,
                            coreCity: core.city ?? null,
                          }}
                        />
                      ) : null}

                      {fieldByKey.get('birthDate') ? (
                        <DynamicField
                          field={fieldByKey.get('birthDate')!}
                          value={mergedCustomFields.birthDate}
                          onChange={(val) => {
                            handleCustomFieldChange('birthDate', val);
                            if (cvFilledKeys.has('birthDate')) {
                              setCvFilledKeys((prev) => {
                                const next = new Set(prev);
                                next.delete('birthDate');
                                return next;
                              });
                            }
                          }}
                          isCvFilled={cvFilledKeys.has('birthDate')}
                          error={resolveFieldError(fieldErrors, 'birthDate')}
                          disabled={disabled || isBusy}
                          context={{
                            values: mergedCustomFields,
                            coreCity: core.city ?? null,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                (isSeekingIdentityStep
                  ? restCustomKeys.filter((key) => key !== 'productName')
                  : restCustomKeys
                ).map((key) => {
                  const field = fieldByKey.get(key);
                  if (!field) return null;
                  return (
                    <div key={key} className="space-y-2">
                      <DynamicField
                        field={field}
                        value={
                          categoryId === CATEGORY_IDS.yatirimBul
                            ? displaySeekingMetricValue(key, mergedCustomFields)
                            : mergedCustomFields[key]
                        }
                        onChange={(val) => {
                          handleCustomFieldChange(key, val);
                          if (cvFilledKeys.has(key)) {
                            setCvFilledKeys((prev) => {
                              const next = new Set(prev);
                              next.delete(key);
                              return next;
                            });
                          }
                        }}
                        isCvFilled={cvFilledKeys.has(key)}
                        error={resolveFieldError(fieldErrors, key)}
                        disabled={disabled || isBusy}
                        context={{
                          values: mergedCustomFields,
                          coreCity: core.city ?? null,
                        }}
                      />
                      {(key === 'desiredRoleOther' || key === 'roleOther') && String(mergedCustomFields[key] ?? '').trim() ? (
                        <CareerManualAssist
                          kind="role"
                          text={String(mergedCustomFields[key] ?? '')}
                          catalog={getPositionsForSector(
                            String(mergedCustomFields.primarySector ?? ''),
                          )}
                          sector={String(mergedCustomFields.primarySector ?? '')}
                          experienceLevel={String(mergedCustomFields.experienceLevel ?? '')}
                          disabled={disabled || isBusy}
                          onAcceptCatalog={(items) => {
                            const first = items[0];
                            if (!first) return;
                            const targetKey = key === 'desiredRoleOther' ? 'desiredRole' : 'role';
                            setCustomField(targetKey, first);
                            setCustomField(key, '');
                          }}
                        />
                      ) : null}
                    </div>
                  );
                })
              )}

              {isSeekingFundingStep && !visibleStepCustomKeys.includes('useOfFundsDetail') ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isBusy}
                  onClick={() => setShowUseOfFundsDetail(true)}
                >
                  Kullanım detayı ekle
                </Button>
              ) : null}

              {isSeekingIdentityStep ? (
                <CoreListingFields
                  values={core}
                  onChange={(next) => {
                    const cityChanged = next.city !== core.city;
                    handleCoreChange(next);
                    if (cityChanged) {
                      setCustomField('district', '');
                      setCustomField('districtOther', '');
                    }
                  }}
                  include={['city']}
                  extendedCities={usesExtendedCities}
                  cityRequired
                  labels={coreFieldLabels}
                  fieldUi={coreFieldUi}
                  errors={{
                    city: resolveFieldError(fieldErrors, 'city'),
                  }}
                  disabled={disabled || isBusy}
                />
              ) : null}

              {currentStep.meta?.includes('tags') && (
                <StructuredTagsSelect
                  categoryId={categoryId}
                  value={tags}
                  onChange={setTags}
                  disabled={disabled || isBusy}
                />
              )}
              {currentStep.meta?.includes('images') && (
                <ImagesInput
                  value={images}
                  onChange={setImages}
                  disabled={disabled || isBusy}
                  userId={userId}
                  label={categoryId === CATEGORY_IDS.iseAl ? 'Firma Görseli' : undefined}
                  helperText={
                    categoryId === CATEGORY_IDS.iseAl
                      ? 'Firma logosu veya ofis görseli ekleyebilirsiniz. İlk görsel kapak olarak kullanılır.'
                      : undefined
                  }
                />
              )}

              {isCvStep && categoryId !== CATEGORY_IDS.isBul && (
                <CvUploadField
                  value={cvUrl}
                  onChange={setCvUrl}
                  disabled={disabled || isBusy}
                  error={resolveFieldError(fieldErrors, 'cvUrl')}
                  userId={userId}
                />
              )}

              {isKvkkStep && (
                <PublishConsentFields
                  value={publishConsents}
                  onChange={setPublishConsents}
                  disabled={disabled || isBusy}
                  variant={categoryId === CATEGORY_IDS.isBul ? 'career' : 'default'}
                  error={
                    resolveFieldError(fieldErrors, 'publishConsents')
                    || resolveFieldError(fieldErrors, 'contactPhone')
                  }
                  phoneHint={contactPhone}
                  userId={userId}
                  onPhoneSaved={(phone) => {
                    setContactPhone(phone);
                    setFieldErrors((prev) => {
                      if (!prev.contactPhone && !prev.publishConsents) return prev;
                      const next = { ...prev };
                      delete next.contactPhone;
                      return next;
                    });
                  }}
                />
              )}
            </>
          )}
        </div>
        </div>

            {/* Middle Card Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-500 max-w-sm">
                <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  Bilgileriniz KVKK&apos;ya uygun olarak korunur. Kişisel verileriniz güvenle işlenir ve saklanır.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {!isFirstStep && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={disabled || isBusy}
                    className="h-10 px-5 rounded-xl text-xs font-semibold"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Geri
                  </Button>
                )}
                {!isLastStep && (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={disabled || isBusy}
                    className="h-10 px-6 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm flex items-center gap-1.5"
                  >
                    <span>Devam Et</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}

                {isPreviewStep && showPreviewButton && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || isBusy}
                    onClick={() => setPreviewOpen(true)}
                    className="h-10 px-5 rounded-xl text-xs font-semibold"
                  >
                    Tam Ekran Önizle
                  </Button>
                )}

                {isPublishStep && (
                  <div className="flex items-center gap-2">
                    {showDraftButton && onSaveDraft && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={disabled || isBusy}
                        onClick={() => void runFinalStepAction('draft', onSaveDraft)}
                        className="h-10 px-5 rounded-xl text-xs font-semibold"
                      >
                        {submitting === 'draft' ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                      </Button>
                    )}
                    {showPublishButton && onPublish && (
                      <Button
                        type="button"
                        disabled={disabled || isBusy}
                        onClick={() => void runFinalStepAction('publish', onPublish)}
                        className="h-10 px-6 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm flex items-center gap-1.5"
                      >
                        {submitting === 'publish' ? 'Gönderiliyor…' : 'Yayınla'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview & Progress Status (3 cols on desktop, hidden for isBul) */}
        {categoryId !== CATEGORY_IDS.isBul && (
          <div className="hidden lg:block lg:col-span-3 h-full">
            <div className="h-full flex flex-col justify-between gap-4">
              {/* Live Preview Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-3">
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">
                      CANLI ÖNİZLEME
                    </h4>
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', theme.previewBadge)}>
                      Taslak
                    </span>
                  </div>

                  <ListingLiveCardPreview
                    categoryId={categoryId}
                    values={formValues}
                    listingType={listingType}
                    partnershipIntent={partnershipIntent}
                    userName={user?.displayName || 'İlan Sahibi'}
                    userAvatar={user?.avatarUrl ?? undefined}
                  />
                </div>
              </div>

              {/* Dynamic Progress Status */}
              <ListingProgressStatus
                currentStepIndex={stepIndex}
                totalSteps={steps.length}
                steps={steps}
                categoryId={categoryId}
                onNavigateToStep={(sIdx) => goToStep(sIdx, 'progress-click')}
              />
            </div>
          </div>
        )}
      </div>

      <ListingPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        values={formValues}
        listingType={listingType}
        overrideContent={
          careerPreviewData ? <CareerProfilePreview data={careerPreviewData} /> : undefined
        }
      />
    </>
  );
}

/** @deprecated Use CategoryListingForm */
export const DynamicListingForm = CategoryListingForm;
export type DynamicListingFormProps = CategoryListingFormProps;
