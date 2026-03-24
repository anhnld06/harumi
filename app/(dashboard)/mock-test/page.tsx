import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default async function MockTestPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [tests, recentAttempts] = await Promise.all([
    prisma.mockTest.findMany({
      include: { sections: true },
      orderBy: { createdAt: 'desc' },
    }),
    userId
      ? prisma.testAttempt.findMany({
          where: { userId, completedAt: { not: null } },
          include: { mockTest: true },
          orderBy: { completedAt: 'desc' },
          take: 5,
        })
      : [],
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mock Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Tests</CardTitle>
          <p className="text-sm text-muted-foreground">
            Simulate the real JLPT N2 exam with timed sections
          </p>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No mock tests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <Link key={test.id} href={`/mock-test/${test.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(test.duration)} • Pass: {test.passScore}/180
                        </p>
                      </div>
                    </div>
                    <Button>Start</Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAttempts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded border p-3"
                >
                  <div>
                    <p className="font-medium">{a.mockTest.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.completedAt?.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {a.score ?? 0}/{a.totalScore ?? 0}
                    </p>
                    <p
                      className={`text-sm ${a.passed ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {a.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
