'use client';

import { BadgeCheck, Building2, TrendingUp } from 'lucide-react';
import { GcBadge } from '@/components/girisimco/ui/gc-badge';
import { gcIconSize, type GcIconSize } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type VerifiedBadgeKind = 'user' | 'company' | 'investor';

const CONFIG: Record<
  VerifiedBadgeKind,
  { label: string; variant: 'success' | 'default' | 'secondary'; Icon: typeof BadgeCheck }
> = {
  user: { label: 'Doğrulanmış Kullanıcı', variant: 'success', Icon: BadgeCheck },
  company: { label: 'Doğrulanmış Şirket', variant: 'default', Icon: Building2 },
  investor: { label: 'Doğrulanmış Yatırımcı', variant: 'secondary', Icon: TrendingUp },
};

interface VerifiedBadgeProps {
  kind: VerifiedBadgeKind;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({ kind, size = 'sm', showLabel = false, className }: VerifiedBadgeProps) {
  const { label, variant, Icon } = CONFIG[kind];
  const iconSize: GcIconSize = size === 'sm' ? 'sm' : 'md';

  if (showLabel) {
    return (
      <GcBadge variant={variant} size={size === 'md' ? 'md' : 'sm'} className={className}>
        <Icon className={gcIconSize[iconSize]} aria-hidden />
        {label}
      </GcBadge>
    );
  }

  return (
    <span title={label} className={cn('inline-flex', className)}>
      <Icon className={cn(gcIconSize[iconSize], 'text-primary')} aria-label={label} />
    </span>
  );
}

interface VerifiedBadgeGroupProps {
  user?: boolean;
  company?: boolean;
  investor?: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadgeGroup({
  user,
  company,
  investor,
  size = 'sm',
  showLabel = false,
  className,
}: VerifiedBadgeGroupProps) {
  if (!user && !company && !investor) return null;

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {user && <VerifiedBadge kind="user" size={size} showLabel={showLabel} />}
      {company && <VerifiedBadge kind="company" size={size} showLabel={showLabel} />}
      {investor && <VerifiedBadge kind="investor" size={size} showLabel={showLabel} />}
    </span>
  );
}
