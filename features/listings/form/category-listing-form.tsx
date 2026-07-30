'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ListingType } from '@/features/listings/types/listing-type.types';
import type { CategoryId } from '@/lib/domain/ids';
import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';
import {
  getListingFormDefaults,
  buildCreateListingFormSchema,
  buildDraftListingFormSchema,
  validateListingFormStep,
} from '@/features/listings/form/build-dynamic-schema';
import {
  getListingFormSteps,
  resolveStepCustomFields,
  type ListingFormStepDef,
} from '@/features/listings/config/listing-form-steps.config';
import { DynamicField } from '@/features/listings/form/fields/dynamic-field';
import { CoreListingFields } from '@/features/listings/form/fields/core-fields';
import { TagsInput, ImagesInput } from '@/features/listings/form/fields/meta-fields';
import { FormStepIndicator } from '@/features/listings/form/form-step-indicator';
import { ListingPreviewDialog } from '@/features/listings/components/listing-preview-dialog';
import { ZodError } from 'zod';
import { cn } from '@/lib/utils';

export interface ListingFormValues {
  core: CoreListingFieldsInput;
  customFields: Record<string, unknown>;
  tags: string[];
  images: { url: string; alt?: string | null; sortOrder?: number }[];
}

export interface CategoryListingFormProps {
  listingType: ListingType;
  categoryId: CategoryId;
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

function parseZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    errors[issue.path.join('.')] = issue.message;
  }
  return errors;
}

function stepValidationInput(
  step: ListingFormStepDef,
  fieldKeys: string[],
  values: ListingFormValues,
) {
  return {
    coreFields: step.coreFields,
    customFieldKeys: step.customFieldKeys ? fieldKeys : undefined,
    meta: step.meta,
  };
}

export function CategoryListingForm({
  listingType,
  categoryId,
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
  const fieldByKey = useMemo(
    () => new Map(listingType.fieldSchema.fields.map((f) => [f.key, f])),
    [listingType.fieldSchema],
  );

  const defaults = useMemo(
    () => ({
      ...getListingFormDefaults(listingType.fieldSchema),
      ...initialValues,
    }),
    [listingType.fieldSchema, initialValues],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [core, setCore] = useState<CoreListingFieldsInput>(defaults.core);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>(defaults.customFields);
  const [tags, setTags] = useState<string[]>(defaults.tags);
  const [images, setImages] = useState(defaults.images);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<'save' | 'draft' | 'publish' | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;

  const fullSchema = useMemo(
    () => buildCreateListingFormSchema(listingType.fieldSchema),
    [listingType.fieldSchema],
  );
  const draftSchema = useMemo(
    () => buildDraftListingFormSchema(listingType.fieldSchema),
    [listingType.fieldSchema],
  );

  const formValues = useMemo(
    (): ListingFormValues => ({ core, customFields, tags, images }),
    [core, customFields, tags, images],
  );

  const stepCustomKeys = useMemo(
    () => resolveStepCustomFields(currentStep, allFieldKeys),
    [currentStep, allFieldKeys],
  );

  const setCustomField = useCallback((key: string, value: unknown) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  function validateCurrentStep(mode: 'draft' | 'full'): boolean {
    setFieldErrors({});
    try {
      validateListingFormStep(
        listingType.fieldSchema,
        stepValidationInput(currentStep, stepCustomKeys, formValues),
        formValues,
        mode,
      );
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setFieldErrors(parseZodErrors(err));
        toast.error('Lütfen bu adımdaki zorunlu alanları doldurun.');
      }
      return false;
    }
  }

  function goNext() {
    if (!validateCurrentStep('full')) return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setFieldErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function runAction(
    mode: 'save' | 'draft' | 'publish',
    handler?: (values: ListingFormValues) => Promise<void>,
  ) {
    if (!handler) return;

    setFieldErrors({});
    setSubmitting(mode);

    const payload = {
      categoryId,
      listingTypeId: listingType.id,
      core,
      customFields,
      tags,
      images: [...images]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((img, index) => ({ ...img, sortOrder: index })),
    };

    try {
      if (mode === 'draft') {
        draftSchema.parse(payload);
      } else {
        fullSchema.parse(payload);
      }
      await handler({
        core,
        customFields,
        tags,
        images: payload.images,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        setFieldErrors(parseZodErrors(err));
        toast.error('Lütfen formdaki hataları düzeltin.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Bir hata oluştu');
      }
    } finally {
      setSubmitting(null);
    }
  }

  const isBusy = submitting !== null;

  return (
    <>
      <FormStepIndicator steps={steps} currentIndex={stepIndex} />

      <div className="gc-card p-6 sm:p-8">
        <div className="mb-6">
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

        <div className="space-y-4">
          {currentStep.coreFields && currentStep.coreFields.length > 0 && (
            <CoreListingFields
              values={core}
              onChange={setCore}
              include={currentStep.coreFields}
              errors={{
                title: fieldErrors['title'] ?? fieldErrors['core.title'],
                shortDescription: fieldErrors['shortDescription'] ?? fieldErrors['core.shortDescription'],
                longDescription: fieldErrors['longDescription'],
                city: fieldErrors['city'],
                remotePolicy: fieldErrors['remotePolicy'],
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
                value={customFields[key]}
                onChange={(val) => setCustomField(key, val)}
                error={fieldErrors[key] ?? fieldErrors[`customFields.${key}`]}
                disabled={disabled || isBusy}
              />
            );
          })}

          {currentStep.meta?.includes('tags') && (
            <TagsInput value={tags} onChange={setTags} disabled={disabled || isBusy} />
          )}
          {currentStep.meta?.includes('images') && (
            <ImagesInput
              value={images}
              onChange={setImages}
              disabled={disabled || isBusy}
              userId={userId}
            />
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

          {isLastStep && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {showDraftButton && onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || isBusy}
                  onClick={() => void runAction('draft', onSaveDraft)}
                >
                  {submitting === 'draft' ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                </Button>
              )}
              {showPreviewButton && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || isBusy}
                  onClick={() => setPreviewOpen(true)}
                >
                  Önizle
                </Button>
              )}
              {onSubmit && (
                <Button
                  type="button"
                  variant={showPublishButton ? 'outline' : 'default'}
                  disabled={disabled || isBusy}
                  onClick={() => void runAction('save', onSubmit)}
                >
                  {submitting === 'save' ? 'Kaydediliyor…' : submitLabel}
                </Button>
              )}
              {showPublishButton && onPublish && (
                <Button
                  type="button"
                  disabled={disabled || isBusy}
                  onClick={() => void runAction('publish', onPublish)}
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
