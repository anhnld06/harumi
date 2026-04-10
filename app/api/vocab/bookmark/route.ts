import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { toggleBookmark } from '@/server/services/vocabulary.service';
import { userExistsById } from '@/server/services/user.service';

const bookmarkBodySchema = z.object({
  vocabularyId: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Verify user exists (handles stale JWT after DB reset or OAuth ID mismatch)
  const exists = await userExistsById(userId);
  if (!exists) {
    return NextResponse.json(
      { error: 'Session expired. Please sign in again.' },
      { status: 401 }
    );
  }

  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = bookmarkBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'vocabularyId required' }, { status: 400 });
    }

    const result = await toggleBookmark(userId, parsed.data.vocabularyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Bookmark error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
