import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { userCanIssueCourseCertificate } from '@/lib/mock-test/mock-test-premium';
import { CertificateSelectClient } from '@/features/certificate/certificate-select-client';

export default async function CertificateSelectPage({
  searchParams,
}: {
  searchParams: Promise<{ attempt?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) notFound();

  const { attempt: attemptId } = await searchParams;
  if (!attemptId) notFound();

  const [attempt, userPlan] = await Promise.all([
    prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completedAt: { not: null },
        passed: true,
      },
      include: { mockTest: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true, planExpiresAt: true },
    }),
  ]);

  if (!attempt) notFound();

  if (!userCanIssueCourseCertificate(userPlan?.planTier, userPlan?.planExpiresAt)) {
    redirect(`/mock-test/${attempt.mockTestId}/result?attempt=${attempt.id}`);
  }

  return <CertificateSelectClient attemptId={attempt.id} mockTestTitle={attempt.mockTest.title} />;
}
