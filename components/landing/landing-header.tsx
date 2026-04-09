'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export type LandingNavItem = { readonly href: string; readonly label: string };

type Props = {
  links: readonly LandingNavItem[];
};

/**
 * Transparent over hero (seamless with background); frosted bar after scrolling past hero.
 */
export function LandingHeader({ links }: Props) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      setPastHero(window.scrollY > vh * 0.72);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300',
        pastHero
          ? 'border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur-md supports-[backdrop-filter]:bg-white/80'
          : 'border-b border-transparent bg-transparent shadow-none'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo
          href="#hero"
          height={30}
          width={120}
          priority
          className={cn('shrink-0 transition-[filter]', !pastHero && 'drop-shadow-[0_1px_8px_rgba(255,255,255,0.85)]')}
        />
        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center lg:gap-1 [&::-webkit-scrollbar]:hidden"
          aria-label="On this page"
        >
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={cn(
                'whitespace-nowrap rounded-lg px-2 py-2 text-xs transition sm:px-3 sm:text-sm',
                pastHero
                  ? 'font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'font-semibold text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] hover:bg-white/25 hover:text-slate-950'
              )}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className={cn(
                pastHero
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'font-medium text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] hover:bg-white/30 hover:text-slate-950'
              )}
            >
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button
              className={cn(
                'rounded-full px-4 sm:px-5',
                pastHero
                  ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                  : 'bg-white text-slate-900 shadow-md shadow-slate-900/15 ring-1 ring-white/60 hover:bg-slate-50'
              )}
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
