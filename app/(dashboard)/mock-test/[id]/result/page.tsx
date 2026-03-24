import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function MockTestResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { id } = await params;
  const { attempt: attemptId } = await searchParams;

  if (!attemptId || !userId) notFound();

  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptId, userId, mockTestId: id },
    include: { mockTest: true, answers: true },
  });

  if (!attempt || !attempt.completedAt) notFound();

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const totalCount = attempt.answers.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Test Result</h1>

      <Card>
        <CardHeader>
          <CardTitle>{attempt.mockTest.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Completed {attempt.completedAt.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {attempt.passed ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
              <div>
                <p className="text-3xl font-bold">
                  {attempt.score}/{attempt.totalScore}
                </p>
                <p
                  className={
                    attempt.passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                  }
                >
                  {attempt.passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Correct answers</p>
              <p className="text-xl font-semibold">
                {correctCount}/{totalCount}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Answer Review</h3>
            {attempt.answers.map((a, i) => (
              <div
                key={a.id}
                className={`rounded p-2 ${a.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <span className="font-mono">Q{i + 1}:</span>{' '}
                {a.isCorrect ? '✓' : '✗'} Your answer: {a.userAnswer}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/mock-test">
          <Button variant="outline">Back to Tests</Button>
        </Link>
        <Link href={`/mock-test/${id}`}>
          <Button>Retake Test</Button>
        </Link>
      </div>
    </div>
  );
}
