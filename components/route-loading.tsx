'use client';

import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

type RouteLoadingProps = {
  /** Inside dashboard main (sidebar visible) — compact vertical space */
  variant?: 'embedded' | 'fullscreen';
  className?: string;
};

/**
 * Shared route transition UI for Next.js `loading.tsx` and full-page fallbacks.
 * Embedded: `flex-1` fills dashboard main so spinner is vertically centered in the content column.
 */
export function RouteLoading({ variant = 'embedded', className }: RouteLoadingProps) {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex w-full flex-col items-center justify-center gap-4 py-12',
        variant === 'fullscreen'
          ? 'min-h-[85vh]'
          : 'min-h-0 flex-1',
        className
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    </div>
  );
}
