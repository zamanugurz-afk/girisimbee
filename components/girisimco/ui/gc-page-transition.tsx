'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GcPageTransitionProps {
  children: ReactNode;
  className?: string;
}

/** Subtle fade-up on route change — wrap page content once per view. */
export function GcPageTransition({ children, className }: GcPageTransitionProps) {
  return <div className={cn(className)}>{children}</div>;
}
