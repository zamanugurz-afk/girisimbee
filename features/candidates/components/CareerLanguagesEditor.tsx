'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CAREER_LANGUAGE_LEVEL_OPTIONS,
  CAREER_LANGUAGE_OPTIONS,
  createEmptyLanguageEntry,
  MANUAL_OPTION_SHORT,
  type CareerLanguageEntry,
} from '@/features/candidates/taxonomy/career-taxonomy';

export function CareerLanguagesEditor({
  value,
  onChange,
  disabled,
  error,
}: {
  value: CareerLanguageEntry[];
  onChange: (next: CareerLanguageEntry[]) => void;
  disabled?: boolean;
  error?: string | null;
}) {
  const rows = value.length > 0 ? value : [createEmptyLanguageEntry()];

  function updateRow(id: string, patch: Partial<CareerLanguageEntry>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Yabancı dil</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Dil ve seviye ayrı seçilir. Birden fazla dil ekleyebilirsiniz.
        </p>
      </div>

      {rows.map((row, index) => {
        const isManual = row.language === MANUAL_OPTION_SHORT;
        return (
          <div
            key={row.id}
            className="grid gap-2 rounded-lg border border-border/70 bg-muted/15 p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="space-y-1.5">
              <Label htmlFor={`lang-${row.id}`}>Dil {index + 1}</Label>
              <select
                id={`lang-${row.id}`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={row.language}
                disabled={disabled}
                onChange={(e) =>
                  updateRow(row.id, {
                    language: e.target.value,
                    languageOther:
                      e.target.value === MANUAL_OPTION_SHORT ? row.languageOther : '',
                  })
                }
              >
                <option value="">Seçin</option>
                {CAREER_LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {isManual ? (
                <Input
                  value={row.languageOther ?? ''}
                  disabled={disabled}
                  placeholder="Dil adını yazın"
                  onChange={(e) => updateRow(row.id, { languageOther: e.target.value })}
                />
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`level-${row.id}`}>Dil seviyesi</Label>
              <select
                id={`level-${row.id}`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={row.level}
                disabled={disabled}
                onChange={(e) => updateRow(row.id, { level: e.target.value })}
              >
                <option value="">Seçin</option>
                {CAREER_LANGUAGE_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={disabled}
                onClick={() => {
                  if (rows.length <= 1) onChange([createEmptyLanguageEntry()]);
                  else onChange(rows.filter((r) => r.id !== row.id));
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...rows, createEmptyLanguageEntry()])}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Dil ekle
      </Button>
    </div>
  );
}
