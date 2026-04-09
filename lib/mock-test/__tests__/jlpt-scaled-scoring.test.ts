import { describe, it, expect } from 'vitest';
import {
  evaluateJlptStylePass,
  linearScaledScore,
  sumScaledMax,
} from '../jlpt-scaled-scoring';

describe('jlpt-scaled-scoring', () => {
  it('linearScaledScore clamps to scaledMax', () => {
    expect(linearScaledScore(10, 10, 60)).toBe(60);
    expect(linearScaledScore(0, 5, 60)).toBe(0);
  });

  it('evaluateJlptStylePass requires total and each section minimum', () => {
    expect(
      evaluateJlptStylePass({
        totalScaled: 100,
        passTotalScaled: 90,
        sections: [
          { scaledScore: 40, minimumPassScaled: 19 },
          { scaledScore: 40, minimumPassScaled: 19 },
        ],
      })
    ).toBe(true);

    expect(
      evaluateJlptStylePass({
        totalScaled: 100,
        passTotalScaled: 90,
        sections: [{ scaledScore: 10, minimumPassScaled: 19 }],
      })
    ).toBe(false);
  });

  it('sumScaledMax sums section caps', () => {
    expect(sumScaledMax([{ scaledMax: 60 }, { scaledMax: 60 }])).toBe(120);
  });
});
