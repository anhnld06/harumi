import type { Prisma } from '@prisma/client';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getMockTestLeaderboard } from '@/server/services/mock-test-leaderboard.service';
import { MockTestTopLearners } from '@/features/mock-test/mock-test-top-learners';
import { MockTestResultInteractive } from '@/features/mock-test/mock-test-result-interactive';
import {
  computeJlptResultBreakdownFromSectionRows,
  recomputeMockTestSectionScoreRows,
  resolveJlptLevelLabel,
} from '@/lib/mock-test/jlpt-result-breakdown';
import type { AttemptWithQuestions } from '@/lib/mock-test/attempt-types';
import { buildMockTestReviewPayload } from '@/lib/mock-test/build-mock-test-review-payload';
import type { MockTestResultPageAttempt } from '@/lib/mock-test/prisma-query-types';
import { userCanViewMockTestExplanations } from '@/lib/mock-test/mock-test-premium';

export default async function MockTestResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userName = session?.user?.name?.trim() || '—';
  const { id } = await params;
  const { attempt: attemptId } = await searchParams;

  if (!attemptId || !userId) notFound();

  const attemptRaw = await prisma.testAttempt.findFirst({
    where: { id: attemptId, userId, mockTestId: id },
    include: {
      sectionResults: {
        include: {
          section: {
            include: {
              questions: { orderBy: { order: 'asc' } },
            },
          },
        },
      },
      mockTest: {
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
      },
      answers: true,
    },
  } as Prisma.TestAttemptFindFirstArgs);

  if (!attemptRaw || !attemptRaw.completedAt) notFound();

  const attempt = attemptRaw as unknown as MockTestResultPageAttempt;

  const userPlan = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true, planExpiresAt: true },
  });
  const canViewExplanations = userCanViewMockTestExplanations(
    userPlan?.planTier,
    userPlan?.planExpiresAt
  );

  const answersByQuestionId = new Map(
    attempt.answers.map((a) => [a.questionId, { isCorrect: a.isCorrect }])
  );

  let sectionRows: Array<{
    id: string;
    name: string;
    score: number;
    max: number;
    questionIds: string[];
  }>;
  let breakdown: ReturnType<typeof computeJlptResultBreakdownFromSectionRows>;

  if (attempt.sectionResults.length > 0) {
    const sorted = [...attempt.sectionResults].sort(
      (a, b) => a.section.order - b.section.order
    );
    sectionRows = sorted.map((r) => ({
      id: r.section.id,
      name: r.section.name,
      score: r.scaledScore,
      max: r.scaledMax,
      questionIds: r.section.questions.map((mq) => mq.questionId),
    }));
    breakdown = computeJlptResultBreakdownFromSectionRows(
      sorted.map((r) => ({
        name: r.section.name,
        scaledScore: r.scaledScore,
        scaledMax: r.scaledMax,
      }))
    );
  } else {
    const legacyRows = recomputeMockTestSectionScoreRows(
      attempt.mockTest.sections.map((s) => ({
        id: s.id,
        name: s.name,
        scaledMax: s.scaledMax,
        questions: s.questions.map((mq) => ({ questionId: mq.questionId })),
      })),
      answersByQuestionId
    );
    sectionRows = legacyRows.map((r) => ({
      id: r.id,
      name: r.name,
      score: r.score,
      max: r.max,
      questionIds: r.questionIds,
    }));
    breakdown = computeJlptResultBreakdownFromSectionRows(
      legacyRows.map((r) => ({
        name: r.name,
        scaledScore: r.score,
        scaledMax: r.max,
      }))
    );
  }

  const totalScore = attempt.score ?? 0;
  const totalMax = attempt.totalScore ?? 0;
  const level = resolveJlptLevelLabel(attempt.mockTest.title, attempt.mockTest.jlptLevel);

  const review = buildMockTestReviewPayload(attempt as unknown as AttemptWithQuestions);

  const [leaderboardAll, leaderboardWeek, leaderboardMonth] = await Promise.all([
    getMockTestLeaderboard(id, {
      currentUserId: userId,
      limit: 5,
      period: 'all',
    }),
    getMockTestLeaderboard(id, {
      currentUserId: userId,
      limit: 5,
      period: 'week',
    }),
    getMockTestLeaderboard(id, {
      currentUserId: userId,
      limit: 5,
      period: 'month',
    }),
  ]);

  return (
    <div className="pb-10">
      <MockTestResultInteractive
        mockTestId={id}
        attemptId={attemptId}
        userName={userName}
        testTitle={attempt.mockTest.title}
        completedAt={attempt.completedAt!}
        level={level}
        breakdown={breakdown}
        totalScore={totalScore}
        totalMax={totalMax}
        passed={Boolean(attempt.passed)}
        sectionRows={sectionRows}
        review={review}
        canViewExplanations={canViewExplanations}
        topLearners={
          <MockTestTopLearners
            variant="compact"
            boards={{
              all: leaderboardAll,
              week: leaderboardWeek,
              month: leaderboardMonth,
            }}
            currentUserId={userId}
          />
        }
      />
    </div>
  );
}
