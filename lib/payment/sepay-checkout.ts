import { createHmac, timingSafeEqual } from 'crypto';

/** Matches signing field list in sepay-pg-node `Checkout.signFields`. */
const SIGNED_FIELD_NAMES = new Set([
  'merchant',
  'env',
  'operation',
  'payment_method',
  'order_amount',
  'currency',
  'order_invoice_number',
  'order_description',
  'customer_id',
  'agreement_id',
  'agreement_name',
  'agreement_type',
  'agreement_payment_frequency',
  'agreement_amount_per_payment',
  'success_url',
  'error_url',
  'cancel_url',
  'order_id',
]);

export function signSePayFields(
  fields: Record<string, string | undefined>,
  secretKey: string
): string {
  const signedKeys = Object.keys(fields).filter((f) => SIGNED_FIELD_NAMES.has(f));
  const parts: string[] = [];
  for (const field of signedKeys) {
    const v = fields[field];
    if (v === undefined) continue;
    parts.push(`${field}=${v}`);
  }
  return createHmac('sha256', secretKey).update(parts.join(',')).digest('base64');
}

export function getSePayCheckoutConfig(): {
  merchantId: string;
  secretKey: string;
  initUrl: string;
} | null {
  const merchantId = process.env.SEPAY_MERCHANT_ID?.trim();
  const secretKey = process.env.SEPAY_SECRET_KEY?.trim();
  if (!merchantId || !secretKey) return null;
  const env = (process.env.SEPAY_ENV?.trim().toLowerCase() || 'sandbox') as 'sandbox' | 'production';
  const initUrl =
    env === 'production'
      ? 'https://pay.sepay.vn/v1/checkout/init'
      : 'https://pay-sandbox.sepay.vn/v1/checkout/init';
  return { merchantId, secretKey, initUrl };
}

function appBaseUrl(): string {
  const raw = process.env.NEXTAUTH_URL?.trim() || '';
  return raw.replace(/\/$/, '');
}

export function buildSePaySignedFormFields(opts: {
  merchantId: string;
  secretKey: string;
  amountVnd: number;
  orderInvoiceNumber: string;
  orderId: string;
  orderDescription: string;
  customerId: string;
}): Record<string, string> {
  const base = appBaseUrl();
  if (!base) {
    throw new Error('NEXTAUTH_URL is required for SePay return URLs');
  }

  const fields: Record<string, string> = {};
  fields.merchant = opts.merchantId;
  fields.operation = 'PURCHASE';
  fields.payment_method = 'BANK_TRANSFER';
  fields.order_amount = String(opts.amountVnd);
  fields.currency = 'VND';
  fields.order_invoice_number = opts.orderInvoiceNumber;
  fields.order_description = opts.orderDescription;
  fields.customer_id = opts.customerId;
  fields.success_url = `${base}/checkout/return?outcome=success`;
  fields.error_url = `${base}/checkout/return?outcome=error`;
  fields.cancel_url = `${base}/checkout/cancel`;
  fields.order_id = opts.orderId;

  const signature = signSePayFields(fields, opts.secretKey);
  return { ...fields, signature };
}

/** Verify SePay IPN `X-Secret-Key` header (constant-time). */
export function verifySepayIpnSecret(received: string | null, expected: string): boolean {
  if (!received || !expected || received.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  } catch {
    return false;
  }
}
