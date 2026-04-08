'use client';

import Link from 'next/link';
import { Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';

export function PaymentCancelledView() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-violet-50/40">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500"
          style={{ animationFillMode: 'backwards' }}
        >
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-50">
                  <span className="text-2xl font-bold text-amber-600" aria-hidden>
                    !
                  </span>
                </div>
                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                {t('checkout.cancel.title')}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {t('checkout.cancel.subtitle')}
              </p>

              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                <Button
                  asChild
                  className="h-11 rounded-xl bg-violet-600 font-semibold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700"
                >
                  <Link href="/account" className="inline-flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 opacity-90" />
                    {t('checkout.cancel.viewPlans')}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-slate-200 bg-white font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2">
                    <Home className="h-4 w-4 text-slate-600" />
                    {t('checkout.cancel.toDashboard')}
                  </Link>
                </Button>
              </div>

              <p className="mt-8 text-xs text-slate-400">{t('checkout.cancel.footerHint')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
