'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { cn } from '@/lib/utils';

export type ListingPublisherMode = 'personal' | 'company';

interface ListingPublisherSelectProps {
  mode: ListingPublisherMode;
  companyId: CompanyId | null;
  onChange: (mode: ListingPublisherMode, companyId: CompanyId | null) => void;
  disabled?: boolean;
}

const PUBLISHER_OPTIONS: { value: ListingPublisherMode; id: string; label: string }[] = [
  { value: 'personal', id: 'publisher-personal', label: 'Kişisel' },
  { value: 'company', id: 'publisher-company', label: 'Şirket' },
];

export function ListingPublisherSelect({
  mode,
  companyId,
  onChange,
  disabled,
}: ListingPublisherSelectProps) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      return;
    }

    let cancelled = false;
    setIsLoadingCompanies(true);

    void getCompanyService()
      .listByOwner(user.id as UserId)
      .then((results) => {
        if (!cancelled) setCompanies(results);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCompanies(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleModeChange(next: ListingPublisherMode) {
    onChange(
      next,
      next === 'company' ? companyId ?? companies[0]?.id ?? null : null,
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/80 p-4 dark:border-white/10">
      <div>
        <Label className="text-sm font-medium">Yayınlayan</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          İlan kişisel adınıza mı yoksa şirket adına mı yayınlanacak?
        </p>
      </div>
      <RadioGroup
        value={mode}
        onValueChange={(value) => handleModeChange(value as ListingPublisherMode)}
        disabled={disabled}
        className="grid gap-3 sm:grid-cols-2"
      >
        {PUBLISHER_OPTIONS.map((option) => (
          <label
            key={option.value}
            htmlFor={option.id}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 p-3 dark:border-white/10',
              mode === option.value && 'border-primary/30 ring-1 ring-primary/15',
            )}
          >
            <RadioGroupItem value={option.value} id={option.id} />
            <span className="flex-1 text-sm font-normal leading-none">{option.label}</span>
          </label>
        ))}
      </RadioGroup>
      {mode === 'company' && (
        <div className="space-y-2">
          <Label>Şirket</Label>
          {isLoadingCompanies ? (
            <p className="text-xs text-muted-foreground">Şirketler yükleniyor…</p>
          ) : companies.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Önce bir şirket oluşturmalısınız.{' '}
              <Link href="/company/create" className="font-medium text-primary hover:text-primary/80">
                Şirket oluştur
              </Link>
            </p>
          ) : (
            <Select
              value={companyId ?? ''}
              onValueChange={(value) => onChange('company', value as CompanyId)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Şirket seçin" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
