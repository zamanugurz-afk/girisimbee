'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Cloud, Shield, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { pruneUnsupportedSectors } from '@/features/listings/config/business-type-sector-map';
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
import { ListingQualityChecklist } from '@/features/listings/form/fields/listing-quality-checklist';
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
import { buildHydratedCustomFieldsFromCvDraft } from '@/features/candidates/cv/cv-form-hydrator';
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
import { buildFounderSummaryDraft } from '@/features/listings/lib/founder-summary';
import { FounderPartnershipTypeStep } from '@/features/founders/components/founder-partnership-type-step';
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
  createEmptyCareerExperience,
  parseCareerExperiences,
  validateCareerExperiences,
} from '@/features/candidates/config/career-profile-fields';
import { findCareerProfileContentViolation } from '@/features/candidates/lib/career-profile-content-policy';
import {
  buildCareerSummaryDraft,
  compressCareerSummaryMeaningfully,
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
  getAllTaxonomyPositions,
  isManualCareerOption,
  parseCareerLanguages,
  serializeCareerLanguages,
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
    companyName: isHire ? String(customFields.companyName ?? '') || null : null,
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

let globalStateTraceSeq = 0;
export function nextCvTraceSeq(): string {
  return '#' + String(++globalStateTraceSeq).padStart(3, '0');
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

  const mutateCustomFields = useCallback(
    (
      updater: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>),
      sourceTag: string,
    ) => {
      const traceId = nextCvTraceSeq();
      setCustomFields((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        console.log(`[CV-TRACE ${traceId}] [CV-STATE-MUTATION]`, {
          sequence: traceId,
          source: sourceTag,
          timestamp: new Date().toISOString(),
          keysBefore: Object.keys(prev),
          keysAfter: Object.keys(next),
          fullNameBefore: prev.fullName,
          fullNameAfter: next.fullName,
          desiredRoleBefore: prev.desiredRole,
          desiredRoleAfter: next.desiredRole,
          primarySectorBefore: prev.primarySector,
          primarySectorAfter: next.primarySector,
          previous: {
            fullName: prev.fullName,
            desiredRole: prev.desiredRole,
            primarySector: prev.primarySector,
            experienceLevel: prev.experienceLevel,
            residenceCity: prev.residenceCity,
            residenceDistrict: prev.residenceDistrict,
          },
          next: {
            fullName: next.fullName,
            desiredRole: next.desiredRole,
            primarySector: next.primarySector,
            experienceLevel: next.experienceLevel,
            residenceCity: next.residenceCity,
            residenceDistrict: next.residenceDistrict,
          },
        });
        console.trace(`[CV-STATE-MUTATION TRACE ${traceId}] Source: ${sourceTag}`);
        return next;
      });
    },
    [],
  );
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
  const [isUploadingCv, setIsUploadingCv] = useState(false);
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

  const activeCorrelationIdRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__GIRISIMBEE_BUILD__ = {
        commit: '5416727',
        version: '3.0.0',
        timestamp: new Date().toISOString(),
      };
      console.log('[CV FORENSIC BUILD]', (window as any).__GIRISIMBEE_BUILD__);
    }
  }, []);

  useEffect(() => {
    console.log('[CV DEFAULTS MOUNT]', {
      timestamp: new Date().toISOString(),
      fullName: defaults.customFields?.fullName,
      primarySector: defaults.customFields?.primarySector,
      desiredRole: defaults.customFields?.desiredRole,
      experiencesCount: (defaults.customFields?.experiences as any[])?.length,
      initialValues: initialValues ? 'EXISTS' : 'UNDEFINED',
    });
  }, [defaults, initialValues]);

  useEffect(() => {
    console.log('[CV FORENSIC 06] customFields AFTER RENDER', {
      correlationId: activeCorrelationIdRef.current || 'initial_mount',
      timestamp: new Date().toISOString(),
      fullName: customFields?.fullName,
      primarySector: customFields?.primarySector,
      desiredRole: customFields?.desiredRole,
      experiencesLength: (customFields?.experiences as any[])?.length,
      isCvApplied,
    });
  }, [customFields, isCvApplied]);

  useEffect(() => {
    const rawStorage = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    let parsed: any = null;
    try {
      parsed = rawStorage ? JSON.parse(rawStorage) : null;
    } catch {
      // ignore
    }
    console.log('[CV FORENSIC RELOAD]', {
      timestamp: new Date().toISOString(),
      storageKey,
      storageFullName: parsed?.customFields?.fullName,
      storageSector: parsed?.customFields?.primarySector,
      storageRole: parsed?.customFields?.desiredRole,
      storageExperiencesLength: parsed?.customFields?.experiences?.length,
      storageSkillsLength: parsed?.customFields?.professionalSkillsList?.length || parsed?.customFields?.professionalSkills?.length,
      customFieldsFullName: customFields?.fullName,
      customFieldsSector: customFields?.primarySector,
      customFieldsRole: customFields?.desiredRole,
    });
  }, [storageKey, customFields]);

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
  const isFounderSummaryStep =
    categoryId === CATEGORY_IDS.ortakBul
    && Boolean(currentStep.coreFields?.includes('longDescription'));
  const isFounderPartnershipTypeStep =
    categoryId === CATEGORY_IDS.ortakBul
    && currentStep.id === 'partnership';
  const isFormStep = !isPreviewStep && !isPackageStep && !isPublishStep;
  const usesExtendedCities =
    categoryId === CATEGORY_IDS.isBul
    || categoryId === CATEGORY_IDS.iseAl
    || categoryId === CATEGORY_IDS.bayilikAl
    || categoryId === CATEGORY_IDS.yatirimBul
    || categoryId === CATEGORY_IDS.yatirimYap
    || categoryId === CATEGORY_IDS.ortakBul
    || categoryId === CATEGORY_IDS.isletmeDevri;
  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;

  const [sectorsPrunedNotice, setSectorsPrunedNotice] = useState(false);

  const mergedCustomFields = useMemo(() => {
    const traceId = nextCvTraceSeq();
    const defaultsSource = defaults.customFields;
    const customFieldsSource = customFields;
    const merged = mergeCustomFieldDefaults(listingType.fieldSchema, customFields);
    console.log(`[CV-TRACE ${traceId}] [CV-MERGE]`, {
      traceId,
      correlationId: activeCorrelationIdRef.current || 'render',
      timestamp: new Date().toISOString(),
      customFields: customFieldsSource,
      defaults: defaultsSource,
      merged,
      customFieldsKeys: Object.keys(customFieldsSource || {}),
      defaultsKeys: Object.keys(defaultsSource || {}),
      mergedKeys: Object.keys(merged || {}),
      mergedFullName: merged.fullName,
      mergedDesiredRole: merged.desiredRole,
      mergedPrimarySector: merged.primarySector,
      mergedExperienceLevel: merged.experienceLevel,
      mergedResidenceCity: merged.residenceCity,
      mergedResidenceDistrict: merged.residenceDistrict,
      isCvApplied,
      sources: {
        customFields: {
          fullName: customFieldsSource?.fullName,
          primarySector: customFieldsSource?.primarySector,
          desiredRole: customFieldsSource?.desiredRole,
          experienceLevel: customFieldsSource?.experienceLevel,
          residenceCity: customFieldsSource?.residenceCity,
          residenceDistrict: customFieldsSource?.residenceDistrict,
        },
        defaults: {
          fullName: defaultsSource?.fullName,
          primarySector: defaultsSource?.primarySector,
          desiredRole: defaultsSource?.desiredRole,
          experienceLevel: defaultsSource?.experienceLevel,
          residenceCity: defaultsSource?.residenceCity,
          residenceDistrict: defaultsSource?.residenceDistrict,
        },
        schemaFieldKeys: listingType.fieldSchema.fields.map((f) => f.key),
      },
    });
    return merged;
  }, [listingType.fieldSchema, customFields, isCvApplied, defaults.customFields]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const traceId = nextCvTraceSeq();
      const fullNameInput = document.querySelector<HTMLInputElement>('#field-fullName, input[id*="fullName"], [data-field="fullName"] input');
      const primarySectorEl = document.querySelector<HTMLElement>('#field-primarySector button, [id*="primarySector"] button, [data-field="primarySector"] button');
      const desiredRoleEl = document.querySelector<HTMLElement>('#field-desiredRole button, [id*="desiredRole"] button, [data-field="desiredRole"] button');

      console.log(`[CV-STATE-TRACE ${traceId}] [CV-DOM-TRACE]`, {
        traceId,
        timestamp: new Date().toISOString(),
        fullNameDom: fullNameInput ? fullNameInput.value : 'not_found',
        fullNameInputFound: Boolean(fullNameInput),
        primarySectorDom: primarySectorEl ? primarySectorEl.textContent : 'not_found',
        desiredRoleDom: desiredRoleEl ? desiredRoleEl.textContent : 'not_found',
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [mergedCustomFields]);

  const categoryThemeColor = useMemo(() => {
    if (categoryId === CATEGORY_IDS.iseAl || categoryId === 'ise-al' || categoryId === 'hire') return 'emerald';
    if (categoryId === CATEGORY_IDS.isBul || categoryId === 'is-ariyorum' || categoryId === 'seek') return 'sky';
    if (categoryId === CATEGORY_IDS.ortakBul || categoryId === 'ortak-bul' || categoryId === 'ortak-ariyorum' || categoryId === 'venture' || categoryId === 'ortaklik') return 'amber';
    if (categoryId === CATEGORY_IDS.yatirimBul || categoryId === 'yatirim-bul' || categoryId === 'girisim') return 'amber';
    if (categoryId === CATEGORY_IDS.yatirimYap || categoryId === 'yatirim-yap' || categoryId === 'invest') return 'blue';
    if (categoryId === CATEGORY_IDS.bayilikAl || categoryId === 'bayilik-al' || categoryId === 'franchise') return 'purple';
    if (categoryId === CATEGORY_IDS.isletmeDevri || categoryId === 'isletme-devri') return 'teal';
    if (categoryId === CATEGORY_IDS.dijitalAi || categoryId === 'dijital-ai') return 'rose';
    return 'amber';
  }, [categoryId]);

  const dynamicFieldContext = useMemo(
    () => ({
      values: {
        ...mergedCustomFields,
        sectorsPrunedNotice,
      },
      coreCity: core.city ?? null,
      categoryId,
      themeColor: categoryThemeColor,
      onDismissPrunedNotice: () => setSectorsPrunedNotice(false),
    }),
    [mergedCustomFields, sectorsPrunedNotice, core.city, categoryId, categoryThemeColor],
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
          isComplete: Boolean(mergedCustomFields.partnershipType || mergedCustomFields.partnerType || mergedCustomFields.expertise),
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
    if (categoryId === CATEGORY_IDS.bayilikAl) {
      const hasTitle = Boolean(core.title);
      const hasSector = Boolean(mergedCustomFields.sector || mergedCustomFields.preferredSectors);
      const hasBudgetOrInvestment = Boolean(mergedCustomFields.totalInvestment || mergedCustomFields.budget);

      return [
        {
          id: 'basics',
          label: 'Franchise / Marka Bilgisi',
          isComplete: hasTitle && hasSector,
          isRequired: true,
          stepIndex: 0,
        },
        {
          id: 'investment',
          label: 'Yatırım / Bütçe Koşulları',
          isComplete: hasBudgetOrInvestment,
          isRequired: true,
          stepIndex: 1,
        },
        {
          id: 'location',
          label: 'Lokasyon ve Şartlar',
          isComplete: Boolean(core.city || mergedCustomFields.availableCities),
          isRequired: true,
          stepIndex: 2,
        },
      ];
    }
    if (categoryId === CATEGORY_IDS.isletmeDevri) {
      const hasTitle = Boolean(core.title);
      const hasType = Boolean(mergedCustomFields.businessType || mergedCustomFields.preferredBusinessTypes);
      const hasPriceOrBudget = Boolean(mergedCustomFields.transferPrice || mergedCustomFields.budgetMax);

      return [
        {
          id: 'basics',
          label: 'İşletme Türü ve Sektör',
          isComplete: hasTitle && hasType,
          isRequired: true,
          stepIndex: 0,
        },
        {
          id: 'financials',
          label: 'Devir / Bütçe Koşulları',
          isComplete: hasPriceOrBudget,
          isRequired: true,
          stepIndex: 1,
        },
        {
          id: 'details',
          label: 'Lokasyon ve Devir Kapsamı',
          isComplete: Boolean(core.city || mergedCustomFields.city),
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
  const lastAutoFounderSummaryRef = useRef('');
  const lastAutoFounderShortRef = useRef('');
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

  const founderSummaryDraft = useMemo(() => {
    if (categoryId !== CATEGORY_IDS.ortakBul) return null;
    return buildFounderSummaryDraft({
      intent: partnershipIntent,
      title: core.title,
      sector: String(
        mergedCustomFields.sector
        || (Array.isArray(mergedCustomFields.sectors) ? mergedCustomFields.sectors.join(', ') : mergedCustomFields.sectors)
        || mergedCustomFields.primarySector
        || ''
      ),
      projectStage: String(mergedCustomFields.projectStage || mergedCustomFields.partnershipStage || ''),
      partnershipType: String(mergedCustomFields.partnershipType || ''),
      partnershipTypes: mergedCustomFields.partnershipTypes as string[] | string,
      commitment: String(mergedCustomFields.commitment || ''),
      equityOffered: mergedCustomFields.equityOffered as number | string,
      expertise: mergedCustomFields.expertise as string[] | string,
      expertiseOther: String(mergedCustomFields.expertiseOther || ''),
      professionalSkills: mergedCustomFields.professionalSkills as string[] | string,
      professionalSkillsOther: String(mergedCustomFields.professionalSkillsOther || ''),
      technicalSkills: mergedCustomFields.technicalSkills as string[] | string,
      technicalSkillsOther: String(mergedCustomFields.technicalSkillsOther || ''),
      tools: mergedCustomFields.tools as string[] | string,
      toolsOther: String(mergedCustomFields.toolsOther || ''),
      city: core.city,
      district: core.district,
    });
  }, [
    categoryId,
    partnershipIntent,
    core.city,
    core.district,
    core.title,
    mergedCustomFields.commitment,
    mergedCustomFields.equityOffered,
    mergedCustomFields.expertise,
    mergedCustomFields.expertiseOther,
    mergedCustomFields.partnershipType,
    mergedCustomFields.partnershipTypes,
    mergedCustomFields.primarySector,
    mergedCustomFields.projectStage,
    mergedCustomFields.partnershipStage,
    mergedCustomFields.professionalSkills,
    mergedCustomFields.professionalSkillsOther,
    mergedCustomFields.sector,
    mergedCustomFields.sectors,
    mergedCustomFields.technicalSkills,
    mergedCustomFields.technicalSkillsOther,
    mergedCustomFields.tools,
    mergedCustomFields.toolsOther,
  ]);

  useEffect(() => {
    if (!isFounderSummaryStep || !founderSummaryDraft) return;
    const currentLong = core.longDescription?.trim();
    const currentShort = core.shortDescription?.trim();
    const longUntouched =
      !currentLong || currentLong === lastAutoFounderSummaryRef.current;
    const shortUntouched =
      !currentShort || currentShort === lastAutoFounderShortRef.current;
    if (!longUntouched && !shortUntouched) return;
    lastAutoFounderSummaryRef.current = founderSummaryDraft.longDescription;
    lastAutoFounderShortRef.current = founderSummaryDraft.shortDescription;
    setCore((prev) => ({
      ...prev,
      longDescription: longUntouched
        ? founderSummaryDraft.longDescription
        : prev.longDescription,
      shortDescription: shortUntouched
        ? founderSummaryDraft.shortDescription
        : prev.shortDescription,
    }));
  }, [
    core.longDescription,
    core.shortDescription,
    founderSummaryDraft,
    isFounderSummaryStep,
  ]);

  const applyFounderSummaryDraft = useCallback(() => {
    if (!founderSummaryDraft) return;
    lastAutoFounderSummaryRef.current = founderSummaryDraft.longDescription;
    lastAutoFounderShortRef.current = founderSummaryDraft.shortDescription;
    setCore((prev) => ({
      ...prev,
      longDescription: founderSummaryDraft.longDescription,
      shortDescription: founderSummaryDraft.shortDescription,
    }));
  }, [founderSummaryDraft]);

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
  const careerPreviewData = useMemo(() => {
    if (!isCareerCardCategory) return null;
    const nameCandidate =
      typeof mergedCustomFields.fullName === 'string' &&
      mergedCustomFields.fullName.trim()
        ? mergedCustomFields.fullName.trim()
        : user?.displayName;
    return buildCareerCardPreviewData(
      categoryId,
      mergedCustomFields,
      core.longDescription,
      nameCandidate,
    );
  }, [categoryId, core.longDescription, isCareerCardCategory, mergedCustomFields, user?.displayName]);

  const stepCustomKeys = useMemo(
    () => resolveStepCustomFields(currentStep, allFieldKeys),
    [currentStep, allFieldKeys],
  );
  const visibleStepCustomKeys = useMemo(() => {
    let keys = stepCustomKeys;
    if (categoryId === CATEGORY_IDS.yatirimBul) {
      keys = filterVisibleSeekingCustomFields(stepCustomKeys, {
        customFields: mergedCustomFields,
        title: core.title,
        revealProductName: showDistinctProductName,
        revealUseOfFundsDetail: showUseOfFundsDetail,
      });
    }

    // Filter out inactive conditional 'Other' fields so they don't consume empty grid columns
    return keys.filter((key) => {
      if (
        key === 'preferredDistrictOther' &&
        !isManualCareerOption(mergedCustomFields.preferredDistrict)
      ) {
        return false;
      }
      if (
        key === 'desiredRoleOther' &&
        !isManualCareerOption(mergedCustomFields.desiredRole)
      ) {
        return false;
      }
      if (
        key === 'educationFieldOther' &&
        !isManualCareerOption(mergedCustomFields.educationField)
      ) {
        return false;
      }
      return true;
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

    // CV IMPORT HAS HIGHER PRIORITY THAN SAVED DRAFT
    if (!isCvApplied) {
      console.log(`[CV-TRACE ${nextCvTraceSeq()}] [CV-SCHEMA-EFFECT]`, {
        effect: 'restoreDraft',
        dependencies: ['listingType.fieldSchema', 'isCvApplied', 'restoredDraft'],
        customFieldsBefore: {
          fullName: customFields.fullName,
          desiredRole: customFields.desiredRole,
          primarySector: customFields.primarySector,
        },
        draftCustomFields: {
          fullName: draft.customFields?.fullName,
          desiredRole: draft.customFields?.desiredRole,
          primarySector: draft.customFields?.primarySector,
        },
      });
      mutateCustomFields(
        mergeCustomFieldDefaults(listingType.fieldSchema, draft.customFields),
        'restoreDraft:useEffect',
      );
    }

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
    isCvApplied,
    customFields,
    mutateCustomFields,
  ]);

  useEffect(() => {
    console.log(`[CV-TRACE ${nextCvTraceSeq()}] [CV-SCHEMA-EFFECT]`, {
      effect: 'schemaEffect',
      dependencies: ['listingType.fieldSchema', 'isCvApplied', 'restoredDraft'],
      customFieldsBefore: {
        fullName: customFields.fullName,
        desiredRole: customFields.desiredRole,
        primarySector: customFields.primarySector,
      },
      isCvApplied,
      restoredDraft,
    });
    mutateCustomFields((prev) => {
      const merged = mergeCustomFieldDefaults(listingType.fieldSchema, prev);
      return merged;
    }, 'schemaEffect:useEffect');
  }, [listingType.fieldSchema, isCvApplied, restoredDraft, mutateCustomFields, customFields]);

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
    const traceId = nextCvTraceSeq();
    const field = fieldByKey.get(key);
    let nextValue = value;
    if (field?.type === 'enum' && field.options?.length && value != null && value !== '') {
      nextValue = resolveEnumOption(value, field.options) ?? value;
    }
    if (field?.type === 'multi-enum') {
      if (Array.isArray(value)) {
        nextValue = value.map(String).filter(Boolean);
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        nextValue = trimmed ? trimmed.split(',').map((s) => s.trim()).filter(Boolean) : [];
      } else {
        nextValue = [];
      }
    }

    console.log(`[CV-TRACE ${traceId}] [CV-SET-CUSTOM-FIELD]`, {
      sequence: traceId,
      field: key,
      previous: customFields[key],
      next: nextValue,
      source: 'setCustomField',
      timestamp: new Date().toISOString(),
      cvImportCompleted: isCvApplied,
      draftRestored: restoredDraft,
    });

    mutateCustomFields((prev) => ({ ...prev, [key]: nextValue }), `setCustomField:${key}`);
    setFieldErrors((prev) => {
      if (!prev[key] && !prev[`customFields.${key}`]) return prev;
      const next = { ...prev };
      delete next[key];
      delete next[`customFields.${key}`];
      return next;
    });
  }, [fieldByKey, isCvApplied, restoredDraft, customFields, mutateCustomFields]);

  const handleCustomFieldChange = useCallback(
    (key: string, value: unknown) => {
      if (key === 'fullName' || key === 'desiredRole' || key === 'primarySector') {
        console.log(`[CV-STATE-TRACE ${nextCvTraceSeq()}]`, {
          field: key,
          previousValue: customFields[key],
          nextValue: value,
          source: 'handleCustomFieldChange',
          function: 'handleCustomFieldChange',
          reason: 'user_or_cv_change_event',
          timestamp: new Date().toISOString(),
          cvImportCompleted: isCvApplied,
          draftRestored: restoredDraft,
          currentSector: (customFields.primarySector as string) || (customFields.sector as string) || '',
        });
      }
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
          const allTaxonomy = getAllTaxonomyPositions();
          if (!allowedRoles.includes(currentRole) && !allTaxonomy.includes(currentRole)) {
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
      if (key === 'preferredBusinessTypes') {
        const nextTypes = Array.isArray(value) ? value.map(String) : [];
        if (!nextTypes.includes('Diğer')) {
          setCustomField('preferredBusinessTypesOther', '');
        }
        const currentSectors = Array.isArray(mergedCustomFields.preferredSectors)
          ? mergedCustomFields.preferredSectors.map(String)
          : [];
        if (currentSectors.length > 0) {
          const { prunedSectors, removedSectors } = pruneUnsupportedSectors(currentSectors, nextTypes);
          if (removedSectors.length > 0) {
            setCustomField('preferredSectors', prunedSectors);
            setSectorsPrunedNotice(true);
          }
        }
      }
      if (key === 'businessType') {
        if (value !== 'Diğer') {
          setCustomField('businessTypeOther', '');
        }
      }
      if (categoryId === CATEGORY_IDS.yatirimBul) {
        const extras = seekingFieldChangeExtras(key, value);
        for (const [extraKey, extraValue] of Object.entries(extras)) {
          setCustomField(extraKey, extraValue);
        }
      }
    },
    [categoryId, setCustomField, mergedCustomFields.preferredSectors, mergedCustomFields.primarySector, mergedCustomFields.desiredRole, customFields, isCvApplied, restoredDraft],
  );

  const handleApplyCvDraft = useCallback(
    (draft?: CvProfileDraftResult | null) => {
      const activeDraft = draft || pendingCvDraft;
      if (!activeDraft) return;
      const correlationId = activeCorrelationIdRef.current || 'apply_' + Math.random().toString(36).slice(2, 8);

      console.log(`[CV-STATE-TRACE ${nextCvTraceSeq()}] handleApplyCvDraft INPUT`, {
        correlationId,
        timestamp: new Date().toISOString(),
        fullName: activeDraft?.formValues?.fullName,
        primarySector: activeDraft?.formValues?.primarySector,
        desiredRole: activeDraft?.formValues?.desiredRole,
        experienceCount: activeDraft?.formValues?.experiences?.length,
        currentCustomFields: {
          fullName: customFields.fullName,
          primarySector: customFields.primarySector,
          desiredRole: customFields.desiredRole,
          experiencesLength: (customFields.experiences as any[])?.length,
        },
      });

      const { nextCustomFields, nextCoreFields, appliedKeys } = buildHydratedCustomFieldsFromCvDraft(
        activeDraft,
        customFields,
        listingType.fieldSchema,
      );

      console.log(`[CV-STATE-TRACE ${nextCvTraceSeq()}] nextCustomFields BEFORE SET`, {
        correlationId,
        timestamp: new Date().toISOString(),
        fullName: nextCustomFields.fullName,
        primarySector: nextCustomFields.primarySector,
        desiredRole: nextCustomFields.desiredRole,
        experienceLevel: nextCustomFields.experienceLevel,
        residenceCity: nextCustomFields.residenceCity,
        residenceDistrict: nextCustomFields.residenceDistrict,
        experiencesLength: (nextCustomFields.experiences as any[])?.length,
        educationHistoryLength: (nextCustomFields.educationHistory as any[])?.length,
        cvFileName: nextCustomFields.cvFileName,
        appliedKeys,
      });

      // Log [CV-STATE-TRACE] for each primary hydrated field
      for (const trackKey of ['fullName', 'desiredRole', 'primarySector'] as const) {
        console.log(`[CV-STATE-TRACE ${nextCvTraceSeq()}]`, {
          field: trackKey,
          previousValue: customFields[trackKey],
          nextValue: nextCustomFields[trackKey],
          source: 'handleApplyCvDraft',
          function: 'buildHydratedCustomFieldsFromCvDraft -> handleApplyCvDraft',
          reason: 'cv_hydration_apply',
          timestamp: new Date().toISOString(),
          cvImportCompleted: true,
          draftRestored: restoredDraft,
          currentSector: (nextCustomFields.primarySector as string) || '',
        });
      }

      mutateCustomFields(nextCustomFields, 'handleApplyCvDraft');
      if (Object.keys(nextCoreFields).length > 0) {
        setCore((prev) => ({
          ...prev,
          ...(nextCoreFields as Partial<typeof prev>),
          city: typeof nextCoreFields.city === 'string' ? nextCoreFields.city : prev.city,
          location: typeof nextCoreFields.location === 'string' ? nextCoreFields.location : prev.location,
          longDescription: typeof nextCoreFields.longDescription === 'string' ? nextCoreFields.longDescription : prev.longDescription,
          shortDescription: typeof nextCoreFields.shortDescription === 'string' ? nextCoreFields.shortDescription : prev.shortDescription,
        }));
      }

      setCvFilledKeys(new Set(appliedKeys));
      setIsCvApplied(true);
      setIsManualCvMode(false);
      toast.success('✨ CV bilgileri adımlara başarıyla aktarıldı.');
    },
    [pendingCvDraft, customFields, listingType.fieldSchema, restoredDraft, mutateCustomFields],
  );

  const handleCvDraftAnalyzed = useCallback(
    (draft: CvProfileDraftResult) => {
      const correlationId = activeCorrelationIdRef.current || 'analyzed_' + Math.random().toString(36).slice(2, 8);
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

      console.log(`[CV-STATE-TRACE ${nextCvTraceSeq()}] handleCvDraftAnalyzed INPUT`, {
        correlationId,
        timestamp: new Date().toISOString(),
        fullName: fv.fullName,
        primarySector: fv.primarySector,
        desiredRole: fv.desiredRole,
        experienceLevel: fv.experienceLevel,
        residenceCity: fv.residenceCity,
        residenceDistrict: fv.residenceDistrict,
        experienceCount: expCount,
        educationCount: eduCount,
        skillCount,
        cvFileName: fv.cvFileName,
      });

      setPendingCvDraft(draft);
      setIsCvApplied(true);
      setIsManualCvMode(false);
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

  const handleUploadCvFile = useCallback(
    async (file: File) => {
      const validExtensions = ['.pdf', '.docx', '.txt'];
      const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

      if (!hasValidExt) {
        toast.error('Lütfen geçerli bir PDF veya DOCX dosyası yükleyin.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5 MB sınırını aşıyor.');
        return;
      }

      const correlationId = 'req_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now();
      activeCorrelationIdRef.current = correlationId;

      try {
        console.log('[CV FORENSIC STORAGE BEFORE]', {
          correlationId,
          timestamp: new Date().toISOString(),
          storageValue: typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null,
        });
      } catch {
        // ignore
      }

      console.log('[CV DEBUG] 1. handleUploadCvFile start', {
        correlationId,
        timestamp: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
      });

      setIsUploadingCv(true);

      // Clean old CV transient state on new upload start
      setCvDraftInfo(null);
      setPendingCvDraft(null);
      setIsCvApplied(false);
      setCvFilledKeys(new Set());

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/career/cv/analyze', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        const fv = data.draft?.formValues || data.data?.formValues;

        console.log(`[CV-STATE-TRACE ${nextCvTraceSeq()}] API RESPONSE`, {
          correlationId,
          timestamp: new Date().toISOString(),
          status: response.status,
          success: data.success,
          fullName: fv?.fullName,
          primarySector: fv?.primarySector,
          desiredRole: fv?.desiredRole,
          experienceLevel: fv?.experienceLevel,
          residenceCity: fv?.residenceCity,
          residenceDistrict: fv?.residenceDistrict,
          experienceCount: fv?.experiences?.length,
          skillCount: (fv?.professionalSkillsList?.length ?? 0) + (fv?.technicalSkillsList?.length ?? 0),
          cvFileName: fv?.cvFileName,
        });

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'CV analizi sırasında bir hata oluştu.');
        }

        const draft = (data.draft || data.data) as CvProfileDraftResult;
        handleCvDraftAnalyzed(draft);

        try {
          console.log('[CV FORENSIC STORAGE AFTER]', {
            correlationId,
            timestamp: new Date().toISOString(),
            storageValue: typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null,
          });
        } catch {
          // ignore
        }

        toast.success('✨ CV başarıyla analiz edildi!');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'CV analiz edilemedi.';
        console.error('[CV DEBUG] API ERROR', err);
        toast.error(msg, {
          description: 'Dilerseniz formu manuel doldurarak devam edebilirsiniz.',
        });
      } finally {
        setIsUploadingCv(false);
      }
    },
    [handleCvDraftAnalyzed, storageKey],
  );

  const handleRemoveCv = useCallback(() => {
    setCvDraftInfo(null);
    setPendingCvDraft(null);
    setIsCvApplied(false);
    mutateCustomFields((prev) => {
      const next = { ...prev };
      delete next.cvFileName;
      delete next.cvDocumentId;
      delete next.cvUploadedAt;
      delete next.experiences;
      delete next.educationHistory;
      delete next.languages;
      delete next.professionalSkills;
      delete next.professionalSkillsList;
      delete next.technicalSkills;
      delete next.technicalSkillsList;
      delete next.tools;
      delete next.toolsList;
      delete next.certificates;
      delete next.candidateTraits;
      return next;
    }, 'handleRemoveCv');
    setCvFilledKeys(new Set());
    toast.info('CV kaldırıldı. Formu manuel doldurarak devam edebilirsiniz.');
  }, [mutateCustomFields]);

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

    if (isHireRoleNeedsStep || isCareerSkillsStep) {
      const combinedErrors: Record<string, string> = {};
      const materializedPatch: Record<string, unknown> = {};

      if (isHireRoleNeedsStep) {
        const hireErrors = validateHireRoleNeedsStep(mergedCustomFields);
        if (Object.keys(hireErrors).length > 0) {
          Object.assign(combinedErrors, hireErrors);
        } else {
          Object.assign(materializedPatch, materializeHireRoleNeedsFields(mergedCustomFields));
        }
      }

      if (isCareerSkillsStep) {
        const skillErrors = validateCareerSkillsStep(mergedCustomFields);
        if (Object.keys(skillErrors).length > 0) {
          Object.assign(combinedErrors, skillErrors);
        } else {
          Object.assign(materializedPatch, materializeCareerSkillsFields(mergedCustomFields));
        }
      }

      if (Object.keys(combinedErrors).length > 0) {
        setFieldErrors(combinedErrors);
        toast.error(Object.values(combinedErrors)[0] ?? 'Lütfen ilgili alanları kontrol edin.');
        return false;
      }

      if (Object.keys(materializedPatch).length > 0) {
        mutateCustomFields((prev) => ({ ...prev, ...materializedPatch }), 'validateStep:careerRoleAndSkills');
      }
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
      mutateCustomFields((prev) => ({ ...prev, ...materialized }), 'validateStep:careerEducation');
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

    if (isFounderPartnershipTypeStep) {
      setFieldErrors({});
      return true;
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

    if (isPackageStep && !isPublishStep) {
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

      // Smart pre-fill between Step 0 (Basics) and subsequent steps for Job Seekers (isBul)
      if (stepIndex === 0 && categoryId === CATEGORY_IDS.isBul) {
        mutateCustomFields((prev) => {
          const next = { ...prev };
          const exps = parseCareerExperiences(next.experiences);
          // If experiences are empty or single empty row, pre-fill sector and role from basics
          if (
            exps.length === 0 ||
            (exps.length === 1 && !exps[0].company && !exps[0].role)
          ) {
            const firstExp = exps[0] ?? createEmptyCareerExperience();
            next.experiences = [
              {
                ...firstExp,
                sector: firstExp.sector || String(next.primarySector ?? ''),
                role: firstExp.role || String(next.desiredRole ?? ''),
                roleOther: firstExp.roleOther || String(next.desiredRoleOther ?? ''),
                isCurrent: true,
              },
            ];
          }
          // Pre-fill preferredCity & preferredDistrict from residence if empty
          if (!next.preferredCity && next.residenceCity) {
            next.preferredCity = next.residenceCity;
            if (!next.preferredDistrict && next.residenceDistrict) {
              next.preferredDistrict = next.residenceDistrict;
            }
          }
          // Pre-fill preferredSectors from primarySector if empty
          if (!next.preferredSectors && next.primarySector) {
            next.preferredSectors = [next.primarySector];
          }
          // Pre-fill preferredRoles from desiredRole if empty
          if (!next.preferredRoles && next.desiredRole) {
            next.preferredRoles = [next.desiredRole];
          }
          return next;
        }, 'goNext:smartPreFill');
      }
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
    setPreviewOpen(false);

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Stepper Navigation (3 cols on desktop - exact franchise ratio) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className={cn('rounded-2xl border bg-white p-6 dark:bg-zinc-900 flex flex-col justify-between transition-all duration-200', theme.cardBorder, theme.cardGlow)}>
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

            <div className={cn('mt-8 pt-4 border-t flex items-start gap-3 text-xs text-slate-500', theme.footerBorder)}>
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

        {/* MAIN COLUMN: Active Step Form (9 cols on desktop - exact franchise ratio) */}
        <div className="col-span-1 lg:col-span-9">
          <div className={cn('rounded-2xl border bg-white p-6 sm:p-7 dark:bg-zinc-900 transition-all duration-200', theme.cardBorder, theme.cardGlow)}>
            <div>
              <div className="border-b border-border/60 pb-4 mb-4 lg:hidden">
                <FormStepIndicator steps={steps} currentIndex={stepIndex} />
              </div>

              <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-5', theme.headerBorder)}>
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
                          mutateCustomFields(
                            (prev) =>
                              mergeCustomFieldDefaults(listingType.fieldSchema, {
                                ...prev,
                                ...sample.customFields,
                              }),
                            'sampleFill',
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
                onChange={(next) => {
                  setCustomField('languageEntries', next);
                  setCustomField('languages', serializeCareerLanguages(next));
                }}
                disabled={disabled || isBusy}
                audience={categoryId === CATEGORY_IDS.iseAl ? 'hire' : 'seeker'}
                themeColor={categoryThemeColor}
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

          {isFounderPartnershipTypeStep && (
            <FounderPartnershipTypeStep
              intent={partnershipIntent}
              partnershipTypes={
                Array.isArray(mergedCustomFields.partnershipTypes)
                  ? mergedCustomFields.partnershipTypes.map(String)
                  : []
              }
              partnershipTypesOther={String(
                mergedCustomFields.partnershipTypesOther ?? mergedCustomFields.partnershipTypeOther ?? '',
              )}
              professionalSkills={mergedCustomFields.professionalSkills as string | string[]}
              professionalSkillsOther={String(mergedCustomFields.professionalSkillsOther ?? '')}
              technicalSkills={mergedCustomFields.technicalSkills as string | string[]}
              technicalSkillsOther={String(mergedCustomFields.technicalSkillsOther ?? '')}
              tools={mergedCustomFields.tools as string | string[]}
              toolsOther={String(mergedCustomFields.toolsOther ?? '')}
              expertise={
                Array.isArray(mergedCustomFields.expertise)
                  ? mergedCustomFields.expertise.map(String)
                  : typeof mergedCustomFields.expertise === 'string' && mergedCustomFields.expertise.trim()
                    ? [mergedCustomFields.expertise]
                    : []
              }
              expertiseOther={String(mergedCustomFields.expertiseOther ?? '')}
              sector={
                String(
                  mergedCustomFields.sector
                  || (Array.isArray(mergedCustomFields.sectors) ? mergedCustomFields.sectors[0] : mergedCustomFields.sectors)
                  || mergedCustomFields.primarySector
                  || ''
                )
              }
              stage={String(mergedCustomFields.projectStage || mergedCustomFields.partnershipStage || '')}
              targetPartnerType={String(mergedCustomFields.partnershipType || mergedCustomFields.targetPartnerType || '')}
              title={core.title}
              shortDescription={core.shortDescription}
              onChange={(patch) => {
                mutateCustomFields((prev) => {
                  const next = { ...prev };
                  for (const [key, val] of Object.entries(patch)) {
                    const field = fieldByKey.get(key);
                    if (field?.type === 'multi-enum') {
                      if (Array.isArray(val)) {
                        next[key] = val.map(String).filter(Boolean);
                      } else if (typeof val === 'string') {
                        const trimmed = val.trim();
                        next[key] = trimmed ? trimmed.split(',').map((s) => s.trim()).filter(Boolean) : [];
                      } else {
                        next[key] = [];
                      }
                    } else {
                      next[key] = val;
                    }
                  }
                  return next;
                }, 'FounderPartnershipTypeStep:onChange');
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  for (const key of Object.keys(patch)) {
                    delete next[key];
                    delete next[`customFields.${key}`];
                  }
                  return next;
                });
              }}
              disabled={disabled || isBusy}
              errors={{
                partnershipTypes:
                  resolveFieldError(fieldErrors, 'partnershipTypes')
                  || resolveFieldError(fieldErrors, 'partnershipType'),
                expertise: resolveFieldError(fieldErrors, 'expertise'),
                professionalSkills: resolveFieldError(fieldErrors, 'professionalSkills'),
                technicalSkills: resolveFieldError(fieldErrors, 'technicalSkills'),
                tools: resolveFieldError(fieldErrors, 'tools'),
              }}
              themeColor={categoryThemeColor}
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
              themeColor={categoryThemeColor}
            />
          )}

          {isPublishStep && (
            <div className="space-y-6">
              {/* Yayın Onayları & KVKK / Açık Rıza İzinleri */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-border dark:bg-card">
                <PublishConsentFields
                  value={publishConsents}
                  onChange={setPublishConsents}
                  disabled={disabled || isBusy}
                  variant={categoryId === CATEGORY_IDS.isBul ? 'career' : 'default'}
                  themeColor={categoryThemeColor}
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

          {isFormStep && !isFounderPartnershipTypeStep && (
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
                    context={dynamicFieldContext}
                  />
                );
              })}

              {isCareerSummaryStep || isInvestorSummaryStep || isFounderSummaryStep ? (
                <div className="space-y-3">
                <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {categoryId === CATEGORY_IDS.iseAl
                      ? 'Açık pozisyon, yetkinlik ve teklif bilgilerinize göre bir taslak hazırladık. Kullanabilir veya kendiniz yazabilirsiniz.'
                      : categoryId === CATEGORY_IDS.yatirimYap
                        ? 'Yapılandırılmış kriterlerden bir yatırımcı profili hazırladık. Kullanabilir veya kendiniz yazabilirsiniz.'
                      : categoryId === CATEGORY_IDS.ortakBul
                        ? 'Girişim ve aradığınız ortak kriterlerinize göre otomatik bir açıklama taslağı hazırladık. Kullanabilir veya kendiniz düzenleyebilirsiniz.'
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
                        : isFounderSummaryStep
                          ? applyFounderSummaryDraft
                          : applyCareerSummaryDraft
                    }
                  >
                    Özeti yeniden oluştur
                  </Button>
                </div>

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
                && !(isInvestmentSummaryStep && !editingInvestmentSummary)
                && !(isFormStep && stepIndex === 0 && (
                  categoryId === CATEGORY_IDS.isBul
                  || categoryId === CATEGORY_IDS.iseAl
                  || categoryId === CATEGORY_IDS.isletmeDevri
                  || categoryId === CATEGORY_IDS.bayilikAl
                  || categoryId === CATEGORY_IDS.ortakBul
                )) && (
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
                  themeColor={categoryThemeColor}
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
                  themeColor={categoryThemeColor}
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
                      context={dynamicFieldContext}
                    />
                  ) : null}
                </div>
              ) : null}

              {isFormStep && stepIndex === 0 && (categoryId === CATEGORY_IDS.isletmeDevri || categoryId === CATEGORY_IDS.bayilikAl || categoryId === CATEGORY_IDS.ortakBul) ? (
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 items-start">
                  {/* Middle Vertical Divider */}
                  <div
                    aria-hidden="true"
                    className={cn('hidden md:block absolute left-1/2 top-0 bottom-0 -ml-px w-px pointer-events-none', theme.dividerColor)}
                  />

                  {/* Left Column: Başlık, Kısa Açıklama, Varsa Tabela/Marka Adı */}
                  <div className="space-y-4 w-full min-w-0">
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
                      include={['title', 'shortDescription']}
                      labels={coreFieldLabels}
                      fieldUi={coreFieldUi}
                      errors={{
                        title: resolveFieldError(fieldErrors, 'title'),
                        shortDescription: resolveFieldError(fieldErrors, 'shortDescription'),
                      }}
                      disabled={disabled || isBusy}
                      themeColor={categoryThemeColor}
                    />

                    {fieldByKey.get('businessName') ? (
                      <div className="space-y-2">
                        <DynamicField
                          field={fieldByKey.get('businessName')!}
                          value={mergedCustomFields.businessName}
                          onChange={(val) => handleCustomFieldChange('businessName', val)}
                          error={resolveFieldError(fieldErrors, 'businessName')}
                          disabled={disabled || isBusy}
                          context={dynamicFieldContext}
                        />
                      </div>
                    ) : null}

                    {fieldByKey.get('brandName') ? (
                      <div className="space-y-2">
                        <DynamicField
                          field={fieldByKey.get('brandName')!}
                          value={mergedCustomFields.brandName}
                          onChange={(val) => handleCustomFieldChange('brandName', val)}
                          error={resolveFieldError(fieldErrors, 'brandName')}
                          disabled={disabled || isBusy}
                          context={dynamicFieldContext}
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Right Column: İşletme Türleri, Sektörler, Ortaklık Türleri */}
                  <div className="space-y-4 w-full min-w-0">
                    {restCustomKeys
                      .filter((key) => key !== 'businessName' && key !== 'brandName')
                      .map((key) => {
                        const field = fieldByKey.get(key);
                        if (!field) return null;
                        return (
                          <div key={key} className="space-y-2">
                            <DynamicField
                              field={field}
                              value={mergedCustomFields[key]}
                              onChange={(val) => handleCustomFieldChange(key, val)}
                              error={resolveFieldError(fieldErrors, key)}
                              disabled={disabled || isBusy}
                              context={dynamicFieldContext}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : isFormStep && stepIndex === 0 && (categoryId === CATEGORY_IDS.isBul || categoryId === CATEGORY_IDS.iseAl) ? (
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 items-start">
                  {/* Middle Vertical Divider */}
                  <div
                    aria-hidden="true"
                    className={cn('hidden md:block absolute left-1/2 top-0 bottom-0 -ml-px w-px pointer-events-none', theme.dividerColor)}
                  />

                  {/* Row 1, Col 1: İsim Soyisim (isBul) veya Firma Adı (iseAl) */}
                  <div className="w-full min-w-0">
                    {fieldByKey.get('fullName') ? (
                      <DynamicField
                        field={fieldByKey.get('fullName')!}
                        value={mergedCustomFields.fullName ?? ''}
                        onChange={(val) => {
                          handleCustomFieldChange('fullName', val);
                          if (cvFilledKeys.has('fullName')) {
                            setCvFilledKeys((prev) => {
                              const next = new Set(prev);
                              next.delete('fullName');
                              return next;
                            });
                          }
                        }}
                        isCvFilled={cvFilledKeys.has('fullName')}
                        error={resolveFieldError(fieldErrors, 'fullName')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : fieldByKey.get('companyName') ? (
                      <DynamicField
                        field={fieldByKey.get('companyName')!}
                        value={mergedCustomFields.companyName}
                        onChange={(val) => handleCustomFieldChange('companyName', val)}
                        error={resolveFieldError(fieldErrors, 'companyName')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 1, Col 2: Sektör */}
                  <div className="w-full min-w-0 space-y-2">
                    {fieldByKey.get('primarySector') ? (
                      <>
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
                          context={dynamicFieldContext}
                        />
                        {isManualCareerOption(mergedCustomFields.primarySector) && (
                          <div className="pt-1">
                            <DynamicField
                              field={
                                fieldByKey.get('sectorOther') ?? {
                                  key: 'sectorOther',
                                  label: 'Özel Sektör Belirtin',
                                  type: 'string',
                                  required: true,
                                }
                              }
                              value={mergedCustomFields.sectorOther ?? ''}
                              onChange={(val) => handleCustomFieldChange('sectorOther', val)}
                              error={resolveFieldError(fieldErrors, 'sectorOther')}
                              disabled={disabled || isBusy}
                              context={dynamicFieldContext}
                            />
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Row 2, Col 1: Pozisyon / Açık Pozisyon */}
                  <div className="w-full min-w-0 space-y-2">
                    {fieldByKey.get('desiredRole') ? (
                      <>
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
                          context={dynamicFieldContext}
                        />
                        {isManualCareerOption(mergedCustomFields.desiredRole) && (
                          <div className="pt-1">
                            <DynamicField
                              field={
                                fieldByKey.get('desiredRoleOther') ?? {
                                  key: 'desiredRoleOther',
                                  label: 'Özel Pozisyon / Unvan Belirtin',
                                  type: 'string',
                                  required: true,
                                }
                              }
                              value={mergedCustomFields.desiredRoleOther ?? ''}
                              onChange={(val) => handleCustomFieldChange('desiredRoleOther', val)}
                              error={resolveFieldError(fieldErrors, 'desiredRoleOther')}
                              disabled={disabled || isBusy}
                              context={dynamicFieldContext}
                            />
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Row 2, Col 2: Deneyim Seviyesi / Aranan Seviye */}
                  <div className="w-full min-w-0">
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
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 3, Col 1: Şehir (İl) */}
                  <div className="w-full min-w-0">
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
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 3, Col 2: İlçe */}
                  <div className="w-full min-w-0 space-y-2">
                    {fieldByKey.get('residenceDistrict') ? (
                      <>
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
                          context={dynamicFieldContext}
                        />
                        {isManualCareerOption(mergedCustomFields.residenceDistrict) && (
                          <div className="pt-1">
                            <DynamicField
                              field={
                                fieldByKey.get('districtOther') ?? {
                                  key: 'districtOther',
                                  label: 'Özel İlçe Belirtin',
                                  type: 'string',
                                  required: true,
                                }
                              }
                              value={mergedCustomFields.districtOther ?? ''}
                              onChange={(val) => handleCustomFieldChange('districtOther', val)}
                              error={resolveFieldError(fieldErrors, 'districtOther')}
                              disabled={disabled || isBusy}
                              context={dynamicFieldContext}
                            />
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Row 4 (varsa): Cinsiyet & Doğum Tarihi (isBul) */}
                  {fieldByKey.get('profileGender') ? (
                    <div className="w-full min-w-0">
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
                        context={dynamicFieldContext}
                      />
                    </div>
                  ) : null}

                  {fieldByKey.get('birthDate') ? (
                    <div className="w-full min-w-0">
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
                        context={dynamicFieldContext}
                      />
                    </div>
                  ) : null}
                </div>
              ) : isFormStep && (currentStep.id === 'offer' || currentStep.id === 'preferences') && (categoryId === CATEGORY_IDS.iseAl || categoryId === CATEGORY_IDS.isBul) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 items-start">
                  {/* Row 1, Col 1: Çalışma Tipi */}
                  <div className="w-full min-w-0">
                    {fieldByKey.get('workType') ? (
                      <DynamicField
                        field={fieldByKey.get('workType')!}
                        value={mergedCustomFields.workType}
                        onChange={(val) => handleCustomFieldChange('workType', val)}
                        error={resolveFieldError(fieldErrors, 'workType')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 1, Col 2: Çalışma Modeli */}
                  <div className="w-full min-w-0">
                    {fieldByKey.get('workplacePreference') ? (
                      <DynamicField
                        field={fieldByKey.get('workplacePreference')!}
                        value={mergedCustomFields.workplacePreference}
                        onChange={(val) => handleCustomFieldChange('workplacePreference', val)}
                        error={resolveFieldError(fieldErrors, 'workplacePreference')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 2, Col 1: Çalışma İli */}
                  <div className="w-full min-w-0">
                    {fieldByKey.get('preferredCity') ? (
                      <DynamicField
                        field={fieldByKey.get('preferredCity')!}
                        value={mergedCustomFields.preferredCity}
                        onChange={(val) => handleCustomFieldChange('preferredCity', val)}
                        error={resolveFieldError(fieldErrors, 'preferredCity')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 2, Col 2: Çalışma İlçesi */}
                  <div className="w-full min-w-0 space-y-2">
                    {fieldByKey.get('preferredDistrict') ? (
                      <DynamicField
                        field={fieldByKey.get('preferredDistrict')!}
                        value={mergedCustomFields.preferredDistrict}
                        onChange={(val) => handleCustomFieldChange('preferredDistrict', val)}
                        error={resolveFieldError(fieldErrors, 'preferredDistrict')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                    {isManualCareerOption(mergedCustomFields.preferredDistrict) && fieldByKey.get('preferredDistrictOther') ? (
                      <DynamicField
                        field={fieldByKey.get('preferredDistrictOther')!}
                        value={mergedCustomFields.preferredDistrictOther}
                        onChange={(val) => handleCustomFieldChange('preferredDistrictOther', val)}
                        error={resolveFieldError(fieldErrors, 'preferredDistrictOther')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 3, Col 1: Maaş Aralığı / Ücret Beklentisi */}
                  <div className="w-full min-w-0">
                    {fieldByKey.get('salaryRange') ? (
                      <DynamicField
                        field={fieldByKey.get('salaryRange')!}
                        value={mergedCustomFields.salaryRange}
                        onChange={(val) => handleCustomFieldChange('salaryRange', val)}
                        error={resolveFieldError(fieldErrors, 'salaryRange')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : fieldByKey.get('salaryExpectation') ? (
                      <DynamicField
                        field={fieldByKey.get('salaryExpectation')!}
                        value={mergedCustomFields.salaryExpectation}
                        onChange={(val) => handleCustomFieldChange('salaryExpectation', val)}
                        error={resolveFieldError(fieldErrors, 'salaryExpectation')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>

                  {/* Row 3, Col 2: İşe Başlama */}
                  <div className="w-full min-w-0">
                    {fieldByKey.get('availability') ? (
                      <DynamicField
                        field={fieldByKey.get('availability')!}
                        value={mergedCustomFields.availability}
                        onChange={(val) => handleCustomFieldChange('availability', val)}
                        error={resolveFieldError(fieldErrors, 'availability')}
                        disabled={disabled || isBusy}
                        context={dynamicFieldContext}
                      />
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 items-start">
                  {(isSeekingIdentityStep
                    ? restCustomKeys.filter((key) => key !== 'productName')
                    : restCustomKeys
                  ).map((key) => {
                    const field = fieldByKey.get(key);
                    if (!field) return null;
                    const isFullWidth =
                      key === 'expertise' ||
                      key === 'offeredSkills' ||
                      key === 'expertiseOther' ||
                      key === 'offeredSkillsOther' ||
                      key === 'sectors' ||
                      key === 'preferredSectors' ||
                      key === 'preferredRoles' ||
                      key === 'preferredBusinessTypes' ||
                      key === 'businessModel' ||
                      key === 'targetCustomer' ||
                      key === 'useOfFunds' ||
                      key === 'transferScope' ||
                      key === 'reasonForTransfer' ||
                      key === 'postTransferSupport' ||
                      key === 'financialSummary' ||
                      key === 'relevantExperience' ||
                      key === 'capabilities' ||
                      key === 'requiredResponsibilities' ||
                      key === 'trainingSupport' ||
                      key === 'operationalSupport' ||
                      key === 'marketingSupport' ||
                      key === 'introductionVideoUrl' ||
                      key === 'presentationPdfUrl' ||
                      key === 'sampleContractUrl';

                    return (
                      <div key={key} className={cn('space-y-2 w-full min-w-0', isFullWidth && 'md:col-span-2')}>
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
                          context={dynamicFieldContext}
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
                  })}
                </div>
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
                  themeColor={categoryThemeColor}
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
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-border dark:bg-card">
                  <PublishConsentFields
                    value={publishConsents}
                    onChange={setPublishConsents}
                    disabled={disabled || isBusy}
                    variant={categoryId === CATEGORY_IDS.isBul ? 'career' : 'default'}
                    themeColor={categoryThemeColor}
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
              )}
            </>
          )}
        </div>
      </div>

            {/* Middle Card Footer */}
            <div className={cn('mt-8 pt-4 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', theme.footerBorder)}>
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
                    className={cn('h-10 px-6 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all', theme.ctaButtonBg)}
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
