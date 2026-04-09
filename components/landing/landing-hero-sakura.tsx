'use client';

import { useEffect, useId, useState } from 'react';

type Petal = {
  left: number;
  top: number;
  rotate: number;
  scale: number;
  opacity: number;
};

function generatePetals(count: number): Petal[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    rotate: Math.random() * 360,
    scale: 0.45 + Math.random() * 0.55,
    opacity: 0.35 + Math.random() * 0.45,
  }));
}

/** Single stylized cherry blossom — inline SVG, no external asset */
function SakuraIcon({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const gradId = `sakuraGrad-${uid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbcfe8" />
          <stop offset="0.5" stopColor="#f9a8d4" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="3.2" fill="#fda4af" opacity="0.95" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="24"
          cy="12"
          rx="6.5"
          ry="10"
          fill={`url(#${gradId})`}
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  );
}

/**
 * Decorative sakura scattered in the hero. Positions randomize on client after mount.
 */
export function LandingHeroSakura() {
  const [petals, setPetals] = useState<Petal[] | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPetals(generatePetals(10));
      return;
    }
    setPetals(generatePetals(18));
  }, []);

  if (!petals?.length) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
          }}
        >
          <div
            className="motion-reduce:animate-none animate-landingSakuraFloat"
            style={{
              width: `${2.25 * p.scale}rem`,
              height: `${2.25 * p.scale}rem`,
              animationDelay: `${(i % 7) * 0.45}s`,
              animationDuration: `${6.5 + (i % 5) * 0.6}s`,
            }}
          >
            <SakuraIcon className="h-full w-full drop-shadow-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
