'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BRAND_SYMBOL_SRC, BRAND_SYMBOL_DARK_SRC } from '@/components/girisimco/brand-mark.constants';

export { BRAND_SYMBOL_SRC, BRAND_SYMBOL_DARK_SRC };

export function BrandMarkSlot({
  className,
  size = 40,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Light Mode Symbol (Transparent Background, Dark G) */}
      <Image
        src={BRAND_SYMBOL_SRC}
        alt=""
        width={size * 2}
        height={size * 2}
        className="h-full w-full object-contain object-center transition-all duration-200 dark:hidden"
        priority={priority}
      />

      {/* Dark Mode Symbol (Transparent Background, Crisp White G & Golden Glow) */}
      <Image
        src={BRAND_SYMBOL_DARK_SRC}
        alt=""
        width={size * 2}
        height={size * 2}
        className="hidden h-full w-full object-contain object-center transition-all duration-200 dark:block dark:drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]"
        priority={priority}
      />
    </span>
  );
}
