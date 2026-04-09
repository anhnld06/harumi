import { describe, it, expect } from 'vitest';
import {
  ipnAmountMatchesOrder,
  parseIpnAmount,
  shouldFulfillFromIpn,
} from '../fulfill-payment-order';

describe('SePay IPN helpers', () => {
  it('parseIpnAmount parses numeric strings', () => {
    expect(parseIpnAmount('99000')).toBe(99000);
    expect(parseIpnAmount('99000.4')).toBe(99000);
    expect(parseIpnAmount(undefined)).toBe(null);
    expect(parseIpnAmount('')).toBe(null);
  });

  it('ipnAmountMatchesOrder is strict equality', () => {
    expect(ipnAmountMatchesOrder(100_000, 100_000)).toBe(true);
    expect(ipnAmountMatchesOrder(100_000, 100_001)).toBe(false);
  });

  it('shouldFulfillFromIpn filters notification and status', () => {
    expect(
      shouldFulfillFromIpn({
        notification_type: 'ORDER_PAID',
        order: { order_status: 'CAPTURED' },
      })
    ).toBe(true);
    expect(
      shouldFulfillFromIpn({
        notification_type: 'OTHER',
        order: { order_status: 'CAPTURED' },
      })
    ).toBe(false);
  });
});
