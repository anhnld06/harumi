'use client';

import { Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import { accountPlansHref } from '@/lib/payment/checkout-path';
import { HarumiChat } from './harumi-chat';

type Props = {
  canUsePremiumAi: boolean;
};

export function AiAssistantView({ canUsePremiumAi }: Props) {
  const { t } = useLanguage();

  if (canUsePremiumAi) {
    return <HarumiChat />;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('ai.title')}</h1>
          <p className="text-muted-foreground">{t('ai.description')}</p>
        </div>

        <div className="space-y-4">
          <Link href={accountPlansHref}>
            <Button size="lg" className="w-full gap-2 rounded-full px-8">
              <Zap className="h-4 w-4" />
              {t('ai.upgradeCta')}
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">{t('ai.trialNote')}</p>
        </div>
      </div>
    </div>
  );
}
