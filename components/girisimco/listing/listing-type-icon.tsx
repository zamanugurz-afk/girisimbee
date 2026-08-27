import {
  BrainCircuit,
  Briefcase,
  Building2,
  CircleDollarSign,
  Handshake,
  Megaphone,
  Store,
  UserRoundSearch,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type {
  ListingTypeIconKey,
} from '@/features/listings/utils/listing-card-display';
import type { CategoryIntentId } from '@/features/categories/types/category.types';
import { cn } from '@/lib/utils';

export type { ListingTypeIconKey };

/** Semantic icons aligned with home category cards. */
export const LISTING_TYPE_ICON_MAP: Record<ListingTypeIconKey, LucideIcon> = {
  investment: CircleDollarSign,
  investor: Wallet,
  'job-seeker': UserRoundSearch,
  employer: Briefcase,
  partner: Handshake,
  franchise: Store,
  digital: BrainCircuit,
  transfer: Building2,
  general: Megaphone,
};

export function categoryIntentToIconKey(intent: CategoryIntentId): ListingTypeIconKey {
  switch (intent) {
    case 'find-investment':
      return 'investment';
    case 'invest':
      return 'investor';
    case 'find-job':
      return 'job-seeker';
    case 'hire':
      return 'employer';
    case 'find-partner':
      return 'partner';
    case 'franchise':
      return 'franchise';
    case 'digital-ai':
      return 'digital';
    default:
      return 'general';
  }
}

export function ListingTypeIconBadge({
  iconKey,
  color,
  className,
  size = 'sm',
}: {
  iconKey: ListingTypeIconKey;
  color: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const Icon = LISTING_TYPE_ICON_MAP[iconKey] ?? LISTING_TYPE_ICON_MAP.general;
  const box =
    size === 'lg' ? 'h-12 w-12 rounded-2xl' : size === 'md' ? 'h-11 w-11 rounded-xl' : 'h-9 w-9 rounded-xl';
  const glyph = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', box, className)}
      style={{ backgroundColor: `${color}1F`, color }}
      aria-hidden
    >
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
}
