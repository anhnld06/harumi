'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';

export function CheckoutInvalidAmount() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="max-w-md text-sm text-muted-foreground">{t('checkout.invalidAmount')}</p>
      <Link href="/account" className="mt-6 text-sm font-medium text-primary underline underline-offset-4">
        {t('checkout.backAccount')}
      </Link>
    </div>
  );
}
