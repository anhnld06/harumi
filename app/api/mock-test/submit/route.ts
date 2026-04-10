import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { SubmitConflictError, submitMockTest } from '@/server/services/mock-test.service';

const answerSchema = z.object({
  questionId: z.string().min(1).max(128),
  userAnswer: z.string().max(50_000),
  timeSpent: z.number().int().min(0).max(86400 * 7).optional(),
});

const submitBodySchema = z.object({
  attemptId: z.string().min(1).max(128),
  answers: z.array(answerSchema).max(800),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = submitBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request: check attemptId and answers shape.' },
      { status: 400 }
    );
  }

  try {
    const result = await submitMockTest(session.user.id, parsed.data.attemptId, parsed.data.answers);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SubmitConflictError) {
      return NextResponse.json(
        { error: 'This attempt was already submitted or is not valid.' },
        { status: 409 }
      );
    }
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
