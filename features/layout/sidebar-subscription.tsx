'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import { accountPlansHref } from '@/lib/payment/checkout-path';

interface SidebarSubscriptionProps {
  collapsed?: boolean;
  used?: number;
  limit?: number;
  /** When true, no top border (parent SidebarUser owns the divider). */
  embedded?: boolean;
}

export function SidebarSubscription({
  collapsed = false,
  used = 4,
  limit = 10000,
  embedded = false,
}: SidebarSubscriptionProps) {
  const { t } = useLanguage();
  const progress = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  if (collapsed) {
    return (
      <Link
        href={accountPlansHref}
        className={cn(
          'flex items-center justify-center transition-colors hover:bg-accent/50',
          embedded ? 'px-2 pb-2 pt-3' : 'border-t p-3'
        )}
        title={t('account.upgradePlan')}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      </Link>
    );
  }

  return (
    <div className={cn('space-y-3', embedded ? 'px-3 pt-3' : 'border-t p-3')}>
      <div className="rounded-lg border bg-background p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-bold uppercase text-blue-600 dark:text-blue-400">
            {t('account.free')}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('sidebar.monthlySpend')}</span>
            <span>
              {used.toLocaleString()} / {limit.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <Button
          asChild
          className="mt-3 w-full rounded-full bg-foreground font-semibold text-background hover:bg-foreground/90"
        >
          <Link
            href={accountPlansHref}
            className="flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {t('account.upgradePlan')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
