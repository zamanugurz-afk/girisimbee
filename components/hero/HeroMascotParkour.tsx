'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { X, Pause, Play } from 'lucide-react';

interface HeroMascotParkourProps {
  cardRefs: React.RefObject<HTMLDivElement | null>[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

interface StepConfig {
  icon: string;
  text: string;
  action: 'normal' | 'slip' | 'ladder' | 'hero';
}

const STEPS: StepConfig[] = [
  {
    icon: '💼',
    text: 'Yeteneklerini gösterecek yeni bir iş mi arıyorsun?',
    action: 'normal',
  },
  {
    icon: '🤝',
    text: 'Düşüyordum! İşini mi devrediyorsun, ortak mı lazım?',
    action: 'slip',
  },
  {
    icon: '☕',
    text: 'Köprüyü kurduk! Hazır marka bayiliği ile büyü!',
    action: 'ladder',
  },
  {
    icon: '🔧',
    text: 'Elektrik ustası, tadilatçı veya mimar mı lazım?',
    action: 'hero',
  },
];

export function HeroMascotParkour({ cardRefs, containerRef, className }: HeroMascotParkourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shadowCoords, setShadowCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ladderState, setLadderState] = useState<{ show: boolean; x: number; y: number; width: number }>({
    show: false,
    x: 0,
    y: 0,
    width: 0,
  });
  const [isJumping, setIsJumping] = useState(false);
  const [isSlipping, setIsSlipping] = useState(false);
  const [speech, setSpeech] = useState<{ icon: string; text: string }>({
    icon: STEPS[0].icon,
    text: STEPS[0].text,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate coordinates relative to container
  const updatePosition = useCallback((stepIndex: number) => {
    const cardEl = cardRefs[stepIndex]?.current;
    const containerEl = containerRef.current;
    if (!cardEl || !containerEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    const targetX = cardRect.left - containerRect.left + cardRect.width / 2 - 44;
    const targetY = cardRect.top - containerRect.top - 88;

    const step = STEPS[stepIndex];

    // Special Ladder Transition (Card 1 to Card 2)
    if (step.action === 'ladder') {
      const card1 = cardRefs[1]?.current;
      const card2 = cardRefs[2]?.current;
      if (card1 && card2) {
        const r1 = card1.getBoundingClientRect();
        const r2 = card2.getBoundingClientRect();

        const bridgeX = r1.right - containerRect.left;
        const bridgeWidth = r2.left - r1.right;
        const bridgeY = r1.top - containerRect.top + 42;

        setLadderState({
          show: true,
          x: bridgeX - 8,
          y: bridgeY,
          width: Math.max(bridgeWidth + 16, 50),
        });

        setSpeech({
          icon: '🪜',
          text: 'Dur, araya köprü merdiven koyuyorum!',
        });

        // Walk to ladder center
        setIsJumping(true);
        setTimeout(() => {
          setCoords({
            x: bridgeX + bridgeWidth / 2 - 44,
            y: bridgeY - 96,
          });
          setShadowCoords({
            x: bridgeX + bridgeWidth / 2 - 24,
            y: bridgeY - 8,
          });
        }, 200);

        // Then cross to target card
        setTimeout(() => {
          setCoords({ x: targetX, y: targetY });
          setShadowCoords({ x: targetX + 16, y: targetY + 98 });
          setIsJumping(false);
          setSpeech({ icon: step.icon, text: step.text });

          setTimeout(() => {
            setLadderState((prev) => ({ ...prev, show: false }));
          }, 700);
        }, 850);

        return;
      }
    }

    // Normal or Slip jump
    setLadderState((prev) => ({ ...prev, show: false }));
    setIsJumping(true);
    setIsSlipping(false);

    // Jump arc
    setTimeout(() => {
      setCoords({ x: targetX, y: targetY });
      setShadowCoords({ x: targetX + 16, y: targetY + 98 });

      if (step.action === 'slip') {
        setIsSlipping(true);
        setSpeech({
          icon: '😱',
          text: 'Düşüyordum! İşini mi devrediyorsun, ortak mı lazım?',
        });

        setTimeout(() => {
          setIsSlipping(false);
          setSpeech({ icon: step.icon, text: step.text });
        }, 750);
      } else {
        setSpeech({ icon: step.icon, text: step.text });
      }
    }, 150);

    // Landing
    setTimeout(() => {
      setIsJumping(false);
    }, 700);
  }, [cardRefs, containerRef]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = (prev + 1) % STEPS.length;
      updatePosition(next);
      return next;
    });
  }, [updatePosition]);

  // Handle Autoplay Loop
  useEffect(() => {
    if (!isPlaying || !isVisible) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextStep();
    }, 4200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isVisible, nextStep]);

  // Initial positioning & Resize Listener
  useEffect(() => {
    const handleResize = () => {
      updatePosition(currentStep);
    };

    const timer = setTimeout(() => {
      updatePosition(0);
    }, 400);

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStep, updatePosition]);

  if (!isVisible) return null;

  return (
    <div className={cn('hidden md:block pointer-events-none relative z-30 select-none', className)}>
      {/* ================= ANIMATED LADDER BRIDGE ================= */}
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
            {/* Label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-amber-500 text-[8.5px] font-black text-slate-950 whitespace-nowrap shadow-xs">
              🪜 KÖPRÜ
            </div>
          </div>
        </div>
      )}

      {/* ================= 3D TRANSPARENT MASCOT CHARACTER ================= */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: isJumping ? 'translateY(-40px) scale(1.08)' : 'translateY(0px) scale(1)',
        }}
      >
        {/* Speech Bubble */}
        <div
          className={cn(
            'absolute -top-13 left-1/2 -translate-x-1/2 min-w-[210px] max-w-[260px] pointer-events-auto',
            'bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900',
            'px-3 py-1.5 rounded-2xl shadow-xl border border-slate-700/80 dark:border-slate-200/80',
            'text-[11.5px] font-bold text-center transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap backdrop-blur-md'
          )}
        >
          <span className="text-sm shrink-0">{speech.icon}</span>
          <span className="truncate">{speech.text}</span>
          
          {/* Pause/Play and Close controls */}
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700 dark:border-slate-300">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-0.5 rounded-full hover:bg-white/20 dark:hover:bg-slate-900/20 text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors"
              title={isPlaying ? 'Durdur' : 'Oynat'}
            >
              {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="p-0.5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Karakteri Gizle"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Bubble Arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900/95 dark:bg-white/95 rotate-45 border-r border-b border-slate-700/80 dark:border-slate-200/80" />
        </div>

        {/* 3D Cut-out Image Body */}
        <div
          className={cn(
            'relative w-22 h-28 flex items-end justify-center transition-transform duration-300',
            isSlipping && 'rotate-[22deg] translate-y-3',
            !isJumping && !isSlipping && 'animate-pulse'
          )}
        >
          {/* Sweat drop on slip */}
          {isSlipping && (
            <span className="absolute top-1 right-2 text-base font-black animate-bounce z-40">
              💦
            </span>
          )}

          <Image
            src="/images/mascot-3d.png"
            alt="Girişimbee 3D Karakter"
            width={88}
            height={112}
            className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.22)] select-none pointer-events-none"
            priority
          />
        </div>
      </div>

      {/* Ground Contact Shadow */}
      <div
        className="absolute z-20 w-13 h-2.5 bg-black/30 dark:bg-black/50 rounded-full blur-[2px] transition-all duration-700 ease-out pointer-events-none"
        style={{
          left: `${shadowCoords.x}px`,
          top: `${shadowCoords.y}px`,
          opacity: isJumping ? 0.15 : 0.45,
          transform: isJumping ? 'scale(0.5)' : 'scale(1)',
        }}
      />
    </div>
  );
}

export default HeroMascotParkour;
