'use client';

import { motion } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Eye,
  Activity,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import type { ListingResponse } from '@/types';

interface RiskCenterProps {
  riskFlags: Array<{
    label: string;
    level: 'green' | 'yellow' | 'red';
    detail: string;
  }>;
}

const LEVEL_META: Record<string, { icon: LucideIcon; color: string; bg: string; border: string; label: string }> = {
  green: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-soft/10', border: 'border-success/30', label: 'İyi' },
  yellow: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-soft/10', border: 'border-warning/30', label: 'Dikkat' },
  red: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-soft/10', border: 'border-danger/30', label: 'Risk' },
};

export function RiskCenter({ riskFlags }: RiskCenterProps) {
  const greenCount = riskFlags.filter((f) => f.level === 'green').length;
  const yellowCount = riskFlags.filter((f) => f.level === 'yellow').length;
  const redCount = riskFlags.filter((f) => f.level === 'red').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-soft text-danger">
          <ShieldAlert className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Risk Merkezi</h3>
          <p className="text-xs text-muted-foreground">Otomatik risk tespiti</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-success/30 bg-success-soft/10 p-2.5 text-center">
          <p className="font-display text-xl font-bold text-success">{greenCount}</p>
          <p className="text-[10px] font-medium text-muted-foreground">İyi</p>
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning-soft/10 p-2.5 text-center">
          <p className="font-display text-xl font-bold text-warning">{yellowCount}</p>
          <p className="text-[10px] font-medium text-muted-foreground">Dikkat</p>
        </div>
        <div className="rounded-lg border border-danger/30 bg-danger-soft/10 p-2.5 text-center">
          <p className="font-display text-xl font-bold text-danger">{redCount}</p>
          <p className="text-[10px] font-medium text-muted-foreground">Risk</p>
        </div>
      </div>

      <div className="space-y-2">
        {riskFlags.map((flag, idx) => {
          const meta = LEVEL_META[flag.level];
          const Icon = meta.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className={cn('flex items-start gap-3 rounded-lg border p-3', meta.bg, meta.border)}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.color)} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{flag.label}</p>
                  <span className={cn('text-[10px] font-bold uppercase', meta.color)}>{meta.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{flag.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface PurchaseTimelineProps {
  timeline: Array<{
    label: string;
    date: string;
    type: 'created' | 'price' | 'description' | 'seen' | 'status';
  }>;
}

const TYPE_META: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  created: { icon: Circle, color: 'text-primary', bg: 'bg-primary' },
  price: { icon: Activity, color: 'text-warning', bg: 'bg-warning' },
  description: { icon: FileText, color: 'text-accent-foreground', bg: 'bg-accent' },
  seen: { icon: Eye, color: 'text-muted-foreground', bg: 'bg-muted-foreground' },
  status: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success' },
};

export function PurchaseTimeline({ timeline }: PurchaseTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Clock className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Satın Alma Zaman Çizelgesi</h3>
          <p className="text-xs text-muted-foreground">İlan yaşam döngüsü</p>
        </div>
      </div>

      <div className="relative space-y-4 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
        {timeline.map((event, idx) => {
          const meta = TYPE_META[event.type] ?? TYPE_META.created;
          const Icon = meta.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="relative"
            >
              <span className={cn('absolute -left-[23px] top-1 h-3 w-3 rounded-full ring-2 ring-background', meta.bg)} />
              <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.color)} />
                <div>
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.date)} · {timeAgo(event.date)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
