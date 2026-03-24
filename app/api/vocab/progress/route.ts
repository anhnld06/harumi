import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recordVocabularyProgress } from '@/server/services/vocabulary.service';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { vocabularyId, correct } = await request.json();
    if (!vocabularyId || typeof correct !== 'boolean') {
      return NextResponse.json({ error: 'vocabularyId and correct required' }, { status: 400 });
    }

    await recordVocabularyProgress(session.user.id, vocabularyId, correct);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Progress error:', error);
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 });
  }
}
