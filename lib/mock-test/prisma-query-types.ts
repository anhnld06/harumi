import type { MockTest, MockTestSection } from '@/lib/db-types';

/** `prisma.mockTest.findMany({ include: { sections: true } })` — Prisma payload inference can drop JLPT scalar fields in some toolchains. */
export type MockTestListItem = MockTest & {
  sections: MockTestSection[];
};

/** Recent attempts strip on mock test listing page. */
export type TestAttemptRecentItem = {
  id: string;
  completedAt: Date | null;
  score: number | null;
  totalScore: number | null;
  passed: boolean | null;
  mockTest: MockTest;
};

/**
 * `testAttempt.findFirst` on mock test result page (section scores + full mock tree).
 */
export type MockTestResultPageAttempt = {
  score: number | null;
  totalScore: number | null;
  passed: boolean | null;
  completedAt: Date | null;
  startedAt: Date;
  answers: Array<{ questionId: string; isCorrect: boolean; userAnswer: string | null }>;
  mockTest: MockTest & {
    jlptLevel: string | null;
    sections: Array<
      MockTestSection & {
        questions: Array<{
          questionId: string;
          question: {
            id: string;
            content: string;
            options: unknown;
            correctAnswer: string;
            explanation?: string | null;
            explanationVi?: string | null;
            readingPassageId?: string | null;
            listeningPassageId?: string | null;
            readingPassage?: { title: string; content: string; contentVi?: string | null } | null;
            listeningPassage?: {
              title: string;
              audioUrl: string;
              transcript?: string | null;
              duration?: number | null;
            } | null;
          };
        }>;
      }
    >;
  };
  sectionResults: Array<{
    scaledScore: number;
    scaledMax: number;
    section: MockTestSection & {
      order: number;
      questions: Array<{ questionId: string }>;
    };
  }>;
};
