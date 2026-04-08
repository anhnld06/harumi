import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CheckoutConfigError } from '@/features/checkout/checkout-config-error';
import { CheckoutInvalidAmount } from '@/features/checkout/checkout-invalid';
import { SePayAutoPostForm } from '@/features/checkout/sepay-auto-post-form';
import { prisma } from '@/lib/db';
import { parseCheckoutAmount, generateOrderCode, generatePaymentMemo } from '@/lib/payment/checkout-server';
import {
  parseCheckoutProductSlug,
  resolveCheckoutContext,
} from '@/lib/payment/checkout-product';
import { buildSePaySignedFormFields, getSePayCheckoutConfig } from '@/lib/payment/sepay-checkout';

export const dynamic = 'force-dynamic';

function checkoutPathFromSearch(
  searchParams: Record<string, string | string[] | undefined>
): string {
  const amount = typeof searchParams.amount === 'string' ? searchParams.amount : '';
  const desc = typeof searchParams.desc === 'string' ? searchParams.desc : '';
  const product = typeof searchParams.product === 'string' ? searchParams.product : '';
  const p = new URLSearchParams();
  if (amount) p.set('amount', amount);
  if (desc) p.set('desc', desc);
  if (product) p.set('product', product);
  const q = p.toString();
  return q ? `/checkout?${q}` : '/checkout';
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const path = checkoutPathFromSearch(searchParams);
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  const sepay = getSePayCheckoutConfig();
  if (!sepay) {
    return <CheckoutConfigError />;
  }

  const amountRaw = typeof searchParams.amount === 'string' ? searchParams.amount : undefined;
  const descRaw = typeof searchParams.desc === 'string' ? searchParams.desc : '';
  const productRaw = typeof searchParams.product === 'string' ? searchParams.product : undefined;

  const amount = parseCheckoutAmount(amountRaw);
  if (amount === null) {
    return <CheckoutInvalidAmount />;
  }

  const productSlug = parseCheckoutProductSlug(productRaw);
  const ctx = resolveCheckoutContext({
    productSlug,
    amount,
    desc: descRaw.trim() || 'Harumi JLPT',
  });

  if (!ctx) {
    return <CheckoutInvalidAmount />;
  }

  const orderInvoiceNumber = generateOrderCode();
  const clientOrderId = generatePaymentMemo();

  try {
    await prisma.paymentOrder.create({
      data: {
        userId: session.user.id,
        orderInvoiceNumber,
        clientOrderId,
        amountVnd: ctx.amountVnd,
        productCode: ctx.productCode,
        description: ctx.description,
        status: 'PENDING',
      },
    });
  } catch (e) {
    console.error('[checkout] failed to create payment order', e);
    return <CheckoutConfigError />;
  }

  let formFields: Record<string, string>;
  try {
    formFields = buildSePaySignedFormFields({
      merchantId: sepay.merchantId,
      secretKey: sepay.secretKey,
      amountVnd: ctx.amountVnd,
      orderInvoiceNumber,
      orderId: clientOrderId,
      orderDescription: ctx.description,
      customerId: session.user.id,
    });
  } catch (e) {
    console.error('[checkout] SePay sign failed', e);
    await prisma.paymentOrder
      .deleteMany({
        where: { orderInvoiceNumber, status: 'PENDING' },
      })
      .catch(() => {});
    return <CheckoutConfigError />;
  }

  return <SePayAutoPostForm action={sepay.initUrl} fields={formFields} />;
}
