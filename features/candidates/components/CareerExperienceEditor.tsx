'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  createEmptyCareerExperience,
  type CareerExperience,
} from '@/features/candidates/config/career-profile-fields';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { cn } from '@/lib/utils';

export function CareerExperienceEditor({
  value,
  onChange,
  error,
  disabled,
}: {
  value: CareerExperience[];
  onChange: (next: CareerExperience[]) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  const rows = value.length > 0 ? value : [createEmptyCareerExperience()];

  function updateRow(id: string, patch: Partial<CareerExperience>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([...rows, createEmptyCareerExperience()]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) {
      onChange([createEmptyCareerExperience()]);
      return;
    }
    onChange(rows.filter((row) => row.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Firma adı istemiyoruz. Deneyimi sektör, rol ve sorumluluklarla anonim anlatın.
      </p>

      {rows.map((row, index) => (
        <div
          key={row.id}
          className={cn(
            'space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4',
            error && 'border-destructive/40',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Deneyim {index + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-destructive"
              disabled={disabled}
              onClick={() => removeRow(row.id)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Sil
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`sector-${row.id}`}>Sektör</Label>
              <select
                id={`sector-${row.id}`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={row.sector}
                disabled={disabled}
                onChange={(e) => updateRow(row.id, { sector: e.target.value })}
              >
                <option value="">Seçin</option>
                {JOB_SECTOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`role-${row.id}`}>Pozisyon / görev</Label>
              <Input
                id={`role-${row.id}`}
                value={row.role}
                disabled={disabled}
                placeholder="Örn: Saha Satış Uzmanı"
                onChange={(e) => updateRow(row.id, { role: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`duration-${row.id}`}>Çalışma süresi</Label>
            <Input
              id={`duration-${row.id}`}
              value={row.duration}
              disabled={disabled}
              placeholder="Örn: 3 yıl · 2021–2024"
              onChange={(e) => updateRow(row.id, { duration: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`resp-${row.id}`}>Temel sorumluluklar</Label>
            <Textarea
              id={`resp-${row.id}`}
              rows={3}
              value={row.responsibilities}
              disabled={disabled}
              placeholder="Örn: Müşteri ziyaretleri, hedef takibi, teklif hazırlama ve ekip içi raporlama yaptım."
              onChange={(e) => updateRow(row.id, { responsibilities: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`ach-${row.id}`}>Öne çıkan başarılar</Label>
            <Textarea
              id={`ach-${row.id}`}
              rows={2}
              value={row.achievements}
              disabled={disabled}
              placeholder="Örn: Bölge cirosunu bir yılda yüzde 30 artırdım (isteğe bağlı)"
              onChange={(e) => updateRow(row.id, { achievements: e.target.value })}
            />
          </div>
        </div>
      ))}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addRow}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Deneyim ekle
      </Button>
    </div>
  );
}
