import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmailVerificationCode } from '@/lib/mail';
import {
  clearEmailVerificationCodes,
  createEmailVerificationCode,
} from '@/server/services/email-verification.service';

const bodySchema = z.object({
  email: z.string().email('Invalid email'),
});

const GENERIC_MESSAGE =
  'If this email is registered and needs verification, a code has been sent. Check your inbox and spam folder.';

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
    const code = await createEmailVerificationCode(email);

    if (!code) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const mail = await sendEmailVerificationCode(email, code);
    if (!mail.ok) {
      await clearEmailVerificationCodes(email);
      console.error('[send-verification-code] delivery failed:', mail.error);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('send-verification-code error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
