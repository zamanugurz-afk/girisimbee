import {
  BarChart3,
  Bot,
  Brain,
  Languages,
  Layers,
  MessageSquare,
  Plug,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { DigitalAiCapabilityIcon } from '@/features/listings/config/digital-ai-capabilities';
import { cn } from '@/lib/utils';

export const DIGITAL_AI_ICON_MAP: Record<DigitalAiCapabilityIcon, LucideIcon> = {
  Bot,
  Sparkles,
  Workflow,
  BarChart3,
  Plug,
  ShieldCheck,
  Languages,
  Layers,
  MessageSquare,
  Brain,
};

export const DIGITAL_AI_ACCENT = '#7C6CF0';
export const DIGITAL_AI_ACCENT_SOFT = 'rgba(124, 108, 240, 0.12)';

export function DigitalAiCapabilityIconBadge({
  icon,
  className,
  size = 'md',
}: {
  icon: DigitalAiCapabilityIcon;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const Icon = DIGITAL_AI_ICON_MAP[icon];
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-xl',
        size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
        className,
      )}
      style={{ backgroundColor: DIGITAL_AI_ACCENT_SOFT, color: DIGITAL_AI_ACCENT }}
      aria-hidden
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={1.75} />
    </span>
  );
}
