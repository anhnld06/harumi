/**
 * JLPT-inspired linear scaled scoring (approximation — not official JLPT equating).
 * Maps raw correct/total within a section to [0, scaledMax].
 */

export function linearScaledScore(rawCorrect: number, rawTotal: number, scaledMax: number): number {
  if (rawTotal <= 0) return 0;
  const v = Math.round((rawCorrect / rawTotal) * scaledMax);
  return Math.min(scaledMax, Math.max(0, v));
}

export function evaluateJlptStylePass(params: {
  totalScaled: number;
  passTotalScaled: number;
  sections: Array<{ scaledScore: number; minimumPassScaled: number }>;
}): boolean {
  if (params.totalScaled < params.passTotalScaled) return false;
  return params.sections.every((s) => s.scaledScore >= s.minimumPassScaled);
}

export type SectionScoreComputation = {
  sectionId: string;
  name: string;
  rawCorrect: number;
  rawTotal: number;
  scaledScore: number;
  scaledMax: number;
  minimumPassScaled: number;
  passedSection: boolean;
};

export function sumScaledMax(sections: Array<{ scaledMax: number }>): number {
  return sections.reduce((a, s) => a + s.scaledMax, 0);
}
