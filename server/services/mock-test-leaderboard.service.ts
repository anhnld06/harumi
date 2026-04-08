import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export type LeaderboardPeriod = 'all' | 'week' | 'month';

export type MockTestLeaderboardRow = {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  /** 0–100 */
  percent: number;
  score: number;
  totalScore: number;
};

type BestRow = {
  userId: string;
  pct: number;
  score: number;
  totalScore: number;
  completedAt: Date;
  user: { id: string; name: string | null; image: string | null };
};

function completedAtWhere(period: LeaderboardPeriod): Prisma.DateTimeNullableFilter {
  if (period === 'all') {
    return { not: null };
  }
  const now = new Date();
  const start = new Date(now);
  if (period === 'week') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setMonth(start.getMonth() - 1);
  }
  return { gte: start, lte: now };
}

function pickBetter(a: BestRow, b: BestRow): BestRow {
  if (b.pct > a.pct) return b;
  if (b.pct < a.pct) return a;
  if (b.score > a.score) return b;
  if (b.score < a.score) return a;
  return a.completedAt.getTime() <= b.completedAt.getTime() ? a : b;
}

/**
 * Best percentage per user for a mock test (completed attempts only).
 * Tie-break: higher pct → higher raw score → earlier completedAt (first to reach the tie).
 */
export async function getMockTestLeaderboardSorted(
  mockTestId: string,
  period: LeaderboardPeriod = 'all'
): Promise<BestRow[]> {
  const attempts = await prisma.testAttempt.findMany({
    where: {
      mockTestId,
      completedAt: completedAtWhere(period),
      totalScore: { gt: 0 },
      score: { not: null },
    },
    select: {
      userId: true,
      score: true,
      totalScore: true,
      completedAt: true,
      user: { select: { id: true, name: true, image: true } },
    },
  });

  const byUser = new Map<string, BestRow>();

  for (const a of attempts) {
    const pct = a.score! / a.totalScore!;
    const row: BestRow = {
      userId: a.userId,
      pct,
      score: a.score!,
      totalScore: a.totalScore!,
      completedAt: a.completedAt!,
      user: a.user,
    };
    const prev = byUser.get(a.userId);
    if (!prev) {
      byUser.set(a.userId, row);
    } else {
      byUser.set(a.userId, pickBetter(prev, row));
    }
  }

  return Array.from(byUser.values()).sort((x, y) => {
    if (y.pct !== x.pct) return y.pct - x.pct;
    if (y.score !== x.score) return y.score - x.score;
    return x.completedAt.getTime() - y.completedAt.getTime();
  });
}

export async function getMockTestLeaderboard(
  mockTestId: string,
  options: {
    limit?: number;
    currentUserId?: string | null;
    period?: LeaderboardPeriod;
  } = {}
): Promise<{
  top: MockTestLeaderboardRow[];
  currentUserRank: number | null;
  currentUserPercent: number | null;
  currentUserInTop: boolean;
}> {
  const limit = options.limit ?? 5;
  const period = options.period ?? 'all';
  const sorted = await getMockTestLeaderboardSorted(mockTestId, period);

  const toRow = (r: BestRow, rank: number): MockTestLeaderboardRow => ({
    rank,
    userId: r.userId,
    name: r.user.name,
    image: r.user.image,
    percent: Math.round(r.pct * 1000) / 10,
    score: r.score,
    totalScore: r.totalScore,
  });

  const top = sorted.slice(0, limit).map((r, i) => toRow(r, i + 1));

  const uid = options.currentUserId;
  if (!uid) {
    return { top, currentUserRank: null, currentUserPercent: null, currentUserInTop: false };
  }

  const idx = sorted.findIndex((r) => r.userId === uid);
  if (idx < 0) {
    return { top, currentUserRank: null, currentUserPercent: null, currentUserInTop: false };
  }

  const current = sorted[idx];
  return {
    top,
    currentUserRank: idx + 1,
    currentUserPercent: Math.round(current.pct * 1000) / 10,
    currentUserInTop: idx < limit,
  };
}
