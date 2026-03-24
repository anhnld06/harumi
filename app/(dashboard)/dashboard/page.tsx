import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ClipboardList, Target, TrendingUp } from 'lucide-react';
import { calculateAccuracy } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const [vocabProgress, recentAttempt, progressStats] = await Promise.all([
    prisma.vocabularyProgress.count({ where: { userId } }),
    prisma.testAttempt.findFirst({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      include: { answers: true },
    }),
    prisma.userProgress.aggregate({
      where: { userId },
      _sum: {
        wordsLearned: true,
        correctAnswers: true,
        totalAnswers: true,
        quizzesTaken: true,
      },
    }),
  ]);

  const totalCorrect = progressStats._sum.correctAnswers ?? 0;
  const totalAnswers = progressStats._sum.totalAnswers ?? 0;
  const accuracy = calculateAccuracy(totalCorrect, totalAnswers);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hello,{'\n'}
          <span className="font-bold text-blue-600">{session?.user?.name ?? 'Learner'}</span>
          {'\n'}
          <span className="inline-block origin-[50%_80%] animate-[wave_2.5s_ease-in-out_infinite]">👋</span>
          </h1>
        <p className="mt-1 text-muted-foreground">
          Continue your JLPT N2 preparation
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vocabProgress}</div>
            <p className="text-xs text-muted-foreground">Vocabulary mastery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracy}%</div>
            <Progress value={accuracy} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats._sum.quizzesTaken ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total practice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Mock Test</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentAttempt ? (
              <>
                <div className="text-2xl font-bold">
                  {recentAttempt.score ?? 0}/{recentAttempt.totalScore ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {recentAttempt.passed ? 'Passed ✓' : 'Needs improvement'}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">--</div>
                <Link href="/mock-test">
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Take first test
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Jump into learning</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/vocab">
              <Button>Vocabulary</Button>
            </Link>
            <Link href="/vocab?mode=flashcard">
              <Button variant="outline">Flashcards</Button>
            </Link>
            <Link href="/mock-test">
              <Button variant="outline">Mock Test</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>Your learning stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Vocabulary</span>
                  <span className="font-medium">{vocabProgress} words</span>
                </div>
                <Progress value={Math.min(vocabProgress, 100)} className="mt-1 h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Quiz accuracy</span>
                  <span className="font-medium">{accuracy}%</span>
                </div>
                <Progress value={accuracy} className="mt-1 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
