'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';

export function SePayAutoPostForm({
  action,
  fields,
}: {
  action: string;
  fields: Record<string, string>;
}) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <form ref={formRef} method="POST" action={action} className="w-full max-w-sm text-center">
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <p className="text-sm text-muted-foreground">{t('checkout.redirectingSepay')}</p>
        <noscript>
          <button type="submit" className="mt-4 text-primary underline">
            {t('checkout.continuePayment')}
          </button>
        </noscript>
      </form>
    </div>
  );
}
