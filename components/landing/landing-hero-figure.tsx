'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const BOOK = {
  open: '/images/harumi-book-open-eye.png',
  close: '/images/harumi-book-close-eye.png',
} as const;

const HAND = {
  open: '/images/harumi-hand-open-eye.png',
  close: '/images/harumi-hand-close-eye.png',
} as const;

/** Fixed layout slots (w/h) — generous enough that both open/close frames fit with object-contain without shifting layout */
const SLOT = {
  book: { w: 660, h: 920 },
  hand: { w: 640, h: 760 },
} as const;

type Props = {
  /** Full-body book pose vs waist-up hand pose */
  pose: 'book' | 'hand';
  /** `hero` = larger art for the first screen (#hero) */
  size?: 'default' | 'hero';
  /** Swap open/close eye frames on a timer */
  blink?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Harumi character with optional blink (open/close eye assets) + pointer parallax.
 * Blink uses stacked images + opacity in a fixed aspect-ratio slot to avoid layout jump when PNG sizes differ.
 */
export function LandingHeroFigure({
  pose,
  size = 'default',
  blink = true,
  className,
  priority,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [eyesClosed, setEyesClosed] = useState(false);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pair = pose === 'book' ? BOOK : HAND;
  const slot = SLOT[pose === 'book' ? 'book' : 'hand'];

  useEffect(() => {
    if (!blink) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;

    const clearTimers = () => {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
        waitTimerRef.current = null;
      }
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
        blinkTimerRef.current = null;
      }
    };

    const scheduleNext = () => {
      clearTimers();
      const delay = 1200 + Math.random() * 4200;
      waitTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        setEyesClosed(true);
        blinkTimerRef.current = setTimeout(() => {
          if (cancelled) return;
          setEyesClosed(false);
          scheduleNext();
        }, 130);
      }, delay);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [blink, pose]);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: px, y: py });
  }, []);

  const onLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  const transform =
    tilt.x === 0 && tilt.y === 0
      ? undefined
      : `translate3d(${tilt.x * 14}px, ${tilt.y * 10}px, 0) rotateY(${tilt.x * 8}deg) rotateX(${-tilt.y * 5}deg)`;

  const innerMax =
    size === 'hero'
      ? 'max-w-[min(100%,460px)] sm:max-w-[min(100%,480px)] lg:max-w-[min(100%,550px)]'
      : 'max-w-[min(100%,420px)] lg:max-w-[min(100%,480px)]';

  const heroScale = size === 'hero' ? 'scale-100 sm:scale-[1.02] lg:scale-[1.05]' : '';

  const imgClass =
    'object-contain object-bottom drop-shadow-[0_28px_60px_rgba(91,33,182,0.22)] pointer-events-none';

  return (
    <div
      ref={wrapRef}
      className={cn('relative flex w-full min-w-0 select-none items-end justify-center', className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className={cn('relative w-full min-w-0 origin-bottom', innerMax, heroScale)}>
        <div
          className="will-change-transform motion-reduce:transform-none"
          style={{
            transform,
            transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.35s ease-out' : 'transform 0.08s ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          {/*
            Reserve height with padding-bottom (% of width) so fill images always have a real box
            (aspect-ratio + fill was collapsing to 0 height in some flex/grid layouts).
          */}
          <div
            className="relative w-full"
            style={{ paddingBottom: `${(slot.h / slot.w) * 100}%` }}
          >
            <div className="absolute inset-0">
              <span className="sr-only">Harumi, JLPT N2 study companion</span>
              {blink ? (
                <>
                  <Image
                    src={pair.open}
                    alt=""
                    fill
                    priority={priority}
                    sizes="(max-width: 1024px) 92vw, 620px"
                    className={cn(
                      imgClass,
                      'z-0 transition-opacity duration-75',
                      eyesClosed ? 'opacity-0' : 'opacity-100'
                    )}
                  />
                  <Image
                    src={pair.close}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 92vw, 620px"
                    className={cn(
                      imgClass,
                      'z-[1] transition-opacity duration-75',
                      eyesClosed ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </>
              ) : (
                <Image
                  src={pair.open}
                  alt=""
                  fill
                  priority={priority}
                  sizes="(max-width: 1024px) 92vw, 620px"
                  className={imgClass}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
