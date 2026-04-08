'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Zap,
  Plus,
  Clock,
  Sparkles,
  Database,
  Shield,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n/language-context';
import { checkoutHref } from '@/lib/payment/checkout-path';

export function AccountOverview() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const creditBalance = session?.user?.creditBalance ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {/* Left Column - 2 blocks */}
      <div className="space-y-4">
        {/* Block 1: Current Plan & Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              {t('account.currentPlan')}: {t('account.free')}
            </CardTitle>
            <Button size="sm" asChild>
              <Link href="#plans">
                {t('account.upgrade')}
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1 text-2xl font-bold">0.0%</p>
              <p className="text-sm text-muted-foreground">{t('account.totalSpending')}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span>4 {t('account.used')}</span>
                <span className="text-muted-foreground">{t('account.remaining')}: 9,996</span>
              </div>
              <Progress value={0.04} className="mt-1 h-2" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-center text-[10px] font-medium uppercase leading-tight text-muted-foreground">
                  {t('account.statVocab')}
                </span>
                <span className="text-lg font-semibold">—</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <span className="text-center text-[10px] font-medium uppercase leading-tight text-muted-foreground">
                  {t('account.statCredits')}
                </span>
                <span className="text-lg font-semibold">{creditBalance.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <span className="text-center text-[10px] font-medium uppercase leading-tight text-muted-foreground">
                  {t('account.statMocks')}
                </span>
                <span className="text-lg font-semibold">—</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Block 2: Credit Purchase */}
        <Card className="relative overflow-hidden">
          <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            -41%
          </span>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </span>
              {t('account.buyCredits')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg text-muted-foreground line-through">49.000 VND</span>
              <span className="text-2xl font-bold">29.000 VND</span>
            </div>
            <p className="text-sm text-green-600 font-medium">{t('account.saveAmount')} 20.000 VND</p>
            <Button className="w-full" asChild>
              <Link href={checkoutHref('credits')}>
                {t('account.buyNow')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Block 3: Upgrade Plan (anchor for /account#plans) */}
      <div id="plans" className="scroll-mt-24 space-y-3">
        <Card className="overflow-hidden">
          <div className="rounded-t-lg bg-red-500 px-4 py-2 text-center text-sm font-semibold text-white">
            {t('account.specialOffer')}
          </div>
          <CardHeader className="pt-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              {t('account.upgradePlan')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pro Plan */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                {t('account.popular')}
              </span>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-muted-foreground line-through">199.000 VND</span>
                <span className="text-2xl font-bold">99.000 VND</span>
              </div>
              <p className="mb-4 text-sm text-green-600 font-medium">{t('account.saveAmount')} 100.000 VND</p>
              <ul className="mb-4 space-y-2">
                {[
                  'account.featureCredits',
                  'account.featureHours',
                  'account.featureRecording',
                  'account.featureSummary',
                  'account.featureAiQa',
                ].map((key) => (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-green-600" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full gap-1" asChild>
                <Link href={checkoutHref('pro')} className="flex items-center justify-center gap-1">
                  {t('account.upgrade')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Pro Max Plan */}
            <div className="rounded-lg border p-4">
              <span className="mb-2 inline-block rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {t('account.advanced')}
              </span>
              <p className="font-semibold">Pro Max</p>
              <div className="mb-2 mt-2 flex items-baseline gap-2">
                <span className="text-muted-foreground line-through">399.000 VND</span>
                <span className="text-xl font-bold">299.000 VND</span>
              </div>
              <p className="mb-3 text-sm text-green-600 font-medium">
                {t('account.saveAmount')} 100.000 VND
              </p>
              <p className="text-sm text-muted-foreground">{t('account.proMaxDesc')}</p>
              <ul className="mb-4 mt-3 space-y-1.5">
                {[
                  'account.proMaxFeature1',
                  'account.proMaxFeature2',
                  'account.proMaxFeature3',
                ].map((key) => (
                  <li key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-1 w-full gap-1" asChild>
                <Link href={checkoutHref('proMax')} className="flex items-center justify-center gap-1">
                  {t('account.upgrade')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

