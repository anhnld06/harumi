import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  isFreePublicMockTestTitle,
  userCanAccessPremiumMockTests,
} from '@/lib/mock-test/mock-test-access';
import { getMockTestWithQuestions } from '@/server/services/mock-test.service';
import { prisma } from '@/lib/db';
import { MockTestRunner } from '@/features/mock-test/mock-test-runner';

export default async function MockTestTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { id } = await params;

  const test = await getMockTestWithQuestions(id);
  if (!test) notFound();

  if (
    !isFreePublicMockTestTitle(test.title) &&
    !userCanAccessPremiumMockTests(session?.user?.planTier, session?.user?.planExpiresAt)
  ) {
    redirect('/mock-test');
  }

  let attempt = userId
    ? await prisma.testAttempt.findFirst({
        where: { userId, mockTestId: id, completedAt: null },
        orderBy: { startedAt: 'desc' },
      })
    : null;

  if (!attempt && userId) {
    attempt = await prisma.testAttempt.create({
      data: {
        userId,
        mockTestId: id,
      },
    });
  }

  return (
    <div className="space-y-6 pb-10">
      <MockTestRunner test={test} attemptId={attempt?.id ?? ''} />
    </div>
  );
}
