import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/listings/types/listing.entity.types';
import type { FranchiseFlow } from '@/features/franchise/types/franchise-listing.types';
import type {
  FranchiseListingDetails,
  FranchiseListingPayload,
} from '@/features/franchise/types/franchise-listing.types';
import { FRANCHISE_SUBCATEGORY_IDS } from '@/features/shared/constants/ecosystem';

const BUY_DETAIL_KEYS = ['minimumYatirim', 'maksimumYatirim', 'tercihEdilenLokasyon'] as const;
const GIVE_DETAIL_KEYS = [
  'franchiseBedeli',
  'minimumSermaye',
  'tahminiAylikCiro',
  'egitimDestegi',
  'operasyonDestegi',
  'pazarlamaDestegi',
] as const;

export function flowFromSubcategoryId(subcategoryId: Listing['subcategoryId']): FranchiseFlow | null {
  if (!subcategoryId) return null;
  if (subcategoryId === FRANCHISE_SUBCATEGORY_IDS['franchise-buy']) return 'buy';
  if (subcategoryId === FRANCHISE_SUBCATEGORY_IDS['franchise-give']) return 'give';
  return null;
}

export function extractFranchiseListingDetails(listing: Listing): FranchiseListingDetails {
  const cf = listing.customFields;
  return {
    minimumYatirim: (cf.minimumYatirim as number | null | undefined) ?? null,
    maksimumYatirim: (cf.maksimumYatirim as number | null | undefined) ?? null,
    tercihEdilenLokasyon: (cf.tercihEdilenLokasyon as string | null | undefined) ?? null,
    franchiseBedeli: (cf.franchiseBedeli as number | null | undefined) ?? null,
    minimumSermaye: (cf.minimumSermaye as number | null | undefined) ?? null,
    tahminiAylikCiro: (cf.tahminiAylikCiro as number | null | undefined) ?? null,
    egitimDestegi: (cf.egitimDestegi as boolean | null | undefined) ?? null,
    operasyonDestegi: (cf.operasyonDestegi as boolean | null | undefined) ?? null,
    pazarlamaDestegi: (cf.pazarlamaDestegi as boolean | null | undefined) ?? null,
  };
}

function buildCustomFields(flow: FranchiseFlow, payload: FranchiseListingPayload): Record<string, unknown> {
  const keys = flow === 'buy' ? BUY_DETAIL_KEYS : GIVE_DETAIL_KEYS;
  const customFields: Record<string, unknown> = {};
  for (const key of keys) {
    if (payload[key] !== undefined) {
      customFields[key] = payload[key];
    }
  }
  return customFields;
}

export function franchisePayloadToCreateInput(
  flow: FranchiseFlow,
  payload: FranchiseListingPayload,
): Pick<
  CreateListingInput,
  | 'title'
  | 'shortDescription'
  | 'longDescription'
  | 'city'
  | 'district'
  | 'industry'
  | 'contactPhone'
  | 'contactWhatsapp'
  | 'contactEmail'
  | 'contactWebsite'
  | 'customFields'
> {
  return {
    title: payload.title,
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription ?? '',
    city: payload.city ?? null,
    district: payload.district ?? null,
    industry: payload.sector ?? null,
    contactPhone: payload.contactPhone ?? null,
    contactWhatsapp: payload.contactWhatsapp ?? null,
    contactEmail: payload.contactEmail ?? null,
    contactWebsite: payload.contactWebsite ?? null,
    customFields: buildCustomFields(flow, payload),
  };
}

export function franchisePayloadToUpdateInput(
  flow: FranchiseFlow,
  payload: Partial<FranchiseListingPayload>,
  existing: Listing,
): UpdateListingInput {
  const update: UpdateListingInput = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.shortDescription !== undefined) update.shortDescription = payload.shortDescription;
  if (payload.longDescription !== undefined) update.longDescription = payload.longDescription;
  if (payload.city !== undefined) update.city = payload.city;
  if (payload.district !== undefined) update.district = payload.district;
  if (payload.sector !== undefined) update.industry = payload.sector;
  if (payload.contactPhone !== undefined) update.contactPhone = payload.contactPhone;
  if (payload.contactWhatsapp !== undefined) update.contactWhatsapp = payload.contactWhatsapp;
  if (payload.contactEmail !== undefined) update.contactEmail = payload.contactEmail;
  if (payload.contactWebsite !== undefined) update.contactWebsite = payload.contactWebsite;

  const customPatch = buildCustomFields(flow, payload as FranchiseListingPayload);
  if (Object.keys(customPatch).length > 0) {
    update.customFields = { ...existing.customFields, ...customPatch };
  }

  return update;
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return '';
  return `${value.toLocaleString('tr-TR')} ₺`;
}

export function formatSupportFlags(details: FranchiseListingDetails): string {
  const flags: string[] = [];
  if (details.egitimDestegi) flags.push('Eğitim');
  if (details.operasyonDestegi) flags.push('Operasyon');
  if (details.pazarlamaDestegi) flags.push('Pazarlama');
  return flags.join(', ');
}
