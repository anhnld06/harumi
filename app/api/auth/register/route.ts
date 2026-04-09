import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { issueAndSendEmailVerification } from '@/server/services/email-verification.service';
import { createUserWithCredentials, findUserByEmail } from '@/server/services/user.service';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const existing = await findUserByEmail(email);

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUserWithCredentials({
      email,
      hashedPassword,
      name: name ?? null,
    });

    const verificationSent = (await issueAndSendEmailVerification(email)) === 'sent';

    return NextResponse.json({ user, verificationSent });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
