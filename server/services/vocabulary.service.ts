import { prisma } from '@/lib/db';
import type { QuestionType, Vocabulary } from '@/lib/db-types';

export async function getVocabularyList(params: {
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { level = 'N2', search, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where = {
    level,
    ...(search && {
      OR: [
        { word: { contains: search, mode: 'insensitive' as const } },
        { reading: { contains: search, mode: 'insensitive' as const } },
        { onyomiVi: { contains: search, mode: 'insensitive' as const } },
        { meaningEn: { contains: search, mode: 'insensitive' as const } },
        { meaningVi: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.vocabulary.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    }),
    prisma.vocabulary.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getVocabularyById(id: string) {
  return prisma.vocabulary.findUnique({
    where: { id },
  });
}

export async function getVocabularyForFlashcards(params: {
  userId: string;
  level?: string;
  limit?: number;
}) {
  const { userId, level = 'N2', limit = 20 } = params;

  // Get due reviews first (SRS), then fill with new words
  const dueProgress = await prisma.vocabularyProgress.findMany({
    where: {
      userId,
      nextReviewAt: { lte: new Date() },
      vocabulary: { level },
    },
    include: { vocabulary: true },
    orderBy: { nextReviewAt: 'asc' },
    take: limit,
  });

  const dueIds = dueProgress.map((p: { vocabularyId: string }) => p.vocabularyId);
  const due = dueProgress.map((p: { vocabulary: Vocabulary }) => p.vocabulary);

  if (due.length >= limit) return due.slice(0, limit);

  const newWords = await prisma.vocabulary.findMany({
    where: {
      level,
      id: { notIn: dueIds },
    },
    take: limit - due.length,
    orderBy: { id: 'asc' },
  });

  return [...due, ...newWords].slice(0, limit);
}

export async function toggleBookmark(userId: string, vocabularyId: string) {
  const existing = await prisma.bookmark.findFirst({
    where: { userId, vocabularyId },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: { userId, vocabularyId },
    });
    return { bookmarked: true };
  }
}

export async function getBookmarkIdsForVocab(
  userId: string,
  vocabularyIds: string[]
): Promise<string[]> {
  if (!userId || vocabularyIds.length === 0) return [];
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      vocabularyId: { in: vocabularyIds },
    },
    select: { vocabularyId: true },
  });
  return bookmarks
    .map((b) => b.vocabularyId)
    .filter((id): id is string => id != null);
}

export async function getBookmarkedVocabulary(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, vocabularyId: { not: null } },
    include: { vocabulary: true },
    orderBy: { createdAt: 'desc' },
  });
  return bookmarks
    .map((b) => b.vocabulary)
    .filter((v): v is NonNullable<typeof v> => v != null);
}

export async function recordVocabularyProgress(
  userId: string,
  vocabularyId: string,
  correct: boolean
) {
  const existing = await prisma.vocabularyProgress.findUnique({
    where: { userId_vocabularyId: { userId, vocabularyId } },
  });

  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + (correct ? 2 : 1));

  if (existing) {
    return prisma.vocabularyProgress.update({
      where: { userId_vocabularyId: { userId, vocabularyId } },
      data: {
        lastReviewAt: now,
        nextReviewAt: nextReview,
        correctCount: { increment: correct ? 1 : 0 },
        wrongCount: { increment: correct ? 0 : 1 },
        streak: correct ? existing.streak + 1 : 0,
      },
    });
  }

  return prisma.vocabularyProgress.create({
    data: {
      userId,
      vocabularyId,
      lastReviewAt: now,
      nextReviewAt: nextReview,
      correctCount: correct ? 1 : 0,
      wrongCount: correct ? 0 : 1,
      streak: correct ? 1 : 0,
    },
  });
}

export async function getVocabularyQuizQuestions(params: {
  type: QuestionType;
  level?: string;
  limit?: number;
}) {
  const { type, level = 'N2', limit = 10 } = params;

  const questions = await prisma.question.findMany({
    where: {
      type,
      vocabulary: level ? { level } : undefined,
    },
    take: limit,
    include: { vocabulary: true },
    orderBy: { id: 'asc' },
  });

  return questions.sort(() => Math.random() - 0.5);
}
