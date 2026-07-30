/**
 * Girisimco Design System — UI primitives
 * Import from here for consistent marketplace components.
 */

export { GcTag, tagVariants, type GcTagProps } from '@/components/girisimco/ui/gc-tag';
export { GcBadge, badgeVariants as gcBadgeVariants, type GcBadgeProps } from '@/components/girisimco/ui/gc-badge';
export { GcEmptyState, GcIcon } from '@/components/girisimco/ui/gc-empty-state';
export { GcSkeleton, GcSkeletonText } from '@/components/girisimco/ui/gc-skeleton';
export { GcPageTransition } from '@/components/girisimco/ui/gc-page-transition';
export { GcPageShell } from '@/components/girisimco/ui/gc-page-shell';
export { ScrollReveal } from '@/components/girisimco/ui/scroll-reveal';
export { ListingCardSkeleton, ListingFeedSkeleton } from '@/components/girisimco/ui/listing-card-skeleton';

/* Re-export tokens for convenience in components */
export {
  gcClasses,
  gcIconSize,
  gcPagePadding,
  gcPageMaxWidth,
  gcHeaderHeight,
  getCategoryColor,
  GC_ACCENT,
} from '@/lib/design-system';

/* Shadcn primitives aligned to the design system */
export { Button, buttonVariants } from '@/components/ui/button';
export { Input } from '@/components/ui/input';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
export { Skeleton } from '@/components/ui/skeleton';
