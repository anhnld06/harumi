import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSePayCheckoutConfig, verifySepayIpnSecret } from '@/lib/payment/sepay-checkout';
import {
  fulfillPaymentFromSepayInvoice,
  ipnAmountMatchesOrder,
  parseIpnAmount,
  shouldFulfillFromIpn,
  type SepayIpnPayload,
} from '@/server/payment/fulfill-payment-order';

export const dynamic = 'force-dynamic';

/**
 * SePay IPN — configure this URL in SePay dashboard (HTTPS).
 * Auth: header `X-Secret-Key` must equal SEPAY_SECRET_KEY.
 */
export async function POST(request: NextRequest) {
  const config = getSePayCheckoutConfig();
  if (!config) {
    return NextResponse.json({ error: 'SePay not configured' }, { status: 503 });
  }

  if (!verifySepayIpnSecret(request.headers.get('x-secret-key'), config.secretKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SepayIpnPayload;
  try {
    body = (await request.json()) as SepayIpnPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!shouldFulfillFromIpn(body)) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const invoice = body.order?.order_invoice_number;
  if (!invoice) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const order = await prisma.paymentOrder.findUnique({
    where: { orderInvoiceNumber: invoice },
  });

  if (!order) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  if (order.status === 'PAID') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (order.status !== 'PENDING') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ipnAmount = parseIpnAmount(body.order?.order_amount);
  if (ipnAmount === null || !ipnAmountMatchesOrder(ipnAmount, order.amountVnd)) {
    console.error('[sepay-ipn] amount mismatch', { invoice, ipnAmount, expected: order.amountVnd });
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  const cur = body.order?.order_currency?.toUpperCase();
  if (cur && cur !== 'VND') {
    return NextResponse.json({ error: 'Currency mismatch' }, { status: 400 });
  }

  await fulfillPaymentFromSepayInvoice(invoice, body.order?.id);

  return NextResponse.json({ success: true }, { status: 200 });
}
