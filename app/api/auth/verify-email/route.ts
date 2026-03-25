import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyEmailWithCode } from '@/server/services/email-verification.service';
import { createPostVerifyHandoff } from '@/server/services/post-verify-handoff.service';

const bodySchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const raw = parsed.data.code.replace(/\D/g, '');
    if (raw.length !== 6) {
      return NextResponse.json(
        { error: 'Enter the 6-digit code' },
        { status: 400 }
      );
    }

    const result = await verifyEmailWithCode(email, raw);

    if (result === 'ok') {
      const u = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      const handoffToken = u ? await createPostVerifyHandoff(u.id) : null;
      return NextResponse.json({ ok: true, handoffToken });
    }
    if (result === 'expired') {
      return NextResponse.json(
        { error: 'This code has expired. Request a new one.' },
        { status: 400 }
      );
    }
    if (result === 'not_applicable') {
      return NextResponse.json(
        { error: 'Invalid code or email already verified.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 });
  } catch (error) {
    console.error('verify-email error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
