'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Copy, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { toast } from '@/lib/toast-store';
import { cn } from '@/lib/utils';

interface CheckoutPaymentViewProps {
  displayName: string;
  orderCode: string;
  description: string;
  amountVnd: number;
  transferMemo: string;
  bankName: string;
  bankFullName: string;
  accountNumber: string;
  accountHolder: string;
  qrImageUrl: string;
}

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast(label);
  } catch {
    toast('Copy failed');
  }
}

export function CheckoutPaymentView({
  displayName,
  orderCode,
  description,
  amountVnd,
  transferMemo,
  bankName,
  bankFullName,
  accountNumber,
  accountHolder,
  qrImageUrl,
}: CheckoutPaymentViewProps) {
  const { t } = useLanguage();
  const formattedAmount = `${amountVnd.toLocaleString('vi-VN')} VND`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50/40 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/70 py-6 text-center backdrop-blur">
        <h1 className="text-lg font-semibold tracking-tight text-slate-800">{displayName}</h1>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
          {/* Order card */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">{t('checkout.orderInfo')}</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">{t('checkout.orderCode')}</dt>
                <dd className="mt-1 font-mono text-sm font-medium text-slate-800">{orderCode}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('checkout.orderDesc')}</dt>
                <dd className="mt-1 font-medium text-slate-800">{description}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('checkout.amount')}</dt>
                <dd className="mt-1 text-xl font-bold text-sky-600">{formattedAmount}</dd>
              </div>
            </dl>
          </section>

          {/* QR card */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t('checkout.scanQr')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('checkout.scanHint')}</p>

            <div className="relative mx-auto mt-6 flex max-w-[280px] justify-center">
              <div
                className={cn(
                  'relative overflow-hidden rounded-xl border-2 border-sky-500/30 bg-white p-3',
                  'shadow-[0_0_0_1px_rgba(14,165,233,0.15)]'
                )}
              >
                <div className="pointer-events-none absolute inset-3 z-10 border border-sky-400/25">
                  <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-sky-500" />
                  <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-sky-500" />
                  <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-sky-500" />
                  <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-sky-500" />
                </div>
                <Image
                  src={qrImageUrl}
                  alt="VietQR"
                  width={248}
                  height={248}
                  className="relative z-0 h-[248px] w-[248px] object-contain"
                  unoptimized
                  priority
                />
              </div>
            </div>

            <div className="mt-8 space-y-5 border-t border-slate-100 pt-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('checkout.bank')}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">{bankName}</p>
                {bankFullName ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{bankFullName}</p>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('checkout.beneficiary')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{accountHolder}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('checkout.accountNo')}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-base font-semibold tracking-wide text-slate-900">
                    {accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(t('checkout.copied'), accountNumber)}
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label={t('checkout.copy')}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('checkout.transferContent')}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="break-all font-mono text-sm font-semibold text-slate-900">
                    {transferMemo}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(t('checkout.copied'), transferMemo)}
                    className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label={t('checkout.copy')}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-slate-800 hover:underline"
              >
                <X className="h-4 w-4" />
                {t('checkout.cancel')}
              </Link>
            </div>
          </section>
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>{t('checkout.footer')}</p>
        </footer>
      </main>
    </div>
  );
}
