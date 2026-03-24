import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{test.title}</h1>
      <MockTestRunner
        test={test}
        attemptId={attempt?.id ?? ''}
        userId={userId ?? ''}
      />
    </div>
  );
}
