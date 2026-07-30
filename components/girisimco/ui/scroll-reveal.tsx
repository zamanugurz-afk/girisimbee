'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article';
  /** Skip enter animation — use for above-the-fold content on route entry. */
  immediate?: boolean;
}

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  immediate = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);

  useLayoutEffect(() => {
    if (immediate) return;

    const el = ref.current;
    if (!el) return;

    if (isInViewport(el)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <Tag
      ref={ref}
      className={cn(
        immediate ? 'gc-reveal-instant' : 'gc-reveal',
        !immediate && visible && 'gc-reveal-visible',
        className,
      )}
      style={immediate ? undefined : { transitionDelay: `${Math.min(delay, 80)}ms` }}
    >
      {children}
    </Tag>
  );
}
