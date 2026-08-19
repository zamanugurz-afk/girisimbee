'use client';

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

interface ListingLivePreviewContainerProps {
  children: React.ReactNode;
  canonicalWidth?: number;
  fixedHeight?: number;
  minScale?: number;
}

export function ListingLivePreviewContainer({
  children,
  canonicalWidth = 520,
  fixedHeight = 440,
  minScale = 0.25,
}: ListingLivePreviewContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  const calculateScale = () => {
    if (!containerRef.current || !contentRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const currentContentHeight = contentRef.current.scrollHeight;

    if (containerWidth <= 0 || currentContentHeight <= 0) return;

    const scaleX = containerWidth / canonicalWidth;
    const scaleY = fixedHeight / currentContentHeight;

    let finalScale = Math.min(scaleX, scaleY, 1.0);
    finalScale = Math.max(minScale, finalScale);
    setScale(finalScale);
  };

  useLayoutEffect(() => {
    calculateScale();
  });

  useEffect(() => {
    calculateScale();

    const handleResize = () => {
      calculateScale();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [canonicalWidth, fixedHeight, minScale]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden flex flex-col items-center justify-start rounded-xl"
      style={{
        height: `${fixedHeight}px`,
        minHeight: `${fixedHeight}px`,
        maxHeight: `${fixedHeight}px`,
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: `${canonicalWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className="pointer-events-none select-none shrink-0"
      >
        {children}
      </div>
    </div>
  );
}
