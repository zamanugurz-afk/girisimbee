import type { ReactNode } from 'react';
import { isPremiumEnabled } from '@/features/shared';

/** Renders children only when ENABLE_PREMIUM is true. */
export function PremiumGate({ children }: { children: ReactNode }) {
  if (!isPremiumEnabled()) return null;
  return <>{children}</>;
}
