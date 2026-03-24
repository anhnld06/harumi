import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBookmarkedVocabulary } from '@/server/services/vocabulary.service';
import { attachN2VocabAudio } from '@/lib/n2-static-audio';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw = await getBookmarkedVocabulary(session.user.id);
    const items = attachN2VocabAudio(raw);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json(
      { error: 'Failed to get bookmarks' },
      { status: 500 }
    );
  }
}
