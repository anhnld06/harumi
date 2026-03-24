import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVocabularyForFlashcards, getVocabularyList } from '@/server/services/vocabulary.service';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? '';
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const search = searchParams.get('search') ?? '';

  try {
    const items =
      page > 1 || search
        ? (
            await getVocabularyList({
              level: 'N2',
              search: search || undefined,
              page,
              limit: 20,
            })
          ).items
        : await getVocabularyForFlashcards({
            userId,
            level: 'N2',
            limit: 50,
          });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Flashcards error:', error);
    return NextResponse.json({ error: 'Failed to load flashcards' }, { status: 500 });
  }
}
