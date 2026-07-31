'use client';

import { toast } from 'sonner';
import type { CategoryId } from '@/lib/domain/ids';
import {
  getListingTagGroups,
  LISTING_TAG_MAX,
} from '@/features/listings/config/listing-tag-options.config';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import { FieldLabelWithTooltip } from '@/features/listings/form/field-label-with-tooltip';
import { META_FIELD_UI } from '@/features/listings/form/listing-field-metadata';
import { cn } from '@/lib/utils';

export interface StructuredTagsSelectProps {
  categoryId: CategoryId;
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  max?: number;
}

export function StructuredTagsSelect({
  categoryId,
  value,
  onChange,
  disabled,
  max = LISTING_TAG_MAX,
}: StructuredTagsSelectProps) {
  const groups = getListingTagGroups(categoryId);

  function toggleTag(tag: string) {
    if (disabled) return;

    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
      return;
    }

    if (value.length >= max) {
      toast.error(`En fazla ${max} etiket seçebilirsiniz.`);
      return;
    }

    onChange([...value, tag]);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <FieldLabelWithTooltip label="Etiketler" />
        <span className="text-gc-xs text-muted-foreground">
          {value.length}/{max} seçildi
        </span>
      </div>

      {groups.map((group) => (
        <section key={group.id} className="space-y-2.5">
          <h4 className="text-gc-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selected = value.includes(option);
              return (
                <button
                  key={`${group.id}-${option}`}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled || (!selected && value.length >= max)}
                  onClick={() => toggleTag(option)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-gc-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    selected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border/80 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40 hover:text-foreground',
                    disabled && 'cursor-not-allowed opacity-50',
                    !selected && !disabled && value.length >= max && 'cursor-not-allowed opacity-40',
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <FormFieldFooter helperText={META_FIELD_UI.tags.helperText} />
    </div>
  );
}

/** @deprecated Use StructuredTagsSelect */
export const TagsInput = StructuredTagsSelect;
export type TagsInputProps = StructuredTagsSelectProps;
