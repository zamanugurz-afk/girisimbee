'use client';

import { motion } from 'framer-motion';
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatPct } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  trend?: number;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  delay?: number;
}

const TONE_ICON: Record<string, string> = {
  default: 'bg-secondary text-muted-foreground',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  primary: 'bg-primary-soft text-primary',
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  tone = 'default',
  delay = 0,
}: StatCardProps) {
  const trendUp = trend != null && trend > 0;
  const trendDown = trend != null && trend < 0;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -3 }}
      className="ib-card ib-card-hover p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            TONE_ICON[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend != null && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              trendUp && 'bg-success-soft text-success',
              trendDown && 'bg-danger-soft text-danger',
              !trendUp && !trendDown && 'bg-secondary text-muted-foreground',
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {formatPct(trend)}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </motion.div>
  );
}
