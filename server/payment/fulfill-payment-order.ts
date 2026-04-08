import { prisma } from '@/lib/db';

const CREDITS_PACK_AMOUNT = 25_000;
const PLAN_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

function addPlanWindow(existing: Date | null): Date {
  const now = new Date();
  const base = existing && existing > now ? existing : now;
  return new Date(base.getTime() + PLAN_DURATION_MS);
}

export async function fulfillPaidOrder(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || order.status === 'PAID') return;

    const user = order.user;
    if (!user) return;

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
        return;
    }

    await tx.paymentOrder.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
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
