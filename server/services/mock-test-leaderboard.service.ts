import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
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

/** One best attempt per user from DISTINCT ON (see getMockTestLeaderboardSorted). */
type LeaderboardSqlRow = {
  userId: string;
  score: number;
  totalScore: number;
  completedAt: Date;
  name: string | null;
  image: string | null;
};

function periodBounds(period: LeaderboardPeriod): { start: Date; end: Date } | null {
  if (period === 'all') return null;
  const end = new Date();
  const start = new Date(end);
  if (period === 'week') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setMonth(start.getMonth() - 1);
  }
  return { start, end };
}

/**
 * Best percentage per user for a mock test (completed attempts only).
 * Tie-break: higher pct → higher raw score → earlier completedAt (first to reach the tie).
 * Uses PostgreSQL DISTINCT ON so each user is returned once (no full attempt fan-out).
 */
async function loadLeaderboardSortedFromDb(
  mockTestId: string,
  period: LeaderboardPeriod
): Promise<BestRow[]> {
  const bounds = periodBounds(period);

  const rows =
    bounds === null
      ? await prisma.$queryRaw<LeaderboardSqlRow[]>(Prisma.sql`
          SELECT DISTINCT ON (ta."userId")
            ta."userId",
            ta.score,
            ta."totalScore",
            ta."completedAt",
            u.name,
            u.image
          FROM "TestAttempt" ta
          INNER JOIN "User" u ON u.id = ta."userId"
          WHERE ta."mockTestId" = ${mockTestId}
            AND ta."completedAt" IS NOT NULL
            AND ta."totalScore" > 0
            AND ta.score IS NOT NULL
          ORDER BY ta."userId",
            (ta.score::double precision / NULLIF(ta."totalScore", 0)) DESC,
            ta.score DESC,
            ta."completedAt" ASC
        `)
      : await prisma.$queryRaw<LeaderboardSqlRow[]>(Prisma.sql`
          SELECT DISTINCT ON (ta."userId")
            ta."userId",
            ta.score,
            ta."totalScore",
            ta."completedAt",
            u.name,
            u.image
          FROM "TestAttempt" ta
          INNER JOIN "User" u ON u.id = ta."userId"
          WHERE ta."mockTestId" = ${mockTestId}
            AND ta."completedAt" >= ${bounds.start}
            AND ta."completedAt" <= ${bounds.end}
            AND ta."totalScore" > 0
            AND ta.score IS NOT NULL
          ORDER BY ta."userId",
            (ta.score::double precision / NULLIF(ta."totalScore", 0)) DESC,
            ta.score DESC,
            ta."completedAt" ASC
        `);

  const bestRows: BestRow[] = rows.map((a) => ({
    userId: a.userId,
    pct: a.score / a.totalScore,
    score: a.score,
    totalScore: a.totalScore,
    completedAt: a.completedAt,
    user: { id: a.userId, name: a.name, image: a.image },
  }));

  return bestRows.sort((x, y) => {
    if (y.pct !== x.pct) return y.pct - x.pct;
    if (y.score !== x.score) return y.score - x.score;
    return x.completedAt.getTime() - y.completedAt.getTime();
  });
}

const getCachedAllTimeLeaderboard = unstable_cache(
  async (mockTestId: string) => loadLeaderboardSortedFromDb(mockTestId, 'all'),
  ['mock-test-leaderboard-all'],
  { revalidate: 45 }
);

/**
 * `period: 'all'` is cached briefly to cut DB load on result pages; week/month stay uncached
 * because their date windows move with real time.
 */
export async function getMockTestLeaderboardSorted(
  mockTestId: string,
  period: LeaderboardPeriod = 'all'
): Promise<BestRow[]> {
  if (period === 'all') {
    return getCachedAllTimeLeaderboard(mockTestId);
  }
  return loadLeaderboardSortedFromDb(mockTestId, period);
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
