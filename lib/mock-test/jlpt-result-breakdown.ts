import { linearScaledScore } from '@/lib/mock-test/jlpt-scaled-scoring';

/** Group mock test sections into JLPT-style score buckets for the result certificate. */

export type JlptScoreBucket = { score: number; max: number };

export type JlptResultBreakdown = {
  languageKnowledge: JlptScoreBucket;
  reading: JlptScoreBucket;
  listening: JlptScoreBucket;
};

export function classifySectionKind(sectionName: string): 'lang' | 'reading' | 'listening' {
  const n = sectionName.toLowerCase();
  if (/listening|聴解|リスニング|nghe|chăm nghe/i.test(n)) return 'listening';
  if (/reading|読解|đọc|リーディング/i.test(n)) return 'reading';
  return 'lang';
}

/** Aggregate scaled section scores into Language / Reading / Listening buckets (heuristic by section name). */
export function computeJlptResultBreakdownFromSectionRows(
  sections: Array<{ name: string; scaledScore: number; scaledMax: number }>
): JlptResultBreakdown {
  const out: JlptResultBreakdown = {
    languageKnowledge: { score: 0, max: 0 },
    reading: { score: 0, max: 0 },
    listening: { score: 0, max: 0 },
  };

  for (const sec of sections) {
    const kind = classifySectionKind(sec.name);
    const key =
      kind === 'reading'
        ? 'reading'
        : kind === 'listening'
          ? 'listening'
          : 'languageKnowledge';
    out[key].score += sec.scaledScore;
    out[key].max += sec.scaledMax;
  }

  return out;
}

/** Legacy attempts without `TestAttemptSectionResult`: recompute linear scaled scores from raw answers. */
export function recomputeMockTestSectionScoreRows(
  sections: Array<{
    id: string;
    name: string;
    scaledMax: number;
    questions: Array<{ questionId: string }>;
  }>,
  answersByQuestionId: Map<string, { isCorrect: boolean }>
): Array<{ id: string; name: string; score: number; max: number; questionIds: string[] }> {
  return sections.map((sec) => {
    const questionIds = sec.questions.map((q) => q.questionId);
    let rawCorrect = 0;
    const rawTotal = questionIds.length;
    for (const qid of questionIds) {
      if (answersByQuestionId.get(qid)?.isCorrect) rawCorrect++;
    }
    const score = linearScaledScore(rawCorrect, rawTotal, sec.scaledMax);
    return {
      id: sec.id,
      name: sec.name,
      score,
      max: sec.scaledMax,
      questionIds,
    };
  });
}

export function jlptLevelFromTitle(title: string): string {
  const m = title.match(/N\s*([1-5])/i);
  return m ? `N${m[1]}` : 'N5';
}

export function resolveJlptLevelLabel(title: string, jlptLevel: string | null | undefined): string {
  if (jlptLevel) return jlptLevel;
  return jlptLevelFromTitle(title);
}

export function formatTestDateJa(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatTestDateEn(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
