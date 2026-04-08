'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/lib/i18n/language-context';
import { accountPlansHref } from '@/lib/payment/checkout-path';
import { isFreePublicMockTestTitle } from '@/lib/mock-test/mock-test-access';
import { cn } from '@/lib/utils';

export type MockTestListRow = {
  id: string;
  title: string;
  lastAttempt: { score: number; totalScore: number } | null;
};

type Props = {
  tests: MockTestListRow[];
  canAccessFullTests: boolean;
};

export function MockTestListClient({ tests, canAccessFullTests }: Props) {
  const { t } = useLanguage();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        {tests.map((test) => {
          const isFree = isFreePublicMockTestTitle(test.title);
          const locked = !isFree && !canAccessFullTests;
          const hasLast = test.lastAttempt != null;

          if (locked) {
            return (
              <button
                key={test.id}
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border border-transparent px-4 py-3 text-left transition',
                  'bg-muted/80 text-muted-foreground hover:bg-muted'
                )}
              >
                <span className="font-semibold">{test.title}</span>
                <Lock className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            );
          }

          return (
            <div
              key={test.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4"
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <h3 className="font-semibold">{test.title}</h3>
                {hasLast && (
                  <span
                    className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums text-[#dc2626]"
                    style={{ backgroundColor: '#ffe4e6' }}
                  >
                    {test.lastAttempt!.score}/{test.lastAttempt!.totalScore}
                  </span>
                )}
              </div>
              <div className="ml-3 shrink-0">
                {hasLast ? (
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild>
                    <Link href={`/mock-test/${test.id}`}>{t('mockTest.result.retake')}</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/mock-test/${test.id}`}>{t('mockTest.list.start')}</Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('mockTest.list.fullLockedTitle')}</DialogTitle>
            <DialogDescription>{t('mockTest.list.fullLockedBody')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild>
              <Link href={accountPlansHref} onClick={() => setUpgradeOpen(false)}>
                {t('mockTest.result.upgradeNow')}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
