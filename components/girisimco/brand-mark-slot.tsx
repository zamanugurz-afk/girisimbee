import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Official Girisimbee mark — bee + G (`public/brand/girisimbee-symbol.png`). */
export const BRAND_SYMBOL_SRC = '/brand/girisimbee-symbol.png';

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
      <Image
        src={BRAND_SYMBOL_SRC}
        alt=""
        width={size * 2}
        height={size * 2}
        className="h-full w-full object-contain object-center"
        priority={priority}
      />
    </span>
  );
}
