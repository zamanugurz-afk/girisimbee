'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCompanyService } from '@/lib/persistence/container';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { Company } from '@/features/companies/types/company.types';
import type { CompanyId, UserId } from '@/lib/domain/ids';

export type ListingPublisherMode = 'personal' | 'company';

interface ListingPublisherSelectProps {
  mode: ListingPublisherMode;
  companyId: CompanyId | null;
  onChange: (mode: ListingPublisherMode, companyId: CompanyId | null) => void;
  disabled?: boolean;
}

export function ListingPublisherSelect({
  mode,
  companyId,
  onChange,
  disabled,
}: ListingPublisherSelectProps) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    if (!user) return;
    void getCompanyService()
      .listByOwner(user.id as UserId)
      .then(setCompanies);
  }, [user]);

  return (
    <div className="space-y-4 rounded-xl border border-border/80 p-4 dark:border-white/10">
      <div>
        <Label className="text-sm font-medium">Yayınlayan</Label>
        <p className="mt-1 text-xs text-muted-foreground">İlan kişisel adınıza mı yoksa şirket adına mı yayınlanacak?</p>
      </div>
      <RadioGroup
        value={mode}
        onValueChange={(v) => {
          const next = v as ListingPublisherMode;
          onChange(next, next === 'company' ? companyId ?? companies[0]?.id ?? null : null);
        }}
        disabled={disabled}
        className="grid gap-3 sm:grid-cols-2"
      >
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 p-3 dark:border-white/10">
          <RadioGroupItem value="personal" id="publisher-personal" />
          <span className="text-sm">Kişisel</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 p-3 dark:border-white/10">
          <RadioGroupItem value="company" id="publisher-company" disabled={companies.length === 0} />
          <span className="text-sm">Şirket</span>
        </label>
      </RadioGroup>
      {mode === 'company' && (
        <div className="space-y-2">
          <Label>Şirket</Label>
          {companies.length === 0 ? (
            <p className="text-xs text-muted-foreground">Önce bir şirket oluşturmalısınız.</p>
          ) : (
            <Select
              value={companyId ?? ''}
              onValueChange={(v) => onChange('company', v as CompanyId)}
              disabled={disabled}
            >
              <SelectTrigger><SelectValue placeholder="Şirket seçin" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
