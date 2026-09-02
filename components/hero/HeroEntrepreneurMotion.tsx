'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface HeroEntrepreneurMotionProps {
  cardRefs: React.RefObject<HTMLDivElement | null>[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

type MotionMode = 'walk' | 'jog' | 'ladder' | 'jump';

interface MotionStep {
  mode: MotionMode;
  durationMs: number;
}

const STEPS: MotionStep[] = [
  { mode: 'walk', durationMs: 4000 },
  { mode: 'jog', durationMs: 3800 },
  { mode: 'ladder', durationMs: 4200 },
  { mode: 'jump', durationMs: 4000 },
];

export function HeroEntrepreneurMotion({
  cardRefs,
  containerRef,
  className,
}: HeroEntrepreneurMotionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shadowCoords, setShadowCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ladderState, setLadderState] = useState<{ show: boolean; x: number; y: number; width: number }>({
    show: false,
    x: 0,
    y: 0,
    width: 0,
  });
  const [isJumping, setIsJumping] = useState(false);
  const [currentMode, setCurrentMode] = useState<MotionMode>('walk');
  const [isReady, setIsReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const walkImgRef = useRef<HTMLImageElement | null>(null);
  const jumpImgRef = useRef<HTMLImageElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to draw clean transparent 3D character onto canvas
  const drawCharacter = useCallback((img: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create temporary buffer canvas for chroma-keying pure white background
    const offCanvas = document.createElement('canvas');
    offCanvas.width = img.naturalWidth;
    offCanvas.height = img.naturalHeight;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    offCtx.drawImage(img, 0, 0);

    try {
      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // Transparent
        } else if (r > 220 && g > 220 && b > 220) {
          data[i + 3] = Math.floor((255 - (r + g + b) / 3) * 4); // Soft antialias edge
        }
      }
      offCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
    } catch {
      // Fallback: draw directly if cross-origin image manipulation fails
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Update position and motion states based on card index
  const updateMotion = useCallback(
    (stepIndex: number) => {
      const cardEl = cardRefs[stepIndex]?.current;
      const containerEl = containerRef.current;
      if (!cardEl || !containerEl) return;

      const cardRect = cardEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      if (cardRect.width === 0 || containerRect.width === 0) return;

      const targetX = cardRect.left - containerRect.left + cardRect.width / 2 - 56;
      const targetY = cardRect.top - containerRect.top - 116;

      const step = STEPS[stepIndex];
      setCurrentMode(step.mode);

      // ================= 1. LADDER BRIDGE TRANSITION =================
      if (step.mode === 'ladder') {
        const card1 = cardRefs[1]?.current;
        const card2 = cardRefs[2]?.current;
        if (card1 && card2) {
          const r1 = card1.getBoundingClientRect();
          const r2 = card2.getBoundingClientRect();

          const bridgeX = r1.right - containerRect.left;
          const bridgeWidth = r2.left - r1.right;
          const bridgeY = r1.top - containerRect.top + 60;

          setLadderState({
            show: true,
            x: bridgeX - 10,
            y: bridgeY,
            width: Math.max(bridgeWidth + 20, 50),
          });

          drawCharacter(walkImgRef.current);

          // Step A: Walk across to ladder
          setTimeout(() => {
            setCoords({
              x: bridgeX + bridgeWidth / 2 - 56,
              y: bridgeY - 110,
            });
            setShadowCoords({
              x: bridgeX + bridgeWidth / 2 - 30,
              y: bridgeY - 6,
            });
          }, 250);

          // Step B: Step across onto target card
          setTimeout(() => {
            setCoords({ x: targetX, y: targetY });
            setShadowCoords({ x: targetX + 24, y: targetY + 130 });
            setIsReady(true);

            setTimeout(() => {
              setLadderState((prev) => ({ ...prev, show: false }));
            }, 750);
          }, 850);

          return;
        }
      }

      setLadderState((prev) => ({ ...prev, show: false }));

      // ================= 2. JUMP ACTION =================
      if (step.mode === 'jump') {
        drawCharacter(jumpImgRef.current);
        setIsJumping(true);

        setTimeout(() => {
          setCoords({ x: targetX, y: targetY });
          setShadowCoords({ x: targetX + 24, y: targetY + 130 });
          setIsReady(true);
        }, 150);

        // Landing
        setTimeout(() => {
          setIsJumping(false);
          drawCharacter(walkImgRef.current);
        }, 750);

        return;
      }

      // ================= 3. WALK / JOG =================
      drawCharacter(walkImgRef.current);
      setIsJumping(false);
      setCoords({ x: targetX, y: targetY });
      setShadowCoords({ x: targetX + 24, y: targetY + 130 });
      setIsReady(true);
    },
    [cardRefs, containerRef, drawCharacter]
  );

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = (prev + 1) % STEPS.length;
      updateMotion(next);
      return next;
    });
  }, [updateMotion]);

  // Load images and initialize
  useEffect(() => {
    const walkImg = new window.Image();
    walkImg.src = '/images/entrepreneur-walk.jpg';
    walkImg.onload = () => {
      walkImgRef.current = walkImg;
      drawCharacter(walkImg);
    };

    const jumpImg = new window.Image();
    jumpImg.src = '/images/entrepreneur-jump.jpg';
    jumpImg.onload = () => {
      jumpImgRef.current = jumpImg;
    };

    // Auto-loop
    const interval = setInterval(() => {
      nextStep();
    }, 4000);
    timerRef.current = interval;

    // Measurement retries after mount
    const t1 = setTimeout(() => updateMotion(0), 150);
    const t2 = setTimeout(() => updateMotion(0), 500);
    const t3 = setTimeout(() => updateMotion(0), 1000);

    const handleResize = () => updateMotion(currentStepIndex);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStepIndex, drawCharacter, nextStep, updateMotion]);

  return (
    <div className={cn('hidden md:block pointer-events-none relative z-30 select-none', className)}>
      {/* ================= 1. ANIMATED LADDER BRIDGE ================= */}
      {ladderState.show && (
        <div
          className="absolute z-25 pointer-events-none animate-in fade-in zoom-in-90 duration-300"
          style={{
            left: `${ladderState.x}px`,
            top: `${ladderState.y}px`,
            width: `${ladderState.width}px`,
          }}
        >
          <div className="w-full h-7 bg-amber-800/90 dark:bg-amber-900/90 rounded-md border-2 border-amber-500 shadow-xl flex items-center justify-around px-1 relative overflow-hidden">
            <div className="w-1.5 h-full bg-amber-400 rounded-xs" />
            <div className="w-1.5 h-full bg-amber-400 rounded-xs" />
            <div className="w-1.5 h-full bg-amber-400 rounded-xs" />
            <div className="w-1.5 h-full bg-amber-400 rounded-xs" />
            <div className="w-1.5 h-full bg-amber-400 rounded-xs" />
          </div>
        </div>
      )}

      {/* ================= 2. 3D MIDDLE-AGED ENTREPRENEUR ================= */}
      <div
        className={cn(
          'absolute z-30 transition-all duration-800 ease-out',
          isReady ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: isJumping ? 'translateY(-55px) scale(1.08)' : 'translateY(0px) scale(1)',
        }}
      >
        {/* Character Motion Rig Container */}
        <div
          className={cn(
            'relative w-28 h-36 flex items-end justify-center',
            currentMode === 'walk' && 'animate-natural-walk',
            currentMode === 'jog' && 'animate-natural-jog',
            currentMode === 'ladder' && 'animate-natural-ladder'
          )}
        >
          <canvas
            ref={canvasRef}
            width={220}
            height={280}
            className="w-full h-full object-contain filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.20)] select-none pointer-events-none"
          />
        </div>
      </div>

      {/* ================= 3. CONTACT GROUND SHADOW ================= */}
      <div
        className={cn(
          'absolute z-20 w-16 h-3 bg-black/35 dark:bg-black/55 rounded-full blur-[2px] transition-all duration-800 ease-out pointer-events-none',
          isReady ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          left: `${shadowCoords.x}px`,
          top: `${shadowCoords.y}px`,
          opacity: isJumping ? 0.15 : 0.45,
          transform: isJumping ? 'scale(0.5)' : 'scale(1)',
        }}
      />

      <style jsx global>{`
        @keyframes naturalWalkCycle {
          0% { transform: translateY(0px) rotate(0deg) scale(1, 1); }
          25% { transform: translateY(-4px) rotate(-1.5deg) scale(0.98, 1.02); }
          50% { transform: translateY(0px) rotate(0deg) scale(1, 0.98); }
          75% { transform: translateY(-4px) rotate(1.5deg) scale(0.98, 1.02); }
          100% { transform: translateY(0px) rotate(0deg) scale(1, 1); }
        }

        @keyframes naturalJogCycle {
          0% { transform: translateY(0px) rotate(3deg) scale(1, 1); }
          25% { transform: translateY(-8px) rotate(1deg) scale(0.97, 1.03); }
          50% { transform: translateY(0px) rotate(4deg) scale(1.02, 0.96); }
          75% { transform: translateY(-8px) rotate(2deg) scale(0.97, 1.03); }
          100% { transform: translateY(0px) rotate(3deg) scale(1, 1); }
        }

        @keyframes naturalLadderCycle {
          0% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-3px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(-2deg); }
        }

        .animate-natural-walk {
          animation: naturalWalkCycle 1.1s ease-in-out infinite;
        }
        .animate-natural-jog {
          animation: naturalJogCycle 0.65s ease-in-out infinite;
        }
        .animate-natural-ladder {
          animation: naturalLadderCycle 0.45s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default HeroEntrepreneurMotion;
