'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';

export function CheckoutReturnContent({ outcome }: { outcome: 'success' | 'error' | 'unknown' }) {
  const { t } = useLanguage();

  const message =
    outcome === 'success'
      ? t('checkout.return.success')
      : outcome === 'error'
        ? t('checkout.return.error')
        : t('checkout.return.unknown');

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-xl shadow-slate-200/50">
      <h1 className="text-lg font-semibold text-slate-900">{t('checkout.return.title')}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t('checkout.return.ipnNote')}</p>
      <Link
        href="/account"
        className="mt-8 inline-block text-sm font-medium text-primary underline underline-offset-4"
      >
        {t('checkout.backAccount')}
      </Link>
    </div>
  );
}
