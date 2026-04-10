import { describe, it, expect } from 'vitest';
import { takeRateLimitToken } from '../rate-limit';

describe('takeRateLimitToken', () => {
  it('allows up to max requests in window', () => {
    const key = `t-${Math.random()}`;
    expect(takeRateLimitToken(key, 3, 10_000)).toBe(true);
    expect(takeRateLimitToken(key, 3, 10_000)).toBe(true);
    expect(takeRateLimitToken(key, 3, 10_000)).toBe(true);
    expect(takeRateLimitToken(key, 3, 10_000)).toBe(false);
  });
});
