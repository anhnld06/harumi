'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

const HANDBOOK_URL = process.env.NEXT_PUBLIC_JAPANESE_HANDBOOK_URL?.trim() ?? '';

export function JapaneseHandbookFab() {
  const { t } = useLanguage();
  const [labelVisible, setLabelVisible] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLabelVisible((v) => !v);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  if (!HANDBOOK_URL) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <div className="relative">
        <span
          className={cn(
            'pointer-events-none absolute bottom-3/4 right-full z-10 mr-1 w-max max-w-[11rem] origin-bottom-right rounded-md bg-zinc-900 px-2 py-0.5 text-center text-[11px] font-medium leading-tight text-zinc-50 shadow-sm ring-1 ring-white/15 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-black/10 transition-opacity duration-300',
            labelVisible ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={!labelVisible}
        >
          {t('handbook.fabLabel')}
        </span>
        <a
          href={HANDBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block bg-transparent leading-none outline-none transition-[transform,filter] duration-200 hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={t('handbook.fabLabel')}
        >
          <Image
            src="/images/icon-link.png"
            alt=""
            width={80}
            height={80}
            className="h-26 w-26 object-contain [filter:drop-shadow(0_6px_10px_rgb(0_0_0_/0.22))] transition-[filter] duration-200 group-hover:[filter:drop-shadow(0_10px_18px_rgb(0_0_0_/0.28))] dark:[filter:drop-shadow(0_8px_16px_rgb(0_0_0_/0.5))] dark:group-hover:[filter:drop-shadow(0_12px_22px_rgb(0_0_0_/0.55))]"
            priority={false}
          />
        </a>
      </div>
    </div>
  );
}
