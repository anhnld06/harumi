import type { CheckoutProductSlug } from '@/lib/payment/checkout-product';
import { expectedAmountForSlug } from '@/lib/payment/checkout-product';

/** Preset VND amounts for account CTAs (must match SePay checkout validation). */
export const CHECKOUT_PRESETS = {
  credits: 29_000,
  pro: 99_000,
  proMax: 299_000,
} as const;

/** Short ASCII descriptions for SePay order_description. */
export const CHECKOUT_DESCRIPTIONS = {
  credits: 'Addon 25000 Credits',
  pro: 'Harumi JLPT Pro plan',
  proMax: 'Harumi JLPT Pro Max plan',
} as const;

const UI_KEY_TO_SLUG: Record<keyof typeof CHECKOUT_PRESETS, CheckoutProductSlug> = {
  credits: 'credits',
  pro: 'pro',
  proMax: 'promax',
};

/** Upgrade CTAs outside Account link here; SePay `/checkout` is only used from Account overview. */
export const accountPlansHref = '/account#plans' as const;

/** Build internal checkout URL with product slug (required for fulfillment mapping). */
export function checkoutHref(
  productKey: keyof typeof CHECKOUT_PRESETS,
  descriptionOverride?: string
): string {
  const slug = UI_KEY_TO_SLUG[productKey];
  const amount = expectedAmountForSlug(slug);
  const desc = (descriptionOverride ?? CHECKOUT_DESCRIPTIONS[productKey]).trim().slice(0, 200);
  const p = new URLSearchParams();
  p.set('amount', String(amount));
  p.set('desc', desc);
  p.set('product', slug);
  return `/checkout?${p.toString()}`;
}
