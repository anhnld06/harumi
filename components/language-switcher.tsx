'use client';

import { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronUp } from 'lucide-react';
import { useLanguage, locales } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = locales.find((l) => l.value === locale) ?? locales[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
      >
        <Languages className="h-4 w-4 text-muted-foreground" />
        <span>{current.label}</span>
        <ChevronUp
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-background py-2 shadow-lg">
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Languages className="h-3.5 w-3.5" />
              NGÔN NGỮ / LANGUAGE
            </div>
          </div>
          {locales.map((loc) => (
            <button
              key={loc.value}
              type="button"
              onClick={() => {
                setLocale(loc.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors',
                locale === loc.value
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'hover:bg-accent'
              )}
            >
              <span>{loc.label}</span>
              {locale === loc.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
