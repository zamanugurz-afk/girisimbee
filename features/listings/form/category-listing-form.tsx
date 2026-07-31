'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { DynamicField } from '@/features/listings/form/fields/dynamic-field';
import { CoreListingFields } from '@/features/listings/form/fields/core-fields';
import { ImagesInput } from '@/features/listings/form/fields/meta-fields';
import { StructuredTagsSelect } from '@/features/listings/form/fields/structured-tags-select';
import { CvUploadField } from '@/features/listings/form/fields/cv-upload-field';
import {
  EMPTY_KVKK_CONSENTS,
  KvkkConsentFields,
  validateKvkkConsents,
  type KvkkConsentValues,
} from '@/features/listings/form/fields/kvkk-consent-fields';
import { FormStepIndicator } from '@/features/listings/form/form-step-indicator';
import { ListingPreviewDialog } from '@/features/listings/components/listing-preview-dialog';
import { ListingFormPreviewContent } from '@/features/listings/components/listing-form-preview-content';
import {
  buildListingDraftStorageKey,
  useListingFormAutosave,
} from '@/features/listings/hooks/use-listing-form-autosave';
import {
  filterErrorsToCurrentStep,
  logValidationErrors,
  resolvePublishErrorMessages,
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
}: CategoryListingFormProps) {
  const steps = useMemo(() => getListingFormSteps(categoryId), [categoryId]);
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
    };
  }, [listingType.fieldSchema, initialValues]);

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<'save' | 'draft' | 'publish' | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);

  const currentStep = steps[stepIndex];
  const isPreviewStep = Boolean(currentStep.preview);
  const isPublishStep = Boolean(currentStep.publish);
  const isCvStep = Boolean(currentStep.cv);
  const isKvkkStep = Boolean(currentStep.kvkk);
  const isFormStep = !isPreviewStep && !isPublishStep;
  const usesExtendedCities =
    categoryId === CATEGORY_IDS.isBul
    || categoryId === CATEGORY_IDS.iseAl;
  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;

  const mergedCustomFields = useMemo(
    () => mergeCustomFieldDefaults(listingType.fieldSchema, customFields),
    [listingType.fieldSchema, customFields],
  );

  const formValues = useMemo(
    (): ListingFormValues => ({
      core,
      customFields: mergedCustomFields,
      tags,
      images,
      cvUrl,
      kvkkConsents,
    }),
    [core, mergedCustomFields, tags, images, cvUrl, kvkkConsents],
  );

  const validationSnapshot = useMemo(
    (): ValidationFormSnapshot => ({ core, customFields: mergedCustomFields, tags, images }),
    [core, mergedCustomFields, tags, images],
  );

  const stepCustomKeys = useMemo(
    () => resolveStepCustomFields(currentStep, allFieldKeys),
    [currentStep, allFieldKeys],
  );

  const { clearDraft, restoreDraft } = useListingFormAutosave({
    storageKey,
    values: formValues,
    enabled: !disabled,
    onSaved: setLastAutoSaved,
  });

  useEffect(() => {
    if (restoredDraft || initialValues) return;
    const draft = restoreDraft();
    if (!draft) {
      setRestoredDraft(true);
      return;
    }
    setCore({ ...defaults.core, ...draft.core });
    setCustomFields(
      mergeCustomFieldDefaults(listingType.fieldSchema, draft.customFields),
    );
    setTags(draft.tags);
    setImages(draft.images);
    setCvUrl(draft.cvUrl ?? null);
    setKvkkConsents(draft.kvkkConsents ?? { ...EMPTY_KVKK_CONSENTS });
    setRestoredDraft(true);
    toast.message('Kaydedilmiş taslak geri yüklendi.');
  }, [initialValues, listingType.fieldSchema, restoreDraft, restoredDraft]);

  useEffect(() => {
    setCustomFields((prev) => mergeCustomFieldDefaults(listingType.fieldSchema, prev));
  }, [listingType.fieldSchema]);

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
      const publishIndex = currentStepIndex + 1;
      const allowedForward =
        clamped === publishIndex
        && steps[publishIndex]?.publish
        && reason === 'goNext:previewToPublish';
      const allowedBack = clamped === currentStepIndex - 1 && reason === 'goBack';
      const allowedValidationFix = reason.startsWith('validate') && clamped < currentStepIndex;
      if (!allowedForward && !allowedBack && !allowedValidationFix) {
        console.warn('[ListingForm] goToStep blocked from preview — only next publish or goBack', {
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

    if (isCvStep) {
      if (!cvUrl) {
        setFieldErrors({ cvUrl: 'Özgeçmiş yüklemeniz gerekmektedir.' });
        toast.error('Lütfen özgeçmişinizi yükleyin.');
        return false;
      }
      setFieldErrors({});
      return true;
    }

    if (isKvkkStep) {
      if (!validateKvkkConsents(kvkkConsents)) {
        setFieldErrors({ kvkkConsents: 'Tüm KVKK onay kutularını işaretlemeniz gerekmektedir.' });
        toast.error('Lütfen tüm KVKK onaylarını tamamlayın.');
        return false;
      }
      setFieldErrors({});
      return true;
    }

    try {
      console.log('[ListingForm:stage] validateCurrentStep', {
        'payload.customFields.stage': mergedCustomFields.stage,
        stepIndex,
        stepId: currentStep.id,
      });

      validateListingFormStep(
        listingType.fieldSchema,
        stepValidationInput(currentStep, stepCustomKeys),
        {
          core: formValues.core,
          customFields: mergedCustomFields,
          tags: formValues.tags,
          images: formValues.images,
        },
        'full',
      );
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
        });
        setFieldErrors(currentStepOnlyErrors);
        scheduleScrollToFirstError(currentStepOnlyErrors);
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
      isPublishStep,
      isFormStep,
    });

    if (isPreviewStep) {
      const publishIndex = stepIndex + 1;
      if (publishIndex >= steps.length || !steps[publishIndex]?.publish) {
        console.error('[ListingForm] goNext: publish step must be immediately after preview', {
          stepIndex,
          publishIndex,
        });
        return;
      }
      setFieldErrors({});
      goToStep(publishIndex, 'goNext:previewToPublish');
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

    const nextStep = steps[nextIndex];

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
    const customFieldsWithCv = cvUrl
      ? { ...mergedCustomFields, cvUrl, kvkkConsents }
      : { ...mergedCustomFields, ...(categoryId === CATEGORY_IDS.isBul ? { kvkkConsents } : {}) };

    return {
      core,
      customFields: customFieldsWithCv,
      tags,
      images: [...images]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((img, index) => ({ ...img, sortOrder: index })),
      cvUrl,
      kvkkConsents,
    };
  }

  /** Publish/draft from the final step — no re-validation, never reset wizard step. */
  async function runFinalStepAction(
    mode: 'draft' | 'publish' | 'save',
    handler?: (values: ListingFormValues) => Promise<void>,
  ) {
    if (!handler) return;

    console.log('[ListingForm] runFinalStepAction start', {
      mode,
      stepIndex,
      stepId: currentStep.id,
    });

    setPublishErrors([]);
    setSubmitting(mode);

    try {
      await handler(buildHandlerValues());
      console.log('[ListingForm] runFinalStepAction success', { mode });
      clearDraft();
    } catch (err) {
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
        publishErrorMessages,
      });

      setPublishErrors(publishErrorMessages);
    } finally {
      setSubmitting(null);
    }
  }

  const isBusy = submitting !== null;

  return (
    <>
      <FormStepIndicator steps={steps} currentIndex={stepIndex} />

      <div className="gc-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-gc-xs font-medium uppercase tracking-wide text-primary">
              {listingType.name}
            </p>
            <h2 className="mt-1 font-display text-gc-lg font-semibold text-foreground">
              {currentStep.title}
            </h2>
            {currentStep.description && (
              <p className="mt-1.5 text-gc-sm text-muted-foreground">{currentStep.description}</p>
            )}
          </div>
          {lastAutoSaved && isFormStep && (
            <p className="inline-flex items-center gap-1.5 text-gc-xs text-muted-foreground">
              <Cloud className="h-3.5 w-3.5" />
              Otomatik kayıt: {formatAutosaveTime(lastAutoSaved)}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {isPreviewStep && (
            <ListingFormPreviewContent
              values={formValues}
              listingType={listingType}
              readOnly
            />
          )}

          {isPublishStep && (
            <div className="space-y-3">
              <p className="text-gc-sm text-muted-foreground">
                Tüm bilgiler doğrulandı. İlanınızı yayınlayabilirsiniz.
              </p>
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
            </div>
          )}

          {isFormStep && (
            <>
              {currentStep.coreFields && currentStep.coreFields.length > 0 && (
                <CoreListingFields
                  values={core}
                  onChange={handleCoreChange}
                  include={currentStep.coreFields}
                  extendedCities={usesExtendedCities && currentStep.coreFields.includes('city')}
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

              {stepCustomKeys.map((key) => {
                const field = fieldByKey.get(key);
                if (!field) return null;
                return (
                  <DynamicField
                    key={key}
                    field={field}
                    value={mergedCustomFields[key]}
                    onChange={(val) => setCustomField(key, val)}
                    error={resolveFieldError(fieldErrors, key)}
                    disabled={disabled || isBusy}
                  />
                );
              })}

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
                />
              )}

              {isCvStep && (
                <CvUploadField
                  value={cvUrl}
                  onChange={setCvUrl}
                  disabled={disabled || isBusy}
                  error={resolveFieldError(fieldErrors, 'cvUrl')}
                  userId={userId}
                />
              )}

              {isKvkkStep && (
                <KvkkConsentFields
                  value={kvkkConsents}
                  onChange={setKvkkConsents}
                  disabled={disabled || isBusy}
                  error={resolveFieldError(fieldErrors, 'kvkkConsents')}
                />
              )}
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border/60 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={disabled || isBusy}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Geri
              </Button>
            )}
            {!isLastStep && (
              <Button type="button" onClick={goNext} disabled={disabled || isBusy}>
                İleri
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {isPreviewStep && showPreviewButton && (
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isBusy}
              onClick={() => setPreviewOpen(true)}
            >
              Tam Ekran Önizle
            </Button>
          )}

          {isPublishStep && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {showDraftButton && onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || isBusy}
                  onClick={() => void runFinalStepAction('draft', onSaveDraft)}
                >
                  {submitting === 'draft' ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                </Button>
              )}
              {onSubmit && (
                <Button
                  type="button"
                  variant={showPublishButton ? 'outline' : 'default'}
                  disabled={disabled || isBusy}
                  onClick={() => void runFinalStepAction('save', onSubmit)}
                >
                  {submitting === 'save' ? 'Kaydediliyor…' : submitLabel}
                </Button>
              )}
              {showPublishButton && onPublish && (
                <Button
                  type="button"
                  disabled={disabled || isBusy}
                  onClick={() => void runFinalStepAction('publish', onPublish)}
                >
                  {submitting === 'publish' ? 'Gönderiliyor…' : 'Yayınla'}
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-gc-xs text-muted-foreground">
          Adım {stepIndex + 1} / {steps.length}
        </p>
      </div>

      <ListingPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        values={formValues}
        listingType={listingType}
      />
    </>
  );
}

/** @deprecated Use CategoryListingForm */
export const DynamicListingForm = CategoryListingForm;
export type DynamicListingFormProps = CategoryListingFormProps;
