import type { CheckoutProductCode } from '@prisma/client';

export type CheckoutProductSlug = 'credits' | 'pro' | 'promax';

const SLUG_TO_CODE: Record<CheckoutProductSlug, CheckoutProductCode> = {
  credits: 'CREDITS_PACK',
  pro: 'PLAN_PRO',
  promax: 'PLAN_PRO_MAX',
};

const SLUG_TO_AMOUNT: Record<CheckoutProductSlug, number> = {
  credits: 29_000,
  pro: 99_000,
  promax: 299_000,
};

export function parseCheckoutProductSlug(
  raw: string | undefined
): CheckoutProductSlug | null {
  if (raw === 'credits' || raw === 'pro' || raw === 'promax') return raw;
  return null;
}

export function slugToProductCode(slug: CheckoutProductSlug): CheckoutProductCode {
  return SLUG_TO_CODE[slug];
}

export function expectedAmountForSlug(slug: CheckoutProductSlug): number {
  return SLUG_TO_AMOUNT[slug];
}

export function resolveCheckoutContext(opts: {
  productSlug: CheckoutProductSlug | null;
  amount: number;
  desc: string;
}): { slug: CheckoutProductSlug; productCode: CheckoutProductCode; amountVnd: number; description: string } | null {
  const desc = opts.desc.trim().slice(0, 500) || 'Harumi JLPT';

  if (opts.productSlug) {
    const expected = expectedAmountForSlug(opts.productSlug);
    if (opts.amount !== expected) return null;
    return {
      slug: opts.productSlug,
      productCode: slugToProductCode(opts.productSlug),
      amountVnd: expected,
      description: desc,
    };
  }

  const entries = Object.entries(SLUG_TO_AMOUNT) as [CheckoutProductSlug, number][];
  for (const [slug, amt] of entries) {
    if (amt === opts.amount) {
      return {
        slug,
        productCode: slugToProductCode(slug),
        amountVnd: amt,
        description: desc,
      };
    }
  }

  return null;
}
