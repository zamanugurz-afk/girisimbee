'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DEAL_SCORE_META,
  RISK_LEVEL_META,
  CONDITION_META,
  PROVIDER_MAP,
} from '@/config/site';
import type { DealScore, RiskLevel, ConditionGrade, ProviderId } from '@/types';
import { CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

const TONE_CLASS: Record<string, string> = {
  success: 'border-success/30 bg-success-soft text-success',
  primary: 'border-primary/30 bg-primary-soft text-primary',
  warning: 'border-warning/30 bg-warning-soft text-warning',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  muted: 'border-border bg-secondary text-muted-foreground',
};

export function DealScoreBadge({
  score,
  className,
}: {
  score: DealScore;
  className?: string;
}) {
  const meta = DEAL_SCORE_META[score];
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 font-medium', TONE_CLASS[meta.tone], className)}
    >
      {meta.label}
    </Badge>
  );
}

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel;
  className?: string;
}) {
  const meta = RISK_LEVEL_META[level];
  const Icon =
    level === 'low' ? ShieldCheck : level === 'medium' ? AlertTriangle : ShieldAlert;
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 font-medium', TONE_CLASS[meta.tone], className)}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

export function ConditionBadge({
  grade,
  className,
}: {
  grade: ConditionGrade;
  className?: string;
}) {
  const meta = CONDITION_META[grade];
  return (
    <Badge
      variant="outline"
      className={cn('font-medium capitalize', TONE_CLASS[meta.tone], className)}
    >
      {meta.label}
    </Badge>
  );
}

export function ProviderBadge({
  providerId,
  className,
}: {
  providerId: ProviderId;
  className?: string;
}) {
  const p = PROVIDER_MAP[providerId];
  if (!p) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground',
        className,
      )}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: p.color }}
      />
      {p.name}
    </span>
  );
}

export function VerifiedTick({ verified }: { verified: boolean }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
      <CheckCircle2 className="h-3 w-3" />
      Onaylı
    </span>
  );
}
