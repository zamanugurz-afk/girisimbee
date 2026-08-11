import { BRAND_TAGLINE, BRAND_TAGLINE_HIGHLIGHT } from '@/features/shared/constants/brand';
import { cn } from '@/lib/utils';

interface BrandTaglineProps {
  className?: string;
  /** Use for hero-scale typography */
  size?: 'sm' | 'md' | 'lg' | 'hero';
  as?: 'p' | 'span' | 'h1' | 'h2';
}

const SIZE_CLASSES = {
  sm: 'text-gc-sm',
  md: 'text-gc-md',
  lg: 'text-gc-lg sm:text-gc-xl',
  hero: 'text-gc-2xl font-semibold leading-[1.15] tracking-tight sm:text-[2.25rem] lg:text-[2.5rem]',
} as const;

export function BrandTagline({
  className,
  size = 'md',
  as: Tag = 'p',
}: BrandTaglineProps) {
  const [before, after] = BRAND_TAGLINE.split(BRAND_TAGLINE_HIGHLIGHT);

  return (
    <Tag className={cn('text-[#0F172A]', SIZE_CLASSES[size], className)}>
      {before}
      <span className="text-[#F59E0B] font-semibold">{BRAND_TAGLINE_HIGHLIGHT}</span>
      {after}
    </Tag>
  );
}
