import { prisma } from '@/lib/db';

export async function getMockTestWithQuestions(testId: string) {
  return prisma.mockTest.findUnique({
    where: { id: testId },
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
  });
}

export async function submitMockTest(
  userId: string,
  attemptId: string,
  answers: Array<{ questionId: string; userAnswer: string; timeSpent?: number }>
) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId, userId },
    include: { mockTest: true },
  });

  if (!attempt || attempt.completedAt) {
    throw new Error('Invalid or already submitted attempt');
  }

  let totalCorrect = 0;
  let totalQuestions = 0;

  for (const a of answers) {
    const question = await prisma.question.findUnique({
      where: { id: a.questionId },
    });
    if (!question) continue;

    const isCorrect = String(question.correctAnswer).trim() === String(a.userAnswer).trim();
    totalQuestions++;
    if (isCorrect) totalCorrect++;

    await prisma.testAttemptAnswer.upsert({
      where: {
        attemptId_questionId: { attemptId, questionId: a.questionId },
      },
      create: {
        attemptId,
        questionId: a.questionId,
        userAnswer: a.userAnswer,
        isCorrect,
        timeSpent: a.timeSpent ?? null,
      },
      update: {
        userAnswer: a.userAnswer,
        isCorrect,
        timeSpent: a.timeSpent ?? null,
      },
    });
  }

  const totalScore = totalQuestions * 2; // Simplified: 2 points per question
  const score = totalCorrect * 2;
  const passed = score >= (attempt.mockTest.passScore ?? 90);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await prisma.$transaction([
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        totalScore,
        passed,
        completedAt: now,
      },
    }),
    prisma.userProgress.upsert({
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
    }),
  ]);

  return { score, totalScore, passed };
}
