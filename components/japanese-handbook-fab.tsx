'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

const HANDBOOK_URL = process.env.NEXT_PUBLIC_JAPANESE_HANDBOOK_URL?.trim() ?? '';

/** Home + auth screens — no FAB */
const FAB_HIDDEN_PATH_PREFIXES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const;

function isFabHiddenPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return FAB_HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function JapaneseHandbookFab() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (!HANDBOOK_URL || isFabHiddenPath(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <a
        href={HANDBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-1 bg-transparent leading-none outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={t('handbook.fabLabel')}
      >
        <span
          className={cn(
            'relative inline-block origin-bottom will-change-transform',
            'motion-safe:animate-handbookFabFloat motion-reduce:animate-none',
            'transition-transform duration-300 ease-out',
            'group-hover:scale-[1.08] group-hover:[animation-play-state:paused]',
            'group-focus-visible:scale-[1.08] group-focus-visible:[animation-play-state:paused]',
          )}
        >
          <Image
            src="/images/icon-link.png"
            alt=""
            width={80}
            height={80}
            className={cn(
              'h-26 w-26 object-contain',
              'transition-[filter] duration-300',
              '[filter:drop-shadow(0_6px_10px_rgb(0_0_0_/0.22))]',
              'group-hover:[filter:drop-shadow(0_12px_22px_rgb(0_0_0_/0.3))_drop-shadow(0_0_18px_rgb(139_92_246_/0.4))]',
              'dark:[filter:drop-shadow(0_8px_16px_rgb(0_0_0_/0.5))]',
              'dark:group-hover:[filter:drop-shadow(0_14px_26px_rgb(0_0_0_/0.55))_drop-shadow(0_0_22px_rgb(167_139_250_/0.38))]',
            )}
            priority={false}
          />
        </span>
        <span
          className={cn(
            'max-w-[8.5rem] text-balance text-center text-[12px] font-bold leading-snug text-white italic',
            '[text-shadow:0_0_1px_#6b21a8,0_0_2px_#581c87,0_0_3px_#4c1d95,0_1px_2px_rgb(0_0_0/0.35)]',
            '[-webkit-text-stroke:0.5px_#4c1d95]',
            'dark:[text-shadow:0_0_1px_#c084fc,0_0_2px_#a855f7,0_0_3px_#9333ea,0_1px_2px_rgb(0_0_0/0.45)]',
            'dark:[-webkit-text-stroke:0.5px_#7e22ce]',
          )}
        >
          {t('handbook.fabLabel')}
        </span>
      </a>
    </div>
  );
}
