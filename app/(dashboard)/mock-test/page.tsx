import type {
  MockTestListItem,
  TestAttemptRecentItem,
} from '@/lib/mock-test/prisma-query-types';
import {
  compareMockTestsByTitle,
  userCanAccessPremiumMockTests,
} from '@/lib/mock-test/mock-test-access';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MockTestListClient } from '@/features/mock-test/mock-test-list-client';

export default async function MockTestPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [testsRaw, recentAttempts, lastAttemptsRows] = (await Promise.all([
    prisma.mockTest.findMany({
      include: { sections: true },
    }),
    userId
      ? prisma.testAttempt.findMany({
          where: { userId, completedAt: { not: null } },
          include: { mockTest: true },
          orderBy: { completedAt: 'desc' },
          take: 5,
        })
      : Promise.resolve([] as TestAttemptRecentItem[]),
    userId
      ? prisma.testAttempt.findMany({
          where: { userId, completedAt: { not: null } },
          orderBy: { completedAt: 'desc' },
          select: { mockTestId: true, score: true, totalScore: true },
        })
      : Promise.resolve(
          [] as Array<{ mockTestId: string; score: number | null; totalScore: number | null }>
        ),
  ])) as unknown as [
    MockTestListItem[],
    TestAttemptRecentItem[],
    Array<{ mockTestId: string; score: number | null; totalScore: number | null }>,
  ];

  const tests = [...testsRaw].sort((a, b) => compareMockTestsByTitle(a.title, b.title));

  const lastByMockId = new Map<string, { score: number; totalScore: number }>();
  for (const row of lastAttemptsRows) {
    if (lastByMockId.has(row.mockTestId)) continue;
    lastByMockId.set(row.mockTestId, {
      score: row.score ?? 0,
      totalScore: row.totalScore ?? 0,
    });
  }

  const canAccessFullTests = userCanAccessPremiumMockTests(
    session?.user?.planTier,
    session?.user?.planExpiresAt
  );

  const listRows = tests.map((test) => ({
    id: test.id,
    title: test.title,
    lastAttempt: lastByMockId.get(test.id) ?? null,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mock Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Test List</CardTitle>
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
            <MockTestListClient tests={listRows} canAccessFullTests={canAccessFullTests} />
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
                      {a.completedAt?.toLocaleString()}
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
