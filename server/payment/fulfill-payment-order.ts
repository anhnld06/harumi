import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

const CREDITS_PACK_AMOUNT = 25_000;
const PLAN_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

function addPlanWindow(existing: Date | null): Date {
  const now = new Date();
  const base = existing && existing > now ? existing : now;
  return new Date(base.getTime() + PLAN_DURATION_MS);
}

/**
 * Applies product fulfillment and marks the order PAID, only when status is PENDING.
 * Caller must run inside a transaction; locks the row with FOR UPDATE first.
 * @returns true if the order was fulfilled (status is now PAID).
 */
async function applyFulfillmentToPendingOrder(
  tx: Prisma.TransactionClient,
  orderId: string
): Promise<boolean> {
  await tx.$queryRaw(Prisma.sql`
    SELECT id FROM "PaymentOrder" WHERE id = ${orderId} FOR UPDATE
  `);

  const order = await tx.paymentOrder.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order || order.status !== 'PENDING') return false;

  const user = order.user;
  if (!user) return false;

  switch (order.productCode) {
    case 'CREDITS_PACK':
      await tx.user.update({
        where: { id: user.id },
        data: { creditBalance: { increment: CREDITS_PACK_AMOUNT } },
      });
      break;
    case 'PLAN_PRO': {
      const nextExpires = addPlanWindow(user.planExpiresAt);
      const tier = user.planTier === 'pro_max' ? 'pro_max' : 'pro';
      await tx.user.update({
        where: { id: user.id },
        data: { planTier: tier, planExpiresAt: nextExpires },
      });
      break;
    }
    case 'PLAN_PRO_MAX': {
      const nextExpires = addPlanWindow(user.planExpiresAt);
      await tx.user.update({
        where: { id: user.id },
        data: { planTier: 'pro_max', planExpiresAt: nextExpires },
      });
      break;
    }
    default:
      return false;
  }

  await tx.paymentOrder.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
  });
  return true;
}

export async function fulfillPaidOrder(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await applyFulfillmentToPendingOrder(tx, orderId);
  });
}

export async function markPaymentOrderFailedByInvoice(invoiceNumber: string): Promise<void> {
  await prisma.paymentOrder.updateMany({
    where: {
      orderInvoiceNumber: invoiceNumber,
      status: 'PENDING',
    },
    data: { status: 'FAILED' },
  });
}

export function parseIpnAmount(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return null;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export function ipnAmountMatchesOrder(ipnAmount: number, orderAmountVnd: number): boolean {
  return ipnAmount === orderAmountVnd;
}

export type SepayIpnPayload = {
  notification_type?: string;
  order?: {
    id?: string;
    order_id?: string;
    order_status?: string;
    order_invoice_number?: string;
    order_amount?: string;
    order_currency?: string;
  };
};

export function shouldFulfillFromIpn(body: SepayIpnPayload): boolean {
  if (body.notification_type !== 'ORDER_PAID') return false;
  const status = body.order?.order_status?.toUpperCase();
  return status === 'CAPTURED' || status === 'COMPLETED';
}

/**
 * Load order by SePay invoice number, validate pending state, optionally store SePay UUID, then fulfill.
 * Caller must validate amount/currency against IPN before calling.
 * Uses one DB transaction with row lock so concurrent IPNs cannot double-fulfill.
 */
export async function fulfillPaymentFromSepayInvoice(
  invoiceNumber: string,
  sepayOrderUuid?: string | null
): Promise<'fulfilled' | 'ignored' | 'already_paid'> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`
      SELECT id FROM "PaymentOrder" WHERE "orderInvoiceNumber" = ${invoiceNumber} FOR UPDATE
    `);

    const order = await tx.paymentOrder.findUnique({
      where: { orderInvoiceNumber: invoiceNumber },
      include: { user: true },
    });

    if (!order) return 'ignored';
    if (order.status === 'PAID') return 'already_paid';
    if (order.status !== 'PENDING') return 'ignored';

    if (sepayOrderUuid) {
      await tx.paymentOrder.update({
        where: { id: order.id },
        data: { sepayOrderUuid },
      });
    }

    const fulfilled = await applyFulfillmentToPendingOrder(tx, order.id);
    return fulfilled ? 'fulfilled' : 'ignored';
  });
}
