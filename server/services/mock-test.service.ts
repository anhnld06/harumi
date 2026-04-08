import type { TestWithSections } from '@/lib/mock-test/test-types';
import { prisma } from '@/lib/db';
import {
  evaluateJlptStylePass,
  linearScaledScore,
  sumScaledMax,
  type SectionScoreComputation,
} from '@/lib/mock-test/jlpt-scaled-scoring';

/**
 * Explicit shape for submit scoring — avoids Prisma include payload / stale client mismatches
 * (e.g. missing scaled fields or wrong mockTest scalars in inferred types).
 */
type MockTestForSubmit = {
  passTotalScaled: number;
  sections: Array<{
    id: string;
    name: string;
    scaledMax: number;
    minimumPassScaled: number;
    questions: Array<{
      question: { id: string; correctAnswer: unknown };
    }>;
  }>;
};

export async function getMockTestWithQuestions(
  testId: string
): Promise<TestWithSections | null> {
  const test = await prisma.mockTest.findUnique({
    where: { id: testId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              question: {
                include: {
                  readingPassage: true,
                  listeningPassage: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return test as TestWithSections | null;
}

export async function submitMockTest(
  userId: string,
  attemptId: string,
  answers: Array<{ questionId: string; userAnswer: string; timeSpent?: number }>
) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId, userId },
    include: {
      mockTest: {
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: { question: true },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.completedAt) {
    throw new Error('Invalid or already submitted attempt');
  }

  const answerMap = new Map(
    answers.map((a) => [a.questionId, String(a.userAnswer ?? '').trim()])
  );
  const timeMap = new Map(
    answers.map((a) => [a.questionId, a.timeSpent ?? null] as const)
  );

  const sectionComputations: SectionScoreComputation[] = [];
  let totalCorrect = 0;
  let totalQuestions = 0;

  type AnswerRow = {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number | null;
  };
  const pendingAnswers: AnswerRow[] = [];

  const mockTest = attempt.mockTest as unknown as MockTestForSubmit;

  for (const section of mockTest.sections) {
    let rawCorrect = 0;
    let rawTotal = 0;
    for (const mq of section.questions) {
      const question = mq.question;
      const userAnswer = answerMap.get(question.id) ?? '';
      const isCorrect =
        userAnswer.length > 0 && String(question.correctAnswer).trim() === userAnswer;
      rawTotal++;
      totalQuestions++;
      if (isCorrect) {
        rawCorrect++;
        totalCorrect++;
      }

      pendingAnswers.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        timeSpent: timeMap.get(question.id) ?? null,
      });
    }

    const scaledMax = section.scaledMax;
    const minimumPassScaled = section.minimumPassScaled;
    const scaledScore = linearScaledScore(rawCorrect, rawTotal, scaledMax);
    const passedSection = scaledScore >= minimumPassScaled;

    sectionComputations.push({
      sectionId: section.id,
      name: section.name,
      rawCorrect,
      rawTotal,
      scaledScore,
      scaledMax,
      minimumPassScaled,
      passedSection,
    });
  }

  const totalScaled = sectionComputations.reduce((a, s) => a + s.scaledScore, 0);
  const totalMax = sumScaledMax(mockTest.sections);
  const passTotalScaled = mockTest.passTotalScaled;

  const passed = evaluateJlptStylePass({
    totalScaled,
    passTotalScaled,
    sections: sectionComputations.map((s) => ({
      scaledScore: s.scaledScore,
      minimumPassScaled: s.minimumPassScaled,
    })),
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const sectionRows = sectionComputations.map((s) => ({
    attemptId,
    sectionId: s.sectionId,
    rawCorrect: s.rawCorrect,
    rawTotal: s.rawTotal,
    scaledScore: s.scaledScore,
    scaledMax: s.scaledMax,
    minimumPassScaled: s.minimumPassScaled,
    passedSection: s.passedSection,
  }));

  const answerRows = pendingAnswers.map((row) => ({
    attemptId,
    questionId: row.questionId,
    userAnswer: row.userAnswer,
    isCorrect: row.isCorrect,
    timeSpent: row.timeSpent,
  }));

  await prisma.$transaction(
    async (tx) => {
      type SectionResultDelegate = {
        deleteMany(args: { where: { attemptId: string } }): Promise<unknown>;
        createMany(args: { data: typeof sectionRows }): Promise<unknown>;
      };
      const db = tx as typeof prisma & { testAttemptSectionResult: SectionResultDelegate };

      await db.testAttemptAnswer.deleteMany({ where: { attemptId } });
      if (answerRows.length > 0) {
        await db.testAttemptAnswer.createMany({ data: answerRows });
      }

      await db.testAttemptSectionResult.deleteMany({ where: { attemptId } });
      if (sectionRows.length > 0) {
        await db.testAttemptSectionResult.createMany({ data: sectionRows });
      }

      await db.testAttempt.update({
        where: { id: attemptId },
        data: {
          score: totalScaled,
          totalScore: totalMax,
          passed,
          completedAt: now,
        },
      });

      await db.userProgress.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        create: {
          userId,
          date: today,
          quizzesTaken: 1,
          correctAnswers: totalCorrect,
          totalAnswers: totalQuestions,
        },
        update: {
          quizzesTaken: { increment: 1 },
          correctAnswers: { increment: totalCorrect },
          totalAnswers: { increment: totalQuestions },
        },
      });
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    }
  );

  return { score: totalScaled, totalScore: totalMax, passed };
}
