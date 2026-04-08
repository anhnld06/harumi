import { CheckoutReturnContent } from '@/features/checkout/checkout-return-content';
import { PaymentCancelledView } from '@/features/checkout/payment-cancelled-view';

export const dynamic = 'force-dynamic';

export default function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams.outcome;
  const outcome =
    typeof raw === 'string' && ['success', 'error', 'cancel'].includes(raw)
      ? (raw as 'success' | 'error' | 'cancel')
      : 'unknown';

  if (outcome === 'cancel') {
    return <PaymentCancelledView />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-violet-50/30 px-4 py-12">
      <CheckoutReturnContent outcome={outcome} />
    </div>
  );
}
