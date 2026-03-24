import { describe, it, expect } from 'vitest';
import { calculateNextReview } from '../srs.service';

describe('SRS Service', () => {
  describe('calculateNextReview', () => {
    it('returns shorter interval for wrong answers', () => {
      const { nextInterval } = calculateNextReview(false, 5, 2.5);
      expect(nextInterval).toBe(1);
    });

    it('increases interval for correct answers', () => {
      const { nextInterval } = calculateNextReview(true, 2, 2.5);
      expect(nextInterval).toBeGreaterThan(2);
    });

    it('returns interval 2 for first correct', () => {
      const { nextInterval } = calculateNextReview(true, 1, 2.5);
      expect(nextInterval).toBe(2);
    });
  });
});
