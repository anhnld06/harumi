import { prisma } from '@/lib/db';

const INITIAL_INTERVAL = 1;
const EASE_FACTOR = 2.5;
const MIN_EASE = 1.3;

export function calculateNextReview(
  correct: boolean,
  currentInterval: number,
  currentEase: number
): { nextInterval: number; nextEase: number } {
  if (!correct) {
    return {
      nextInterval: INITIAL_INTERVAL,
      nextEase: Math.max(MIN_EASE, currentEase - 0.2),
    };
  }

  const nextInterval =
    currentInterval <= 1 ? 2 : Math.round(currentInterval * currentEase);
  const nextEase = Math.min(
    2.6,
    currentEase + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02))
  );

  return { nextInterval: Math.max(1, nextInterval), nextEase };
}

export async function getDueReviews(
  userId: string,
  itemType: 'vocabulary' | 'kanji' | 'grammar',
  limit = 20
) {
  const now = new Date();
  return prisma.sRSReview.findMany({
    where: {
      userId,
      itemType,
      nextReviewAt: { lte: now },
    },
    take: limit,
    orderBy: { nextReviewAt: 'asc' },
  });
}

export async function updateSRSReview(
  userId: string,
  itemType: string,
  itemId: string,
  correct: boolean
) {
  const existing = await prisma.sRSReview.findUnique({
    where: {
      userId_itemType_itemId: { userId, itemType, itemId },
    },
  });

  const { nextInterval, nextEase } = calculateNextReview(
    correct,
    existing?.interval ?? 1,
    existing?.easeFactor ?? EASE_FACTOR
  );

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval);

  return prisma.sRSReview.upsert({
    where: {
      userId_itemType_itemId: { userId, itemType, itemId },
    },
    create: {
      userId,
      itemType,
      itemId,
      nextReviewAt,
      interval: nextInterval,
      easeFactor: nextEase,
      repetitions: correct ? 1 : 0,
    },
    update: {
      nextReviewAt,
      interval: nextInterval,
      easeFactor: nextEase,
      repetitions: { increment: correct ? 1 : 0 },
    },
  });
}
