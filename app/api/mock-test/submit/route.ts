import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { submitMockTest } from '@/server/services/mock-test.service';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { attemptId, answers } = await request.json();

    if (!attemptId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'attemptId and answers required' },
        { status: 400 }
      );
    }

    const result = await submitMockTest(session.user.id, attemptId, answers);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit' },
      { status: 500 }
    );
  }
}
