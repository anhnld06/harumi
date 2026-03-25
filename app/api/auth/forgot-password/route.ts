import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/mail';
import {
  createPasswordResetToken,
  passwordResetIdentifier,
} from '@/server/services/password-reset.service';
import { prisma } from '@/lib/db';

const bodySchema = z.object({
  email: z.string().email('Invalid email'),
});

const GENERIC_MESSAGE =
  'If an account exists for this email, you will receive password reset instructions shortly.';

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
    const token = await createPasswordResetToken(email);

    if (!token) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const mail = await sendPasswordResetEmail(email, resetUrl);
    if (!mail.ok) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: passwordResetIdentifier(email) },
      });
      console.error('[forgot-password] email delivery failed:', mail.error);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
