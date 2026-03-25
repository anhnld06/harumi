import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { sendFeedbackAdminEmail } from '@/lib/mail';
import {
  createFeedbackRecord,
  validateFeedbackInput,
} from '@/server/services/feedback.service';

const bodySchema = z.object({
  name: z.string(),
  email: z.string(),
  message: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { name, email, message } = parsed.data;
    const valid = validateFeedbackInput({ name, email, message });
    if (!valid.ok) {
      return NextResponse.json({ error: valid.error }, { status: 400 });
    }

    const record = await createFeedbackRecord({
      userId: session?.user?.id,
      name,
      email,
      message,
    });

    await sendFeedbackAdminEmail({
      feedbackId: record.id,
      reporterName: name.trim(),
      reporterEmail: email.trim().toLowerCase(),
      message: message.trim(),
      userId: session?.user?.id ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
