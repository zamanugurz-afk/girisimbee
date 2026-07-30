'use client';

import type { ListingFieldDefinition } from '@/features/listings/types/listing-type.types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface DynamicFieldProps {
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function DynamicField({ field, value, onChange, error, disabled }: DynamicFieldProps) {
  const id = `field-${field.key}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <FieldControl
        id={id}
        field={field}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FieldControl({
  id,
  field,
  value,
  onChange,
  disabled,
}: {
  id: string;
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) {
  switch (field.type) {
    case 'string':
      return (
        <Input
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={field.label}
        />
      );

    case 'number':
    case 'currency':
    case 'percentage':
      return (
        <Input
          id={id}
          type="number"
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          disabled={disabled}
          min={field.min}
          max={field.max}
          step={field.type === 'percentage' ? 0.1 : field.type === 'currency' ? 1 : 'any'}
          placeholder={field.type === 'currency' ? '0' : field.type === 'percentage' ? '0-100' : undefined}
        />
      );

    case 'boolean':
      return (
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <Input
          id={id}
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );

    case 'enum':
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder={`${field.label} seçin`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return (
        <Textarea
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
  }
}
