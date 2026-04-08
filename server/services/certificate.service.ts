import type { CertificateTemplate } from '@/lib/certificate/constants';
import type { UserCertificate } from '@/lib/db-types';
import { prisma } from '@/lib/db';

function randomSegment(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function newCertificateNumber(): string {
  const y = new Date().getFullYear();
  return `HRM-${y}-${randomSegment()}`;
}

export async function listUserCertificates(userId: string) {
  return prisma.userCertificate.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
    include: { mockTest: { select: { title: true } } },
  });
}

export async function getUserCertificate(certId: string, userId: string) {
  return prisma.userCertificate.findFirst({
    where: { id: certId, userId },
    include: { mockTest: true, attempt: true },
  });
}

export async function issueOrUpdateCertificate(params: {
  userId: string;
  attemptId: string;
  template: CertificateTemplate;
  recipientName: string;
}): Promise<UserCertificate> {
  const { userId, attemptId, template, recipientName } = params;

  const attempt = await prisma.testAttempt.findFirst({
    where: {
      id: attemptId,
      userId,
      completedAt: { not: null },
      passed: true,
    },
    include: { mockTest: true },
  });

  if (!attempt || attempt.score == null || attempt.totalScore == null) {
    throw new Error('CERT_INELIGIBLE');
  }

  const courseTitle = attempt.mockTest.title;
  const scoreText = `${attempt.score}/${attempt.totalScore}`;

  const existing = await prisma.userCertificate.findUnique({
    where: { userId_mockTestId: { userId, mockTestId: attempt.mockTestId } },
  });

  if (existing) {
    return prisma.userCertificate.update({
      where: { id: existing.id },
      data: {
        attemptId,
        template,
        recipientName,
        courseTitle,
        scoreText,
      },
    });
  }

  return prisma.userCertificate.create({
    data: {
      userId,
      mockTestId: attempt.mockTestId,
      attemptId,
      template,
      recipientName,
      courseTitle,
      scoreText,
      certificateNo: newCertificateNumber(),
    },
  });
}
