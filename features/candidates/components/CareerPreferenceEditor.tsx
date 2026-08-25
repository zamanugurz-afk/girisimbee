'use client';

import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  suggestPreferredRoles,
  suggestPreferredSectors,
} from '@/features/candidates/taxonomy/career-preference-suggestions';
import {
  isManualCareerOption,
  MANUAL_OPTION,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';

type PreferenceValue = {
  preferredSectors: string[];
  sectorOther?: string;
  preferredRoles: string[];
  preferredRolesOther?: string;
};

function asSelectedList(value: string[] | string | undefined): string[] {
  const raw = Array.isArray(value) ? value.map(String) : parseSelectedList(value);
  return raw.map((item) => (isManualCareerOption(item) ? MANUAL_OPTION : item));
}

export function CareerPreferenceEditor({
  experiences,
  primarySector,
  desiredRole,
  value,
  onChange,
  disabled,
  errors,
}: {
  experiences: CareerExperience[];
  primarySector?: string | null;
  desiredRole?: string | null;
  value: PreferenceValue;
  onChange: (patch: Partial<PreferenceValue>) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof PreferenceValue, string>>;
}) {
  const selectedSectors = asSelectedList(value.preferredSectors);
  const selectedRoles = asSelectedList(value.preferredRoles);

  const sectorOptions = suggestPreferredSectors({
    experiences,
    primarySector,
    desiredRole,
    selected: selectedSectors,
  });
  const roleOptions = suggestPreferredRoles({
    experiences,
    primarySector,
    desiredRole,
    selected: selectedRoles,
  });

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        En yakın sektör ve pozisyonlar listenin başında, diğer ilgili olanlar A–Z.
        Liste son deneyiminizdeki sektör ve pozisyona göre çıkar; eski işleriniz
        listeyi genişletmez. Aradığınız yoksa Diğer / Kendim gireceğim’i işaretleyip
        yazın.
      </p>
      <CareerMultiSelect
        label="İlgilenilen sektörler"
        domain="sectors"
        options={sectorOptions}
        value={selectedSectors}
        onChange={(next) => onChange({ preferredSectors: next })}
        manualValue={value.sectorOther ?? ''}
        onManualChange={(next) => onChange({ sectorOther: next })}
        manualPlaceholder="Listede olmayan sektörü yazın (örn: Bilişim, Sağlık, Perakende)..."
        searchPlaceholder="Sektör ara..."
        disabled={disabled}
        error={errors?.preferredSectors ?? errors?.sectorOther}
      />
      <CareerMultiSelect
        label="Açık olduğum pozisyonlar"
        domain="positions"
        options={roleOptions}
        value={selectedRoles}
        onChange={(next) => onChange({ preferredRoles: next })}
        manualValue={value.preferredRolesOther ?? ''}
        onManualChange={(next) => onChange({ preferredRolesOther: next })}
        manualPlaceholder="Listede olmayan pozisyonu yazın (örn: Bölge Satış Müdürü)..."
        searchPlaceholder="Pozisyon ara..."
        disabled={disabled}
        error={errors?.preferredRoles ?? errors?.preferredRolesOther}
      />
    </div>
  );
}
