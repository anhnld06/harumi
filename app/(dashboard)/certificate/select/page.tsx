import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
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

  const attempt = await prisma.testAttempt.findFirst({
    where: {
      id: attemptId,
      userId,
      completedAt: { not: null },
      passed: true,
    },
    include: { mockTest: true },
  });

  if (!attempt) notFound();

  return <CertificateSelectClient attemptId={attempt.id} mockTestTitle={attempt.mockTest.title} />;
}
